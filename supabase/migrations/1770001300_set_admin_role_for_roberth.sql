-- Definir role de administrador para o usuário informado (por email)

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'roberth@rcagropecuaria.com.br'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Atualiza app_metadata com role admin
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"',
      true
    )
    WHERE id = v_user_id;

    -- Garante perfil com role admin
    INSERT INTO user_profiles (id, email, role, created_at, updated_at)
    VALUES (v_user_id, 'roberth@rcagropecuaria.com.br', 'admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          role = 'admin',
          updated_at = NOW();
  END IF;
END $$;
