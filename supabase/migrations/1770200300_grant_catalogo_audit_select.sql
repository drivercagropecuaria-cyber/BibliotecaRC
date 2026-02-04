-- Permitir leitura da auditoria para usuários autenticados (RLS ainda restringe a admins)

GRANT SELECT ON TABLE catalogo_audit TO authenticated;
