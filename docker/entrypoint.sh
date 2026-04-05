#!/bin/sh
set -e

echo "▶ Waiting for MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "  MySQL not ready, retrying in 3s..."
  sleep 3
done
echo "  MySQL ready ✓"

echo "▶ Running migrations..."
php artisan migrate --force

echo "▶ Caching config/routes/views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "▶ Starting PHP-FPM..."
exec php-fpm
