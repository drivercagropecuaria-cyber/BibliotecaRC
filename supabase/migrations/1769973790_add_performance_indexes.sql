-- Migration: add_performance_indexes
-- Created at: 1769973790


-- ============================================
-- FASE 1: Índices de Performance (Quick Wins)
-- ============================================

-- Índice para filtro por status (mais usado)
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'status'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_status ON catalogo_itens(status)';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'status_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_status_id ON catalogo_itens(status_id)';
	END IF;
END $$;

-- Índice para filtro por área/fazenda
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_area_fazenda ON catalogo_itens(area_fazenda)';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_area_fazenda_id ON catalogo_itens(area_fazenda_id)';
	END IF;
END $$;

-- Índice para filtro por tema principal
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'tema_principal'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_tema_principal ON catalogo_itens(tema_principal)';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'tema_principal_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_tema_principal_id ON catalogo_itens(tema_principal_id)';
	END IF;
END $$;

-- Índice para ordenação por data de captação
CREATE INDEX IF NOT EXISTS idx_catalogo_data_captacao ON catalogo_itens(data_captacao DESC);

-- Índice para ordenação por created_at (usado em listagens)
CREATE INDEX IF NOT EXISTS idx_catalogo_created_at ON catalogo_itens(created_at DESC);

-- Índice composto para busca por área + status (filtros combinados)
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda'
	) AND EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'status'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_area_status ON catalogo_itens(area_fazenda, status)';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda_id'
	) AND EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'status_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_area_status_id ON catalogo_itens(area_fazenda_id, status_id)';
	END IF;
END $$;

-- Índice para busca textual no título (trigram para ILIKE %%)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_catalogo_titulo_trgm ON catalogo_itens USING gin(titulo gin_trgm_ops);

-- Índice para ponto (filtro comum)
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'ponto'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ponto ON catalogo_itens(ponto)';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'ponto_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ponto_id ON catalogo_itens(ponto_id)';
	END IF;
END $$;

-- Índice para tipo_projeto
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'tipo_projeto'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_projeto ON catalogo_itens(tipo_projeto)';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'tipo_projeto_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_projeto_id ON catalogo_itens(tipo_projeto_id)';
	END IF;
END $$;