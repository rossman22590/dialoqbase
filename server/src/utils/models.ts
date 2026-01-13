import { ChatOpenAI } from "@langchain/openai";

export const chatModelProvider = (
  provider: string,
  modelName: string,
  temperature: number,
  otherFields?: any
) => {
  // Clean up model name artifacts if any
  let cleanModelName = modelName.replace("-dbase", "");
  cleanModelName = cleanModelName.replace(/_dialoqbase_[0-9]+$/, "");

  // Construct OpenRouter model ID
  // If the model name already contains a slash, assume it's already an OpenRouter ID (e.g. "openai/gpt-4")
  // Otherwise, attempt to construct it from the legacy provider + model name
  let openRouterModel = cleanModelName;
  if (!cleanModelName.includes("/")) {
    switch (provider.toLowerCase()) {
      case "openai":
        openRouterModel = `openai/${cleanModelName}`;
        break;
      case "anthropic":
        openRouterModel = `anthropic/${cleanModelName}`;
        break;
      case "google":
      case "google-bison":
        openRouterModel = `google/${cleanModelName}`;
        break;
      case "fireworks":
        // Fireworks models usually lack the vendor prefix in the old list, but OpenRouter has names like 'fireworks/firellava-13b' or 'meta-llama/...'
        // For safety with legacy fireworks string, we might try to map common ones or just default to the name if unsure.
        // Many fireworks models are actually meta-llama on OpenRouter.
        if (cleanModelName.includes("llama")) {
          openRouterModel = `meta-llama/${cleanModelName}`;
        } else if (cleanModelName.includes("mistral")) {
          openRouterModel = `mistralai/${cleanModelName}`;
        } else {
          openRouterModel = `fireworks/${cleanModelName}`;
        }
        break;
      case "meta":
        openRouterModel = `meta-llama/${cleanModelName}`;
        break;
      case "mistral":
        openRouterModel = `mistralai/${cleanModelName}`;
        break;
      case "cohere":
        openRouterModel = `cohere/${cleanModelName}`;
        break;
      default:
        // Fallback: use the model name as is, or prepend provider if sensible
        openRouterModel = `${provider}/${cleanModelName}`;
        break;
    }
  }

  // Common OpenRouter Configuration
  const openRouterConfig = {
    temperature: temperature,
    openAIApiKey: otherFields?.configuration?.apiKey || process.env.OPENROUTER_API_KEY,
    ...otherFields,
    modelName: openRouterModel,
    tiktokenModelName: otherFields?.tiktokenModelName || "gpt-4",
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: otherFields?.configuration?.apiKey || process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.LOCAL_REFER_URL || "https://myapps.ai/", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": process.env.LOCAL_TITLE || "Botcraft", // Optional. Site title for rankings on openrouter.ai.
      },
      ...otherFields?.configuration,
    },
  };

  return new ChatOpenAI(openRouterConfig);
};


export const streamingSupportedModels = [
  "openai/gpt-5",
  "openai/gpt-5.2",
  "anthropic/claude-opus-4.5",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-haiku-4.5",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "x-ai/grok-4.1-fast",
  "meta-llama/llama-4-maverick",
  "meta-llama/llama-4-scout",
  "mistralai/mistral-large-2512",
  "mistralai/ministral-14b-2512",
  "minimax/minimax-m2.1",
  "z-ai/glm-4.7"
];

export const isStreamingSupported = (model: string) => {
  return streamingSupportedModels.includes(model);
};

export const notChatModels = [
  "dialoqbase_eb_text-embedding-ada-002",
  "dialoqbase_eb_text-embedding-3-small",
  "dialoqbase_eb_text-embedding-3-large"
];

export const supportedModels = [
  "openai/gpt-5",
  "openai/gpt-5.2",
  "anthropic/claude-opus-4.5",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-haiku-4.5",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "x-ai/grok-4.1-fast",
  "meta-llama/llama-4-maverick",
  "meta-llama/llama-4-scout",
  "mistralai/mistral-large-2512",
  "mistralai/ministral-14b-2512",
  "minimax/minimax-m2.1",
  "z-ai/glm-4.7",
  "perplexity/sonar-pro-search",
  "perplexity/sonar-reasoning-pro",
  "perplexity/sonar-pro",
  "perplexity/sonar-deep-research",
  "dialoqbase_eb_text-embedding-ada-002",
  "dialoqbase_eb_text-embedding-3-small",
  "dialoqbase_eb_text-embedding-3-large"
];

