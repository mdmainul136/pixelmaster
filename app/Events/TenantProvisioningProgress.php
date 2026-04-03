<?php

namespace App\Events;
 
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
 
class TenantProvisioningProgress implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
 
    public function __construct(
        public string $tenantId,
        public string $status,
        public int    $progress,
        public string $message = ''
    ) {}
 
    public function broadcastOn(): array
    {
        return [
            new Channel('provisioning.' . $this->tenantId),
        ];
    }
 
    public function broadcastAs(): string
    {
        return 'provisioning.progress';
    }
}
