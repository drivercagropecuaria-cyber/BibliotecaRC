import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { TAXONOMY_TYPES, invalidateCache, type TaxonomyItem, type NamingRule } from '@/lib/taxonomy'
import { queryKeys } from '@/hooks/useQueries'
import { Plus, Trash2, Edit2, Save, X, GripVertical, Eye, EyeOff, Settings, Tag, FileText, ChevronRight, ChevronDown, Loader2, Check, AlertCircle, Video, Image as ImageIcon, Wrench, History, RefreshCcw, ListChecks, Activity } from 'lucide-react'
import { generateVideoThumbnail } from '@/utils/videoThumbnail'

export function AdminPage() {
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<'taxonomy' | 'naming' | 'tools'>('taxonomy')
  const [selectedType, setSelectedType] = useState(TAXONOMY_TYPES[0].key)
  const [taxonomy, setTaxonomy] = useState<TaxonomyItem[]>([])
  const [namingRules, setNamingRules] = useState<NamingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [previewData, setPreviewData] = useState({
    area_fazenda: 'Vila Canabrava',
    ponto: 'Curral',
    tipo_projeto: 'Documentario',
    titulo: 'Manejo',
    data_captacao: '2024-06-15',
    extensao: 'mp4'
  })

  // Carregar dados
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [taxRes, rulesRes] = await Promise.all([
        supabase.from('taxonomy_categories').select('*').order('display_order'),
        supabase.from('naming_rules').select('*').order('is_default', { ascending: false })
      ])
      
      if (taxRes.error) throw taxRes.error
      if (rulesRes.error) throw rulesRes.error
      
      setTaxonomy(taxRes.data || [])
      setNamingRules(rulesRes.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const invalidateTaxonomyQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy })
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  // Obter itens do tipo selecionado
  const currentTypeConfig = TAXONOMY_TYPES.find(t => t.key === selectedType)
  const currentItems = taxonomy.filter(t => t.type === selectedType && !t.parent_id)
    .sort((a, b) => a.display_order - b.display_order)

  // Obter subitens de um item
  const getSubItems = (parentId: string) => {
    if (!currentTypeConfig?.hasChildren) return []
    return taxonomy.filter(t => t.type === selectedType && t.parent_id === parentId)
      .sort((a, b) => a.display_order - b.display_order)
  }

  // Adicionar item
  const addItem = async (parentId?: string) => {
    if (!newItemName.trim()) return
    setSaving(true)
    setError(null)
    
    try {
      const type = selectedType
      const parentKey = currentTypeConfig?.hasChildren ? (parentId || null) : null
      const maxOrder = taxonomy.filter(t => t.type === type && t.parent_id === parentKey)
        .reduce((max, t) => Math.max(max, t.display_order), -1)
      
      const { error } = await supabase.from('taxonomy_categories').insert({
        type,
        name: newItemName.trim(),
        parent_id: parentKey,
        display_order: maxOrder + 1,
        is_active: true
      })
      
      if (error) throw error
      
      setNewItemName('')
      setSuccess('Item adicionado')
      invalidateCache()
      invalidateTaxonomyQueries()
      await loadData()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Atualizar item
  const updateItem = async (id: string, updates: Partial<TaxonomyItem>) => {
    setSaving(true)
    try {
      const { error } = await supabase.from('taxonomy_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      
      setEditingId(null)
      setSuccess('Item atualizado')
      invalidateCache()
      invalidateTaxonomyQueries()
      await loadData()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Deletar item
  const deleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return
    setSaving(true)
    try {
      // Deletar subitens primeiro
      const { error: subError } = await supabase.from('taxonomy_categories')
        .delete().eq('parent_id', id)
      if (subError) throw subError
      
      const { error } = await supabase.from('taxonomy_categories')
        .delete().eq('id', id)
      if (error) throw error
      
      setSuccess('Item excluido')
      invalidateCache()
      invalidateTaxonomyQueries()
      await loadData()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Toggle ativo/inativo
  const toggleActive = async (item: TaxonomyItem) => {
    await updateItem(item.id, { is_active: !item.is_active })
  }

  // Expandir/colapsar item com subitens
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // Salvar regra de nomenclatura
  const saveNamingRule = async (rule: NamingRule) => {
    setSaving(true)
    try {
      const { error } = await supabase.from('naming_rules')
        .update({ pattern: rule.pattern, updated_at: new Date().toISOString() })
        .eq('id', rule.id)
      
      if (error) throw error
      
      setSuccess('Regra salva')
      invalidateCache()
      invalidateTaxonomyQueries()
      await loadData()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Preview da nomenclatura
  const generatePreview = (pattern: string) => {
    let result = pattern
    const replacements: Record<string, string> = {
      '{area}': previewData.area_fazenda.replace(/[^a-zA-Z0-9]/g, ''),
      '{ponto}': previewData.ponto.replace(/[^a-zA-Z0-9]/g, ''),
      '{tipo}': previewData.tipo_projeto.replace(/[^a-zA-Z0-9]/g, ''),
      '{titulo}': previewData.titulo.replace(/[^a-zA-Z0-9]/g, ''),
      '{data}': previewData.data_captacao.replace(/-/g, ''),
      '{seq}': '001',
      '{ext}': previewData.extensao,
    }
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value)
    }
    return result.replace(/_+/g, '_').replace(/\/_/g, '/').replace(/_\./g, '.')
  }

  // Render item da taxonomia
  const renderItem = (item: TaxonomyItem, isSubItem = false) => {
    const hasChildren = currentTypeConfig?.hasChildren && !isSubItem
    const subItems = hasChildren ? getSubItems(item.id) : []
    const isExpanded = expandedItems.has(item.id)
    const isEditing = editingId === item.id

    return (
      <div key={item.id} className={`${isSubItem ? 'ml-8' : ''}`}>
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-2 transition-all ${
          item.is_active ? 'bg-white border border-neutral-200' : 'bg-neutral-100 border border-neutral-200 opacity-60'
        }`}>
          <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
          
          {hasChildren && (
            <button onClick={() => toggleExpand(item.id)} className="p-1 hover:bg-neutral-100 rounded">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          ) : (
            <span className={`flex-1 font-medium ${item.is_active ? 'text-neutral-800' : 'text-neutral-500 line-through'}`}>
              {item.name}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={() => { updateItem(item.id, { name: editingName }); setEditingId(null) }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleActive(item)}
                  className={`p-2 rounded-lg ${item.is_active ? 'text-green-600 hover:bg-green-50' : 'text-neutral-400 hover:bg-neutral-100'}`}
                  title={item.is_active ? 'Desativar' : 'Ativar'}
                >
                  {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditingId(item.id); setEditingName(item.name) }}
                  className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Subitens */}
        {hasChildren && isExpanded && (
          <div className="ml-4 pl-4 border-l-2 border-neutral-200">
            {subItems.map(sub => renderItem(sub, true))}
            
            {/* Adicionar subitem */}
            <SubItemInput parentId={item.id} onAdd={async (name) => {
              setNewItemName(name)
              await addItem(item.id)
            }} saving={saving} />
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-4xl font-bold text-neutral-900">Configuracoes do Sistema</h1>
        <p className="text-neutral-500 mt-1">Gerencie categorias, taxonomias e regras de nomenclatura</p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('taxonomy')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'taxonomy'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-green'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}
        >
          <Tag className="w-5 h-5" />
          Taxonomias
        </button>
        <button
          onClick={() => setActiveSection('naming')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'naming'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-green'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          Nomenclatura
        </button>
        <button
          onClick={() => setActiveSection('tools')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'tools'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
          }`}
        >
          <Wrench className="w-5 h-5" />
          Ferramentas
        </button>
      </div>

      {/* Conteudo */}
      {activeSection === 'taxonomy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de tipos */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-4 shadow-glass h-fit">
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Categorias
            </h3>
            <div className="space-y-1">
              {TAXONOMY_TYPES.map(type => {
                const count = taxonomy.filter(t => t.type === type.key && !t.parent_id).length
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between ${
                      selectedType === type.key
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="text-sm">{type.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedType === type.key ? 'bg-primary-200' : 'bg-neutral-200'
                    }`}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Editor de itens */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-glass">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-800 text-lg">
                {currentTypeConfig?.label}
                {currentTypeConfig?.hasChildren && (
                  <span className="text-sm font-normal text-neutral-500 ml-2">(com subitens)</span>
                )}
              </h3>
            </div>

            {/* Adicionar novo item */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-50 rounded-xl">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Digite o nome do novo item..."
                className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <button
                onClick={() => addItem()}
                disabled={saving || !newItemName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </button>
            </div>

            {/* Lista de itens */}
            <div className="max-h-[500px] overflow-y-auto pr-2">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum item cadastrado</p>
                  <p className="text-sm">Adicione o primeiro item acima</p>
                </div>
              ) : (
                currentItems.map(item => renderItem(item))
              )}
            </div>
          </div>
        </div>
      ) : activeSection === 'naming' ? (
        /* Editor de Nomenclatura */
        <div className="bg-white rounded-2xl p-6 shadow-glass">
          <h3 className="font-semibold text-neutral-800 text-lg mb-4">Regras de Nomenclatura</h3>
          
          {namingRules.map(rule => (
            <div key={rule.id} className="mb-6 p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-medium text-neutral-800">{rule.name}</span>
                {rule.is_default && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">Padrao</span>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-600 mb-1">Padrao de nomenclatura</label>
                <input
                  type="text"
                  value={rule.pattern}
                  onChange={(e) => setNamingRules(prev => prev.map(r => r.id === rule.id ? { ...r, pattern: e.target.value } : r))}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg font-mono text-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-neutral-500">Variaveis disponiveis:</span>
                {['{area}', '{ponto}', '{tipo}', '{titulo}', '{data}', '{seq}', '{ext}', '{nucleo}', '{responsavel}'].map(v => (
                  <code key={v} className="px-2 py-0.5 bg-neutral-200 rounded text-xs">{v}</code>
                ))}
              </div>
              
              {/* Preview */}
              <div className="p-3 bg-white rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-500 mb-2">Preview:</div>
                <code className="text-sm text-primary-700 break-all">{generatePreview(rule.pattern)}</code>
              </div>
              
              <button
                onClick={() => saveNamingRule(rule)}
                disabled={saving}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Regra
              </button>
            </div>
          ))}
          
          {/* Dados de teste para preview */}
          <div className="mt-6 p-4 bg-accent-50 rounded-xl">
            <h4 className="font-medium text-accent-800 mb-3">Dados de teste para preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(previewData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-accent-600 mb-1">{key}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-accent-200 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeSection === 'tools' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <ThumbnailGenerator />
          <UploadPipelineMonitor />
          <UploadJobsList />
          <FunctionRunsList />
          <AuditTrail />
        </div>
      ) : null}
    </div>
  )
}

// Componente para input de subitem com botão Confirmar
function SubItemInput({ parentId, onAdd, saving }: { parentId: string, onAdd: (name: string) => Promise<void>, saving: boolean }) {
  const [value, setValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!value.trim() || isAdding) return
    setIsAdding(true)
    await onAdd(value.trim())
    setValue('')
    setIsAdding(false)
  }

  return (
    <div className="flex items-center gap-2 p-2 mb-2 bg-neutral-50 rounded-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Novo subitem..."
        className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button
        onClick={handleAdd}
        disabled={!value.trim() || isAdding || saving}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium transition-all"
      >
        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Confirmar
      </button>
    </div>
  )
}

// Componente para gerar thumbnails
function ThumbnailGenerator() {
  const [videos, setVideos] = useState<Array<{id: number, arquivo_url: string, titulo: string, media_id: string | null}>>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 })
  const [log, setLog] = useState<string[]>([])

  const loadVideosWithoutThumbnails = async () => {
    const { data, error } = await supabase
      .from('v_catalogo_completo')
      .select('id, titulo, arquivo_url, media_id, thumbnail_url, arquivo_tipo')
      .like('arquivo_tipo', 'video%')
      .is('thumbnail_url', null)
      .limit(100)
    
    if (!error && data) {
      setVideos(data)
      setLog(prev => [...prev, `Encontrados ${data.length} videos sem thumbnail`])
    }
  }

  useEffect(() => { loadVideosWithoutThumbnails() }, [])

  const generateThumbnails = async () => {
    if (videos.length === 0) return
    setProcessing(true)
    setProgress({ current: 0, total: videos.length, success: 0, failed: 0 })
    setLog([`Iniciando processamento de ${videos.length} videos...`])

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      setProgress(prev => ({ ...prev, current: i + 1 }))
      setLog(prev => [...prev, `[${i+1}/${videos.length}] Processando: ${video.titulo}`])

      try {
        // Baixar video para blob
        const response = await fetch(video.arquivo_url)
        const blob = await response.blob()
        const file = new File([blob], 'video.mp4', { type: blob.type })

        // Gerar thumbnail
        const thumbnailBlob = await generateVideoThumbnail(file)
        if (!thumbnailBlob) {
          throw new Error('Nao foi possivel gerar thumbnail')
        }

        // Upload do thumbnail
        const thumbPath = `thumbnails/item_${video.id}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('acervo-files')
          .upload(thumbPath, thumbnailBlob, { contentType: 'image/jpeg', upsert: true })

        if (uploadError) throw uploadError

        // Atualizar banco
        const { data: urlData } = supabase.storage.from('acervo-files').getPublicUrl(thumbPath)
        if (video.media_id) {
          await supabase.from('media_assets').update({ thumbnail_url: urlData.publicUrl }).eq('id', video.media_id)
        }
        await supabase.from('catalogo_itens').update({ thumbnail_url: urlData.publicUrl }).eq('id', video.id)

        setProgress(prev => ({ ...prev, success: prev.success + 1 }))
        setLog(prev => [...prev, `  ✓ Sucesso!`])
      } catch (err: any) {
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }))
        setLog(prev => [...prev, `  ✗ Erro: ${err.message}`])
      }
    }

    setLog(prev => [...prev, `Concluido! ${progress.success} sucesso, ${progress.failed} falhas`])
    setProcessing(false)
    loadVideosWithoutThumbnails()
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-glass">
      <h3 className="font-semibold text-neutral-800 text-lg mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-purple-500" />
        Gerador de Thumbnails para Videos
      </h3>
      
      <p className="text-neutral-600 mb-4">
        Esta ferramenta gera imagens de preview para videos que foram enviados antes do sistema de thumbnails automaticos.
      </p>

      <div className="p-4 bg-purple-50 rounded-xl mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-purple-700">{videos.length}</span>
            <span className="text-purple-600 ml-2">videos sem thumbnail</span>
          </div>
          <button
            onClick={generateThumbnails}
            disabled={processing || videos.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            {processing ? 'Processando...' : 'Gerar Thumbnails'}
          </button>
        </div>
      </div>

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Progresso: {progress.current}/{progress.total}</span>
            <span className="text-green-600">✓ {progress.success}</span>
            <span className="text-red-600">✗ {progress.failed}</span>
          </div>
          <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="p-4 bg-neutral-900 rounded-xl max-h-64 overflow-y-auto">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {log.join('\n')}
          </pre>
        </div>
      )}
    </div>
  )
}

type PipelineStats = {
  total_jobs: number
  pending: number
  uploading: number
  uploaded: number
  committed: number
  failed: number
  expired: number
  outbox_pending: number
}

function UploadPipelineMonitor() {
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

  const getAuthHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token

    if (!accessToken) {
      throw new Error('Sessão expirada. Faça login novamente para executar ações de manutenção.')
    }

    return {
      Authorization: `Bearer ${accessToken}`,
      ...(anonKey ? { apikey: anonKey } : {})
    }
  }, [anonKey])

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_upload_pipeline_stats')
      if (error) throw error
      setStats((data?.[0] || null) as PipelineStats | null)
    } catch (err) {
      console.warn('Erro ao carregar pipeline:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
    const timer = setInterval(loadStats, 30000)
    return () => clearInterval(timer)
  }, [loadStats])

  const runMaintenance = async (fnName: 'process-outbox' | 'reconcile-uploads') => {
    setActionLoading(true)
    setActionMessage(null)
    try {
      const headers = await getAuthHeaders()
      const { data, error } = await supabase.functions.invoke(fnName, {
        headers
      })
      if (error) throw error
      setActionMessage(`${fnName} executado com sucesso.`)
      if (data) {
        console.info(`${fnName} result:`, data)
      }
      await loadStats()
    } catch (err: any) {
      setActionMessage(err?.message || `Falha ao executar ${fnName}.`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-800 text-lg">Monitor do Pipeline</h3>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700"
          disabled={loading}
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => runMaintenance('process-outbox')}
          disabled={actionLoading}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 disabled:opacity-50"
        >
          Rodar process-outbox
        </button>
        <button
          onClick={() => runMaintenance('reconcile-uploads')}
          disabled={actionLoading}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
        >
          Rodar reconcile-uploads
        </button>
      </div>

      {actionMessage && (
        <div className="mb-3 text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
          {actionMessage}
        </div>
      )}

      {!stats ? (
        <div className="text-sm text-neutral-500">Sem dados</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-neutral-50 rounded-xl">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-lg font-bold text-neutral-900">{stats.total_jobs}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="text-xs text-amber-700">Pendentes</p>
            <p className="text-lg font-bold text-amber-800">{stats.pending}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700">Enviando</p>
            <p className="text-lg font-bold text-blue-800">{stats.uploading}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <p className="text-xs text-purple-700">Enviados</p>
            <p className="text-lg font-bold text-purple-800">{stats.uploaded}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-700">Commitados</p>
            <p className="text-lg font-bold text-emerald-800">{stats.committed}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <p className="text-xs text-red-700">Falhas</p>
            <p className="text-lg font-bold text-red-800">{stats.failed}</p>
          </div>
          <div className="p-3 bg-neutral-100 rounded-xl">
            <p className="text-xs text-neutral-600">Expirados</p>
            <p className="text-lg font-bold text-neutral-800">{stats.expired}</p>
          </div>
          <div className="p-3 bg-accent-50 rounded-xl">
            <p className="text-xs text-accent-700">Outbox</p>
            <p className="text-lg font-bold text-accent-800">{stats.outbox_pending}</p>
          </div>
        </div>
      )}
    </div>
  )
}

type UploadJobRow = {
  id: string
  status: string
  original_filename: string
  object_path: string
  size_bytes: number | null
  created_at: string
}

function UploadJobsList() {
  const [jobs, setJobs] = useState<UploadJobRow[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'COMMITTED' | 'FAILED' | 'EXPIRED'>('ALL')

  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return '-'
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('upload_jobs')
        .select('id,status,original_filename,object_path,size_bytes,created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      if (status !== 'ALL') query = query.eq('status', status)

      const { data, error } = await query
      if (error) throw error
      setJobs((data || []) as UploadJobRow[])
    } catch (err) {
      console.warn('Erro ao carregar jobs:', err)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  return (
    <div className="bg-white rounded-2xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-800 text-lg flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary-500" />
          Jobs Recentes
        </h3>
        <button
          onClick={loadJobs}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700"
          disabled={loading}
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-neutral-500">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="ALL">Todos</option>
          <option value="PENDING">PENDING</option>
          <option value="UPLOADING">UPLOADING</option>
          <option value="UPLOADED">UPLOADED</option>
          <option value="COMMITTED">COMMITTED</option>
          <option value="FAILED">FAILED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      <div className="border border-neutral-100 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-50 text-xs font-semibold text-neutral-600 px-3 py-2">
          <span className="col-span-3">Arquivo</span>
          <span className="col-span-3">Status</span>
          <span className="col-span-2">Tamanho</span>
          <span className="col-span-4">Criado</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Carregando...</div>
        ) : jobs.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Nenhum job encontrado</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {jobs.map((job) => (
              <div key={job.id} className="grid grid-cols-12 px-3 py-2 text-sm">
                <span className="col-span-3 text-neutral-800 truncate" title={job.original_filename}>{job.original_filename}</span>
                <span className="col-span-3 text-neutral-600 font-semibold">{job.status}</span>
                <span className="col-span-2 text-neutral-500">{formatBytes(job.size_bytes)}</span>
                <span className="col-span-4 text-neutral-500">{new Date(job.created_at).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type FunctionRunRow = {
  id: number
  function_name: string
  status: 'success' | 'error'
  details: Record<string, unknown>
  created_at: string
}

function FunctionRunsList() {
  const [runs, setRuns] = useState<FunctionRunRow[]>([])
  const [loading, setLoading] = useState(false)
  const [functionName, setFunctionName] = useState<'ALL' | 'process-outbox' | 'reconcile-uploads'>('ALL')
  const [status, setStatus] = useState<'ALL' | 'success' | 'error'>('ALL')

  const loadRuns = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('function_runs')
        .select('id,function_name,status,details,created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      if (functionName !== 'ALL') query = query.eq('function_name', functionName)
      if (status !== 'ALL') query = query.eq('status', status)

      const { data, error } = await query

      if (error) throw error
      setRuns((data || []) as FunctionRunRow[])
    } catch (err) {
      console.warn('Erro ao carregar logs de funcoes:', err)
    } finally {
      setLoading(false)
    }
  }, [functionName, status])

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  return (
    <div className="bg-white rounded-2xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-800 text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          Logs das Funcoes
        </h3>
        <button
          onClick={loadRuns}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700"
          disabled={loading}
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs text-neutral-500">Funcao</label>
        <select
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value as any)}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="ALL">Todas</option>
          <option value="process-outbox">process-outbox</option>
          <option value="reconcile-uploads">reconcile-uploads</option>
        </select>
        <label className="text-xs text-neutral-500">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="ALL">Todos</option>
          <option value="success">success</option>
          <option value="error">error</option>
        </select>
      </div>

      <div className="border border-neutral-100 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-50 text-xs font-semibold text-neutral-600 px-3 py-2">
          <span className="col-span-3">Funcao</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-4">Detalhes</span>
          <span className="col-span-3">Data</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Carregando...</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Sem logs ainda</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {runs.map((run) => (
              <div key={run.id} className="grid grid-cols-12 px-3 py-2 text-sm">
                <span className="col-span-3 text-neutral-800">{run.function_name}</span>
                <span className={`col-span-2 font-semibold ${run.status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>{run.status}</span>
                <span className="col-span-4 text-neutral-600 truncate" title={JSON.stringify(run.details)}>
                  {JSON.stringify(run.details)}
                </span>
                <span className="col-span-3 text-neutral-500">{new Date(run.created_at).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type AuditItem = {
  id: number
  item_id: number
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  field_name?: string | null
  old_value?: string | null
  new_value?: string | null
  changed_at: string
  changed_by?: string | null
  user_email?: string | null
  ip_address?: string | null
}

function AuditTrail() {
  const [items, setItems] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [itemId, setItemId] = useState('')
  const [action, setAction] = useState<'ALL' | 'INSERT' | 'UPDATE' | 'DELETE'>('ALL')

  const PAGE_SIZE = 12

  const loadAudit = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('catalogo_audit')
        .select('id,item_id,action,field_name,old_value,new_value,changed_at,changed_by,user_email,ip_address', { count: 'exact' })
        .order('changed_at', { ascending: false })

      if (itemId.trim()) query = query.eq('item_id', Number(itemId))
      if (action !== 'ALL') query = query.eq('action', action)

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) throw error
      setItems((data || []) as AuditItem[])
      setTotal(count || 0)
    } catch (err) {
      console.warn('Erro ao carregar auditoria:', err)
    } finally {
      setLoading(false)
    }
  }, [action, itemId, page])

  useEffect(() => {
    loadAudit()
  }, [loadAudit])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-800 text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary-500" />
          Auditoria
        </h3>
        <span className="text-xs text-neutral-500">{total} registros</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="number"
          value={itemId}
          onChange={(e) => { setPage(1); setItemId(e.target.value) }}
          placeholder="Filtrar por ID do item"
          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        />
        <select
          value={action}
          onChange={(e) => { setPage(1); setAction(e.target.value as any) }}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
        >
          <option value="ALL">Todas</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="border border-neutral-100 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-50 text-xs font-semibold text-neutral-600 px-3 py-2">
          <span className="col-span-2">Data</span>
          <span className="col-span-2">Item</span>
          <span className="col-span-2">Ação</span>
          <span className="col-span-3">Campo</span>
          <span className="col-span-3">Valores</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Nenhum registro encontrado</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {items.map((row) => (
              <div key={row.id} className="grid grid-cols-12 px-3 py-2 text-sm">
                <span className="col-span-2 text-neutral-600">{new Date(row.changed_at).toLocaleString('pt-BR')}</span>
                <span className="col-span-2 font-medium text-neutral-800">#{row.item_id}</span>
                <span className={`col-span-2 font-semibold ${row.action === 'DELETE' ? 'text-red-600' : row.action === 'INSERT' ? 'text-emerald-600' : 'text-amber-600'}`}>{row.action}</span>
                <span className="col-span-3 text-neutral-700 truncate">{row.field_name || '-'}</span>
                <span className="col-span-3 text-neutral-600 truncate">
                  {row.old_value && row.new_value ? `${row.old_value} → ${row.new_value}` : row.new_value || row.old_value || '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-200 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-xs text-neutral-500">Pagina {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-200 disabled:opacity-50"
        >
          Proxima
        </button>
      </div>
    </div>
  )
}
