<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 /**
     * @OA\Schema(
     *     schema="Chat",
     *     type="object",
     *     title="Chat",
     *     required={"id","user_id"},
     *     @OA\Property(property="id", type="integer", example=1),
     *     @OA\Property(property="user_id", type="integer", example=42),
     *     @OA\Property(property="title", type="string", example="My Chat"),
     *     @OA\Property(property="created_at", type="string", format="date-time"),
     *     @OA\Property(property="updated_at", type="string", format="date-time")
     * )
     */

class Chat extends Model
{
    protected $fillable = [
      'title','user_id'
    ] ;
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function messages(){
        return $this->hasMany(Message::class);
    }
}
