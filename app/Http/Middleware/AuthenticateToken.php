<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateToken
{
    /**
     * Handle an incoming request.
     *
     * Validates a JWT-style token sent as:
     *   Authorization: Bearer <token>
     *   OR ?token=<token> query param
     *
     * Token format: base64url(header).base64url(payload).base64url(signature)
     * Signature:    HMAC-SHA256(header + "." + payload, APP_KEY)
     *
     * Fix applied: use URL-safe base64 (no padding, +→-, /→_) for all
     * encode/decode operations — matching how the frontend generates tokens.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?: $request->query('token');

        if (!$token || $token === 'undefined' || $token === 'null') {
            return $this->unauthorized('No token provided');
        }

        try {
            $parts = explode('.', $token);

            if (count($parts) !== 3) {
                \Log::error("AuthToken: Malformed token segments: " . count($parts), ['token_start' => substr($token, 0, 10)]);
                throw new \Exception('Invalid token format — check if you are logged in');
            }

            [$header, $payload, $signature] = $parts;

            // ── Verify Signature ──────────────────────────────────────────────
            // CRITICAL FIX: use base64url (URL-safe, no padding) to match frontend
            $expectedSignature = $this->base64urlEncode(
                hash_hmac('sha256', "{$header}.{$payload}", config('app.key'), true)
            );

            if (!hash_equals($expectedSignature, $signature)) {
                throw new \Exception('Invalid token signature');
            }

            // ── Decode Payload ────────────────────────────────────────────────
            $payloadJson = $this->base64urlDecode($payload);
            $payloadData = json_decode($payloadJson, true);

            if (!is_array($payloadData)) {
                throw new \Exception('Invalid token payload — cannot decode JSON');
            }

            // ── Check Expiration ──────────────────────────────────────────────
            if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
                throw new \Exception('Token expired');
            }

            // ── Tenant Isolation Check ────────────────────────────────────────
            $tokenTenantId     = $payloadData['tenantId']     ?? $payloadData['tenant_id'] ?? null;
            $identifiedTenantId = $request->attributes->get('tenant_id');

            if ($identifiedTenantId && $tokenTenantId && (string) $identifiedTenantId !== (string) $tokenTenantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - Access denied for this tenant',
                    'debug'   => config('app.debug') ? [
                        'token_tenant' => $tokenTenantId,
                        'url_tenant'   => $identifiedTenantId,
                    ] : null,
                ], 403);
            }

            // ── Attach to Request ─────────────────────────────────────────────
            $request->merge([
                'user_id'         => $payloadData['id']       ?? $payloadData['user_id'] ?? null,
                'token_tenant_id' => $tokenTenantId,
                'token_role'      => $payloadData['role']     ?? null,
                'token_email'     => $payloadData['email']    ?? null,
            ]);

            return $next($request);

        } catch (\Exception $e) {
            return $this->unauthorized('Invalid token', $e->getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // URL-safe Base64 Helpers (RFC 4648 §5)
    // Standard base64 breaks in URLs (+→%2B, /→%2F, =→%3D).
    // JWT uses the URL-safe variant: no padding, + → -, / → _
    // ─────────────────────────────────────────────────────────────────────────

    private function base64urlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64urlDecode(string $data): string
    {
        // Add back padding if needed
        $padded = str_pad(strtr($data, '-_', '+/'), strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + (4 - strlen($data) % 4), '=');
        return base64_decode($padded);
    }

    private function unauthorized(string $message, ?string $detail = null): Response
    {
        return response()->json([
            'success' => false,
            'message' => "Unauthorized - {$message}",
            'error'   => config('app.debug') ? $detail : null,
        ], 401);
    }
}
