<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->longText('draft_code')->nullable()->after('submission');
            $table->string('draft_language', 50)->nullable()->after('draft_code');
            $table->timestamp('draft_saved_at')->nullable()->after('draft_language');
            $table->json('activity_log')->nullable()->after('draft_saved_at');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['draft_code', 'draft_language', 'draft_saved_at', 'activity_log']);
        });
    }
};
