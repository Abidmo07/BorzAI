<?php



use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');





Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
   if(!$request->hasValidSignature()){
            return response()->json([
                "message"=> "Invalide or expired verification code"
            ],400);
         }
         $user=User::find($id);
         if(!$user){
            return response()->json([
                "message"=> "user not found"
            ],400);
         }
         if(!$user->hasVerifiedEmail()){
            $user->markEmailAsVerified();
            return response()->json([
                "message"=> "Email verified with success",
                "user"=>$user
            ]);
         }



        return response()->json([
            "message"=> "Email already verified"
        ],400);
})->name('verification.verify');
