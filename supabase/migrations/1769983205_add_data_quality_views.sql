-- Migration: add_data_quality_views
-- Views para auditoria de inconsistências entre nomes e IDs

CREATE OR REPLACE VIEW v_catalogo_missing_ids AS
SELECT
  id,
  titulo,
  area_fazenda_id,
  ponto_id,
  tipo_projeto_id,
  status_id,
  tema_principal_id,
  evento_id,
  funcao_historica_id,
  capitulo_id,
  nucleo_pecuaria_id,
  nucleo_agro_id,
  operacao_id,
  marca_id
FROM catalogo_itens
WHERE area_fazenda_id IS NULL
  OR ponto_id IS NULL
  OR tipo_projeto_id IS NULL
  OR status_id IS NULL
  OR tema_principal_id IS NULL
  OR evento_id IS NULL
  OR funcao_historica_id IS NULL
  OR capitulo_id IS NULL
  OR nucleo_pecuaria_id IS NULL
  OR nucleo_agro_id IS NULL
  OR operacao_id IS NULL
  OR marca_id IS NULL;

CREATE OR REPLACE VIEW v_catalogo_name_mismatch AS
SELECT
  ci.id,
  ci.titulo,
  ci.area_fazenda_id,
  ci.area_fazenda_nome,
  ci.ponto_id,
  ci.ponto_nome,
  ci.tipo_projeto_id,
  ci.tipo_projeto_nome,
  ci.status_id,
  ci.status_nome,
  ci.tema_principal_id,
  ci.tema_principal_nome,
  ci.evento_id,
  ci.evento_nome,
  ci.funcao_historica_id,
  ci.funcao_historica_nome,
  ci.capitulo_id,
  ci.capitulo_nome,
  ci.nucleo_pecuaria_id,
  ci.nucleo_pecuaria_nome,
  ci.nucleo_agro_id,
  ci.nucleo_agro_nome,
  ci.operacao_id,
  ci.operacao_nome,
  ci.marca_id,
  ci.marca_nome
FROM v_catalogo_completo ci
WHERE false;
