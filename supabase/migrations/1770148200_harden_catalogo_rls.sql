-- Harden RLS for catalogo_itens

ALTER TABLE IF EXISTS catalogo_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON catalogo_itens;
DROP POLICY IF EXISTS "Allow public update" ON catalogo_itens;
DROP POLICY IF EXISTS "Allow public delete" ON catalogo_itens;
DROP POLICY IF EXISTS "Editors can insert catalogo" ON catalogo_itens;
DROP POLICY IF EXISTS "Editors can update catalogo" ON catalogo_itens;
DROP POLICY IF EXISTS "Admins can delete catalogo" ON catalogo_itens;

-- Mantem leitura publica
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalogo_itens' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON catalogo_itens FOR SELECT USING (true);
  END IF;
END $$;

CREATE POLICY "Editors can insert catalogo" ON catalogo_itens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can update catalogo" ON catalogo_itens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete catalogo" ON catalogo_itens
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );
