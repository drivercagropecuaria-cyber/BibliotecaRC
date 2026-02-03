-- Migration: create_optimized_views
-- Created at: 1769978331

DROP VIEW IF EXISTS v_catalogo_audit_recente CASCADE;
DROP VIEW IF EXISTS v_catalogo_stats CASCADE;
DROP VIEW IF EXISTS v_catalogo_completo CASCADE;
DROP VIEW IF EXISTS v_catalogo_ativo CASCADE;

-- View para itens ativos (excluindo deletados)
CREATE OR REPLACE VIEW v_catalogo_ativo AS
SELECT * FROM catalogo_itens
WHERE deleted_at IS NULL;

-- View completa com joins
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
  
  -- Nomes das tabelas de lookup
  af.nome as area_fazenda_nome,
  p.nome as ponto_nome,
  tp.nome as tipo_projeto_nome,
  np.nucleo as nucleo_pecuaria_nome,
  na.nucleo as nucleo_agro_nome,
  oi.nucleo as operacao_nome,
  mv.nucleo as marca_nome,
  ep.nome as evento_nome,
  fh.nome as funcao_historica_nome,
  tprinc.nome as tema_principal_nome,
  sm.nome as status_nome,
  cf.nome as capitulo_nome,
  
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
LEFT JOIN areas_fazendas af ON ci.area_fazenda_id = af.id
LEFT JOIN pontos p ON ci.ponto_id = p.id
LEFT JOIN tipos_projeto tp ON ci.tipo_projeto_id = tp.id
LEFT JOIN nucleos_pecuaria np ON ci.nucleo_pecuaria_id = np.id
LEFT JOIN nucleos_agro na ON ci.nucleo_agro_id = na.id
LEFT JOIN operacoes_internas oi ON ci.operacao_id = oi.id
LEFT JOIN marca_valorizacao mv ON ci.marca_id = mv.id
LEFT JOIN eventos_principais ep ON ci.evento_id = ep.id
LEFT JOIN funcoes_historicas fh ON ci.funcao_historica_id = fh.id
LEFT JOIN temas_principais tprinc ON ci.tema_principal_id = tprinc.id
LEFT JOIN status_material sm ON ci.status_id = sm.id
LEFT JOIN capitulos_filme cf ON ci.capitulo_id = cf.id
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
ORDER BY ca.changed_at DESC;;