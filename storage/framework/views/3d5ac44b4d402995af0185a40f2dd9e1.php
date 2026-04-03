<?php $__env->startComponent('mail::message'); ?>
# 🎉 Welcome to <?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?>!

Hi <?php echo new \Illuminate\Support\EncodedHtmlString($tenantName); ?>,

We're thrilled to have you on board! Your workspace has been successfully provisioned and is ready for you to explore.

---

## Your Workspace Details

<?php $__env->startComponent('mail::table'); ?>
| Detail | Value |
|:-------|:------|
| **Dashboard URL** | [<?php echo new \Illuminate\Support\EncodedHtmlString($url); ?>](<?php echo new \Illuminate\Support\EncodedHtmlString($url); ?>) |
| **Admin Email** | <?php echo new \Illuminate\Support\EncodedHtmlString($adminEmail); ?> |
<?php echo $__env->renderComponent(); ?>

---

## Get Started in 3 Steps

**1. Log in to your dashboard** — Access your workspace and explore the features available to you.

**2. Configure your modules** — Activate and customize the modules that best fit your business needs.

**3. Invite your team** — Add team members and assign roles to start collaborating.

<?php $__env->startComponent('mail::button', ['url' => $url, 'color' => 'primary']); ?>
🚀 Go to My Dashboard
<?php echo $__env->renderComponent(); ?>

---

## Need Help?

Our support team is here to assist you. Simply reply to this email or visit our help center for guides and tutorials.

Thanks for choosing <?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?>!<br>
The <?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?> Team
<?php echo $__env->renderComponent(); ?>
<?php /**PATH E:\Mern Stact Dev\pixelmastersgtm\resources\views/emails/tenant/welcome.blade.php ENDPATH**/ ?>