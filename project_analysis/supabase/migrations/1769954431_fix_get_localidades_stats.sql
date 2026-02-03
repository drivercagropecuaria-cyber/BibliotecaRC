-- Migration: fix_get_localidades_stats
-- Created at: 1769954431

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
      ci.area_fazenda AS loc,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE ci.arquivo_tipo LIKE 'image%') as images,
      COUNT(*) FILTER (WHERE ci.arquivo_tipo LIKE 'video%') as videos
    FROM catalogo_itens ci
    WHERE ci.area_fazenda IS NOT NULL AND ci.area_fazenda != ''
    GROUP BY ci.area_fazenda
  ),
  covers AS (
    SELECT 
      sub.area_fazenda AS loc,
      jsonb_build_object(
        'url', sub.arquivo_url,
        'type', CASE WHEN sub.arquivo_tipo LIKE 'image%' THEN 'image' ELSE 'video' END
      ) as cover_data
    FROM (
      SELECT area_fazenda, arquivo_url, arquivo_tipo,
             ROW_NUMBER() OVER (PARTITION BY area_fazenda ORDER BY created_at DESC) as rn
      FROM catalogo_itens
      WHERE arquivo_url IS NOT NULL AND area_fazenda IS NOT NULL AND area_fazenda != ''
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
$$;;