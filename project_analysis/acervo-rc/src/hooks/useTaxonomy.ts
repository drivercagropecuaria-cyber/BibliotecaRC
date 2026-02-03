import { useMemo } from 'react'
import { useTaxonomyQuery, TaxonomyItem } from './useQueries'

interface TaxonomyData {
  areas: string[]
  areasOptions: Array<{ id: string; name: string }>
  pontos: string[]
  pontosOptions: Array<{ id: string; name: string }>
  tiposProjeto: string[]
  tiposProjetoOptions: Array<{ id: string; name: string }>
  nucleosPecuaria: string[]
  nucleosPecuariaOptions: Array<{ id: string; name: string }>
  nucleosAgro: string[]
  nucleosAgroOptions: Array<{ id: string; name: string }>
  nucleosOperacoes: string[]
  nucleosOperacoesOptions: Array<{ id: string; name: string }>
  nucleosMarca: string[]
  nucleosMarcaOptions: Array<{ id: string; name: string }>
  eventos: string[]
  eventosOptions: Array<{ id: string; name: string }>
  funcoesHistoricas: string[]
  funcoesHistoricasOptions: Array<{ id: string; name: string }>
  temasPrincipais: string[]
  temasPrincipaisOptions: Array<{ id: string; name: string }>
  status: string[]
  statusOptions: Array<{ id: string; name: string }>
  capitulos: string[]
  capitulosOptions: Array<{ id: string; name: string }>
  responsaveis: string[]
  responsaveisOptions: Array<{ id: string; name: string }>
}

export function useTaxonomy() {
  const { data: rawData = [], isLoading: loading, error, refetch } = useTaxonomyQuery()

  const taxonomy = useMemo<TaxonomyData>(() => {
    const getByType = (type: string) => 
      rawData.filter(t => t.type === type && !t.parent_id).map(t => t.name)

    const getOptionsByType = (type: string) =>
      rawData.filter(t => t.type === type && !t.parent_id).map(t => ({ id: t.id, name: t.name }))

    return {
      areas: getByType('area'),
      areasOptions: getOptionsByType('area'),
      pontos: getByType('ponto'),
      pontosOptions: getOptionsByType('ponto'),
      tiposProjeto: getByType('tipo_projeto'),
      tiposProjetoOptions: getOptionsByType('tipo_projeto'),
      nucleosPecuaria: getByType('nucleo_pecuaria'),
      nucleosPecuariaOptions: getOptionsByType('nucleo_pecuaria'),
      nucleosAgro: getByType('nucleo_agro'),
      nucleosAgroOptions: getOptionsByType('nucleo_agro'),
      nucleosOperacoes: getByType('nucleo_operacoes'),
      nucleosOperacoesOptions: getOptionsByType('nucleo_operacoes'),
      nucleosMarca: getByType('nucleo_marca'),
      nucleosMarcaOptions: getOptionsByType('nucleo_marca'),
      eventos: getByType('evento'),
      eventosOptions: getOptionsByType('evento'),
      funcoesHistoricas: getByType('funcao_historica'),
      funcoesHistoricasOptions: getOptionsByType('funcao_historica'),
      temasPrincipais: getByType('tema_principal'),
      temasPrincipaisOptions: getOptionsByType('tema_principal'),
      status: getByType('status'),
      statusOptions: getOptionsByType('status'),
      capitulos: getByType('capitulo'),
      capitulosOptions: getOptionsByType('capitulo'),
      responsaveis: getByType('responsavel'),
      responsaveisOptions: getOptionsByType('responsavel'),
    }
  }, [rawData])

  const refresh = () => refetch()

  return { 
    taxonomy, 
    loading, 
    error: error?.message || null, 
    refresh, 
    rawData 
  }
}

export const statusColors: Record<string, string> = {
  "Entrada (Bruto)": "bg-neutral-200 text-neutral-700",
  "Em triagem": "bg-amber-100 text-amber-700",
  "Catalogado": "bg-blue-100 text-blue-700",
  "Em revisao": "bg-purple-100 text-purple-700",
  "Editado": "bg-indigo-100 text-indigo-700",
  "Aprovado": "bg-primary-100 text-primary-700",
  "Publicado": "bg-green-100 text-green-700",
  "Arquivado": "bg-neutral-700 text-neutral-100",
  "Descartado": "bg-red-100 text-red-700",
}

export const statusKanbanOrder = [
  "Entrada (Bruto)", "Em triagem", "Catalogado", "Em revisao", 
  "Editado", "Aprovado", "Publicado", "Arquivado"
]

export type { TaxonomyItem }
