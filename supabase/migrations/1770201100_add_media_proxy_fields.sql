-- Add proxy fields for MP4 compatibility

ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS proxy_url TEXT,
  ADD COLUMN IF NOT EXISTS proxy_filename TEXT,
  ADD COLUMN IF NOT EXISTS proxy_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS proxy_size_bytes BIGINT;

DROP VIEW IF EXISTS v_catalogo_audit_recente CASCADE;
DROP VIEW IF EXISTS v_catalogo_stats CASCADE;
DROP VIEW IF EXISTS v_catalogo_completo CASCADE;
DROP VIEW IF EXISTS v_catalogo_ativo CASCADE;

-- View para itens ativos (excluindo deletados)
CREATE OR REPLACE VIEW v_catalogo_ativo AS
SELECT * FROM catalogo_itens
WHERE deleted_at IS NULL;

-- View completa com joins (preferir proxy quando disponível)
CREATE OR REPLACE VIEW v_catalogo_completo AS
SELECT 
  ci.id,
  ci.identificador,
  ci.titulo,
  ci.descricao,
  ci.data_captacao,
  ci.frase_memoria,
  ci.observacoes,
  ci.responsavel,
  ci.media_id,
  
  -- IDs de relacionamento
  ci.area_fazenda_id,
  ci.ponto_id,
  ci.tipo_projeto_id,
  ci.nucleo_pecuaria_id,
  ci.nucleo_agro_id,
  ci.operacao_id,
  ci.marca_id,
  ci.evento_id,
  ci.funcao_historica_id,
  ci.tema_principal_id,
  ci.status_id,
  ci.capitulo_id,
  
  -- Nomes das taxonomias
  af.name as area_fazenda_nome,
  p.name as ponto_nome,
  tp.name as tipo_projeto_nome,
  np.name as nucleo_pecuaria_nome,
  na.name as nucleo_agro_nome,
  op.name as operacao_nome,
  mv.name as marca_nome,
  ep.name as evento_nome,
  fh.name as funcao_historica_nome,
  tprinc.name as tema_principal_nome,
  sm.name as status_nome,
  cf.name as capitulo_nome,
  
  -- Dados de mídia (preferir proxy)
  COALESCE(ma.proxy_filename, ma.filename) as arquivo_nome,
  COALESCE(ma.proxy_mime_type, ma.mime_type) as arquivo_tipo,
  COALESCE(ma.proxy_size_bytes, ma.size_bytes) as arquivo_tamanho,
  COALESCE(ma.proxy_url, ma.public_url) as arquivo_url,
  ma.thumbnail_url,
  ma.width,
  ma.height,
  ma.duration_seconds,
  
  -- Metadados
  ci.created_at,
  ci.updated_at,
  ci.deleted_at
  
FROM catalogo_itens ci
LEFT JOIN taxonomy_categories af ON ci.area_fazenda_id = af.id
LEFT JOIN taxonomy_categories p ON ci.ponto_id = p.id
LEFT JOIN taxonomy_categories tp ON ci.tipo_projeto_id = tp.id
LEFT JOIN taxonomy_categories np ON ci.nucleo_pecuaria_id = np.id
LEFT JOIN taxonomy_categories na ON ci.nucleo_agro_id = na.id
LEFT JOIN taxonomy_categories op ON ci.operacao_id = op.id
LEFT JOIN taxonomy_categories mv ON ci.marca_id = mv.id
LEFT JOIN taxonomy_categories ep ON ci.evento_id = ep.id
LEFT JOIN taxonomy_categories fh ON ci.funcao_historica_id = fh.id
LEFT JOIN taxonomy_categories tprinc ON ci.tema_principal_id = tprinc.id
LEFT JOIN taxonomy_categories sm ON ci.status_id = sm.id
LEFT JOIN taxonomy_categories cf ON ci.capitulo_id = cf.id
LEFT JOIN media_assets ma ON ci.media_id = ma.id
WHERE ci.deleted_at IS NULL;

-- View para estatísticas
CREATE OR REPLACE VIEW v_catalogo_stats AS
SELECT 
  COUNT(*) as total_itens,
  COUNT(DISTINCT area_fazenda_id) as areas_unicas,
  COUNT(DISTINCT nucleo_pecuaria_id) as nucleos_pecuaria_unicos,
  COUNT(DISTINCT nucleo_agro_id) as nucleos_agro_unicos,
  COUNT(DISTINCT status_id) as status_unicos,
  COUNT(media_id) as itens_com_midia,
  MIN(data_captacao) as data_mais_antiga,
  MAX(data_captacao) as data_mais_recente
FROM catalogo_itens
WHERE deleted_at IS NULL;

-- View para auditoria recente
CREATE OR REPLACE VIEW v_catalogo_audit_recente AS
SELECT 
  ca.id,
  ca.item_id,
  ca.action,
  ca.field_name,
  ca.old_value,
  ca.new_value,
  ca.changed_at,
  ca.user_email,
  ci.titulo as item_titulo
FROM catalogo_audit ca
LEFT JOIN catalogo_itens ci ON ca.item_id = ci.id
WHERE ca.changed_at >= NOW() - INTERVAL '30 days'
ORDER BY ca.changed_at DESC;
