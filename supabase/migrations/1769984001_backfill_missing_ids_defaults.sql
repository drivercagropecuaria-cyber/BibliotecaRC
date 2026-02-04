-- Migration: backfill_missing_ids_defaults
-- No-op em schemas atuais. Defaults devem ser tratados manualmente quando necessário.

DO $do$
BEGIN
	RAISE NOTICE 'backfill_missing_ids_defaults: skipped (schema atual usa taxonomy_categories)';
END $do$;
