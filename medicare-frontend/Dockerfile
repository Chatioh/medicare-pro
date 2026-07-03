# ============================================================
# MediCare Pro — Frontend Dockerfile
# Multi-stage build: builder (Vite) → production (Nginx)
# Serves static files via Nginx — no Node.js in production
# ============================================================

# ── Stage 1: Builder (Vite build) ────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first (layer cache optimisation)
COPY package*.json ./

# Install all dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build production bundle (Vite outputs to /dist)
RUN npm run build

# ── Stage 2: Production (Nginx static server) ────────────────
FROM nginx:alpine AS production

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config (handles SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
