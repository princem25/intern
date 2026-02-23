<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Technology;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'technology_id' => $request->technology_id,
            'status' => 'pending', 
        ]);

        // Auto-approve if the first user or specific condition? No, stick to pending.
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Please wait for approval.',
            'user' => $user,
            'token' => $token,
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
