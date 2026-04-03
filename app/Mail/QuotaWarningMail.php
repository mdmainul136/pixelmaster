<?php

namespace App\Mail;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email notification for database quota warnings.
 * 
 * Levels:
 *   - 'critical': 90-99% usage â€” upgrade recommended
 *   - 'blocked':  100%+ usage  â€” writes disabled, immediate action needed
 */
class QuotaWarningMail extends Mailable
{
    use Queueable, SerializesModels;

    public Tenant $tenant;
    public string $level;
    public float $usagePercent;
    public float $usageGb;
    public float $limitGb;

    public function __construct(Tenant $tenant, string $level, float $usagePercent, float $usageGb, float $limitGb)
    {
        $this->tenant = $tenant;
        $this->level = $level;
        $this->usagePercent = round($usagePercent, 1);
        $this->usageGb = round($usageGb, 3);
        $this->limitGb = $limitGb;
    }

    public function envelope(): Envelope
    {
        $subject = $this->level === 'blocked'
            ? 'ðŸš« URGENT: Your database has reached capacity â€” writes disabled'
            : 'âš ï¸ Database storage alert â€” approaching capacity';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.quota-warning',
            with: [
                'tenantName' => $this->tenant->tenant_name,
                'tenantId' => $this->tenant->id,
                'level' => $this->level,
                'usagePercent' => $this->usagePercent,
                'usageGb' => $this->usageGb,
                'limitGb' => $this->limitGb,
                'plan' => $this->tenant->plan ?? 'free',
                'upgradeUrl' => 'http://' . $this->tenant->domain . '/settings/billing',
            ],
        );
    }
}

