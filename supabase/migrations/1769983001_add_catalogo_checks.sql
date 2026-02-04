-- Migration: add_catalogo_checks
-- Checks básicos para consistência de catalogo_itens

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalogo_itens' AND column_name = 'titulo')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_titulo_not_empty') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_titulo_not_empty
      CHECK (titulo IS NULL OR TRIM(titulo) <> '');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalogo_itens' AND column_name = 'status')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_status_not_empty') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_status_not_empty
      CHECK (status IS NULL OR TRIM(status) <> '');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalogo_itens' AND column_name = 'area_fazenda')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_area_not_empty') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_area_not_empty
      CHECK (area_fazenda IS NULL OR TRIM(area_fazenda) <> '');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalogo_itens' AND column_name = 'tipo_projeto')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tipo_not_empty') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tipo_not_empty
      CHECK (tipo_projeto IS NULL OR TRIM(tipo_projeto) <> '');
  END IF;
END $$;
