ARG  NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine AS base
ARG  SERVICE
ENV SERVICE=${SERVICE}
ARG  SERVICE_PATH
ENV SERVICE_PATH=${SERVICE_PATH}
RUN corepack enable

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app

COPY . .
RUN pnpm dlx turbo@^1 prune --scope=$SERVICE --docker
# FIX ERROR: failed to solve: cannot copy to non-directory: …/app/services/qr-code-handler/node_modules/tsup-config
RUN find . -name "node_modules" -type d -exec rm -rf {} +

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ARG  SERVICE
RUN apk add --no-cache libc6-compat python3 make g++ git openjdk8
RUN apk update
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install
 
# Build the project
COPY --from=builder /app/out/full/ .

FROM installer AS dev
ENV NEXT_TELEMETRY_DISABLED 1
CMD cd $SERVICE_PATH && pnpm dev

FROM installer AS installer_prod
RUN pnpm turbo run build --filter=$SERVICE
RUN pnpm install --prod --frozen-lockfile --ignore-scripts --prefer-offline
 
FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 runuser
RUN corepack enable
 
COPY --from=installer_prod /app .

# Create data directory and set permissions
# RUN mkdir -p $SERVICE_PATH/data
# RUN chown runuser:nodejs $SERVICE_PATH/data
 
# USER runuser

CMD ["sh", "-c", "cd $SERVICE_PATH && npm start"]
