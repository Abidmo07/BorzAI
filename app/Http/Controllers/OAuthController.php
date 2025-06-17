<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();

    }
    public function callback(string $provider)
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        $providerIdColumn = $provider . '_id';
        $tokenColumn = $provider . '_token';
        $refreshTokenColumn = $provider . '_refresh_token';

        $existingUser = User::where('email', $socialUser->getEmail())->first();

        if ($existingUser) {
            // If user exists, update the provider_id and tokens
            $existingUser->update([
                $providerIdColumn => $socialUser->getId(),
                $tokenColumn => $socialUser->token,
                $refreshTokenColumn => $socialUser->refreshToken,
            ]);
            $user = $existingUser;
        } else {
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'No Name',
                'email' => $socialUser->getEmail(),
                $providerIdColumn => $socialUser->getId(),
                $tokenColumn => $socialUser->token,
                $refreshTokenColumn => $socialUser->refreshToken,
                'password' => Hash::make(Str::random(16)), 
            ]);
        }

        Auth::login($user, true);

        return redirect(config('app.frontend_url') . '/dashboard/chat/1');
    }

}
