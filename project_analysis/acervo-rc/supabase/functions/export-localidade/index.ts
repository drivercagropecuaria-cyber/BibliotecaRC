// Edge function: exporta metadados do acervo em CSV (server-side)
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { localidade, localidade_id, filters = {}, search = '', limit = 5000 } = await req.json()

    if (!localidade && !localidade_id) {
      return new Response(
        JSON.stringify({ error: 'Localidade obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const params = new URLSearchParams()
    params.set('select', 'id,titulo,descricao,arquivo_url,arquivo_tipo,arquivo_nome,arquivo_tamanho,thumbnail_url,area_fazenda:area_fazenda_nome,ponto:ponto_nome,tipo_projeto:tipo_projeto_nome,status:status_nome,responsavel,tema_principal:tema_principal_nome,nucleo_pecuaria:nucleo_pecuaria_nome,nucleo_agro:nucleo_agro_nome,frase_memoria,data_captacao,created_at,updated_at')
    if (localidade_id) {
      params.set('area_fazenda_id', `eq.${localidade_id}`)
    } else {
      params.set('area_fazenda', `eq.${localidade}`)
    }

    if (filters.tipo) params.set('tipo_projeto_id', `eq.${filters.tipo}`)
    if (filters.status) params.set('status_id', `eq.${filters.status}`)
    if (filters.ponto) params.set('ponto_id', `eq.${filters.ponto}`)
    if (filters.tema) params.set('tema_principal_id', `eq.${filters.tema}`)

    if (search) {
      const like = `*${search}*`
      params.set('or', `titulo.ilike.${like},ponto_nome.ilike.${like},tema_principal_nome.ilike.${like}`)
    }

    const safeLimit = Math.max(1, Math.min(Number(limit) || 5000, 20000))
    params.set('limit', String(safeLimit))

    const url = `${supabaseUrl}/rest/v1/v_catalogo_completo?${params.toString()}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: errorText || 'Erro ao consultar dados' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    const header = [
      'id','titulo','descricao','arquivo_url','arquivo_tipo','arquivo_nome','arquivo_tamanho','thumbnail_url',
      'area_fazenda','ponto','tipo_projeto','status','responsavel','tema_principal',
      'nucleo_pecuaria','nucleo_agro','frase_memoria','data_captacao','created_at','updated_at'
    ]

    const escapeCsv = (value: unknown) => {
      const str = value === null || value === undefined ? '' : String(value)
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = data.map((row: Record<string, unknown>) =>
      header.map((key) => escapeCsv(row[key])).join(',')
    )

    const csv = [header.join(','), ...rows].join('\n')

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="acervo_${localidade || localidade_id}.csv"`
      }
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro inesperado' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
