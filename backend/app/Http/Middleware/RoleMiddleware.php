<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RoleMiddleware
 *
 * Restricts an authenticated route to one or more roles.
 *
 * Usage in routes/api.php:
 *   Route::middleware(['auth:sanctum', 'role:hr,admin'])->group(...)
 *
 * The middleware reads allowed roles as comma-separated values from the $handle parameter.
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = $user->role?->name;

        if (! $userRole || ! in_array($userRole, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
