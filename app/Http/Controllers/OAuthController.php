<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function redirect(string $provider){
        return Socialite::driver($provider)->redirect();

    }
    public function callback(string $provider){
        $providerUser=Socialite::driver($provider)->user();
        if($provider=='github'){
             $user = User::updateOrCreate(
                ['github_id' => $providerUser->getId()],
                [
                    'name'                   => $providerUser->getName() ?? $providerUser->getNickname() ?? 'N/A',
                    'email'                  => $providerUser->getEmail(),
                    'github_token'           => $providerUser->token,
                    'github_refresh_token'   => $providerUser->refreshToken,
                   
                    'password'               => Hash::make(str::random(16)),
                ]
            );
        } else {
            $user = User::updateOrCreate([
                   ['google_id' => $providerUser->getId()],
                [
                    'name'                   => $providerUser->getName(),
                    'email'                  => $providerUser->getEmail(),
                    'google_token'           => $providerUser->token,
                    'google_refresh_token'   => $providerUser->refreshToken,
                    'password'               => Hash::make(Str::random(16)),
                ]
            ]);
            
        }
        Auth::login($user,true);
        return redirect(config('app.frontend_url') .'/dashboard');


    }
}
