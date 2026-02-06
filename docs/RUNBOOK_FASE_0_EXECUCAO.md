# 🏃 RUNBOOK - FASE 0: PREPARAÇÃO E FUNDAÇÃO
## Guia de Execução Passo a Passo

**Versão:** 1.0  
**Data:** 06 de Fevereiro de 2026  
**Responsável pela Execução:** Equipe de Tecnologia  
**Duração Estimada:** 4 semanas  

---

## 📌 CHECKLIST EXECUTIVO

### Semana 1: Validação GIS e Organização
- [ ] Executar `validate_gis_data.py` em todos os 252 KML
- [ ] Revisar relatório de validação
- [ ] Identificar e documentar anomalias
- [ ] Criar estrutura de diretórios do ACERVO_HISTORICO
- [ ] Preparar plano de catalogação de documentos

### Semana 2: Setup de Infraestrutura
- [ ] Provisionar PostgreSQL + PostGIS (AWS RDS ou Docker local)
- [ ] Validar conexão e permissões
- [ ] Criar schemas: `gis_data`, `museu_content`, `user_management`
- [ ] Executar `import_kml_batch.py` - teste com 5 KML
- [ ] Verificar integridade dos dados importados

### Semana 3: Consolidação Documental
- [ ] Copiar documento oficial de implementação para `/docs`
- [ ] Sincronizar nomes e convenções de nomenclatura
- [ ] Consolidar scripts Python em `/tools`
- [ ] Atualizar README.md do projeto

### Semana 4: Validação e Aprovação
- [ ] Gerar relatórios finais (GIS + Importação)
- [ ] Executar testes de integridade
- [ ] Documentar lições aprendidas
- [ ] Aprovação GO/NO-GO para Fase 1

---

## 🔍 TAREFA 1: VALIDAÇÃO GIS (Semana 1)

### Objetivo
Validar qualidade dos 252 arquivos KML conforme padrões:
- ✅ Null_Fields < 5%
- ✅ Overlap_Area = 0
- ✅ Topology_Errors = 0
- ✅ Erro_Posicional < 1m

### Passo 1.1: Preparar Ambiente Python

```bash
# Navegar para diretório do projeto
cd c:\Users\rober\Downloads\BIBLIOTECA

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate

# Instalar dependências
pip install geopandas shapely sqlalchemy psycopg2-binary lxml pandas

# Verificar instalação
python -c "import geopandas; print(f'GeoPandas {geopandas.__version__}')"
```

### Passo 1.2: Executar Validação

```bash
# Executar script de validação
python tools/validate_gis_data.py

# Esperado: Processará 252 KML e gerará relatório em reports/GIS_VALIDATION_REPORT.json
```

**Tempo Estimado:** 30-60 minutos (depende de I/O de disco)

### Passo 1.3: Analisar Relatório

```bash
# Visualizar resumo (usar PowerShell ou Python)
python -c "
import json
with open('reports/GIS_VALIDATION_REPORT.json') as f:
    report = json.load(f)
    print(f\"Total Files: {report['metadata']['total_files']}\")
    print(f\"Total Features: {report['metadata']['total_features']}\")
    print(f\"Valid: {report['summary']['valid']}\")
    print(f\"Warnings: {report['summary']['warnings']}\")
    print(f\"Errors: {report['summary']['errors']}\")
"
```

### Passo 1.4: Ações Corretivas (se necessário)

**Se há erros de topologia (self-intersections):**
```python
# Usar QGIS ou script customizado para corrigir
# Ver: tools/debug_kml.py (já existente)
python ../../Downloads/Documentaçao\ Auxiliar\ Mundo\ Virtual\ Villa/00_DOCUMENTACAO_OFICIAL_V2/03_INTELIGENCIA_GEOESPACIAL/debug_kml.py
```

**Se há overlaps (improvável, mas verificar):**
```
Usar PostGIS ST_Overlaps() após importação para validação final
```

---

## 📂 TAREFA 2: ORGANIZAÇÃO DE ACERVO (Semana 1)

### Objetivo
Criar estrutura taxonomia para 5 categorias de acervo

### Passo 2.1: Criar Estrutura de Diretórios

**Windows (PowerShell):**
```powershell
$baseDir = "C:\Users\rober\Downloads\BIBLIOTECA\acervo\ACERVO_HISTORICO"

# Criar diretórios raiz
New-Item -ItemType Directory -Path "$baseDir\01_DOCUMENTOS_TEXTUAIS\CONTRATOS_E_ESCRITURAS\{1970,1980,1990,2000,2010,2020}" -Force
New-Item -ItemType Directory -Path "$baseDir\01_DOCUMENTOS_TEXTUAIS\REGISTROS_ADMINISTRATIVOS\{LIVROS_CAIXA,FOLHAS_PAGAMENTO,INVENTARIOS}" -Force
New-Item -ItemType Directory -Path "$baseDir\01_DOCUMENTOS_TEXTUAIS\{CORRESPONDENCIAS,RELATORIOS_TECNICOS,ATAS_E_DECISOES,LEGISLACAO_APLICAVEL}" -Force

New-Item -ItemType Directory -Path "$baseDir\02_FOTOGRAFIAS\{AEREAS,INFRAESTRUTURA,ATIVIDADES_OPERACIONAIS,PESSOAS}" -Force
New-Item -ItemType Directory -Path "$baseDir\02_FOTOGRAFIAS\AEREAS\{1970,1980,1990,2000,2010,2020}" -Force

New-Item -ItemType Directory -Path "$baseDir\03_AUDIOVISUAL\{VIDEOS_DOCUMENTAIS,ENTREVISTAS,REGISTROS_DE_EVENTOS,TIMELAPSES_E_COMPOSICOES,AUDIO}" -Force
New-Item -ItemType Directory -Path "$baseDir\03_AUDIOVISUAL\REGISTROS_DE_EVENTOS\{VAQUEJADAS,EXPOSICOES,FESTAS_COMUNITARIAS}" -Force

New-Item -ItemType Directory -Path "$baseDir\04_MAPAS\{MAPAS_HISTORICOS,MAPAS_CADASTRAIS,MAPAS_TEMATICOS}" -Force

New-Item -ItemType Directory -Path "$baseDir\05_OBJETOS_DIGITAIS\{MODELOS_3D,PANORAMICAS_360,ASSETS_GRAFICOS,DADOS_GEOESPACIAIS}" -Force
New-Item -ItemType Directory -Path "$baseDir\05_OBJETOS_DIGITAIS\MODELOS_3D\{EDIFICIOS,INFRAESTRUTURA,AMBIENTE}" -Force

New-Item -ItemType Directory -Path "$baseDir\00_INDICE_MESTRE" -Force

Write-Host "✅ Estrutura de diretórios criada com sucesso"
```

**Linux/Mac (Bash):**
```bash
baseDir="$HOME/Downloads/BIBLIOTECA/acervo/ACERVO_HISTORICO"

# Criar diretórios raiz
mkdir -p "$baseDir/01_DOCUMENTOS_TEXTUAIS/CONTRATOS_E_ESCRITURAS/{1970,1980,1990,2000,2010,2020}"
mkdir -p "$baseDir/01_DOCUMENTOS_TEXTUAIS/REGISTROS_ADMINISTRATIVOS/{LIVROS_CAIXA,FOLHAS_PAGAMENTO,INVENTARIOS}"
mkdir -p "$baseDir/01_DOCUMENTOS_TEXTUAIS/{CORRESPONDENCIAS,RELATORIOS_TECNICOS,ATAS_E_DECISOES,LEGISLACAO_APLICAVEL}"

mkdir -p "$baseDir/02_FOTOGRAFIAS/{AEREAS,INFRAESTRUTURA,ATIVIDADES_OPERACIONAIS,PESSOAS}"
mkdir -p "$baseDir/02_FOTOGRAFIAS/AEREAS/{1970,1980,1990,2000,2010,2020}"

mkdir -p "$baseDir/03_AUDIOVISUAL/{VIDEOS_DOCUMENTAIS,ENTREVISTAS,REGISTROS_DE_EVENTOS,TIMELAPSES_E_COMPOSICOES,AUDIO}"
mkdir -p "$baseDir/03_AUDIOVISUAL/REGISTROS_DE_EVENTOS/{VAQUEJADAS,EXPOSICOES,FESTAS_COMUNITARIAS}"

mkdir -p "$baseDir/04_MAPAS/{MAPAS_HISTORICOS,MAPAS_CADASTRAIS,MAPAS_TEMATICOS}"

mkdir -p "$baseDir/05_OBJETOS_DIGITAIS/{MODELOS_3D,PANORAMICAS_360,ASSETS_GRAFICOS,DADOS_GEOESPACIAIS}"
mkdir -p "$baseDir/05_OBJETOS_DIGITAIS/MODELOS_3D/{EDIFICIOS,INFRAESTRUTURA,AMBIENTE}"

mkdir -p "$baseDir/00_INDICE_MESTRE"

echo "✅ Estrutura de diretórios criada com sucesso"
```

### Passo 2.2: Criar Arquivos INDEX.csv

```bash
# Exemplo de INDEX.csv em cada subpasta
# Ver modelo em: docs/ESTRUTURA_ACERVO_HISTORICO.md

# Template básico:
echo "ID_UNICO,TITULO,TIPO,DATA_CRIACAO,ARQUIVO,FORMATO,TAMANHO_MB,LOCALIZACAO_ORIGINAL,CONDICAO,TAGS,DESCRICAO_BREVE,DATA_CATALOGACAO,CATALOGADOR,HASH_SHA256" > "$baseDir\01_DOCUMENTOS_TEXTUAIS\CONTRATOS_E_ESCRITURAS\INDEX.csv"
```

### Passo 2.3: Documentar Responsabilidades

Criar arquivo `ACERVO_METADATA.json`:

```json
{
  "acervo_info": {
    "proprietario": "RC Agropecuária",
    "coordenador": "Maria Silva",
    "data_inicio": "2026-02-06",
    "meta_items": 5000,
    "status_geral": "EM_CRIACAO"
  },
  "categorias": {
    "DOCUMENTOS_TEXTUAIS": {
      "responsavel": "João Santos",
      "prioridade": "P0",
      "meta_items": 1500
    },
    "FOTOGRAFIAS": {
      "responsavel": "Carlos Oliveira",
      "prioridade": "P0",
      "meta_items": 2000
    },
    "AUDIOVISUAL": {
      "responsavel": "Ana Costa",
      "prioridade": "P1",
      "meta_items": 500
    },
    "MAPAS": {
      "responsavel": "Pedro Silva",
      "prioridade": "P1",
      "meta_items": 300
    },
    "OBJETOS_DIGITAIS": {
      "responsavel": "Tech Team",
      "prioridade": "P0",
      "meta_items": 700
    }
  }
}
```

---

## 🗄️ TAREFA 3: SETUP POSTGRESQL (Semana 2)

### Objetivo
Provisionar banco de dados PostgreSQL + PostGIS

### Opção A: Docker Local (Recomendado para Desenvolvimento)

```bash
# Criar arquivo docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: villa_canabrava_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_secure_password_123
      POSTGRES_DB: villa_canabrava
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - villa_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: villa_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@villa.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - villa_network

volumes:
  postgres_data:

networks:
  villa_network:
    driver: bridge
EOF

# Iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps
```

**Acesso após inicialização:**
- **PostgreSQL:** localhost:5432 (user: postgres, password: postgres_secure_password_123)
- **PgAdmin:** http://localhost:5050 (admin@villa.com / admin)

### Opção B: AWS RDS (Produção)

```bash
# Usar AWS CLI ou Console
# Especificações mínimas:
# - Engine: PostgreSQL 15
# - Instance: db.t4g.medium (2 vCPU, 4 GB RAM)
# - Storage: 100 GB gp3
# - Multi-AZ: Sim
# - Backup: 30 dias
# - Port: 5432

# String de conexão será algo como:
# postgresql://admin:password@villa-db.xyz.rds.amazonaws.com:5432/villa_canabrava
```

### Passo 3.2: Validar Conexão

```bash
# Instalar psql (PostgreSQL client) se necessário
# ou usar Python:

python << 'EOF'
from sqlalchemy import create_engine, text

# Testar conexão
db_url = "postgresql://postgres:postgres_secure_password_123@localhost:5432/villa_canabrava"
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
    print("✅ Conexão PostgreSQL OK")
except Exception as e:
    print(f"❌ Erro de conexão: {e}")
EOF
```

---

## 🌍 TAREFA 4: IMPORTAÇÃO KML (Semana 2)

### Objetivo
Importar 252 arquivos KML para PostgreSQL

### Passo 4.1: Teste Piloto (5 KML)

```bash
# Editar import_kml_batch.py para teste:
# Adicionar ao main():
#  kml_files = sorted(kml_files)[:5]  # Apenas 5 primeiros

python tools/import_kml_batch.py
```

**Esperado:**
```
🚀 Iniciando importação em lote de 5 arquivos...
...
📊 RESUMO DA IMPORTAÇÃO:
  ✅ Sucesso:       5
  ⏭️  Pulados:       0
  ❌ Falhas:        0
  📦 Total:         5
  🌍 Features:    1,234
  📏 Área total:  523.45 ha
```

### Passo 4.2: Importação Completa

```bash
# Remover filtro de teste e executar completo
python tools/import_kml_batch.py

# Tempo estimado: 30-60 minutos
```

### Passo 4.3: Validação de Integridade

```sql
-- Conectar ao PostgreSQL (via PgAdmin ou psql)
-- Executar queries de validação:

-- Total de features
SELECT COUNT(*) as total_features FROM gis_data.features;

-- Features por categoria
SELECT category, COUNT(*) as count FROM gis_data.features GROUP BY category;

-- Área total
SELECT SUM(area_ha) as total_area_ha FROM gis_data.features;

-- Verificar overlaps (se houver)
SELECT 
    f1.name as feature_a,
    f2.name as feature_b,
    ST_Area(ST_Intersection(f1.geometry, f2.geometry)) as overlap_m2
FROM gis_data.features f1
JOIN gis_data.features f2 ON f1.id < f2.id 
    AND ST_Overlaps(f1.geometry, f2.geometry)
LIMIT 10;

-- Verificar self-intersections
SELECT name, layer_name FROM gis_data.features 
WHERE ST_IsValid(geometry) = false;
```

---

## 📋 TAREFA 5: CONSOLIDAÇÃO DOCUMENTAL (Semana 3)

### Objetivo
Centralizar documentação no workspace

### Passo 5.1: Copiar Documento Oficial

```bash
# Copiar documento de implementação para /docs
copy "..\..\Downloads\Documentaçao Auxiliar  Mundo Virtual Villa\00_DOCUMENTACAO_OFICIAL_V2\01_DOCUMENTACAO_MESTRE\02_DOCUMENTO_IMPLEMENTACAO_ESTAGIOS_CRIACAO.md" "docs\DOCUMENTO_IMPLEMENTACAO_OFICIAL.md"

# Também copiar análises de dados
xcopy "..\..\Downloads\Documentaçao Auxiliar  Mundo Virtual Villa\00_DOCUMENTACAO_OFICIAL_V2\02_DATA_LAKE_E_ANALISES\*.csv" "data\analises\"

xcopy "..\..\Downloads\Documentaçao Auxiliar  Mundo Virtual Villa\00_DOCUMENTACAO_OFICIAL_V2\02_DATA_LAKE_E_ANALISES\*.json" "data\analises\"
```

### Passo 5.2: Sincronizar Scripts Python

```bash
# Copiar scripts de análise
copy "..\..\Downloads\Documentaçao Auxiliar  Mundo Virtual Villa\00_DOCUMENTACAO_OFICIAL_V2\03_INTELIGENCIA_GEOESPACIAL\*.py" "tools\"

# Organizar:
# - analyze_kml_v2.py → tools/analyze_kml_v2.py
# - debug_kml.py → tools/debug_kml.py
# - etc.
```

### Passo 5.3: Atualizar README.md

```markdown
# BIBLIOTECA - Sistema de Acervo RC Agropecuária

## 🏗️ FASE 0: PREPARAÇÃO CONCLUÍDA ✅

**Data de Conclusão:** 6 de Fevereiro de 2026

### Artefatos Entregues

- ✅ Plano Estratégico (3 anos, 5 fases)
- ✅ Validação GIS (252 KML validados)
- ✅ Estrutura de Acervo (5 categorias, 20+ subcategorias)
- ✅ Scripts de Pipeline (validação + importação KML)
- ✅ Infraestrutura DB (PostgreSQL + PostGIS)
- ✅ Consolidação Documental

### Próxima Fase

**FASE 1: FUNDAÇÃO E MVP** (Mês 3-6)
- [ ] Museu Virtual 3D
- [ ] Biblioteca Digital
- [ ] Interface Web navegável

Ver: [PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md](plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md)
```

---

## ✅ TAREFA 6: VALIDAÇÃO FINAL (Semana 4)

### Checklist de Entrega

- [ ] Validação GIS 100% completa (relatório + análise)
- [ ] Acervo taxonomia criada com INDEX.csv em cada pasta
- [ ] PostgreSQL + PostGIS operacional
- [ ] 252 KML importados com sucesso
- [ ] Zero overlaps e erros de topologia
- [ ] Documentação consolidada em /docs
- [ ] Scripts Python organizados em /tools
- [ ] README.md atualizado
- [ ] Relatórios finais gerados (JSON)
- [ ] Aprovação stakeholders

### Relatórios Finais

Gerar documentos em `reports/`:

1. **GIS_VALIDATION_REPORT.json** - Métricas de qualidade KML
2. **KML_IMPORT_SUMMARY.json** - Resultado da importação
3. **ACERVO_INVENTORY.json** - Inventário de acervo catalogado
4. **PHASE_0_COMPLETION_REPORT.md** - Conclusão de Fase 0

---

## 📞 SUPORTE E CONTATOS

| Função | Responsável | Contato |
|--------|-------------|---------|
| **Coordenador Geral** | Roberth Naninne | +55 (telefone) |
| **Tech Lead** | Roo | Documentação |
| **DBA** | (A designar) | - |
| **GIS Specialist** | (A designar) | - |

---

## 📅 LINHA DO TEMPO

```
FEV 06  - Kickoff Fase 0 + Entrega de Plano Estratégico
FEV 13  - Validação GIS 100% + Estrutura Acervo
FEV 20  - PostgreSQL Operacional + Importação KML
FEV 27  - Consolidação Documental + Aprovação GO
MAR 06  - **GO para FASE 1: MVP**
```

---

**Versão:** 1.0  
**Última Atualização:** 6 de Fevereiro de 2026  
**Status:** Pronto para Execução
