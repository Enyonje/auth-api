# ---------- BUILD STAGE ----------
FROM node:20-slim AS builder
WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:20-slim
WORKDIR /app

# Install OpenSSL again (runtime needs it!)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma engine + schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy compiled app
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
