<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

 /**
     * @OA\Schema(
     *     schema="Message",
     *     type="object",
     *     title="Message",
     *     required={"id","chat_id","content","sender"},
     *     @OA\Property(property="id", type="integer", example=100),
     *     @OA\Property(property="chat_id", type="integer", example=1),
     *     @OA\Property(property="content", type="string", example="Hello World"),
     *     @OA\Property(property="sender", type="string", example="user"),
     *     @OA\Property(property="created_at", type="string", format="date-time"),
     *     @OA\Property(property="updated_at", type="string", format="date-time")
     * )
     */
class Message extends Model
{
    protected $fillable = [
        "content","chat_id","sender"
    ] ;

    public function chat(){
        return $this->belongsTo(Chat::class);
    }
}
