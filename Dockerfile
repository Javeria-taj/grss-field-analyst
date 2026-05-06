# ── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Increment this number to force Railway to bust ALL cached layers below
ARG CACHE_BUST=7
# This MUST be before COPY statements — changing the value above invalidates
# COPY, npm ci, and npm run build:realtime so Railway always recompiles TS
RUN echo "Cache bust: $CACHE_BUST"

WORKDIR /app

# Copy only what's needed to build the realtime server
COPY package*.json ./
COPY tsconfig.json ./
COPY realtime/ ./realtime/
COPY lib/ ./lib/

RUN npm ci

# Compile TypeScript → JavaScript (always fresh)
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
