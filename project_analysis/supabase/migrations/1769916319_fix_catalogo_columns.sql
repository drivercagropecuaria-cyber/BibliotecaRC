-- Migration: fix_catalogo_columns
-- Created at: 1769916319

-- Adicionar colunas que faltam na tabela catalogo_itens
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS area_fazenda VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS ponto VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS tipo_projeto VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS nucleo_pecuaria VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS nucleo_agro VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS operacao VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS marca VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS evento VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS funcao_historica VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS tema_principal VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS tema_secundario VARCHAR(255);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'Entrada (Bruto)';
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS capitulo VARCHAR(100);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS arquivo_url TEXT;
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS arquivo_tipo VARCHAR(100);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS arquivo_nome VARCHAR(500);
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS arquivo_tamanho BIGINT;;