<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    /**
     * Get all intern performance data (for HR)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Intern performance data
        $interns = User::whereHas('role', fn($q) => $q->where('name', 'intern'))
            ->where('status', 'approved')
            ->with(['technology', 'role', 'teamLead:id,name'])
            ->get()
            ->map(function ($intern) {
                $tasks = Task::where('assigned_to', $intern->id)->get();
                $completedTasks = $tasks->where('status', 'done')->count();
                $totalTasks = $tasks->count();
                $progressPercent = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

                // Get copy-paste incidents (10 attempts = 1 incident)
                $copyPasteAttempts = \DB::table('copy_paste_logs')
                    ->where('intern_id', $intern->id)
                    ->sum('paste_count');
                $copyIncidents = intval($copyPasteAttempts / 10);

                return [
                    'id' => $intern->id,
                    'name' => $intern->name,
                    'email' => $intern->email,
                    'technology' => $intern->technology?->name ?? 'N/A',
                    'team_lead' => $intern->teamLead?->name ?? 'Unassigned',
                    'status' => $intern->status,
                    'total_tasks' => $totalTasks,
                    'completed_tasks' => $completedTasks,
                    'progress_percent' => $progressPercent,
                    'copy_paste_attempts' => $copyPasteAttempts,
                    'copy_incidents' => $copyIncidents,
                    'created_at' => $intern->created_at,
                ];
            });

        return response()->json($interns);
    }

    /**
     * Get detailed performance for a specific intern
     */
    public function show(Request $request, $internId)
    {
        $intern = User::with(['technology', 'role', 'teamLead:id,name'])
            ->find($internId);

        if (!$intern || $intern->role->name !== 'intern') {
            return response()->json(['message' => 'Intern not found'], 404);
        }

        $tasks = Task::where('assigned_to', $internId)->get();

        // Get copy-paste incidents
        $copyPasteAttempts = \DB::table('copy_paste_logs')
            ->where('intern_id', $internId)
            ->sum('paste_count');
        $copyIncidents = intval($copyPasteAttempts / 10);

        $stats = [
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $tasks->where('status', 'done')->count(),
            'in_progress_tasks' => $tasks->where('status', 'in_progress')->count(),
            'todo_tasks' => $tasks->where('status', 'todo')->count(),
            'progress_percent' => $tasks->count() > 0 
                ? round(($tasks->where('status', 'done')->count() / $tasks->count()) * 100)
                : 0,
            'basic_tasks' => $tasks->where('difficulty', 'basic')->count(),
            'medium_tasks' => $tasks->where('difficulty', 'medium')->count(),
            'hard_tasks' => $tasks->where('difficulty', 'hard')->count(),
            'copy_paste_attempts' => $copyPasteAttempts,
            'copy_incidents' => $copyIncidents,
        ];

        return response()->json([
            'intern' => [
                'id' => $intern->id,
                'name' => $intern->name,
                'email' => $intern->email,
                'technology' => $intern->technology?->name ?? 'N/A',
                'team_lead' => $intern->teamLead?->name ?? 'Unassigned',
                'status' => $intern->status,
                'created_at' => $intern->created_at,
            ],
            'stats' => $stats,
            'tasks' => $tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'difficulty' => $task->difficulty,
                    'status' => $task->status,
                    'due_date' => $task->due_date,
                    'created_at' => $task->created_at,
                ];
            }),
        ]);
    }
}