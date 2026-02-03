-- Migration: drop_name_checks
-- Remove checks que dependem de colunas de nome antes da fase 1

ALTER TABLE catalogo_itens
  DROP CONSTRAINT IF EXISTS catalogo_itens_status_not_empty,
  DROP CONSTRAINT IF EXISTS catalogo_itens_area_not_empty,
  DROP CONSTRAINT IF EXISTS catalogo_itens_tipo_not_empty;
