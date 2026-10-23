-- Upsert current models (OpenRouter catalog as of 2026-10-23)
INSERT INTO "DialoqbaseModels" (model_id, name, model_type, model_provider, stream_available, local_model, config, hide, deleted, "createdAt")
VALUES
  -- OpenAI
  ('openai/gpt-6.1-sol', 'GPT-6.1 Sol (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  ('openai/gpt-6-luna', 'GPT-6 Luna (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  ('openai/gpt-5.6-sol', 'GPT-5.6 Sol (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  ('openai/gpt-5.6-terra', 'GPT-5.6 Terra (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),

  -- Anthropic
  ('anthropic/claude-fable-5.1', 'Claude Fable 5.1 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-opus-5.5', 'Claude Opus 5.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-sonnet-5.5', 'Claude Sonnet 5.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-haiku-5.5', 'Claude Haiku 5.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),

  -- Google
  ('google/gemini-4-argon', 'Google Gemini 4 Argon', 'chat', 'Google', true, false, '{}', false, false, NOW()),
  ('google/gemini-3.1-pro-preview', 'Google Gemini 3.1 Pro (Preview)', 'chat', 'Google', true, false, '{}', false, false, NOW()),
  ('google/gemini-3.8-flash', 'Google Gemini 3.8 Flash', 'chat', 'Google', true, false, '{}', false, false, NOW()),

  -- xAI
  ('x-ai/grok-4.7', 'Grok 4.7 (xAI)', 'chat', 'xAI', true, false, '{}', false, false, NOW()),

  -- Meta Llama
  ('meta-llama/llama-4-maverick', 'Llama 4 Maverick (Meta)', 'chat', 'Meta', true, false, '{}', false, false, NOW()),
  ('meta-llama/llama-4-scout', 'Llama 4 Scout (Meta)', 'chat', 'Meta', true, false, '{}', false, false, NOW()),

  -- Mistral
  ('mistralai/mistral-large-4-0', 'Mistral Large 4', 'chat', 'Mistral', true, false, '{}', false, false, NOW()),
  ('mistralai/ministral-14b-2512', 'Ministral 3 14B 2512', 'chat', 'Mistral', true, false, '{}', false, false, NOW()),

  -- MiniMax
  ('minimax/minimax-m3', 'MiniMax M3', 'chat', 'MiniMax', true, false, '{}', false, false, NOW()),
  ('minimax/minimax-m3.1-flash', 'MiniMax M3.1 Flash', 'chat', 'MiniMax', true, false, '{}', false, false, NOW()),

  -- Z.AI
  ('z-ai/glm-5.3', 'GLM 5.3 (Z.AI)', 'chat', 'Z.AI', true, false, '{}', false, false, NOW()),
  ('z-ai/glm-5.3-flash', 'GLM 5.3 Flash (Z.AI)', 'chat', 'Z.AI', true, false, '{}', false, false, NOW()),

  -- Perplexity
  ('perplexity/sonar-pro-search', 'Perplexity: Sonar Pro Search', 'chat', 'Perplexity', true, false, '{}', false, false, NOW()),
  ('perplexity/sonar-reasoning-pro', 'Perplexity: Sonar Reasoning Pro', 'chat', 'Perplexity', true, false, '{}', false, false, NOW()),
  ('perplexity/sonar-pro', 'Perplexity: Sonar Pro', 'chat', 'Perplexity', true, false, '{}', false, false, NOW()),
  ('perplexity/sonar-deep-research', 'Perplexity: Sonar Deep Research', 'chat', 'Perplexity', true, false, '{}', false, false, NOW())

ON CONFLICT (model_id) DO UPDATE SET
  name = EXCLUDED.name,
  model_type = EXCLUDED.model_type,
  model_provider = EXCLUDED.model_provider,
  stream_available = EXCLUDED.stream_available,
  local_model = EXCLUDED.local_model,
  config = EXCLUDED.config,
  hide = false,
  deleted = false;

-- Soft delete every hosted chat model not in the current list (user-added local models are left alone)
UPDATE "DialoqbaseModels"
SET hide = true, deleted = true
WHERE model_type = 'chat'
  AND local_model = false
  AND model_id NOT IN (
    'openai/gpt-6.1-sol',
    'openai/gpt-6-luna',
    'anthropic/claude-fable-5.1',
    'google/gemini-4-argon',
    'minimax/minimax-m3.1-flash',
    'z-ai/glm-5.3-flash',
    'openai/gpt-5.6-sol',
    'openai/gpt-5.6-terra',
    'anthropic/claude-opus-5.5',
    'anthropic/claude-sonnet-5.5',
    'anthropic/claude-haiku-5.5',
    'google/gemini-3.1-pro-preview',
    'google/gemini-3.8-flash',
    'x-ai/grok-4.7',
    'meta-llama/llama-4-maverick',
    'meta-llama/llama-4-scout',
    'mistralai/mistral-large-4-0',
    'mistralai/ministral-14b-2512',
    'minimax/minimax-m3',
    'z-ai/glm-5.3',
    'perplexity/sonar-pro-search',
    'perplexity/sonar-reasoning-pro',
    'perplexity/sonar-pro',
    'perplexity/sonar-deep-research'
  );

-- Move bots off replaced models onto their successor
UPDATE "Bot" AS b
SET model = m.new_model
FROM (VALUES
  ('openai/gpt-5', 'openai/gpt-5.6-terra'),
  ('openai/gpt-5.2', 'openai/gpt-5.6-sol'),
  ('anthropic/claude-opus-4.5', 'anthropic/claude-opus-5.5'),
  ('anthropic/claude-sonnet-4.5', 'anthropic/claude-sonnet-5.5'),
  ('anthropic/claude-haiku-4.5', 'anthropic/claude-haiku-5.5'),
  ('google/gemini-2.5-pro', 'google/gemini-3.1-pro-preview'),
  ('google/gemini-2.5-flash', 'google/gemini-3.8-flash'),
  ('x-ai/grok-4.1-fast', 'x-ai/grok-4.7'),
  ('mistralai/mistral-large-2512', 'mistralai/mistral-large-4-0'),
  ('mistralai/mixtral-8x22b-instruct', 'mistralai/mistral-large-4-0'),
  ('minimax/minimax-m2.1', 'minimax/minimax-m3'),
  ('z-ai/glm-4.7', 'z-ai/glm-5.3')
) AS m(old_model, new_model)
WHERE b.model = m.old_model;

-- Any other bot whose model is no longer live (a removed hosted model such as
-- gpt-3.5-turbo, even one with no row left) goes to the default. Bots on a
-- user-added local model are left alone.
UPDATE "Bot" AS b
SET model = 'openai/gpt-5.6-terra'
WHERE NOT EXISTS (
    SELECT 1 FROM "DialoqbaseModels" dm
    WHERE dm.deleted = false
      AND (dm.model_id = b.model OR dm.model_id = b.model || '-dbase')
  )
  AND NOT EXISTS (
    SELECT 1 FROM "DialoqbaseModels" dm
    WHERE dm.local_model = true
      AND (dm.model_id = b.model OR dm.model_id = b.model || '-dbase')
  );

-- Keep each bot's provider in sync with its model
UPDATE "Bot" AS b
SET provider = dm.model_provider
FROM "DialoqbaseModels" dm
WHERE dm.model_id = b.model
  AND dm.deleted = false
  AND dm.local_model = false
  AND dm.model_provider IS NOT NULL
  AND b.provider IS DISTINCT FROM dm.model_provider;

-- Point the default chat model at a live model
UPDATE "DialoqbaseSettings"
SET "defaultChatModel" = 'openai/gpt-5.6-terra'
WHERE "defaultChatModel" NOT IN (
  SELECT model_id FROM "DialoqbaseModels" WHERE deleted = false AND model_type = 'chat'
);

ALTER TABLE "Bot" ALTER COLUMN "model" SET DEFAULT 'openai/gpt-5.6-terra';
ALTER TABLE "DialoqbaseSettings" ALTER COLUMN "defaultChatModel" SET DEFAULT 'openai/gpt-5.6-terra';
