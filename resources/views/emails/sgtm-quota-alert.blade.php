<x-mail::message>
# sGTM Infrastructure Alert: {{ $isSuspended ? 'Account Suspended' : 'Usage Warning' }}

Dear {{ $tenantName }},

We are writing to inform you about your current sGTM (Server-side Google Tag Manager) event usage for the current billing cycle.

<x-mail::panel>
**Current Usage:** {{ $usage }} events  
**Monthly Limit:** {{ $limit }} events  
**Utilization:** {{ $usagePercent }}%
</x-mail::panel>

@if($isSuspended)
## 🚫 Account Paused
Your account has reached **{{ $usagePercent }}%** of its monthly event quota. To prevent excessive infrastructure costs, your tracking containers have been temporarily **suspended**.

**What happens now?**
- Tracking requests to your custom domains will return a 503 Service Unavailable error.
- Event data is not being processed or dispatched to your marketing destinations (GA4, CAPI, etc.).
@else
## ⚠️ Approaching Limit
Your account is currently at **{{ $usagePercent }}%** of its monthly event quota. If you reach 110% of your limit, your infrastructure will be automatically paused to avoid unexpected overage charges.
@endif

### What should you do?
To ensure uninterrupted tracking and data collection, we recommend upgrading to a higher-tier plan that fits your current traffic volume.

<x-mail::button :url="$upgradeUrl" color="primary">
Upgrade My Plan Now
</x-mail::button>

If you believe this is an error or have questions about your usage, please contact our support team.

Thanks,<br>
{{ config('app.name') }} Infrastructure Team
</x-mail::message>
