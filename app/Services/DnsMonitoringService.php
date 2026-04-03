<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DnsMonitoringService
{
    /**
     * Resolvers to check against for global propagation.
     */
    protected array $resolvers = [
        'Google'     => 'https://dns.google/resolve',
        'Cloudflare' => 'https://cloudflare-dns.com/dns-query',
        'Quad9'      => 'https://dns.quad9.net:5053/dns-query'
    ];

    /**
     * Check if an A record has propagated across major resolvers.
     *
     * @param string $domain The domain to check
     * @param string $expectedIp The expected IP address
     * @return array Status map for each resolver
     */
    public function checkPropagation(string $domain, string $expectedIp): array
    {
        $status = [];
        $domain = trim($domain);

        foreach ($this->resolvers as $name => $url) {
            $status[$name] = $this->queryResolver($url, $domain, 'A', $expectedIp);
        }

        return [
            'domain'       => $domain,
            'expected_ip'  => $expectedIp,
            'is_propagated'=> count(array_filter($status)) === count($this->resolvers),
            'propagation'  => $status,
            'checked_at'   => now()->toIso8601String()
        ];
    }

    /**
     * Check if a CNAME record has propagated.
     *
     * @param string $domain The domain/subdomain to check
     * @param string $expectedTarget The expected CNAME target
     * @return array Status map for each resolver
     */
    public function checkCnamePropagation(string $domain, string $expectedTarget): array
    {
        $status = [];
        $domain = trim($domain);
        $expectedTarget = trim($expectedTarget, '.');

        foreach ($this->resolvers as $name => $url) {
            $status[$name] = $this->queryResolver($url, $domain, 'CNAME', $expectedTarget);
        }

        return [
            'domain'          => $domain,
            'expected_target' => $expectedTarget,
            'is_propagated'   => count(array_filter($status)) === count($this->resolvers),
            'propagation'     => $status,
            'checked_at'      => now()->toIso8601String()
        ];
    }

    /**
     * Internal query wrapper for DNS-over-HTTPS.
     */
    protected function queryResolver(string $resolverUrl, string $domain, string $type, string $expectedValue): bool
    {
        try {
            $response = Http::withHeaders(['accept' => 'application/dns-json'])
                ->get($resolverUrl, [
                    'name' => $domain,
                    'type' => $type
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['Answer'])) {
                    foreach ($data['Answer'] as $answer) {
                        // Some endpoints return trailing dots for domains (e.g. CNAMEs)
                        $answerValue = trim($answer['data'], '.');
                        if (str_contains($answerValue, $expectedValue)) {
                            return true;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning("DNS Query to {$resolverUrl} failed for {$domain}: " . $e->getMessage());
        }

        return false;
    }
}
