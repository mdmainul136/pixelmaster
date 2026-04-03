<?php

namespace App\Mail;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SgtmQuotaAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     * 
     * @param Tenant $tenant
     * @param string $level (warning|suspended)
     * @param int $usage
     * @param int $limit
     */
    public function __construct(
        public Tenant $tenant,
        public string $level,
        public int $usage,
        public int $limit
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->level === 'suspended'
            ? '🚫 sGTM Account Suspended: Event Limit Exceeded'
            : '⚠️ sGTM Usage Warning: Approaching Event Limit';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.sgtm-quota-alert',
            with: [
                'tenantName'   => $this->tenant->tenant_name,
                'usage'        => number_format($this->usage),
                'limit'        => number_format($this->limit),
                'usagePercent' => round(($this->usage / $this->limit) * 100, 1),
                'isSuspended'  => $this->level === 'suspended',
                'upgradeUrl'   => 'https://' . $this->tenant->domain . '/settings/billing',
            ],
        );
    }
}
