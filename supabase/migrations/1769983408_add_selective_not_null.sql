-- Migration: add_selective_not_null
-- Aplica NOT NULL apenas quando não há registros nulos

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM catalogo_itens WHERE area_fazenda_id IS NULL) = 0 THEN
    ALTER TABLE catalogo_itens ALTER COLUMN area_fazenda_id SET NOT NULL;
  END IF;

  IF (SELECT COUNT(*) FROM catalogo_itens WHERE status_id IS NULL) = 0 THEN
    ALTER TABLE catalogo_itens ALTER COLUMN status_id SET NOT NULL;
  END IF;

  IF (SELECT COUNT(*) FROM catalogo_itens WHERE tipo_projeto_id IS NULL) = 0 THEN
    ALTER TABLE catalogo_itens ALTER COLUMN tipo_projeto_id SET NOT NULL;
  END IF;
END $$;
