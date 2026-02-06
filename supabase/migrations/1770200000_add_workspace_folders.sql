-- Área de Trabalho (pastas + itens por referência)

CREATE TABLE IF NOT EXISTS workspace_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_folder_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES workspace_folders(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES catalogo_itens(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_workspace_folder_item UNIQUE (folder_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_folders_user
  ON workspace_folders(user_id);

CREATE INDEX IF NOT EXISTS idx_workspace_folder_items_folder
  ON workspace_folder_items(folder_id);

CREATE INDEX IF NOT EXISTS idx_workspace_folder_items_item
  ON workspace_folder_items(item_id);

ALTER TABLE workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_folder_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace folders owner select" ON workspace_folders;
CREATE POLICY "Workspace folders owner select"
  ON workspace_folders FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Workspace folders owner insert" ON workspace_folders;
CREATE POLICY "Workspace folders owner insert"
  ON workspace_folders FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Workspace folders owner update" ON workspace_folders;
CREATE POLICY "Workspace folders owner update"
  ON workspace_folders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Workspace folders owner delete" ON workspace_folders;
CREATE POLICY "Workspace folders owner delete"
  ON workspace_folders FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Workspace items owner select" ON workspace_folder_items;
CREATE POLICY "Workspace items owner select"
  ON workspace_folder_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_folders f
      WHERE f.id = workspace_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Workspace items owner insert" ON workspace_folder_items;
CREATE POLICY "Workspace items owner insert"
  ON workspace_folder_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_folders f
      WHERE f.id = workspace_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Workspace items owner delete" ON workspace_folder_items;
CREATE POLICY "Workspace items owner delete"
  ON workspace_folder_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_folders f
      WHERE f.id = workspace_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION workspace_add_items(p_folder_id UUID, p_item_ids BIGINT[])
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INT := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM workspace_folders f
    WHERE f.id = p_folder_id AND f.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  INSERT INTO workspace_folder_items (folder_id, item_id, added_by)
  SELECT p_folder_id, unnest(p_item_ids), auth.uid()
  ON CONFLICT (folder_id, item_id) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

CREATE OR REPLACE FUNCTION workspace_remove_items(p_folder_id UUID, p_item_ids BIGINT[])
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INT := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM workspace_folders f
    WHERE f.id = p_folder_id AND f.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  DELETE FROM workspace_folder_items
  WHERE folder_id = p_folder_id
    AND item_id = ANY (p_item_ids);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION workspace_add_items(UUID, BIGINT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION workspace_remove_items(UUID, BIGINT[]) TO authenticated;
