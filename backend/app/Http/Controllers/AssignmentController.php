<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AssignmentController extends Controller
{
    /**
     * HR / admin only guard.
     */
    private function authorizeHr(Request $request): User
    {
        $user = $request->user();
        if (!in_array($user->role->name, ['hr', 'admin'])) {
            abort(403, 'Only HR can manage assignments.');
        }
        return $user;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/hr/assignments/stats
    // Summary counts for assignment dashboard KPIs
    // ─────────────────────────────────────────────────────────────────────────
    public function stats(Request $request)
    {
        $this->authorizeHr($request);

        $interns = User::whereHas('role', fn($q) => $q->where('name', 'intern'))
                       ->where('status', 'approved');

        $leads = User::whereHas('role', fn($q) => $q->where('name', 'teamlead'))
                     ->where('status', 'approved');

        return response()->json([
            'total_interns'      => (clone $interns)->count(),
            'assigned_interns'   => (clone $interns)->whereNotNull('team_lead_id')->count(),
            'unassigned_interns' => (clone $interns)->whereNull('team_lead_id')->count(),
            'active_interns'     => (clone $interns)->where('is_active', true)->count(),
            'total_leads'        => (clone $leads)->count(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/hr/assignments/interns?unassigned_only=true
    // List approved interns (optionally only unassigned ones)
    // ─────────────────────────────────────────────────────────────────────────
    public function interns(Request $request)
    {
        $this->authorizeHr($request);

        $query = User::with(['role', 'technology', 'teamLead'])
            ->whereHas('role', fn($q) => $q->where('name', 'intern'))
            ->where('status', 'approved');

        if ($request->boolean('unassigned_only')) {
            $query->whereNull('team_lead_id');
        }

        if ($search = $request->query('search')) {
            $query->where(fn($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            );
        }

        return response()->json($query->orderBy('name')->get());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/hr/assignments/leads
    // List approved team leads with their intern count
    // ─────────────────────────────────────────────────────────────────────────
    public function leads(Request $request)
    {
        $this->authorizeHr($request);

        $leads = User::with(['role', 'technology'])
            ->withCount('interns')           // interns_count
            ->whereHas('role', fn($q) => $q->where('name', 'teamlead'))
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        return response()->json($leads);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/hr/assignments/assign
    // Assign one or more interns to a team lead
    // Body: { intern_ids: [1,2,3], team_lead_id: 5 }
    // ─────────────────────────────────────────────────────────────────────────
    public function assign(Request $request)
    {
        $this->authorizeHr($request);

        $request->validate([
            'intern_ids'   => 'required|array|min:1',
            'intern_ids.*' => 'integer|exists:users,id',
            'team_lead_id' => 'required|integer|exists:users,id',
        ]);

        // Verify the target is an approved team lead
        $lead = User::whereHas('role', fn($q) => $q->where('name', 'teamlead'))
                    ->where('status', 'approved')
                    ->findOrFail($request->team_lead_id);

        $assigned   = [];
        $errors     = [];

        foreach ($request->intern_ids as $internId) {
            $intern = User::whereHas('role', fn($q) => $q->where('name', 'intern'))
                          ->where('status', 'approved')
                          ->find($internId);

            if (!$intern) {
                $errors[] = "User ID {$internId} is not a valid approved intern.";
                continue;
            }

            $intern->team_lead_id = $lead->id;
            $intern->is_active    = true;
            $intern->assigned_at  = Carbon::now();
            $intern->save();

            $assigned[] = $intern->load(['role', 'technology', 'teamLead']);
        }

        return response()->json([
            'message'   => count($assigned) . ' intern(s) assigned to ' . $lead->name . '.',
            'assigned'  => $assigned,
            'errors'    => $errors,
            'team_lead' => $lead,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/hr/assignments/{internId}
    // Remove a team lead assignment from an intern
    // ─────────────────────────────────────────────────────────────────────────
    public function unassign(Request $request, $internId)
    {
        $this->authorizeHr($request);

        $intern = User::whereHas('role', fn($q) => $q->where('name', 'intern'))
                      ->findOrFail($internId);

        $intern->team_lead_id = null;
        $intern->is_active    = false;
        $intern->assigned_at  = null;
        $intern->save();

        return response()->json([
            'message' => "{$intern->name} has been unassigned.",
            'intern'  => $intern->load(['role', 'technology']),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/hr/assignments/leads/{leadId}/interns
    // Get all interns assigned to a specific team lead
    // HR/admin can query any lead; a teamlead can only query themselves.
    // ─────────────────────────────────────────────────────────────────────────
    public function leadInterns(Request $request, $leadId)
    {
        $current = $request->user();
        $role    = $current->role->name;

        // Team leads may only fetch their own intern list
        if ($role === 'teamlead') {
            if ((int) $leadId !== $current->id) {
                return response()->json(['message' => 'You can only view your own interns.'], 403);
            }
        } elseif (!in_array($role, ['hr', 'admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $lead = User::with(['interns.role', 'interns.technology'])
                    ->findOrFail($leadId);

        return response()->json([
            'lead'    => $lead,
            'interns' => $lead->interns,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/hr/assignments/my-interns
    // A shortcut for the currently logged-in team lead to get their interns
    // ─────────────────────────────────────────────────────────────────────────
    public function myInterns(Request $request)
    {
        $user = $request->user();

        // Return all interns whose team_lead_id points to the current lead.
        // Do NOT filter by status — an intern may be assigned before being
        // fully 'approved', and we want the lead to always see their team.
        $interns = User::with(['role', 'technology'])
            ->where('team_lead_id', $user->id)
            ->orderBy('name')
            ->get([
                'id', 'name', 'email',
                'role_id',        // needed for 'role' eager load
                'technology_id',  // needed for 'technology' eager load
                'team_lead_id',
                'is_active',
                'assigned_at',
                'status',
            ]);

        return response()->json($interns);
    }
}

