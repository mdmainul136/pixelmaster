FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configs
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy public assets into the web server
COPY public /var/www/public

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
