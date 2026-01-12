export const availableChatModels = [
  { value: "openai/gpt-5", label: "GPT-5 (OpenAI)" },
  { value: "openai/gpt-5.2", label: "GPT-5.2 (OpenAI)" },
  { value: "anthropic/claude-opus-4.5", label: "Claude Opus 4.5 (Anthropic)" },
  { value: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5 (Anthropic)" },
  { value: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5 (Anthropic)" },
  { value: "google/gemini-2.5-pro", label: "Google Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Google Gemini 2.5 Flash" },
  { value: "x-ai/grok-4.1-fast", label: "Grok 4.1 Fast (xAI)" },
  { value: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick (Meta)" },
  { value: "meta-llama/llama-4-scout", label: "Llama 4 Scout (Meta)" },
  { value: "mistralai/mixtral-8x22b-instruct", label: "Mixtral 8x22B Instruct" }
];

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
  "mistralai/mixtral-8x22b-instruct"
];

export const isStreamingSupported = (model: string) => {
  return streamingSupportedModels.includes(model);
};
