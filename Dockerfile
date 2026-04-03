# ── Stage 1: Runtime Base ──────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# Install System Dependencies & Build Tools
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
    bash \
    gmp-dev \
    zlib-dev \
    libpng \
    libjpeg-turbo \
    freetype \
    libwebp

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
    opcache \
    sockets \
    gmp

# Install Kafka support (RdKafka)
RUN pecl install rdkafka && docker-php-ext-enable rdkafka

WORKDIR /var/www

# Fallback Environment
ENV APP_ENV=production
ENV COMPOSER_ALLOW_SUPERUSER=1

# ── Stage 2: Build App ────────────────────────────────────────────────────────
FROM base AS build

# PHP Dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

# Node.js Build
COPY ./package.json ./package-lock.json* /var/www/
RUN npm install --no-audit
COPY . /var/www/
RUN npm run build

# Final Autoloader optimization
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
