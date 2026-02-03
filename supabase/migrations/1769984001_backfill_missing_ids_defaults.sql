-- Migration: backfill_missing_ids_defaults
-- Cria valores padrão nas tabelas de referência e preenche *_id nulos

INSERT INTO areas_fazendas (nome)
SELECT 'Sem área'
WHERE NOT EXISTS (SELECT 1 FROM areas_fazendas WHERE lower(nome)=lower('Sem área'));

INSERT INTO pontos (nome)
SELECT 'Sem ponto'
WHERE NOT EXISTS (SELECT 1 FROM pontos WHERE lower(nome)=lower('Sem ponto'));

INSERT INTO tipos_projeto (nome)
SELECT 'Sem tipo'
WHERE NOT EXISTS (SELECT 1 FROM tipos_projeto WHERE lower(nome)=lower('Sem tipo'));

INSERT INTO temas_principais (nome)
SELECT 'Sem tema'
WHERE NOT EXISTS (SELECT 1 FROM temas_principais WHERE lower(nome)=lower('Sem tema'));

INSERT INTO eventos_principais (nome)
SELECT 'Sem evento'
WHERE NOT EXISTS (SELECT 1 FROM eventos_principais WHERE lower(nome)=lower('Sem evento'));

INSERT INTO funcoes_historicas (nome)
SELECT 'Sem função'
WHERE NOT EXISTS (SELECT 1 FROM funcoes_historicas WHERE lower(nome)=lower('Sem função'));

INSERT INTO capitulos_filme (nome)
SELECT 'A definir'
WHERE NOT EXISTS (SELECT 1 FROM capitulos_filme WHERE lower(nome)=lower('A definir'));

INSERT INTO nucleos_pecuaria (nucleo)
SELECT 'Sem núcleo'
WHERE NOT EXISTS (SELECT 1 FROM nucleos_pecuaria WHERE lower(nucleo)=lower('Sem núcleo'));

INSERT INTO nucleos_agro (nucleo)
SELECT 'Sem núcleo'
WHERE NOT EXISTS (SELECT 1 FROM nucleos_agro WHERE lower(nucleo)=lower('Sem núcleo'));

INSERT INTO operacoes_internas (nucleo)
SELECT 'Sem núcleo'
WHERE NOT EXISTS (SELECT 1 FROM operacoes_internas WHERE lower(nucleo)=lower('Sem núcleo'));

INSERT INTO marca_valorizacao (nucleo)
SELECT 'Sem núcleo'
WHERE NOT EXISTS (SELECT 1 FROM marca_valorizacao WHERE lower(nucleo)=lower('Sem núcleo'));

UPDATE catalogo_itens
SET area_fazenda_id = (SELECT id FROM areas_fazendas WHERE lower(nome)=lower('Sem área') LIMIT 1)
WHERE area_fazenda_id IS NULL;

UPDATE catalogo_itens
SET ponto_id = (SELECT id FROM pontos WHERE lower(nome)=lower('Sem ponto') LIMIT 1)
WHERE ponto_id IS NULL;

UPDATE catalogo_itens
SET tipo_projeto_id = (SELECT id FROM tipos_projeto WHERE lower(nome)=lower('Sem tipo') LIMIT 1)
WHERE tipo_projeto_id IS NULL;

UPDATE catalogo_itens
SET tema_principal_id = (SELECT id FROM temas_principais WHERE lower(nome)=lower('Sem tema') LIMIT 1)
WHERE tema_principal_id IS NULL;

UPDATE catalogo_itens
SET evento_id = (SELECT id FROM eventos_principais WHERE lower(nome)=lower('Sem evento') LIMIT 1)
WHERE evento_id IS NULL;

UPDATE catalogo_itens
SET funcao_historica_id = (SELECT id FROM funcoes_historicas WHERE lower(nome)=lower('Sem função') LIMIT 1)
WHERE funcao_historica_id IS NULL;

UPDATE catalogo_itens
SET capitulo_id = (SELECT id FROM capitulos_filme WHERE lower(nome)=lower('A definir') LIMIT 1)
WHERE capitulo_id IS NULL;

UPDATE catalogo_itens
SET nucleo_pecuaria_id = (SELECT id FROM nucleos_pecuaria WHERE lower(nucleo)=lower('Sem núcleo') LIMIT 1)
WHERE nucleo_pecuaria_id IS NULL;

UPDATE catalogo_itens
SET nucleo_agro_id = (SELECT id FROM nucleos_agro WHERE lower(nucleo)=lower('Sem núcleo') LIMIT 1)
WHERE nucleo_agro_id IS NULL;

UPDATE catalogo_itens
SET operacao_id = (SELECT id FROM operacoes_internas WHERE lower(nucleo)=lower('Sem núcleo') LIMIT 1)
WHERE operacao_id IS NULL;

UPDATE catalogo_itens
SET marca_id = (SELECT id FROM marca_valorizacao WHERE lower(nucleo)=lower('Sem núcleo') LIMIT 1)
WHERE marca_id IS NULL;
