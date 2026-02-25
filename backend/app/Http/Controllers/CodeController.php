<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CodeController extends Controller
{
    /**
     * Judge0 CE language IDs
     * Full list: https://ce.judge0.com/languages
     */
    private const LANG_MAP = [
        'javascript' => ['id' => 93,  'label' => 'JavaScript (Node.js 18.15.0)'],
        'python'     => ['id' => 92,  'label' => 'Python (3.11.2)'],
        'php'        => ['id' => 68,  'label' => 'PHP (7.4.1)'],
        'java'       => ['id' => 62,  'label' => 'Java (OpenJDK 13.0.1)'],
        'c'          => ['id' => 50,  'label' => 'C (GCC 9.2.0)'],
        'cpp'        => ['id' => 54,  'label' => 'C++ (GCC 9.2.0)'],
        'typescript' => ['id' => 94,  'label' => 'TypeScript (5.0.3)'],
        'go'         => ['id' => 60,  'label' => 'Go (1.13.5)'],
        'bash'       => ['id' => 46,  'label' => 'Bash (5.0.0)'],
        'rust'       => ['id' => 73,  'label' => 'Rust (1.40.0)'],
        'sql'        => ['id' => 82,  'label' => 'SQL (SQLite 3.27.2)'],
    ];


    /**
     * Returns the base URL and headers for Judge0.
     *
     * Priority:
     *   1. If JUDGE0_API_KEY is set → RapidAPI hosted (judge0-ce.p.rapidapi.com)
     *   2. Otherwise              → Free public CE instance (ce.judge0.com) — no key needed
     */
    private function judge0Config(): array
    {
        $apiKey = config('services.judge0.api_key');

        if ($apiKey && $apiKey !== 'your_rapidapi_key_here') {
            // RapidAPI hosted — requires key
            $host = config('services.judge0.api_host', 'judge0-ce.p.rapidapi.com');
            return [
                'base_url' => "https://{$host}",
                'headers'  => [
                    'Content-Type'    => 'application/json',
                    'X-RapidAPI-Key'  => $apiKey,
                    'X-RapidAPI-Host' => $host,
                ],
            ];
        }

        // Free open-source public instance — no API key required
        return [
            'base_url' => 'https://ce.judge0.com',
            'headers'  => [
                'Content-Type' => 'application/json',
            ],
        ];
    }

    /**
     * POST /api/code/run
     * Proxies code execution to Judge0 CE.
     * Logs run activity to the task.
     */
    public function run(Request $request)
    {
        $request->validate([
            'language' => 'required|string',
            'code'     => 'required|string|max:65535',
            'stdin'    => 'nullable|string|max:4096',
            'task_id'  => 'nullable|exists:tasks,id',
        ]);

        $user     = $request->user();
        $language = strtolower($request->language);
        $code     = $request->code;
        $stdin    = $request->stdin ?? '';

        // Resolve Judge0 language ID
        $lang = self::LANG_MAP[$language] ?? null;

        if (!$lang) {
            return response()->json([
                'success' => false,
                'output'  => '',
                'error'   => "Unsupported language: {$language}",
            ]);
        }

        try {
            $j0       = $this->judge0Config();
            $baseUrl  = $j0['base_url'];
            $headers  = $j0['headers'];

            // Submit for execution — base64_encoded=false, wait=true for immediate result
            $submitResponse = Http::timeout(20)
                ->withHeaders($headers)
                ->post("{$baseUrl}/submissions?base64_encoded=false&wait=true", [
                    'language_id' => $lang['id'],
                    'source_code' => $code,
                    'stdin'       => $stdin,
                ]);

            if (!$submitResponse->successful()) {
                Log::error('Judge0 submission failed', [
                    'status' => $submitResponse->status(),
                    'body'   => $submitResponse->body(),
                ]);
                return response()->json([
                    'success' => false,
                    'output'  => 'Execution engine unavailable. The free public instance may be temporarily down — try again in a moment.',
                    'error'   => $submitResponse->body(),
                ]);
            }

            $result = $submitResponse->json();

            // If still processing (status 1 = In Queue, 2 = Processing), poll once more
            $statusId = $result['status']['id'] ?? 0;
            if (in_array($statusId, [1, 2]) && isset($result['token'])) {
                sleep(2);
                $pollResponse = Http::timeout(15)
                    ->withHeaders($headers)
                    ->get("{$baseUrl}/submissions/{$result['token']}?base64_encoded=false");

                if ($pollResponse->successful()) {
                    $result = $pollResponse->json();
                }
            }

            $stdout    = $result['stdout']              ?? '';
            $stderr    = $result['stderr']              ?? '';
            $compileOut= $result['compile_output']      ?? '';
            $statusId  = $result['status']['id']        ?? 0;
            $statusMsg = $result['status']['description']?? 'Unknown';

            // Build a clean error string
            $errorOutput = trim(implode("\n", array_filter([$compileOut, $stderr])));

            // Status 3 = Accepted (success)
            $success = ($statusId === 3);

            // Log run activity on the task (non-blocking)
            if ($request->task_id) {
                try {
                    $task = Task::where('id', $request->task_id)
                                ->where('assigned_to', $user->id)
                                ->first();
                    if ($task) {
                        $logs   = json_decode($task->activity_log ?? '[]', true) ?: [];
                        $logs[] = [
                            'action'    => 'run',
                            'language'  => $language,
                            'timestamp' => now()->toISOString(),
                            'status'    => $statusMsg,
                        ];
                        if (count($logs) > 50) $logs = array_slice($logs, -50);
                        $task->update(['activity_log' => json_encode($logs)]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Activity log update failed: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success'  => $success,
                'output'   => $stdout,
                'error'    => $errorOutput,
                'status'   => $statusMsg,
                'language' => $lang['label'],
            ]);

        } catch (\Exception $e) {
            Log::error('Code execution error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'output'  => '',
                'error'   => 'Execution service temporarily unavailable: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * POST /api/code/autosave
     * Auto-save the current editor content against a task.
     */
    public function autosave(Request $request)
    {
        $request->validate([
            'task_id'  => 'required|exists:tasks,id',
            'code'     => 'required|string',
            'language' => 'nullable|string',
        ]);

        $user = $request->user();
        $task = Task::where('id', $request->task_id)
                    ->where('assigned_to', $user->id)
                    ->firstOrFail();

        // Store draft — we use a dedicated column to not overwrite the final submission
        $task->update([
            'draft_code'     => $request->code,
            'draft_language' => $request->language,
            'draft_saved_at' => now(),
        ]);

        // Log save activity
        try {
            $logs   = json_decode($task->activity_log ?? '[]', true) ?: [];
            $logs[] = ['action' => 'autosave', 'timestamp' => now()->toISOString()];
            if (count($logs) > 50) $logs = array_slice($logs, -50);
            $task->update(['activity_log' => json_encode($logs)]);
        } catch (\Exception $e) {}

        return response()->json(['message' => 'Draft saved.', 'saved_at' => now()]);
    }
}
