<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $tenantName,
        public string $adminEmail,
        public string $verificationCode,
        public string $dashboardUrl,
        public int $expiryMinutes = 30
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your Email — ' . $this->tenantName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tenant.verify',
            with: [
                'tenantName'       => $this->tenantName,
                'adminEmail'       => $this->adminEmail,
                'verificationCode' => $this->verificationCode,
                'dashboardUrl'     => $this->dashboardUrl,
                'expiryMinutes'    => $this->expiryMinutes,
            ],
        );
    }
}
