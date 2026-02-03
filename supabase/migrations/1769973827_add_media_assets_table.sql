-- Migration: add_media_assets_table
-- Created at: 1769973827


-- ============================================
-- FASE 2: Tabela de Media Assets (Normalização)
-- ============================================

-- Tabela centralizada de arquivos/mídias
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações do arquivo
  bucket TEXT NOT NULL DEFAULT 'acervo-arquivos',
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  
  -- URLs
  public_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadados
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  checksum TEXT,
  
  -- Controle
  owner_id UUID REFERENCES auth.users(id),
  is_processed BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_media_bucket_path ON media_assets(bucket, path);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media_assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_assets(created_at DESC);

-- RLS
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver mídia" ON media_assets;
DROP POLICY IF EXISTS "Editores podem inserir mídia" ON media_assets;
DROP POLICY IF EXISTS "Admins podem atualizar mídia" ON media_assets;

CREATE POLICY "Usuários autenticados podem ver mídia" ON media_assets
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editores podem inserir mídia" ON media_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins podem atualizar mídia" ON media_assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Adicionar coluna de referência na catalogo_itens (opcional, para migração futura)
ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES media_assets(id);
;