-- Upsert Perplexity Models
INSERT INTO "DialoqbaseModels" (model_id, name, model_type, model_provider, stream_available, local_model, config, hide, deleted, "createdAt")
VALUES
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
