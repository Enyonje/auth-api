# ---------- BUILD STAGE ----------
FROM node:20-slim AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy Prisma schema first (important for cache)
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build Nest
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:20-slim
WORKDIR /app

# Install prod deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma client + schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy build output
COPY --from=builder /app/dist ./dist

# Start app
CMD ["node", "dist/main.js"]
