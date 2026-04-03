# ── Stage 1: Runtime Base ──────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# Install System Dependencies & Build Tools
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev redis nodejs npm \
    git unzip zip curl libwebp-dev libjpeg-turbo-dev freetype-dev \
    librdkafka-dev build-base autoconf bash python3

# PHP Extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# RdKafka support
RUN pecl install rdkafka && docker-php-ext-enable rdkafka

WORKDIR /var/www

# ── Stage 2: Dependencies & Asset Build ──────────────────────────────────────
FROM base AS build
ENV COMPOSER_ALLOW_SUPERUSER=1

# PHP Dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Node.js Dependencies & Build
COPY ./package.json ./package-lock.json* /var/www/
# Clear npm cache and use install instead of ci for better compatibility
RUN npm cache clean --force && npm install --no-audit

# Copy application and build
COPY . /var/www/
RUN npm run build

# Final autoloader
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Final Runner ─────────────────────────────────────────────────────
FROM base AS runner
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app
COPY --from=build --chown=app:app /var/www /var/www
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]
