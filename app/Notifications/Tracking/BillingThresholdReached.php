<?php

namespace App\Notifications\Tracking;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * BillingThresholdReached
 *
 * Fired by BillingAlertService when a container hits 80% or 100% of quota.
 * Sends email + database (in-app) notification to the tenant.
 */
class BillingThresholdReached extends Notification
{
    use Queueable;

    public function __construct(
        public readonly TrackingContainer $container,
        public readonly int    $percentage,
        public readonly int    $usage,
        public readonly int    $limit,
        public readonly string $tier,
    ) {}

    public function via(mixed $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $isCritical = $this->percentage >= 100;
        $subject    = $isCritical
            ? "⚠️ Event quota exceeded — {$this->container->name}"
            : "📊 {$this->percentage}% of event quota used — {$this->container->name}";

        $usageFormatted = number_format($this->usage);
        $limitFormatted = number_format($this->limit);

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name},")
            ->line("Your container **{$this->container->name}** has used **{$this->percentage}%** of its monthly event quota.")
            ->line("Usage: {$usageFormatted} / {$limitFormatted} events (Plan: **{$this->tier}**)");

        if ($isCritical) {
            $message->line("**New events are now being dropped.** Please upgrade your plan to continue tracking.");
        } else {
            $message->line("You have " . number_format($this->limit - $this->usage) . " events remaining this month.");
        }

        return $message
            ->action('View Dashboard', url("/tracking"))
            ->line("Upgrade your plan to avoid interruptions.");
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'type'         => 'billing_alert',
            'container_id' => $this->container->id,
            'container'    => $this->container->name,
            'percentage'   => $this->percentage,
            'usage'        => $this->usage,
            'limit'        => $this->limit,
            'tier'         => $this->tier,
            'is_critical'  => $this->percentage >= 100,
        ];
    }
}
