# Stage 1: Define a base environment with Node 20 and common tools
# We'll alias this as 'base_env' to be used by subsequent build stages.
FROM node:20-slim AS base_env
WORKDIR /app
# Install common dependencies needed for build stages
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    wget \
    gnupg \
    dirmngr \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Server build stage (using Node 20 from base_env)
FROM base_env AS server
# WORKDIR is /app (inherited from base_env)
# Assuming your server-specific files (including package.json for the server) are in a 'server' subdirectory of your project
# If your server's package.json is at the root of the 'server' directory,
# then yarn commands should run in the context of where that package.json is copied.
# COPY ./server/package.json ./server/yarn.lock* ./
# WORKDIR /app/server # If server has its own package.json in a subfolder
# If server's package.json is at project root and it's a monorepo, adjust accordingly.
# For now, assuming server files are copied to /app and server's package.json is at /app/package.json
COPY ./server/ ./ 
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-timeout 1200000 && \
    yarn install --frozen-lockfile && \
    yarn build

# Stage 3: Frontend/Pnpm build stage (using Node 20 from base_env)
FROM base_env AS build
# WORKDIR is /app (inherited from base_env)
# This copies the entire build context. Ensure your pnpm workspace/project is set up accordingly.
# If your pnpm project is in a subfolder, e.g., 'frontend', you might do:
# COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./
# COPY ./frontend ./
# WORKDIR /app/frontend # if pnpm commands need to be run in that subfolder
# For now, assuming pnpm commands run from /app after copying everything
COPY . .
RUN npm --no-update-notifier --no-fund --global install pnpm
RUN pnpm install && pnpm build

# Stage 4: Final production stage (using Node 20)
# Changed from node:18-slim to node:20-slim to ensure compatibility with fast-jwt
FROM node:20-slim AS final
WORKDIR /app

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Install runtime OS dependencies
# Reduced to just wget, gnupg, dirmngr, unzip initially for Chrome.
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    dirmngr \
    unzip \
    # Add other essential runtime OS deps here if truly needed by the final app, not just for building Chrome
    # For example, ca-certificates is often good to have.
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome based on architecture
RUN ARCH=$(dpkg --print-architecture) && \
    apt-get update && \
    if [ "$ARCH" = "amd64" ]; then \
        wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
        sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
        apt-get install -y google-chrome-stable --no-install-recommends; \
    elif [ "$ARCH" = "arm64" ]; then \
        # Ensure curl is available for this block if not installed globally above
        apt-get install -y --no-install-recommends curl && \
        wget -q -O chromium-linux-arm64.zip 'https://playwright.azureedge.net/builds/chromium/1088/chromium-linux-arm64.zip' && \
        unzip chromium-linux-arm64.zip && \
        mkdir -p /opt/chromium && \
        mv chrome-linux /opt/chromium/chrome-linux && \
        ln -s /opt/chromium/chrome-linux/chrome /usr/bin/google-chrome && \
        rm chromium-linux-arm64.zip; \
    else \
        echo "Unsupported architecture for Chrome/Chromium: $ARCH" && exit 1; \
    fi && \
    apt-get purge -y --auto-remove wget gnupg dirmngr unzip curl && \
    rm -rf /var/lib/apt/lists/*

# Install other runtime dependencies (if any, try to minimize these)
# The original list was quite extensive; ensure these are all needed at runtime.
# python3, g++, make are typically build-time tools.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    git-lfs \
    openssh-client \
    curl \
    jq \
    # cmake \ # Usually a build tool
    sqlite3 \
    openssl \
    psmisc \
    # python3 \ # If not needed by runtime
    # g++ \ # Build tool
    # make \ # Build tool
    && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Copying build artifacts
# Ensure paths inside the builder stages (/app/dist, /app/prisma, etc.) are correct
COPY --from=server /app/dist/ ./dist
COPY --from=server /app/prisma/ ./prisma
COPY --from=server /app/package.json ./package.json
COPY --from=server /app/yarn.lock ./yarn.lock # Also copy yarn.lock

# Copy frontend artifacts
COPY --from=build /app/app/ui/dist/ ./public
COPY --from=build /app/app/widget/dist/assets/ ./public/assets
COPY --from=build /app/app/widget/dist/index.html ./public/bot.html
COPY --from=build /app/app/script/dist/chat.min.js ./public/chat.min.js

# Install production Node.js dependencies using Node 20
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-timeout 1200000 && \
    yarn install --production --frozen-lockfile

# Expose port (if your app listens on one, e.g., 3000)
# EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
