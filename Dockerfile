# Stage 1: Define a base environment with Node 20 and common tools
FROM node:20-slim AS base_env
WORKDIR /app

# Install build dependencies in a more efficient way
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    wget \
    gnupg \
    dirmngr \
    unzip \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Server build stage
FROM base_env AS server
COPY ./server/ ./
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-timeout 1200000 && \
    yarn install --frozen-lockfile && \
    yarn build

# Stage 3: Frontend/Pnpm build stage
FROM base_env AS build
COPY . .
RUN npm --no-update-notifier --no-fund --global install pnpm && \
    pnpm install && \
    pnpm build

# Stage 4: Final production stage
FROM node:20-slim AS final
WORKDIR /app

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Install Chrome/Chromium in a more robust way
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome based on architecture (fixed syntax)
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then \
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
        apt-get update && \
        apt-get install -y --no-install-recommends google-chrome-stable; \
    elif [ "$ARCH" = "arm64" ]; then \
        apt-get update && apt-get install -y --no-install-recommends curl unzip && \
        wget -q -O chromium-linux-arm64.zip 'https://playwright.azureedge.net/builds/chromium/1088/chromium-linux-arm64.zip' && \
        unzip chromium-linux-arm64.zip && \
        mkdir -p /opt/chromium && \
        mv chrome-linux /opt/chromium/chrome-linux && \
        ln -s /opt/chromium/chrome-linux/chrome /usr/bin/google-chrome && \
        rm chromium-linux-arm64.zip; \
    else \
        echo "Unsupported architecture for Chrome/Chromium: $ARCH" && exit 1; \
    fi && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    git-lfs \
    openssh-client \
    curl \
    jq \
    sqlite3 \
    openssl \
    psmisc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy build artifacts
COPY --from=server /app/dist/ ./dist/
COPY --from=server /app/prisma/ ./prisma/
COPY --from=server /app/package.json ./package.json
COPY --from=server /app/yarn.lock* ./

# Copy frontend artifacts
COPY --from=build /app/app/ui/dist/ ./public/
COPY --from=build /app/app/widget/dist/assets/ ./public/assets/
COPY --from=build /app/app/widget/dist/index.html ./public/bot.html
COPY --from=build /app/app/script/dist/chat.min.js ./public/chat.min.js

# Install production dependencies
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-timeout 1200000 && \
    yarn install --production --frozen-lockfile

# Start the application
CMD ["yarn", "start"]
