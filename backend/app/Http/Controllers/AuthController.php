<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Technology;
use App\Mail\NewUserRegisteredMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'technology_id' => 'nullable|exists:technologies,id',
        ]);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'role_id'       => $request->role_id,
            'technology_id' => $request->technology_id,
            'status'        => 'pending',
        ]);

        // ── Notify all HR accounts about the new registration ─────────────
        try {
            $user->load(['role', 'technology']);

            $pendingCount = User::where('status', 'pending')->count();

            $hrUsers = User::whereHas('role', fn($q) => $q->where('name', 'hr'))->get();

            foreach ($hrUsers as $hr) {
                Mail::to($hr->email)->send(
                    new NewUserRegisteredMail($user, $pendingCount)
                );
            }
        } catch (\Exception $e) {
            // Mail failure should not break registration
            \Log::warning('HR notification email failed: ' . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Please wait for approval.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if ($user->status !== 'approved') {
            return response()->json([
                'message' => 'Your account is pending approval or has been rejected.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user->load(['role', 'technology']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request)
    {
        return $request->user()->load(['role', 'technology']);
    }

    /**
     * GET /api/me/stats
     * Role-aware summary stats for the currently authenticated user.
     */
    public function myStats(Request $request)
    {
        $user = $request->user();
        $role = $user->role->name;

        if ($role === 'intern') {
            $base = \App\Models\Task::where('assigned_to', $user->id);

            $total       = (clone $base)->count();
            $todo        = (clone $base)->where('status', 'todo')->count();
            $inProgress  = (clone $base)->where('status', 'in_progress')->count();
            $done        = (clone $base)->where('status', 'done')->count();

            // Average score of reviewed tasks
            $avgScore = (clone $base)
                ->whereNotNull('score')
                ->avg('score');

            // Recent feedback (last 5 reviewed tasks)
            $recentFeedback = (clone $base)
                ->whereNotNull('feedback')
                ->with('creator:id,name')
                ->orderBy('reviewed_at', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'score', 'feedback', 'reviewed_at', 'creator_id', 'difficulty']);

            // Currently active task (most recent in_progress)
            $activeTask = (clone $base)
                ->where('status', 'in_progress')
                ->orderBy('updated_at', 'desc')
                ->with('creator:id,name')
                ->first(['id', 'title', 'difficulty', 'due_date', 'status', 'creator_id']);

            return response()->json([
                'role'           => 'intern',
                'total'          => $total,
                'todo'           => $todo,
                'in_progress'    => $inProgress,
                'done'           => $done,
                'avg_score'      => $avgScore ? round($avgScore) : null,
                'recent_feedback'=> $recentFeedback,
                'active_task'    => $activeTask,
                'technology'     => $user->technology?->name,
            ]);
        }

        if ($role === 'teamlead') {
            $base = \App\Models\Task::where('creator_id', $user->id);

            $total       = (clone $base)->count();
            $pendingReview = (clone $base)->where('status', 'in_progress')
                ->whereNotNull('submission')
                ->whereNull('reviewed_at')
                ->count();
            $done        = (clone $base)->where('status', 'done')->count();
            $avgScore    = (clone $base)->whereNotNull('score')->avg('score');

            // Interns assigned to this lead
            $interns = \App\Models\User::where('team_lead_id', $user->id)
                ->with(['role', 'technology'])
                ->get(['id', 'name', 'email', 'role_id', 'technology_id', 'team_lead_id', 'is_active', 'assigned_at', 'status']);

            return response()->json([
                'role'          => 'teamlead',
                'total_tasks'   => $total,
                'pending_review'=> $pendingReview,
                'done'          => $done,
                'avg_score'     => $avgScore ? round($avgScore) : null,
                'total_interns' => $interns->count(),
                'interns'       => $interns,
            ]);
        }

        return response()->json(['role' => $role]);
    }

    public function getPendingUsers(Request $request)
    {
        // Check if user is admin or team lead
        $user = $request->user();
        if ($user->role->name !== 'teamlead' && $user->role->name !== 'admin' && $user->role->name !== 'hr') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $pendingUsers = User::where('status', 'pending')->with(['role', 'technology'])->get();
        return response()->json($pendingUsers);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role->name !== 'teamlead' && $user->role->name !== 'admin' && $user->role->name !== 'hr') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $targetUser = User::findOrFail($id);

        if ($request->status === 'rejected') {
            $targetUser->delete();
            return response()->json(['message' => 'User rejected and removed from database.']);
        }

        $targetUser->status = $request->status;
        $targetUser->save();

        return response()->json(['message' => 'User status updated.', 'user' => $targetUser]);
    }
}
