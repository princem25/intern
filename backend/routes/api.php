<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CodeController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\CopyPasteController;

// ── Public (unauthenticated) routes ──────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/forgot-password', [App\Http\Controllers\PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password',  [App\Http\Controllers\PasswordResetController::class, 'reset']);
Route::get('/technologies', [\App\Http\Controllers\TechnologyController::class, 'index']);

// ── Authenticated routes ──────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'approved'])->group(function () {

    // ── Auth utilities (all roles) ─────────────────────────────────────────
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::get('/user',      [AuthController::class, 'user']);
    Route::get('/me/stats',  [AuthController::class, 'myStats']);

    // ── Profile & Leaderboard (all roles) ─────────────────────────────────
    Route::get('/leaderboard',      [AuthController::class, 'leaderboard']);
    Route::put('/profile',          [AuthController::class, 'updateProfile']);
    Route::put('/change-password',  [AuthController::class, 'changePassword']);

    // ── Code execution (interns) ──────────────────────────────────────────
    // Note: placed BEFORE apiResource routes to avoid wildcard conflicts
    Route::post('/code/run',      [CodeController::class, 'run']);
    Route::post('/code/autosave', [CodeController::class, 'autosave']);

    // ── Copy-paste detection (interns) ─────────────────────────────────────
    Route::post('/report-copy-paste', [CopyPasteController::class, 'reportCopyPaste']);

    // ── Task routes ───────────────────────────────────────────────────────
    // These specific action routes must be declared BEFORE apiResource
    // to prevent {task} wildcard from swallowing 'stats'
    Route::get('tasks/stats',          [TaskController::class, 'stats']);
    Route::post('tasks/{task}/submit', [TaskController::class, 'submit']);

    // Teamlead / admin only: review, create, update, delete tasks
    Route::middleware(['role:teamlead,admin'])->group(function () {
        Route::post('tasks/{task}/review', [TaskController::class, 'review']);
        Route::post('tasks',               [TaskController::class, 'store']);
        Route::put('tasks/{task}',         [TaskController::class, 'update']);
        Route::patch('tasks/{task}',       [TaskController::class, 'update']);
        Route::delete('tasks/{task}',      [TaskController::class, 'destroy']);
    });

    // Read-only task access — all authenticated roles
    Route::get('tasks',        [TaskController::class, 'index']);
    Route::get('tasks/{task}', [TaskController::class, 'show']);

    // ── My-interns shortcut (available to teamlead + admin + hr) ──────────
    Route::get('/my-interns', [AssignmentController::class, 'myInterns']);

    // ── HR Module (hr and admin only) ─────────────────────────────────────
    Route::middleware(['role:hr,admin'])->prefix('hr')->group(function () {
        Route::get('/stats',             [ApprovalController::class, 'stats']);
        Route::get('/users',             [ApprovalController::class, 'index']);
        Route::get('/users/{id}',        [ApprovalController::class, 'show']);
        Route::put('/users/{id}/status', [ApprovalController::class, 'updateStatus']);
        Route::get('/logs',              [ApprovalController::class, 'logs']);
        Route::get('/performance',       [PerformanceController::class, 'index']);
        Route::get('/performance/{internId}', [PerformanceController::class, 'show']);

        Route::prefix('assignments')->group(function () {
            Route::get('/stats',                  [AssignmentController::class, 'stats']);
            Route::get('/interns',                [AssignmentController::class, 'interns']);
            Route::get('/leads',                  [AssignmentController::class, 'leads']);
            Route::post('/assign',                [AssignmentController::class, 'assign']);
            Route::delete('/{internId}',          [AssignmentController::class, 'unassign']);
            Route::get('/leads/{leadId}/interns', [AssignmentController::class, 'leadInterns']);
            Route::get('/my-interns',             [AssignmentController::class, 'myInterns']);
        });
    });

    // ── Legacy admin endpoints ────────────────────────────────────────────
    Route::middleware(['role:hr,admin,teamlead'])->group(function () {
        Route::get('/admin/pending-users',     [AuthController::class, 'getPendingUsers']);
        Route::put('/admin/users/{id}/status', [AuthController::class, 'updateStatus']);
    });
});


