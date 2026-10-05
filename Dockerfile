# Production Multi-Stage Dockerfile for KryptoPulse Standalone Web App
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend bundle
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm install tsx -g

# Copy built frontend assets and server entrypoint
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

# Start standalone full-stack Node server
CMD ["tsx", "server.ts"]
