# Coolify MySQL Configuration Guide (Standard Setup)

আপনার Laravel Multi-tenant প্রজেক্টের জন্য Coolify-তে MySQL সেটআপ করার সঠিক এবং নিরাপদ পদ্ধতি নিচে দেওয়া হলো।

## ১. General Settings

*   **Image**: `mysql:8` (সবচেয়ে লেটেস্ট এবং স্ট্যাবল ভার্সন)।
*   **Initial Database**: `multi_tenant_main` (অথবা আপনার পছন্দমতো একটি নাম)।
*   **Root Password**: একটি শক্তিশালী পাসওয়ার্ড দিন এবং এটি কোথাও সেভ করে রাখুন।

## ২. User Configuration

*   **Normal User**: `central_user` (অথবা `mysql` ব্যবহার করতে পারেন)।
*   **Normal User Password**: একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।

## ৩. Network & Ports (গুরুত্বপূর্ণ)

প্রিভিয়াস কনফিগারেশনে আপনি **5432** (PostgreSQL এর পোর্ট) ব্যবহার করেছিলেন। এটি পরিবর্তন করে নিচের মতো করুন:

*   **Ports Mappings**: `3306:3306`
*   **Public Port**: `3306` (যাতে আপনার লোকাল ড্যাশবোর্ড বা Laravel অ্যাপ কানেক্ট হতে পারে)।

## ৪. Custom Docker Options

ডকার অপশনে অপ্রয়োজনীয় সিকিউরিটি রিস্ক এড়াতে নিচের ফিল্ডটি **ফাঁকা (Empty)** রাখুন:
*   **Custom Docker Options**: (Remove all current flags unless specifically required by your VPS provider).

## ৫. Laravel `.env` Configuration (Centeral DB)

আপনার Laravel অ্যাপের `.env` ফাইলে এই তথ্যগুলো এভাবে কানেক্ট করবেন:

```env
DB_CONNECTION=mysql
DB_HOST=আপনার_সার্ভার_আইপি_অথবা_হোস্ট
DB_PORT=3306
DB_DATABASE=multi_tenant_main
DB_USERNAME=central_user
DB_PASSWORD=আপনার_পাসওয়ার্ড
```

## ৬. Tenancy Logic (Reminder)

যেহেতু আপনি একটি Multi-tenant সিস্টেম বানাচ্ছেন, খেয়াল রাখবেন:
1. **Central Database**: আপনার ল্যান্ডলর্ড টেবিল এবং প্রোভিশনিং টেবিল এখানে থাকবে।
2. **Dynamic Databases**: নতুন ট্রানান্টরা যখন জয়েন করবে, সিস্টেম অটোমেটিক `tenant_arifstore` এরকম নামে নতুন ডিবি তৈরি করবে।

> [!IMPORTANT]
> **Tenant Model Fix**: আমি অলরেডি আপনার `app/Models/Tenant.php` ফাইলে ফিক্স করে দিয়েছি যাতে `tenant_0` এররটি আর না আসে। নিশ্চিত করুন যে আপনার প্রোডাকশন কোডেও `$incrementing = false` সেট করা আছে।

## ৭. Backup & Maintenance

*   Coolify-র বিল্ট-ইন **Backups** ট্যাব ব্যবহার করে প্রতিদিন ডেটাবেস ব্যাকআপ শিডিউল করুন।
*   ডেটাবেস ইমেজ পরিবর্তন করলে অবশ্যই `Save` দিয়ে কনটেইনারটি **Restart** করবেন।
