-- Migration: add_remaining_performance_indexes
-- Created at: 1769978307

-- Índices faltantes em catalogo_itens
CREATE INDEX IF NOT EXISTS idx_catalogo_media ON catalogo_itens(media_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_identificador ON catalogo_itens(identificador);
CREATE INDEX IF NOT EXISTS idx_catalogo_nucleo_pec ON catalogo_itens(nucleo_pecuaria_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_nucleo_agro ON catalogo_itens(nucleo_agro_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_operacao ON catalogo_itens(operacao_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_marca ON catalogo_itens(marca_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_evento ON catalogo_itens(evento_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_funcao_hist ON catalogo_itens(funcao_historica_id);

-- Índices faltantes em media_assets
CREATE INDEX IF NOT EXISTS idx_media_checksum ON media_assets(checksum);
CREATE INDEX IF NOT EXISTS idx_media_owner_created ON media_assets(owner_id, created_at DESC);

-- Índices faltantes em catalogo_audit
CREATE INDEX IF NOT EXISTS idx_audit_item_date ON catalogo_audit(item_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON catalogo_audit(action);

-- Índices em user_profiles
CREATE INDEX IF NOT EXISTS idx_user_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON user_profiles(role);

-- Índices em taxonomy_categories
CREATE INDEX IF NOT EXISTS idx_taxonomy_parent ON taxonomy_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_type ON taxonomy_categories(type);
CREATE INDEX IF NOT EXISTS idx_taxonomy_type_parent ON taxonomy_categories(type, parent_id);;