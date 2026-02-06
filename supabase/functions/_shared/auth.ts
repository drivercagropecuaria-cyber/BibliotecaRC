export type AuthUser = {
  id: string
  email?: string
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-application-name, x-request-id, x-user-agent, x-forwarded-for',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

export const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })

export const getAuthUser = async (req: Request): Promise<{ user: AuthUser | null; error?: string }> => {
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader) return { user: null, error: 'MISSING_AUTH_HEADER' }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim()
  if (!supabaseUrl || !anonKey) return { user: null, error: 'CONFIG_ERROR' }

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: anonKey
    }
  })

  if (!res.ok) return { user: null, error: 'INVALID_TOKEN' }

  const data = await res.json()
  return { user: { id: data.id, email: data.email } }
}
