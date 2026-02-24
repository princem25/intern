<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * GET /api/tasks
     * - Intern: only tasks assigned to them
     * - Team Lead: tasks they created (for their interns)
     * - Admin/HR: all tasks
     */
    public function index(Request $request)
    {
        $user   = $request->user();
        $role   = $user->role->name;
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Task::with(['assignee:id,name,email', 'creator:id,name']);

        if ($role === 'intern') {
            $query->where('assigned_to', $user->id);
        } elseif ($role === 'teamlead') {
            $query->where('creator_id', $user->id);
        }
        // hr / admin see all

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(fn($q) =>
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
            );
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->get()
        );
    }

    /**
     * POST /api/tasks
     * Team Lead creates a task and assigns it to one of their interns.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty'  => 'nullable|in:basic,medium,hard',
            'assigned_to' => 'required|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        $data['creator_id'] = $user->id;
        $data['status']     = 'todo';

        $task = Task::create($data);

        return response()->json($task->load(['assignee:id,name,email', 'creator:id,name']), 201);
    }

    /**
     * GET /api/tasks/{id}
     */
    public function show(Request $request, Task $task)
    {
        return response()->json($task->load(['assignee:id,name,email', 'creator:id,name']));
    }

    /**
     * PUT /api/tasks/{id}
     * Team Lead updates task details (title, description, due_date, difficulty).
     */
    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'difficulty'  => 'nullable|in:basic,medium,hard',
            'due_date'    => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $task->update($data);

        return response()->json($task->load(['assignee:id,name,email', 'creator:id,name']));
    }

    /**
     * DELETE /api/tasks/{id}
     */
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }

    /**
     * POST /api/tasks/{id}/submit
     * Intern submits their answer/code for a task.
     */
    public function submit(Request $request, Task $task)
    {
        $user = $request->user();

        if ($task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Not your task.'], 403);
        }

        $request->validate([
            'submission' => 'required|string',
        ]);

        $task->update([
            'submission'   => $request->submission,
            'status'       => 'in_progress',
            'submitted_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Submission received!',
            'task'    => $task->load(['assignee:id,name,email', 'creator:id,name']),
        ]);
    }

    /**
     * POST /api/tasks/{id}/review
     * Team Lead reviews a submitted task — adds feedback, score, marks done.
     */
    public function review(Request $request, Task $task)
    {
        $user = $request->user();

        if ($task->creator_id !== $user->id) {
            return response()->json(['message' => 'Not your task to review.'], 403);
        }

        $request->validate([
            'feedback' => 'required|string',
            'score'    => 'required|integer|min:0|max:100',
            'status'   => 'nullable|in:done,in_progress',
        ]);

        $task->update([
            'feedback'    => $request->feedback,
            'score'       => $request->score,
            'status'      => $request->status ?? 'done',
            'reviewed_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Review saved.',
            'task'    => $task->load(['assignee:id,name,email', 'creator:id,name']),
        ]);
    }

    /**
     * GET /api/tasks/stats
     * Summary stats for the current user.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $role = $user->role->name;

        $base = Task::query();
        if ($role === 'intern') {
            $base->where('assigned_to', $user->id);
        } elseif ($role === 'teamlead') {
            $base->where('creator_id', $user->id);
        }

        return response()->json([
            'total'       => (clone $base)->count(),
            'todo'        => (clone $base)->where('status', 'todo')->count(),
            'in_progress' => (clone $base)->where('status', 'in_progress')->count(),
            'done'        => (clone $base)->where('status', 'done')->count(),
        ]);
    }
}
