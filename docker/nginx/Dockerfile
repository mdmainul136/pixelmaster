# ── Stage 0: Frontend Build ───────────────────────────────────────────────────
FROM node:22-alpine AS frontend

WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm install --no-audit --legacy-peer-deps
COPY . .
RUN npm run build

# ── Stage 1: Production ───────────────────────────────────────────────────────
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configs
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy public assets into the web server
COPY public /var/www/public

# Copy Vite built assets from frontend stage
COPY --from=frontend /build/public/build /var/www/public/build

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
