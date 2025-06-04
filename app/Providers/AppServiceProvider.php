<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //Customizing the email verification 
          VerifyEmail::toMailUsing(function ($notifiable, $url) {
            $parts = parse_url($url);
            $verifyEmailUrl = 'http://localhost:3000/auth/verify-email?id=' 
                . $notifiable->getKey()
                . '&hash=' . sha1($notifiable->getEmailForVerification()) 
                . '&' . $parts['query'];

            return (new MailMessage)
                ->subject('Verify Email Address')
                ->greeting('Hello ' . $notifiable->name)
                ->line('Click the button below to verify your email address')
                ->action('Verify Email Address', $verifyEmailUrl);
        });

        //Customizing the reset password
         ResetPassword::toMailUsing(function ($notifiable, $token) {
            $resetUrl = 'http://localhost:3000/auth/reset-password?token=' . $token 
                . '&email=' . urlencode($notifiable->email);

            return (new MailMessage)
                ->subject('Reset Password Notification')
                ->greeting('Hello ' . $notifiable->name)
                ->line('You are receiving this email because we received a password reset request for your account.')
                ->action('Reset Password', $resetUrl)
                ->line('If you did not request a password reset, no further action is required.');
        });

    }
}
