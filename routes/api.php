<?php

use App\Http\Controllers\OAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/oauth/{provider}/redirect',[OAuthController::class,'redirect']);
Route::get('/oauth/{provider}/callback',[OAuthController::class,'callback']);
