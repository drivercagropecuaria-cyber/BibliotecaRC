-- Migration: update_get_localidades_stats
-- Usa v_catalogo_ativo para excluir deletados

DROP FUNCTION IF EXISTS get_localidades_stats();

CREATE OR REPLACE FUNCTION get_localidades_stats()
RETURNS TABLE (
  area_fazenda TEXT,
  total_count BIGINT,
  image_count BIGINT,
  video_count BIGINT,
  cover_urls JSONB
)
LANGUAGE sql
STABLE
AS $$
  WITH counts AS (
    SELECT 
      ci.area_fazenda_nome AS loc,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE ci.arquivo_tipo LIKE 'image%') as images,
      COUNT(*) FILTER (WHERE ci.arquivo_tipo LIKE 'video%') as videos
    FROM v_catalogo_completo ci
    WHERE ci.area_fazenda_nome IS NOT NULL AND ci.area_fazenda_nome != ''
    GROUP BY ci.area_fazenda_nome
  ),
  covers AS (
    SELECT 
      sub.area_fazenda_nome AS loc,
      jsonb_build_object(
        'url', sub.arquivo_url,
        'type', CASE WHEN sub.arquivo_tipo LIKE 'image%' THEN 'image' ELSE 'video' END
      ) as cover_data
    FROM (
      SELECT area_fazenda_nome, arquivo_url, arquivo_tipo,
             ROW_NUMBER() OVER (PARTITION BY area_fazenda_nome ORDER BY created_at DESC) as rn
      FROM v_catalogo_completo
      WHERE arquivo_url IS NOT NULL AND area_fazenda_nome IS NOT NULL AND area_fazenda_nome != ''
    ) sub
    WHERE sub.rn <= 4
  ),
  covers_agg AS (
    SELECT loc, jsonb_agg(cover_data) as covers
    FROM covers
    GROUP BY loc
  )
  SELECT 
    counts.loc AS area_fazenda,
    counts.total AS total_count,
    counts.images AS image_count,
    counts.videos AS video_count,
    COALESCE(covers_agg.covers, '[]'::jsonb) AS cover_urls
  FROM counts
  LEFT JOIN covers_agg ON counts.loc = covers_agg.loc
  ORDER BY counts.loc;
$$;
