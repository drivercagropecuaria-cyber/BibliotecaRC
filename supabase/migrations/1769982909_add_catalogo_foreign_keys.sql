-- Migration: add_catalogo_foreign_keys
-- Adiciona FKs nas colunas *_id de catalogo_itens

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_area_fazenda_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_area_fazenda_fk
      FOREIGN KEY (area_fazenda_id) REFERENCES areas_fazendas(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_ponto_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_ponto_fk
      FOREIGN KEY (ponto_id) REFERENCES pontos(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tipo_projeto_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tipo_projeto_fk
      FOREIGN KEY (tipo_projeto_id) REFERENCES tipos_projeto(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_status_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_status_fk
      FOREIGN KEY (status_id) REFERENCES status_material(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tema_principal_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tema_principal_fk
      FOREIGN KEY (tema_principal_id) REFERENCES temas_principais(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_evento_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_evento_fk
      FOREIGN KEY (evento_id) REFERENCES eventos_principais(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_funcao_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_funcao_fk
      FOREIGN KEY (funcao_historica_id) REFERENCES funcoes_historicas(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_capitulo_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_capitulo_fk
      FOREIGN KEY (capitulo_id) REFERENCES capitulos_filme(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_nucleo_pecuaria_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_nucleo_pecuaria_fk
      FOREIGN KEY (nucleo_pecuaria_id) REFERENCES nucleos_pecuaria(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_nucleo_agro_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_nucleo_agro_fk
      FOREIGN KEY (nucleo_agro_id) REFERENCES nucleos_agro(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_operacao_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_operacao_fk
      FOREIGN KEY (operacao_id) REFERENCES operacoes_internas(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_marca_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_marca_fk
      FOREIGN KEY (marca_id) REFERENCES marca_valorizacao(id) ON DELETE SET NULL;
  END IF;
END $$;
