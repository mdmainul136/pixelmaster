# ── Stage 1: Runtime Base ──────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# Install System Dependencies, Node.js, and Build Tools
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    icu-dev \
    redis \
    nodejs \
    npm \
    git \
    unzip \
    zip \
    curl \
    libwebp-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    librdkafka-dev \
    build-base \
    autoconf \
    bash

# Install PHP Extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache

# Install RdKafka extension (needed for Laravel Kafka)
RUN pecl install rdkafka && docker-php-ext-enable rdkafka

WORKDIR /var/www

# ── Stage 2: Dependencies & Asset Build ──────────────────────────────────────
FROM base AS build

# Set Composer permissions
ENV COMPOSER_ALLOW_SUPERUSER=1

# PHP Dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Node.js Dependencies & Inertia Build
COPY ./package.json ./package-lock.json* /var/www/
RUN npm ci --prefer-offline --no-audit
COPY . /var/www/
RUN npm run build

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Final Runner Stage ───────────────────────────────────────────────
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
