-- Migration: update_views_remove_tema_secundario
-- Remove tema_secundario das views antes da fase 2

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
  
  -- Dados de mídia
  ma.filename as arquivo_nome,
  ma.mime_type as arquivo_tipo,
  ma.size_bytes as arquivo_tamanho,
  ma.public_url as arquivo_url,
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

CREATE OR REPLACE VIEW v_catalogo_legacy AS
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

  -- IDs
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

  -- Nomes (somente via join)
  af.name as area_fazenda,
  p.name as ponto,
  tp.name as tipo_projeto,
  np.name as nucleo_pecuaria,
  na.name as nucleo_agro,
  op.name as nucleo_operacoes,
  mv.name as marca,
  ep.name as evento,
  fh.name as funcao_historica,
  tprinc.name as tema_principal,
  sm.name as status,
  cf.name as capitulo,

  -- Mídia
  ma.filename as arquivo_nome,
  ma.mime_type as arquivo_tipo,
  ma.size_bytes as arquivo_tamanho,
  ma.public_url as arquivo_url,
  ma.thumbnail_url,

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
