# Deploying to Coolify (Self-Hosted Multi-Tenancy)

This guide explains how to deploy the **Enterprise Multi-Tenant Platform** on Coolify.

## 1. Prerequisites
- A VPS with Coolify installed (v4+ recommended).
- A wildcard domain (e.g., `*.yourplatform.com`) pointed to your VPS IP.
- Redis and MySQL (Coolify can provision these as Services).

## 2. Service Setup
1. **Database**: Create a "Private Database" (MariaDB/MySQL). Record the internal URL.
2. **Redis**: Create a Redis service. Required for global rate limiting and caching.

## 3. Application Configuration
Create a new "Public Repository" resource in Coolify:
- **Build Pack**: Dockerfile (Coolify will detect the multi-stage build automatically).
- **Destination**: Select your server/network.

### Essential Environment Variables:
```env
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://platform.yourplatform.com
DB_CONNECTION=mysql
DB_HOST=mysql-internal-host
REDIS_HOST=redis-internal-host
TENANCY_CENTRAL_DOMAINS=platform.yourplatform.com
```

## 4. Multi-Tenancy (Wildcard SSL)
- In the application settings, add your wildcard domain: `platform.yourplatform.com, *.yourplatform.com`.
- Coolify's built-in Traefik/Caddy will automatically handle SSL provisioning for these.

## 5. Post-Deployment
Once the build finishes:
1. Run migrations: `php artisan migrate --force`.
2. Seed initial data: `php artisan db:seed --force`.
3. Verify at `https://platform.yourplatform.com`.
