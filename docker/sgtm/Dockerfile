# ─────────────────────────────────────────────────────────────
# Power-Ups Sidecar — Multi-stage Build
#
# Image: sgtm-powerups:latest
# Purpose: Custom Loader, Click ID Restorer, Debug UI, fbp/fbc
# ─────────────────────────────────────────────────────────────

# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production --ignore-scripts

# Stage 2: runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Security: non-root user
RUN addgroup -S sgtm && adduser -S sgtm -G sgtm

# Copy only what we need from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY server.js debug-ui.html ./

# Labels for container registry
LABEL org.opencontainers.image.title="sGTM Power-Ups Sidecar"
LABEL org.opencontainers.image.version="2.0"
LABEL org.opencontainers.image.description="Custom Loader, Click ID Restorer, First-Party Cookies"

# Default runtime env (overridden by DockerOrchestratorService)
ENV PORT=8081
ENV COOKIE_NAME="_fp_id"
ENV CLICK_ID_RESTORE="true"
ENV CONTAINER_ID="unknown"
ENV SGTM_UPSTREAM="http://localhost:8080"
ENV POWERUPS_URL="http://host.docker.internal:8000/api/tracking"

USER sgtm

EXPOSE 8081

# Health check — matches NGINX health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/healthz || exit 1

CMD ["node", "server.js"]
