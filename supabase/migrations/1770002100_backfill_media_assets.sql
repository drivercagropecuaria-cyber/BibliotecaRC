-- Backfill media_assets from catalogo_itens (para previews e view v_catalogo_completo)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'arquivo_url'
  ) THEN
    WITH source AS (
      SELECT
        id AS catalogo_id,
        arquivo_url,
        arquivo_nome,
        arquivo_tipo,
        arquivo_tamanho,
        thumbnail_url
      FROM catalogo_itens
      WHERE media_id IS NULL
        AND arquivo_url IS NOT NULL
    ),
    ins AS (
      INSERT INTO media_assets (bucket, path, filename, mime_type, size_bytes, public_url, thumbnail_url)
      SELECT
        'acervo-files',
        COALESCE(arquivo_nome, regexp_replace(arquivo_url, '^.*/', '')),
        split_part(COALESCE(arquivo_nome, regexp_replace(arquivo_url, '^.*/', '')), '/', array_length(string_to_array(COALESCE(arquivo_nome, regexp_replace(arquivo_url, '^.*/', '')), '/'), 1)),
        arquivo_tipo,
        arquivo_tamanho,
        arquivo_url,
        thumbnail_url
      FROM source
      RETURNING id, public_url
    )
    UPDATE catalogo_itens c
      SET media_id = ins.id
    FROM ins
    WHERE c.media_id IS NULL
      AND c.arquivo_url = ins.public_url;
  END IF;
END $$;