-- Migration: remove_sync_names_trigger
-- Remove trigger e função de sincronização antes de remover colunas de nome

DROP TRIGGER IF EXISTS trg_sync_catalogo_names_from_ids ON catalogo_itens;
DROP FUNCTION IF EXISTS sync_catalogo_names_from_ids();
