# Sistema de Acervo RC Agropecuária

## Visão Geral
Sistema de gestão de acervo de marketing para catalogação de materiais audiovisuais da RC Agropecuária.

## Estrutura de Dados

### Tabelas de Referência (já criadas e populadas)
- **areas_fazendas**: 13 fazendas/locais
- **pontos**: 15+ locais de captação  
- **tipos_projeto**: 15 tipos de projeto
- **nucleos_pecuaria**: Núcleos e subnúcleos da pecuária
- **nucleos_agro**: Núcleos do agro (Terra e Água)
- **operacoes_internas**: Operações administrativas
- **marca_valorizacao**: Marketing e marca
- **eventos_principais**: 30 eventos do calendário
- **funcoes_historicas**: Funções para Casa de Memória
- **temas_principais**: 50 temas narrativos
- **temas_secundarios**: 100 temas de detalhamento
- **status_material**: 9 status de workflow
- **capitulos_filme**: Capítulos do documentário

### Tabela Principal
- **catalogo_itens**: Catálogo com todas as classificações e links

## Workflow de Status
1. Entrada (Bruto) → 2. Em triagem → 3. Catalogado → 4. Selecionado para produção
5. Em produção → 6. Em aprovação → 7. Aprovado → 8. Publicado → 9. Arquivado

## Storage
- Bucket: acervo-files (50MB por arquivo)
- Tipos: imagens, vídeos, PDFs

## Funcionalidades Requeridas
1. Upload drag-and-drop de arquivos pesados
2. Formulário de catalogação com dropdowns das listas
3. Catálogo com filtros por área, tema, status
4. Painel de métricas (total por status, por área)
5. Workflow visual de status
6. Links para Drive/Asana/Frame.io
