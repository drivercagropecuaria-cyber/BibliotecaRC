-- Harden RLS for catalogo_audit

ALTER TABLE IF EXISTS catalogo_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_audit FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE catalogo_audit FROM anon, authenticated;

DROP POLICY IF EXISTS "Admins podem ver audit" ON catalogo_audit;
CREATE POLICY "Admins podem ver audit" ON catalogo_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );
