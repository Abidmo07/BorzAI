<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AiReplied implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userMessage;
    public $botResponse;

    public function __construct(string $userMessage, string $botResponse)
    {
        $this->userMessage = $userMessage;
        $this->botResponse = $botResponse;
    }

    public function broadcastOn(): array
    {
        return [new Channel('chat')];
    }

  
}
