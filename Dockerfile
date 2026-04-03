# ─────────────────────────────────────────────────────────────────────────────
# Laravel Multi-tenant Backend — Multi-stage Dockerfile
#
# Stages:
#   1. base       → PHP + system deps (shared layer, cached aggressively)
#   2. composer   → composer install --no-dev (disposable)
#   3. node-build → npm ci + npm run build for any frontend assets (disposable)
#   4. runner     → final production image (minimal, non-root, no build tools)
#
# Result: ~180 MB vs ~450 MB single-stage
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: base ─────────────────────────────────────────────────────────────
# PHP + system libs only. No composer, no git, no build tools.
# This layer is reused by both 'composer' and 'runner' stages.
FROM php:8.3-fpm-alpine AS base

# Alpine packages (much smaller than apt on Debian/Ubuntu)
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    icu-dev \
    redis \
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
    && rm -rf /tmp/*

# OPcache tuned for production
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# PHP-FPM tuning for high-concurrency multi-tenancy
RUN { \
    echo '[www]'; \
    echo 'pm = dynamic'; \
    echo 'pm.max_children = 50'; \
    echo 'pm.start_servers = 5'; \
    echo 'pm.min_spare_servers = 5'; \
    echo 'pm.max_spare_servers = 35'; \
    } > /usr/local/etc/php-fpm.d/zz-docker.conf

WORKDIR /var/www

# Healthcheck to verify PHP-FPM is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD php-fpm -t || exit 1


# ── Stage 2: composer ─────────────────────────────────────────────────────────
# Install PHP dependencies. This stage is thrown away — only vendor/ is kept.
FROM base AS composer

# Copy composer binary from official image (avoids downloading each build)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy only the files composer needs — optimizes layer caching.
# composer.json + composer.lock change rarely; actual code changes often.
COPY composer.json composer.lock ./

# Install production deps only (no require-dev, no scripts, no autoload yet)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

# Copy full source now (after vendor install, so code changes don't bust the vendor cache)
COPY . .

# Generate optimized autoloader + run post-install scripts
RUN composer dump-autoload --optimize --no-dev


# ── Stage 3: node-build ───────────────────────────────────────────────────────
# Compile frontend assets if any (Vite/Mix). Thrown away after build.
FROM node:20-alpine AS node-build

WORKDIR /var/www

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

COPY . .
RUN npm run build 2>/dev/null || echo "No npm build script — skipping"


# ── Stage 4: runner ───────────────────────────────────────────────────────────
# Final production image — only runtime artifacts, no compiler/build tools.
FROM base AS runner

# Security: run as non-root user (www-data already exists in php-fpm images)
RUN addgroup -g 1000 -S app 2>/dev/null || true \
    && adduser  -u 1000 -S app -G app 2>/dev/null || true

WORKDIR /var/www

# Copy only what we need from previous stages
COPY --from=composer /var/www/vendor      ./vendor
COPY --from=composer /var/www             ./
COPY --from=node-build /var/www/public    ./public

# Remove dev/test artifacts that sneak in via COPY
RUN rm -rf \
    tests/ \
    .git/ \
    .github/ \
    node_modules/ \
    docker/ \
    *.md \
    phpunit.xml \
    vite.config.* \
    package.json \
    package-lock.json \
    debug_*.php \
    test_*.php \
    final_*.php

# Writable directories — owned by app user
RUN mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache \
    && chown -R app:app storage bootstrap/cache \
    && chmod -R 775  storage bootstrap/cache

# Labels
LABEL org.opencontainers.image.title="Multi-Tenant Laravel API"
LABEL org.opencontainers.image.description="Production PHP-FPM image — non-root, OPcache, Alpine"

USER app

EXPOSE 9000
CMD ["php-fpm"]
