-- Permitir actor explícito quando executado com service role
CREATE OR REPLACE FUNCTION rpc_finalize_upload(
  p_job_id UUID,
  p_catalogo_data JSONB,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job upload_jobs%ROWTYPE;
  v_media_id UUID;
  v_catalogo_id INTEGER;
  v_actor UUID;
BEGIN
  SELECT * INTO v_job
  FROM upload_jobs
  WHERE id = p_job_id;

  IF v_job IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'JOB_NOT_FOUND');
  END IF;

  v_actor := auth.uid();

  IF v_actor IS NULL AND auth.role() = 'service_role' THEN
    v_actor := p_actor_user_id;
  END IF;

  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN');
  END IF;

  IF v_job.user_id != v_actor THEN
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
    p_catalogo_data->>'public_url',
    p_catalogo_data->>'arquivo_tipo',
    p_catalogo_data->>'arquivo_nome',
    (p_catalogo_data->>'arquivo_tamanho')::bigint,
    p_catalogo_data->>'thumbnail_url'
  ) RETURNING id INTO v_catalogo_id;

  UPDATE upload_jobs
  SET status = 'COMMITTED', committed_at = NOW()
  WHERE id = p_job_id;

  INSERT INTO outbox_events (event_type, aggregate_id, payload)
  VALUES ('UPLOAD_FINALIZED', p_job_id, jsonb_build_object('catalogo_id', v_catalogo_id, 'media_id', v_media_id));

  RETURN jsonb_build_object('success', true, 'catalogo_id', v_catalogo_id, 'media_id', v_media_id);
END;
$$;
