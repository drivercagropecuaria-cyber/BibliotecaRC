import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { TAXONOMY_TYPES, invalidateCache, type TaxonomyItem, type NamingRule } from '@/lib/taxonomy'
import { queryKeys } from '@/hooks/useQueries'
import { Plus, Trash2, Edit2, Save, X, GripVertical, Eye, EyeOff, Settings, Tag, FileText, ChevronRight, ChevronDown, Loader2, Check, AlertCircle, Video, Image as ImageIcon, Wrench, History, RefreshCcw, ListChecks, Activity, Users, UserPlus, UserCheck, UserX } from 'lucide-react'
import { generateVideoThumbnail } from '@/utils/videoThumbnail'

type AdminUserRole = 'admin' | 'editor' | 'viewer'

type AdminUserRow = {
  id: string
  email: string
  nome: string | null
  role: AdminUserRole
  created_at: string
  deleted_at: string | null
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<'taxonomy' | 'naming' | 'users' | 'tools'>('taxonomy')
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
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersSaving, setUsersSaving] = useState(false)
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    nome: '',
    role: 'viewer' as AdminUserRole,
    active: true
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

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const { data, error: usersError } = await supabase
        .from('user_profiles')
        .select('id,email,nome,role,created_at,deleted_at')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers((data || []) as AdminUserRow[])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuarios')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const runUserAction = async (action: 'create' | 'update', payload: Record<string, unknown>) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      throw new Error(sessionError.message)
    }

    let accessToken = sessionData.session?.access_token
    if (!accessToken) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        throw new Error(refreshError.message)
      }
      accessToken = refreshData.session?.access_token
    }

    if (!accessToken) {
      throw new Error('Sessao expirada. Faça login novamente.')
    }

    const { data, error: fnError } = await supabase.functions.invoke('admin-users', {
      body: { action, payload },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      }
    })

    if (fnError) {
      throw new Error(fnError.message)
    }

    if (data?.error) {
      throw new Error(data.error)
    }
  }

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password) {
      setError('Email e senha sao obrigatorios')
      return
    }

    setUsersSaving(true)
    setError(null)
    try {
      await runUserAction('create', {
        email: userForm.email,
        password: userForm.password,
        nome: userForm.nome,
        role: userForm.role,
        active: userForm.active
      })
      setUserForm({ email: '', password: '', nome: '', role: 'viewer', active: true })
      setSuccess('Usuario criado com sucesso')
      await loadUsers()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuario')
    } finally {
      setUsersSaving(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Record<string, unknown>) => {
    setUsersSaving(true)
    setError(null)
    try {
      await runUserAction('update', { userId, ...updates })
      setSuccess('Usuario atualizado')
      await loadUsers()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar usuario')
    } finally {
      setUsersSaving(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (activeSection === 'users') {
      loadUsers()
    }
  }, [activeSection, loadUsers])

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
          item.is_active ? 'glass border border-rc-border' : 'bg-neutral-900/40 border border-white/5 opacity-60'
        }`}>
          <GripVertical className="w-4 h-4 text-rc-text-muted cursor-grab" />
          
          {hasChildren && (
            <button onClick={() => toggleExpand(item.id)} className="p-1 hover:bg-white/5 rounded">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
              autoFocus
            />
          ) : (
            <span className={`flex-1 font-medium ${item.is_active ? 'text-rc-text' : 'text-rc-text-muted line-through'}`}>
              {item.name}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={() => { updateItem(item.id, { name: editingName }); setEditingId(null) }}
                  className="p-2 text-emerald-200 hover:bg-emerald-500/10 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-2 text-rc-text-muted hover:bg-white/5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleActive(item)}
                  className={`p-2 rounded-lg ${item.is_active ? 'text-emerald-200 hover:bg-emerald-500/10' : 'text-rc-text-muted hover:bg-white/5'}`}
                  title={item.is_active ? 'Desativar' : 'Ativar'}
                >
                  {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditingId(item.id); setEditingName(item.name) }}
                  className="p-2 text-amber-200 hover:bg-amber-500/10 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-red-200 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Subitens */}
        {hasChildren && isExpanded && (
          <div className="ml-4 pl-4 border-l-2 border-white/5">
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
        <Loader2 className="w-8 h-8 text-amber-200 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in text-rc-text">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">Configuracoes do Sistema</h1>
        <p className="text-rc-text-muted mt-1">Gerencie categorias, regras de nomenclatura e usuarios</p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-200" />
          <span className="text-red-200">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-200 hover:text-red-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-200" />
          <span className="text-emerald-200">{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('taxonomy')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'taxonomy'
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 shadow-green'
              : 'glass text-rc-text-muted hover:text-rc-text border border-rc-border'
          }`}
        >
          <Tag className="w-5 h-5" />
          Taxonomias
        </button>
        <button
          onClick={() => setActiveSection('naming')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'naming'
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 shadow-green'
              : 'glass text-rc-text-muted hover:text-rc-text border border-rc-border'
          }`}
        >
          <FileText className="w-5 h-5" />
          Nomenclatura
        </button>
        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'users'
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 shadow-lg'
              : 'glass text-rc-text-muted hover:text-rc-text border border-rc-border'
          }`}
        >
          <Users className="w-5 h-5" />
          Usuarios
        </button>
        <button
          onClick={() => setActiveSection('tools')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeSection === 'tools'
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 shadow-lg'
              : 'glass text-rc-text-muted hover:text-rc-text border border-rc-border'
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
          <div className="lg:col-span-1 glass-card p-4 h-fit">
            <h3 className="font-semibold text-rc-text mb-3 flex items-center gap-2">
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
                        ? 'bg-amber-500/10 text-amber-200 font-medium'
                        : 'text-rc-text-muted hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm">{type.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedType === type.key ? 'bg-amber-500/20 text-amber-200' : 'bg-white/10 text-rc-text-muted'
                    }`}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Editor de itens */}
          <div className="lg:col-span-3 glass-card p-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <h3 className="font-semibold text-rc-text text-lg">
                {currentTypeConfig?.label}
                {currentTypeConfig?.hasChildren && (
                  <span className="text-sm font-normal text-rc-text-muted ml-2">(com subitens)</span>
                )}
              </h3>
            </div>

            {/* Adicionar novo item */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-900/40 rounded-xl">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Digite o nome do novo item..."
                className="flex-1 px-4 py-2.5 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <button
                onClick={() => addItem()}
                disabled={saving || !newItemName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-lg disabled:opacity-50 font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </button>
            </div>

            {/* Lista de itens */}
            <div className="max-h-[500px] overflow-y-auto pr-2">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-rc-text-muted">
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
        <div className="glass-card p-6">
          <h3 className="font-semibold text-rc-text text-lg mb-4">Regras de Nomenclatura</h3>
          
          {namingRules.map(rule => (
            <div key={rule.id} className="mb-6 p-4 bg-neutral-900/40 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-medium text-rc-text">{rule.name}</span>
                {rule.is_default && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-200 rounded text-xs font-medium">Padrao</span>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-rc-text-muted mb-1">Padrao de nomenclatura</label>
                <input
                  type="text"
                  value={rule.pattern}
                  onChange={(e) => setNamingRules(prev => prev.map(r => r.id === rule.id ? { ...r, pattern: e.target.value } : r))}
                  className="w-full px-4 py-2.5 border border-rc-border rounded-lg font-mono text-sm bg-neutral-900/50 text-rc-text"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-rc-text-muted">Variaveis disponiveis:</span>
                {['{area}', '{ponto}', '{tipo}', '{titulo}', '{data}', '{seq}', '{ext}', '{nucleo}', '{responsavel}'].map(v => (
                  <code key={v} className="px-2 py-0.5 bg-white/10 rounded text-xs text-rc-text">{v}</code>
                ))}
              </div>
              
              {/* Preview */}
              <div className="p-3 glass rounded-lg border border-rc-border">
                <div className="text-xs text-rc-text-muted mb-2">Preview:</div>
                <code className="text-sm text-amber-200 break-all">{generatePreview(rule.pattern)}</code>
              </div>
              
              <button
                onClick={() => saveNamingRule(rule)}
                disabled={saving}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-lg disabled:opacity-50 text-sm font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Regra
              </button>
            </div>
          ))}
          
          {/* Dados de teste para preview */}
          <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl">
            <h4 className="font-medium text-emerald-200 mb-3">Dados de teste para preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(previewData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-emerald-200 mb-1">{key}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-emerald-400/30 rounded text-sm bg-neutral-900/50 text-rc-text"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeSection === 'users' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-amber-200" />
              <h3 className="font-semibold text-rc-text text-lg">Cadastrar usuario</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-rc-border rounded-lg bg-neutral-900/50 text-rc-text"
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-2">Senha temporaria</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-rc-border rounded-lg bg-neutral-900/50 text-rc-text"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-2">Nome</label>
                <input
                  type="text"
                  value={userForm.nome}
                  onChange={(e) => setUserForm(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-3 border border-rc-border rounded-lg bg-neutral-900/50 text-rc-text"
                  placeholder="Nome do usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-2">Perfil</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as AdminUserRole }))}
                  className="w-full px-4 py-3 border border-rc-border rounded-lg bg-neutral-900/50 text-rc-text"
                >
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-rc-text-muted">
                <input
                  type="checkbox"
                  checked={userForm.active}
                  onChange={(e) => setUserForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-rc-border bg-neutral-900/50"
                />
                Usuario ativo
              </label>
              <button
                onClick={handleCreateUser}
                disabled={usersSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-lg font-semibold disabled:opacity-50"
              >
                {usersSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Criar usuario
              </button>
              <p className="text-xs text-rc-text-muted">
                Alteracoes de perfil exigem novo login do usuario.
              </p>
            </div>
          </div>

          <div className="xl:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-rc-text text-lg">Usuarios cadastrados</h3>
                <p className="text-sm text-rc-text-muted">Administrar perfis e acessos</p>
              </div>
              <button
                onClick={loadUsers}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-rc-border rounded-lg hover:bg-white/5"
              >
                <RefreshCcw className="w-4 h-4" />
                Atualizar
              </button>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 text-amber-200 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-rc-text-muted">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum usuario encontrado</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {users.map(user => {
                  const isActiveUser = !user.deleted_at
                  return (
                    <div key={user.id} className="glass rounded-xl p-4 border border-rc-border">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="font-semibold text-rc-text">{user.nome || user.email}</div>
                          <div className="text-xs text-rc-text-muted">{user.email}</div>
                          <div className="text-xs text-rc-text-muted mt-1">Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                            className="px-3 py-2 border border-rc-border rounded-lg bg-neutral-900/60 text-rc-text text-sm"
                          >
                            <option value="admin">Administrador</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Visualizador</option>
                          </select>
                          <button
                            onClick={() => handleUpdateUser(user.id, { active: !isActiveUser })}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border ${
                              isActiveUser
                                ? 'border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10'
                                : 'border-red-500/40 text-red-200 hover:bg-red-500/10'
                            }`}
                          >
                            {isActiveUser ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            {isActiveUser ? 'Ativo' : 'Desativado'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
    <div className="flex items-center gap-2 p-2 mb-2 bg-neutral-900/40 rounded-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Novo subitem..."
        className="flex-1 px-3 py-2 border border-rc-border rounded-lg text-sm focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button
        onClick={handleAdd}
        disabled={!value.trim() || isAdding || saving}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-lg disabled:opacity-50 text-sm font-medium transition-all"
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
    <div className="glass-card p-6">
      <h3 className="font-semibold text-rc-text text-lg mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-amber-200" />
        Gerador de Thumbnails para Videos
      </h3>
      
      <p className="text-rc-text-muted mb-4">
        Esta ferramenta gera imagens de preview para videos que foram enviados antes do sistema de thumbnails automaticos.
      </p>

      <div className="p-4 bg-amber-500/10 rounded-xl mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-amber-200">{videos.length}</span>
            <span className="text-rc-text-muted ml-2">videos sem thumbnail</span>
          </div>
          <button
            onClick={generateThumbnails}
            disabled={processing || videos.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            {processing ? 'Processando...' : 'Gerar Thumbnails'}
          </button>
        </div>
      </div>

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-rc-text-muted mb-2">
            <span>Progresso: {progress.current}/{progress.total}</span>
            <span className="text-emerald-200">✓ {progress.success}</span>
            <span className="text-red-200">✗ {progress.failed}</span>
          </div>
          <div className="h-3 bg-neutral-900/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="p-4 bg-neutral-950 rounded-xl max-h-64 overflow-y-auto">
          <pre className="text-xs text-emerald-200 font-mono whitespace-pre-wrap">
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-rc-text text-lg">Monitor do Pipeline</h3>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 text-xs text-rc-text-muted hover:text-rc-text"
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
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          Rodar process-outbox
        </button>
        <button
          onClick={() => runMaintenance('reconcile-uploads')}
          disabled={actionLoading}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
        >
          Rodar reconcile-uploads
        </button>
      </div>

      {actionMessage && (
        <div className="mb-3 text-xs text-rc-text-muted bg-neutral-900/40 border border-white/5 rounded-lg px-3 py-2">
          {actionMessage}
        </div>
      )}

      {!stats ? (
        <div className="text-sm text-rc-text-muted">Sem dados</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-neutral-900/40 rounded-xl">
            <p className="text-xs text-rc-text-muted">Total</p>
            <p className="text-lg font-bold text-rc-text">{stats.total_jobs}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <p className="text-xs text-amber-200">Pendentes</p>
            <p className="text-lg font-bold text-amber-200">{stats.pending}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-200">Enviando</p>
            <p className="text-lg font-bold text-emerald-200">{stats.uploading}</p>
          </div>
          <div className="p-3 bg-neutral-900/40 rounded-xl">
            <p className="text-xs text-rc-text-muted">Enviados</p>
            <p className="text-lg font-bold text-rc-text">{stats.uploaded}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-200">Commitados</p>
            <p className="text-lg font-bold text-emerald-200">{stats.committed}</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl">
            <p className="text-xs text-red-200">Falhas</p>
            <p className="text-lg font-bold text-red-200">{stats.failed}</p>
          </div>
          <div className="p-3 bg-neutral-900/40 rounded-xl">
            <p className="text-xs text-rc-text-muted">Expirados</p>
            <p className="text-lg font-bold text-rc-text">{stats.expired}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-200">Outbox</p>
            <p className="text-lg font-bold text-emerald-200">{stats.outbox_pending}</p>
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-rc-text text-lg flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-amber-200" />
          Jobs Recentes
        </h3>
        <button
          onClick={loadJobs}
          className="flex items-center gap-2 text-xs text-rc-text-muted hover:text-rc-text"
          disabled={loading}
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-rc-text-muted">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border border-rc-border rounded-lg text-sm bg-neutral-900/50 text-rc-text"
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

      <div className="border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-900/40 text-xs font-semibold text-rc-text-muted px-3 py-2">
          <span className="col-span-3">Arquivo</span>
          <span className="col-span-3">Status</span>
          <span className="col-span-2">Tamanho</span>
          <span className="col-span-4">Criado</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-rc-text-muted text-sm">Carregando...</div>
        ) : jobs.length === 0 ? (
          <div className="p-6 text-center text-rc-text-muted text-sm">Nenhum job encontrado</div>
        ) : (
          <div className="divide-y divide-white/5">
            {jobs.map((job) => (
              <div key={job.id} className="grid grid-cols-12 px-3 py-2 text-sm">
                <span className="col-span-3 text-rc-text truncate" title={job.original_filename}>{job.original_filename}</span>
                <span className="col-span-3 text-rc-text-muted font-semibold">{job.status}</span>
                <span className="col-span-2 text-rc-text-muted">{formatBytes(job.size_bytes)}</span>
                <span className="col-span-4 text-rc-text-muted">{new Date(job.created_at).toLocaleString('pt-BR')}</span>
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-rc-text text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-200" />
          Logs das Funcoes
        </h3>
        <button
          onClick={loadRuns}
          className="flex items-center gap-2 text-xs text-rc-text-muted hover:text-rc-text"
          disabled={loading}
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs text-rc-text-muted">Funcao</label>
        <select
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value as any)}
          className="px-3 py-2 border border-rc-border rounded-lg text-sm bg-neutral-900/50 text-rc-text"
        >
          <option value="ALL">Todas</option>
          <option value="process-outbox">process-outbox</option>
          <option value="reconcile-uploads">reconcile-uploads</option>
        </select>
        <label className="text-xs text-rc-text-muted">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border border-rc-border rounded-lg text-sm bg-neutral-900/50 text-rc-text"
        >
          <option value="ALL">Todos</option>
          <option value="success">success</option>
          <option value="error">error</option>
        </select>
      </div>

      <div className="border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-900/40 text-xs font-semibold text-rc-text-muted px-3 py-2">
          <span className="col-span-3">Funcao</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-4">Detalhes</span>
          <span className="col-span-3">Data</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-rc-text-muted text-sm">Carregando...</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-center text-rc-text-muted text-sm">Sem logs ainda</div>
        ) : (
          <div className="divide-y divide-white/5">
            {runs.map((run) => (
              <div key={run.id} className="grid grid-cols-12 px-3 py-2 text-sm">
                <span className="col-span-3 text-rc-text">{run.function_name}</span>
                <span className={`col-span-2 font-semibold ${run.status === 'error' ? 'text-red-200' : 'text-emerald-200'}`}>{run.status}</span>
                <span className="col-span-4 text-rc-text-muted truncate" title={JSON.stringify(run.details)}>
                  {JSON.stringify(run.details)}
                </span>
                <span className="col-span-3 text-rc-text-muted">{new Date(run.created_at).toLocaleString('pt-BR')}</span>
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-rc-text text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-amber-200" />
          Auditoria
        </h3>
        <span className="text-xs text-rc-text-muted">{total} registros</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="number"
          value={itemId}
          onChange={(e) => { setPage(1); setItemId(e.target.value) }}
          placeholder="Filtrar por ID do item"
          className="flex-1 px-3 py-2 border border-rc-border rounded-lg text-sm bg-neutral-900/50 text-rc-text"
        />
        <select
          value={action}
          onChange={(e) => { setPage(1); setAction(e.target.value as any) }}
          className="px-3 py-2 border border-rc-border rounded-lg text-sm bg-neutral-900/50 text-rc-text"
        >
          <option value="ALL">Todas</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-900/40 text-xs font-semibold text-rc-text-muted px-3 py-2">
          <span className="col-span-2">Data</span>
          <span className="col-span-2">Item</span>
          <span className="col-span-2">Ação</span>
          <span className="col-span-3">Campo</span>
          <span className="col-span-3">Valores</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-rc-text-muted text-sm">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-rc-text-muted text-sm">Nenhum registro encontrado</div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((row) => (
              <div key={row.id} className="grid grid-cols-12 px-3 py-2 text-sm">
                <span className="col-span-2 text-rc-text-muted">{new Date(row.changed_at).toLocaleString('pt-BR')}</span>
                <span className="col-span-2 font-medium text-rc-text">#{row.item_id}</span>
                <span className={`col-span-2 font-semibold ${row.action === 'DELETE' ? 'text-red-200' : row.action === 'INSERT' ? 'text-emerald-200' : 'text-amber-200'}`}>{row.action}</span>
                <span className="col-span-3 text-rc-text truncate">{row.field_name || '-'}</span>
                <span className="col-span-3 text-rc-text-muted truncate">
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
          className="px-3 py-2 text-sm rounded-lg border border-rc-border disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-xs text-rc-text-muted">Pagina {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-rc-border disabled:opacity-50"
        >
          Proxima
        </button>
      </div>
    </div>
  )
}
