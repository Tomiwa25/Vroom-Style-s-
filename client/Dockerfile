# =============================================================
# Stage 1: Build React + Vite frontend
# =============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies
COPY package*.json ./
RUN npm ci

# Copy client source code
COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY public ./public
COPY src ./src

# Set build-time environment variable for backend API endpoint
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# =============================================================
# Stage 2: Serve production bundle with Nginx
# =============================================================
FROM nginx:alpine AS runner

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
