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
      name: "GPT-5 (OpenAI)",
      model_id: "openai/gpt-5",
      model_type: "chat",
      model_provider: "OpenAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GPT-5.2 (OpenAI)",
      model_id: "openai/gpt-5.2",
      model_type: "chat",
      model_provider: "OpenAI",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Opus 4.5 (Anthropic)",
      model_id: "anthropic/claude-opus-4.5",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Sonnet 4.5 (Anthropic)",
      model_id: "anthropic/claude-sonnet-4.5",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Claude Haiku 4.5 (Anthropic)",
      model_id: "anthropic/claude-haiku-4.5",
      model_type: "chat",
      model_provider: "Anthropic",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Google Gemini 2.5 Pro",
      model_id: "google/gemini-2.5-pro",
      model_type: "chat",
      model_provider: "Google",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Google Gemini 2.5 Flash",
      model_id: "google/gemini-2.5-flash",
      model_type: "chat",
      model_provider: "Google",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "Grok 4.1 Fast (xAI)",
      model_id: "x-ai/grok-4.1-fast",
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
      name: "Mistral Large 2512",
      model_id: "mistralai/mistral-large-2512",
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
      name: "MiniMax M2.1",
      model_id: "minimax/minimax-m2.1",
      model_type: "chat",
      model_provider: "MiniMax",
      stream_available: true,
      local_model: false,
      config: "{}",
    },
    {
      name: "GLM 4.7 (Z.AI)",
      model_id: "z-ai/glm-4.7",
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
  await prisma.dialoqbaseModels.update({
    where: {
      model_id: "gemini-pro",
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
