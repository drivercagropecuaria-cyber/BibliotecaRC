-- Garantir permissões e funções para dashboard e localidades

-- RLS + políticas públicas para leitura do catálogo (caso não existam)
ALTER TABLE IF EXISTS catalogo_itens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalogo_itens' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON catalogo_itens FOR SELECT USING (true);
  END IF;
END $$;

-- Recriar função de localidades com SECURITY DEFINER
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
SECURITY DEFINER
STABLE
AS $$
  WITH counts AS (
    SELECT 
      ci.area_fazenda_id AS loc_id,
      ci.area_fazenda_nome AS loc,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE ci.arquivo_tipo LIKE 'image%') as images,
      COUNT(*) FILTER (WHERE ci.arquivo_tipo LIKE 'video%') as videos
    FROM v_catalogo_completo ci
    WHERE ci.area_fazenda_id IS NOT NULL
      AND ci.area_fazenda_nome IS NOT NULL
      AND ci.area_fazenda_nome <> ''
    GROUP BY ci.area_fazenda_id, ci.area_fazenda_nome
  ),
  covers AS (
    SELECT 
      sub.area_fazenda_id AS loc_id,
      sub.area_fazenda_nome AS loc,
      jsonb_build_object(
        'url', sub.arquivo_url,
        'type', CASE WHEN sub.arquivo_tipo LIKE 'image%' THEN 'image' ELSE 'video' END
      ) as cover_data
    FROM (
      SELECT area_fazenda_id, area_fazenda_nome, arquivo_url, arquivo_tipo,
             ROW_NUMBER() OVER (PARTITION BY area_fazenda_id ORDER BY created_at DESC) as rn
      FROM v_catalogo_completo
      WHERE arquivo_url IS NOT NULL
        AND area_fazenda_id IS NOT NULL
        AND area_fazenda_nome IS NOT NULL
        AND area_fazenda_nome <> ''
    ) sub
    WHERE sub.rn <= 4
  ),
  covers_agg AS (
    SELECT loc_id, loc, jsonb_agg(cover_data) as covers
    FROM covers
    GROUP BY loc_id, loc
  )
  SELECT 
    counts.loc AS area_fazenda,
    counts.total AS total_count,
    counts.images AS image_count,
    counts.videos AS video_count,
    COALESCE(covers_agg.covers, '[]'::jsonb) AS cover_urls
  FROM counts
  LEFT JOIN covers_agg ON counts.loc_id = covers_agg.loc_id
  ORDER BY counts.loc;
$$;

-- Garantir EXECUTE nas funções usadas no dashboard
GRANT EXECUTE ON FUNCTION count_by_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION count_by_area() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION count_by_tema() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_localidades_stats() TO anon, authenticated;
