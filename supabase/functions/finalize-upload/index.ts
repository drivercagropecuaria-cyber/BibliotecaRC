import { corsHeaders, getAuthUser, jsonResponse } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'METHOD_NOT_ALLOWED' } }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim()
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse({ error: { code: 'CONFIG_ERROR' } }, 500)
  }

  const { user, error } = await getAuthUser(req)
  const fallbackUserId = Deno.env.get('PUBLIC_UPLOAD_USER_ID')?.trim()
  const effectiveUserId = user?.id || fallbackUserId || null
  const usingFallback = !user && !!fallbackUserId
  if (!effectiveUserId) {
    return jsonResponse({ error: { code: error || 'INVALID_TOKEN' } }, 401)
  }

  const maxUploadsPerMinute = Number(Deno.env.get('MAX_UPLOADS_PER_MINUTE') || '')
  if (!Number.isNaN(maxUploadsPerMinute) && maxUploadsPerMinute > 0) {
    const since = new Date(Date.now() - 60_000).toISOString()
    const rateRes = await fetch(
      `${supabaseUrl}/rest/v1/upload_jobs?select=id&user_id=eq.${effectiveUserId}&created_at=gte.${encodeURIComponent(since)}`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey
        }
      }
    )

    if (!rateRes.ok) {
      return jsonResponse({ error: { code: 'RATE_LIMIT_CHECK_FAILED' } }, 500)
    }

    const recentJobs = await rateRes.json()
    if (Array.isArray(recentJobs) && recentJobs.length >= maxUploadsPerMinute) {
      return jsonResponse({ error: { code: 'RATE_LIMIT' } }, 429)
    }
  }

  let payload: any = {}
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: { code: 'INVALID_JSON' } }, 400)
  }

  const jobId = String(payload.job_id || '').trim()
  const catalogoData = payload.catalogo_data || {}
  if (!jobId) {
    return jsonResponse({ error: { code: 'JOB_NOT_FOUND' } }, 400)
  }

  const jobRes = await fetch(`${supabaseUrl}/rest/v1/upload_jobs?id=eq.${jobId}&select=*`, {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey
    }
  })

  if (!jobRes.ok) {
    return jsonResponse({ error: { code: 'JOB_LOOKUP_FAILED' } }, 500)
  }

  const jobs = await jobRes.json()
  const job = jobs?.[0]
  if (!job) {
    return jsonResponse({ error: { code: 'JOB_NOT_FOUND' } }, 404)
  }

  if (job.user_id !== effectiveUserId) {
    return jsonResponse({ error: { code: 'FORBIDDEN' } }, 403)
  }

  if (job.status === 'COMMITTED') {
    return jsonResponse({ error: { code: 'INVALID_STATUS' } }, 400)
  }

  const storageHead = await fetch(`${supabaseUrl}/storage/v1/object/${job.bucket}/${job.object_path}`, {
    method: 'HEAD',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey
    }
  })

  if (!storageHead.ok) {
    return jsonResponse({ error: { code: 'FILE_NOT_FOUND' } }, 400)
  }

  await fetch(`${supabaseUrl}/rest/v1/upload_jobs?id=eq.${jobId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'UPLOADED' })
  })

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${job.bucket}/${job.object_path}`

  const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/rpc_finalize_upload`, {
    method: 'POST',
    headers: {
      Authorization: usingFallback ? `Bearer ${serviceRoleKey}` : (req.headers.get('authorization') || ''),
      apikey: usingFallback ? serviceRoleKey : anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_job_id: jobId,
      p_catalogo_data: {
        ...catalogoData,
        public_url: publicUrl
      },
      p_actor_user_id: usingFallback ? effectiveUserId : null
    })
  })

  const rpcBody = await rpcRes.json()
  if (!rpcRes.ok || rpcBody?.success === false) {
    return jsonResponse({ error: { code: 'TRANSACTION_FAILED', details: rpcBody } }, 500)
  }

  return jsonResponse(rpcBody)
})
