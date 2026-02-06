import { corsHeaders, jsonResponse } from '../_shared/auth.ts'

const getTokenFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return parsed.searchParams.get('token') || ''
  } catch {
    return ''
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'METHOD_NOT_ALLOWED' } }, 405)
  }

  const webhookToken = Deno.env.get('CLOUDCONVERT_WEBHOOK_TOKEN')?.trim()
  if (webhookToken) {
    const token =
      getTokenFromUrl(req.url)
      || req.headers.get('x-webhook-token')
      || req.headers.get('x-cloudconvert-webhook-token')
      || ''

    if (token !== webhookToken) {
      return jsonResponse({ error: { code: 'FORBIDDEN' } }, 401)
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: { code: 'CONFIG_ERROR' } }, 500)
  }

  const logRun = async (status: 'success' | 'error', details: Record<string, unknown>) => {
    try {
      await fetch(`${supabaseUrl}/rest/v1/function_runs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          function_name: 'cloudconvert-webhook',
          status,
          details
        })
      })
    } catch {
      // ignore logging errors
    }
  }

  let payload: any = {}
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: { code: 'INVALID_JSON' } }, 400)
  }

  const event = payload?.event || payload?.data?.event
  const job = payload?.data?.job || payload?.job || payload?.data
  const jobId = job?.id || payload?.job?.id || payload?.data?.job?.id || payload?.data?.id || null
  const cloudConvertApiKey = Deno.env.get('CLOUDCONVERT_API_KEY')?.trim()

  const fetchJobInfo = async () => {
    if (!jobId || !cloudConvertApiKey) return null
    const jobUrl = new URL(`https://api.cloudconvert.com/v2/jobs/${jobId}`)
    jobUrl.searchParams.set('include', 'tasks')
    const jobRes = await fetch(jobUrl.toString(), {
      headers: {
        Authorization: `Bearer ${cloudConvertApiKey}`
      }
    })

    if (!jobRes.ok) {
      console.error('JOB_FETCH_FAILED', { status: jobRes.status, jobId })
      await logRun('error', { code: 'JOB_FETCH_FAILED', status: jobRes.status, jobId })
      return null
    }

    const jobData = await jobRes.json()
    return jobData?.data || jobData
  }

  let jobInfo = job
  let tag = jobInfo?.tag || ''
  let mediaId = tag.startsWith('media:')
    ? tag.replace('media:', '')
    : (payload?.media_id || payload?.data?.media_id || null)

  if (!mediaId && jobId) {
    const fetchedJob = await fetchJobInfo()
    if (fetchedJob) {
      jobInfo = fetchedJob
      tag = jobInfo?.tag || ''
      mediaId = tag.startsWith('media:') ? tag.replace('media:', '') : null
    }
  }

  if (!mediaId) {
    await logRun('error', { code: 'MISSING_MEDIA_ID', event, jobId })
    return jsonResponse({ error: { code: 'MISSING_MEDIA_ID' } }, 400)
  }

  if (event === 'job.failed') {
    await fetch(`${supabaseUrl}/rest/v1/media_assets?id=eq.${mediaId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ processing_status: 'failed' })
    })
    await logRun('success', { event, mediaId, status: 'failed' })
    return jsonResponse({ ok: true })
  }

  if (event !== 'job.finished') {
    return jsonResponse({ ok: true })
  }

  const normalizeTasks = (tasksInput: any) => {
    if (Array.isArray(tasksInput)) return tasksInput
    if (tasksInput && typeof tasksInput === 'object') return Object.values(tasksInput)
    return []
  }

  const getExportUrlFromTasks = (tasksInput: any) => {
    const taskList = normalizeTasks(tasksInput)
    const exportTask = taskList.find((t: any) => t?.name?.includes('export') || t?.operation === 'export/url')
    const files = exportTask?.result?.files
    if (Array.isArray(files)) return files?.[0]?.url || ''
    if (files && typeof files === 'object') return (files as any)?.url || ''
    return ''
  }

  const tasks = jobInfo?.tasks || []
  let fileUrl = getExportUrlFromTasks(tasks)
    || payload?.export_url
    || payload?.data?.export_url
    || payload?.file_url
    || payload?.data?.file_url

  if (!fileUrl) {
    const fetchedJob = await fetchJobInfo()
    if (fetchedJob) {
      jobInfo = fetchedJob
      const jobTasks = jobInfo?.tasks || []
      fileUrl = getExportUrlFromTasks(jobTasks)
    }
  }

  if (!fileUrl) {
    console.error('EXPORT_URL_NOT_FOUND', { event, mediaId, jobId })
    await logRun('error', { code: 'EXPORT_URL_NOT_FOUND', event, mediaId, jobId })
    return jsonResponse({ error: { code: 'EXPORT_URL_NOT_FOUND' } }, 400)
  }

  const fileRes = await fetch(fileUrl)
  if (!fileRes.ok) {
    console.error('DOWNLOAD_FAILED', { status: fileRes.status, mediaId })
    await logRun('error', { code: 'DOWNLOAD_FAILED', status: fileRes.status, mediaId })
    return jsonResponse({ error: { code: 'DOWNLOAD_FAILED' } }, 400)
  }

  const sizeHeader = fileRes.headers.get('content-length')
  const sizeBytes = sizeHeader ? Number(sizeHeader) : null
  if (!fileRes.body) {
    console.error('DOWNLOAD_EMPTY', { mediaId })
    await logRun('error', { code: 'DOWNLOAD_EMPTY', mediaId })
    return jsonResponse({ error: { code: 'DOWNLOAD_EMPTY' } }, 400)
  }
  const bucket = 'acervo-files'
  const path = `proxies/${mediaId}.mp4`

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'video/mp4',
      'x-upsert': 'true'
    },
    body: fileRes.body
  })

  if (!uploadRes.ok) {
    console.error('UPLOAD_FAILED', { status: uploadRes.status, mediaId })
    await logRun('error', { code: 'UPLOAD_FAILED', status: uploadRes.status, mediaId })
    return jsonResponse({ error: { code: 'UPLOAD_FAILED' } }, 500)
  }

  const proxyUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`

  await fetch(`${supabaseUrl}/rest/v1/media_assets?id=eq.${mediaId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      proxy_url: proxyUrl,
      proxy_filename: `${mediaId}.mp4`,
      proxy_mime_type: 'video/mp4',
      proxy_size_bytes: sizeBytes,
      processing_status: 'ready',
      is_processed: true
    })
  })

  await logRun('success', { event, mediaId, proxyUrl })

  return jsonResponse({ ok: true })
})
