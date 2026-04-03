<?php

namespace App\Helpers;

/**
 * TotpHelper
 * 
 * A minimal TOTP implementation to avoid external dependencies.
 * Follows RFC 6238 and RFC 4226.
 */
class TotpHelper
{
    /**
     * Generate a new 32-character Base32 secret key.
     */
    public static function generateSecret(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < 32; $i++) {
            $secret .= $chars[random_int(0, 31)];
        }
        return $secret;
    }

    /**
     * Verify a TOTP code against a secret.
     */
    public static function verify(string $secret, string $code, int $discrepancy = 1): bool
    {
        $currentTime = time();
        $timeWindow = floor($currentTime / 30);

        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            if (self::calculateCode($secret, $timeWindow + $i) === $code) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate the QR code provisioning URI.
     */
    public static function getQrCodeUrl(string $label, string $secret, string $issuer): string
    {
        return "otpauth://totp/" . rawurlencode($issuer) . ":" . rawurlencode($label) . "?secret=" . $secret . "&issuer=" . rawurlencode($issuer);
    }

    /**
     * Calculate the TOTP code for a given secret and counter.
     */
    private static function calculateCode(string $secret, int $counter): string
    {
        $binarySecret = self::base32Decode($secret);
        
        // Counter as 8-byte binary
        $binCounter = pack('N*', 0) . pack('N*', $counter);
        
        $hash = hash_hmac('sha1', $binCounter, $binarySecret, true);
        
        $offset = ord($hash[19]) & 0xf;
        $binary = (
            (ord($hash[$offset]) & 0x7f) << 24 |
            (ord($hash[$offset + 1]) & 0xff) << 16 |
            (ord($hash[$offset + 2]) & 0xff) << 8 |
            (ord($hash[$offset + 3]) & 0xff)
        );
        
        $code = $binary % 1000000;
        return str_pad((string)$code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Micro Base32 decoder.
     */
    private static function base32Decode(string $base32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32 = strtoupper($base32);
        $result = '';
        $buffer = 0;
        $bufferBits = 0;

        for ($i = 0; $i < strlen($base32); $i++) {
            $val = strpos($alphabet, $base32[$i]);
            if ($val === false) continue;

            $buffer = ($buffer << 5) | $val;
            $bufferBits += 5;

            if ($bufferBits >= 8) {
                $bufferBits -= 8;
                $result .= chr(($buffer >> $bufferBits) & 0xFF);
            }
        }

        return $result;
    }
}
