<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/**
 * IOR Courier Tracking — private per-tenant per-shipment channel.
 * Only authenticated users within the same tenant can listen.
 */
Broadcast::channel('tenant.{tenantId}.ior.shipment.{trackingNumber}', function ($user, $tenantId, $trackingNumber) {
    // Verify the user belongs to the tenant requesting the channel
    return tenant('id') === $tenantId;
});
