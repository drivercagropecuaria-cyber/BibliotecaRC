import { corsHeaders, jsonResponse, getAuthUser } from '../_shared/auth.ts'

type UserRole = 'admin' | 'editor' | 'viewer'

type AdminUsersPayload = {
  action: 'create' | 'update'
  payload: Record<string, unknown>
}

const toRole = (value: unknown): UserRole => {
  if (value === 'admin' || value === 'editor' || value === 'viewer') return value
  return 'viewer'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo nao permitido' }, 405)
  }

  const { user, error } = await getAuthUser(req)
  if (error || !user) {
    const status = error === 'CONFIG_ERROR' ? 500 : 401
    return jsonResponse({ error: 'Nao autenticado', reason: error }, status)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'Configuracao Supabase ausente' }, 500)
  }

  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader) {
    return jsonResponse({ error: 'Token ausente' }, 401)
  }

  const adminCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=role&id=eq.${user.id}`, {
    headers: {
      Authorization: authHeader,
      apikey: anonKey,
    }
  })

  if (!adminCheck.ok) {
    const errText = await adminCheck.text()
    return jsonResponse({ error: `Falha ao validar permissao: ${errText}` }, 403)
  }

  const adminRows = await adminCheck.json()
  const isAdmin = Array.isArray(adminRows) && adminRows[0]?.role === 'admin'
  if (!isAdmin) {
    return jsonResponse({ error: 'Apenas administradores' }, 403)
  }

  let body: AdminUsersPayload
  try {
    body = await req.json()
  } catch (_err) {
    return jsonResponse({ error: 'Payload invalido' }, 400)
  }

  const action = body?.action
  const payload = body?.payload || {}

  if (action === 'create') {
    const email = String(payload.email || '').trim()
    const password = String(payload.password || '')
    const nome = String(payload.nome || '').trim()
    const role = toRole(payload.role)
    const active = payload.active !== false

    if (!email || !password) {
      return jsonResponse({ error: 'Email e senha sao obrigatorios' }, 400)
    }

    const createResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome: nome || email.split('@')[0] },
        app_metadata: { role },
      })
    })

    const created = await createResponse.json()
    if (!createResponse.ok) {
      return jsonResponse({ error: created?.message || 'Erro ao criar usuario' }, 500)
    }

    const now = new Date().toISOString()
    await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${created.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        nome: nome || email.split('@')[0],
        deleted_at: active ? null : now,
        updated_at: now,
      })
    })

    if (!active) {
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${created.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ban_duration: '876000h' })
      })
    }

    return jsonResponse({ success: true, user: { id: created.id, email: created.email, role } })
  }

  if (action === 'update') {
    const userId = String(payload.userId || '').trim()
    if (!userId) {
      return jsonResponse({ error: 'userId obrigatorio' }, 400)
    }

    const role = payload.role ? toRole(payload.role) : null
    const nome = payload.nome ? String(payload.nome || '').trim() : null
    const active = typeof payload.active === 'boolean' ? payload.active : null

    const adminUpdate: Record<string, unknown> = {}
    if (role) adminUpdate.app_metadata = { role }
    if (nome) adminUpdate.user_metadata = { nome }
    if (active !== null) adminUpdate.ban_duration = active ? 'none' : '876000h'

    if (Object.keys(adminUpdate).length > 0) {
      const adminUpdateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminUpdate)
      })

      if (!adminUpdateRes.ok) {
        const errText = await adminUpdateRes.text()
        return jsonResponse({ error: errText || 'Erro ao atualizar usuario' }, 500)
      }
    }

    const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (role) profileUpdate.role = role
    if (nome) profileUpdate.nome = nome
    if (active !== null) profileUpdate.deleted_at = active ? null : new Date().toISOString()

    await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileUpdate)
    })

    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Acao invalida' }, 400)
})
