@component('mail::message')
# 🎉 Welcome to {{ config('app.name') }}!

Hi {{ $tenantName }},

We're thrilled to have you on board! Your workspace has been successfully provisioned and is ready for you to explore.

---

## Your Workspace Details

@component('mail::table')
| Detail | Value |
|:-------|:------|
| **Dashboard URL** | [{{ $url }}]({{ $url }}) |
| **Admin Email** | {{ $adminEmail }} |
@endcomponent

---

## Get Started in 3 Steps

**1. Log in to your dashboard** — Access your workspace and explore the features available to you.

**2. Configure your modules** — Activate and customize the modules that best fit your business needs.

**3. Invite your team** — Add team members and assign roles to start collaborating.

@component('mail::button', ['url' => $url, 'color' => 'primary'])
🚀 Go to My Dashboard
@endcomponent

---

## Need Help?

Our support team is here to assist you. Simply reply to this email or visit our help center for guides and tutorials.

Thanks for choosing {{ config('app.name') }}!<br>
The {{ config('app.name') }} Team
@endcomponent
