<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CodeController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AssignmentController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [App\Http\Controllers\PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [App\Http\Controllers\PasswordResetController::class, 'reset']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/me/stats', [AuthController::class, 'myStats']);

    // ─── Integrated Code Editor ────────────────────────────────────────────────
    Route::post('/code/run',      [CodeController::class, 'run']);
    Route::post('/code/autosave', [CodeController::class, 'autosave']);

    // ─── HR / Profile Approval Module ─────────────────────────────────────────
    Route::prefix('hr')->group(function () {
        // Approval endpoints
        Route::get('/stats',                [ApprovalController::class,   'stats']);
        Route::get('/users',                [ApprovalController::class,   'index']);
        Route::get('/users/{id}',           [ApprovalController::class,   'show']);
        Route::put('/users/{id}/status',    [ApprovalController::class,   'updateStatus']);
        Route::get('/logs',                 [ApprovalController::class,   'logs']);

        // ─── Team Lead Assignment Module ───────────────────────────────────────
        Route::prefix('assignments')->group(function () {
            Route::get('/stats',                    [AssignmentController::class, 'stats']);
            Route::get('/interns',                  [AssignmentController::class, 'interns']);
            Route::get('/leads',                    [AssignmentController::class, 'leads']);
            Route::post('/assign',                  [AssignmentController::class, 'assign']);
            Route::delete('/{internId}',            [AssignmentController::class, 'unassign']);
            Route::get('/leads/{leadId}/interns',   [AssignmentController::class, 'leadInterns']);
            Route::get('/my-interns',               [AssignmentController::class, 'myInterns']);
        });
    });

    // Legacy admin endpoints (kept for backward compatibility)
    Route::get('/admin/pending-users',          [AuthController::class, 'getPendingUsers']);
    Route::put('/admin/users/{id}/status',      [AuthController::class, 'updateStatus']);

    // Task routes
    Route::get('tasks/stats',           [TaskController::class, 'stats']);
    Route::post('tasks/{task}/submit',  [TaskController::class, 'submit']);
    Route::post('tasks/{task}/review',  [TaskController::class, 'review']);
    Route::apiResource('tasks', TaskController::class);
});
