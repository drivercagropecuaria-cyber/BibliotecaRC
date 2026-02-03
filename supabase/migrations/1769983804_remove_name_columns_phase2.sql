-- Migration: remove_name_columns_phase2
-- Fase 2: remover colunas restantes de nome (após validação)

DROP VIEW IF EXISTS v_catalogo_ativo CASCADE;

ALTER TABLE catalogo_itens
  DROP COLUMN IF EXISTS tema_secundario,
  DROP COLUMN IF EXISTS subnucleo_pecuaria,
  DROP COLUMN IF EXISTS subnucleo_agro,
  DROP COLUMN IF EXISTS subnucleo_operacoes,
  DROP COLUMN IF EXISTS subnucleo_marca;

CREATE OR REPLACE VIEW v_catalogo_ativo AS
SELECT * FROM catalogo_itens
WHERE deleted_at IS NULL;
