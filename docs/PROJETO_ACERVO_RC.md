# Projeto: Sistema de Acervo RC Agropecuária

## Stack Tecnológica
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Radix UI (shadcn)
- **Backend:** Supabase (Database + Storage)
- **Upload:** TUS Protocol (até 5GB por arquivo)

## Supabase
- **URL:** https://uqktebrajtlxyzdhqqdv.supabase.co
- **Bucket:** acervo-files

## Estrutura de Páginas
| Rota | Página | Função |
|------|--------|--------|
| `/` | Dashboard | Métricas gerais e alertas |
| `/acervo` | Catálogo | Listagem com filtros |
| `/acervo/:localidade` | Localidade | Por fazenda |
| `/upload` | Upload | Drag-drop + catalogação |
| `/workflow` | Workflow | Kanban de status |
| `/item/:id` | Detalhe | Visualização do item |
| `/item/:id/edit` | Edição | Editar metadados |
| `/admin` | Admin | Administração |

## Tabelas do Banco
- **catalogo_itens** (principal - 25+ campos)
- areas_fazendas, pontos, tipos_projeto
- nucleos_pecuaria, nucleos_agro, operacoes_internas
- marca_valorizacao, eventos_principais, funcoes_historicas
- temas_principais, temas_secundarios
- status_material, capitulos_filme

## Workflow de Status (9 etapas)
1. Entrada (Bruto) → 2. Em triagem → 3. Catalogado
4. Selecionado para produção → 5. Em produção → 6. Em aprovação
7. Aprovado → 8. Publicado → 9. Arquivado

## Localização do Código
`/workspace/project_analysis/acervo-rc/`

## Última Atualização
2026-02-01
