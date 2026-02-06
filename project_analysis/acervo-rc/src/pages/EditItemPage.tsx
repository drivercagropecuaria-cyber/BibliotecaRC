import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useTaxonomy } from '@/hooks/useTaxonomy'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export function EditItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { taxonomy, loading: taxonomyLoading } = useTaxonomy()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    area_fazenda_id: '',
    ponto_id: '',
    tipo_projeto_id: '',
    nucleo_pecuaria_id: '',
    nucleo_agro_id: '',
    operacao_id: '',
    marca_id: '',
    evento_id: '',
    funcao_historica_id: '',
    tema_principal_id: '',
    status_id: '',
    capitulo_id: '',
    data_captacao: '',
  })

  const fetchItem = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('v_catalogo_ativo')
      .select('titulo,descricao,area_fazenda_id,ponto_id,tipo_projeto_id,nucleo_pecuaria_id,nucleo_agro_id,operacao_id,marca_id,evento_id,funcao_historica_id,tema_principal_id,status_id,capitulo_id,data_captacao')
      .eq('id', id)
      .single()
    if (data) {
      setForm({
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        area_fazenda_id: data.area_fazenda_id || '',
        ponto_id: data.ponto_id || '',
        tipo_projeto_id: data.tipo_projeto_id || '',
        nucleo_pecuaria_id: data.nucleo_pecuaria_id || '',
        nucleo_agro_id: data.nucleo_agro_id || '',
        operacao_id: data.operacao_id || '',
        marca_id: data.marca_id || '',
        evento_id: data.evento_id || '',
        funcao_historica_id: data.funcao_historica_id || '',
        tema_principal_id: data.tema_principal_id || '',
        status_id: data.status_id || '',
        capitulo_id: data.capitulo_id || '',
        data_captacao: data.data_captacao || '',
      })
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchItem()
  }, [fetchItem])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!form.titulo) {
      setError('Título é obrigatório')
      return
    }

    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('catalogo_itens')
        .update({
          titulo: form.titulo,
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
          data_captacao: form.data_captacao || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError
      navigate(`/item/${id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-200" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl text-rc-text">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-rc-text-muted hover:text-rc-text mb-6">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <h1 className="text-3xl font-semibold text-rc-text mb-2">Editar Item</h1>
      <p className="text-rc-text-muted mb-6">Atualize os metadados do material</p>

      <form onSubmit={handleSubmit} className="glass-card p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Título *</label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Status</label>
            <select
              value={form.status_id}
              onChange={(e) => setForm({ ...form, status_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.statusOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Data de Captação</label>
            <input
              type="date"
              value={form.data_captacao}
              onChange={(e) => setForm({ ...form, data_captacao: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Área / Fazenda</label>
            <select
              value={form.area_fazenda_id}
              onChange={(e) => setForm({ ...form, area_fazenda_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.areasOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Local</label>
            <select
              value={form.ponto_id}
              onChange={(e) => setForm({ ...form, ponto_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.pontosOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Tipo de Projeto</label>
            <select
              value={form.tipo_projeto_id}
              onChange={(e) => setForm({ ...form, tipo_projeto_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.tiposProjetoOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Tema Principal</label>
            <select
              value={form.tema_principal_id}
              onChange={(e) => setForm({ ...form, tema_principal_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.temasPrincipaisOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Núcleo Pecuária</label>
            <select
              value={form.nucleo_pecuaria_id}
              onChange={(e) => setForm({ ...form, nucleo_pecuaria_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.nucleosPecuariaOptions.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Núcleo Agro</label>
            <select
              value={form.nucleo_agro_id}
              onChange={(e) => setForm({ ...form, nucleo_agro_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.nucleosAgroOptions.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Atividades</label>
            <select
              value={form.evento_id}
              onChange={(e) => setForm({ ...form, evento_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.eventosOptions.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Estações do Ano</label>
            <select
              value={form.capitulo_id}
              onChange={(e) => setForm({ ...form, capitulo_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.capitulosOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rc-text-muted mb-2">Atividade Complementar</label>
            <select
              value={form.funcao_historica_id}
              onChange={(e) => setForm({ ...form, funcao_historica_id: e.target.value })}
              className="w-full px-4 py-3 border border-rc-border rounded-lg focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-rc-text"
            >
              <option value="">Selecione...</option>
              {taxonomy.funcoesHistoricasOptions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-rc-border rounded-lg text-rc-text hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-900 rounded-lg hover:shadow-green disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            <Save className="w-5 h-5" />
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  )
}
