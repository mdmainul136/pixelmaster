<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\bKashService;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class bKashController extends Controller
{
    public function __construct(
        protected bKashService $bkash
    ) {}

    /**
     * bKash Callback
     */
    public function callback(Request $request)
    {
        $status = $request->get('status');
        $paymentID = $request->get('paymentID');

        if ($status === 'success') {
            try {
                $response = $this->bkash->executePayment($paymentID);
                
                if (isset($response['statusCode']) && $response['statusCode'] === '0000') {
                    // Payment Successful
                    return redirect()->route('bkash.success', ['paymentID' => $paymentID]);
                }
                
                return redirect()->route('bkash.fail', ['message' => $response['statusMessage'] ?? 'Execution Failed']);
            } catch (\Exception $e) {
                Log::error('bKash Callback Error: ' . $e->getMessage());
                return redirect()->route('bkash.fail', ['message' => 'Internal Error']);
            }
        }

        return redirect()->route('bkash.fail', ['message' => 'Payment ' . $status]);
    }

    public function success(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Payment completed successfully',
            'paymentID' => $request->paymentID
        ]);
    }

    public function fail(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => $request->message ?? 'Payment failed'
        ], 400);
    }
}
