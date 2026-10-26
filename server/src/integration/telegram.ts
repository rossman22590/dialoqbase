import { Bot, Context, GrammyError } from "grammy";
import axios from "axios";
import {
  deleteTelegramChatHistory,
  telegramBotHandler,
  welcomeMessage,
} from "./handlers/telegram.handler";
import { convertTextToAudio } from "./handlers/utils/audio-to-text";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";
import * as fs from "fs/promises";
import { convertOggToWave } from "../utils/ffmpeg";
import { telegramFormat } from "../utils/telegram-format";
type DialoqBaseContext = FileFlavor<Context>;

const groupCommand = process.env.DQ_TG_GROUP_COMMAND || "ask"
const groupCommandRegex = new RegExp(`^\\/${groupCommand}\\s(.*)`);

export default class TelegramBot {
  static get clients() {
    return this._clients.values();
  }

  private static _clients: Map<string, any> = new Map();
  private static _retries: Map<string, NodeJS.Timeout> = new Map();

  static totolClients() {
    return this._clients.size;
  }

  static async connect(identifier: string, token: string, attempt = 0) {
    try {
      this.cancelRetry(identifier);
      if (this._clients.has(identifier)) {
        await this.disconnect(identifier);
      }

      const bot = new Bot<DialoqBaseContext>(token);
      bot.api.config.use(hydrateFiles(bot.token));

      await bot.api.setMyCommands([
        { command: "start", description: "Start the bot" },
        { command: "ping", description: "Ping the bot" },
        { command: "clear", description: "Clear chat history" },
      ]);

      bot.command("start", async (ctx) => {
        await ctx.replyWithChatAction("typing");
        const message = await welcomeMessage(identifier);
        return await ctx.reply(message);
      });
      bot.command("ping", (ctx) => ctx.reply("pong"));
      bot.command("clear", async (ctx) => {
        await ctx.replyWithChatAction("typing");
        if (!ctx?.from?.id) {
          return await ctx.reply("I can't find your user id");
        }
        const response = await deleteTelegramChatHistory(
          identifier,
          ctx.from.id!
        );
        return await ctx.reply(response);
      });
      bot.hears(groupCommandRegex, async (ctx) => {
        try {
          await ctx.replyWithChatAction("typing");
          const user_id = ctx.from.id;
          const [, message] = ctx.match
          if (!message) {
            return await ctx.reply("Please provide a question after /ask");
          }
          const response = await telegramBotHandler(
            identifier,
            message,
            user_id
          );

          if (process.env.DB_TELEGEAM_PARSE_MODE === "normal") {
            return await ctx.reply(response);
          }

          return await ctx.reply(telegramFormat(response),
            {
              parse_mode: "HTML",
            });
        } catch (e) {
          console.log(e)
          return await ctx.reply("Something went wrong")
        }
      });
      bot.on("message:text", async (ctx) => {
        if (ctx.chat.type === "private") {
          await ctx.replyWithChatAction("typing");
          const user_id = ctx.from.id;
          const message = await telegramBotHandler(
            identifier,
            ctx.message.text,
            user_id
          );

          if (process.env.DB_TELEGEAM_PARSE_MODE === "normal") {
            return await ctx.reply(message);
          }

          return await ctx.reply(telegramFormat(message),
            {
              parse_mode: "HTML",
            });
        }
      });

      bot.on("message:voice", async (ctx) => {
        if (ctx.chat.type == "private") {
          try {
            await ctx.replyWithChatAction("typing");

            const file = await ctx.getFile();
            const path = await file.download();

            const audioWav = await convertOggToWave(path);
            const audio = await fs.readFile(audioWav);

            const response = await convertTextToAudio(audio);

            const user_id = ctx.from.id;

            const message = await telegramBotHandler(
              identifier,
              response.text,
              user_id
            );


            if (process.env.DB_TELEGEAM_PARSE_MODE === "normal") {
              return await ctx.reply(message);
            }

            return await ctx.reply(telegramFormat(message),
              {
                parse_mode: "HTML",
              });
          } catch (error) {
            console.log(error);
            return await ctx.reply("Opps! Something went wrong");
          }
        }
      });

      bot.catch((err) => console.log(`${identifier} error: ${err}`));
      // grammY rethrows 401/409 from polling instead of retrying, so an
      // uncaught start() would take the whole server down with it.
      bot.start().catch((error) => {
        if (this._clients.get(identifier) !== bot) return;
        this._clients.delete(identifier);
        if (error instanceof GrammyError && error.error_code === 409) {
          // Another instance is polling this token, e.g. the previous
          // container during a deploy. Keep trying until it goes away.
          const delay = Math.min(60, 5 * 2 ** attempt);
          console.log(
            `[TelegramBot] ${identifier}: another instance is polling this token, retrying in ${delay}s`
          );
          this._retries.set(
            identifier,
            setTimeout(() => {
              this._retries.delete(identifier);
              this.connect(identifier, token, attempt + 1);
            }, delay * 1000)
          );
          return;
        }
        console.log(`[TelegramBot] ${identifier}: polling stopped: `, error);
      });
      this._clients.set(identifier, bot);
    } catch (error) {
      console.log("[TelegramBot] error: ", error);
    }
  }

  static async isConnect(identifier: string) {
    return this._clients.has(identifier);
  }

  static async disconnect(identifier: string) {
    this.cancelRetry(identifier);
    const bot = this._clients.get(identifier);
    this._clients.delete(identifier);
    // stop() makes one last getUpdates call, which can fail the same way
    await bot?.stop().catch((error: unknown) => {
      console.log(`[TelegramBot] ${identifier}: stop failed: `, error);
    });
  }

  private static cancelRetry(identifier: string) {
    clearTimeout(this._retries.get(identifier));
    this._retries.delete(identifier);
  }

  static async isValidate(token: string) {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${token}/getMe`
      );
      return response.data.ok;
    } catch (error) {
      return false;
    }
  }
}