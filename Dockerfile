# ── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev redis \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

WORKDIR /var/www

# ── Stage 2: Composer ─────────────────────────────────────────────────────────
FROM base AS composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Node Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS node-build
WORKDIR /var/www
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build || echo "No build script"

# ── Stage 4: Final Runner ─────────────────────────────────────────────────────
FROM base AS runner

# Create app user
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app

# Copy artifacts from stages
COPY --from=composer /var/www /var/www
COPY --from=node-build /var/www/public /var/www/public

# Set permissions
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]
