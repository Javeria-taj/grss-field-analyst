# ── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only what's needed to build the realtime server
COPY package*.json ./
COPY tsconfig.json ./
COPY realtime/ ./realtime/
COPY lib/ ./lib/

# Install all deps (needed for tsc)
RUN npm ci

# Compile TypeScript → JavaScript
RUN npm run build:realtime

# ── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/realtime/dist ./realtime/dist
COPY --from=builder /app/lib ./lib

ENV NODE_ENV=production

EXPOSE 4001

CMD ["node", "realtime/dist/server.js"]
