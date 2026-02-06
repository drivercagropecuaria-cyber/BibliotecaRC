import { corsHeaders, jsonResponse } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const cronSecret = Deno.env.get('CRON_SECRET')
  const cronSecretOverride = Deno.env.get('CRON_SECRET_OVERRIDE')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const provided = req.headers.get('x-cron-secret') || ''
  const authHeader = req.headers.get('authorization') || ''
  const bearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : ''
  const authorized = (
    !!(cronSecret || cronSecretOverride || serviceRoleKey)
    && (
      provided === cronSecret
      || bearer === cronSecret
      || (cronSecretOverride && (provided === cronSecretOverride || bearer === cronSecretOverride))
      || (serviceRoleKey && (provided === serviceRoleKey || bearer === serviceRoleKey))
    )
  )
  if (!authorized) {
    return jsonResponse({ error: { code: 'FORBIDDEN' } }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const alertWebhook = Deno.env.get('ALERT_WEBHOOK_URL')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: { code: 'CONFIG_ERROR' } }, 500)
  }

  let manualMediaIds: string[] = []
  try {
    const body = await req.json()
    const single = typeof body?.media_id === 'string' ? body.media_id.trim() : ''
    const list = Array.isArray(body?.media_ids) ? body.media_ids : []
    manualMediaIds = [
      ...(single ? [single] : []),
      ...list.map((id: unknown) => String(id || '').trim()).filter(Boolean)
    ]
  } catch {
    manualMediaIds = []
  }

  if (manualMediaIds.length === 0) {
    try {
      const parsedUrl = new URL(req.url)
      const fromQuery = parsedUrl.searchParams.get('media_id') || ''
      const fromList = parsedUrl.searchParams.get('media_ids') || ''
      const queryIds = fromList.split(',').map((id) => id.trim()).filter(Boolean)
      manualMediaIds = [
        ...(fromQuery ? [fromQuery.trim()] : []),
        ...queryIds
      ]
    } catch {
      // ignore invalid URL
    }
  }

  let events: any[] = []
  if (manualMediaIds.length > 0) {
    events = manualMediaIds.map((mediaId) => ({
      id: 0,
      event_type: 'UPLOAD_FINALIZED',
      payload: { media_id: mediaId }
    }))
  } else {
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

    events = await eventsRes.json()
  }
  let processed = 0
  let skipped = 0

  const cloudConvertApiKey = Deno.env.get('CLOUDCONVERT_API_KEY')?.trim()
  const cloudConvertWebhookUrl = Deno.env.get('CLOUDCONVERT_WEBHOOK_URL')?.trim()

  for (const event of events) {
    if (event.event_type === 'UPLOAD_FINALIZED' || event.event_type === 'ASSET_COMMITTED') {
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

      const mediaRes = await fetch(`${supabaseUrl}/rest/v1/media_assets?id=eq.${mediaId}&select=id,mime_type,public_url,proxy_url,processing_status,bucket,path`, {
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
      const mime = media?.mime_type || ''
      const isVideo = mime.startsWith('video/')
      const isMp4 = mime.includes('mp4')
      const hasProxy = !!media?.proxy_url
      const isTranscoding = media?.processing_status === 'transcoding'

      if (!isVideo || isMp4 || hasProxy || isTranscoding) {
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
        continue
      }

      if (!cloudConvertApiKey || !cloudConvertWebhookUrl) {
        await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'TRANSCODE_CONFIG_MISSING', retry_count: (event.retry_count || 0) + 1 })
        })
        skipped += 1
        continue
      }

      let sourceUrl = media?.public_url || ''
      if (media?.bucket && media?.path) {
        const encodedPath = encodeURIComponent(media.path).replace(/%2F/g, '/')
        const signRes = await fetch(
          `${supabaseUrl}/storage/v1/object/sign/${media.bucket}/${encodedPath}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expiresIn: 3600 })
          }
        )

        if (!signRes.ok) {
          await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'SIGNED_URL_FAILED', retry_count: (event.retry_count || 0) + 1 })
          })
          skipped += 1
          continue
        }

        const signData = await signRes.json()
        const signedPath = signData?.signedURL || signData?.signedUrl
        if (signedPath) {
          sourceUrl = `${supabaseUrl}/storage/v1${signedPath}`
        }
      }

      if (!sourceUrl) {
        await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'SOURCE_URL_MISSING', retry_count: (event.retry_count || 0) + 1 })
        })
        skipped += 1
        continue
      }

      const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudConvertApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tasks: {
            'import-1': {
              operation: 'import/url',
              url: sourceUrl
            },
            'convert-1': {
              operation: 'convert',
              input: 'import-1',
              output_format: 'mp4',
              video_codec: 'x264',
              audio_codec: 'aac'
            },
            'export-1': {
              operation: 'export/url',
              input: 'convert-1'
            }
          },
          tag: `media:${mediaId}`,
          webhooks: {
            'job.finished': cloudConvertWebhookUrl,
            'job.failed': cloudConvertWebhookUrl
          }
        })
      })

      if (!jobRes.ok) {
        let failureDetail = ''
        try {
          failureDetail = await jobRes.text()
        } catch {
          failureDetail = ''
        }

        const detailSnippet = failureDetail ? `:${failureDetail.slice(0, 500)}` : ''

        await fetch(`${supabaseUrl}/rest/v1/outbox_events?id=eq.${event.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: `TRANSCODE_JOB_FAILED_${jobRes.status}${detailSnippet}`,
            retry_count: (event.retry_count || 0) + 1
          })
        })
        skipped += 1
        continue
      }

      await fetch(`${supabaseUrl}/rest/v1/media_assets?id=eq.${mediaId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ processing_status: 'transcoding' })
      })

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
      continue
    }

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
