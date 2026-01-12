-- Upsert New 2026/2025 Models
INSERT INTO "DialoqbaseModels" (model_id, name, model_type, model_provider, stream_available, local_model, config, hide, deleted, "createdAt")
VALUES
  -- OpenAI
  ('openai/gpt-5', 'GPT-5 (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  ('openai/gpt-5.2', 'GPT-5.2 (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  
  -- Anthropic
  ('anthropic/claude-opus-4.5', 'Claude Opus 4.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-sonnet-4.5', 'Claude Sonnet 4.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-haiku-4.5', 'Claude Haiku 4.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),

  -- Google
  ('google/gemini-2.5-pro', 'Google Gemini 2.5 Pro', 'chat', 'Google', true, false, '{}', false, false, NOW()),
  ('google/gemini-2.5-flash', 'Google Gemini 2.5 Flash', 'chat', 'Google', true, false, '{}', false, false, NOW()),

  -- xAI
  ('x-ai/grok-4.1-fast', 'Grok 4.1 Fast (xAI)', 'chat', 'xAI', true, false, '{}', false, false, NOW()),

  -- Meta Llama
  ('meta-llama/llama-4-maverick', 'Llama 4 Maverick (Meta)', 'chat', 'Meta', true, false, '{}', false, false, NOW()),
  ('meta-llama/llama-4-scout', 'Llama 4 Scout (Meta)', 'chat', 'Meta', true, false, '{}', false, false, NOW()),

  -- Mistral
  ('mistralai/mistral-large-2512', 'Mistral Large 2512', 'chat', 'Mistral', true, false, '{}', false, false, NOW()),
  ('mistralai/ministral-14b-2512', 'Ministral 3 14B 2512', 'chat', 'Mistral', true, false, '{}', false, false, NOW()),

  -- MiniMax
  ('minimax/minimax-m2.1', 'MiniMax M2.1', 'chat', 'MiniMax', true, false, '{}', false, false, NOW()),

  -- Z.AI
  ('z-ai/glm-4.7', 'GLM 4.7 (Z.AI)', 'chat', 'Z.AI', true, false, '{}', false, false, NOW()),

  -- Embeddings
  ('dialoqbase_eb_text-embedding-ada-002', 'text-embedding-ada-002', 'embedding', 'OpenAI', false, false, '{}', false, false, NOW()),
  ('dialoqbase_eb_text-embedding-3-small', 'text-embedding-3-small (OpenAI)', 'embedding', 'OpenAI', false, false, '{}', false, false, NOW()),
  ('dialoqbase_eb_text-embedding-3-large', 'text-embedding-3-large (OpenAI)', 'embedding', 'OpenAI', false, false, '{}', false, false, NOW())

ON CONFLICT (model_id) DO UPDATE SET
  name = EXCLUDED.name,
  model_type = EXCLUDED.model_type,
  model_provider = EXCLUDED.model_provider,
  stream_available = EXCLUDED.stream_available,
  local_model = EXCLUDED.local_model,
  config = EXCLUDED.config,
  hide = false,
  deleted = false;

-- Soft Delete ALL Chat Models EXCEPT the new allowed list
WITH ValidChatModels AS (
  SELECT unnest(ARRAY[
    'openai/gpt-5',
    'openai/gpt-5.2',
    'anthropic/claude-opus-4.5',
    'anthropic/claude-sonnet-4.5',
    'anthropic/claude-haiku-4.5',
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'x-ai/grok-4.1-fast',
    'meta-llama/llama-4-maverick',
    'meta-llama/llama-4-scout',
    'mistralai/mistral-large-2512',
    'mistralai/ministral-14b-2512',
    'minimax/minimax-m2.1',
    'z-ai/glm-4.7'
  ]) AS model_id
)
UPDATE "DialoqbaseModels"
SET hide = true, deleted = true
WHERE model_id NOT IN (SELECT model_id FROM ValidChatModels)
  AND model_type = 'chat';

-- Soft Delete ALL Embedding Models EXCEPT the 3 allowed ones
WITH ValidEmbeddingModels AS (
  SELECT unnest(ARRAY[
    'dialoqbase_eb_text-embedding-ada-002',
    'dialoqbase_eb_text-embedding-3-small',
    'dialoqbase_eb_text-embedding-3-large'
  ]) AS model_id
)
UPDATE "DialoqbaseModels"
SET hide = true, deleted = true
WHERE model_id NOT IN (SELECT model_id FROM ValidEmbeddingModels)
  AND model_type = 'embedding';
