# 🏛️ BIBLIOTECA - Acervo Digital RC Agropecuária + Mundo Virtual Villa Canabrava

**Versão:** 2.0 | **Status:** FASE 0 ✅ Concluída | FASE 1 ✅ Aprovada | FASE 2 📋 Pronta para Execução
**Última Atualização:** 6 de Fevereiro de 2026
**Gestor Tecnológico:** Roo (Braço Direito de Roberth Naninne de Souza)

---

## 🚀 SUA PRÓXIMA AÇÃO

### ✅ Fase 0 e Fase 1 foram Aprovadas!

Você tem três caminhos agora:

**Caminho 1: Quero entender as fases anteriores**
- 👉 Leia: [`docs/QUICK_START_FASE_0.md`](docs/QUICK_START_FASE_0.md) (Fase 0 - 5 min)

**Caminho 2: Quero COMEÇAR a Fase 2 (MVP Development)**
- 👉 Leia: [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md) (10 min)
- 📋 Detalhes: [`PROMPT_EXECUCAO_FASE_2.md`](PROMPT_EXECUCAO_FASE_2.md) (Tarefas 4 semanas)
- 📊 Dashboard: [`plans/FASE_2_STATUS.json`](plans/FASE_2_STATUS.json) (Tracking semanal)

**Caminho 3: Sou validador externo de Fase 2**
- 👉 Use: [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md) (Checklist QA)

**Caminho 4: Preciso recapitular Fase 1 (já aprovada)**
- 👉 Referência: [`FASE_1_READY_FOR_EXECUTION.md`](FASE_1_READY_FOR_EXECUTION.md)
- 📋 Detalhes: [`PROMPT_EXECUCAO_FASE_1.md`](PROMPT_EXECUCAO_FASE_1.md)

---

## 📌 O QUE É ESTE PROJETO?

Este projeto integra duas iniciativas estratégicas:

1. **Sistema de Acervo RC Agropecuária** - Biblioteca digital com React + Supabase (Fases 0-6 de modernização)
2. **Mundo Virtual Villa Canabrava** - Plataforma imersiva com dados geoespaciais, modelos 3D e narrativas (Roadmap 5 fases)

**Objetivo Central:** Criar um universo virtual durable que documente, preserve e permita exploração interativa do patrimônio histórico, ambiental e cultural de Villa Canabrava.

---

## 🎯 FASE 0 - PREPARAÇÃO ✅ CONCLUÍDA

**Duração:** 4 semanas | **Status:** ✅ APROVADA pela validação externa (2026-02-05)

### ✅ Entregáveis da Fase 0

| Artefato | Arquivo | Status | Descrição |
|----------|---------|--------|-----------|
| **Plano Estratégico** | [`plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md`](plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md) | ✅ | Roadmap 3 anos, 5 macro-fases, métricas |
| **Validação GIS** | [`tools/validate_gis_data.py`](tools/validate_gis_data.py) | ✅ | Script para 252 arquivos KML |
| **Estrutura Acervo** | [`docs/ESTRUTURA_ACERVO_HISTORICO.md`](docs/ESTRUTURA_ACERVO_HISTORICO.md) | ✅ | Taxonomia 5 categorias + metadados |
| **Import KML** | [`tools/import_kml_batch.py`](tools/import_kml_batch.py) | ✅ | Pipeline PostgreSQL + PostGIS |
| **Runbook Execução** | [`docs/RUNBOOK_FASE_0_EXECUCAO.md`](docs/RUNBOOK_FASE_0_EXECUCAO.md) | ✅ | Instruções passo a passo |
| **Setup Automation** | `tools/SETUP_DEVENV.sh` + `tools/SETUP_DEVENV.bat` | ✅ | Ambiente automatizado Windows/Linux |

---

## ✅ FASE 1 - FUNDAÇÃO (Concluída)

**⏰ Duração:** 4 semanas (2026-02-06 até 2026-02-13)
**🎯 Status:** ✅ APROVADA pela validação externa

### 🎯 Objetivos Fase 1

1. ✅ Validar integridade de 252 arquivos KML (GIS validation)
2. ✅ Estruturar acervo histórico (5 categorias + 20+ subcategorias)
3. ✅ Configurar infraestrutura PostgreSQL + PostGIS
4. ✅ Importar 252 KML em lote para geospatial database (>50k features)
5. ✅ Gerar reports consolidados + GO/NO-GO para Fase 2

### 📋 Documentos Fase 1

| Documento | Propósito | Quando Usar |
|-----------|----------|-----------|
| [`FASE_1_READY_FOR_EXECUTION.md`](FASE_1_READY_FOR_EXECUTION.md) | 📍 Início rápido Fase 1 | ANTES de começar |
| [`PROMPT_EXECUCAO_FASE_1.md`](PROMPT_EXECUCAO_FASE_1.md) | 📋 Tarefas + Critérios (4 semanas) | Durante execução |
| [`plans/FASE_1_STATUS.json`](plans/FASE_1_STATUS.json) | 📊 Dashboard tracking semanal | Toda semana |
| [`PROMPT_VALIDACAO_FASE_1.md`](PROMPT_VALIDACAO_FASE_1.md) | 🔍 Validação externa QA | Fim de cada semana |

### 📋 Entregáveis Fase 1

- [x] GIS Validation Report (252 arquivos KML validados)
- [x] Acervo Structure (50+ pastas organizadas)
- [x] PostgreSQL + PostGIS schema criado
- [x] KML import pipeline funcional
- [x] Consolidação de reports

**[Ver detalhes de Fase 1](FASE_1_READY_FOR_EXECUTION.md)**

---

## 🚀 FASE 2 - MVP Development (React + 3D + GIS)

**⏰ Duração:** 4 semanas (2026-02-13 até 2026-03-13)
**🎯 Status:** 📋 PRONTA PARA EXECUÇÃO

### 🎯 Objetivos Fase 2

1. ✅ React 18 + TypeScript app com Vite (localhost:5173)
2. ✅ Supabase schema com 6 tabelas + RLS policies
3. ✅ Biblioteca Digital (Search, Filter, View)
4. ✅ Museu Virtual 3D (Three.js + modelo Blender)
5. ✅ Mapa GIS interativo (Leaflet + 252 camadas)
6. ✅ API integrada (React Query + Supabase)
7. ✅ Testes (Vitest 8+ testes, 70%+ coverage)

### 📋 Documentos Fase 2

| Documento | Propósito | Quando Usar |
|-----------|----------|-----------|
| [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md) | 📍 Início rápido Fase 2 | ANTES de começar |
| [`PROMPT_EXECUCAO_FASE_2.md`](PROMPT_EXECUCAO_FASE_2.md) | 📋 Tarefas + Critérios (4 semanas) | Durante execução |
| [`plans/FASE_2_STATUS.json`](plans/FASE_2_STATUS.json) | 📊 Dashboard tracking semanal | Toda semana |
| [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md) | 🔍 Validação externa QA | Fim de cada semana |

### 🔄 Fluxo Fase 2

1. **Leia** [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md) - Guia rápido
2. **Execute** tarefas Semana 1-4 conforme [`PROMPT_EXECUCAO_FASE_2.md`](PROMPT_EXECUCAO_FASE_2.md)
3. **Implemente** componentes, 3D, mapa conforme checklist
4. **Teste** com Vitest (8+ testes, 70%+ coverage)
5. **Valide** com agente externo usando [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)
6. **Decida** GO/NO-GO com Roberth Naninne
7. **Prossiga** para Fase 3 se GO

### 📚 Pré-requisitos Fase 2

- ✅ Node.js 18+
- ✅ npm ou pnpm
- ✅ Docker Desktop
- ✅ Supabase CLI
- ✅ Blender 4.0+ (para modelos 3D)
- ✅ Git

### Fase 3 Preview: Advanced Features & Optimization

**Foco:** Autenticação, uploads, busca avançada, otimizações
- User authentication com Supabase Auth
- Upload de arquivos para acervo
- Full-text search avançada
- Performance optimization (lazy loading, caching)
- Progressive Web App (PWA)
- Mobile responsiveness

---

## 📂 ESTRUTURA DO REPOSITÓRIO

```
BIBLIOTECA/
│
├── 📋 README.md (este arquivo)
├── .gitignore
├── vercel.json
│
├── 📂 plans/
│   ├── PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md
│   ├── FASE_0_STATUS.json
│   ├── FASE_1_STATUS.json
│   └── FASE_2_STATUS.json
│
├── 📂 docs/
│   ├── PROJETO_ACERVO_RC.md                      (Spec técnica existente)
│   ├── plano-modernizacao-execucao.md            (Fases 0-6 Acervo)
│   ├── ESTRUTURA_ACERVO_HISTORICO.md             (Taxonomia de 5 categorias)
│   ├── RUNBOOK_FASE_0_EXECUCAO.md                (Instruções passo-a-passo)
│   ├── SUPABASE_SCHEMA_DESIGN_FASE_2.md          (Schema para Fase 2)
│   ├── design/                                   (Assets de design)
│   ├── migrations/                               (SQL migrations)
│   ├── legacy-src/                               (Código anterior)
│   └── runbooks/                                 (Documentação operacional)
│
├── 📂 tools/
│   ├── validate_gis_data.py                      (Validação 252 KML)
│   ├── import_kml_batch.py                       (Import PostgreSQL)
│   ├── process-outbox-task.ps1                   (Script existente)
│   └── supabase/                                 (CLI Supabase)
│
├── 📂 supabase/
│   ├── config.toml                               (Configuração)
│   ├── functions/                                (Edge Functions)
│   └── migrations/                               (Evolução schema)
│
├── 📂 project_analysis/
│   ├── acervo-rc/                                (App React anterior)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── docs/                                     (Design specs)
│   └── *.png                                     (Mockups design)
│
├── 📂 frontend/                                  (NOVO: React app Fase 2)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── main.tsx
│   ├── public/
│   ├── models/                                   (3D models)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📂 pasra_site/
│   ├── index.html                                (Site vitrine)
│   ├── assets/css/
│   └── assets/js/
│
├── 📂 assets/
│   └── (Mídia do projeto)
│
├── reports/                                      (Relatórios JSON)
│   ├── GIS_VALIDATION_REPORT.json
│   ├── FASE_1_CONSOLIDACAO.json
│   └── FASE_2_CONSOLIDACAO.json (será criado)
│
└── 📂 .venv/ (Ambiente Python - não commitar)
```

---

## 🔧 SETUP E INSTALAÇÃO

### Pré-requisitos

- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL 15 + PostGIS 3.4** (ou Docker)
- **Docker** (recomendado para DB local)
- **Git** (controle de versão)
- **Supabase CLI** (para Fase 2+)

### Instalação Rápida

```bash
# 1. Clonar repositório
git clone <repo-url>
cd BIBLIOTECA

# 2. Setup Python (validação GIS + importação)
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-gis.txt

# 3. Setup Node.js (React app Fase 2)
cd frontend
npm install
npm run dev  # Inicia em http://localhost:5173

# 4. Setup Supabase (Docker)
cd ..
supabase init
supabase start

# 5. Validar dados GIS (Fase 1)
python tools/validate_gis_data.py

# 6. Importar KML para PostgreSQL (Fase 1)
python tools/import_kml_batch.py
```

---

## 📖 GUIAS PRINCIPAIS

### Para Gestão Estratégica
→ Leia: [`plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md`](plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md)

**Cobre:**
- Visão 3 anos em 5 macro-fases
- Stack tecnológico completo
- Custos de infraestrutura (AWS/On-Prem)
- Riscos e mitigações
- Métricas de sucesso

### Para Execução de Tarefas (Fase 2)
→ Leia: [`PROMPT_EXECUCAO_FASE_2.md`](PROMPT_EXECUCAO_FASE_2.md)

**Inclui:**
- Checklist executivo (4 semanas)
- Passo-a-passo para React + Supabase
- Setup de componentes e 3D
- Testes com Vitest
- Consolidação e GO/NO-GO

### Para Organização de Acervo
→ Leia: [`docs/ESTRUTURA_ACERVO_HISTORICO.md`](docs/ESTRUTURA_ACERVO_HISTORICO.md)

**Detalha:**
- 5 categorias de acervo
- 20+ subcategorias
- Metadados por tipo
- Integração com PostgreSQL
- Métricas de completude

### Para Especificação Técnica (Acervo RC)
→ Leia: [`docs/PROJETO_ACERVO_RC.md`](docs/PROJETO_ACERVO_RC.md)

**Stack atual:**
- React 18 + TypeScript
- Supabase (DB + Auth + Storage)
- Tailwind CSS + shadcn UI
- 25+ campos de catalogação

---

## 🚀 COMEÇAR AGORA

### Cenário 1: Sou Gestor/Stakeholder
1. Leia [`plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md`](plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md) - **10 minutos**
2. Aprove decisões de infraestrutura (Cloud vs On-Prem)
3. Confirme timeline das fases

### Cenário 2: Sou Desenvolvedor Iniciando Fase 2
1. Leia [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md) - **10 minutos**
2. Verifique pré-requisitos: Node 18+, Docker, Supabase CLI
3. Execute `npm create vite@latest frontend -- --template react-ts` (Tarefa 1.1)
4. Siga tarefas Semana 1-4 em [`PROMPT_EXECUCAO_FASE_2.md`](PROMPT_EXECUCAO_FASE_2.md)
5. Valide com [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)

### Cenário 3: Sou Arquivista/Curador
1. Estude [`docs/ESTRUTURA_ACERVO_HISTORICO.md`](docs/ESTRUTURA_ACERVO_HISTORICO.md)
2. Crie estrutura de diretórios (Fase 1 já completa)
3. Comece catalogação com metadados mínimos
4. Valide INDEX.csv em cada pasta

### Cenário 4: Sou Validador Externo de Fase 2
1. Leia [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)
2. Siga checklist de aprovação
3. Emita parecer: GO / GO WITH RISK / NO-GO

---

## 📊 STATUS DE IMPLEMENTAÇÃO

```
FASE 0 - PREPARAÇÃO
├─ Análise Inicial ............................ ✅ COMPLETO
├─ Plano Estratégico .......................... ✅ COMPLETO
├─ Validação GIS ............................. ✅ COMPLETO (252 KML)
├─ Organização Acervo ......................... ✅ COMPLETO (50+ pastas)
├─ Setup PostgreSQL ........................... ✅ COMPLETO (PostGIS)
├─ Importação KML ............................ ✅ COMPLETO (>50k features)
├─ Consolidação Documental ................... ✅ COMPLETO
└─ Aprovação GO/NO-GO para Fase 1 ........... ✅ APROVADO (2026-02-13)

FASE 1 - FUNDAÇÃO (GIS + Acervo)
├─ GIS Validation Report ..................... ✅ COMPLETO
├─ Acervo Structure (5 cat + 20+ subcat) .... ✅ COMPLETO
├─ PostgreSQL + PostGIS ...................... ✅ COMPLETO
├─ KML Import Pipeline ....................... ✅ COMPLETO
└─ Aprovação GO/NO-GO para Fase 2 ........... ✅ APROVADO (2026-02-13)

FASE 2 - MVP DEVELOPMENT (React + 3D + GIS) ⏳ PRONTA PARA EXECUÇÃO
├─ React 18 + TypeScript ..................... 📋 READY (iniciar Semana 1)
├─ Supabase Schema Design .................... 📋 READY (iniciar Semana 1)
├─ Component Library .......................... 📋 READY (iniciar Semana 2)
├─ Biblioteca Digital ........................ 📋 READY (iniciar Semana 2)
├─ 3D Museum Viewer .......................... 📋 READY (iniciar Semana 3)
├─ GIS Interactive Map ....................... 📋 READY (iniciar Semana 3)
├─ API Integration + Testing ................. 📋 READY (iniciar Semana 4)
└─ Aprovação GO/NO-GO para Fase 3 ........... ⏳ AGUARDANDO EXECUÇÃO

FASES 3-5 (Ano 2-3+) ........................ 📋 PLANEJADAS
```

---

## 🔐 Dados Geoespaciais - Estatísticas

| Métrica | Valor |
|---------|-------|
| **Arquivos KML** | 252 |
| **Features Totais** | ~50,000 (est.) |
| **Área Total** | 7.729,26 ha |
| **Camadas Mapeadas** | 19 tipos |
| **Status Validação** | ✅ Completo |

**Principais Categorias:**
- 🌲 Matas: 89 arquivos
- 🏘️ Edificações: 12 arquivos
- 💧 Hídrico (rios, brejos): 20 arquivos
- 🚜 Infraestrutura agrícola: 35+ arquivos
- 📍 Diversos: 96 arquivos

---

## 💾 Banco de Dados - Arquitetura

```
PostgreSQL + PostGIS (Fase 1)
├── Schema: gis_data
│   ├── features (50k+ registros)
│   ├── layers (19 camadas)
│   └── índices GIST (busca espacial)
│
├── Schema: museu_content
│   ├── acervo_itens (5.000+ registros)
│   ├── collections (exposições)
│   └── full-text search (português)
│
└── Schema: user_management
    ├── profiles
    ├── permissions
    └── audit_log

Supabase (Fase 2+)
├── Schema: public (RLS enabled)
│   ├── users
│   ├── localidades (GIS from Fase 1)
│   ├── catalogos (Acervo items)
│   ├── collections (User collections)
│   ├── models_3d (Museum content)
│   └── gis_layers (Interactive map)
│
├── Storage:
│   ├── acervo-files (documents, photos, etc)
│   ├── 3d-models (Blender exports)
│   └── thumbnails (cached images)
│
└── Functions (RPC):
    ├── search_catalogos()
    ├── get_localidade_catalogos()
    └── get_user_collections()
```

**Capacidade Estimada:** 10.000 usuários simultâneos, 1M+ registros

---

## 🤝 Contribuindo

### Processo de Contribuição

1. **Branch naming:** `feature/`, `fix/`, `docs/`
2. **Commits:** Mensagens descritivas em português
3. **Pull requests:** Revisão obrigatória
4. **Testes:** Validação GIS em lote antes de merge (Fase 1), Vitest para componentes (Fase 2+)

### Padrões de Código

- **Python:** PEP-8, type hints, docstrings
- **TypeScript:** ESLint + Prettier, strict mode
- **SQL:** Normalized schemas, índices explícitos
- **Markdown:** Referências com clickable links

---

## 📞 Contatos e Responsabilidades

| Função | Responsável | Contato |
|--------|-------------|---------|
| **Diretor do Projeto** | Roberth Naninne de Souza | - |
| **Tech Lead / Arquiteto** | Roo | Documentação |
| **Frontend Developer (Fase 2)** | (A Designar) | - |
| **DBA / Infrastructure** | (A Designar) | - |
| **GIS Specialist** | (A Designar) | - |
| **3D Artist / Blender** | (A Designar) | - |
| **Arquivista / Curador** | Maria Silva (Est.) | - |

---

## 📚 Referências e Documentação Externa

- **Documentação Oficial Completa:** `c:/Users/rober/Downloads/Documentação Auxiliar Mundo Virtual Villa/`
- **Arquivo KML Raw:** `...03_INTELIGENCIA_GEOESPACIAL/KML_RAW/` (252 arquivos)
- **Análises de Dados:** `...02_DATA_LAKE_E_ANALISES/` (CSV, JSON)
- **Roadmaps de Implementação:** `...07_ROADMAP_IMPLEMENTACAO_ATEMPORAL.md`

---

## 🎓 Cronograma de Implementação

```
2026 FEVEREIRO
FEV 06   - ✅ Entrega Plano Estratégico + Scripts (Fase 0)
FEV 13   - ✅ Validação GIS 100% (Fase 1)
FEV 13   - ✅ Aprovação GO/NO-GO Fase 1
FEV 13   - 📋 INÍCIO FASE 2 (MVP Development)

2026 MARÇO
MAR 06   - 📋 Conclusão Semana 2 Fase 2 (Components + Biblioteca Digital)
MAR 13   - 📋 Conclusão Semana 3 Fase 2 (3D Museum + GIS Map)
MAR 20   - 📋 Conclusão Semana 4 Fase 2 (API + Testing + GO/NO-GO)
MAR 20   - 🎯 FASE 2 Aprovada → Prosseguir para Fase 3

2026 ABRIL-JUNHO
ABR-JUN  - 📋 FASE 3 (Advanced Features & Optimization)
  - User authentication
  - File uploads
  - Advanced search
  - Performance optimization
  - PWA setup

2026 JULHO-DEZ
JUL-DEZ  - 📋 FASE 4 (Integration & Storytelling)
  - Multi-media narratives
  - Interactive timelines
  - User collections
  - Social sharing

2027+    - 📋 FASE 5+ (VR/AR, AI, Metaverse)
```

---

## ❓ FAQ

**P: Por onde começamos?**
R: Leia [`docs/QUICK_START_FASE_0.md`](docs/QUICK_START_FASE_0.md) (Fase 0) ou [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md) (para começar Fase 2 agora). Escolha seu perfil e siga instruções específicas.

**P: Quanto vai custar?**
R: AWS ~$5.550/mês (produção), Docker local gratuito para desenvolvimento. Fase 2 usa Supabase ~$300/mês.

**P: Quanto tempo leva?**
R: Fase 0 = 4 semanas (✅ feito), Fase 1 = 4 semanas (✅ feito), Fase 2 = 4 semanas (pronta). MVP total = 6 meses de calendário.

**P: Preciso de expertise em 3D?**
R: Não inicialmente. Fase 2 usa fotogrametria semi-automática. Expertise 3D recomendada para Fase 3+.

**P: E os dados já existentes?**
R: ✅ 252 KML já mapeados, validação completa, importação implementada e testada.

**P: Como acompanho o progresso de Fase 2?**
R: Via [`plans/FASE_2_STATUS.json`](plans/FASE_2_STATUS.json). Atualizado semanalmente com status de cada tarefa (4 semanas, Semana 1-4).

**P: Posso começar a executar Fase 2 hoje mesmo?**
R: Sim! Se você é Dev/Tech Lead, comece lendo [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md) e depois execute Tarefa 1.1 em [`PROMPT_EXECUCAO_FASE_2.md`](PROMPT_EXECUCAO_FASE_2.md).

**P: O que preciso para Fase 2?**
R: Node.js 18+, Docker, Supabase CLI, Blender 4.0+ (opcional). Detalhes em [`FASE_2_READY_FOR_EXECUTION.md`](FASE_2_READY_FOR_EXECUTION.md).

---

## 📝 Notas Importantes

⚠️ **Antes de começar Fase 2:**
- [ ] Verificar Node.js 18+ instalado
- [ ] Docker desktop funcionando
- [ ] Supabase CLI instalado
- [ ] Máquina com 8GB+ RAM recomendada

⚠️ **Padrões críticos:**
- **Null_Fields < 5%** em dados geoespaciais (Fase 1 ✅)
- **Overlap_Area = 0** sem sobreposições (Fase 1 ✅)
- **Erro_Posicional < 1m** WGS84 (Fase 1 ✅)
- **TypeScript strict mode** obrigatório (Fase 2)
- **Test coverage > 70%** para componentes críticos (Fase 2)
- **Bundle size < 500KB** (Fase 2 target)

⚠️ **Exportabilidade:**
Todos os dados em formatos abertos (GeoJSON, CSV, JSON)  
Sem lock-in de vendor  
Replicável em outras propriedades

---

## 📄 Licença

Propriedade intelectual: RC Agropecuária  
Uso: Documentação interna + Comunidade (future)

---

## 🔗 Navegação Rápida por Fase

| Fase | Status | Início | Documentos |
|------|--------|--------|-----------|
| **Fase 0** | ✅ Concluída | 2026-01-XX | [Estratégia](plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md) |
| **Fase 1** | ✅ Aprovada | 2026-02-06 | [Ready](FASE_1_READY_FOR_EXECUTION.md) \| [Execução](PROMPT_EXECUCAO_FASE_1.md) \| [Status](plans/FASE_1_STATUS.json) |
| **Fase 2** | 📋 Pronta | 2026-02-13 | [Ready](FASE_2_READY_FOR_EXECUTION.md) \| [Execução](PROMPT_EXECUCAO_FASE_2.md) \| [Status](plans/FASE_2_STATUS.json) \| [Validação](PROMPT_VALIDACAO_FASE_2.md) |
| **Fase 3** | 🔄 Planejada | 2026-03-20 | Documentação em preparação |
| **Fases 4-5** | 📋 Roadmap | 2026+ | Ver plano estratégico |

---

**Preparado com atenção aos detalhes organizacionais.**  
**Foco em durable design, escalabilidade e preservação do patrimônio.**

**Última Atualização:** 6 de Fevereiro de 2026  
**Versão:** 2.0 | **Status:** Fase 2 Pronta para Execução ✅
