# ── Stage 1: Base Image (PHP + Extensions + Node) ─────────────────────────────
FROM php:8.3-fpm-alpine AS base

# Install System Dependencies, Node.js, and Build Tools
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev redis nodejs npm \
    git unzip zip curl libwebp-dev libjpeg-turbo-dev freetype-dev \
    librdkafka-dev build-base autoconf bash python3

# Install PHP Extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Install Kafka support
RUN pecl install rdkafka && docker-php-ext-enable rdkafka

WORKDIR /var/www

# ── Stage 2: Build App (Composer & Node) ──────────────────────────────────────
FROM base AS build

# PHP Dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
# Use --ignore-platform-reqs to bypass extension check during composer install
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

# Node.js Dependencies & Inertia Build
COPY ./package.json ./package-lock.json* /var/www/
RUN npm install --no-audit
COPY . /var/www/
RUN npm run build

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Final Production Image ──────────────────────────────────────────
FROM base AS runner

# Security: Run as non-root
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app

# Copy fully built app from build stage
COPY --from=build --chown=app:app /var/www /var/www

# Permissions for Laravel
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]
