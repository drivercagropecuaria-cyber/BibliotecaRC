-- Fix mutable search_path warnings for public functions
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN (
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'set_updated_at',
        'audit_catalogo_changes',
        'get_localidades_stats',
        'rpc_finalize_upload',
        'get_dashboard_metrics',
        'count_by_tema',
        'soft_delete_catalogo_item',
        'catalogo_search_tsv_update',
        'handle_new_user',
        'count_by_status',
        'count_by_area'
      )
  ) LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, extensions',
      r.schema_name,
      r.function_name,
      r.args
    );
  END LOOP;
END $$;

-- Move pg_trgm to extensions schema (recommended by Supabase lint)
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
