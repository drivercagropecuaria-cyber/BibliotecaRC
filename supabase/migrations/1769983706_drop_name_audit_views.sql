-- Migration: drop_name_audit_views
-- Remove views que dependem de colunas de nome antes de removê-las

DROP VIEW IF EXISTS v_catalogo_missing_ids;
DROP VIEW IF EXISTS v_catalogo_name_mismatch;
