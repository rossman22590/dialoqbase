export const COST_MULTIPLIER = 500;
export const MIN_CHAT_COST = 0.04;
export const MIN_EMBEDDING_COST = 0.004;

// We always charge 50% over what the provider charges us
export const PRICE_MARKUP = 1.5;

type Rates = { input: number; output: number };

type Pricing = Rates & {
    request?: number;
    // Higher rates applied to a call whose prompt reaches minPromptTokens
    tiers?: (Rates & { minPromptTokens: number })[];
};

// One LLM call. providerCost is the USD amount OpenRouter reported for it, when known.
export type ChatCall = {
    inputTokens: number;
    outputTokens: number;
    providerCost?: number;
};

const withMarkup = <T>(value: T): T => {
    if (typeof value === "number") {
        return (value * PRICE_MARKUP) as T;
    }
    if (Array.isArray(value)) {
        return value.map(withMarkup) as T;
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [
                k,
                k === "minPromptTokens" ? v : withMarkup(v),
            ])
        ) as T;
    }
    return value;
};

// Provider cost in USD per 1M tokens (request = USD per call), from
// https://openrouter.ai/api/v1/models as of 2026-10-23
const MODEL_COST: Record<string, Pricing> = {
    // OpenAI
    "openai/gpt-6.1-sol": {
        input: 2.0, output: 10.0,
        tiers: [{ minPromptTokens: 272000, input: 4.0, output: 15.0 }],
    },
    "openai/gpt-6-luna": {
        input: 0.1, output: 0.5,
        tiers: [{ minPromptTokens: 272000, input: 0.2, output: 0.75 }],
    },
    "openai/gpt-5.6-sol": {
        input: 4.0, output: 20.0,
        tiers: [{ minPromptTokens: 272000, input: 8.0, output: 30.0 }],
    },
    "openai/gpt-5.6-terra": {
        input: 2.0, output: 12.0,
        tiers: [{ minPromptTokens: 272000, input: 4.0, output: 18.0 }],
    },

    // Perplexity (request = per-call web search fee)
    "perplexity/sonar-pro-search": { input: 3.0, output: 15.0, request: 0.018 },
    "perplexity/sonar-reasoning-pro": { input: 2.0, output: 8.0, request: 0.005 },
    "perplexity/sonar-pro": { input: 3.0, output: 15.0, request: 0.005 },
    "perplexity/sonar-deep-research": { input: 2.0, output: 8.0, request: 0.005 },

    // Z.AI
    "z-ai/glm-5.3": { input: 0.079, output: 1.4 },
    "z-ai/glm-5.3-flash": { input: 0.15, output: 0.5 },

    // Anthropic
    "anthropic/claude-fable-5.1": { input: 10.0, output: 50.0 },
    "anthropic/claude-opus-5.5": { input: 4.0, output: 20.0 },
    "anthropic/claude-sonnet-5.5": { input: 2.0, output: 10.0 },
    "anthropic/claude-haiku-5.5": {
        input: 0.1, output: 0.5,
        tiers: [{ minPromptTokens: 100000, input: 0.5, output: 2.5 }],
    },

    // Google
    "google/gemini-4-argon": { input: 2.0, output: 10.0 },
    "google/gemini-3.1-pro-preview": {
        input: 2.0, output: 12.0,
        tiers: [{ minPromptTokens: 200000, input: 4.0, output: 18.0 }],
    },
    "google/gemini-3.8-flash": { input: 0.825, output: 4.125 },

    // xAI
    "x-ai/grok-4.7": {
        input: 2.0, output: 6.0,
        tiers: [{ minPromptTokens: 200000, input: 4.0, output: 12.0 }],
    },

    // Meta
    "meta-llama/llama-4-maverick": { input: 0.1875, output: 0.6525 },
    "meta-llama/llama-4-scout": { input: 0.1, output: 0.3 },

    // Mistral
    "mistralai/mistral-large-4-0": { input: 1.36, output: 4.18 },
    "mistralai/ministral-14b-2512": { input: 0.2, output: 0.2 },

    // MiniMax
    "minimax/minimax-m3": { input: 0.3, output: 1.2 },
    "minimax/minimax-m3.1-flash": { input: 0.15, output: 0.6 },

    // Default
    "default": { input: 1.0, output: 1.0 }
};

// Provider cost in USD per 1M tokens (OpenAI)
const EMBEDDING_COST: Record<string, { input: number }> = {
    "text-embedding-ada-002": { input: 0.10 },
    "text-embedding-3-small": { input: 0.02 },
    "text-embedding-3-large": { input: 0.13 },
    "default": { input: 0.10 }
};

export const MODEL_PRICING = withMarkup(MODEL_COST);
export const EMBEDDING_PRICING = withMarkup(EMBEDDING_COST);

export const normalizeChatModelId = (modelId: string) =>
    modelId.replace("-dbase", "").replace(/_dialoqbase_[0-9]+$/, "");

export const getModelPricing = (modelId: string): Pricing =>
    MODEL_PRICING[modelId] ||
    MODEL_PRICING[normalizeChatModelId(modelId)] ||
    MODEL_PRICING.default;

const ownEntry = <T>(table: Record<string, T>, key: string): T | undefined =>
    key !== "default" && Object.prototype.hasOwnProperty.call(table, key)
        ? table[key]
        : undefined;

// What a user's balance is charged per 1M tokens for a model, as shown in the
// model settings: provider cost x PRICE_MARKUP x COST_MULTIPLIER, the same
// units calculateChatCost / calculateEmbeddingCost deduct. Prices are null
// when the model is not in our tables (it is then charged at the default rate).
export const listedModelPrices = (modelId: string, modelType: string) => {
    const billed = (usd: number | null | undefined) =>
        usd === null || usd === undefined ? null : usd * COST_MULTIPLIER;
    if (modelType === "embedding") {
        const pricing =
            ownEntry(EMBEDDING_PRICING, modelId) ??
            ownEntry(EMBEDDING_PRICING, normalizeEmbeddingModelId(modelId));
        return {
            input_price_per_1m: billed(pricing?.input),
            output_price_per_1m: null,
            request_price: null,
            price_tiers: [],
        };
    }
    const pricing =
        ownEntry(MODEL_PRICING, modelId) ??
        ownEntry(MODEL_PRICING, normalizeChatModelId(modelId));
    return {
        input_price_per_1m: billed(pricing?.input),
        output_price_per_1m: billed(pricing?.output),
        request_price: billed(pricing?.request),
        price_tiers: (pricing?.tiers || []).map((tier) => ({
            min_prompt_tokens: tier.minPromptTokens,
            input_price_per_1m: billed(tier.input),
            output_price_per_1m: billed(tier.output),
        })),
    };
};

const ratesForPrompt = (pricing: Pricing, promptTokens: number): Rates =>
    (pricing.tiers || [])
        .filter((tier) => promptTokens >= tier.minPromptTokens)
        .sort((a, b) => b.minPromptTokens - a.minPromptTokens)[0] || pricing;

// What we charge for one call, in USD (markup included). Uses OpenRouter's
// reported cost when that comes out higher than our table, e.g. for
// pricing we don't model like image or audio input.
export const priceChatCall = (modelId: string, call: ChatCall) => {
    const pricing = getModelPricing(modelId);
    const rates = ratesForPrompt(pricing, call.inputTokens);
    const tablePrice =
        (rates.input * call.inputTokens) / 1000000 +
        (rates.output * call.outputTokens) / 1000000 +
        Number(pricing.request ?? 0);
    return Math.max(tablePrice, (call.providerCost ?? 0) * PRICE_MARKUP);
};

// Credits to charge for every LLM call made while answering one message
export const calculateChatCost = (modelId: string, calls: ChatCall[]) => {
    const usd = calls.reduce((sum, call) => sum + priceChatCall(modelId, call), 0);
    return Math.max(usd * COST_MULTIPLIER, MIN_CHAT_COST);
};

export const normalizeEmbeddingModelId = (modelId: string) => {
    const cleaned = modelId
        .replace("dialoqbase_eb_", "")
        .replace(/_dialoqbase_[0-9]+$/, "");
    if (cleaned.includes("/")) {
        return cleaned.split("/").pop() || cleaned;
    }
    return cleaned;
};

export const calculateEmbeddingCost = (modelId: string, tokens: number) => {
    const normalized = normalizeEmbeddingModelId(modelId);
    const pricing =
        EMBEDDING_PRICING[modelId] ||
        EMBEDDING_PRICING[normalized] ||
        EMBEDDING_PRICING.default;
    const baseCost = (Number(pricing.input) * tokens) / 1000000;
    const cost = baseCost * COST_MULTIPLIER;
    return Math.max(cost, MIN_EMBEDDING_COST);
};
