<?php

namespace App\Http\Controllers;

use App\Events\AiReplied;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Str;

class ChatController extends Controller
{
    public function storeAndSend(Request $request)
{
    $data = $request->validate([
        "title" => ["nullable", "string"],
        "chat_id" => ["nullable"],
        "content" => ["required", "string"],
    ]);

    // Get or create chat
    $chat = Chat::find($data["chat_id"]);
    if (!$chat) {
        $chat = Chat::create([
            "user_id" => Auth::id(),
            "title" => Str::limit($data["content"],30)  ?? "New Chat",
        ]);
    }
    if(empty($chat->title)){
        $chat->title = Str::limit($data["content"],30);
        $chat->save();
    }

    // Store user message
    $userMessage = $chat->messages()->create([
        "content" => $data["content"],
        "sender" => "user"
    ]);

    Log::info('User message stored:', ['message' => $userMessage->content]);

    // Get AI response
    $aiResponse = $this->getAiResponse($userMessage->content);

    // Store AI response
    $aiMessage = $chat->messages()->create([
        "content" => $aiResponse,
        "sender" => "ai"
    ]);

    Log::info('AI response stored:', ['message' => $aiMessage->content]);

    // Broadcast both messages
    event(new AiReplied($userMessage->content, $aiMessage->content));

    return response()->json([
        "status" => "success",
        "user_message" => $userMessage,
        "ai_message" => $aiMessage,
    ]);

}

public function send(Request $request)
{
    $data = $request->validate([
        "chat_id" => ["required", "exists:chats,id"],
        "content" => ["required", "string"], // last user message
    ]);

    $chat = Chat::findOrFail($data["chat_id"]);

    // Get AI response
    $aiResponse = $this->getAiResponse($data["content"]);

    // Store AI response
    $aiMessage = $chat->messages()->create([
        "content" => $aiResponse,
        "sender" => "ai"
    ]);

    // Broadcast if needed
    event(new AiReplied($data["content"], $aiResponse));

    return response()->json([
        "status" => "success",
        "ai_message" => $aiMessage
    ]);
}

    /* public function send(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        Log::info('Received user message:', ['message' => $userMessage]);

        $botResponse = $this->getAiResponse($userMessage);

        // Broadcast with proper payload
        event(new AiReplied($userMessage, $botResponse));
        Log::info('Broadcasting AiReplied event:', ['user_message' => $userMessage, 'bot_response' => $botResponse]);

        return response()->json([
            'user_message' => $userMessage,
            'bot_response' => $botResponse,
        ]);
    } */

    private function getAiResponse(string $message): string
    {
        $apiKey = env('AI_API_KEY'); // Ensure this is your OpenRouter API Key

        if (empty($apiKey)) {
            Log::error('AI_API_KEY is not set in .env file for OpenRouter.');
            return "I'm sorry, my API key is missing. Please check the server configuration.";
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url', 'http://localhost:3000'), // Use app.url or default
                'X-Title' => config('app.name', 'MyChatApp'), // Use app.name or default
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                        'model' => 'deepseek/deepseek-r1-0528:free', // Or the exact model ID from OpenRouter docs
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are a helpful assistant.'],
                            ['role' => 'user', 'content' => $message],
                        ],
                        'temperature' => 0.7,
                    ]);

            // --- FIX APPLIED HERE ---
            $responseData = $response->json(); // Get the full JSON response once

            Log::info('OpenRouter API Raw Response:', [
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->body(),
                'decoded_json' => $responseData, // Use the variable here
            ]);

            // Check if successful and then check the structure
            if (
                $response->successful() &&
                isset($responseData['choices'][0]['message']['content'])
            ) { // Use the variable
                $content = trim($responseData['choices'][0]['message']['content']);
                Log::info('Successfully retrieved AI response content from OpenRouter.', ['content' => $content]);
                return $content;
            } else {
                // Log detailed error if API call was not successful or content is missing
                Log::warning('OpenRouter API call failed or content missing.', [
                    'status' => $response->status(),
                    'error_response' => $responseData, // Use the variable here
                    'raw_body' => $response->body(),
                    'is_successful' => $response->successful(),
                    // Now check the keys using the $responseData variable
                    'has_choices_key' => isset($responseData['choices']),
                    'has_first_choice' => isset($responseData['choices'][0]),
                    'has_message_key' => isset($responseData['choices'][0]['message']),
                    'has_content_key' => isset($responseData['choices'][0]['message']['content']),
                ]);
                return "I'm sorry, I couldn't generate a response from the AI. (OpenRouter API issue)";
            }

        } catch (\Throwable $e) {
            Log::error('Exception during OpenRouter API call:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return "I'm sorry, I encountered a technical issue contacting the AI. Please try again later.";
        }
    }
    public function chatsPerUser()
    {
        $userId=Auth::user()->id;
        $chats=Chat::where("user_id", $userId)->orderByDesc("id")->get();
        return response()->json([
            "status" => "success",
            "chats" => $chats,
        ]);
    }
    
 
    public function messagesPerChat(Chat $chat)
    {
        $messages = Message::where("chat_id", $chat->id)->get();
        return response()->json([
            "status" => "success",
            "messages" => $messages
        ]);

    }
    public function addNewChat(){
          $userId=Auth::user()->id;
          $chat= Chat::create([
            "user_id"=> $userId,
            "title"=>null
          ]);
          return response()->json([
            "status"=> "success",
            "chat"=> $chat
          ]);
          
    }


}