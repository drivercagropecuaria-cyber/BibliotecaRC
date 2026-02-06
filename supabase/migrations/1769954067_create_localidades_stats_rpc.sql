-- Migration: create_localidades_stats_rpc
-- Created at: 1769954067


CREATE OR REPLACE FUNCTION get_localidades_stats()
RETURNS TABLE (
  area_fazenda TEXT,
  total_count BIGINT,
  image_count BIGINT,
  video_count BIGINT,
  cover_urls JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH counts AS (
    SELECT 
      c.area_fazenda,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE c.arquivo_tipo LIKE 'image%') as images,
      COUNT(*) FILTER (WHERE c.arquivo_tipo LIKE 'video%') as videos
    FROM catalogo_itens c
    WHERE c.area_fazenda IS NOT NULL AND c.area_fazenda != ''
    GROUP BY c.area_fazenda
  ),
  covers AS (
    SELECT DISTINCT ON (c.area_fazenda, rn)
      c.area_fazenda,
      jsonb_build_object(
        'url', c.arquivo_url,
        'type', CASE WHEN c.arquivo_tipo LIKE 'image%' THEN 'image' ELSE 'video' END
      ) as cover_data
    FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY area_fazenda ORDER BY created_at DESC) as rn
      FROM catalogo_itens
      WHERE arquivo_url IS NOT NULL AND area_fazenda IS NOT NULL
    ) c
    WHERE c.rn <= 4
  ),
  covers_agg AS (
    SELECT area_fazenda, jsonb_agg(cover_data) as covers
    FROM covers
    GROUP BY area_fazenda
  )
  SELECT 
    counts.area_fazenda,
    counts.total,
    counts.images,
    counts.videos,
    COALESCE(covers_agg.covers, '[]'::jsonb)
  FROM counts
  LEFT JOIN covers_agg ON counts.area_fazenda = covers_agg.area_fazenda
  ORDER BY counts.area_fazenda;
END;
$$ LANGUAGE plpgsql;
;