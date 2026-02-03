-- Reset all policies on naming_rules and reapply strict ones
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'naming_rules' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.naming_rules', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.naming_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read naming_rules" ON public.naming_rules
  FOR SELECT USING (true);

CREATE POLICY "Editors can manage naming_rules" ON public.naming_rules
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

GRANT SELECT ON TABLE public.naming_rules TO anon, authenticated;
