<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Which team lead supervises this intern (null = unassigned)
            $table->foreignId('team_lead_id')
                  ->nullable()
                  ->after('status')
                  ->constrained('users')
                  ->onDelete('set null');

            // Intern is fully active only after team lead assignment
            $table->boolean('is_active')
                  ->default(false)
                  ->after('team_lead_id');

            // Optional: timestamp of when assignment was made
            $table->timestamp('assigned_at')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['team_lead_id']);
            $table->dropColumn(['team_lead_id', 'is_active', 'assigned_at']);
        });
    }
};
