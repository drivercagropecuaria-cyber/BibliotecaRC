-- Migration: fix_audit_trigger_before_backfill
-- Corrige o trigger de auditoria antes do backfill

CREATE OR REPLACE FUNCTION audit_catalogo_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_val TEXT;
  new_val TEXT;
  field_name TEXT;
  important_fields TEXT[] := ARRAY['titulo', 'status', 'area_fazenda', 'tema_principal', 'responsavel', 'arquivo_url'];
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO catalogo_audit (item_id, action, changed_by, new_value)
    VALUES (NEW.id, 'INSERT', auth.uid(), NEW.titulo);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    FOREACH field_name IN ARRAY important_fields LOOP
      EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', field_name, field_name)
      INTO old_val, new_val
      USING OLD, NEW;

      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO catalogo_audit (item_id, action, changed_by, field_name, old_value, new_value)
        VALUES (NEW.id, 'UPDATE', auth.uid(), field_name, old_val, new_val);
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

DROP TRIGGER IF EXISTS catalogo_audit_trigger ON catalogo_itens;
CREATE TRIGGER catalogo_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON catalogo_itens
  FOR EACH ROW EXECUTE FUNCTION audit_catalogo_changes();
