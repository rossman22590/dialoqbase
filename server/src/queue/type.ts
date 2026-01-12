import { BotSource } from "@prisma/client";

export interface QSource extends BotSource {
  embedding: string;
  maxDepth?: number;
  maxLinks?: number;
  chunkSize: number;
  chunkOverlap: number;
  usePuppeteerFetch?: boolean;
  doNotClosePuppeteer?: boolean;
  bot_model_api_key?: string;
}
