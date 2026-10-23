import { AsyncLocalStorage } from "node:async_hooks";
import { countTokens } from "./tokenizer";
import {
  ChatCall,
  PRICE_MARKUP,
  calculateChatCost,
  priceChatCall,
} from "./pricing";

// Collects the token usage OpenRouter reports for every LLM call made while
// one message is answered (the condense-question call as well as the answer),
// so billing covers the system prompt, retrieved context and reasoning tokens.
//
//   const usage = new ChatUsage();
//   const answer = await usage.track(() => chain.invoke(input));
//   const { cost } = await usage.totals(bot.model);
export class ChatUsage {
  private calls: Promise<ChatCall>[] = [];

  // Every OpenRouter request started inside fn (including ones a stream makes
  // while being iterated inside fn) is recorded here.
  track<T>(fn: () => Promise<T>): Promise<T> {
    return usageStorage.run(this, fn);
  }

  record(call: Promise<ChatCall>) {
    this.calls.push(call);
  }

  async totals(modelId: string) {
    const calls = await Promise.all(this.calls);
    return {
      inputTokens: calls.reduce((sum, call) => sum + call.inputTokens, 0),
      outputTokens: calls.reduce((sum, call) => sum + call.outputTokens, 0),
      llmCalls: calls.length,
      // What OpenRouter charges us (estimated from our table when not reported)
      providerCostUsd: calls.reduce(
        (sum, call) =>
          sum + (call.providerCost ?? priceChatCall(modelId, call) / PRICE_MARKUP),
        0
      ),
      cost: calculateChatCost(modelId, calls),
    };
  }
}

const usageStorage = new AsyncLocalStorage<ChatUsage>();

const messageText = (messages: any[]) =>
  messages
    .map((m) =>
      typeof m.content === "string" ? m.content : JSON.stringify(m.content)
    )
    .join("\n");

const toCall = async (
  usage: any,
  promptText: string,
  outputText: string
): Promise<ChatCall> => {
  if (typeof usage?.prompt_tokens === "number") {
    // completion_tokens includes reasoning tokens
    return {
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens ?? 0,
      providerCost: typeof usage.cost === "number" ? usage.cost : undefined,
    };
  }
  // No usage reported: estimate from the text actually sent and received
  return {
    inputTokens: await countTokens(promptText),
    outputTokens: await countTokens(outputText),
  };
};

const readStreamUsage = async (
  stream: any,
  promptText: string
): Promise<ChatCall> => {
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  let usage: any;
  try {
    for await (const chunk of stream) {
      buffer += decoder.decode(chunk, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          if (json.usage) usage = json.usage;
          const delta = json.choices?.[0]?.delta;
          output += (delta?.content ?? "") + (delta?.reasoning ?? "");
        } catch {
          // not JSON (e.g. an OpenRouter keep-alive comment)
        }
      }
    }
  } catch (e) {
    console.warn("Failed to read usage from stream, estimating", e);
  }
  return toCall(usage, promptText, output);
};

// fetch for the OpenRouter client. Outside ChatUsage.track it is plain fetch.
export const trackedFetch = async (url: any, init?: any): Promise<any> => {
  const { fetch, Response } = globalThis as any;
  const usage = usageStorage.getStore();
  if (!usage || typeof init?.body !== "string") {
    return fetch(url, init);
  }

  let body: any;
  try {
    body = JSON.parse(init.body);
  } catch {
    return fetch(url, init);
  }
  if (!Array.isArray(body?.messages)) {
    return fetch(url, init);
  }

  if (body.stream) {
    // Ask for the usage chunk at the end of the stream
    body.stream_options = { ...body.stream_options, include_usage: true };
    const headers = Object.fromEntries(
      Object.entries(init.headers || {}).filter(
        ([k]) => k.toLowerCase() !== "content-length"
      )
    );
    init = { ...init, headers, body: JSON.stringify(body) };
  }

  const response = await fetch(url, init);
  // OpenRouter does not bill failed requests
  if (!response.ok || !response.body) {
    return response;
  }

  const promptText = messageText(body.messages);
  if (body.stream) {
    const [forClient, forUsage] = response.body.tee();
    usage.record(readStreamUsage(forUsage, promptText));
    return new Response(forClient, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  usage.record(
    response
      .clone()
      .json()
      .then((data: any) =>
        toCall(data?.usage, promptText, data?.choices?.[0]?.message?.content ?? "")
      )
      .catch(() => toCall(undefined, promptText, ""))
  );
  return response;
};
