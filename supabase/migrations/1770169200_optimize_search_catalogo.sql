-- Optimize search_catalogo by ranking on catalogo_itens first
CREATE OR REPLACE FUNCTION search_catalogo(p_query text, p_limit int DEFAULT 60)
RETURNS SETOF v_catalogo_completo
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  WITH q AS (
    SELECT websearch_to_tsquery('portuguese', p_query) AS tsq
  ),
  ranked AS (
    SELECT
      ci.id,
      ts_rank_cd(ci.search_tsv, q.tsq) AS rank_score,
      ci.created_at
    FROM catalogo_itens ci
    CROSS JOIN q
    WHERE ci.deleted_at IS NULL
      AND ci.search_tsv @@ q.tsq
    ORDER BY rank_score DESC, ci.created_at DESC
    LIMIT LEAST(GREATEST(p_limit, 1), 200)
  )
  SELECT v.*
  FROM ranked r
  JOIN v_catalogo_completo v ON v.id = r.id
  ORDER BY r.rank_score DESC, r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION search_catalogo(text, int) TO anon, authenticated;
