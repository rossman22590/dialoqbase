# Base stage
FROM node:18-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    g++ make python3 wget gnupg dirmngr unzip \
    git git-lfs openssh-client curl jq cmake sqlite3 openssl psmisc

# Install pnpm
RUN npm install -g pnpm

# Build stage
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Final stage
FROM node:18-slim
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    wget gnupg dirmngr curl \
    ca-certificates git git-lfs openssh-client \
    jq sqlite3 openssl psmisc python3 g++ make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome for Puppeteer
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy built artifacts
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

# Install production dependencies
RUN npm install --production

# Expose all ports
EXPOSE 1-65535

# Start the application
CMD ["npm", "start"]
