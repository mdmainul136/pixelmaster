<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure 'central' connection uses sqlite during tests
        config([
            'database.connections.central.driver' => 'sqlite',
            'database.connections.central.database' => ':memory:',
        ]);
        \Illuminate\Support\Facades\DB::purge('central');
    }

    /**
     * Test global rate limiting for guest users.
     */
    public function test_global_rate_limiting_guest()
    {
        $limit = config('security.rate_limits.guest', 60);
        $ip = '127.0.0.1';

        // Clear existing attempts
        RateLimiter::clear("rate_limit:ip:$ip");

        // The limit is small enough to test quickly
        for ($i = 0; $i < $limit; $i++) {
            $response = $this->get('/platform/login');
            $response->assertStatus(200);
        }

        // The next one MUST fail with 429
        $response = $this->get('/platform/login');
        $response->assertStatus(429);
    }
}
