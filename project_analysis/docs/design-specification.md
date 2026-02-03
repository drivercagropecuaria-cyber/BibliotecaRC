# Design Specification - RC Agropecuária (Eco-Tech Professional)

## 1. Direction & Rationale

**Style: Eco-Tech Professional (Modern Minimalism Variant)**
This direction bridges the gap between a high-efficiency SaaS tool and the organic identity of RC Agropecuária. It prioritizes a clean, white-dominant interface (`#FAFAFA` backgrounds) that allows the rich media content (photos/videos) to stand out. The "Eco" aspect is delivered through the Forest Green (`#2E7D32`) primary color, used strictly for actions and active states, fostering a professional yet brand-aligned environment. The "Tech" aspect is realized through precise spacing, subtle shadows, and a Sidebar Navigation layout optimized for desktop productivity.

**References:** Linear (for density/spacing balance), Stripe Dashboard (for clean containment), Notion (for neutral typography).

## 2. Design Tokens Overview

### Colors
- **Primary (Forest Green):** `500: #2E7D32` (Actions), `50: #E8F5E9` (Background tints).
- **Neutral:** `900: #171717` (Headings), `500: #737373` (Metadata), `Page: #FAFAFA` (Eye comfort).
- **Status:**
  - *Entrada/Draft:* Neutral-500 (Gray)
  - *Em Produção/Triagem:* Warning-500 (Amber)
  - *Aprovado/Publicado:* Success-600 (Green)
  - *Arquivado:* Neutral-900 (Dark Slate)
- **Constraint:** Max 1 primary color button per view.

### Typography (Inter)
- **Headings:** Bold (700). H1 32px (Dashboard titles), H2 24px (Section headers).
- **Body:** Regular (400) 16px. High legibility.
- **Labels:** Medium (500) 14px. Uppercase optional for table headers.

### Spacing & Shape
- **Grid:** 8px base. Padding 32px (Cards), 48px (Sections).
- **Radius:** 12px (Buttons/Inputs), 16px (Cards/Modals). Soft, modern feel.
- **Shadows:** `shadow-sm` for cards, `shadow-lg` for active drag states.

## 3. Component Specifications

### 3.1 Sidebar Navigation (Dashboard Layout)
*Context: Deviation from standard style guide to match User Selection (Option A image).*
- **Structure:** Fixed Left Sidebar (Width: 240-260px).
- **Styling:** White background, border-right `neutral-200`.
- **Items:**
  - Logo: Top-left, 32px height.
  - Links: Vertical list. Active state: `primary-50` bg + `primary-600` text + Left border strip 4px.
  - Inactive: `neutral-500` text. Hover: `neutral-100`.
- **Why:** Vertical hierarchy is superior for Admin systems with multiple distinct modules (Acervo, Upload, Workflow, Settings).

### 3.2 Media Asset Card (The "Atom")
- **Container:** White bg, `radius-xl`, `shadow-sm`. Hover: `shadow-md`, lift -4px.
- **Image Area:** Aspect 16:9. Object-fit cover.
- **Content:**
  - Title (Truncated 1 line, SemiBold 16px).
  - Metadata Row: Date + Area (e.g., "12/10 • Vila Canabrava"). `text-xs neutral-500`.
  - Status Pill: Top-right absolute position on image. `bg-white/90` + Status Color Text.
- **Actions:** Hover overlay with "Edit" and "Download" icon buttons.

### 3.3 Complex Catalog Form
*Handling the 13 areas / 15 points / 100 themes.*
- **Layout:** 2-Column Grid (on desktop).
- **Grouping:**
  - *Group 1 (Locais):* Cascading Dropdowns. "Fazenda" triggers "Ponto" filter.
  - *Group 2 (Contexto):* "Núcleo" triggers "Subnúcleo".
  - *Group 3 (Conteúdo):* "Tema Principal" triggers "Tema Secundário".
- **Inputs:** Height 48px, `radius-lg`, border `neutral-200`. Focus: `primary-500` ring.
- **Validation:** Live inline validation (Green checkmark for valid fields).

### 3.4 Upload Dropzone
- **State A (Idle):** Height 300px. Border 2px dashed `neutral-300`. Background `neutral-50`. Centered Icon + "Arrastar arquivos".
- **State B (Dragging):** Border 2px dashed `primary-500`. Background `primary-50`. Scale icon up.
- **State C (Processing):** Progress bars for individual files.

### 3.5 Kanban Board (Workflow)
- **Container:** Horizontal scroll container. Gap 16px.
- **Columns:** Fixed width (300px). Header with Status Name + Count Badge.
- **Column Bg:** `neutral-100` (Subtle track).
- **Items:** Simplified Media Cards (Thumbnail + ID + Title).
- **Interaction:** Drag and drop between columns updates Status.

### 3.6 Filter Bar
- **Position:** Sticky top (below header).
- **Style:** Row of dropdown pills.
- **Elements:** "Area", "Status", "Data", "Tipo".
- **Behavior:** Selecting a filter adds a filled "Tag" to the active filter row. Clear All button visible when filters active.

## 4. Layout & Responsive Patterns

### 4.1 Dashboard Layout Pattern
- **Desktop (xl):** Sidebar (250px) + Main Content (Flex Grow).
- **Tablet (md):** Sidebar becomes Icon Rail (72px).
- **Mobile (sm):** Hamburger Menu (Drawer).

### 4.2 Grid Strategy (Acervo)
- **Desktop:** 4 columns.
- **Tablet:** 3 columns.
- **Mobile:** 1 column (Cards become full width).

### 4.3 Page Structure
- **Header:** Page Title (H1) + Primary Action (Right aligned).
- **Content:** Spacing 48px from header. Max-width 1400px (centered in view).

## 5. Interaction & Animation

- **Transitions:** `all 200ms ease-out`.
- **Hover:** All interactive elements must have a visual state change (bg darken, lift, or border color).
- **Loading:** Skeleton screens (gray pulse) instead of spinners for data fetching.
- **Feedback:** Toast notifications (Top-Right) for Success/Error. Green for success, Red for error.
