-- Logs de execucao das Edge Functions (cron/manual)
CREATE TABLE IF NOT EXISTS function_runs (
  id BIGSERIAL PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','error')),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_function_runs_created_at ON function_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_function_runs_name ON function_runs(function_name);

ALTER TABLE function_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view function runs" ON function_runs;
CREATE POLICY "Admins can view function runs"
  ON function_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );
