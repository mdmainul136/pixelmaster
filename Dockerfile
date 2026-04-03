# ── Stage 0: Node.js binary ───────────────────────────────────────────────────
FROM node:22-alpine AS node

# ── Stage 1: Runtime Base ──────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

# Copy Node 22 + npm from official image (matches local dev: Node 22 + npm 11)
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/bin/node /usr/local/bin/nodejs \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# 1a. Install system libraries & tools
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev \
    git unzip zip curl bash libstdc++ \
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

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM base AS build

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./composer.json ./composer.lock /var/www/
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

COPY ./package.json ./package-lock.json* /var/www/
RUN npm install --no-audit
COPY . /var/www/
RUN npm run build
RUN composer dump-autoload --optimize --no-dev

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM base AS runner

RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app
COPY --from=build --chown=app:app /var/www /var/www
RUN chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000
CMD ["php-fpm"]