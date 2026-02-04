-- Migration: grant_select_views
-- Grant SELECT on public views used by the app

GRANT SELECT ON TABLE public.v_catalogo_completo TO anon, authenticated;
GRANT SELECT ON TABLE public.v_catalogo_legacy TO anon, authenticated;
