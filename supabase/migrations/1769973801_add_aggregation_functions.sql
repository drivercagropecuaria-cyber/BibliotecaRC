-- Migration: add_aggregation_functions
-- Created at: 1769973801


-- ============================================
-- Funções RPC para Agregação (Dashboard)
-- ============================================

-- Função para contar por status
CREATE OR REPLACE FUNCTION count_by_status()
RETURNS TABLE(status TEXT, count BIGINT) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(status, 'Sem status') as status,
    COUNT(*)::BIGINT as count
  FROM catalogo_itens
  GROUP BY status
  ORDER BY count DESC;
$$;

-- Função para contar por área
CREATE OR REPLACE FUNCTION count_by_area()
RETURNS TABLE(area_fazenda TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(area_fazenda, 'Sem área') as area_fazenda,
    COUNT(*)::BIGINT as count
  FROM catalogo_itens
  GROUP BY area_fazenda
  ORDER BY count DESC
  LIMIT 10;
$$;

-- Função para contar por tema
CREATE OR REPLACE FUNCTION count_by_tema()
RETURNS TABLE(tema_principal TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COALESCE(tema_principal, 'Sem tema') as tema_principal,
    COUNT(*)::BIGINT as count
  FROM catalogo_itens
  GROUP BY tema_principal
  ORDER BY count DESC
  LIMIT 10;
$$;

-- Função para métricas gerais do dashboard
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
    COUNT(*) FILTER (WHERE status IN ('Entrada (Bruto)', 'Em triagem'))::BIGINT as pendentes,
    COUNT(*) FILTER (WHERE status = 'Aprovado')::BIGINT as aprovados,
    COUNT(*) FILTER (WHERE status = 'Publicado')::BIGINT as publicados
  FROM catalogo_itens;
$$;
;