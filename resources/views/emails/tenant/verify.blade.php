@component('mail::message')
# Verify Your Email Address

Hi there,

Your workspace **{{ $tenantName }}** has been created successfully! Before you can log in, please verify your email address using the code below.

<div style="text-align: center; margin: 30px 0;">
    <div style="background: #f4f4f7; border-radius: 8px; padding: 20px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #2d3748; font-family: monospace;">
        {{ $verificationCode }}
    </div>
</div>

**This code expires in {{ $expiryMinutes }} minutes.**

Simply enter this code on the verification page to activate your account and start using your workspace.

@component('mail::button', ['url' => $dashboardUrl])
Go to Verification Page
@endcomponent

**Your Account Details:**
- **Email:** {{ $adminEmail }}
- **Workspace:** {{ $tenantName }}

If you didn't create this account, you can safely ignore this email.

Thanks,<br>
The {{ config('app.name') }} Team
@endcomponent
