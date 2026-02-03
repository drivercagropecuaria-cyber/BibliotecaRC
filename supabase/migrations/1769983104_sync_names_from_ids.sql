-- Migration: sync_names_from_ids
-- Mantém colunas de nome sincronizadas a partir dos *_id

CREATE OR REPLACE FUNCTION sync_catalogo_names_from_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.area_fazenda_id IS NOT NULL THEN
    SELECT nome INTO NEW.area_fazenda FROM areas_fazendas WHERE id = NEW.area_fazenda_id;
  END IF;

  IF NEW.ponto_id IS NOT NULL THEN
    SELECT nome INTO NEW.ponto FROM pontos WHERE id = NEW.ponto_id;
  END IF;

  IF NEW.tipo_projeto_id IS NOT NULL THEN
    SELECT nome INTO NEW.tipo_projeto FROM tipos_projeto WHERE id = NEW.tipo_projeto_id;
  END IF;

  IF NEW.status_id IS NOT NULL THEN
    SELECT nome INTO NEW.status FROM status_material WHERE id = NEW.status_id;
  END IF;

  IF NEW.tema_principal_id IS NOT NULL THEN
    SELECT nome INTO NEW.tema_principal FROM temas_principais WHERE id = NEW.tema_principal_id;
  END IF;

  IF NEW.tema_secundario_id IS NOT NULL THEN
    SELECT nome INTO NEW.tema_secundario FROM temas_secundarios WHERE id = NEW.tema_secundario_id;
  END IF;

  IF NEW.evento_id IS NOT NULL THEN
    SELECT nome INTO NEW.evento FROM eventos_principais WHERE id = NEW.evento_id;
  END IF;

  IF NEW.funcao_historica_id IS NOT NULL THEN
    SELECT nome INTO NEW.funcao_historica FROM funcoes_historicas WHERE id = NEW.funcao_historica_id;
  END IF;

  IF NEW.capitulo_id IS NOT NULL THEN
    SELECT nome INTO NEW.capitulo FROM capitulos_filme WHERE id = NEW.capitulo_id;
  END IF;

  IF NEW.nucleo_pecuaria_id IS NOT NULL THEN
    SELECT nucleo INTO NEW.nucleo_pecuaria FROM nucleos_pecuaria WHERE id = NEW.nucleo_pecuaria_id;
  END IF;

  IF NEW.nucleo_agro_id IS NOT NULL THEN
    SELECT nucleo INTO NEW.nucleo_agro FROM nucleos_agro WHERE id = NEW.nucleo_agro_id;
  END IF;

  IF NEW.operacao_id IS NOT NULL THEN
    SELECT nucleo INTO NEW.nucleo_operacoes FROM operacoes_internas WHERE id = NEW.operacao_id;
  END IF;

  IF NEW.marca_id IS NOT NULL THEN
    SELECT nucleo INTO NEW.marca FROM marca_valorizacao WHERE id = NEW.marca_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_catalogo_names_from_ids ON catalogo_itens;

CREATE TRIGGER trg_sync_catalogo_names_from_ids
BEFORE INSERT OR UPDATE OF area_fazenda_id, ponto_id, tipo_projeto_id, status_id,
  tema_principal_id, tema_secundario_id, evento_id, funcao_historica_id,
  capitulo_id, nucleo_pecuaria_id, nucleo_agro_id, operacao_id, marca_id
ON catalogo_itens
FOR EACH ROW
EXECUTE FUNCTION sync_catalogo_names_from_ids();
