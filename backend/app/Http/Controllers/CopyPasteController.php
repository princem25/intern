<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\CopyPasteAlertMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CopyPasteController extends Controller
{
    /**
     * Report copy-paste attempts exceeding threshold
     */
    public function reportCopyPaste(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'intern') {
            return response()->json(['message' => 'Only interns can report copy-paste attempts.'], 403);
        }

        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'paste_count' => 'required|integer|min:11',
        ]);

        $taskId = $request->task_id;
        $pasteCount = $request->paste_count;

        // Log the copy-paste attempt
        DB::table('copy_paste_logs')->insert([
            'intern_id' => $user->id,
            'task_id' => $taskId,
            'paste_count' => $pasteCount,
            'reported_at' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Get HR and Team Lead
        $hrUsers = User::whereHas('role', fn($q) => $q->where('name', 'hr'))->get();
        $teamLead = $user->teamLead;

        // Send alerts
        $recipients = $hrUsers->toArray();
        if ($teamLead) {
            $recipients[] = $teamLead;
        }

        foreach ($recipients as $recipient) {
            Mail::to($recipient['email'])->send(new CopyPasteAlertMail($user, $pasteCount));
        }

        return response()->json([
            'message' => 'Copy-paste alert reported successfully.',
            'recipients_notified' => count($recipients),
        ]);
    }
}
