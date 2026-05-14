# Build stage
FROM node:22-alpine AS builder

# Build time environment variables (needed for AdonisJS build)
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
ARG VITE_API_URL=/
ARG VITE_PUBLIC_POSTHOG_KEY=
ARG VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

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
    TZ=${TZ} \
    VITE_API_URL=${VITE_API_URL} \
    VITE_PUBLIC_POSTHOG_KEY=${VITE_PUBLIC_POSTHOG_KEY} \
    VITE_PUBLIC_POSTHOG_HOST=${VITE_PUBLIC_POSTHOG_HOST}

WORKDIR /app

# Install pnpm — versão pinada pra bater com a do dev local. Sem pin, o CI
# pega o latest e o packageExtensionsChecksum do lockfile (gerado por pnpm 10)
# não bate com o algoritmo de pnpm 11+, quebrando o --frozen-lockfile.
RUN npm i -g pnpm@10.33.3

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN node ace build

# Prune dev dependencies from node_modules after build
RUN pnpm prune --prod

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
ENV TZ=UTC

WORKDIR /app

# Copy built application and production node_modules from builder
COPY --from=builder /app/build ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3333

CMD ["node", "bin/server.js"]
