-- Migration: backfill_missing_ids_defaults
-- Cria valores padrão na taxonomy_categories e preenche *_id nulos

DO $do$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'taxonomy_categories') THEN
		-- Área/Fazenda
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem área', 'area_fazenda'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem área') AND type = 'area_fazenda'
		);

		UPDATE catalogo_itens
		SET area_fazenda_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem área') AND type = 'area_fazenda' LIMIT 1
		)
		WHERE area_fazenda_id IS NULL;

		-- Ponto
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem ponto', 'ponto'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem ponto') AND type = 'ponto'
		);

		UPDATE catalogo_itens
		SET ponto_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem ponto') AND type = 'ponto' LIMIT 1
		)
		WHERE ponto_id IS NULL;

		-- Tipo Projeto
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem tipo', 'tipo_projeto'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem tipo') AND type = 'tipo_projeto'
		);

		UPDATE catalogo_itens
		SET tipo_projeto_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem tipo') AND type = 'tipo_projeto' LIMIT 1
		)
		WHERE tipo_projeto_id IS NULL;

		-- Tema Principal
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem tema', 'tema_principal'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem tema') AND type = 'tema_principal'
		);

		UPDATE catalogo_itens
		SET tema_principal_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem tema') AND type = 'tema_principal' LIMIT 1
		)
		WHERE tema_principal_id IS NULL;

		-- Evento
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem evento', 'evento'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem evento') AND type = 'evento'
		);

		UPDATE catalogo_itens
		SET evento_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem evento') AND type = 'evento' LIMIT 1
		)
		WHERE evento_id IS NULL;

		-- Função Histórica
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem função', 'funcao_historica'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem função') AND type = 'funcao_historica'
		);

		UPDATE catalogo_itens
		SET funcao_historica_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem função') AND type = 'funcao_historica' LIMIT 1
		)
		WHERE funcao_historica_id IS NULL;

		-- Capítulo
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'A definir', 'capitulo'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('A definir') AND type = 'capitulo'
		);

		UPDATE catalogo_itens
		SET capitulo_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('A definir') AND type = 'capitulo' LIMIT 1
		)
		WHERE capitulo_id IS NULL;

		-- Núcleos/Operações/Marca
		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem núcleo', 'nucleo_pecuaria'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'nucleo_pecuaria'
		);

		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem núcleo', 'nucleo_agro'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'nucleo_agro'
		);

		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem núcleo', 'operacao'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'operacao'
		);

		INSERT INTO taxonomy_categories (name, type)
		SELECT 'Sem núcleo', 'marca'
		WHERE NOT EXISTS (
			SELECT 1 FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'marca'
		);

		UPDATE catalogo_itens
		SET nucleo_pecuaria_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'nucleo_pecuaria' LIMIT 1
		)
		WHERE nucleo_pecuaria_id IS NULL;

		UPDATE catalogo_itens
		SET nucleo_agro_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'nucleo_agro' LIMIT 1
		)
		WHERE nucleo_agro_id IS NULL;

		UPDATE catalogo_itens
		SET operacao_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'operacao' LIMIT 1
		)
		WHERE operacao_id IS NULL;

		UPDATE catalogo_itens
		SET marca_id = (
			SELECT id FROM taxonomy_categories WHERE lower(name)=lower('Sem núcleo') AND type = 'marca' LIMIT 1
		)
		WHERE marca_id IS NULL;
	END IF;
END $do$;
