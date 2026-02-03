-- Migration: add_partial_indexes_ativo
-- Índices parciais para consultas em v_catalogo_ativo (deleted_at IS NULL)

CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_area ON catalogo_itens(area_fazenda) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_status ON catalogo_itens(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_ponto ON catalogo_itens(ponto) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_tema ON catalogo_itens(tema_principal) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_created ON catalogo_itens(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_updated ON catalogo_itens(updated_at DESC) WHERE deleted_at IS NULL;
