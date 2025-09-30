# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY updates/dashboard/package*.json ./updates/dashboard/

# Install all dependencies
RUN npm ci --only=production && npm cache clean --force

# Build the client
FROM base AS client-builder
WORKDIR /app
COPY updates/dashboard/package*.json ./
RUN npm ci
COPY updates/dashboard/ ./
RUN npm run build

# Build the server
FROM base AS server-builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=client-builder --chown=nextjs:nodejs /app/dist ./public
COPY --from=server-builder --chown=nextjs:nodejs /app/dist ./server/dist
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/server/node_modules ./server/node_modules

# Copy necessary files
COPY server/src ./server/src
COPY --chown=nextjs:nodejs server/.env* ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "server/dist/index.js"]
