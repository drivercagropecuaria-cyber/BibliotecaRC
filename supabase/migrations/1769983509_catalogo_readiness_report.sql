-- Migration: catalogo_readiness_report
-- Relatório de prontidão para remoção de colunas de nome

CREATE OR REPLACE VIEW v_catalogo_id_readiness AS
SELECT
  COUNT(*) AS total_itens,
  COUNT(*) FILTER (WHERE area_fazenda_id IS NULL) AS area_fazenda_id_nulos,
  COUNT(*) FILTER (WHERE ponto_id IS NULL) AS ponto_id_nulos,
  COUNT(*) FILTER (WHERE tipo_projeto_id IS NULL) AS tipo_projeto_id_nulos,
  COUNT(*) FILTER (WHERE status_id IS NULL) AS status_id_nulos,
  COUNT(*) FILTER (WHERE tema_principal_id IS NULL) AS tema_principal_id_nulos,
  COUNT(*) FILTER (WHERE evento_id IS NULL) AS evento_id_nulos,
  COUNT(*) FILTER (WHERE funcao_historica_id IS NULL) AS funcao_historica_id_nulos,
  COUNT(*) FILTER (WHERE capitulo_id IS NULL) AS capitulo_id_nulos,
  COUNT(*) FILTER (WHERE nucleo_pecuaria_id IS NULL) AS nucleo_pecuaria_id_nulos,
  COUNT(*) FILTER (WHERE nucleo_agro_id IS NULL) AS nucleo_agro_id_nulos,
  COUNT(*) FILTER (WHERE operacao_id IS NULL) AS operacao_id_nulos,
  COUNT(*) FILTER (WHERE marca_id IS NULL) AS marca_id_nulos
FROM catalogo_itens;
