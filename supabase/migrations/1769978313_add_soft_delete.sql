-- Migration: add_soft_delete
-- Created at: 1769978313

-- Adicionar deleted_at em catalogo_itens
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_catalogo_deleted ON catalogo_itens(deleted_at);

-- Adicionar deleted_at em media_assets
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_media_deleted ON media_assets(deleted_at);

-- Adicionar deleted_at em user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_user_deleted ON user_profiles(deleted_at);

-- Função para soft delete
CREATE OR REPLACE FUNCTION soft_delete_catalogo_item(p_item_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE catalogo_itens 
  SET deleted_at = NOW()
  WHERE id = p_item_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;;