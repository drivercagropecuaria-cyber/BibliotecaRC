# 🔍 PROMPT DE VALIDAÇÃO - FASE 1 EXECUÇÃO

**Função:** Validar execução de Fase 1 (4 semanas) do projeto Mundo Virtual Villa Canabrava

**Autoridade:** Agente Validador Externo

**Status Esperado ao Final:** GO/NO-GO para Fase 2

---

## 📋 RESUMO EXECUTIVO

A Fase 0 (Preparação) foi **APROVADA** em 2026-02-05. Agora iniciamos **Fase 1 - FUNDAÇÃO** com duração de 4 semanas (Semanas 1-4) e orçamento de **$1.870/mês** (componentes críticos).

**Objetivos Principais:**
1. ✅ Validar integridade de todos os 252 arquivos KML (dados geoespaciais)
2. ✅ Criar estrutura de ACERVO_HISTORICO com 5 categorias + 20+ subcategorias
3. ✅ Configurar infraestrutura de banco dados (PostgreSQL + PostGIS)
4. ✅ Importar 252 KML files em lote para geospatial database
5. ✅ Gerar reports consolidados e definir GO/NO-GO para Fase 2

---

## 🎯 TAREFAS E CRITÉRIOS DE SUCESSO

### SEMANA 1: Validação de Dados GIS + Estruturação de Acervo

#### Tarefa 1.1 - Execução de Validação GIS
**Responsável:** Dev/DevOps  
**Recurso:** `python tools/validate_gis_data.py`  
**Entrada:** 252 arquivos KML em `acervo/MAPAS_KML/`  

**Procedimento:**
```bash
# Linux/Mac
cd /path/to/BIBLIOTECA
source .venv/bin/activate
python tools/validate_gis_data.py

# Windows (PowerShell)
cd C:\Users\rober\Downloads\BIBLIOTECA
.\.venv\Scripts\activate.ps1
python tools\validate_gis_data.py
```

**Critérios de Aceitação:**
- [ ] Arquivo `reports/GIS_VALIDATION_REPORT.json` gerado
- [ ] Taxa de `Null_Fields < 5%` para 95% dos arquivos
- [ ] `Topology_Errors = 0` para 100% dos arquivos
- [ ] `Positional_Accuracy < 1m` para geometrias com GNSS
- [ ] Resumo mostra: `"total_files": 252, "valid": >=240, "invalid": <=12`

**Output Esperado:**
```json
{
  "validation_timestamp": "2026-02-XX",
  "total_files": 252,
  "valid_files": 240,
  "invalid_files": 12,
  "summary": {
    "avg_null_fields": 2.3,
    "files_with_topology_errors": 0,
    "wgs84_bounds_violations": 2,
    "avg_positional_accuracy_m": 0.85
  },
  "files": [
    {"filename": "MATA_001.kml", "status": "valid", "bounds": [...], "topology_ok": true},
    ...
  ]
}
```

---

#### Tarefa 1.2 - Criação de Estrutura de Acervo
**Responsável:** Curador/Admin  
**Recurso:** Manual usando comandos shell ou Faculdade de scripts `SETUP_DEVENV.*`  
**Entrada:** Nenhuma (estrutura pura)  

**Procedimento - Windows (PowerShell):**
```powershell
$baseDir = "C:\Users\rober\Downloads\BIBLIOTECA\acervo\ACERVO_HISTORICO"

# Criar 5 categorias principais
$categories = @(
  "01_DOCUMENTOS_TEXTUAIS",
  "02_FOTOGRAFIAS",
  "03_AUDIOVISUAL",
  "04_MAPAS",
  "05_OBJETOS_DIGITAIS"
)

foreach ($cat in $categories) {
  New-Item -ItemType Directory -Path "$baseDir\$cat" -Force | Out-Null
}

# Subcategorias específicas por tipo (exemplo DOCUMENTOS_TEXTUAIS)
$subDirs = @(
  "01_DOCUMENTOS_TEXTUAIS\CONTRATOS_E_ESCRITURAS",
  "01_DOCUMENTOS_TEXTUAIS\CORRESPONDENCIA_ADMINISTRATIVA",
  "01_DOCUMENTOS_TEXTUAIS\RELATORIOS_GESTAO",
  "02_FOTOGRAFIAS\ARQUIVO_HISTORICO",
  "02_FOTOGRAFIAS\DOCUMENTACAO_CONTEMPORANEA",
  "03_AUDIOVISUAL\FILMAGENS",
  "03_AUDIOVISUAL\ENTREVISTAS",
  "04_MAPAS\HISTORICO",
  "04_MAPAS\ATUAL",
  "05_OBJETOS_DIGITAIS\MODELAGEM_3D",
  "05_OBJETOS_DIGITAIS\DADOS_GEOESPACIAIS"
)

foreach ($sub in $subDirs) {
  New-Item -ItemType Directory -Path "$baseDir\$sub\{2020,2021,2022,2023,2024,2025,2026}" -Force | Out-Null
}

Write-Host "✅ Estrutura de acervo criada em $baseDir"
```

**Procedimento - Linux/Mac (Bash):**
```bash
baseDir="$HOME/Downloads/BIBLIOTECA/acervo/ACERVO_HISTORICO"

# Criar 5 categorias principais
mkdir -p "$baseDir"/{01_DOCUMENTOS_TEXTUAIS,02_FOTOGRAFIAS,03_AUDIOVISUAL,04_MAPAS,05_OBJETOS_DIGITAIS}

# Criar subcategorias com anos
for year in {2020..2026}; do
  mkdir -p "$baseDir/01_DOCUMENTOS_TEXTUAIS/CONTRATOS_E_ESCRITURAS/$year"
  mkdir -p "$baseDir/02_FOTOGRAFIAS/ARQUIVO_HISTORICO/$year"
  mkdir -p "$baseDir/03_AUDIOVISUAL/FILMAGENS/$year"
  mkdir -p "$baseDir/04_MAPAS/HISTORICO/$year"
  mkdir -p "$baseDir/05_OBJETOS_DIGITAIS/MODELAGEM_3D/$year"
done

echo "✅ Estrutura de acervo criada em $baseDir"
```

**Critérios de Aceitação:**
- [ ] 5 categorias principais criadas com nomes exatos (sem espaços extras)
- [ ] Mínimo 9 subcategorias criadas (1-2 por categoria)
- [ ] Subpastas de anos (2020-2026) presentes em pelo menos 2 categorias
- [ ] Total de pastas criadas >= 50
- [ ] Arquivo `INDEX.csv` criado em cada subcategoria com formato:
  ```csv
  id,titulo,categoria,data_criacao,status
  001,Exemplo Item,01_DOCUMENTOS_TEXTUAIS/CONTRATOS_E_ESCRITURAS,2026-02-06,draft
  ```

---

#### Tarefa 1.3 - Geração de Report de Acervo
**Responsável:** Admin  
**Recurso:** Script Python (será fornecido) ou manual  

**Critérios de Aceitação:**
- [ ] Arquivo `reports/ACERVO_STRUCTURE_REPORT.json` gerado
- [ ] Report mostra contagem de pastas: `"total_folders": >=50`
- [ ] Report lista as 5 categorias com subcategorias
- [ ] Report valida presença de INDEX.csv em subcategorias

---

### SEMANA 2: Setup de Infraestrutura BD + Início de Importação KML

#### Tarefa 2.1 - Configuração de PostgreSQL + PostGIS (Opção Local Docker)
**Responsável:** DevOps/Dev  
**Recurso:** Docker + Docker Compose  

**Procedimento - Windows (PowerShell):**
```powershell
# Verificar Docker instalado
docker --version
docker-compose --version

# Criar docker-compose.yml na raiz do projeto
$composeContent = @"
version: '3.8'
services:
  postgis:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: villa_user
      POSTGRES_PASSWORD: VillaCanabrava2026!SecurePass
      POSTGRES_DB: villa_virtual
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U villa_user -d villa_virtual"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
"@

Set-Content -Path "docker-compose.yml" -Value $composeContent
docker-compose up -d
Write-Host "✅ PostgreSQL com PostGIS iniciado em localhost:5432"
```

**Procedimento - Linux/Mac (Bash):**
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgis:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: villa_user
      POSTGRES_PASSWORD: VillaCanabrava2026!SecurePass
      POSTGRES_DB: villa_virtual
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U villa_user -d villa_virtual"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
EOF

docker-compose up -d
echo "✅ PostgreSQL com PostGIS iniciado em localhost:5432"
```

**Critérios de Aceitação:**
- [ ] Container PostgreSQL rodando (verificar com `docker ps`)
- [ ] Banco `villa_virtual` acessível em `localhost:5432`
- [ ] PostGIS extensão habilitada: `CREATE EXTENSION IF NOT EXISTS postgis;`
- [ ] Teste de conexão bem-sucedido (use DBeaver, psql ou similar)
- [ ] Arquivo `reports/DB_CONNECTION_TEST.json` gerado com resultado positivo

---

#### Tarefa 2.2 - Importação KML Pilot (5 arquivos)
**Responsável:** Dev  
**Recurso:** `python tools/import_kml_batch.py` com modo PILOT  
**Entrada:** 5 arquivos KML de teste  

**Procedimento:**
```bash
# Linux/Mac
source .venv/bin/activate
python tools/import_kml_batch.py --pilot --count 5

# Windows (PowerShell)
.\.venv\Scripts\activate.ps1
python tools\import_kml_batch.py --pilot --count 5
```

**Critérios de Aceitação:**
- [ ] Script executa sem erros críticos
- [ ] Arquivo `reports/KML_IMPORT_PILOT_SUMMARY.json` gerado
- [ ] Report mostra: `"files_processed": 5, "features_imported": >=500`
- [ ] Tabelas `gis_data.features` e `gis_data.layers` criadas
- [ ] Índices GIST e GIN presentes (verificar com `\d gis_data.features` em psql)

---

### SEMANA 3: Importação KML Completa + Validação

#### Tarefa 3.1 - Importação KML em Lote (252 arquivos)
**Responsável:** Dev  
**Recurso:** `python tools/import_kml_batch.py` modo FULL  

**Procedimento:**
```bash
# Linux/Mac
source .venv/bin/activate
python tools/import_kml_batch.py --full

# Windows (PowerShell)
.\.venv\Scripts\activate.ps1
python tools\import_kml_batch.py --full
```

**Critérios de Aceitação:**
- [ ] Arquivo `reports/KML_IMPORT_SUMMARY.json` gerado
- [ ] Report mostra: `"total_files": 252, "successful": >=240, "failed": <=12`
- [ ] Report mostra contagem de features: `"total_features": >=50000`
- [ ] Report mostra categorias importadas: `"categories": 19`
- [ ] Checksum/hash de integridade calculado

---

#### Tarefa 3.2 - Validação de Dados Importados
**Responsável:** Dev/QA  
**Recurso:** Queries SQL customizadas (será fornecido script)  

**Critérios de Aceitação:**
- [ ] Query de contagem de features retorna número > 0 para cada categoria
- [ ] Query de geometria válida (ST_IsValid) retorna true para 99%+ de features
- [ ] Query de overlap detection retorna 0 self-intersections ou sobreposições críticas
- [ ] Arquivo `reports/DB_VALIDATION_REPORT.json` gerado com resultados

---

### SEMANA 4: Consolidação + GO/NO-GO Decision

#### Tarefa 4.1 - Consolidação de Reports
**Responsável:** PM/Admin  

**Critérios de Aceitação:**
- [ ] Arquivo `reports/FASE_1_CONSOLIDACAO.json` gerado com resumo final
- [ ] Report consolida: GIS Validation, Acervo Structure, DB Import, Data Quality
- [ ] Inclui tabela de "Achados vs Esperado" para cada métrica

**Formato esperado:**
```json
{
  "phase": "FASE_1",
  "status": "COMPLETE",
  "timestamp": "2026-02-XX",
  "validation_summary": {
    "gis_validation": {
      "expected_valid_files": 252,
      "actual_valid_files": 240,
      "pass": true
    },
    "acervo_structure": {
      "expected_folders": 50,
      "actual_folders": 58,
      "pass": true
    },
    "kml_import": {
      "expected_features": 50000,
      "actual_features": 52340,
      "pass": true
    }
  },
  "go_nogo_recommendation": "GO"
}
```

---

#### Tarefa 4.2 - GO/NO-GO Decision
**Responsável:** Roberth (Project Owner)  

**Critério GO (padrão):**
- [ ] GIS Validation: >=95% arquivos válidos
- [ ] Acervo Structure: >=50 pastas criadas
- [ ] KML Import: >=95% arquivos importados com sucesso
- [ ] Data Quality: >=99% geometrias válidas
- [ ] Nenhuma tarefa bloqueante pendente

**Critério NO-GO (contingência):**
- [ ] Qualquer métrica crítica abaixo do threshold
- [ ] Erros não resolvíveis em dados KML
- [ ] Infraestrutura BD instável ou inacessível
- [ ] Mais de 50% de arquivo KML com geometria inválida

---

## ✅ CHECKLIST DE VALIDAÇÃO

Use este checklist para validação final:

```
## SEMANA 1
[ ] GIS_VALIDATION_REPORT.json existe em reports/
[ ] Report mostra >=95% arquivos válidos
[ ] Topology_Errors = 0 para 100% dos arquivos
[ ] ACERVO_HISTORICO estrutura criada com >=50 pastas
[ ] INDEX.csv presente em subcategorias
[ ] ACERVO_STRUCTURE_REPORT.json gerado

## SEMANA 2
[ ] Docker container PostgreSQL rodando
[ ] Banco villa_virtual acessível
[ ] PostGIS extensão habilitada
[ ] KML_IMPORT_PILOT_SUMMARY.json mostra >=500 features
[ ] Tabelas gis_data.features e gis_data.layers criadas
[ ] Índices GIST/GIN presentes

## SEMANA 3
[ ] KML_IMPORT_SUMMARY.json gerado
[ ] Report mostra >=240 arquivos importados (out of 252)
[ ] Total features >= 50.000
[ ] 19 categorias presentes
[ ] DB_VALIDATION_REPORT.json mostra >=99% geometrias válidas

## SEMANA 4
[ ] FASE_1_CONSOLIDACAO.json gerado
[ ] Resumo consolida todos os reports anteriores
[ ] GO/NO-GO recommendation = "GO"
[ ] Nenhuma tarefa bloqueante pendente

## STATUS FINAL
[ ] Fase 1 - EXECUÇÃO concluída com sucesso
[ ] Pronto para proceedir a Fase 2 - FUNDAÇÃO (Desenvolvimento MVP)
```

---

## 📞 CONTACTOS E ESCALAÇÕES

**Em caso de bloqueios:**
1. GIS data quality issues → Consultar `docs/ESTRUTURA_ACERVO_HISTORICO.md` para taxonomia esperada
2. BD connection issues → Revisar `docker-compose.yml` e portas
3. Python script errors → Verificar `.venv` e `requirements-gis.txt`
4. KML import failures → Verificar logs em `reports/KML_IMPORT_SUMMARY.json` para archivos específicos

---

## 🔄 PRÓXIMA ETAPA

Após GO/NO-GO approval:
- **Fase 2 - FUNDAÇÃO** (4 semanas): Desenvolvimento de MVP Museu 3D + Biblioteca Digital React
- **Fase 3 - EXPANSÃO** (6 semanas): Tours interativos, simulações produtivas, módulo educacional
- **Fase 4 - INOVAÇÃO** (8 semanas): VR/AR, Gamificação, APIs
- **Fase 5 - MATURIDADE** (4 semanas): IA, Blockchain, Multi-worlding

---

**Documento Version:** 1.0  
**Data de Criação:** 2026-02-06  
**Última Atualização:** 2026-02-06  
**Validador Responsável:** [Agente Externo]  
**Status de Validação:** PENDENTE
