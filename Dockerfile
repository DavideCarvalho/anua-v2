# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN node ace build

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./

# Install production dependencies only
RUN npm ci --omit=dev

# Expose the port
EXPOSE 3000

# Start the server (migrations are run via Cloud Run Job)
CMD ["node", "bin/server.js"]
