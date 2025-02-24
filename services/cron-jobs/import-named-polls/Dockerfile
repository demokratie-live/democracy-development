ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-slim AS base
ARG SERVICE
ENV SERVICE=${SERVICE}
ARG SERVICE_PATH
ENV SERVICE_PATH=${SERVICE_PATH}
RUN corepack enable

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends libc6
# Set working directory
WORKDIR /app

COPY . .
RUN pnpm dlx turbo@^1 prune --scope=${SERVICE} --docker
# FIX ERROR: failed to solve: cannot copy to non-directory
RUN find . -name "node_modules" -type d -exec rm -rf {} +

FROM base AS installer
ARG SERVICE_PATH
ARG SERVICE
# Set Playwright browser path and skip download during npm install
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install system dependencies including browser dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    git \
    libnss3 \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz0b \
    ca-certificates \
    fonts-freefont-ttf \
    chromium \
    firefox-esr \
    dbus \
    libgtk-3-0 \
    libstdc++6 \
    libgcc1 \
    libegl1 \
    libgl1 \
    xvfb \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# First install the dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .

RUN pnpm install

# Install Playwright browsers explicitly
RUN mkdir -p /ms-playwright && \
    cd ${SERVICE_PATH} && \
    pnpm exec playwright install chromium && \
    pnpm exec playwright install-deps

# Build the project
COPY --from=builder /app/out/full/ .

FROM installer AS dev
ENV NEXT_TELEMETRY_DISABLED 1
CMD cd $SERVICE_PATH && pnpm dev

FROM installer AS installer_prod
RUN pnpm turbo run build --filter=$SERVICE
RUN pnpm install --prod --frozen-lockfile --ignore-scripts --prefer-offline

FROM base AS runner
# Set the browser path to match installer stage
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

# Don't run production as root
RUN groupadd -r -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs runuser

# Create and set permissions for all required directories
RUN mkdir -p /home/runuser/.cache/node/corepack && \
    mkdir -p /app/services/cron-jobs/import-named-polls/storage && \
    chown -R runuser:nodejs /home/runuser && \
    chown -R runuser:nodejs /app

RUN corepack enable

# Install runtime dependencies for browsers
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz0b \
    ca-certificates \
    fonts-freefont-ttf \
    chromium \
    firefox-esr \
    dbus \
    libgtk-3-0 \
    libstdc++6 \
    libgcc1 \
    libegl1 \
    libgl1 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

COPY --from=installer_prod /app .
# Copy installed browsers from installer stage
COPY --from=installer /ms-playwright /ms-playwright

# Ensure final permissions are correct after copy
RUN chown -R runuser:nodejs /app

USER runuser

CMD ["sh", "-c", "cd $SERVICE_PATH && pnpm start"]
