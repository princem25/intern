<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CodeController extends Controller
{
    /**
     * POST /api/code/run
     * Proxies code execution to the Piston API.
     * Logs run activity to the task.
     */
    public function run(Request $request)
    {
        $request->validate([
            'language' => 'required|string',
            'version'  => 'nullable|string',
            'code'     => 'required|string|max:65535',
            'stdin'    => 'nullable|string|max:4096',
            'task_id'  => 'nullable|exists:tasks,id',
        ]);

        $user     = $request->user();
        $language = strtolower($request->language);
        $code     = $request->code;
        $stdin    = $request->stdin ?? '';

        // Language → Piston language/version map
        $langMap = [
            'javascript' => ['language' => 'javascript', 'version' => '18.15.0'],
            'python'     => ['language' => 'python',      'version' => '3.10.0'],
            'php'        => ['language' => 'php',          'version' => '8.2.3'],
            'java'       => ['language' => 'java',         'version' => '15.0.2'],
            'c'          => ['language' => 'c',            'version' => '10.2.0'],
            'cpp'        => ['language' => 'c++',          'version' => '10.2.0'],
            'typescript' => ['language' => 'typescript',   'version' => '5.0.3'],
            'go'         => ['language' => 'go',           'version' => '1.16.2'],
            'rust'       => ['language' => 'rust',         'version' => '1.50.0'],
            'bash'       => ['language' => 'bash',         'version' => '5.1.0'],
        ];

        $pistonLang = $langMap[$language] ?? ['language' => $language, 'version' => '*'];

        try {
            $response = Http::timeout(15)->post('https://emkc.org/api/v2/piston/execute', [
                'language' => $pistonLang['language'],
                'version'  => $pistonLang['version'],
                'files'    => [
                    ['name' => 'main', 'content' => $code],
                ],
                'stdin'    => $stdin,
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'output'  => 'Execution engine unavailable. Please try again.',
                    'error'   => $response->body(),
                ], 200); // still 200 so frontend can handle it gracefully
            }

            $result = $response->json();
            $run    = $result['run'] ?? [];

            // Log run activity on the task (non-blocking)
            if ($request->task_id) {
                try {
                    $task = Task::where('id', $request->task_id)
                                ->where('assigned_to', $user->id)
                                ->first();
                    if ($task) {
                        $logs = json_decode($task->activity_log ?? '[]', true) ?: [];
                        $logs[] = [
                            'action'    => 'run',
                            'language'  => $language,
                            'timestamp' => now()->toISOString(),
                            'exit_code' => $run['code'] ?? null,
                        ];
                        // Keep last 50 entries
                        if (count($logs) > 50) $logs = array_slice($logs, -50);
                        $task->update(['activity_log' => json_encode($logs)]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Activity log update failed: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success'   => ($run['code'] ?? 1) === 0,
                'output'    => $run['stdout'] ?? '',
                'error'     => $run['stderr'] ?? '',
                'exit_code' => $run['code'] ?? null,
                'language'  => $pistonLang['language'],
                'version'   => $result['language'] ?? $pistonLang['language'],
            ]);

        } catch (\Exception $e) {
            Log::error('Code execution error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'output'  => '',
                'error'   => 'Execution service temporarily unavailable.',
            ], 200);
        }
    }

    /**
     * POST /api/code/autosave
     * Auto-save the current editor content against a task.
     */
    public function autosave(Request $request)
    {
        $request->validate([
            'task_id'     => 'required|exists:tasks,id',
            'code'        => 'required|string',
            'language'    => 'nullable|string',
        ]);

        $user = $request->user();
        $task = Task::where('id', $request->task_id)
                    ->where('assigned_to', $user->id)
                    ->firstOrFail();

        // Store draft — we use a dedicated column to not overwrite the final submission
        $task->update([
            'draft_code'      => $request->code,
            'draft_language'  => $request->language,
            'draft_saved_at'  => now(),
        ]);

        // Log save activity
        try {
            $logs = json_decode($task->activity_log ?? '[]', true) ?: [];
            $logs[] = ['action' => 'autosave', 'timestamp' => now()->toISOString()];
            if (count($logs) > 50) $logs = array_slice($logs, -50);
            $task->update(['activity_log' => json_encode($logs)]);
        } catch (\Exception $e) {}

        return response()->json(['message' => 'Draft saved.', 'saved_at' => now()]);
    }
}
