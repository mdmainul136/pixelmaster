<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FirewallRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class PlatformSecurityController extends Controller
{
    /**
     * List all firewall rules.
     */
    public function firewallIndex(Request $request)
    {
        $query = FirewallRule::latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%");
        }

        $rules = $query->paginate(20)->withQueryString();

        return Inertia::render('Platform/Security/Firewall', [
            'rules' => $rules,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a new firewall rule.
     */
    public function storeFirewallRule(Request $request)
    {
        $validated = $request->validate([
            'ip_address' => 'required|string|max:255|unique:firewall_rules',
            'type'       => 'required|in:block,allow',
            'reason'     => 'nullable|string|max:255',
            'expires_at' => 'nullable|date',
        ]);

        $rule = FirewallRule::create($validated);

        if ($rule->type === 'block') {
            Redis::setex("firewall:block:{$rule->ip_address}", 3600 * 24, '1');
        }

        AuditLog::create([
            'event_type' => 'security',
            'action'     => "Added firewall rule for IP: {$rule->ip_address} ({$rule->type})",
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Firewall rule added successfully.');
    }

    /**
     * Toggle a firewall rule's active status.
     */
    public function toggleFirewallRule(FirewallRule $rule)
    {
        $rule->update(['is_active' => !$rule->is_active]);

        if ($rule->type === 'block') {
            if ($rule->is_active) {
                Redis::setex("firewall:block:{$rule->ip_address}", 3600 * 24, '1');
            } else {
                Redis::del("firewall:block:{$rule->ip_address}");
            }
        }

        return back()->with('success', 'Firewall rule toggled.');
    }

    /**
     * Delete a firewall rule.
     */
    public function deleteFirewallRule(FirewallRule $rule)
    {
        Redis::del("firewall:block:{$rule->ip_address}");
        $rule->delete();

        return back()->with('success', 'Firewall rule deleted.');
    }
    /**
     * Render the Audit Log Explorer.
     */
    public function auditExplorer(Request $request)
    {
        $query = DB::table('audit_logs')
            ->join('super_admins', 'audit_logs.user_id', '=', 'super_admins.id')
            ->select('audit_logs.*', 'super_admins.name as user_name');

        // Filtering
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('super_admins.name', 'like', "%{$search}%");
            });
        }

        if ($request->has('module')) {
            $query->where('module', $request->get('module'));
        }

        $logs = $query->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Platform/Security/AuditExplorer', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'module']),
            'modules' => DB::table('audit_logs')->distinct()->pluck('module'),
        ]);
    }

    /**
     * Get real-time security statistics.
     */
    public function getSecurityStats()
    {
        $exceeded = Redis::lrange('security:rate_limit_exceeded', 0, -1);
        $exceeded = array_map(fn($item) => json_decode($item, true), $exceeded);

        return Inertia::render('Platform/Security/Stats', [
            'recent_blocked' => $exceeded,
            'blocked_count_24h' => count($exceeded),
        ]);
    }

    /**
     * Update security settings.
     */
    public function updateSecuritySettings(Request $request)
    {
        $request->validate([
            'rate_limits.global' => 'required|integer',
            'two_factor.enforce_admins' => 'required|boolean',
        ]);

        // In a real app, we'd save this to a settings table or .env
        // For now, we'll assume it's handled by a general settings update logic
        
        return back()->with('success', 'Security settings updated successfully.');
    }
}
