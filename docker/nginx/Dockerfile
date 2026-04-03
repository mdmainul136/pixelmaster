FROM nginx:alpine

# Install GeoIP2 module and necessary dependencies
RUN apk add --no-cache \
    nginx-mod-http-geoip2 \
    curl

# Create directory for GeoIP databases
RUN mkdir -p /etc/nginx/geoip

# Download latest GeoLite2 databases from a reliable open-source mirror
RUN curl -L -o /etc/nginx/geoip/GeoLite2-Country.mmdb https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-Country.mmdb \
    && curl -L -o /etc/nginx/geoip/GeoLite2-City.mmdb https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-City.mmdb

# Expose standard web ports
EXPOSE 80 443
