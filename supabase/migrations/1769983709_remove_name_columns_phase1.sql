-- Migration: remove_name_columns_phase1
-- Fase 1: remover colunas de nome de catalogo_itens após migração para IDs
-- Execute apenas após validar v_catalogo_id_readiness e v_catalogo_name_mismatch

DROP VIEW IF EXISTS v_catalogo_ativo CASCADE;

ALTER TABLE catalogo_itens
  DROP COLUMN IF EXISTS area_fazenda,
  DROP COLUMN IF EXISTS ponto,
  DROP COLUMN IF EXISTS tipo_projeto,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS tema_principal,
  DROP COLUMN IF EXISTS evento,
  DROP COLUMN IF EXISTS funcao_historica,
  DROP COLUMN IF EXISTS capitulo,
  DROP COLUMN IF EXISTS nucleo_pecuaria,
  DROP COLUMN IF EXISTS nucleo_agro,
  DROP COLUMN IF EXISTS nucleo_operacoes,
  DROP COLUMN IF EXISTS marca;

CREATE OR REPLACE VIEW v_catalogo_ativo AS
SELECT * FROM catalogo_itens
WHERE deleted_at IS NULL;
