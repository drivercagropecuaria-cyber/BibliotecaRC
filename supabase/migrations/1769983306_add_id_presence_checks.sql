-- Migration: add_id_presence_checks
-- Exige *_id quando o nome correspondente está preenchido

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_area_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_area_id_required
      CHECK (area_fazenda IS NULL OR area_fazenda_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_ponto_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_ponto_id_required
      CHECK (ponto IS NULL OR ponto_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tipo_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tipo_id_required
      CHECK (tipo_projeto IS NULL OR tipo_projeto_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_status_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_status_id_required
      CHECK (status IS NULL OR status_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tema_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tema_id_required
      CHECK (tema_principal IS NULL OR tema_principal_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_evento_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_evento_id_required
      CHECK (evento IS NULL OR evento_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_funcao_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_funcao_id_required
      CHECK (funcao_historica IS NULL OR funcao_historica_id IS NOT NULL) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_capitulo_id_required') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_capitulo_id_required
      CHECK (capitulo IS NULL OR capitulo_id IS NOT NULL) NOT VALID;
  END IF;
END $$;
