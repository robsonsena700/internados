# Design Guidelines: Dashboard de Acompanhamento de Pacientes Internados

## Design Approach
**Selected Approach:** Design System-Based (Material Design + Healthcare Best Practices)

**Rationale:** This is a utility-focused, data-intensive healthcare application where clarity, efficiency, and accessibility are paramount. Medical professionals need quick, reliable access to patient information with minimal cognitive load.

**Core Principles:**
- Clarity above aesthetics
- Hierarchical information architecture
- Accessible data visualization
- Responsive, mobile-first approach
- Professional, clinical aesthetic

---

## Typography System

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Inter (400, 500, 600, 700)

**Hierarchy:**
- **Page Title/Headers:** text-2xl (24px) font-semibold
- **Section Headers:** text-lg (18px) font-medium
- **Card Titles:** text-base (16px) font-medium
- **Body/Labels:** text-sm (14px) font-normal
- **Data Values:** text-base (16px) font-semibold
- **Metadata/Timestamps:** text-xs (12px) font-normal

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section gaps: gap-4 to gap-6
- Card spacing: p-6
- Form inputs: p-3
- Margins between major sections: mb-6 to mb-8

**Grid System:**
- Container: max-w-7xl mx-auto px-4
- Filter row: grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4
- Indicator cards: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
- Patient list: Single column, full-width table on desktop, stacked cards on mobile

**Responsive Breakpoints:**
- Mobile: Base (< 768px) - Single column, stacked layout
- Tablet: md (768px+) - 2-3 column grids
- Desktop: lg (1024px+) - 4 column grids, full table view

---

## Component Library

### Authentication Screen
- Centered card (max-w-md) with hospital logo placeholder
- Simple username/password form
- Primary action button (full width)
- Clean, minimal interface

### Dashboard Header
- Fixed top bar with app title, user info, logout button
- Breadcrumb navigation (optional for future expansion)
- Height: h-16, shadow-sm

### Filter Section
- Card container with rounded corners (rounded-lg)
- Multi-column grid layout (responsive)
- Filter components:
  - Select dropdowns (searchable for large lists)
  - Date pickers (range selection)
  - Clear filters button (secondary style)
- Apply filters automatically on change

### Indicator Cards
- 4-column grid on desktop (lg:grid-cols-4)
- Card structure:
  - Icon/visual indicator (top-left)
  - Metric label (text-sm, muted)
  - Large numeric value (text-3xl, font-bold)
  - Trend indicator or subtitle (text-xs)
- Subtle border, shadow-sm, rounded-lg

**Key Metrics:**
1. Total de Pacientes Internados
2. Média de Dias de Internação
3. Taxa de Ocupação de Leitos
4. Distribuição por Especialidade (top)

### Patient List
**Desktop View (Table):**
- Full-width table with alternating row backgrounds
- Sticky header row
- Columns: Nome do Paciente, Leito, Médico Assistente, Data Internação, Dias Internado, Especialidade, Ações
- Row height: py-4
- Hover state on rows
- Action buttons (icon buttons for view details)

**Mobile View (Cards):**
- Stacked cards (gap-4)
- Card structure:
  - Patient name (font-semibold, text-base)
  - Key info grid: Leito | Dias | Especialidade
  - Médico assistente (text-sm)
  - Action button (bottom-right)
- Compact padding (p-4)

### Form Controls
- Input fields: rounded-md, border, h-10, px-3
- Select dropdowns: Same styling as inputs
- Labels: text-sm, font-medium, mb-2
- Helper text: text-xs, muted color
- Error states: red border, error message below

### Buttons
- Primary: font-medium, px-4, py-2, rounded-md
- Secondary: Same dimensions, outlined style
- Icon buttons: p-2, rounded-md (for table actions)

---

## Data Display Patterns

### Empty States
- Centered message with icon
- "Nenhum paciente internado encontrado" or "Ajuste os filtros para ver resultados"
- Subtle styling, not alarming

### Loading States
- Skeleton loaders for cards and table rows
- Spinner for filters/data fetching
- Preserve layout to prevent content shift

### Data Density
- Comfortable spacing for readability
- No overcrowding - medical data must be scannable
- Use of truncation with tooltips for long text

---

## Accessibility Requirements

- ARIA labels on all interactive elements
- Keyboard navigation support (tab order, enter to submit)
- Focus indicators (ring-2 ring-offset-2)
- Screen reader-friendly table markup (thead, tbody, th scope)
- Color contrast ratios meeting WCAG AA standards
- Form validation with clear error messages
- Consistent tab order throughout application

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout
- Filters collapse/expand accordion
- Cards stack vertically
- Table transforms to card list
- Touch-friendly tap targets (min 44x44px)

**Tablet (768px - 1024px):**
- 2-3 column grids
- Simplified table (fewer columns visible)
- Adequate spacing for touch

**Desktop (1024px+):**
- Full multi-column layout
- Complete table view
- Hover interactions enabled
- Side-by-side filter arrangement

---

## Special Healthcare Considerations

- **Data Privacy:** No sensitive medical data in screenshots/logs
- **Critical Information Hierarchy:** Patient name and leito always prominent
- **Temporal Data:** Dates and "Dias Internado" highly visible
- **Professional Tone:** Clean, clinical interface without decoration
- **Quick Scanning:** Information grouped logically for rapid assessment
- **Minimize Clicks:** Most common actions accessible without navigation

---

## Animation Guidelines

**Minimal, purposeful animations only:**
- Smooth filter application (200ms fade)
- Card/row hover transitions (150ms)
- Loading spinners
- **No decorative animations** - this is a clinical tool