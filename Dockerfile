# Build stage
FROM node:22-alpine AS builder

# Build time environment variables (needed for AdonisJS build)
# These will NOT be present at runtime - Cloud Run will inject the real values
ARG NODE_ENV=production
ARG PORT=3333
ARG APP_KEY=placeholder_key_for_build_only
ARG HOST=0.0.0.0
ARG LOG_LEVEL=info
ARG SESSION_DRIVER=cookie
ARG DB_HOST=localhost
ARG DB_PORT=5432
ARG DB_USER=postgres
ARG DB_PASSWORD=postgres
ARG DB_DATABASE=anua_v2
ARG TZ=UTC

# Set as ENV for the build steps
ENV NODE_ENV=${NODE_ENV} \
    PORT=${PORT} \
    APP_KEY=${APP_KEY} \
    HOST=${HOST} \
    LOG_LEVEL=${LOG_LEVEL} \
    SESSION_DRIVER=${SESSION_DRIVER} \
    DB_HOST=${DB_HOST} \
    DB_PORT=${DB_PORT} \
    DB_USER=${DB_USER} \
    DB_PASSWORD=${DB_PASSWORD} \
    DB_DATABASE=${DB_DATABASE} \
    TZ=${TZ}

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
ENV PORT=3333
ENV TZ=UTC

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./

# Install production dependencies only
RUN npm ci --omit=dev

# Expose the port
EXPOSE 3333

# Start the server (migrations are run via Cloud Run Job)
CMD ["node", "bin/server.js"]
