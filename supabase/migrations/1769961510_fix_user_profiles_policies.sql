-- Migration: fix_user_profiles_policies
-- Created at: 1769961510

-- Adicionar policy para INSERT
DROP POLICY IF EXISTS "Usuarios podem criar seu proprio perfil" ON user_profiles;
CREATE POLICY "Usuarios podem criar seu proprio perfil" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Garantir que a policy de SELECT funcione
DROP POLICY IF EXISTS "Usuarios podem ver todos os perfis" ON user_profiles;
CREATE POLICY "Usuarios podem ver todos os perfis" ON user_profiles
  FOR SELECT USING (true);;