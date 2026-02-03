# Content Structure Plan - Sistema de Acervo RC Agropecuária

## 1. Material Inventory

**Content Files:**
- `docs/sistema_acervo.md`: System requirements, workflow, and storage specs.
- `docs/listas_acervo.json`: Full taxonomy (13 Farms, 25+ Points, 9 Statuses, 100+ Themes).

**Data Structure (from `listas_acervo.json`):**
- **Taxonomy Deep-Dive:**
  - *Location:* Fazendas (13) → Pontos (25)
  - *Content:* Temas Principais (50) → Temas Secundários (100)
  - *Context:* Núcleos (Pecuária/Agro) → Subnúcleos
  - *Workflow:* Status (9 steps: Entrada → Arquivado)

## 2. Website Structure

**Type:** MPA (Multi-Page Application)
**Reasoning:** The system requires distinct environments for different complex tasks: high-volume data visualization (Catalog), focused data entry (Upload/Form), and process management (Workflow). A single page would be too heavy and cluttered for these distinct modes.

## 3. Page/Section Breakdown

**Visual Asset Column Rules:**

| [OK] Content Images (SPECIFY) | [X] Decorative Images (DON'T specify) |
| ----------------------------- | ------------------------------------- |
| Media assets (cattle, landscapes) | UI background patterns |
| Charts/Metrics visualizations | Placeholder avatars |
| Thumbnails of uploaded files | |

### Page 1: Dashboard (`/dashboard`)
**Purpose:** Overview of system health and quick actions.
**Content Mapping:**
| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| Header | Global Header | User Session | Greeting + Role | `imgs/logo.svg` |
| Quick Metrics | Metric Cards | System DB | Total Items, Items in "Approval", Storage Used | - |
| Recent Activity | List/Table | System Logs | Last 5 uploads/edits | Thumbnails |
| Upload Call | Action Card | - | "Nova Importação" Button | - |

### Page 2: Acervo / Catalog (`/acervo`)
**Purpose:** Main library for searching and filtering assets.
**Content Mapping:**
| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| Filters | Filter Bar | `listas_acervo.json` | Dropdowns: Fazenda, Status, Tema | - |
| Asset Grid | Media Card Grid | DB Assets | Title, Date, Location, Status Tag | Asset Thumbnails |
| Pagination | Pagination Control | - | 1-50 of X items | - |

### Page 3: Workflow / Kanban (`/workflow`)
**Purpose:** Visual management of asset lifecycle.
**Content Mapping:**
| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| Board | Kanban Board | `listas_acervo.json` | Columns: Entrada, Triagem, Produção, Aprovado... | - |
| Cards | Kanban Card | DB Assets | Thumbnail, ID, Assigned To | Asset Thumbnails |

### Page 4: Upload & Catalogação (`/upload`)
**Purpose:** Ingesting new files and adding metadata.
**Content Mapping:**
| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| Dropzone | Drag-and-Drop Area | - | "Arrastar arquivos (Max 50MB)" | Upload Icon |
| Metadata Form | Complex Form | `listas_acervo.json` | Selects: Area, Ponto, Tipo, Núcleo, Tema | - |
| Tagging | Multi-Select | `listas_acervo.json` | Tags: Temas Secundários | - |

### Page 5: Item Detail (`/item/:id`)
**Purpose:** Full view and edit of a single asset.
**Content Mapping:**
| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| Media Viewer | Player/Lightbox | File Storage | High-res Image or Video Player | Full Asset |
| Info Panel | Data List | Asset Metadata | All metadata fields | - |
| History | Timeline | Asset Logs | "Created by X", "Status changed to Y" | - |

## 4. Content Analysis

**Information Density:** High
- **Reasoning:** The cataloging form requires mapping assets to over 7 dimensions (Place, Point, Type, Core, Theme, Subtheme, Status).

**Content Balance:**
- Images: High (The core content is media)
- Data/Charts: Low (Only on dashboard)
- Text: Medium (Metadata labels)
- Content Type: Visual-focused Database
