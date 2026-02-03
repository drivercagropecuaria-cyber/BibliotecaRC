-- Migration: backfill_catalogo_ids
-- Preenche colunas *_id a partir dos nomes existentes

UPDATE catalogo_itens ci
SET area_fazenda_id = af.id
FROM areas_fazendas af
WHERE ci.area_fazenda_id IS NULL
  AND ci.area_fazenda IS NOT NULL
  AND TRIM(ci.area_fazenda) <> ''
  AND LOWER(TRIM(ci.area_fazenda)) = LOWER(TRIM(af.nome));

UPDATE catalogo_itens ci
SET ponto_id = p.id
FROM pontos p
WHERE ci.ponto_id IS NULL
  AND ci.ponto IS NOT NULL
  AND TRIM(ci.ponto) <> ''
  AND LOWER(TRIM(ci.ponto)) = LOWER(TRIM(p.nome));

UPDATE catalogo_itens ci
SET tipo_projeto_id = tp.id
FROM tipos_projeto tp
WHERE ci.tipo_projeto_id IS NULL
  AND ci.tipo_projeto IS NOT NULL
  AND TRIM(ci.tipo_projeto) <> ''
  AND LOWER(TRIM(ci.tipo_projeto)) = LOWER(TRIM(tp.nome));

UPDATE catalogo_itens ci
SET status_id = sm.id
FROM status_material sm
WHERE ci.status_id IS NULL
  AND ci.status IS NOT NULL
  AND TRIM(ci.status) <> ''
  AND LOWER(TRIM(ci.status)) = LOWER(TRIM(sm.nome));

UPDATE catalogo_itens ci
SET tema_principal_id = tp.id
FROM temas_principais tp
WHERE ci.tema_principal_id IS NULL
  AND ci.tema_principal IS NOT NULL
  AND TRIM(ci.tema_principal) <> ''
  AND LOWER(TRIM(ci.tema_principal)) = LOWER(TRIM(tp.nome));

UPDATE catalogo_itens ci
SET evento_id = ep.id
FROM eventos_principais ep
WHERE ci.evento_id IS NULL
  AND ci.evento IS NOT NULL
  AND TRIM(ci.evento) <> ''
  AND LOWER(TRIM(ci.evento)) = LOWER(TRIM(ep.nome));

UPDATE catalogo_itens ci
SET funcao_historica_id = fh.id
FROM funcoes_historicas fh
WHERE ci.funcao_historica_id IS NULL
  AND ci.funcao_historica IS NOT NULL
  AND TRIM(ci.funcao_historica) <> ''
  AND LOWER(TRIM(ci.funcao_historica)) = LOWER(TRIM(fh.nome));

UPDATE catalogo_itens ci
SET capitulo_id = cf.id
FROM capitulos_filme cf
WHERE ci.capitulo_id IS NULL
  AND ci.capitulo IS NOT NULL
  AND TRIM(ci.capitulo) <> ''
  AND LOWER(TRIM(ci.capitulo)) = LOWER(TRIM(cf.nome));

UPDATE catalogo_itens ci
SET nucleo_pecuaria_id = np.id
FROM nucleos_pecuaria np
WHERE ci.nucleo_pecuaria_id IS NULL
  AND ci.nucleo_pecuaria IS NOT NULL
  AND TRIM(ci.nucleo_pecuaria) <> ''
  AND LOWER(TRIM(ci.nucleo_pecuaria)) = LOWER(TRIM(np.nucleo));

UPDATE catalogo_itens ci
SET nucleo_agro_id = na.id
FROM nucleos_agro na
WHERE ci.nucleo_agro_id IS NULL
  AND ci.nucleo_agro IS NOT NULL
  AND TRIM(ci.nucleo_agro) <> ''
  AND LOWER(TRIM(ci.nucleo_agro)) = LOWER(TRIM(na.nucleo));

UPDATE catalogo_itens ci
SET operacao_id = oi.id
FROM operacoes_internas oi
WHERE ci.operacao_id IS NULL
  AND ci.nucleo_operacoes IS NOT NULL
  AND TRIM(ci.nucleo_operacoes) <> ''
  AND LOWER(TRIM(ci.nucleo_operacoes)) = LOWER(TRIM(oi.nucleo));

UPDATE catalogo_itens ci
SET marca_id = mv.id
FROM marca_valorizacao mv
WHERE ci.marca_id IS NULL
  AND ci.marca IS NOT NULL
  AND TRIM(ci.marca) <> ''
  AND LOWER(TRIM(ci.marca)) = LOWER(TRIM(mv.nucleo));
