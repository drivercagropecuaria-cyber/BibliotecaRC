import { corsHeaders, jsonResponse } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const cronSecret = Deno.env.get('CRON_SECRET')
  const provided = req.headers.get('x-cron-secret') || ''
  if (!cronSecret || provided !== cronSecret) {
    return jsonResponse({ error: { code: 'FORBIDDEN' } }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const alertWebhook = Deno.env.get('ALERT_WEBHOOK_URL')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: { code: 'CONFIG_ERROR' } }, 500)
  }

  const cutoffHours = 24
  const cutoffIso = new Date(Date.now() - cutoffHours * 60 * 60 * 1000).toISOString()

  const jobsRes = await fetch(
    `${supabaseUrl}/rest/v1/upload_jobs?select=*&status=in.(PENDING,UPLOADING,UPLOADED)&created_at=lt.${cutoffIso}`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey
      }
    }
  )

  if (!jobsRes.ok) {
    await fetch(`${supabaseUrl}/rest/v1/function_runs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        function_name: 'reconcile-uploads',
        status: 'error',
        details: { code: 'JOB_SCAN_FAILED' }
      })
    })
    if (alertWebhook) {
      await fetch(alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: 'reconcile-uploads',
          status: 'error',
          code: 'JOB_SCAN_FAILED'
        })
      })
    }
    return jsonResponse({ error: { code: 'JOB_SCAN_FAILED' } }, 500)
  }

  const jobs = await jobsRes.json()
  let scanned = 0
  let expired = 0
  let deleted = 0

  for (const job of jobs) {
    scanned += 1
    const head = await fetch(`${supabaseUrl}/storage/v1/object/${job.bucket}/${job.object_path}`, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey
      }
    })

    if (head.ok) {
      const del = await fetch(`${supabaseUrl}/storage/v1/object/${job.bucket}/${job.object_path}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey
        }
      })
      if (del.ok) deleted += 1
    }

    await fetch(`${supabaseUrl}/rest/v1/upload_jobs?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'EXPIRED', error: 'JOB_EXPIRED' })
    })

    expired += 1
  }

  await fetch(`${supabaseUrl}/rest/v1/function_runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      function_name: 'reconcile-uploads',
      status: 'success',
      details: { scanned, expired, deleted }
    })
  })

  if (alertWebhook && (expired > 0 || deleted > 0)) {
    await fetch(alertWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        function: 'reconcile-uploads',
        status: 'warning',
        scanned,
        expired,
        deleted
      })
    })
  }

  return jsonResponse({ scanned, expired, deleted })
})
