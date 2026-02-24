<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalLog extends Model
{
    protected $fillable = [
        'target_user_id',
        'acted_by',
        'action',
        'reason',
    ];

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function actedBy()
    {
        return $this->belongsTo(User::class, 'acted_by');
    }
}
