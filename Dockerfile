# ── Stage 0: Frontend Build (Node 22 - native environment) ────────────────────
FROM node:22-alpine AS frontend

WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm install --no-audit --legacy-peer-deps
COPY . .
RUN npm run build

# ── Stage 1: PHP Base ─────────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# 1a. Install system base tools
RUN apk add --no-cache git unzip zip curl bash

# 1b. Install PHP extensions (using optimized installer to avoid OOM crashes on the server)
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql exif pcntl bcmath gd zip intl opcache sockets gmp rdkafka redis

WORKDIR /var/www
ENV APP_ENV=production
ENV COMPOSER_ALLOW_SUPERUSER=1

# ── Stage 2: Composer + Merge ────────────────────────────────────────────────
FROM base AS build

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

COPY . /var/www/

# Copy Vite built assets from frontend stage
COPY --from=frontend /build/public/build /var/www/public/build

# 1. Generate autoload.php first (no scripts — avoids artisan needing autoload.php)
RUN composer dump-autoload --no-dev --no-scripts

# 2. Now artisan works — discover packages
RUN php artisan package:discover --ansi

# 3. Re-optimize autoload
RUN composer dump-autoload --optimize --no-dev --no-scripts

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM base AS runner

RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app
COPY --from=build --chown=app:app /var/www /var/www
# Copy entrypoint
COPY --chown=app:app docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["/usr/local/bin/entrypoint.sh"]