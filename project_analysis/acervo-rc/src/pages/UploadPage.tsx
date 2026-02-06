import { useState, useCallback, useMemo, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { type NamingRule } from '@/lib/taxonomy'
import { useTaxonomy } from '@/hooks/useTaxonomy'
import { useNamingRules } from '@/hooks/useQueries'
import { initUpload, finalizeUpload } from '@/hooks/useUpload'
import { Upload, FileImage, FileVideo, File, Check, X, Loader2, AlertCircle, RotateCcw, Grid, List, CloudUpload, Sparkles, MapPin, Tag, Users, Settings, Camera, Image as ImageIcon, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as tus from 'tus-js-client'
import { generateVideoThumbnail } from '@/utils/videoThumbnail'

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024
const TUS_THRESHOLD = 50 * 1024 * 1024
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

interface UploadedFile {
  file: File
  progress: number
  objectPath?: string
  jobId?: string
  url?: string
  error?: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  retries: number
  previewUrl?: string
  thumbnailPath?: string
  thumbnailUrl?: string
}

const MAX_RETRIES = 3

async function uploadLargeFile(file: File, objectPath: string, accessToken: string, onProgress: (progress: number) => void): Promise<string> {
  try {
    return await new Promise((resolve, reject) => {
      const headers: Record<string, string> = {
        authorization: `Bearer ${accessToken}`,
        'x-upsert': 'false'
      }
      if (SUPABASE_ANON_KEY) headers.apikey = SUPABASE_ANON_KEY

      const upload = new tus.Upload(file, {
        endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000],
        headers,
        uploadDataDuringCreation: false,
        removeFingerprintOnSuccess: true,
        metadata: { bucketName: 'acervo-files', objectName: objectPath, contentType: file.type, cacheControl: '3600' },
        chunkSize: 5 * 1024 * 1024,
        onError: (error) => { console.error('TUS Error:', error); reject(error) },
        onProgress: (bytesUploaded, bytesTotal) => { onProgress(Math.round((bytesUploaded / bytesTotal) * 100)) },
        onSuccess: () => resolve(objectPath),
      })
      upload.start()
    })
  } catch (tusError) {
    console.warn('TUS falhou, tentando upload padrao...', tusError)
    onProgress(10)
    const { error } = await supabase.storage.from('acervo-files').upload(objectPath, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    onProgress(100)
    return objectPath
  }
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(2)} KB`
}

const tabs = [
  { id: 'identificacao', label: 'Identificacao', icon: Tag },
  { id: 'localizacao', label: 'Localizacao', icon: MapPin },
  { id: 'nucleos', label: 'Nucleos', icon: Settings },
  { id: 'temas', label: 'Temas e Status', icon: Users },
]

const steps = [
  { id: 'upload', label: 'Upload fisico', description: 'Envie imagens, videos e PDFs' },
  { id: 'catalogacao', label: 'Catalogacao', description: 'Preencha metadados e taxonomias' },
  { id: 'revisao', label: 'Revisao', description: 'Confirme e salve no acervo' },
]

export function UploadPage() {
  const navigate = useNavigate()
  const { taxonomy, loading: taxonomyLoading } = useTaxonomy()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('identificacao')
  const [isMobile, setIsMobile] = useState(false)
  const [namingRule, setNamingRule] = useState<NamingRule | null>(null)
  const { data: namingRules = [] } = useNamingRules()
  const [form, setForm] = useState({
    titulo: '', descricao: '',
    area_fazenda_id: '', ponto_id: '', tipo_projeto_id: '', status_id: '', tema_principal_id: '',
    evento_id: '', funcao_historica_id: '', capitulo_id: '',
    nucleo_pecuaria_id: '', nucleo_agro_id: '', operacao_id: '', marca_id: '',
    frase_memoria: '', responsavel: '', observacoes: '',
    data_captacao: '',
  })

  // Detectar dispositivo mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsMobile(isMobileDevice || (isTouchDevice && window.innerWidth < 768))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const defaultRule = namingRules.find(r => r.is_default) || namingRules[0] || null
    setNamingRule(defaultRule)
  }, [namingRules])

  useEffect(() => {
    if (!form.status_id && taxonomy.statusOptions.length > 0) {
      const defaultStatus = taxonomy.statusOptions.find(s => s.name === 'Entrada (Bruto)') || taxonomy.statusOptions[0]
      if (defaultStatus) {
        setForm(prev => ({ ...prev, status_id: defaultStatus.id }))
      }
    }
  }, [taxonomy.statusOptions, form.status_id])

  const hasUploadedFiles = files.some(f => f.status === 'completed')
  const isUploading = files.some(f => f.status === 'uploading')
  const completedCount = files.filter(f => f.status === 'completed').length
  const failedCount = files.filter(f => f.status === 'error').length
  const hasPendingUploads = files.some(f => f.status === 'pending' || f.status === 'uploading')

  useEffect(() => {
    if (!hasPendingUploads) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasPendingUploads])

  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.file.size, 0), [files])
  const uploadedSize = useMemo(() => files.reduce((acc, f) => acc + (f.status === 'completed' ? f.file.size : (f.file.size * f.progress / 100)), 0), [files])
  const overallProgress = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0
  const canSave = form.titulo && hasUploadedFiles && !isUploading
  const stepStatus = useMemo(() => {
    const uploadStatus = hasUploadedFiles ? 'done' : (files.length > 0 || isUploading ? 'active' : 'pending')
    const catalogStatus = form.titulo ? (canSave ? 'done' : 'active') : 'pending'
    const reviewStatus = success ? 'done' : (canSave ? 'active' : 'pending')
    return { upload: uploadStatus, catalogacao: catalogStatus, revisao: reviewStatus }
  }, [hasUploadedFiles, files.length, isUploading, form.titulo, canSave, success])

  const uploadFile = useCallback(async (file: File, index: number) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) {
      const message = 'Sessão expirada. Faça login novamente para enviar arquivos.'
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' as const, error: message } : f))
      setError(message)
      throw new Error(message)
    }

    const areaName = taxonomy.areasOptions.find(o => o.id === form.area_fazenda_id)?.name || 'sem-area'
    let initData: { job_id: string; object_path: string }
    try {
      initData = await initUpload({
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        area: areaName
      })
    } catch (err: any) {
      const code = err?.context?.json?.error?.code || err?.context?.error?.code
        const message = code === 'TOO_MANY_UPLOADS'
          ? 'Muitos uploads simultâneos. Aguarde alguns arquivos concluírem e tente novamente.'
          : code === 'TOO_MANY_REQUESTS'
          ? 'Muitos uploads em pouco tempo. Aguarde alguns minutos e tente novamente.'
          : code === 'FILE_TOO_LARGE'
          ? 'Arquivo excede o limite permitido.'
          : code === 'JOB_RATE_CHECK_FAILED'
          ? 'Não foi possível validar o limite de uploads. Tente novamente.'
          : err?.message || 'Falha ao iniciar upload. Verifique as credenciais do Supabase.'
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' as const, error: message } : f))
      setError(message)
      throw err
    }
    const objectPath = initData.object_path
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading' as const, progress: 0 } : f))
    try {
      await supabase.from('upload_jobs').update({ status: 'UPLOADING' }).eq('id', initData.job_id)
    } catch (err) {
      console.warn('Nao foi possivel marcar upload como UPLOADING:', err)
    }
    try {
      if (file.size > TUS_THRESHOLD) {
        await uploadLargeFile(file, objectPath, accessToken, (progress) => { setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f)) })
      } else {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 30 } : f))
        const { error } = await supabase.storage.from('acervo-files').upload(objectPath, file, { cacheControl: '3600', upsert: false })
        if (error) throw error
      }
      const { data: { publicUrl } } = supabase.storage.from('acervo-files').getPublicUrl(objectPath)
      
      // Gerar e fazer upload do thumbnail para vídeos
      let thumbnailPath: string | undefined
      let thumbnailUrl: string | undefined
      if (file.type.startsWith('video')) {
        try {
          const thumbnailBlob = await generateVideoThumbnail(file)
          if (thumbnailBlob) {
            thumbnailPath = `thumbnails/${objectPath.replace(/\.[^.]+$/, '.jpg')}`
            const { error: thumbError } = await supabase.storage.from('acervo-files').upload(thumbnailPath, thumbnailBlob, {
              contentType: 'image/jpeg',
              cacheControl: '3600',
              upsert: false
            })
            if (!thumbError) {
              const { data: thumbData } = supabase.storage.from('acervo-files').getPublicUrl(thumbnailPath)
              thumbnailUrl = thumbData.publicUrl
            }
          }
        } catch (thumbErr) {
          console.warn('Erro ao gerar thumbnail:', thumbErr)
        }
      }
      
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 100, status: 'completed' as const, url: publicUrl, objectPath, jobId: initData.job_id, thumbnailPath, thumbnailUrl } : f))
      try {
        await supabase.from('upload_jobs').update({ status: 'UPLOADED' }).eq('id', initData.job_id)
      } catch (err) {
        console.warn('Nao foi possivel marcar upload como UPLOADED:', err)
      }
      return objectPath
    } catch (err: any) {
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' as const, error: err.message } : f))
      throw err
    }
  }, [form.area_fazenda_id, taxonomy.areasOptions])

  const retryUpload = useCallback(async (index: number) => {
    const fileData = files[index]
    if (!fileData || fileData.retries >= MAX_RETRIES) return
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'pending' as const, error: undefined, retries: f.retries + 1, progress: 0 } : f))
    try { await uploadFile(fileData.file, index) } catch (err) { console.error('Retry failed:', err) }
  }, [files, uploadFile])

  const retryAllFailed = useCallback(async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'error') {
        await retryUpload(i)
      }
    }
  }, [files, retryUpload])

  const clearCompleted = useCallback(() => {
    files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }, [files])

  const processFiles = useCallback(async (acceptedFiles: File[]) => {
    const validFiles: File[] = []
    const rejectedFiles: string[] = []
    acceptedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) { rejectedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`) }
      else { validFiles.push(file) }
    })
    if (rejectedFiles.length > 0) { setError(`Arquivos rejeitados (excedem 5GB):\n${rejectedFiles.join(', ')}`) }
    if (validFiles.length === 0) return
    const startIndex = files.length
    const newFiles: UploadedFile[] = validFiles.map(f => ({
      file: f, progress: 0, status: 'pending' as const, retries: 0,
      previewUrl: f.type.startsWith('image') ? URL.createObjectURL(f) : undefined
    }))
    setFiles(prev => [...prev, ...newFiles])
    for (let i = 0; i < validFiles.length; i++) {
      try { await uploadFile(validFiles[i], startIndex + i) } catch (err) { console.error('Upload error:', err) }
    }
  }, [files.length, uploadFile])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await processFiles(acceptedFiles)
  }, [processFiles])

  // Handler para inputs mobile
  const handleMobileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files
    if (!inputFiles || inputFiles.length === 0) return
    await processFiles(Array.from(inputFiles))
    e.target.value = '' // Reset input para permitir selecionar o mesmo arquivo novamente
  }, [processFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'], 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'], 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const removeFile = async (index: number) => {
    const file = files[index]
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
    if (file.objectPath) {
      await supabase.storage.from('acervo-files').remove([file.objectPath])
      if (file.thumbnailPath) await supabase.storage.from('acervo-files').remove([file.thumbnailPath])
    }
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return <FileImage className="w-6 h-6 text-emerald-200" />
    if (type.startsWith('video')) return <FileVideo className="w-6 h-6 text-amber-200" />
    return <File className="w-6 h-6 text-rc-text-muted" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.titulo) { setError('Titulo e obrigatorio'); return }
    if (!hasUploadedFiles) { setError('Faca upload de pelo menos um arquivo antes de salvar'); return }
    setSaving(true)
    const uploadedFiles = files.filter(f => f.status === 'completed' && f.jobId)
    setSaveProgress({ current: 0, total: uploadedFiles.length })
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        setSaveProgress({ current: i + 1, total: uploadedFiles.length })
        const uf = uploadedFiles[i]
        try {
          await finalizeUpload(uf.jobId!, {
            titulo: uploadedFiles.length > 1 ? `${form.titulo} (${i + 1})` : form.titulo,
            descricao: form.descricao || null,
            area_fazenda_id: form.area_fazenda_id || null,
            ponto_id: form.ponto_id || null,
            tipo_projeto_id: form.tipo_projeto_id || null,
            nucleo_pecuaria_id: form.nucleo_pecuaria_id || null,
            nucleo_agro_id: form.nucleo_agro_id || null,
            operacao_id: form.operacao_id || null,
            marca_id: form.marca_id || null,
            evento_id: form.evento_id || null,
            funcao_historica_id: form.funcao_historica_id || null,
            tema_principal_id: form.tema_principal_id || null,
            status_id: form.status_id || null,
            capitulo_id: form.capitulo_id || null,
            frase_memoria: form.frase_memoria || null,
            responsavel: form.responsavel || null,
            observacoes: form.observacoes || null,
            data_captacao: form.data_captacao || null,
            thumbnail_url: uf.thumbnailUrl || null,
          })
        } catch (finalizeError) {
          if (uf.thumbnailPath) {
            await supabase.storage.from('acervo-files').remove([uf.thumbnailPath])
          }
          throw finalizeError
        }
      }
      setSuccess(true)
      setTimeout(() => navigate('/acervo'), 1500)
    } catch (err: any) { setError(err.message || 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  // Selects dependentes

  const renderSelect = (key: string, label: string, options: string[], disabled = false) => (
    <div>
      <label className="block text-sm font-semibold text-rc-text-muted mb-2">{label}</label>
      <select
        value={form[key as keyof typeof form]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        disabled={disabled}
        className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 focus:border-rc-gold min-h-[48px] bg-neutral-900/50 text-rc-text transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Selecione...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )

  const renderSelectById = (
    idKey: string,
    label: string,
    options: Array<{ id: string; name: string }>,
    disabled = false
  ) => (
    <div>
      <label className="block text-sm font-semibold text-rc-text-muted mb-2">{label}</label>
      <select
        value={(form as any)[idKey]}
        onChange={(e) => setForm({ ...form, [idKey]: e.target.value })}
        disabled={disabled}
        className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 focus:border-rc-gold min-h-[48px] bg-neutral-900/50 text-rc-text transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Selecione...</option>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
      </select>
    </div>
  )

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200">
          Variáveis de ambiente do Supabase não configuradas.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in text-rc-text">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">Upload e Catalogacao</h1>
        <p className="text-rc-text-muted mt-1">
          {isMobile ? 'Toque para adicionar fotos e videos' : 'Importe imagens e videos (max 5GB por arquivo)'}
        </p>
      </div>

      <div className="mb-6 glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((step, index) => {
            const status = stepStatus[step.id as keyof typeof stepStatus]
            const isDone = status === 'done'
            const isActive = status === 'active'
            return (
              <div key={step.id} className={`relative p-4 rounded-xl border ${isDone ? 'border-amber-400/60 bg-amber-500/5' : isActive ? 'border-rc-gold/40 bg-white/5' : 'border-rc-border/60 bg-white/0'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-amber-400 text-neutral-900' : isActive ? 'bg-rc-gold/80 text-neutral-900' : 'bg-white/10 text-rc-text-muted'}`}>
                    {isDone ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rc-text">{step.label}</p>
                    <p className="text-xs text-rc-text-muted">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload Area - Mobile ou Desktop */}
      {isMobile ? (
        // Interface Mobile-First para iOS/Android
        <div className="glass-card p-5">
          {/* Contador de arquivos selecionados */}
          {files.length > 0 && (
            <div className="mb-4 p-4 bg-amber-500/10 rounded-xl border border-amber-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                    <span className="text-neutral-900 font-bold">{files.length}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-rc-text">
                      {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-rc-text-muted">{formatFileSize(totalSize)} total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rc-text">{completedCount}/{files.length}</p>
                  <p className="text-xs text-rc-text-muted">enviados</p>
                </div>
              </div>
              {isUploading && (
                <div className="mt-3">
                  <div className="h-2 bg-neutral-900/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-300" style={{ width: `${overallProgress}%` }} />
                  </div>
                  <p className="text-xs text-rc-text-muted mt-1 text-center">Enviando... {overallProgress}%</p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-rc-text-muted mb-4 font-medium">Escolha como adicionar arquivos:</p>
          
          <div className="flex flex-col gap-4">
            {/* Tirar Foto */}
            <label className="flex flex-col items-center justify-center gap-1 h-16 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-xl cursor-pointer active:scale-[0.98] transition-transform font-semibold">
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6" />
                <span>Tirar Foto</span>
              </div>
              <span className="text-xs opacity-80">Uma foto por vez</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleMobileInput} 
              />
            </label>
            
            {/* Escolher da Galeria - DESTAQUE */}
            <label className="flex flex-col items-center justify-center gap-1 h-20 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl cursor-pointer active:scale-[0.98] transition-transform font-semibold border border-emerald-200/40">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                <span>Escolher da Galeria</span>
              </div>
              <span className="text-xs opacity-90 bg-white/20 px-3 py-0.5 rounded-full">Toque para selecionar VARIAS fotos</span>
              <input 
                type="file" 
                accept="image/*,video/*,application/pdf" 
                multiple 
                className="hidden" 
                onChange={handleMobileInput} 
              />
            </label>
            
            {/* Gravar Video */}
            <label className="flex flex-col items-center justify-center gap-1 h-16 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl cursor-pointer active:scale-[0.98] transition-transform font-semibold">
              <div className="flex items-center gap-2">
                <Video className="w-6 h-6" />
                <span>Gravar Video</span>
              </div>
              <span className="text-xs opacity-80">Um video por vez</span>
              <input 
                type="file" 
                accept="video/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleMobileInput} 
              />
            </label>
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-400/30">
            <p className="text-xs text-amber-200 text-center">
              <strong>Dica iOS:</strong> Na galeria, toque em "Selecionar" e escolha multiplas fotos antes de confirmar
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-200 rounded text-xs font-medium">Imagens</span>
            <span className="px-2 py-1 bg-slate-500/20 text-slate-200 rounded text-xs font-medium">Videos</span>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-200 rounded text-xs font-medium">PDFs</span>
          </div>
        </div>
      ) : (
        // Interface Desktop - Dropzone
        <div {...getRootProps()} className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-amber-400/80 bg-white/5 scale-[1.02]' : 'border-rc-border bg-white/0 hover:border-amber-400/60'}`}>
          <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? 'bg-gradient-to-br from-amber-400 to-amber-300 scale-110' : 'bg-gradient-to-br from-neutral-900/60 to-neutral-800/60'}`}>
            <CloudUpload className={`w-8 h-8 ${isDragActive ? 'text-neutral-900' : 'text-rc-text-muted'}`} />
          </div>
          <p className="text-lg font-semibold text-rc-text">Arraste arquivos aqui</p>
          <p className="text-sm text-rc-text-muted mt-1">ou clique para selecionar</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-200 rounded text-xs font-medium">Imagens</span>
            <span className="px-2 py-1 bg-slate-500/20 text-slate-200 rounded text-xs font-medium">Videos</span>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-200 rounded text-xs font-medium">PDFs</span>
          </div>
        </div>
      )}

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="mt-5 glass-card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <span className="font-semibold text-rc-text">{files.length} arquivo{files.length > 1 ? 's' : ''}</span>
                <p className="text-xs text-rc-text-muted">{formatFileSize(totalSize)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {failedCount > 0 && (
                <button
                  onClick={retryAllFailed}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-200 text-xs font-semibold hover:bg-amber-500/20"
                >
                  Reenviar falhas ({failedCount})
                </button>
              )}
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-200 text-xs font-semibold hover:bg-emerald-500/20"
                >
                  Limpar enviados ({completedCount})
                </button>
              )}
              <div className="flex gap-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-500/10 text-amber-200' : 'text-rc-text-muted'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-500/10 text-amber-200' : 'text-rc-text-muted'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          
          {/* Progress bar geral - mais visivel em mobile */}
          {isUploading && (
            <div className="mb-4 p-4 bg-amber-500/10 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-rc-text">Enviando {completedCount + 1} de {files.length}...</span>
                <span className="text-sm font-bold text-amber-200">{overallProgress}%</span>
              </div>
              <div className="h-3 bg-neutral-900/60 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-300" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          )}
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative group bg-neutral-900/50 rounded-xl overflow-hidden aspect-square">
                  {f.previewUrl ? <img src={f.previewUrl} alt={f.file.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{getFileIcon(f.file.type)}</div>}
                  {f.status === 'uploading' && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /><span className="text-white text-sm font-bold mt-2">{f.progress}%</span></div>}
                  {f.status === 'completed' && <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg"><Check className="w-4 h-4 text-white" /></div>}
                  {f.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/85 flex flex-col items-center justify-center px-2 text-center">
                      <AlertCircle className="w-7 h-7 text-white mb-1" />
                      <span className="text-white text-xs font-semibold">Falha no upload</span>
                      {f.error && <span className="text-white/90 text-[10px] mt-1 line-clamp-2">{f.error}</span>}
                    </div>
                  )}
                  <button onClick={() => removeFile(i)} className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity min-w-[32px] min-h-[32px] flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{f.file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-xl">
                  {f.previewUrl ? <img src={f.previewUrl} alt={f.file.name} className="w-14 h-14 object-cover rounded-lg" /> : <div className="w-14 h-14 flex items-center justify-center bg-neutral-900/60 rounded-lg">{getFileIcon(f.file.type)}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-rc-text truncate text-sm">{f.file.name}</p>
                    <p className="text-xs text-rc-text-muted">{formatFileSize(f.file.size)}</p>
                    {f.status === 'uploading' && <div className="mt-1.5 h-2 bg-neutral-900/60 rounded-full overflow-hidden"><div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${f.progress}%` }} /></div>}
                    {f.status === 'error' && f.error && (
                      <p className="text-xs text-red-300 mt-1 line-clamp-2">{f.error}</p>
                    )}
                  </div>
                  {f.status === 'completed' && <Check className="w-6 h-6 text-emerald-300" />}
                  {f.status === 'uploading' && <Loader2 className="w-6 h-6 text-amber-200 animate-spin" />}
                  {f.status === 'error' && f.retries < MAX_RETRIES && <button onClick={() => retryUpload(i)} className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-200 min-w-[40px] min-h-[40px]"><RotateCcw className="w-5 h-5" /></button>}
                  <button onClick={() => removeFile(i)} className="p-2 hover:bg-white/10 rounded-lg min-w-[40px] min-h-[40px]"><X className="w-5 h-5 text-rc-text-muted" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulario com Abas */}
      <form onSubmit={handleSubmit} className="mt-6 glass-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-white/5 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all min-w-[80px] ${activeTab === tab.id ? 'text-amber-200 bg-white/5 border-b-2 border-amber-400' : 'text-rc-text-muted hover:text-rc-text hover:bg-white/5'}`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 lg:p-6">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm">{completedCount} itens salvos com sucesso!</div>}
          {failedCount > 0 && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
              Existem {failedCount} arquivo{failedCount > 1 ? 's' : ''} com falha. Use “Reenviar falhas” antes de salvar.
            </div>
          )}
          {saving && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-emerald-200">Salvando {saveProgress.current} de {saveProgress.total}...</span>
                <span className="text-sm font-bold text-emerald-200">{Math.round((saveProgress.current / saveProgress.total) * 100)}%</span>
              </div>
              <div className="h-2 bg-neutral-900/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all" style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Tab: Identificacao */}
          {activeTab === 'identificacao' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-rc-text-muted mb-2">Titulo *</label>
                <input type="text" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 min-h-[48px] bg-neutral-900/50 text-rc-text" placeholder="Nome do material" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-rc-text-muted mb-2">Descricao</label>
                <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text" rows={2} placeholder="Descricao do material" />
              </div>
              {renderSelectById('tipo_projeto_id', 'Tipo de Projeto', taxonomy.tiposProjetoOptions)}
              <div>
                <label className="block text-sm font-semibold text-rc-text-muted mb-2">Data de Captacao</label>
                <input type="date" value={form.data_captacao} onChange={(e) => setForm({ ...form, data_captacao: e.target.value })}
                  className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 min-h-[48px] bg-neutral-900/50 text-rc-text" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-rc-text-muted mb-2">Frase-memoria (1 linha)</label>
                <input type="text" value={form.frase_memoria} onChange={(e) => setForm({ ...form, frase_memoria: e.target.value })}
                  className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 min-h-[48px] bg-neutral-900/50 text-rc-text" placeholder="Uma frase que resume este material" />
              </div>
              {renderSelect('responsavel', 'Responsavel', taxonomy.responsaveis)}
              {renderSelectById('capitulo_id', 'Estações do Ano', taxonomy.capitulosOptions)}
            </div>
          )}

          {/* Tab: Localizacao */}
          {activeTab === 'localizacao' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {renderSelectById('area_fazenda_id', 'Area / Fazenda', taxonomy.areasOptions)}
              {renderSelectById('ponto_id', 'Local (Onde acontece)', taxonomy.pontosOptions)}
              {renderSelectById('evento_id', 'Atividade Principal', taxonomy.eventosOptions)}
              {renderSelectById('funcao_historica_id', 'Atividade Complementar', taxonomy.funcoesHistoricasOptions)}
            </div>
          )}

          {/* Tab: Nucleos */}
          {activeTab === 'nucleos' && (
            <div className="space-y-6">
              <div className="p-4 bg-neutral-900/40 rounded-xl">
                <h3 className="font-semibold text-rc-text mb-3">Nucleo da Pecuaria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderSelectById('nucleo_pecuaria_id', 'Nucleo Principal', taxonomy.nucleosPecuariaOptions)}
                </div>
              </div>
              <div className="p-4 bg-neutral-900/40 rounded-xl">
                <h3 className="font-semibold text-rc-text mb-3">Nucleo do Agro (Terra e Agua)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderSelectById('nucleo_agro_id', 'Nucleo Principal', taxonomy.nucleosAgroOptions)}
                </div>
              </div>
              <div className="p-4 bg-neutral-900/40 rounded-xl">
                <h3 className="font-semibold text-rc-text mb-3">Nucleo de Operacoes Internas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderSelectById('operacao_id', 'Nucleo Principal', taxonomy.nucleosOperacoesOptions)}
                </div>
              </div>
              <div className="p-4 bg-neutral-900/40 rounded-xl">
                <h3 className="font-semibold text-rc-text mb-3">Nucleo de Marca e Valorizacao</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderSelectById('marca_id', 'Nucleo Principal', taxonomy.nucleosMarcaOptions)}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Temas e Status */}
          {activeTab === 'temas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {renderSelectById('tema_principal_id', 'Tema Principal', taxonomy.temasPrincipaisOptions)}
              {renderSelectById('status_id', 'Status do Material', taxonomy.statusOptions)}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-rc-text-muted mb-2">Observacoes</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full px-4 py-3 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text" rows={3} placeholder="Observacoes adicionais sobre o material" />
              </div>
            </div>
          )}

          {/* Botoes - Maiores em mobile */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3">
            <button type="button" onClick={() => navigate('/acervo')} className="px-6 py-3.5 border border-rc-border rounded-xl text-rc-text hover:bg-white/5 font-semibold min-h-[52px]">Cancelar</button>
            <button type="submit" disabled={saving || !canSave}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-xl hover:shadow-green disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all min-h-[52px]">
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              {isUploading ? 'Aguardando uploads...' : !hasUploadedFiles ? 'Faca upload primeiro' : `Salvar ${completedCount} arquivo${completedCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
