-- Migration: fix_user_profiles_rls_recursion
-- Created at: 1769979584

-- Remover policy com referência circular
DROP POLICY IF EXISTS "Admins podem editar qualquer perfil" ON user_profiles;

-- Criar nova policy que verifica role via JWT metadata (sem recursão)
CREATE POLICY "Admins podem editar qualquer perfil" ON user_profiles
FOR ALL
USING (
  auth.uid() = id 
  OR 
  (auth.jwt() ->> 'role')::text = 'admin'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
);;