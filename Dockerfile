FROM php:8.3-fpm-alpine

# Install System Dependencies & Node.js
RUN apk add --no-cache \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev icu-dev redis nodejs npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Set Working Directory
WORKDIR /var/www

# Copy everything directly
COPY . /var/www/

# Install PHP Dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    && composer dump-autoload --optimize --no-dev

# Install Node.js Dependencies & Build Front-end
RUN npm ci --prefer-offline --no-audit \
    && npm run build || echo "No build script"

# Security: Run as non-root user
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app \
    && chown -R app:app /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER app
EXPOSE 9000

CMD ["php-fpm"]
