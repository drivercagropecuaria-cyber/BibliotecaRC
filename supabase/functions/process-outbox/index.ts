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

  const eventsRes = await fetch(
    `${supabaseUrl}/rest/v1/outbox_events?select=*&processed_at=is.null&order=created_at.asc&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey
      }
    }
  )

  if (!eventsRes.ok) {
    await fetch(`${supabaseUrl}/rest/v1/function_runs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        function_name: 'process-outbox',
        status: 'error',
        details: { code: 'OUTBOX_READ_FAILED' }
      })
    })
    if (alertWebhook) {
      await fetch(alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: 'process-outbox',
          status: 'error',
          code: 'OUTBOX_READ_FAILED'
        })
      })
    }
    return jsonResponse({ error: { code: 'OUTBOX_READ_FAILED' } }, 500)
  }

  const events = await eventsRes.json()
  let processed = 0
  let skipped = 0

  for (const event of events) {
    if (event.event_type !== 'ASSET_COMMITTED') {
      skipped += 1
      continue
    }

    const mediaId = event.payload?.media_id
    if (!mediaId) {
      await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'MISSING_MEDIA_ID', retry_count: (event.retry_count || 0) + 1 })
      })
      skipped += 1
      continue
    }

    const mediaRes = await fetch(`${supabaseUrl}/rest/v1/media_assets?id=eq.${mediaId}&select=id,mime_type,thumbnail_url`, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey
      }
    })

    if (!mediaRes.ok) {
      skipped += 1
      continue
    }

    const media = (await mediaRes.json())?.[0]
    const isImage = media?.mime_type?.startsWith('image')
    const hasThumb = !!media?.thumbnail_url

    if (isImage || hasThumb) {
      await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ processed_at: new Date().toISOString(), error: null })
      })
      processed += 1
    } else {
      await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'THUMBNAIL_PENDING', retry_count: (event.retry_count || 0) + 1 })
      })
      skipped += 1
    }
  }

  await fetch(`${supabaseUrl}/rest/v1/function_runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      function_name: 'process-outbox',
      status: 'success',
      details: { processed, skipped }
    })
  })

  if (alertWebhook && skipped > 0) {
    await fetch(alertWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        function: 'process-outbox',
        status: 'warning',
        processed,
        skipped
      })
    })
  }

  return jsonResponse({ processed, skipped })
})
