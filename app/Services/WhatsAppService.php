<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $apiUrl;
    protected $apiKey;
    protected $fromNumber;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.url');
        $this->apiKey = config('services.whatsapp.key');
        $this->fromNumber = config('services.whatsapp.from');
    }

    /**
     * Send a template message (e.g., Order Confirmation).
     */
    public function sendTemplateMessage($to, $templateName, $parameters = [])
    {
        if (app()->environment('local') || config('services.whatsapp.mock')) {
            Log::info("MOCK WHATSAPP: Sending template '{$templateName}' to {$to}", $parameters);
            return true;
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->post("{$this->apiUrl}/messages", [
                    'from' => $this->fromNumber,
                    'to' => $to,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => ['code' => 'en'],
                        'components' => [
                            [
                                'type' => 'body',
                                'parameters' => $this->formatParameters($parameters)
                            ]
                        ]
                    ]
                ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("WhatsApp Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Shortcut for points earned notification.
     */
    public function sendPointsEarnedMessage($to, $points, $balance)
    {
        return $this->sendTemplateMessage($to, 'points_earned', [
            $points,
            $balance
        ]);
    }

    /**
     * Shortcut for tier upgrade notification.
     */
    public function sendTierUpgradeMessage($to, $tierName)
    {
        return $this->sendTemplateMessage($to, 'tier_upgrade', [
            $tierName
        ]);
    }

    /**
     * Shortcut for shipment status updates.
     */
    public function sendShipmentUpdate($to, $trackingNumber, $status)
    {
        return $this->sendTemplateMessage($to, 'shipment_update', [
            $trackingNumber,
            $status
        ]);
    }

    /**
     * Shortcut for initial shipment dispatch.
     */
    public function sendShipmentDispatched($to, $trackingNumber, $courierName)
    {
        return $this->sendTemplateMessage($to, 'shipment_dispatched', [
            $trackingNumber,
            $courierName
        ]);
    }

    protected function formatParameters($params)
    {
        return array_map(function($p) {
            return ['type' => 'text', 'text' => (string)$p];
        }, $params);
    }
}
