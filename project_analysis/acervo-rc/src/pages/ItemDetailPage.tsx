import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useItem, useUpdateItem, useDeleteItem } from '@/hooks/useQueries'
import { useTaxonomy, statusColors } from '@/hooks/useTaxonomy'
import { supabase, CatalogoItem } from '@/lib/supabase'
import { withCacheBuster } from '@/lib/media'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Edit, Trash2, Download, ExternalLink, FileImage, FileVideo, File, X, Loader2, Calendar, MapPin, Tag, Users, MessageSquare, Bookmark, Save } from 'lucide-react'

export function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canEdit } = useAuth()
  const { taxonomy } = useTaxonomy()
  
  const { data: item, isLoading } = useItem(id)
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CatalogoItem>>({})

  const handleDelete = async () => {
    if (!canEdit) return
    if (!item) return
    if (item.arquivo_nome) {
      await supabase.storage.from('acervo-files').remove([item.arquivo_nome])
    }
    deleteItem.mutate(item.id, {
      onSuccess: () => navigate('/acervo')
    })
  }

  const handleSaveEdit = () => {
    if (!canEdit) return
    if (!item) return
    updateItem.mutate({
      id: item.id,
      updates: {
        titulo: editForm.titulo,
        status_id: editForm.status_id,
        area_fazenda_id: editForm.area_fazenda_id,
        ponto_id: editForm.ponto_id,
        tipo_projeto_id: editForm.tipo_projeto_id,
        nucleo_pecuaria_id: editForm.nucleo_pecuaria_id,
        nucleo_agro_id: editForm.nucleo_agro_id,
        tema_principal_id: editForm.tema_principal_id,
        responsavel: editForm.responsavel,
        frase_memoria: editForm.frase_memoria,
        observacoes: editForm.observacoes,
        updated_at: new Date().toISOString()
      }
    }, {
      onSuccess: () => setShowEditModal(false)
    })
  }


  const getFileIcon = (tipo?: string) => {
    if (!tipo) return <File className="w-20 h-20 text-rc-text-muted" />
    if (tipo.startsWith('image')) return <FileImage className="w-20 h-20 text-emerald-200" />
    if (tipo.startsWith('video')) return <FileVideo className="w-20 h-20 text-amber-200" />
    return <File className="w-20 h-20 text-rc-text-muted" />
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-200" /></div>
  if (!item) return <div className="text-center py-16"><p className="text-rc-text-muted">Item nao encontrado</p><Link to="/acervo" className="text-rc-gold hover:underline mt-4 inline-block">Voltar ao Acervo</Link></div>

  const statusClass = statusColors[item.status || ''] || 'bg-neutral-200 text-neutral-700'
  const isImage = item.arquivo_tipo?.startsWith('image')
  const isVideo = item.arquivo_tipo?.startsWith('video')
  const cacheKey = item.updated_at || item.created_at || item.media_id || item.id
  const imageUrl = withCacheBuster(item.arquivo_url || item.thumbnail_url, cacheKey)
  const previewUrl = withCacheBuster(item.proxy_url || item.arquivo_url, cacheKey)
  const normalizedUrl = (item.arquivo_url || '').toLowerCase()
  const isMp4Url = normalizedUrl.includes('.mp4') || item.arquivo_tipo?.includes('mp4')
  const isMov = item.arquivo_tipo?.includes('quicktime') || item.arquivo_nome?.toLowerCase().endsWith('.mov') || normalizedUrl.includes('.mov')
  const isQuicktime = isMov && !isMp4Url && !item.proxy_url

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) => {
    if (!value) return null
    return (
      <div className="flex items-start gap-3 p-3 glass rounded-xl">
        {Icon && <Icon className="w-5 h-5 text-rc-text-muted mt-0.5" />}
        <div>
          <p className="text-xs text-rc-text-muted">{label}</p>
          <p className="font-medium text-rc-text">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in text-rc-text">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-rc-text-muted hover:text-rc-text font-medium">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        {canEdit && (
          <div className="flex gap-3">
            <button onClick={() => { setEditForm(item); setShowEditModal(true) }} className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl hover:bg-white/5 font-medium transition-all">
              <Edit className="w-4 h-4" /> Edicao Rapida
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl hover:bg-red-500/20 font-medium transition-all">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card overflow-hidden" onClick={() => isImage && setLightboxOpen(true)}>
            {isImage && imageUrl ? (
              <img
                src={imageUrl}
                alt={item.titulo}
                loading="lazy"
                decoding="async"
                className="w-full h-auto max-h-[500px] object-contain bg-neutral-900/50 cursor-pointer"
              />
            ) : isVideo && previewUrl && !isQuicktime ? (
              <video src={previewUrl} controls className="w-full max-h-[500px]" />
            ) : isVideo && isQuicktime ? (
              <div className="w-full h-64 bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 flex flex-col items-center justify-center text-rc-text-muted px-6 text-center">
                <div className="text-sm font-semibold mb-2">Preview indisponível no momento</div>
                <p className="text-xs">O preview será gerado automaticamente. Tente novamente em alguns minutos.</p>
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 flex items-center justify-center">{getFileIcon(item.arquivo_tipo)}</div>
            )}
          </div>

          {item.arquivo_url && (
            <div className="flex gap-3">
              <a href={item.arquivo_url} download className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-xl hover:shadow-green font-semibold transition-all">
                <Download className="w-4 h-4" /> Download
              </a>
              <a href={item.arquivo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-white/5 font-medium">
                <ExternalLink className="w-4 h-4" /> Abrir
              </a>
            </div>
          )}

          {(item.descricao || item.frase_memoria) && (
            <div className="glass-card p-5 space-y-4">
              {item.frase_memoria && (
                <div className="p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-400">
                  <p className="text-sm text-amber-200 font-medium mb-1">Frase-memoria</p>
                  <p className="text-rc-text font-semibold italic">"{item.frase_memoria}"</p>
                </div>
              )}
              {item.descricao && (
                <div>
                  <p className="text-sm text-rc-text-muted font-medium mb-2">Descricao</p>
                  <p className="text-rc-text">{item.descricao}</p>
                </div>
              )}
            </div>
          )}

          {item.observacoes && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-rc-text mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rc-text-muted" /> Observacoes
              </h3>
              <p className="text-rc-text">{item.observacoes}</p>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="font-semibold text-rc-text mb-4">Nucleos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.nucleo_pecuaria && <InfoItem label="Nucleo Pecuaria" value={item.nucleo_pecuaria} />}
              {item.nucleo_agro && <InfoItem label="Nucleo Agro" value={item.nucleo_agro} />}
              {item.nucleo_operacoes && <InfoItem label="Nucleo Operacoes" value={item.nucleo_operacoes} />}
              {item.marca && <InfoItem label="Marca" value={item.marca} />}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <h2 className="text-xl font-semibold text-rc-text mb-3">{item.titulo}</h2>
            <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full ${statusClass}`}>{item.status}</span>
            {item.responsavel && (
              <div className="mt-4 flex items-center gap-2 text-sm text-rc-text-muted">
                <Users className="w-4 h-4" /> {item.responsavel}
              </div>
            )}
          </div>

          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold text-rc-text mb-2">Identificacao</h3>
            <InfoItem label="Data de Captacao" value={item.data_captacao ? new Date(item.data_captacao).toLocaleDateString('pt-BR') : null} icon={Calendar} />
            <InfoItem label="Tipo de Projeto" value={item.tipo_projeto} icon={Tag} />
            <InfoItem label="Estações do Ano" value={item.capitulo} icon={Bookmark} />
          </div>

          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold text-rc-text mb-2">Localizacao</h3>
            <InfoItem label="Area / Fazenda" value={item.area_fazenda} icon={MapPin} />
            <InfoItem label="Local" value={item.ponto} />
            <InfoItem label="Atividades" value={item.evento} />
            <InfoItem label="Atividade Complementar" value={item.funcao_historica} />
          </div>

          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold text-rc-text mb-2">Temas</h3>
            <InfoItem label="Tema Principal" value={item.tema_principal} />
          </div>

          {item.arquivo_nome && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-rc-text mb-2">Arquivo</h3>
              <p className="text-sm text-rc-text-muted truncate">{item.arquivo_nome}</p>
              {item.arquivo_tamanho && <p className="text-xs text-rc-text-muted mt-1">{(item.arquivo_tamanho / 1024 / 1024).toFixed(2)} MB</p>}
            </div>
          )}

          <div className="glass rounded-2xl p-4 text-xs text-rc-text-muted">
            <p>ID: {item.id}</p>
            <p>Criado: {new Date(item.created_at).toLocaleString('pt-BR')}</p>
            <p>Atualizado: {new Date(item.updated_at).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {lightboxOpen && imageUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-rc-text-muted"><X className="w-8 h-8" /></button>
          <img
            src={imageUrl}
            alt={item.titulo}
            loading="lazy"
            decoding="async"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-rc-text mb-2">Confirmar Exclusao</h3>
            <p className="text-rc-text-muted mb-6">Tem certeza que deseja excluir "{item.titulo}"? Esta acao nao pode ser desfeita.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2.5 border border-rc-border rounded-xl hover:bg-white/5 font-medium">Cancelar</button>
              <button onClick={handleDelete} disabled={deleteItem.isPending} className="px-4 py-2.5 bg-red-500/80 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 font-medium">
                {deleteItem.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-rc-text">Edicao Rapida</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-1">Titulo</label>
                <input type="text" value={editForm.titulo || ''} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Status</label>
                  <select value={editForm.status_id || ''} onChange={(e) => {
                    const selected = taxonomy.statusOptions.find(s => s.id === e.target.value)
                    setEditForm({ ...editForm, status_id: e.target.value, status: selected?.name || '' })
                  }}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.statusOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Responsavel</label>
                  <select value={editForm.responsavel || ''} onChange={(e) => setEditForm({ ...editForm, responsavel: e.target.value })}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Area/Fazenda</label>
                  <select value={editForm.area_fazenda_id || ''} onChange={(e) => {
                    const selected = taxonomy.areasOptions.find(a => a.id === e.target.value)
                    setEditForm({ ...editForm, area_fazenda_id: e.target.value, area_fazenda: selected?.name || '' })
                  }}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.areasOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Local</label>
                  <select value={editForm.ponto_id || ''} onChange={(e) => {
                    const selected = taxonomy.pontosOptions.find(p => p.id === e.target.value)
                    setEditForm({ ...editForm, ponto_id: e.target.value, ponto: selected?.name || '' })
                  }}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.pontosOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Nucleo Pecuaria</label>
                  <select value={editForm.nucleo_pecuaria_id || ''} onChange={(e) => {
                    const selected = taxonomy.nucleosPecuariaOptions.find(n => n.id === e.target.value)
                    setEditForm({ ...editForm, nucleo_pecuaria_id: e.target.value, nucleo_pecuaria: selected?.name || '' })
                  }}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.nucleosPecuariaOptions.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Tema Principal</label>
                  <select value={editForm.tema_principal_id || ''} onChange={(e) => {
                    const selected = taxonomy.temasPrincipaisOptions.find(t => t.id === e.target.value)
                    setEditForm({ ...editForm, tema_principal_id: e.target.value, tema_principal: selected?.name || '' })
                  }}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.temasPrincipaisOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-rc-text-muted mb-1">Tipo Projeto</label>
                  <select value={editForm.tipo_projeto_id || ''} onChange={(e) => {
                    const selected = taxonomy.tiposProjetoOptions.find(t => t.id === e.target.value)
                    setEditForm({ ...editForm, tipo_projeto_id: e.target.value, tipo_projeto: selected?.name || '' })
                  }}
                    className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text">
                    <option value="">Selecione</option>
                    {taxonomy.tiposProjetoOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-1">Frase-memoria</label>
                <input type="text" value={editForm.frase_memoria || ''} onChange={(e) => setEditForm({ ...editForm, frase_memoria: e.target.value })}
                  className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-rc-text-muted mb-1">Observacoes</label>
                <textarea value={editForm.observacoes || ''} onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
              <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 border border-rc-border rounded-xl hover:bg-white/5 font-medium">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={updateItem.isPending} className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-xl hover:shadow-green disabled:opacity-50 flex items-center gap-2 font-semibold">
                {updateItem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
