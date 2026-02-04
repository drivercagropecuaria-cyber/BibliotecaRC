-- Migration: harden_user_profiles_rls
-- Created at: 1770148600

-- Restringir leitura de perfis ao próprio usuário (admins continuam com acesso via policy existente)
DROP POLICY IF EXISTS "Usuarios podem ver todos os perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON user_profiles;
CREATE POLICY "Usuarios podem ver seu proprio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
