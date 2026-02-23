<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [App\Http\Controllers\PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [App\Http\Controllers\PasswordResetController::class, 'reset']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Admin/Team Lead routes
    Route::get('/admin/pending-users', [AuthController::class, 'getPendingUsers']);
    Route::put('/admin/users/{id}/status', [AuthController::class, 'updateStatus']);
});
