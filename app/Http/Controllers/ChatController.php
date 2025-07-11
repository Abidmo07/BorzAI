<?php
/**
 * @OA\Info(
 *     title="My ChatBot API",
 *     version="1.0.0",
 *     description="REST endpoints for chatting with the AI assistant",
 *     @OA\Contact(
 *         name="ramzi",
 *         email="abidmo2003@gmail.com"
 *     )
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
namespace App\Http\Controllers;

use App\Events\AiReplied;
use App\Models\Chat;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Str;

/**
 * @OA\Tag(
 *     name="Chats",
 *     description="Endpoints related to chats and messages"
 * )
 */

class ChatController extends Controller
{

     /**
     * @OA\Post(
     *     path="/api/chats",
     *     tags={"Chats"},
     *     summary="Create or send a message in a chat",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"content"},
     *             @OA\Property(property="title", type="string", example="My Chat"),
     *             @OA\Property(property="chat_id", type="integer", example=12),
     *             @OA\Property(property="content", type="string", example="Hello!"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="user_message", ref="#/components/schemas/Message"),
     *             @OA\Property(property="ai_message", ref="#/components/schemas/Message")
     *         )
     *     )
     * )
     */
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


      /**
     * @OA\Get(
     *     path="/api/chats",
     *     tags={"Chats"},
     *     summary="Get all chats for authenticated user",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(
     *                 property="chats",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Chat")
     *             )
     *         )
     *     )
     * )
     */
    public function chatsPerUser()
    {
        $userId=Auth::user()->id;
        $chats=Chat::where("user_id", $userId)->orderByDesc("id")->get();
        return response()->json([
            "status" => "success",
            "chats" => $chats,
        ]);
    }
    
  /**
     * @OA\Get(
     *     path="/api/chats/{chatId}/messages",
     *     tags={"Chats"},
     *     summary="Get all messages for a chat",
     *     @OA\Parameter(
     *         name="chatId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=5)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(
     *                 property="messages",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Message")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, ref="#/components/responses/Unauthorized")
     * )
     */
    public function messagesPerChat(Chat $chat)
    {
        if(Auth::user()->id !== $chat->user_id) {
            abort(403,"Unauthorized");
        }
        $messages=$chat->messages()->get();
      return response()->json([
            "status" => "success",
            "messages" => $messages
        ]);

    }

      /**
     * @OA\Post(
     *     path="/api/chats/new",
     *     tags={"Chats"},
     *     summary="Create a new empty chat",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="chat", ref="#/components/schemas/Chat")
     *         )
     *     )
     * )
     */
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