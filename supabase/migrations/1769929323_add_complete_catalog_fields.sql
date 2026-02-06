-- Migration: add_complete_catalog_fields
-- Created at: 1769929323


-- Adicionar campos faltantes na tabela catalogo_itens
ALTER TABLE catalogo_itens 
ADD COLUMN IF NOT EXISTS subnucleo_pecuaria TEXT,
ADD COLUMN IF NOT EXISTS nucleo_operacoes TEXT,
ADD COLUMN IF NOT EXISTS subnucleo_operacoes TEXT,
ADD COLUMN IF NOT EXISTS subnucleo_agro TEXT,
ADD COLUMN IF NOT EXISTS subnucleo_marca TEXT,
ADD COLUMN IF NOT EXISTS tema_secundario TEXT,
ADD COLUMN IF NOT EXISTS frase_memoria TEXT,
ADD COLUMN IF NOT EXISTS responsavel TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;
;