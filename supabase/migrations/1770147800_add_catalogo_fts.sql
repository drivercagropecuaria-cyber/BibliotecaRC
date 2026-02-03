-- Otimizacao de busca com FTS no catalogo_itens

ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE INDEX IF NOT EXISTS idx_catalogo_search_tsv ON catalogo_itens USING GIN (search_tsv);

CREATE OR REPLACE FUNCTION catalogo_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('portuguese', coalesce(NEW.titulo, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.descricao, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.frase_memoria, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.observacoes, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.responsavel, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.arquivo_nome, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catalogo_search_tsv_trigger ON catalogo_itens;
CREATE TRIGGER catalogo_search_tsv_trigger
  BEFORE INSERT OR UPDATE ON catalogo_itens
  FOR EACH ROW EXECUTE FUNCTION catalogo_search_tsv_update();

-- Backfill
UPDATE catalogo_itens SET search_tsv =
  setweight(to_tsvector('portuguese', coalesce(titulo, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(descricao, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(frase_memoria, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(observacoes, '')), 'C') ||
  setweight(to_tsvector('portuguese', coalesce(responsavel, '')), 'C') ||
  setweight(to_tsvector('portuguese', coalesce(arquivo_nome, '')), 'D');

CREATE OR REPLACE FUNCTION search_catalogo(p_query text, p_limit int DEFAULT 60)
RETURNS SETOF v_catalogo_completo
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.*
  FROM v_catalogo_completo v
  JOIN catalogo_itens ci ON ci.id = v.id
  WHERE ci.search_tsv @@ websearch_to_tsquery('portuguese', p_query)
  ORDER BY ts_rank(ci.search_tsv, websearch_to_tsquery('portuguese', p_query)) DESC, v.created_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION search_catalogo(text, int) TO anon, authenticated;
