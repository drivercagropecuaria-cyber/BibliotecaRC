-- Migration: add_partial_indexes_ativo
-- Índices parciais para consultas em v_catalogo_ativo (deleted_at IS NULL)

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_area ON catalogo_itens(area_fazenda) WHERE deleted_at IS NULL';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_area_id ON catalogo_itens(area_fazenda_id) WHERE deleted_at IS NULL';
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'status'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_status ON catalogo_itens(status) WHERE deleted_at IS NULL';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'status_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_status_id ON catalogo_itens(status_id) WHERE deleted_at IS NULL';
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'ponto'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_ponto ON catalogo_itens(ponto) WHERE deleted_at IS NULL';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'ponto_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_ponto_id ON catalogo_itens(ponto_id) WHERE deleted_at IS NULL';
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'tema_principal'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_tema ON catalogo_itens(tema_principal) WHERE deleted_at IS NULL';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'catalogo_itens' AND column_name = 'tema_principal_id'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_tema_id ON catalogo_itens(tema_principal_id) WHERE deleted_at IS NULL';
	END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_created ON catalogo_itens(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_updated ON catalogo_itens(updated_at DESC) WHERE deleted_at IS NULL;
