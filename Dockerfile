# ── Stage 1: PHP Dependencies (Composer) ──────────────────────────────────────
FROM composer:latest AS composer_stage
WORKDIR /var/www
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# ── Stage 2: Node Dependencies & Build (Inertia/Vite) ────────────────────────
FROM node:20-alpine AS node_stage
WORKDIR /var/www
COPY package.json package-lock.json* ./
# Install without strict lock check for better compatibility on Alpine
RUN npm install --no-audit 
COPY . .
RUN npm run build

# ── Stage 3: Final Production Image ──────────────────────────────────────────
FROM php:8.3-fpm-alpine AS runner

# Install Runtime System Dependencies
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev redis \
    git unzip zip curl libwebp-dev libjpeg-turbo-dev freetype-dev \
    librdkafka-dev build-base autoconf bash

# Install PHP Extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Install Kafka support
RUN pecl install rdkafka && docker-php-ext-enable rdkafka

WORKDIR /var/www

# Create non-root user
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app

# Copy PHP dependencies from Stage 1
COPY --from=composer_stage /var/www/vendor ./vendor
# Copy App Source & Built Assets from Stage 2
COPY --from=node_stage /var/www ./

# Final Autoloader optimization
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer dump-autoload --optimize --no-dev

# Permissions
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]
