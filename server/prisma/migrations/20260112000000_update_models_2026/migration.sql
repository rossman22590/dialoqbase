-- Upsert New 2026 Models
INSERT INTO "DialoqbaseModels" (model_id, name, model_type, model_provider, stream_available, local_model, config, hide, deleted, "createdAt")
VALUES
  ('openai/gpt-5', 'GPT-5 (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  ('openai/gpt-5.2', 'GPT-5.2 (OpenAI)', 'chat', 'OpenAI', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-opus-4.5', 'Claude Opus 4.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-sonnet-4.5', 'Claude Sonnet 4.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('anthropic/claude-haiku-4.5', 'Claude Haiku 4.5 (Anthropic)', 'chat', 'Anthropic', true, false, '{}', false, false, NOW()),
  ('google/gemini-2.5-pro', 'Google Gemini 2.5 Pro', 'chat', 'Google', true, false, '{}', false, false, NOW()),
  ('google/gemini-2.5-flash', 'Google Gemini 2.5 Flash', 'chat', 'Google', true, false, '{}', false, false, NOW()),
  ('x-ai/grok-4.1-fast', 'Grok 4.1 Fast (xAI)', 'chat', 'xAI', true, false, '{}', false, false, NOW()),
  ('meta-llama/llama-4-maverick', 'Llama 4 Maverick (Meta)', 'chat', 'Meta', true, false, '{}', false, false, NOW()),
  ('meta-llama/llama-4-scout', 'Llama 4 Scout (Meta)', 'chat', 'Meta', true, false, '{}', false, false, NOW()),
  ('mistralai/mixtral-8x22b-instruct', 'Mixtral 8x22B Instruct', 'chat', 'Mistral', true, false, '{}', false, false, NOW())
ON CONFLICT (model_id) DO UPDATE SET
  name = EXCLUDED.name,
  model_type = EXCLUDED.model_type,
  model_provider = EXCLUDED.model_provider,
  stream_available = EXCLUDED.stream_available,
  local_model = EXCLUDED.local_model,
  config = EXCLUDED.config,
  hide = false,
  deleted = false;

-- Soft Delete Legacy Models (Hide them from UI)
-- Valid 2026 Models List
WITH ValidModels AS (
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
    'mistralai/mixtral-8x22b-instruct'
  ]) AS model_id
)
UPDATE "DialoqbaseModels"
SET hide = true, deleted = true
WHERE model_id NOT IN (SELECT model_id FROM ValidModels)
  AND model_type = 'chat'; -- Only clean up chat models, leave embeddings alone
