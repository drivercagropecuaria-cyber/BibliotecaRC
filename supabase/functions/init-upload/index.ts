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
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: { code: 'CONFIG_ERROR' } }, 500)
  }

  const { user, error } = await getAuthUser(req)
  const fallbackUserId = Deno.env.get('PUBLIC_UPLOAD_USER_ID')?.trim()
  const effectiveUserId = user?.id || fallbackUserId || null
  if (!effectiveUserId) {
    return jsonResponse({ error: { code: error || 'INVALID_TOKEN' } }, 401)
  }

  let payload: any = {}
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: { code: 'INVALID_JSON' } }, 400)
  }

  const area = String(payload.area || '').trim() || 'sem-area'
  const originalFilename = String(payload.original_filename || '').trim()
  const mimeType = String(payload.mime_type || '').trim() || null
  const sizeBytes = Number(payload.size_bytes || 0)
  const maxBytes = Number(Deno.env.get('MAX_FILE_SIZE_BYTES') || 5 * 1024 * 1024 * 1024)

  if (!originalFilename || sizeBytes <= 0) {
    return jsonResponse({ error: { code: 'MISSING_PARAMS' } }, 400)
  }

  if (sizeBytes > maxBytes) {
    return jsonResponse({ error: { code: 'FILE_TOO_LARGE' } }, 400)
  }

  const sanitize = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const jobId = crypto.randomUUID()
  const bucket = 'acervo-files'
  const objectPath = `uploads/${sanitize(area)}/${jobId}/${sanitize(originalFilename)}`

  const maxConcurrent = Number(Deno.env.get('MAX_CONCURRENT_UPLOADS') || 10)
  const maxPerMinute = Number(Deno.env.get('MAX_UPLOADS_PER_MINUTE') || 120)
  const countRes = await fetch(
    `${supabaseUrl}/rest/v1/upload_jobs?select=id&user_id=eq.${effectiveUserId}&status=in.(PENDING,UPLOADING)`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey
      }
    }
  )

  if (!countRes.ok) {
    return jsonResponse({ error: { code: 'JOB_COUNT_FAILED' } }, 500)
  }

  const existing = await countRes.json()
  if (Array.isArray(existing) && existing.length >= maxConcurrent) {
    return jsonResponse({ error: { code: 'TOO_MANY_UPLOADS' } }, 429)
  }

  if (Number.isFinite(maxPerMinute) && maxPerMinute > 0) {
    const cutoffIso = new Date(Date.now() - 60 * 1000).toISOString()
    const recentRes = await fetch(
      `${supabaseUrl}/rest/v1/upload_jobs?select=id&user_id=eq.${effectiveUserId}&created_at=gt.${cutoffIso}`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey
        }
      }
    )

    if (!recentRes.ok) {
      return jsonResponse({ error: { code: 'JOB_RATE_CHECK_FAILED' } }, 500)
    }

    const recent = await recentRes.json()
    if (Array.isArray(recent) && recent.length >= maxPerMinute) {
      return jsonResponse({ error: { code: 'TOO_MANY_REQUESTS' } }, 429)
    }
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/upload_jobs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: jobId,
      user_id: effectiveUserId,
      bucket,
      object_path: objectPath,
      original_filename: originalFilename,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      status: 'PENDING'
    })
  })

  if (!insertRes.ok) {
    const errorText = await insertRes.text()
    return jsonResponse({ error: { code: 'JOB_CREATE_FAILED', details: errorText } }, 500)
  }

  return jsonResponse({
    job_id: jobId,
    bucket,
    object_path: objectPath
  })
})
