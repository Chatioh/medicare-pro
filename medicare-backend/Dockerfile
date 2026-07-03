# ============================================================
# MediCare Pro — Backend Dockerfile
# Multi-stage build: builder → production
# Node.js 18 LTS + Alpine (minimal image size)
# ============================================================

# ── Stage 1: Builder ─────────────────────────────────────────
FROM node:18-alpine AS builder

# Install build tools needed for native modules (bcryptjs, sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy dependency manifests first (layer cache optimisation)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for any build steps)
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production ──────────────────────────────────────
FROM node:18-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

WORKDIR /usr/src/app

# Copy only production node_modules from builder stage
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/node_modules ./node_modules

# Copy application source
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose API port
EXPOSE 5000

# Health check — hits the root or a lightweight endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Production start command (NOT nodemon)
CMD ["node", "server.js"]
