-- Migration: add_performance_indexes
-- Created at: 1769973790


-- ============================================
-- FASE 1: Índices de Performance (Quick Wins)
-- ============================================

-- Índice para filtro por status (mais usado)
CREATE INDEX IF NOT EXISTS idx_catalogo_status ON catalogo_itens(status);

-- Índice para filtro por área/fazenda
CREATE INDEX IF NOT EXISTS idx_catalogo_area_fazenda ON catalogo_itens(area_fazenda);

-- Índice para filtro por tema principal
CREATE INDEX IF NOT EXISTS idx_catalogo_tema_principal ON catalogo_itens(tema_principal);

-- Índice para ordenação por data de captação
CREATE INDEX IF NOT EXISTS idx_catalogo_data_captacao ON catalogo_itens(data_captacao DESC);

-- Índice para ordenação por created_at (usado em listagens)
CREATE INDEX IF NOT EXISTS idx_catalogo_created_at ON catalogo_itens(created_at DESC);

-- Índice composto para busca por área + status (filtros combinados)
CREATE INDEX IF NOT EXISTS idx_catalogo_area_status ON catalogo_itens(area_fazenda, status);

-- Índice para busca textual no título (trigram para ILIKE %%)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_catalogo_titulo_trgm ON catalogo_itens USING gin(titulo gin_trgm_ops);

-- Índice para ponto (filtro comum)
CREATE INDEX IF NOT EXISTS idx_catalogo_ponto ON catalogo_itens(ponto);

-- Índice para tipo_projeto
CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_projeto ON catalogo_itens(tipo_projeto);
;