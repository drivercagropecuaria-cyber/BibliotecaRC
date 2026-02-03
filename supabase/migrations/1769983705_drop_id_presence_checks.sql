-- Migration: drop_id_presence_checks
-- Remove checks que dependem de colunas de nome antes da fase 1

ALTER TABLE catalogo_itens
  DROP CONSTRAINT IF EXISTS catalogo_itens_area_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_ponto_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_tipo_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_status_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_tema_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_evento_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_funcao_id_required,
  DROP CONSTRAINT IF EXISTS catalogo_itens_capitulo_id_required;
