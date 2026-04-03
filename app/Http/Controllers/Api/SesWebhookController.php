<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\EmailLog;
use App\Models\Ecommerce\Customer;

/**
 * Handles Amazon SES SNS notifications for bounces, complaints, and deliveries.
 *
 * Setup:
 * 1. Create an SNS topic in AWS
 * 2. In SES → Configuration Set → Event destinations → Add SNS topic
 * 3. Subscribe this webhook URL to the SNS topic
 * 4. Events: Bounce, Complaint, Delivery
 */
class SesWebhookController
{
    /**
     * POST /api/webhooks/ses
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        if (!$payload) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Handle SNS subscription confirmation
        if (isset($payload['Type']) && $payload['Type'] === 'SubscriptionConfirmation') {
            return $this->confirmSubscription($payload);
        }

        // Process the actual SES notification
        if (isset($payload['Type']) && $payload['Type'] === 'Notification') {
            $message = json_decode($payload['Message'] ?? '{}', true);
            $notificationType = $message['notificationType'] ?? $message['eventType'] ?? null;

            switch ($notificationType) {
                case 'Bounce':
                    return $this->handleBounce($message);
                case 'Complaint':
                    return $this->handleComplaint($message);
                case 'Delivery':
                    return $this->handleDelivery($message);
                default:
                    Log::info("[SES Webhook] Unknown notification type: {$notificationType}");
            }
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Confirm SNS topic subscription.
     */
    protected function confirmSubscription(array $payload): JsonResponse
    {
        $subscribeUrl = $payload['SubscribeURL'] ?? null;

        if ($subscribeUrl) {
            // Confirm by visiting the URL
            file_get_contents($subscribeUrl);
            Log::info("[SES Webhook] SNS subscription confirmed.");
        }

        return response()->json(['status' => 'subscription_confirmed']);
    }

    /**
     * Handle bounce notification.
     * → Mark email as invalid in customers table
     * → Update email log
     */
    protected function handleBounce(array $message): JsonResponse
    {
        $bounce     = $message['bounce'] ?? [];
        $bounceType = $bounce['bounceType'] ?? 'Undetermined';       // Permanent, Transient
        $recipients = $bounce['bouncedRecipients'] ?? [];
        $mail       = $message['mail'] ?? [];
        $messageId  = $mail['messageId'] ?? null;

        foreach ($recipients as $recipient) {
            $email = $recipient['emailAddress'] ?? null;
            if (!$email) continue;

            Log::warning("[SES] Bounce ({$bounceType}): {$email}");

            // Update email log
            if ($messageId) {
                EmailLog::where('ses_message_id', $messageId)
                    ->where('to_email', $email)
                    ->update([
                        'status'      => 'bounced',
                        'bounce_type' => $bounceType,
                        'bounced_at'  => now(),
                    ]);
            }

            // For permanent bounces, mark email as invalid across all tenants
            if ($bounceType === 'Permanent') {
                $this->markEmailInvalid($email);
            }
        }

        return response()->json(['status' => 'bounce_processed']);
    }

    /**
     * Handle complaint notification (spam report).
     * → Auto-unsubscribe the customer
     * → Update email log
     */
    protected function handleComplaint(array $message): JsonResponse
    {
        $complaint     = $message['complaint'] ?? [];
        $complaintType = $complaint['complaintFeedbackType'] ?? 'unknown';
        $recipients    = $complaint['complainedRecipients'] ?? [];
        $mail          = $message['mail'] ?? [];
        $messageId     = $mail['messageId'] ?? null;

        foreach ($recipients as $recipient) {
            $email = $recipient['emailAddress'] ?? null;
            if (!$email) continue;

            Log::warning("[SES] Complaint ({$complaintType}): {$email}");

            // Update email log
            if ($messageId) {
                EmailLog::where('ses_message_id', $messageId)
                    ->where('to_email', $email)
                    ->update([
                        'status'         => 'complained',
                        'complaint_type' => $complaintType,
                        'complained_at'  => now(),
                    ]);
            }

            // Auto-unsubscribe customer from marketing
            $this->unsubscribeCustomer($email);
        }

        return response()->json(['status' => 'complaint_processed']);
    }

    /**
     * Handle delivery confirmation.
     * → Update email log status to delivered
     */
    protected function handleDelivery(array $message): JsonResponse
    {
        $delivery   = $message['delivery'] ?? [];
        $recipients = $delivery['recipients'] ?? [];
        $mail       = $message['mail'] ?? [];
        $messageId  = $mail['messageId'] ?? null;

        if ($messageId) {
            foreach ($recipients as $email) {
                EmailLog::where('ses_message_id', $messageId)
                    ->where('to_email', $email)
                    ->update([
                        'status'       => 'delivered',
                        'delivered_at' => now(),
                    ]);
            }
        }

        return response()->json(['status' => 'delivery_processed']);
    }

    /**
     * Mark an email address as invalid in customers table.
     * Called on permanent bounces.
     */
    protected function markEmailInvalid(string $email): void
    {
        try {
            Customer::where('email', $email)->update([
                'email_valid' => false,
            ]);
            Log::info("[SES] Marked {$email} as invalid (permanent bounce).");
        } catch (\Exception $e) {
            // Column might not exist yet — just log
            Log::warning("[SES] Could not mark {$email} as invalid: " . $e->getMessage());
        }
    }

    /**
     * Auto-unsubscribe a customer from marketing emails.
     * Called on complaints (spam reports).
     */
    protected function unsubscribeCustomer(string $email): void
    {
        try {
            Customer::where('email', $email)->update([
                'marketing_opt_in' => false,
            ]);
            Log::info("[SES] Auto-unsubscribed {$email} (complaint).");
        } catch (\Exception $e) {
            Log::warning("[SES] Could not unsubscribe {$email}: " . $e->getMessage());
        }
    }
}
