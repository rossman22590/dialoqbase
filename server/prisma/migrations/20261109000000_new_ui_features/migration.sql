-- Sites allowed to embed a bot. Empty means any site.
ALTER TABLE "Bot" ADD COLUMN "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Low-balance email alert settings.
ALTER TABLE "User" ADD COLUMN "lowBalanceEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lowBalanceThreshold" DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
ADD COLUMN "lowBalanceNotifiedAt" TIMESTAMP(3);

-- Thumbs up/down on playground answers ("up" or "down").
ALTER TABLE "BotPlaygroundMessage" ADD COLUMN "feedback" TEXT;
