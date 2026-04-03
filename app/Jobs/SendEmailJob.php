<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\Email\EmailConfigResolver;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60; // Retry after 60 seconds

    public function __construct(
        public string  $tenantId,
        public string  $to,
        public string  $subject,
        public string  $htmlBody,
        public ?int    $campaignId = null,
        public array   $metadata = [],
        public ?string $fromEmailOverride = null,
        public ?string $fromNameOverride = null,
    ) {
        $this->onQueue('email');
    }

    public function handle(EmailConfigResolver $resolver): void
    {
        // Check if tenant can still send
        if (!$resolver->canSend($this->tenantId)) {
            Log::warning("[Email] Tenant {$this->tenantId} exceeded daily send limit. Job re-queued.");
            $this->release(300); // Retry in 5 minutes
            return;
        }

        $context = $resolver->getSendContext($this->tenantId);
        $to = $this->to;
        $subject = $this->subject;
        $htmlBody = $this->htmlBody;
        $fromEmail = $this->fromEmailOverride ?? $context['from_email'];
        $fromName = $this->fromNameOverride ?? $context['from_name'];
        $replyTo = $context['reply_to'];

        Mail::html($htmlBody, function ($message) use ($to, $subject, $fromEmail, $fromName, $replyTo) {
            $message->to($to)
                ->subject($subject)
                ->from($fromEmail, $fromName);
            
            if ($replyTo) {
                $message->replyTo($replyTo);
            }
        });

        // Log the email (simplified log for now, actual implementation might need more tracking)
        \App\Models\EmailLog::create([
            'tenant_id'   => $this->tenantId,
            'to_email'    => $this->to,
            'from_email'  => $fromEmail,
            'subject'     => $this->subject,
            'status'      => 'sent',
            'campaign_id' => $this->campaignId,
            'metadata'    => $this->metadata,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("[Email] SendEmailJob failed for tenant {$this->tenantId} → {$this->to}: " . $exception->getMessage());
    }
}
