<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'difficulty',
        'assigned_to',
        'creator_id',
        'due_date',
        'submission',
        'feedback',
        'score',
        'submitted_at',
        'reviewed_at',
        'draft_code',
        'draft_language',
        'draft_saved_at',
        'activity_log',
    ];

    protected function casts(): array
    {
        return [
            'due_date'       => 'date',
            'submitted_at'   => 'datetime',
            'reviewed_at'    => 'datetime',
            'draft_saved_at' => 'datetime',
            'activity_log'   => 'array',
        ];
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
