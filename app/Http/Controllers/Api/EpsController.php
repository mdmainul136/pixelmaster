<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EpsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EpsController extends Controller
{
    public function __construct(
        protected EpsService $eps
    ) {}

    /**
     * EPS Success Callback
     */
    public function success(Request $request)
    {
        $status = $request->get('response_status') ?? $request->get('status');
        $transactionId = $request->get('merchantTransactionId');

        if ($status === 'success' || (int)$status === 1) {
            try {
                // Verify with server for safety
                $verification = $this->eps->checkStatus($transactionId);
                
                if (isset($verification['success']) && $verification['success'] === true) {
                    // Payment Verified
                    return redirect()->route('eps.complete', [
                        'status' => 'success',
                        'orderID' => $verification['CustomerOrderId'] ?? $transactionId
                    ]);
                }
                
                return redirect()->route('eps.complete', ['status' => 'fail', 'message' => 'Verification Failed']);
            } catch (\Exception $e) {
                Log::error('EPS Success Callback Error: ' . $e->getMessage());
                return redirect()->route('eps.complete', ['status' => 'error', 'message' => 'Internal Verification Error']);
            }
        }

        return redirect()->route('eps.complete', ['status' => 'fail', 'message' => 'Payment status: ' . $status]);
    }

    /**
     * EPS Fail Callback
     */
    public function fail(Request $request)
    {
        return redirect()->route('eps.complete', [
            'status' => 'fail',
            'message' => $request->get('errorMessage') ?? 'Transaction Failed'
        ]);
    }

    /**
     * Redirect to frontend
     */
    public function complete(Request $request)
    {
        // For Next.js Frontend redirection ideally
        $status = $request->get('status');
        $orderID = $request->get('orderID');
        $message = $request->get('message');

        // Assuming fixed URL or dynamic from tenant
        $baseUrl = config('app.frontend_url') ?? 'http://localhost:3000';
        
        return redirect()->away($baseUrl . "/ecommerce/checkout/status?pg=eps&status=$status&orderID=$orderID&message=" . urlencode($message));
    }
}
