-- Migration: add_thumbnail_url_column
-- Created at: 1769954702

ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;;