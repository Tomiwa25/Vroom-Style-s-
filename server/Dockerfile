# =============================================================
# Stage 1: Build TypeScript backend & generate Prisma client
# =============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# =============================================================
# Stage 2: Production runtime runner
# =============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Run database migrations and start server
CMD ["node", "dist/server.js"]
