-- FASE 1: upload_jobs, outbox_events, RLS e rpc_finalize_upload

-- Tabela upload_jobs
CREATE TABLE IF NOT EXISTS upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL DEFAULT 'acervo-files',
  object_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  checksum_sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'UPLOADING', 'UPLOADED', 'COMMITTED', 'FAILED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at TIMESTAMPTZ,
  error TEXT,
  CONSTRAINT unique_object_path UNIQUE (object_path)
);

CREATE INDEX IF NOT EXISTS idx_upload_jobs_user_created
  ON upload_jobs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_upload_jobs_status
  ON upload_jobs(status);

CREATE INDEX IF NOT EXISTS idx_upload_jobs_expired
  ON upload_jobs(created_at)
  WHERE status IN ('PENDING', 'UPLOADING', 'UPLOADED');

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS upload_jobs_updated_at ON upload_jobs;
CREATE TRIGGER upload_jobs_updated_at
  BEFORE UPDATE ON upload_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tabela outbox_events
CREATE TABLE IF NOT EXISTS outbox_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL DEFAULT 'upload_job',
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_unprocessed
  ON outbox_events(processed_at)
  WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_event_type
  ON outbox_events(event_type);

CREATE INDEX IF NOT EXISTS idx_outbox_aggregate
  ON outbox_events(aggregate_type, aggregate_id);

-- RLS upload_jobs
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only see their own jobs" ON upload_jobs;
CREATE POLICY "Users can only see their own jobs"
  ON upload_jobs FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can only create their own jobs" ON upload_jobs;
CREATE POLICY "Users can only create their own jobs"
  ON upload_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own jobs" ON upload_jobs;
CREATE POLICY "Users can update their own jobs"
  ON upload_jobs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can see all jobs" ON upload_jobs;
CREATE POLICY "Admins can see all jobs"
  ON upload_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS outbox_events
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only service role can read outbox" ON outbox_events;
CREATE POLICY "Only service role can read outbox"
  ON outbox_events FOR SELECT
  USING (false);

DROP POLICY IF EXISTS "Only service role can insert outbox" ON outbox_events;
CREATE POLICY "Only service role can insert outbox"
  ON outbox_events FOR INSERT
  WITH CHECK (false);

-- RPC: rpc_finalize_upload
CREATE OR REPLACE FUNCTION rpc_finalize_upload(
  p_job_id UUID,
  p_catalogo_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job upload_jobs%ROWTYPE;
  v_media_id UUID;
  v_catalogo_id INTEGER;
BEGIN
  SELECT * INTO v_job
  FROM upload_jobs
  WHERE id = p_job_id;

  IF v_job IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'JOB_NOT_FOUND');
  END IF;

  IF v_job.user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  IF v_job.status NOT IN ('UPLOADED', 'UPLOADING') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS');
  END IF;

  INSERT INTO media_assets (
    bucket,
    path,
    filename,
    mime_type,
    size_bytes,
    public_url,
    thumbnail_url,
    owner_id,
    is_processed,
    processing_status
  ) VALUES (
    v_job.bucket,
    v_job.object_path,
    v_job.original_filename,
    v_job.mime_type,
    v_job.size_bytes,
    COALESCE(p_catalogo_data->>'public_url', NULL),
    COALESCE(p_catalogo_data->>'thumbnail_url', NULL),
    v_job.user_id,
    false,
    'pending'
  ) RETURNING id INTO v_media_id;

  INSERT INTO catalogo_itens (
    titulo,
    descricao,
    area_fazenda_id,
    ponto_id,
    tipo_projeto_id,
    nucleo_pecuaria_id,
    nucleo_agro_id,
    operacao_id,
    marca_id,
    evento_id,
    funcao_historica_id,
    tema_principal_id,
    status_id,
    capitulo_id,
    frase_memoria,
    responsavel,
    observacoes,
    data_captacao,
    media_id,
    arquivo_url,
    arquivo_tipo,
    arquivo_nome,
    arquivo_tamanho,
    thumbnail_url
  ) VALUES (
    p_catalogo_data->>'titulo',
    p_catalogo_data->>'descricao',
    NULLIF(p_catalogo_data->>'area_fazenda_id','')::uuid,
    NULLIF(p_catalogo_data->>'ponto_id','')::uuid,
    NULLIF(p_catalogo_data->>'tipo_projeto_id','')::uuid,
    NULLIF(p_catalogo_data->>'nucleo_pecuaria_id','')::uuid,
    NULLIF(p_catalogo_data->>'nucleo_agro_id','')::uuid,
    NULLIF(p_catalogo_data->>'operacao_id','')::uuid,
    NULLIF(p_catalogo_data->>'marca_id','')::uuid,
    NULLIF(p_catalogo_data->>'evento_id','')::uuid,
    NULLIF(p_catalogo_data->>'funcao_historica_id','')::uuid,
    NULLIF(p_catalogo_data->>'tema_principal_id','')::uuid,
    NULLIF(p_catalogo_data->>'status_id','')::uuid,
    NULLIF(p_catalogo_data->>'capitulo_id','')::uuid,
    p_catalogo_data->>'frase_memoria',
    p_catalogo_data->>'responsavel',
    p_catalogo_data->>'observacoes',
    NULLIF(p_catalogo_data->>'data_captacao','')::date,
    v_media_id,
    COALESCE(p_catalogo_data->>'public_url', NULL),
    v_job.mime_type,
    v_job.object_path,
    v_job.size_bytes,
    COALESCE(p_catalogo_data->>'thumbnail_url', NULL)
  ) RETURNING id INTO v_catalogo_id;

  UPDATE upload_jobs
    SET status = 'COMMITTED',
        committed_at = NOW()
  WHERE id = v_job.id;

  INSERT INTO outbox_events (event_type, aggregate_id, payload)
  VALUES (
    'ASSET_COMMITTED',
    v_job.id,
    jsonb_build_object(
      'media_id', v_media_id,
      'catalogo_id', v_catalogo_id,
      'job_id', v_job.id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'media_id', v_media_id,
    'catalogo_id', v_catalogo_id,
    'status', 'COMMITTED'
  );
END;
$$;
