---
applyTo: "src/**/*.{tsx,ts}"
---

# Architecture Rules — Medical Supplies Management

> **ALWAYS read this file before creating a new page or component.**

---

## Folder Structure

```
src/
  components/
    common/          ← Shared UI primitives (Button, Badge, Input, etc.)
    layout/          ← App-wide shell: Sidebar, TopBar
    dashboard/       ← Sub-components for the Dashboard page only
    inventory/       ← Sub-components for the Inventory page only (InventoryStats, InventoryTable, SupportCards, AddMedicineModal, SetPriceModal)
    reports/         ← Sub-components for the Reports page (RevenueChartPanel, ReportStatCards, BestSellersPanel, BranchDistribution)
    pos/             ← Sub-components for the POS page (ProductGrid, OrderSummary)
    alerts/          ← Sub-components for the Alerts page (LowStockGrid, ExpiryTable)
    <feature>/       ← Each new page gets its own sub-components folder
  pages/             ← Page entry components (thin orchestrators)
  types/             ← Shared TypeScript types (e.g. medicine.ts)
  store/             ← Global state (when needed)
  services/          ← API/data layer
```

---

## Page Rules

- Every page file lives in `src/pages/`.
- A page component is a **thin orchestrator**: it only composes sub-components and commons. No inline JSX blocks longer than ~15 lines.
- Every page wraps its content in `<main className="ml-72 pt-24 px-8 pb-12 ...">` to offset Sidebar + TopBar.
- Always start a page with `<PageHeader>` from `@/components/common`.
- **Exception — POS page:** Uses a full-height split layout. No `pt-24` or `<PageHeader>`. Use `pt-16` (TopBar height) and `flex h-screen overflow-hidden` instead:

```tsx
// POS.tsx — special layout
export function POS() {
  return (
    <div className="ml-72 pt-16 flex h-screen overflow-hidden bg-background">
      <ProductGrid /> {/* flex-1, overflow-y-auto */}
      <OrderSummary /> {/* w-[400px] flex-shrink-0 */}
    </div>
  );
}
```

```tsx
// ✅ Correct — thin page orchestrator
export function Inventory() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader title="..." eyebrow={...} actions={...} />
      <InventoryStats />
      <InventoryTable />
      <SupportCards />
    </main>
  );
}
```

---

## Component Decomposition Rules

### When to split

- A section has its own internal state → extract to sub-component.
- A section is > ~40 lines of JSX → extract to sub-component.
- The same visual pattern appears in ≥ 2 places → extract to `common/`.

### Naming convention

| What                  | Where                   | Example                        |
| --------------------- | ----------------------- | ------------------------------ |
| Shared primitive      | `components/common/`    | `Badge.tsx`                    |
| Feature sub-component | `components/<feature>/` | `inventory/InventoryTable.tsx` |
| Page entry            | `pages/`                | `Inventory.tsx`                |
| Type definitions      | `types/`                | `medicine.ts`                  |

### Sub-component checklist (before creating)

1. Does a common already do this? → Check `copilot-instructions.md`.
2. Will another page need this? → Put in `common/`, not in the feature folder.
3. Does it manage its own state? → It's a sub-component, not a page concern.

---

## Layout Shell — Sidebar & TopBar

> **🔒 FROZEN — do NOT modify `Sidebar.tsx` or `TopBar.tsx` unless the user explicitly says "update Sidebar" or "update TopBar".**

- `Sidebar` and `TopBar` are shared shell components. Their UI, styling, and structure are considered stable.
- When building any new page, **always reuse them exactly as-is** — only add the page's `<main>` content.
- Do NOT add nav items, change icons, restructure layout, or tweak styles in either file unless explicitly instructed.
- If a design asks for a different sidebar/topbar appearance, raise it with the user before touching those files.

---

## Navigation / Page Routing

- Navigation state lives in `App.tsx` as `activePage: NavId`.
- `Sidebar` receives `active` + `onNavigate` props — it does NOT own navigation state.
- Adding a new page: (1) add `NavId` to Sidebar's type export, (2) add entry to `pages` map in `App.tsx`.
- `NavId` is exported from `Sidebar.tsx`. Current values: `"dashboard" | "inventory" | "shipping" | "suppliers" | "reports" | "settings" | "pos" | "alerts"`.
- Note: `pos` and `alerts` are registered NavIds but do NOT have sidebar nav links (sidebar is frozen). They are only reachable programmatically.

```tsx
// App.tsx pattern
const pages: Partial<Record<NavId, React.ReactNode>> = {
  dashboard: <Dashboard />,
  inventory: <Inventory />,
  // Add new pages here ↓
};
```

---

## Data / Types

- Define shared types in `src/types/<domain>.ts` (e.g. `medicine.ts`, `order.ts`).
- Mock/static data lives inside the component file that first uses it, unless shared.
- When data is shared across components on the same page, lift it to the page level or a context.

---

## Anti-patterns — Never Do These

- ❌ Inline `<table>` raw markup on a page — use `<DataTable>` or a feature sub-component.
- ❌ Inline `<button>` with hand-rolled styles — use `<Button>`.
- ❌ Hardcoded `slate-*`, `blue-*`, `red-*` Tailwind colors — use design tokens.
- ❌ Navigation state inside `Sidebar` — it lives in `App.tsx`.
- ❌ A page file doing data-fetching, layout, AND render logic all at once.

---

## Instruction Maintenance Rules

These instruction files are living documents. Keep them in sync with the code.

| Event                                         | Files to update                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| New common component added                    | `copilot-instructions.md` — add section; `common/index.ts` — export                          |
| Existing common modified (new prop / variant) | `copilot-instructions.md` — update that component's section                                  |
| New page created                              | `architecture.instructions.md` — add page to folder structure if it introduces a new pattern |
| New design token used                         | `design-tokens.instructions.md` — add to relevant table                                      |
| New nav item added                            | `architecture.instructions.md` — update `NavId` table if needed                              |

> **Rule:** If you change a common component's props or variants and do NOT update `copilot-instructions.md`, future code will be generated from stale documentation and will diverge from the real API.
