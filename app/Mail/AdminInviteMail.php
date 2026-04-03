<?php

namespace App\Mail;

use App\Models\SuperAdminInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invitation;

    /**
     * Create a new message instance.
     */
    public function __construct(SuperAdminInvitation $invitation)
    {
        $this->invitation = $invitation;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Platform Admin Invitation - Zosair',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $url = config('app.frontend_url') . '/users/accept/' . $this->invitation->token;

        return new Content(
            markdown: 'emails.admin_invite',
            with: [
                'url' => $url,
                'role' => $this->invitation->role->display_name,
            ],
        );
    }
}
