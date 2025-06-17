<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        "content","chat_id","sender"
    ] ;

    public function chat(){
        return $this->belongsTo(Chat::class);
    }
}
