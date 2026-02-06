# 📚 ESTRUTURA DE ACERVO HISTÓRICO
## Villa Canabrava - Organização Taxonomia

**Data:** 06 de Fevereiro de 2026  
**Responsável:** Equipe de Organização Documental  
**Versão:** 1.0

---

## 📂 ESTRUTURA DE DIRETÓRIOS PROPOSTA

```
ACERVO_HISTORICO/
│
├── 01_DOCUMENTOS_TEXTUAIS/
│   ├── CONTRATOS_E_ESCRITURAS/
│   │   ├── [ANO]/
│   │   │   └── [TIPO_DOCUMENTO]_[NUMERO_REGISTRO]_[DATA].pdf
│   │   └── INDEX.csv  # Meta: Nome, Data, Tipo, Localizacao_Original
│   │
│   ├── REGISTROS_ADMINISTRATIVOS/
│   │   ├── LIVROS_CAIXA/
│   │   ├── FOLHAS_PAGAMENTO/
│   │   ├── INVENTARIOS/
│   │   └── INDEX.csv
│   │
│   ├── CORRESPONDENCIAS/
│   │   ├── ENVIADAS/
│   │   ├── RECEBIDAS/
│   │   └── INDEX.csv
│   │
│   ├── RELATORIOS_TECNICOS/
│   │   ├── AGRONOMICOS/
│   │   ├── VETERINARIOS/
│   │   ├── AMBIENTAIS/
│   │   └── INDEX.csv
│   │
│   ├── ATAS_E_DECISOES/
│   │   ├── CONSELHOS/
│   │   ├── ASSEMBLEIAS/
│   │   └── INDEX.csv
│   │
│   └── LEGISLACAO_APLICAVEL/
│       ├── AMBIENTAL/
│       ├── TRABALHISTA/
│       └── INDEX.csv
│
├── 02_FOTOGRAFIAS/
│   ├── AEREAS/
│   │   ├── [DECADA]/
│   │   │   └── [TEMA]_[DATA]_[FOTOGRAFO].jpg
│   │   └── INDEX.csv  # Meta: LocalGPS, Altitude, Data, Fotografo, Tema
│   │
│   ├── INFRAESTRUTURA/
│   │   ├── EDIFICIOS/
│   │   ├── INSTALACOES_PRODUTIVAS/
│   │   ├── EQUIPAMENTOS/
│   │   └── INDEX.csv
│   │
│   ├── ATIVIDADES_OPERACIONAIS/
│   │   ├── PECUARIA/
│   │   ├── AGRICULTURA/
│   │   ├── VAQUEJADA/
│   │   └── INDEX.csv
│   │
│   └── PESSOAS/
│       ├── FAMILIA_CANABRAVA/
│       ├── COLABORADORES/
│       ├── EVENTOS_COMUNITARIOS/
│       └── INDEX.csv
│
├── 03_AUDIOVISUAL/
│   ├── VIDEOS_DOCUMENTAIS/
│   │   ├── [TITULO]_[ANO]_[DURACAO].mp4
│   │   ├── [TITULO]_[ANO].srt  # Legendas
│   │   └── INDEX.csv
│   │
│   ├── ENTREVISTAS/
│   │   ├── [ENTREVISTADO]_[DATA]_[DURACAO].mp4
│   │   ├── [ENTREVISTADO]_[DATA].srt
│   │   └── INDEX.csv
│   │
│   ├── REGISTROS_DE_EVENTOS/
│   │   ├── VAQUEJADAS/
│   │   ├── EXPOSICOES/
│   │   ├── FESTAS_COMUNITARIAS/
│   │   └── INDEX.csv
│   │
│   ├── TIMELAPSES_E_COMPOSICOES/
│   │   ├── [TEMA]_[ANO].mp4
│   │   └── INDEX.csv
│   │
│   └── AUDIO/
│       ├── MUSICAS_REGIONAIS/
│       ├── DEPOIMENTOS/
│       └── INDEX.csv
│
├── 04_MAPAS/
│   ├── MAPAS_HISTORICOS/
│   │   ├── [TEMA]_[DECADA].pdf
│   │   ├── [TEMA]_[DECADA].tif
│   │   └── INDEX.csv  # Meta: Escala, Projeção, Fonte Original
│   │
│   ├── MAPAS_CADASTRAIS/
│   │   ├── DIVISOES_DE_PROPRIEDADE/
│   │   ├── REGISTROS_TOPOGRAFICOS/
│   │   └── INDEX.csv
│   │
│   └── MAPAS_TEMATICOS/
│       ├── COBERTURA_VEGETAL/
│       ├── HIDROGRAFIA/
│       ├── TOPOGRAFIA/
│       ├── ZONEAMENTO_AMBIENTAL/
│       └── INDEX.csv
│
├── 05_OBJETOS_DIGITAIS/
│   ├── MODELOS_3D/
│   │   ├── EDIFICIOS/
│   │   │   ├── SEDE_TEREZINHA/
│   │   │   │   ├── SEDE_TEREZINHA_exterior.glb
│   │   │   │   ├── SEDE_TEREZINHA_interior.glb
│   │   │   │   └── metadata.json
│   │   │   └── CASAS_COLONO/
│   │   │       └── [IDENTIFICACAO].glb
│   │   │
│   │   ├── INFRAESTRUTURA/
│   │   │   ├── PIVOS/
│   │   │   ├── SILOS/
│   │   │   └── metadata.json
│   │   │
│   │   └── AMBIENTE/
│   │       ├── TERRENO_BASE.glb
│   │       ├── VEGETACAO.glb
│   │       └── metadata.json
│   │
│   ├── PANORAMICAS_360/
│   │   ├── [LOCALIZACAO]_[DATA].jpg
│   │   ├── [LOCALIZACAO]_[DATA].xml  # Metadata de hotspots
│   │   └── INDEX.csv
│   │
│   ├── ASSETS_GRAFICOS/
│   │   ├── LOGOTIPOS/
│   │   ├── TEXTURAS/
│   │   ├── ICONES/
│   │   └── INDEX.csv
│   │
│   └── DADOS_GEOESPACIAIS/
│       ├── KML_ARQUIVOS/
│       ├── GEOJSON_PROCESSADO/
│       ├── CAMADAS_SIG/
│       └── INDEX.csv
│
└── 00_INDICE_MESTRE/
    ├── CATALOGO_COMPLETO.csv
    ├── THESAURUS_TEMAS.json
    ├── METADADOS_GLOBAIS.json
    └── README.md
```

---

## 🏷️ METADADOS MÍNIMOS POR TIPO

### Documentos Textuais
```json
{
  "id_unico": "DOC-2025-0001",
  "titulo": "Contrato de Arrendamento",
  "tipo": "Contrato",
  "data_criacao": "1985-03-15",
  "data_arquivamento": "2026-01-20",
  "autor": "Rodrigo Canabrava",
  "localizacao_original": "Sala de Arquivos, Gaveta 3",
  "condicao": "Bom",
  "formato_digital": "PDF",
  "tamanho_mb": 2.5,
  "hash_integridade": "sha256:abc123...",
  "tags": ["financeiro", "propriedade", "1980s"],
  "transcricao_disponivel": false
}
```

### Fotografias
```json
{
  "id_unico": "FOT-2025-0001",
  "titulo": "Vista Aérea da Sede",
  "data_captura": "1995-07-20",
  "coordenadas_gps": {
    "latitude": -19.8234,
    "longitude": -45.2341,
    "altitude_m": 1250
  },
  "fotografo": "João Silva",
  "formato": "TIFF (RAW), JPEG (Web)",
  "resolucao_dpi": 300,
  "dimensoes_pixel": "4000x3000",
  "tema": "Infraestrutura",
  "condicao_original": "Ótima",
  "restauracao_necessaria": false,
  "tags": ["aérea", "sede", "1990s"]
}
```

### Vídeos
```json
{
  "id_unico": "VID-2025-0001",
  "titulo": "Documentário - História da Villa",
  "data_criacao": "2010-06-15",
  "duracao_minutos": 45,
  "formato": "MP4",
  "resolucao": "1920x1080",
  "fps": 30,
  "bitrate_mbps": 8,
  "diretor": "Maria Santos",
  "legendas_disponiveis": ["pt-BR", "en-US"],
  "tema": "Documentário",
  "direitos_autorais": "RC Agropecuária",
  "tags": ["história", "educação", "2010s"]
}
```

### Mapas
```json
{
  "id_unico": "MAP-2025-0001",
  "titulo": "Mapa Cadastral da Propriedade",
  "ano_criacao": 1950,
  "escala": "1:5000",
  "projecao": "UTM Zone 23S",
  "datum": "WGS84",
  "area_ha": 7729.26,
  "formato_original": "Papel",
  "condicao_papel": "Desbotado",
  "digitalizacao_resolucao": "600 DPI",
  "georeferenciacao": true,
  "fonte_original": "INCRA",
  "tags": ["propriedade", "limites", "1950s"]
}
```

### Modelos 3D
```json
{
  "id_unico": "3D-2025-0001",
  "titulo": "Modelo 3D - Sede Villa Terezinha (Exterior)",
  "data_criacao": "2026-01-15",
  "tecnica_criacao": "Fotogrametria",
  "software": "RealityCapture",
  "formato_arquivo": "GLB (glTF Binary)",
  "tamanho_mb": 450,
  "vertices_count": 2500000,
  "triangles_count": 1250000,
  "texturas_pxl": "4096x4096",
  "lods_disponiveis": ["LOD0", "LOD1", "LOD2"],
  "escala_real": true,
  "coordenadas_gps_base": {
    "latitude": -19.8234,
    "longitude": -45.2341
  },
  "tags": ["3D", "patrimônio", "educação"]
}
```

---

## 📋 PROCESSO DE CATALOGAÇÃO

### Checklist para cada item

- [ ] **Identificação**
  - [ ] ID único atribuído (formato: TIPO-YYYY-NNNN)
  - [ ] Título descritivo em português
  - [ ] Data de criação/captura

- [ ] **Metadados Essenciais**
  - [ ] Autor/Criador
  - [ ] Formato/Tipo de arquivo
  - [ ] Localização original (se aplicável)
  - [ ] Condição e restaurações

- [ ] **Digitalização (se necessário)**
  - [ ] Resolução apropriada (DPI/pixels)
  - [ ] Formato preservação + formato web
  - [ ] Hash SHA256 para integridade
  - [ ] Teste de acesso

- [ ] **Indexação**
  - [ ] Tags temáticas (mínimo 3)
  - [ ] Descrição executiva (< 200 caracteres)
  - [ ] Relacionamentos com outros itens
  - [ ] Entrada no INDEX.csv local

- [ ] **Documentação de Rastreabilidade**
  - [ ] Quem digitalizou/processou
  - [ ] Data do processamento
  - [ ] Aprovação QA
  - [ ] Comentários especiais

---

## 🗂️ ARQUIVO INDEX.csv - FORMATO PADRÃO

```csv
ID_UNICO,TITULO,TIPO,DATA_CRIACAO,ARQUIVO,FORMATO,TAMANHO_MB,LOCALIZACAO_ORIGINAL,CONDICAO,TAGS,DESCRICAO_BREVE,DATA_CATALOGACAO,CATALOGADOR,HASH_SHA256
DOC-2025-0001,Contrato Arrendamento,Contrato,1985-03-15,CONTRATOS_E_ESCRITURAS/1985/ARRENDAMENTO_001_1985.pdf,PDF,2.5,Sala Arquivos Gaveta 3,Bom,financeiro|propriedade|1980s,Contrato de arrendamento de terras assinado em 1985,2026-01-20,Maria Silva,abc123def456...
FOT-2025-0001,Vista Aérea da Sede,Fotografia,1995-07-20,FOTOGRAFIAS/AEREAS/1990s/VISTA_AEREA_SEDE_1995.jpg,JPEG,3.2,Álbum foto A-5,Ótima,aérea|sede|1990s,Fotografia aérea da sede principal capturada em 1995,2026-01-20,João Santos,def456abc789...
VID-2025-0001,Documentário Villa,Vídeo,2010-06-15,AUDIOVISUAL/VIDEOS_DOCUMENTAIS/DOCUMENTARIO_VILLA_2010.mp4,MP4,450.0,Arquivo digital,Excelente,história|educação|2010s,Documentário sobre a história de 45min com legendas,2026-01-20,Maria Silva,xyz789def456...
```

---

## 🔗 INTEGRAÇÃO COM BANCO DE DADOS

A estrutura acima será sincronizada com PostgreSQL:

```sql
-- Tabela master de acervo
CREATE TABLE museu_content.acervo_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_unico VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    tipo VARCHAR(50),  -- Documento, Foto, Vídeo, Mapa, Modelo3D
    categoria VARCHAR(100),
    data_criacao DATE,
    arquivo_path VARCHAR(500),
    formato VARCHAR(20),
    tamanho_mb DECIMAL(10, 2),
    metadados JSONB,  -- Armazena objeto JSON com todos os campos
    tags TEXT[],
    descricao TEXT,
    hash_integridade VARCHAR(64),
    date_catalogacao TIMESTAMP DEFAULT NOW(),
    catalogador_id UUID,
    status VARCHAR(20),  -- RASCUNHO, CATALOGADO, PUBLICADO
    CONSTRAINT fk_catalogador FOREIGN KEY (catalogador_id) 
        REFERENCES auth.users(id)
);

-- Índices para busca rápida
CREATE INDEX idx_acervo_tipo ON museu_content.acervo_itens(tipo);
CREATE INDEX idx_acervo_tags ON museu_content.acervo_itens USING GIN(tags);
CREATE INDEX idx_acervo_categoria ON museu_content.acervo_itens(categoria);
CREATE INDEX idx_acervo_data ON museu_content.acervo_itens(data_criacao);
CREATE INDEX idx_acervo_busca ON museu_content.acervo_itens USING GIN(
    to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, ''))
);
```

---

## ✅ MÉTRICAS DE COMPLETUDE

Acompanhar via dashboard:

| Métrica | Meta |
|---------|------|
| Documentos Catalogados | 100% |
| Fotografias Digitalizadas | 100% |
| Vídeos com Legendas | 80% |
| Modelos 3D Validados | 90% |
| Integridade de Hash | 100% |
| Metadados Completos | 95% |
| Tags Relevantes | 100% |

---

## 📞 RESPONSABILIDADES

- **Coordenador de Acervo:** Maria Silva
- **Digitalização:** Equipe de TI
- **Catalogação:** Voluntários treinados
- **QA/Validação:** Arquivista certificado
- **Publicação Web:** Desenvolvedora Frontend

---

**Próxima Atualização:** 20 de Fevereiro de 2026  
**Versão:** 1.1 (após testes de campo)
