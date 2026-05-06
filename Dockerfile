# ── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Increment this to force a full rebuild (bypasses Docker layer cache)
ARG CACHE_BUST=6

WORKDIR /app

# Copy only what's needed to build the realtime server
COPY package*.json ./
COPY tsconfig.json ./
COPY realtime/ ./realtime/
COPY lib/ ./lib/

# Cache bust AFTER copy — forces recompile whenever this arg changes
RUN echo "Cache bust: $CACHE_BUST" && npm ci

# Compile TypeScript → JavaScript (always fresh, never from committed dist files)
RUN npm run build:realtime

# ── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/realtime/dist ./realtime/dist

ENV NODE_ENV=production

EXPOSE 4001

# Correct entry point based on tsc output structure
CMD ["node", "realtime/dist/realtime/server.js"]
