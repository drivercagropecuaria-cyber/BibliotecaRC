-- Ajuste de tipos dos IDs de catalogo_itens para UUID
-- Converte colunas INT para UUID usando taxonomy_categories (por nome)

-- Remover views dependentes antes da alteração de tipos
DROP VIEW IF EXISTS v_catalogo_stats CASCADE;
DROP VIEW IF EXISTS v_catalogo_completo CASCADE;
DROP VIEW IF EXISTS v_catalogo_legacy CASCADE;
DROP VIEW IF EXISTS v_catalogo_ativo CASCADE;
DROP VIEW IF EXISTS v_catalogo_id_readiness CASCADE;
DROP VIEW IF EXISTS v_catalogo_audit_recente CASCADE;
DROP VIEW IF EXISTS v_catalogo_missing_ids CASCADE;
DROP VIEW IF EXISTS v_catalogo_name_mismatch CASCADE;

-- Remover FKs antigas (referências a tabelas legadas com INT)
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_area_fazenda_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_ponto_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_tipo_projeto_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_status_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_tema_principal_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_evento_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_funcao_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_capitulo_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_nucleo_pecuaria_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_nucleo_agro_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_operacao_fk;
ALTER TABLE catalogo_itens DROP CONSTRAINT IF EXISTS catalogo_itens_marca_fk;

-- Garantir que colunas obrigatórias possam ser convertidas (remover NOT NULL temporariamente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'area_fazenda_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE catalogo_itens ALTER COLUMN area_fazenda_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'tipo_projeto_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE catalogo_itens ALTER COLUMN tipo_projeto_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'status_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE catalogo_itens ALTER COLUMN status_id DROP NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'area_fazenda_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS area_fazenda_uuid uuid;
    UPDATE catalogo_itens ci
      SET area_fazenda_uuid = tc.id
      FROM areas_fazendas af
      JOIN taxonomy_categories tc
        ON tc.type = 'area'
       AND tc.name = af.nome
     WHERE ci.area_fazenda_id = af.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN area_fazenda_id TYPE uuid
      USING area_fazenda_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN area_fazenda_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'ponto_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS ponto_uuid uuid;
    UPDATE catalogo_itens ci
      SET ponto_uuid = tc.id
      FROM pontos p
      JOIN taxonomy_categories tc
        ON tc.type = 'ponto'
       AND tc.name = p.nome
     WHERE ci.ponto_id = p.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN ponto_id TYPE uuid
      USING ponto_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN ponto_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'tipo_projeto_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS tipo_projeto_uuid uuid;
    UPDATE catalogo_itens ci
      SET tipo_projeto_uuid = tc.id
      FROM tipos_projeto tp
      JOIN taxonomy_categories tc
        ON tc.type = 'tipo_projeto'
       AND tc.name = tp.nome
     WHERE ci.tipo_projeto_id = tp.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN tipo_projeto_id TYPE uuid
      USING tipo_projeto_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN tipo_projeto_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'nucleo_pecuaria_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS nucleo_pecuaria_uuid uuid;
    UPDATE catalogo_itens ci
      SET nucleo_pecuaria_uuid = tc.id
      FROM nucleos_pecuaria np
      JOIN taxonomy_categories tc
        ON tc.type = 'nucleo_pecuaria'
       AND tc.name = np.nucleo
     WHERE ci.nucleo_pecuaria_id = np.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN nucleo_pecuaria_id TYPE uuid
      USING nucleo_pecuaria_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN nucleo_pecuaria_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'nucleo_agro_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS nucleo_agro_uuid uuid;
    UPDATE catalogo_itens ci
      SET nucleo_agro_uuid = tc.id
      FROM nucleos_agro na
      JOIN taxonomy_categories tc
        ON tc.type = 'nucleo_agro'
       AND tc.name = na.nucleo
     WHERE ci.nucleo_agro_id = na.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN nucleo_agro_id TYPE uuid
      USING nucleo_agro_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN nucleo_agro_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'operacao_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS operacao_uuid uuid;
    UPDATE catalogo_itens ci
      SET operacao_uuid = tc.id
      FROM operacoes_internas oi
      JOIN taxonomy_categories tc
        ON tc.type = 'nucleo_operacoes'
       AND tc.name = oi.nucleo
     WHERE ci.operacao_id = oi.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN operacao_id TYPE uuid
      USING operacao_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN operacao_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'marca_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS marca_uuid uuid;
    UPDATE catalogo_itens ci
      SET marca_uuid = tc.id
      FROM marca_valorizacao mv
      JOIN taxonomy_categories tc
        ON tc.type = 'nucleo_marca'
       AND tc.name = mv.nucleo
     WHERE ci.marca_id = mv.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN marca_id TYPE uuid
      USING marca_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN marca_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'evento_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS evento_uuid uuid;
    UPDATE catalogo_itens ci
      SET evento_uuid = tc.id
      FROM eventos_principais ep
      JOIN taxonomy_categories tc
        ON tc.type = 'evento'
       AND tc.name = ep.nome
     WHERE ci.evento_id = ep.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN evento_id TYPE uuid
      USING evento_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN evento_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'funcao_historica_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS funcao_historica_uuid uuid;
    UPDATE catalogo_itens ci
      SET funcao_historica_uuid = tc.id
      FROM funcoes_historicas fh
      JOIN taxonomy_categories tc
        ON tc.type = 'funcao_historica'
       AND tc.name = fh.nome
     WHERE ci.funcao_historica_id = fh.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN funcao_historica_id TYPE uuid
      USING funcao_historica_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN funcao_historica_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'tema_principal_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS tema_principal_uuid uuid;
    UPDATE catalogo_itens ci
      SET tema_principal_uuid = tc.id
      FROM temas_principais tp
      JOIN taxonomy_categories tc
        ON tc.type = 'tema_principal'
       AND tc.name = tp.nome
     WHERE ci.tema_principal_id = tp.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN tema_principal_id TYPE uuid
      USING tema_principal_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN tema_principal_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'status_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS status_uuid uuid;
    UPDATE catalogo_itens ci
      SET status_uuid = tc.id
      FROM status_material sm
      JOIN taxonomy_categories tc
        ON tc.type = 'status'
       AND tc.name = sm.nome
     WHERE ci.status_id = sm.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN status_id TYPE uuid
      USING status_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN status_uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'catalogo_itens'
      AND column_name = 'capitulo_id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE catalogo_itens ADD COLUMN IF NOT EXISTS capitulo_uuid uuid;
    UPDATE catalogo_itens ci
      SET capitulo_uuid = tc.id
      FROM capitulos_filme cf
      JOIN taxonomy_categories tc
        ON tc.type = 'capitulo'
       AND tc.name = cf.nome
     WHERE ci.capitulo_id = cf.id;
    ALTER TABLE catalogo_itens
      ALTER COLUMN capitulo_id TYPE uuid
      USING capitulo_uuid;
    ALTER TABLE catalogo_itens DROP COLUMN capitulo_uuid;
  END IF;
END $$;

-- Recriar views principais usando taxonomy_categories
CREATE OR REPLACE VIEW v_catalogo_ativo AS
SELECT * FROM catalogo_itens
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW v_catalogo_completo AS
SELECT 
  ci.id,
  ci.identificador,
  ci.titulo,
  ci.descricao,
  ci.data_captacao,
  ci.frase_memoria,
  ci.observacoes,
  ci.responsavel,
  ci.media_id,

  -- IDs de relacionamento
  ci.area_fazenda_id,
  ci.ponto_id,
  ci.tipo_projeto_id,
  ci.nucleo_pecuaria_id,
  ci.nucleo_agro_id,
  ci.operacao_id,
  ci.marca_id,
  ci.evento_id,
  ci.funcao_historica_id,
  ci.tema_principal_id,
  ci.status_id,
  ci.capitulo_id,

  -- Nomes das taxonomias
  af.name as area_fazenda_nome,
  p.name as ponto_nome,
  tp.name as tipo_projeto_nome,
  np.name as nucleo_pecuaria_nome,
  na.name as nucleo_agro_nome,
  op.name as operacao_nome,
  mv.name as marca_nome,
  ep.name as evento_nome,
  fh.name as funcao_historica_nome,
  tprinc.name as tema_principal_nome,
  sm.name as status_nome,
  cf.name as capitulo_nome,

  -- Dados de mídia
  ma.filename as arquivo_nome,
  ma.mime_type as arquivo_tipo,
  ma.size_bytes as arquivo_tamanho,
  ma.public_url as arquivo_url,
  ma.thumbnail_url,
  ma.width,
  ma.height,
  ma.duration_seconds,

  -- Metadados
  ci.created_at,
  ci.updated_at,
  ci.deleted_at

FROM catalogo_itens ci
LEFT JOIN taxonomy_categories af ON ci.area_fazenda_id = af.id
LEFT JOIN taxonomy_categories p ON ci.ponto_id = p.id
LEFT JOIN taxonomy_categories tp ON ci.tipo_projeto_id = tp.id
LEFT JOIN taxonomy_categories np ON ci.nucleo_pecuaria_id = np.id
LEFT JOIN taxonomy_categories na ON ci.nucleo_agro_id = na.id
LEFT JOIN taxonomy_categories op ON ci.operacao_id = op.id
LEFT JOIN taxonomy_categories mv ON ci.marca_id = mv.id
LEFT JOIN taxonomy_categories ep ON ci.evento_id = ep.id
LEFT JOIN taxonomy_categories fh ON ci.funcao_historica_id = fh.id
LEFT JOIN taxonomy_categories tprinc ON ci.tema_principal_id = tprinc.id
LEFT JOIN taxonomy_categories sm ON ci.status_id = sm.id
LEFT JOIN taxonomy_categories cf ON ci.capitulo_id = cf.id
LEFT JOIN media_assets ma ON ci.media_id = ma.id
WHERE ci.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_catalogo_legacy AS
SELECT
  ci.id,
  ci.identificador,
  ci.titulo,
  ci.descricao,
  ci.data_captacao,
  ci.frase_memoria,
  ci.observacoes,
  ci.responsavel,
  ci.media_id,

  -- IDs
  ci.area_fazenda_id,
  ci.ponto_id,
  ci.tipo_projeto_id,
  ci.nucleo_pecuaria_id,
  ci.nucleo_agro_id,
  ci.operacao_id,
  ci.marca_id,
  ci.evento_id,
  ci.funcao_historica_id,
  ci.tema_principal_id,
  ci.status_id,
  ci.capitulo_id,

  -- Nomes
  af.name as area_fazenda,
  p.name as ponto,
  tp.name as tipo_projeto,
  np.name as nucleo_pecuaria,
  na.name as nucleo_agro,
  op.name as nucleo_operacoes,
  mv.name as marca,
  ep.name as evento,
  fh.name as funcao_historica,
  tprinc.name as tema_principal,
  sm.name as status,
  cf.name as capitulo,

  -- Mídia
  ma.filename as arquivo_nome,
  ma.mime_type as arquivo_tipo,
  ma.size_bytes as arquivo_tamanho,
  ma.public_url as arquivo_url,
  ma.thumbnail_url,

  -- Metadados
  ci.created_at,
  ci.updated_at,
  ci.deleted_at

FROM catalogo_itens ci
LEFT JOIN taxonomy_categories af ON ci.area_fazenda_id = af.id
LEFT JOIN taxonomy_categories p ON ci.ponto_id = p.id
LEFT JOIN taxonomy_categories tp ON ci.tipo_projeto_id = tp.id
LEFT JOIN taxonomy_categories np ON ci.nucleo_pecuaria_id = np.id
LEFT JOIN taxonomy_categories na ON ci.nucleo_agro_id = na.id
LEFT JOIN taxonomy_categories op ON ci.operacao_id = op.id
LEFT JOIN taxonomy_categories mv ON ci.marca_id = mv.id
LEFT JOIN taxonomy_categories ep ON ci.evento_id = ep.id
LEFT JOIN taxonomy_categories fh ON ci.funcao_historica_id = fh.id
LEFT JOIN taxonomy_categories tprinc ON ci.tema_principal_id = tprinc.id
LEFT JOIN taxonomy_categories sm ON ci.status_id = sm.id
LEFT JOIN taxonomy_categories cf ON ci.capitulo_id = cf.id
LEFT JOIN media_assets ma ON ci.media_id = ma.id
WHERE ci.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_catalogo_stats AS
SELECT 
  COUNT(*) as total_itens,
  COUNT(DISTINCT area_fazenda_id) as areas_unicas,
  COUNT(DISTINCT nucleo_pecuaria_id) as nucleos_pecuaria_unicos,
  COUNT(DISTINCT nucleo_agro_id) as nucleos_agro_unicos,
  COUNT(DISTINCT status_id) as status_unicos,
  COUNT(media_id) as itens_com_midia,
  MIN(data_captacao) as data_mais_antiga,
  MAX(data_captacao) as data_mais_recente
FROM catalogo_itens
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW v_catalogo_id_readiness AS
SELECT
  COUNT(*) AS total_itens,
  COUNT(*) FILTER (WHERE area_fazenda_id IS NULL) AS area_fazenda_id_nulos,
  COUNT(*) FILTER (WHERE ponto_id IS NULL) AS ponto_id_nulos,
  COUNT(*) FILTER (WHERE tipo_projeto_id IS NULL) AS tipo_projeto_id_nulos,
  COUNT(*) FILTER (WHERE status_id IS NULL) AS status_id_nulos,
  COUNT(*) FILTER (WHERE tema_principal_id IS NULL) AS tema_principal_id_nulos,
  COUNT(*) FILTER (WHERE evento_id IS NULL) AS evento_id_nulos,
  COUNT(*) FILTER (WHERE funcao_historica_id IS NULL) AS funcao_historica_id_nulos,
  COUNT(*) FILTER (WHERE capitulo_id IS NULL) AS capitulo_id_nulos,
  COUNT(*) FILTER (WHERE nucleo_pecuaria_id IS NULL) AS nucleo_pecuaria_id_nulos,
  COUNT(*) FILTER (WHERE nucleo_agro_id IS NULL) AS nucleo_agro_id_nulos,
  COUNT(*) FILTER (WHERE operacao_id IS NULL) AS operacao_id_nulos,
  COUNT(*) FILTER (WHERE marca_id IS NULL) AS marca_id_nulos
FROM catalogo_itens;

-- Reaplicar NOT NULL apenas quando não houver nulos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM catalogo_itens WHERE area_fazenda_id IS NULL) THEN
    ALTER TABLE catalogo_itens ALTER COLUMN area_fazenda_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM catalogo_itens WHERE tipo_projeto_id IS NULL) THEN
    ALTER TABLE catalogo_itens ALTER COLUMN tipo_projeto_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM catalogo_itens WHERE status_id IS NULL) THEN
    ALTER TABLE catalogo_itens ALTER COLUMN status_id SET NOT NULL;
  END IF;
END $$;

-- Recriar FKs para taxonomy_categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_area_fazenda_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_area_fazenda_fk
      FOREIGN KEY (area_fazenda_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_ponto_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_ponto_fk
      FOREIGN KEY (ponto_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tipo_projeto_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tipo_projeto_fk
      FOREIGN KEY (tipo_projeto_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_status_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_status_fk
      FOREIGN KEY (status_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_tema_principal_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_tema_principal_fk
      FOREIGN KEY (tema_principal_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_evento_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_evento_fk
      FOREIGN KEY (evento_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_funcao_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_funcao_fk
      FOREIGN KEY (funcao_historica_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_capitulo_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_capitulo_fk
      FOREIGN KEY (capitulo_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_nucleo_pecuaria_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_nucleo_pecuaria_fk
      FOREIGN KEY (nucleo_pecuaria_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_nucleo_agro_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_nucleo_agro_fk
      FOREIGN KEY (nucleo_agro_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_operacao_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_operacao_fk
      FOREIGN KEY (operacao_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogo_itens_marca_fk') THEN
    ALTER TABLE catalogo_itens
      ADD CONSTRAINT catalogo_itens_marca_fk
      FOREIGN KEY (marca_id) REFERENCES taxonomy_categories(id) ON DELETE SET NULL;
  END IF;
END $$;
