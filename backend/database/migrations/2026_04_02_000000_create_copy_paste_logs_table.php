<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copy_paste_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('intern_id');
            $table->unsignedBigInteger('task_id')->nullable();
            $table->integer('paste_count')->default(0);
            $table->timestamp('reported_at')->nullable();
            $table->timestamps();

            $table->foreign('intern_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('set null');
            $table->index(['intern_id', 'reported_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copy_paste_logs');
    }
};
