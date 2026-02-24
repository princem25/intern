<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ApprovalLog;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    /**
     * Only HR / admin can access these endpoints.
     */
    private function authorize(Request $request)
    {
        $user = $request->user();
        $allowedRoles = ['hr', 'admin'];

        if (!in_array($user->role->name, $allowedRoles)) {
            abort(403, 'Unauthorized. Only HR can manage approvals.');
        }

        return $user;
    }

    /**
     * GET /api/hr/users?status=pending|approved|rejected|all
     * Returns paginated users with optional status filter.
     */
    public function index(Request $request)
    {
        $hr = $this->authorize($request);

        $status = $request->query('status', 'pending');
        $role   = $request->query('role');   // optional: intern | teamlead
        $search = $request->query('search'); // optional: name / email search

        $query = User::with(['role', 'technology'])
            ->whereHas('role', function ($q) {
                // Exclude HR and admin accounts from the list
                $q->whereNotIn('name', ['hr', 'admin']);
            });

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($role) {
            $query->whereHas('role', fn($q) => $q->where('name', $role));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json($users);
    }

    /**
     * GET /api/hr/users/{id}
     * Returns a single user's full profile.
     */
    public function show(Request $request, $id)
    {
        $this->authorize($request);

        $user = User::with(['role', 'technology'])->findOrFail($id);

        return response()->json($user);
    }

    /**
     * PUT /api/hr/users/{id}/status
     * Approve or reject a user account.
     * Body: { status: 'approved'|'rejected', reason?: string }
     */
    public function updateStatus(Request $request, $id)
    {
        $hr = $this->authorize($request);

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        $targetUser = User::with(['role', 'technology'])->findOrFail($id);

        // Only pending users can be acted upon
        if ($targetUser->status !== 'pending') {
            return response()->json([
                'message' => "User is already {$targetUser->status}.",
            ], 422);
        }

        $targetUser->status = $request->status;
        $targetUser->save();

        // Log the action
        ApprovalLog::create([
            'target_user_id' => $targetUser->id,
            'acted_by'       => $hr->id,
            'action'         => $request->status,
            'reason'         => $request->reason,
        ]);

        $message = $request->status === 'approved'
            ? 'User approved successfully.'
            : 'User rejected successfully.';

        return response()->json([
            'message' => $message,
            'user'    => $targetUser,
        ]);
    }

    /**
     * GET /api/hr/stats
     * Summary counts for the approval dashboard.
     */
    public function stats(Request $request)
    {
        $this->authorize($request);

        $base = User::whereHas('role', fn($q) => $q->whereNotIn('name', ['hr', 'admin']));

        return response()->json([
            'total'    => (clone $base)->count(),
            'pending'  => (clone $base)->where('status', 'pending')->count(),
            'approved' => (clone $base)->where('status', 'approved')->count(),
            'rejected' => (clone $base)->where('status', 'rejected')->count(),
        ]);
    }

    /**
     * GET /api/hr/logs
     * Recent approval action logs.
     */
    public function logs(Request $request)
    {
        $this->authorize($request);

        $logs = ApprovalLog::with(['targetUser.role', 'actedBy'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($logs);
    }
}
