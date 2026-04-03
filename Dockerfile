# ── Stage 1: Base & Tooling ───────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# Install System Dependencies & Node.js
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev redis nodejs npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

WORKDIR /var/www

# ── Stage 2: Composer (PHP Deps) ──────────────────────────────────────────────
FROM base AS composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . /var/www/
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Node Build (Frontend) ────────────────────────────────────────────
FROM base AS node-build
COPY ./package.json ./package-lock.json* /var/www/
RUN npm ci --prefer-offline --no-audit
COPY . /var/www/
RUN npm run build || echo "No build script"

# ── Stage 4: Runner ───────────────────────────────────────────────────────────
FROM base AS runner

# Security: Run as non-root user
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app

# Copy code and assets from build stages
COPY --from=composer /var/www /var/www
COPY --from=node-build /var/www/public /var/www/public

# Permissions
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]
