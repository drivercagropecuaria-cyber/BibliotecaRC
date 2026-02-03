-- Harden RLS for taxonomy_categories and naming_rules

-- taxonomy_categories
ALTER TABLE IF EXISTS taxonomy_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read taxonomy" ON taxonomy_categories;
DROP POLICY IF EXISTS "Allow public insert taxonomy" ON taxonomy_categories;
DROP POLICY IF EXISTS "Allow public update taxonomy" ON taxonomy_categories;
DROP POLICY IF EXISTS "Allow public delete taxonomy" ON taxonomy_categories;
DROP POLICY IF EXISTS "Editors can manage taxonomy" ON taxonomy_categories;

CREATE POLICY "Allow public read taxonomy" ON taxonomy_categories
  FOR SELECT USING (true);

CREATE POLICY "Editors can manage taxonomy" ON taxonomy_categories
  FOR ALL
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

GRANT SELECT ON TABLE taxonomy_categories TO anon, authenticated;

-- naming_rules
ALTER TABLE IF EXISTS naming_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read naming_rules" ON naming_rules;
DROP POLICY IF EXISTS "Allow public insert naming_rules" ON naming_rules;
DROP POLICY IF EXISTS "Allow public update naming_rules" ON naming_rules;
DROP POLICY IF EXISTS "Allow public delete naming_rules" ON naming_rules;
DROP POLICY IF EXISTS "Editors can manage naming_rules" ON naming_rules;

CREATE POLICY "Allow public read naming_rules" ON naming_rules
  FOR SELECT USING (true);

CREATE POLICY "Editors can manage naming_rules" ON naming_rules
  FOR ALL
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

GRANT SELECT ON TABLE naming_rules TO anon, authenticated;
