import { supabase } from '@/lib/supabase'

export type InitUploadPayload = {
  original_filename: string
  mime_type?: string | null
  size_bytes: number
  area?: string
}

export type InitUploadResponse = {
  job_id: string
  bucket: string
  object_path: string
}

const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  if (!accessToken) {
    throw new Error('Sessão expirada. Faça login novamente para enviar arquivos.')
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    ...(anonKey ? { apikey: anonKey } : {})
  }
}

export async function initUpload(payload: InitUploadPayload): Promise<InitUploadResponse> {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('init-upload', {
    body: payload,
    headers
  })
  if (error) throw error
  return data as InitUploadResponse
}

export async function finalizeUpload(jobId: string, catalogoData: Record<string, unknown>) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('finalize-upload', {
    body: { job_id: jobId, catalogo_data: catalogoData },
    headers
  })
  if (error) throw error
  return data
}
