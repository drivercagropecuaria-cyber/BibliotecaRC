-- Migration: create_legacy_view
-- View compatível com colunas de nome (sem depender das colunas de nome da tabela)

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
  af.nome as area_fazenda,
  p.nome as ponto,
  tp.nome as tipo_projeto,
  np.nucleo as nucleo_pecuaria,
  na.nucleo as nucleo_agro,
  oi.nucleo as nucleo_operacoes,
  mv.nucleo as marca,
  ep.nome as evento,
  fh.nome as funcao_historica,
  tprinc.nome as tema_principal,
  sm.nome as status,
  cf.nome as capitulo,

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
