import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const LLMS: {
  name: string;
  model_id: string;
  model_type: string;
  model_provider?: string;
  stream_available?: boolean;
  local_model?: boolean;
  config?: string;
}[] = [
    {
      name: "GPT-6.1 Sol (OpenAI)",
      model_id: "openai/gpt-6.1-sol",
      model_type: "chat",
      model_provider: "OpenAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GPT-6 Luna (OpenAI)",
      model_id: "openai/gpt-6-luna",
      model_type: "chat",
      model_provider: "OpenAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GPT-5.6 Sol (OpenAI)",
      model_id: "openai/gpt-5.6-sol",
      model_type: "chat",
      model_provider: "OpenAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GPT-5.6 Terra (OpenAI)",
      model_id: "openai/gpt-5.6-terra",
      model_type: "chat",
      model_provider: "OpenAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Fable 5.1 (Anthropic)",
      model_id: "anthropic/claude-fable-5.1",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Opus 5.5 (Anthropic)",
      model_id: "anthropic/claude-opus-5.5",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Sonnet 5.5 (Anthropic)",
      model_id: "anthropic/claude-sonnet-5.5",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Haiku 5.5 (Anthropic)",
      model_id: "anthropic/claude-haiku-5.5",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Google Gemini 4 Argon",
      model_id: "google/gemini-4-argon",
      model_type: "chat",
      model_provider: "Google",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Google Gemini 3.1 Pro (Preview)",
      model_id: "google/gemini-3.1-pro-preview",
      model_type: "chat",
      model_provider: "Google",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Google Gemini 3.8 Flash",
      model_id: "google/gemini-3.8-flash",
      model_type: "chat",
      model_provider: "Google",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Grok 4.7 (xAI)",
      model_id: "x-ai/grok-4.7",
      model_type: "chat",
      model_provider: "xAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Llama 4 Maverick (Meta)",
      model_id: "meta-llama/llama-4-maverick",
      model_type: "chat",
      model_provider: "Meta",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Llama 4 Scout (Meta)",
      model_id: "meta-llama/llama-4-scout",
      model_type: "chat",
      model_provider: "Meta",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Mistral Large 4",
      model_id: "mistralai/mistral-large-4-0",
      model_type: "chat",
      model_provider: "Mistral",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Ministral 3 14B 2512",
      model_id: "mistralai/ministral-14b-2512",
      model_type: "chat",
      model_provider: "Mistral",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "MiniMax M3",
      model_id: "minimax/minimax-m3",
      model_type: "chat",
      model_provider: "MiniMax",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "MiniMax M3.1 Flash",
      model_id: "minimax/minimax-m3.1-flash",
      model_type: "chat",
      model_provider: "MiniMax",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GLM 5.3 (Z.AI)",
      model_id: "z-ai/glm-5.3",
      model_type: "chat",
      model_provider: "Z.AI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GLM 5.3 Flash (Z.AI)",
      model_id: "z-ai/glm-5.3-flash",
      model_type: "chat",
      model_provider: "Z.AI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Perplexity: Sonar Pro Search",
      model_id: "perplexity/sonar-pro-search",
      model_type: "chat",
      model_provider: "Perplexity",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Perplexity: Sonar Reasoning Pro",
      model_id: "perplexity/sonar-reasoning-pro",
      model_type: "chat",
      model_provider: "Perplexity",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Perplexity: Sonar Pro",
      model_id: "perplexity/sonar-pro",
      model_type: "chat",
      model_provider: "Perplexity",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Perplexity: Sonar Deep Research",
      model_id: "perplexity/sonar-deep-research",
      model_type: "chat",
      model_provider: "Perplexity",
      stream_available: true,
      local_model: false,
      config: "{}",
    }
  ];

const EMBEDDING_MODELS: {
  name: string;
  model_id: string;
  model_type: string;
  model_provider?: string;
  stream_available?: boolean;
  local_model?: boolean;
  config?: string;
}[] = [
    {
      model_id: "dialoqbase_eb_text-embedding-ada-002",
      name: "text-embedding-ada-002",
      model_provider: "OpenAI",
      model_type: "embedding",
    },
    {
      model_id: "dialoqbase_eb_text-embedding-3-small",
      name: "text-embedding-3-small (OpenAI)",
      model_type: "embedding",
      model_provider: "OpenAI",
    },
    {
      model_id: "dialoqbase_eb_text-embedding-3-large",
      name: "text-embedding-3-large (OpenAI)",
      model_type: "embedding",
      model_provider: "OpenAI",
    }
  ];

const newModels = async () => {
  console.log("Seeding new models...");
  for (const model of LLMS) {
    await prisma.dialoqbaseModels.upsert({
      where: {
        model_id: model.model_id,
      },
      update: {
        name: model.name,
      },
      create: model,
    });
  }

  for (const model of EMBEDDING_MODELS) {
    await prisma.dialoqbaseModels.upsert({
      where: {
        model_id: model.model_id,
      },
      update: {
        name: model.name,
      },
      create: model,
    });
  }
};

const removeTensorflowSupport = async () => {
  await prisma.bot.updateMany({
    where: {
      embedding: "tensorflow",
    },
    data: {
      embedding: "transformer",
    },
  });
};

// const replaceOldEmbeddings = async () => {
//   await prisma.bot.updateMany({
//     where: {
//       embedding: "openai",
//     },
//     data: {
//       embedding: "dialoqbase_eb_text-embedding-ada-002",
//     },
//   });

//   await prisma.bot.updateMany({
//     where: {
//       embedding: "cohere",
//     },
//     data: {
//       embedding: "dialoqbase_eb_small",
//     },
//   });

//   await prisma.bot.updateMany({
//     where: {
//       embedding: "transformer",
//     },
//     data: {
//       embedding: "dialoqbase_eb_Xenova/all-MiniLM-L6-v2",
//     },
//   });

//   await prisma.bot.updateMany({
//     where: {
//       embedding: "google-gecko",
//     },
//     data: {
//       embedding: "dialoqbase_eb_models/embedding-gecko-001",
//     },
//   });

//   await prisma.bot.updateMany({
//     where: {
//       embedding: "jina-api",
//     },
//     data: {
//       embedding: "dialoqbase_eb_jina-embeddings-v2-base-en",
//     },
//   });

//   await prisma.bot.updateMany({
//     where: {
//       embedding: "jina",
//     },
//     data: {
//       embedding: "dialoqbase_eb_Xenova/jina-embeddings-v2-small-en",
//     },
//   });

//   await prisma.bot.updateMany({
//     where: {
//       embedding: "google",
//     },
//     data: {
//       embedding: "dialoqbase_eb_embedding-001",
//     },
//   });
// };

const updateGeminiStreamingToTrue = async () => {
  await prisma.dialoqbaseModels.updateMany({
    where: {
      model_id: {
        in: [
          "google/gemini-4-argon",
          "google/gemini-3.1-pro-preview",
          "google/gemini-3.8-flash",
        ],
      },
    },
    data: {
      stream_available: true,
    },
  });
};

const main = async () => {
  if (process.env.NO_SEED === "true") {
    console.log("Skipping seed script");
    return;
  }
  await newModels();
  await removeTensorflowSupport();
  // await replaceOldEmbeddings();
  await updateGeminiStreamingToTrue();
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
