-- Estatísticas do pipeline de upload (jobs + outbox)
CREATE OR REPLACE FUNCTION get_upload_pipeline_stats()
RETURNS TABLE (
  total_jobs BIGINT,
  pending BIGINT,
  uploading BIGINT,
  uploaded BIGINT,
  committed BIGINT,
  failed BIGINT,
  expired BIGINT,
  outbox_pending BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM upload_jobs) AS total_jobs,
    (SELECT COUNT(*) FROM upload_jobs WHERE status = 'PENDING') AS pending,
    (SELECT COUNT(*) FROM upload_jobs WHERE status = 'UPLOADING') AS uploading,
    (SELECT COUNT(*) FROM upload_jobs WHERE status = 'UPLOADED') AS uploaded,
    (SELECT COUNT(*) FROM upload_jobs WHERE status = 'COMMITTED') AS committed,
    (SELECT COUNT(*) FROM upload_jobs WHERE status = 'FAILED') AS failed,
    (SELECT COUNT(*) FROM upload_jobs WHERE status = 'EXPIRED') AS expired,
    (SELECT COUNT(*) FROM outbox_events WHERE processed_at IS NULL) AS outbox_pending;
$$;

GRANT EXECUTE ON FUNCTION get_upload_pipeline_stats() TO anon, authenticated;
