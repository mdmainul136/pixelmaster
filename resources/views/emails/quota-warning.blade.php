@component('mail::message')

@if($level === 'blocked')
# 🚫 Database Storage Full

Your database for **{{ $tenantName }}** has reached **{{ $usagePercent }}%** capacity ({{ $usageGb }} GB / {{ $limitGb }} GB).

**Write operations have been temporarily disabled** to protect your data. Read operations continue to work normally.

@component('mail::panel')
**Immediate action required:** Upgrade your plan or free up storage to restore write access.
@endcomponent

@else
# ⚠️ Storage Alert

Your database for **{{ $tenantName }}** is at **{{ $usagePercent }}%** capacity ({{ $usageGb }} GB / {{ $limitGb }} GB).

If storage reaches 100%, write operations will be automatically disabled.

@component('mail::panel')
**Recommended:** Upgrade your plan or clean up unused data before reaching capacity.
@endcomponent

@endif

| | |
|---|---|
| **Tenant** | {{ $tenantId }} |
| **Current Plan** | {{ ucfirst($plan) }} |
| **Usage** | {{ $usageGb }} GB / {{ $limitGb }} GB |
| **Capacity** | {{ $usagePercent }}% |

@component('mail::button', ['url' => $upgradeUrl, 'color' => $level === 'blocked' ? 'error' : 'primary'])
{{ $level === 'blocked' ? 'Upgrade Now' : 'Manage Storage' }}
@endcomponent

If you need a custom plan with higher limits, please contact our support team.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
