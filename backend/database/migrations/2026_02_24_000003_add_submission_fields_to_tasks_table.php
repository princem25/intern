<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->enum('difficulty', ['basic', 'medium', 'hard'])->default('basic')->after('status');
            $table->longText('submission')->nullable()->after('difficulty');  // intern's submitted answer/code
            $table->text('feedback')->nullable()->after('submission');         // lead's feedback text
            $table->unsignedTinyInteger('score')->nullable()->after('feedback'); // 0-100
            $table->timestamp('submitted_at')->nullable()->after('score');
            $table->timestamp('reviewed_at')->nullable()->after('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['difficulty', 'submission', 'feedback', 'score', 'submitted_at', 'reviewed_at']);
        });
    }
};
