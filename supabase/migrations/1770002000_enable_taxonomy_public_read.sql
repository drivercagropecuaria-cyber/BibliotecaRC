-- Garantir leitura pública das taxonomias usadas no acervo
ALTER TABLE IF EXISTS taxonomy_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'taxonomy_categories'
      AND policyname = 'Allow public read taxonomy'
  ) THEN
    CREATE POLICY "Allow public read taxonomy" ON taxonomy_categories
      FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON TABLE taxonomy_categories TO anon, authenticated;