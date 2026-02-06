# Relatorio Reforma Visual - Estado Atual e Diario de Mudancas

## Objetivo
Este documento registra o estado atual do app BibliotecaRC, pagina por pagina, e o historico das mudancas feitas durante a reforma visual (Luxo Digital e Heranca Historica). Ele deve ser usado como base de trabalho para as proximas etapas.

## Contexto Tecnico
- Stack: React + Vite + Tailwind, Supabase (auth, storage, queries, RLS), React Query.
- Padrao visual: fundo escuro, vidro, dourado, verde institucional, tipografia Playfair Display e Montserrat.
- Regras: nao remover logica Supabase nem hooks existentes.

## Estado Atual (Global)
### Tema, Tipografia e Efeitos
- Tokens visuais: paleta e sombras atualizadas para tema Luxo Digital.
- Tipografia: Playfair Display para titulos e Montserrat para corpo.
- Glassmorphism: utilitarios glass, glass-dark, glass-card e rc-card/rc-section com blur.
- Grain overlay: aplicado globalmente no body com animacao e opcao de classe.

Arquivos chave:
- [project_analysis/acervo-rc/src/index.css](project_analysis/acervo-rc/src/index.css)
- [project_analysis/acervo-rc/src/styles/rc-tokens.css](project_analysis/acervo-rc/src/styles/rc-tokens.css)
- [project_analysis/acervo-rc/src/styles/rc-utilities.css](project_analysis/acervo-rc/src/styles/rc-utilities.css)

### Layout e Navegacao
- Layout com glow verde sutil no fundo do conteudo principal.
- Sidebar minimalista em vidro escuro, menu compacto e branding reduzido.

Arquivos chave:
- [project_analysis/acervo-rc/src/components/Layout.tsx](project_analysis/acervo-rc/src/components/Layout.tsx)
- [project_analysis/acervo-rc/src/components/Sidebar.tsx](project_analysis/acervo-rc/src/components/Sidebar.tsx)

### Dependencias
- three e gsap adicionados ao projeto.

## Variaveis e Parametros Criticos (Nao alterar)
Esta lista serve para orientar mudancas visuais sem quebrar a integracao.

### Variaveis de Ambiente (Vite)
- `VITE_SUPABASE_URL`: URL do projeto Supabase. Usada no client e no TUS.
- `VITE_SUPABASE_ANON_KEY`: chave anon do Supabase. Usada no client, functions e TUS.

Arquivos relacionados:
- [project_analysis/acervo-rc/src/lib/supabase.ts](project_analysis/acervo-rc/src/lib/supabase.ts)
- [project_analysis/acervo-rc/src/hooks/useUpload.ts](project_analysis/acervo-rc/src/hooks/useUpload.ts)
- [project_analysis/acervo-rc/src/pages/UploadPage.tsx](project_analysis/acervo-rc/src/pages/UploadPage.tsx)

### Constantes de Upload
- `MAX_FILE_SIZE`: 5GB.
- `TUS_THRESHOLD`: 50MB (acima disso usa TUS resumable).
- `chunkSize` TUS: 5MB.

Arquivo relacionado:
- [project_analysis/acervo-rc/src/pages/UploadPage.tsx](project_analysis/acervo-rc/src/pages/UploadPage.tsx)

### Buckets e Storage
- Bucket principal: `acervo-files`.
- Pasta de thumbnails: `thumbnails/`.

Arquivo relacionado:
- [project_analysis/acervo-rc/src/pages/UploadPage.tsx](project_analysis/acervo-rc/src/pages/UploadPage.tsx)

### Edge Functions (Supabase)
- `init-upload`: inicia job e gera object_path.
- `finalize-upload`: grava catalogo_data e fecha job.

Arquivo relacionado:
- [project_analysis/acervo-rc/src/hooks/useUpload.ts](project_analysis/acervo-rc/src/hooks/useUpload.ts)

### RPCs/Views Criticas (Supabase)
- `get_dashboard_metrics`
- `count_by_status`
- `count_by_area`
- `count_by_tema`
- `get_upload_pipeline_stats`
- `get_localidades_stats`
- `search_catalogo`
- `v_catalogo_completo`
- `v_catalogo_ativo`

Arquivo relacionado:
- [project_analysis/acervo-rc/src/hooks/useQueries.ts](project_analysis/acervo-rc/src/hooks/useQueries.ts)
- [project_analysis/acervo-rc/src/pages/EditItemPage.tsx](project_analysis/acervo-rc/src/pages/EditItemPage.tsx)

### Tabelas e Integracao de Dados
- `catalogo_itens`: dados principais do acervo.
- `catalogo_audit`: trilha de auditoria.
- `upload_jobs`: estado do pipeline de upload.
- `taxonomy_categories` e `naming_rules`: taxonomias e regras.

### Autenticacao
- Sessao Supabase com refresh automatico antes de iniciar upload.

Arquivo relacionado:
- [project_analysis/acervo-rc/src/hooks/useUpload.ts](project_analysis/acervo-rc/src/hooks/useUpload.ts)

## Estado Atual (Paginas)
### LoginPage
- Status: modernizada com fundo de particulas Three.js e form central em glass-card.
- Riscos: alto custo grafico em devices fracos; gsap nao utilizado por enquanto.
- Arquivo: [project_analysis/acervo-rc/src/pages/LoginPage.tsx](project_analysis/acervo-rc/src/pages/LoginPage.tsx)

### DashboardPage
- Status: atualizado para cards em vidro, tipografia serifada e paleta dourado/verde.
- Necessario: manter consistencia visual com restantes das telas.
- Arquivo: [project_analysis/acervo-rc/src/pages/DashboardPage.tsx](project_analysis/acervo-rc/src/pages/DashboardPage.tsx)

### AcervoPage
- Status: atualizada para galeria em vidro escuro, busca editorial e cards com molduras e zoom sutil.
- Necessario: ajustar LocalidadePage e SearchPage para manter consistencia com a galeria.
- Arquivo: [project_analysis/acervo-rc/src/pages/AcervoPage.tsx](project_analysis/acervo-rc/src/pages/AcervoPage.tsx)

### LocalidadePage
- Status: atualizado para galeria em vidro escuro, filtros editoriais e botoes em dourado.
- Necessario: validar consistencia com o layout de Acervo.
- Arquivo: [project_analysis/acervo-rc/src/pages/LocalidadePage.tsx](project_analysis/acervo-rc/src/pages/LocalidadePage.tsx)

### MediaCard (componente)
- Status: transformado em moldura de vidro com overlay editorial, zoom e badges refinados.
- Necessario: manter consistencia em telas que usam MediaCard.
- Arquivo: [project_analysis/acervo-rc/src/components/MediaCard.tsx](project_analysis/acervo-rc/src/components/MediaCard.tsx)

### UploadPage
- Status: concluida com stepper, estados e formularios em vidro; logica TUS e taxonomia OK.
- Necessario: validar em devices mobile e desktop.
- Arquivo: [project_analysis/acervo-rc/src/pages/UploadPage.tsx](project_analysis/acervo-rc/src/pages/UploadPage.tsx)

### ItemDetailPage
- Status: atualizado para exposicao digital em vidro e modais editoriais.
- Necessario: validar contraste em imagens claras.
- Arquivo: [project_analysis/acervo-rc/src/pages/ItemDetailPage.tsx](project_analysis/acervo-rc/src/pages/ItemDetailPage.tsx)

### EditItemPage
- Status: atualizado para formulario editorial em vidro.
- Necessario: validar responsividade em mobile.
- Arquivo: [project_analysis/acervo-rc/src/pages/EditItemPage.tsx](project_analysis/acervo-rc/src/pages/EditItemPage.tsx)

### WorkflowPage
- Status: atualizado para kanban em vidro com paleta dourado/verde.
- Necessario: validar drag and drop em mobile.
- Arquivo: [project_analysis/acervo-rc/src/pages/WorkflowPage.tsx](project_analysis/acervo-rc/src/pages/WorkflowPage.tsx)

### SearchPage
- Status: atualizado para cards em vidro e busca editorial com selecao refinada.
- Necessario: checar contraste e legibilidade dos resultados.
- Arquivo: [project_analysis/acervo-rc/src/pages/SearchPage.tsx](project_analysis/acervo-rc/src/pages/SearchPage.tsx)

### WorkspacePage
- Status: atualizado para pastas e cards em vidro.
- Necessario: validar download ZIP em lotes grandes.
- Arquivo: [project_analysis/acervo-rc/src/pages/WorkspacePage.tsx](project_analysis/acervo-rc/src/pages/WorkspacePage.tsx)

### AdminPage
- Status: atualizado para central em vidro com ferramentas e tabelas em modo escuro, incluindo aba de usuarios.
- Necessario: revisar contraste em logs longos.
- Arquivo: [project_analysis/acervo-rc/src/pages/AdminPage.tsx](project_analysis/acervo-rc/src/pages/AdminPage.tsx)

## Diario de Mudancas (Ate Agora)
### 2026-02-04
- Tema global, tokens, utilitarios de vidro e grain overlay aplicados.
- Sidebar minimalista em vidro escuro.
- Glow verde no container principal.
- LoginPage com fundo de particulas Three.js e formulario em glass-card.
- Dependencias adicionadas: three e gsap.
- DashboardPage atualizado para cards em vidro, tipografia serifada e paleta dourado/verde.
- AcervoPage e MediaCard atualizados para galeria escura com overlay e tipografia editorial.

### 2026-02-05
- LocalidadePage atualizada para galeria escura com filtros editoriais e exportacao em vidro.
- SearchPage atualizada para cards em vidro e selecao refinada.
- UploadPage finalizada com stepper e restyle completo do fluxo de upload.
- ItemDetailPage e EditItemPage atualizados para exposicao e formulario em vidro.
- WorkflowPage, AdminPage e WorkspacePage atualizados para visual em vidro.
- Ajustes de contraste: texto secundario e bordas levemente reforcados.
- Ajustes de contraste: texto neutro 400 e scrollbar mais visiveis.
- Ajustes de contraste: bordas de vidro e inputs reforcadas.
- Ajustes de contraste: icones de estados vazios e hover refinados.
- Ajustes de contraste: modais e telas de erro/loader harmonizados ao tema escuro.
- Edge Functions: CORS ajustado para permitir Authorization explicitamente (evita aviso futuro de same-origin em init/finalize-upload).
- AdminPage: nova aba de Usuarios com cadastro, perfil (admin/editor/visualizador) e ativacao/desativacao.

Arquivos modificados:
- [project_analysis/acervo-rc/src/index.css](project_analysis/acervo-rc/src/index.css)
- [project_analysis/acervo-rc/src/styles/rc-tokens.css](project_analysis/acervo-rc/src/styles/rc-tokens.css)
- [project_analysis/acervo-rc/src/styles/rc-utilities.css](project_analysis/acervo-rc/src/styles/rc-utilities.css)
- [project_analysis/acervo-rc/src/components/Layout.tsx](project_analysis/acervo-rc/src/components/Layout.tsx)
- [project_analysis/acervo-rc/src/components/Sidebar.tsx](project_analysis/acervo-rc/src/components/Sidebar.tsx)
- [project_analysis/acervo-rc/src/pages/LoginPage.tsx](project_analysis/acervo-rc/src/pages/LoginPage.tsx)
- [project_analysis/acervo-rc/src/pages/DashboardPage.tsx](project_analysis/acervo-rc/src/pages/DashboardPage.tsx)
- [project_analysis/acervo-rc/src/pages/AcervoPage.tsx](project_analysis/acervo-rc/src/pages/AcervoPage.tsx)
- [project_analysis/acervo-rc/src/components/MediaCard.tsx](project_analysis/acervo-rc/src/components/MediaCard.tsx)
- [project_analysis/acervo-rc/src/pages/LocalidadePage.tsx](project_analysis/acervo-rc/src/pages/LocalidadePage.tsx)
- [project_analysis/acervo-rc/src/pages/SearchPage.tsx](project_analysis/acervo-rc/src/pages/SearchPage.tsx)
- [project_analysis/acervo-rc/src/pages/UploadPage.tsx](project_analysis/acervo-rc/src/pages/UploadPage.tsx)
- [project_analysis/acervo-rc/src/pages/ItemDetailPage.tsx](project_analysis/acervo-rc/src/pages/ItemDetailPage.tsx)
- [project_analysis/acervo-rc/src/pages/EditItemPage.tsx](project_analysis/acervo-rc/src/pages/EditItemPage.tsx)
- [project_analysis/acervo-rc/src/pages/WorkflowPage.tsx](project_analysis/acervo-rc/src/pages/WorkflowPage.tsx)
- [project_analysis/acervo-rc/src/pages/AdminPage.tsx](project_analysis/acervo-rc/src/pages/AdminPage.tsx)
- [project_analysis/acervo-rc/src/pages/WorkspacePage.tsx](project_analysis/acervo-rc/src/pages/WorkspacePage.tsx)

## Proximas Etapas (Plano Imediato)
1) Validacao final e ajustes finos de contraste.

## Plano de Acao (Reforma Visual)
Status: [Concluido], [Em andamento], [Pendente]

### Fase 1 - Fundacao Visual
- [Concluido] Tokens, tipografia, paleta e sombras (Luxo Digital).
- [Concluido] Grain overlay e utilitarios glass.
- [Concluido] Layout e Sidebar em vidro escuro.

### Fase 2 - Primeiras Paginas
- [Concluido] LoginPage com particulas e glass-card.
- [Concluido] DashboardPage com cards em vidro e tipografia editorial.
- [Concluido] AcervoPage + MediaCard (galeria em vidro, overlay e zoom).
- [Concluido] LocalidadePage (galeria e filtros editoriais).
- [Concluido] SearchPage (cards em vidro e selecao refinada).

### Fase 3 - Fluxo de Upload e Catalogacao
- [Concluido] UploadPage com steppers (Upload fisico, Catalogacao, Revisao).
- [Concluido] Revisao visual dos estados de upload (sucesso, erro, progresso).

### Fase 4 - Detalhe e Edicao
- [Concluido] ItemDetailPage (exposicao digital, fichas tecnicas em vidro).
- [Concluido] EditItemPage (formulario editorial em vidro).

### Fase 5 - Operacoes e Administracao
- [Concluido] WorkflowPage (kanban em vidro, cards com moldura).
- [Concluido] AdminPage (central de inteligencia em vidro).
- [Concluido] WorkspacePage (pastas e acoes em vidro).

### Fase 6 - Validacao Final
- [Em andamento] Revisao de contraste e legibilidade (desktop e mobile).
- [Concluido] Smoke test (login, upload pequeno e grande, workflow, busca, workspace).
- [Em andamento] Verificacao de consistencia visual entre paginas.

## Checkins de Qualidade (Obrigatorios)
- Integridade de dados: catalogo_audit ativo e registrando alteracoes.
- Performance: uploads grandes usando TUS resumable.
- Seguranca: RLS ativa para catalogo_itens, catalogo_audit e taxonomias.
- Consistencia: selects usando IDs corretos das tabelas de referencia.

## Inventario de Paginas e Fluxos (Mapeamento Rapido)
Este inventario serve para evitar regressao durante a reforma visual.

### Rotas Principais
- `/login`: autenticar usuario e iniciar sessao.
- `/`: dashboard com metricas, pipeline e itens recentes.
- `/acervo`: busca e galeria geral do acervo.
- `/acervo/:localidade`: itens por localidade com filtros e exportacao.
- `/busca`: busca global com selecao para pastas.
- `/trabalho`: pastas selecionadas e download em lote.
- `/upload`: envio de midias e catalogacao (editor).
- `/workflow`: kanban de status com drag and drop.
- `/item/:id`: detalhe do item e edicao rapida.
- `/item/:id/edit`: formulario completo de edicao.
- `/admin`: taxonomias, naming rules e ferramentas.

Arquivo base de rotas:
- [project_analysis/acervo-rc/src/App.tsx](project_analysis/acervo-rc/src/App.tsx)

### Fluxos Criticos
- Upload: init-upload -> TUS/storage -> finalize-upload -> audit/pipeline.
- Catalogacao: selects por ID + persistencia em catalogo_itens.
- Workflow: update de status com status_id e status.
- Auditoria: trigger em catalogo_itens escrevendo em catalogo_audit.

## Dependencias Funcionais (Nao quebrar)
### Hooks e Queries
- `useQueries.ts`: dashboard, buscas, localidades, workflow, item.
- `useUpload.ts`: init/finalize e refresh de sessao.
- `useTaxonomy.ts`: listas e options por ID.

Arquivos chave:
- [project_analysis/acervo-rc/src/hooks/useQueries.ts](project_analysis/acervo-rc/src/hooks/useQueries.ts)
- [project_analysis/acervo-rc/src/hooks/useUpload.ts](project_analysis/acervo-rc/src/hooks/useUpload.ts)
- [project_analysis/acervo-rc/src/hooks/useTaxonomy.ts](project_analysis/acervo-rc/src/hooks/useTaxonomy.ts)

### Components que NAO devem perder props/contratos
- `MediaCard`: usado no dashboard, acervo e outras telas.
- `AddToWorkspaceModal`: usado em Dashboard e Search.
- `VideoThumbnail` e `OptimizedImage`: usados em Localidade e MediaCard.

## Matriz de Risco (Visual vs Funcional)
### Risco Alto
- UploadPage: TUS, jobs, thumbnails e status do pipeline.
- WorkflowPage: drag and drop e update de status.
- ItemDetailPage: edicao rapida e delete com storage.

### Risco Medio
- AcervoPage: filtros e buscas por RPC.
- LocalidadePage: filtros, exportacao e virtualizacao.
- AdminPage: taxonomias e naming rules.

### Risco Baixo
- SearchPage, WorkspacePage: ajustes visuais sem logica critica.

## Politicas de Estilo (Aplicacao Responsavel)
- Alterar apenas classes, wrappers e layout visual.
- Manter seletores, IDs, handlers e callbacks existentes.
- Evitar mudancas em hooks, queries e mutations sem aprovacao.
- Evitar trocar ordem de efeitos que dependem de estados.

## Matriz de Consistencia de IDs
- `status_id` deve sempre corresponder a `status_nome`.
- `area_fazenda_id`, `ponto_id`, `tema_principal_id` e `tipo_projeto_id` devem usar options por ID.
- Nao usar nomes livres para campos que ja possuem ID.

Referencias:
- [project_analysis/acervo-rc/src/hooks/useTaxonomy.ts](project_analysis/acervo-rc/src/hooks/useTaxonomy.ts)
- [project_analysis/acervo-rc/src/pages/EditItemPage.tsx](project_analysis/acervo-rc/src/pages/EditItemPage.tsx)
- [project_analysis/acervo-rc/src/pages/ItemDetailPage.tsx](project_analysis/acervo-rc/src/pages/ItemDetailPage.tsx)

## Verificacoes antes de cada Merge
- Upload grande (>= 50MB) usa TUS e conclui.
- `upload_jobs` atualiza status (UPLOADING -> UPLOADED).
- `catalogo_audit` recebe inserts/updates/deletes.
- Search e filtros por ID continuam retornando resultados.
- Dashboard carrega RPCs sem erro.

## Plano de Testes (Minimo Viavel)
### Smoke Test
- Login e logout.
- Upload pequeno e grande.
- Navegar por acervo, localidade e item.
- Atualizar status via workflow.
- Adicionar itens a pasta e baixar ZIP.

## Checklist de Smoke Test (Execucao Manual)
1) Login
- Acessar /login, autenticar, validar redirecionamento para dashboard.

2) Dashboard
- Carregar metricas sem erro.
- Abrir busca completa e retornar.

3) Acervo e Localidade
- Buscar termo no Acervo e abrir um item.
- Entrar em uma localidade e validar filtros + paginação.

4) ItemDetail e EditItem
- Abrir item e verificar preview (imagem/video) e download.
- Fazer edicao rapida e salvar.
- Acessar /item/:id/edit e salvar alteracoes.

5) Upload
- Upload pequeno (<50MB) e confirmar salvamento.
- Upload grande (>=50MB) usando TUS e confirmar status.

6) Workflow
- Arrastar item entre colunas e validar atualizacao.

7) Workspace
- Criar pasta, adicionar item, baixar ZIP e remover item.

8) Admin
- Atualizar taxonomia e regra de nomenclatura.
- Rodar process-outbox/reconcile-uploads e validar logs.

### Execucao parcial (2026-02-05)
- Login com SIGNED_IN e redirecionamento OK.
- Dashboard carregou metricas e consultas principais sem erro.
- Workspace: criacao de pasta e inclusao de itens OK.
- Uploads pequenos (storage + thumbnails) OK; finalize-upload executou.
- Aviso de CORS (Access-Control-Allow-Headers='*') resolvido apos deploy das Edge Functions.

### Visual Regression Manual
- Conferir contraste e legibilidade em tema escuro.
- Verificar glass-card e blur nao comprometer performance.
- Validar responsividade (mobile e desktop).

## Estrategia de Reversao
- Manter commits por pagina para rollback rapido.
- Atualizar este documento ao final de cada etapa.

## Lista de Variaveis Visuais Permitidas
- Cores: `--rc-bg`, `--rc-gold`, `--rc-green`, `--rc-text`, `--rc-text-muted`, `--rc-border`.
- Tipografia: `--rc-font-sans`, `--rc-font-serif`.
- Glass: `glass`, `glass-dark`, `glass-card`, `rc-card`.
- Effects: `grain-overlay`, `shimmer`, `card-hover`.

## Inventario Seguro (Sem Segredos)
Esta secao lista caminhos e configuracoes sem valores sensiveis.

### Variaveis de Ambiente (Sem Valores)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### Locais de Configuracao
- Cliente Supabase: [project_analysis/acervo-rc/src/lib/supabase.ts](project_analysis/acervo-rc/src/lib/supabase.ts)
- Upload e headers de auth: [project_analysis/acervo-rc/src/hooks/useUpload.ts](project_analysis/acervo-rc/src/hooks/useUpload.ts)
- Fluxo TUS e storage: [project_analysis/acervo-rc/src/pages/UploadPage.tsx](project_analysis/acervo-rc/src/pages/UploadPage.tsx)
- QueryClient e ErrorBoundary: [project_analysis/acervo-rc/src/main.tsx](project_analysis/acervo-rc/src/main.tsx)

### Caminhos de Acesso (Sem Credenciais)
- Supabase (projeto): configurado via VITE_SUPABASE_URL.
- Storage bucket: acervo-files.
- Functions: init-upload, finalize-upload.
- RPCs: get_dashboard_metrics, count_by_status, count_by_area, count_by_tema, get_upload_pipeline_stats, get_localidades_stats, search_catalogo.

## Procedimentos de Segredos (Armazenamento e Rotacao)
### Armazenamento seguro
- Manter segredos em .env local e variaveis do provedor (Vercel/host).
- Nunca commitar valores reais no repositorio.

### Rotacao recomendada
- Rotacionar VITE_SUPABASE_ANON_KEY em caso de vazamento.
- Verificar impacto em clientes e reimplantar.

### Validações apos rotacao
- Login e refresh de sessao.
- Upload TUS e finalize-upload.
- Queries do dashboard e acervo.

## Checklist Rapido - Auditoria de Segredos (Pre-Deploy)
### Antes do deploy
- Confirmar que nao ha valores reais em arquivos versionados.
- Validar que o `.env` local nao foi adicionado ao git.
- Conferir que os valores de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estao configurados apenas no provedor.

### Durante o deploy
- Confirmar que variaveis foram lidas no build (sem imprimir valores em logs).
- Garantir que secrets nao aparecem em logs ou erros do frontend.

### Depois do deploy
- Testar login e refresh de sessao.
- Testar upload pequeno e grande (TUS).
- Testar consultas principais (dashboard, acervo, buscas).
