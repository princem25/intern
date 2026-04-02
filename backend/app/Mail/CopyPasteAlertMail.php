<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CopyPasteAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $intern,
        public int $pasteCount,
        public ?User $task = null,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🚨 Copy-Paste Alert: {$this->intern->name} attempted to paste code {$this->pasteCount} times",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.copy-paste-alert',
            with: [
                'internName' => $this->intern->name,
                'internEmail' => $this->intern->email,
                'pasteCount' => $this->pasteCount,
                'time' => now()->format('Y-m-d H:i:s'),
            ],
        );
    }
}
