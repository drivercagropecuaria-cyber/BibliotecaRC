-- Migration: add_audit_trail
-- Created at: 1769973815


-- ============================================
-- FASE 2: Audit Trail (Histórico de Alterações)
-- ============================================

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS catalogo_audit (
  id BIGSERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT,
  ip_address TEXT
);

-- Índices para a tabela de audit
CREATE INDEX IF NOT EXISTS idx_audit_item_id ON catalogo_audit(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON catalogo_audit(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON catalogo_audit(changed_by);

-- RLS para audit (apenas admins podem ver)
ALTER TABLE catalogo_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver audit" ON catalogo_audit;

CREATE POLICY "Admins podem ver audit" ON catalogo_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Função trigger para registrar mudanças
CREATE OR REPLACE FUNCTION audit_catalogo_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_val TEXT;
  new_val TEXT;
  field_rec RECORD;
  important_fields TEXT[] := ARRAY['titulo', 'status', 'area_fazenda', 'tema_principal', 'responsavel', 'arquivo_url'];
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO catalogo_audit (item_id, action, changed_by, new_value)
    VALUES (NEW.id, 'INSERT', auth.uid(), NEW.titulo);
    RETURN NEW;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Registrar apenas campos importantes
    FOREACH field_rec.field_name IN ARRAY important_fields LOOP
      EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', field_rec.field_name, field_rec.field_name)
      INTO old_val, new_val
      USING OLD, NEW;
      
      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO catalogo_audit (item_id, action, changed_by, field_name, old_value, new_value)
        VALUES (NEW.id, 'UPDATE', auth.uid(), field_rec.field_name, old_val, new_val);
      END IF;
    END LOOP;
    RETURN NEW;
  
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO catalogo_audit (item_id, action, changed_by, old_value)
    VALUES (OLD.id, 'DELETE', auth.uid(), OLD.titulo);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS catalogo_audit_trigger ON catalogo_itens;
CREATE TRIGGER catalogo_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON catalogo_itens
  FOR EACH ROW EXECUTE FUNCTION audit_catalogo_changes();
;