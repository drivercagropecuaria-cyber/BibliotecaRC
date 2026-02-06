-- Migration: create_view_catalogo_completo
-- Created at: 1770369000
-- Description: Criar view v_catalogo_completo com filtro de itens ativos
-- Esta view é usada pela RPC search_catalogo para retornar resultados filtrados

-- Adicionar coluna is_active na tabela catalogo_itens (se ainda não existir)
ALTER TABLE catalogo_itens 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar coluna localidade_geom na tabela catalogo_itens (se ainda não existir)
ALTER TABLE catalogo_itens 
ADD COLUMN IF NOT EXISTS localidade_geom GEOMETRY(POINT, 4326);

-- Criar índice para performance em queries de is_active
CREATE INDEX IF NOT EXISTS idx_catalogo_is_active ON catalogo_itens(is_active) 
WHERE deleted_at IS NULL;

-- Criar índice geométrico para localidade_geom (se spatial indexes forem necessários)
CREATE INDEX IF NOT EXISTS idx_catalogo_localidade_geom ON catalogo_itens 
USING GIST(localidade_geom) 
WHERE deleted_at IS NULL;

-- DROP VIEW se existir (para evitar conflitos)
DROP VIEW IF EXISTS v_catalogo_completo CASCADE;

-- CREATE OR REPLACE VIEW v_catalogo_completo
-- Seleciona apenas itens ativos (deleted_at IS NULL AND is_active = true)
-- Inclui todos os campos necessários para a RPC search_catalogo
CREATE OR REPLACE VIEW v_catalogo_completo AS
SELECT 
  ci.id,
  ci.titulo,
  ci.descricao,
  ci.identificador AS categoria,
  ci.data_captacao AS data_criacao,
  ci.arquivo_url,
  ci.thumbnail_url,
  ci.localidade_geom,
  ci.is_active,
  ci.deleted_at,
  ci.created_at,
  ci.updated_at,
  -- Campos adicionais do catalogo_itens
  ci.frase_memoria,
  ci.observacoes,
  ci.responsavel,
  ci.media_id,
  -- IDs das relações
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
  ci.capitulo_id
FROM catalogo_itens ci
WHERE ci.deleted_at IS NULL AND ci.is_active = true;

-- Comentar a view
COMMENT ON VIEW v_catalogo_completo IS 
'View que contém todos os itens do catálogo ativos (não deletados e is_active=true). 
Usada pela RPC search_catalogo para retornar resultados filtrados. 
Inclui campos essenciais: id, titulo, descricao, categoria, data_criacao, arquivo_url, 
thumbnail_url, localidade_geom, is_active, deleted_at, created_at, updated_at';

-- Conceder permissões de leitura para roles públicos
GRANT SELECT ON v_catalogo_completo TO anon, authenticated;
