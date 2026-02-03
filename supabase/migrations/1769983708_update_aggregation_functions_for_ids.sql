-- Migration: update_aggregation_functions_for_ids
-- Atualiza funções de agregação para usar v_catalogo_completo (antes da fase 1)

CREATE OR REPLACE FUNCTION count_by_status()
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(status_nome, 'Sem status') as status,
    COUNT(*)::BIGINT as count
  FROM v_catalogo_completo
  GROUP BY status_nome
  ORDER BY count DESC;
$$;

CREATE OR REPLACE FUNCTION count_by_area()
RETURNS TABLE(area_fazenda TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(area_fazenda_nome, 'Sem área') as area_fazenda,
    COUNT(*)::BIGINT as count
  FROM v_catalogo_completo
  GROUP BY area_fazenda_nome
  ORDER BY count DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION count_by_tema()
RETURNS TABLE(tema_principal TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(tema_principal_nome, 'Sem tema') as tema_principal,
    COUNT(*)::BIGINT as count
  FROM v_catalogo_completo
  GROUP BY tema_principal_nome
  ORDER BY count DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS TABLE(
  total_itens BIGINT,
  pendentes BIGINT,
  aprovados BIGINT,
  publicados BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COUNT(*)::BIGINT as total_itens,
    COUNT(*) FILTER (WHERE status_nome IN ('Entrada (Bruto)', 'Em triagem'))::BIGINT as pendentes,
    COUNT(*) FILTER (WHERE status_nome = 'Aprovado')::BIGINT as aprovados,
    COUNT(*) FILTER (WHERE status_nome = 'Publicado')::BIGINT as publicados
  FROM v_catalogo_completo;
$$;
