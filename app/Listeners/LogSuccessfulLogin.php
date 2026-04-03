<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\LoginHistory;
use Jenssegers\Agent\Agent;
use Stevebauman\Location\Facades\Location;

class LogSuccessfulLogin
{
    /**
     * Handle the event.
     *
     * @param  \Illuminate\Auth\Events\Login  $event
     * @return void
     */
    public function handle(Login $event)
    {
        $request = request();
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        $ip = $request->ip();
        $locationString = 'Unknown';
        
        if ($ip === '127.0.0.1' || $ip === '::1') {
            $locationString = 'Localhost (Dev)';
        } elseif ($position = Location::get($ip)) {
            $locationString = $position->cityName ? ($position->cityName . ', ' . $position->countryName) : $position->countryName;
        }

        LoginHistory::create([
            'user_id' => $event->user->id,
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
            'device' => $agent->platform() ?: 'Unknown OS',
            'browser' => $agent->browser() ?: 'Unknown Browser',
            'location' => $locationString,
            'login_at' => now(),
        ]);
    }
}
