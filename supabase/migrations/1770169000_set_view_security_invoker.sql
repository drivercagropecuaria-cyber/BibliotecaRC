-- Enforce security_invoker on catalog views to avoid SECURITY DEFINER behavior
ALTER VIEW public.v_catalogo_stats SET (security_invoker = true);
ALTER VIEW public.v_catalogo_completo SET (security_invoker = true);
ALTER VIEW public.v_catalogo_id_readiness SET (security_invoker = true);
ALTER VIEW public.v_catalogo_ativo SET (security_invoker = true);
ALTER VIEW public.v_catalogo_legacy SET (security_invoker = true);
