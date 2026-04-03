<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalInsightNotification extends Notification
{
    use Queueable;

    private array $insight;
    private string $containerName;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $insight, string $containerName)
    {
        $this->insight = $insight;
        $this->containerName = $containerName;
    }

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
        return (new MailMessage)
            ->subject('CRITICAL: Tracking Issue Detected - ' . $this->containerName)
            ->greeting('Hello, ' . $notifiable->name)
            ->line('Our AI Strategic Advisor has detected a critical issue with your sGTM tracking setup that requires immediate attention.')
            ->line('**Issue:** ' . $this->insight['title'])
            ->line('**Impact:** ' . $this->insight['message'])
            ->action('Fix Issue Now', url($this->insight['action_link']))
            ->line('Maintaining a high Match Quality (EMQ) is essential for accurate attribution and ROI optimization.')
            ->line('Thank you for using PixelMaster!');
    }

    /**
     * Get the array representation of the notification for database.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'        => $this->insight['title'],
            'message'      => $this->insight['message'],
            'severity'     => $this->insight['severity'],
            'container'    => $this->containerName,
            'action_link'  => $this->insight['action_link'],
        ];
    }
}
