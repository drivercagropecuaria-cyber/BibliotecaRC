-- Migration: add_data_quality_views
-- Views para auditoria de inconsistências entre nomes e IDs

CREATE OR REPLACE VIEW v_catalogo_missing_ids AS
SELECT
  id,
  titulo,
  area_fazenda,
  area_fazenda_id,
  ponto,
  ponto_id,
  tipo_projeto,
  tipo_projeto_id,
  status,
  status_id,
  tema_principal,
  tema_principal_id,
  evento,
  evento_id,
  funcao_historica,
  funcao_historica_id,
  capitulo,
  capitulo_id,
  nucleo_pecuaria,
  nucleo_pecuaria_id,
  nucleo_agro,
  nucleo_agro_id,
  nucleo_operacoes,
  operacao_id,
  marca,
  marca_id
FROM catalogo_itens
WHERE (area_fazenda IS NOT NULL AND area_fazenda_id IS NULL)
   OR (ponto IS NOT NULL AND ponto_id IS NULL)
   OR (tipo_projeto IS NOT NULL AND tipo_projeto_id IS NULL)
   OR (status IS NOT NULL AND status_id IS NULL)
   OR (tema_principal IS NOT NULL AND tema_principal_id IS NULL)
   OR (evento IS NOT NULL AND evento_id IS NULL)
   OR (funcao_historica IS NOT NULL AND funcao_historica_id IS NULL)
   OR (capitulo IS NOT NULL AND capitulo_id IS NULL)
   OR (nucleo_pecuaria IS NOT NULL AND nucleo_pecuaria_id IS NULL)
   OR (nucleo_agro IS NOT NULL AND nucleo_agro_id IS NULL)
   OR (nucleo_operacoes IS NOT NULL AND operacao_id IS NULL)
   OR (marca IS NOT NULL AND marca_id IS NULL);

CREATE OR REPLACE VIEW v_catalogo_name_mismatch AS
SELECT
  ci.id,
  ci.titulo,
  ci.area_fazenda,
  af.nome AS area_fazenda_lookup,
  ci.ponto,
  p.nome AS ponto_lookup,
  ci.tipo_projeto,
  tp.nome AS tipo_projeto_lookup,
  ci.status,
  sm.nome AS status_lookup,
  ci.tema_principal,
  tpr.nome AS tema_principal_lookup,
  ci.evento,
  ep.nome AS evento_lookup,
  ci.funcao_historica,
  fh.nome AS funcao_historica_lookup,
  ci.capitulo,
  cf.nome AS capitulo_lookup,
  ci.nucleo_pecuaria,
  np.nucleo AS nucleo_pecuaria_lookup,
  ci.nucleo_agro,
  na.nucleo AS nucleo_agro_lookup,
  ci.nucleo_operacoes,
  oi.nucleo AS nucleo_operacoes_lookup,
  ci.marca,
  mv.nucleo AS marca_lookup
FROM catalogo_itens ci
LEFT JOIN areas_fazendas af ON ci.area_fazenda_id = af.id
LEFT JOIN pontos p ON ci.ponto_id = p.id
LEFT JOIN tipos_projeto tp ON ci.tipo_projeto_id = tp.id
LEFT JOIN status_material sm ON ci.status_id = sm.id
LEFT JOIN temas_principais tpr ON ci.tema_principal_id = tpr.id
LEFT JOIN eventos_principais ep ON ci.evento_id = ep.id
LEFT JOIN funcoes_historicas fh ON ci.funcao_historica_id = fh.id
LEFT JOIN capitulos_filme cf ON ci.capitulo_id = cf.id
LEFT JOIN nucleos_pecuaria np ON ci.nucleo_pecuaria_id = np.id
LEFT JOIN nucleos_agro na ON ci.nucleo_agro_id = na.id
LEFT JOIN operacoes_internas oi ON ci.operacao_id = oi.id
LEFT JOIN marca_valorizacao mv ON ci.marca_id = mv.id
WHERE (ci.area_fazenda IS NOT NULL AND af.nome IS NOT NULL AND ci.area_fazenda <> af.nome)
   OR (ci.ponto IS NOT NULL AND p.nome IS NOT NULL AND ci.ponto <> p.nome)
   OR (ci.tipo_projeto IS NOT NULL AND tp.nome IS NOT NULL AND ci.tipo_projeto <> tp.nome)
   OR (ci.status IS NOT NULL AND sm.nome IS NOT NULL AND ci.status <> sm.nome)
   OR (ci.tema_principal IS NOT NULL AND tpr.nome IS NOT NULL AND ci.tema_principal <> tpr.nome)
   OR (ci.evento IS NOT NULL AND ep.nome IS NOT NULL AND ci.evento <> ep.nome)
   OR (ci.funcao_historica IS NOT NULL AND fh.nome IS NOT NULL AND ci.funcao_historica <> fh.nome)
   OR (ci.capitulo IS NOT NULL AND cf.nome IS NOT NULL AND ci.capitulo <> cf.nome)
   OR (ci.nucleo_pecuaria IS NOT NULL AND np.nucleo IS NOT NULL AND ci.nucleo_pecuaria <> np.nucleo)
   OR (ci.nucleo_agro IS NOT NULL AND na.nucleo IS NOT NULL AND ci.nucleo_agro <> na.nucleo)
   OR (ci.nucleo_operacoes IS NOT NULL AND oi.nucleo IS NOT NULL AND ci.nucleo_operacoes <> oi.nucleo)
   OR (ci.marca IS NOT NULL AND mv.nucleo IS NOT NULL AND ci.marca <> mv.nucleo);
