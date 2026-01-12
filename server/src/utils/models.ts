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
    modelName: openRouterModel,
    temperature: temperature,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    ...otherFields,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.LOCAL_REFER_URL || "https://myapps.ai/", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": process.env.LOCAL_TITLE || "Botcraft", // Optional. Site title for rankings on openrouter.ai.
      },
      ...otherFields.configuration,
    },
  };

  return new ChatOpenAI(openRouterConfig);
};


export const streamingSupportedModels = [
  "openai/gpt-3.5-turbo",
  "openai/gpt-4",
  "openai/gpt-4-turbo",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-opus",
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3-haiku",
  "google/gemini-pro-1.5",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3-8b-instruct",
  "meta-llama/llama-3-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct",
  "meta-llama/llama-3.1-70b-instruct",
  "mistralai/mistral-large",
  "mistralai/mixtral-8x22b-instruct"
];

export const isStreamingSupported = (model: string) => {
  return streamingSupportedModels.includes(model);
};

export const notChatModels = [
  // Deprecated or legacy models can be listed here if needed, but for now we keep it empty or with legacy values if strictly needed.
  // Keeping legacy entries just in case, but they aren't in our new lists.
];

export const supportedModels = [
  "openai/gpt-3.5-turbo",
  "openai/gpt-4",
  "openai/gpt-4-turbo",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-opus",
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3-haiku",
  "google/gemini-pro-1.5",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3-8b-instruct",
  "meta-llama/llama-3-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct",
  "meta-llama/llama-3.1-70b-instruct",
  "mistralai/mistral-large",
  "mistralai/mixtral-8x22b-instruct"
];

