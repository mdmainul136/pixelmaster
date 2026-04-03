<?php

namespace App\Modules\Tracking\Notifications;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DomainVerified extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected TrackingContainer $container,
        protected string $domain
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $transportUrl = "https://{$this->domain}";

        return (new MailMessage)
            ->subject('🚀 Your Tracking Domain is Live! - ' . $this->domain)
            ->greeting('Great news, ' . ($notifiable->admin_name ?? 'User') . '!')
            ->line("Your custom tracking domain **{$this->domain}** has been successfully verified and is now active.")
            ->line("Your sGTM container **{$this->container->name}** is now fully operational with first-party tracking capabilities.")
            ->line("Transport URL: **{$transportUrl}**")
            ->action('Get Tracking Snippet', url('/platform/tracking/containers'))
            ->line('SSL certificates have been issued and are protecting your data stream.')
            ->line('Next Step: Update your Web GTM container settings with this new Transport URL to start bypassing adblockers.')
            ->line('Thank you for choosing PixelMasters sGTM!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'domain_verified',
            'container_id' => $this->container->id,
            'container_name' => $this->container->name,
            'domain'       => $this->domain,
            'message'      => "Tracking domain {$this->domain} verified for container {$this->container->name}",
        ];
    }
}
