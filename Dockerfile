# ── Stage 0: Frontend Build (Node 22 - native environment) ────────────────────
FROM node:22-alpine AS frontend

WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm install --no-audit --legacy-peer-deps
COPY . .
RUN npm run build

# ── Stage 1: PHP Base ─────────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# 1a. Install system libraries & tools
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev \
    git unzip zip curl bash \
    libwebp-dev libjpeg-turbo-dev freetype-dev \
    librdkafka-dev build-base autoconf gmp-dev \
    linux-headers

# 1b. Configure & install PHP extensions
RUN export CFLAGS="-I/usr/include/freetype2" \
    && export CPPFLAGS="-I/usr/include/freetype2" \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql mbstring exif pcntl bcmath gd \
        zip intl opcache sockets gmp

# 1c. Install PECL extensions (rdkafka + redis)
RUN pecl install rdkafka redis \
    && docker-php-ext-enable rdkafka redis

# 1d. Clean up build deps to keep image smaller
RUN apk del build-base autoconf linux-headers

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

# Create minimal .env for artisan package:discover (triggered by post-autoload-dump)
RUN cp .env.example .env && \
    php artisan key:generate --force && \
    composer dump-autoload --optimize --no-dev

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM base AS runner

RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app
COPY --from=build --chown=app:app /var/www /var/www
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]