export const COST_MULTIPLIER = 250;
export const MIN_CHAT_COST = 0.02;
export const MIN_EMBEDDING_COST = 0.002;

export const MODEL_PRICING = {
    // OpenAI
    "openai/gpt-5": { input: 15.0, output: 60.0 },
    "openai/gpt-5.2": { input: 30.0, output: 120.0 },

    // Perplexity
    "perplexity/sonar-pro-search": { input: 3.0, output: 15.0 },
    "perplexity/sonar-reasoning-pro": { input: 2.0, output: 8.0 },
    "perplexity/sonar-pro": { input: 3.0, output: 15.0 },
    "perplexity/sonar-deep-research": { input: 2.0, output: 8.0, request: 0.005 },

    // Z.AI
    "z-ai/glm-4.7": { input: 5.0, output: 20.0 },

    // Anthropic
    "anthropic/claude-opus-4.5": { input: 15.0, output: 75.0 },
    "anthropic/claude-sonnet-4.5": { input: 3.0, output: 15.0 },
    "anthropic/claude-haiku-4.5": { input: 0.25, output: 1.25 },

    // Google
    "google/gemini-2.5-pro": { input: 1.25, output: 2.5 },
    "google/gemini-2.5-flash": { input: 0.075, output: 0.30 },

    // xAI
    "x-ai/grok-4.1-fast": { input: 2.0, output: 8.0 },

    // Meta
    "meta-llama/llama-4-maverick": { input: 3.5, output: 5.0 },
    "meta-llama/llama-4-scout": { input: 0.2, output: 0.2 },

    // Mistral
    "mistralai/mistral-large-2512": { input: 2.0, output: 6.0 },
    "mistralai/ministral-14b-2512": { input: 0.2, output: 0.2 },

    // MiniMax
    "minimax/minimax-m2.1": { input: 5.0, output: 20.0 },

    // Default
    "default": { input: 1.0, output: 1.0 }
};

export const EMBEDDING_PRICING = {
    "text-embedding-ada-002": { input: 0.10 },
    "text-embedding-3-small": { input: 0.02 },
    "text-embedding-3-large": { input: 0.13 },
    "default": { input: 0.10 }
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
