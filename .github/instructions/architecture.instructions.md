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
    inventory/       ← Sub-components for the Inventory page (InventoryStats, InventoryTable, AddMedicineModal, ImportDetailModal, InventoryImportTab)
    units/           ← Sub-components for the Units tab (UnitTable)
    imports/         ← Sub-components for the Imports page (ImportList, CreateRequestForm, ImportUploadZone, CreateImportModal)
    dispatches/      ← Sub-components for the Dispatches page (CreateDispatchForm)
    branches/        ← Sub-components for the Branches page (BranchFormModal, BranchStatCards, BranchTable)
    suppliers/       ← Sub-components for the Suppliers section (SupplierTable, SupplierFormModal)
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

- App uses **React Router v6** (`<Routes>`, `<Route>`). Routes are defined in `App.tsx`.
- `Sidebar` uses `useLocation()` to detect active route — it does NOT own navigation state.
- Adding a new page: (1) add `NavId` and its path to `NAV_PATH` in `Sidebar.tsx`, (2) add `<Route>` in `App.tsx`.
- `NavId` is exported from `Sidebar.tsx`. Current values:

```ts
export type NavId =
  | "dashboard" // path: "/"
  | "inventory" // path: "/inventory"
  | "reports" // path: "/sales-transactions" (SalesTransactions page)
  | "alerts" // path: "/alerts" — nav item is commented out in sidebar
  | "pos" // path: "/pos"
  | "medication" // path: "/dispatches" (Dispatches page)
  | "branches" // path: "/branches"
  | "imports" // path: "/imports" — BRANCH users only
  | "settings"; // path: "/settings"
```

**Role-based nav visibility:**

- `BRANCH_NAV_IDS = ["dashboard", "pos"]` — visible to ALL roles (both warehouse_manager and branch)
- `BRANCH_ONLY_IDS = ["imports"]` — visible to `branch` role only; hidden from `warehouse_manager`
- All other navItems are warehouse_manager only

**Current routes registered in App.tsx:**

| Path                  | Component               | Note                                                |
| --------------------- | ----------------------- | --------------------------------------------------- |
| `/`                   | `<Dashboard />`         |                                                     |
| `/inventory`          | `<Inventory />`         |                                                     |
| `/pos`                | `<POS />`               |                                                     |
| `/dispatches`         | `<Dispatches />`        | NavId: `medication`                                 |
| `/branches`           | `<Branches />`          |                                                     |
| `/imports`            | `<Imports />`           | Branch-only                                         |
| `/alerts`             | `<Alerts />`            | Sidebar link commented out                          |
| `/reports`            | `<Reports />`           | No sidebar link — use `/sales-transactions` instead |
| `/sales-transactions` | `<SalesTransactions />` | NavId: `reports`                                    |
| `/login`              | `<Login />`             | Public                                              |

```tsx
// App.tsx pattern — React Router v6
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<AppLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="/inventory" element={<Inventory />} />
    {/* Add new routes here ↓ */}
  </Route>
</Routes>
```

---

## Data / Types

- Define shared types in `src/types/<domain>.ts` (e.g. `medicine.ts`, `order.ts`).
- Mock/static data lives inside the component file that first uses it, unless shared.
- When data is shared across components on the same page, lift it to the page level or a context.

---

## Anti-patterns — Never Do These

- ❌ Inline `<table>` raw markup on a page — use `<DataTable>` or a feature sub-component.
- ❌ Hand-rolled `<button>` using standard Tailwind button styles — use `<Button>` from common. **Exception:** raw `<button>` is allowed ONLY when the mockup specifies a pill/custom shape that `<Button>` variants cannot match (e.g. `rounded-full` pill with non-standard background).
- ❌ Hardcoded `slate-*`, `blue-*`, `red-*` Tailwind colors — use design tokens.
- ❌ Navigation state inside `Sidebar` — it lives in `App.tsx`.
- ❌ A page file doing data-fetching, layout, AND render logic all at once.

---

## Instruction Maintenance Rules

These instruction files are living documents. **Update them automatically** whenever relevant code changes.

| Event                                         | Files to update                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| New common component added                    | `copilot-instructions.md` — add section; `common/index.ts` — export             |
| Existing common modified (new prop / variant) | `copilot-instructions.md` — update that component's section                     |
| New page created                              | `architecture.instructions.md` — update NavId table + routes table              |
| New nav item added to Sidebar                 | `architecture.instructions.md` — update `NavId` type block + `NAV_PATH` mapping |
| New route added to App.tsx                    | `architecture.instructions.md` — update routes table                            |
| New design token used                         | `design-tokens.instructions.md` — add to relevant table                         |
| New Firestore collection queried/written      | `database.instructions.md` — add collection schema section                      |
| Existing collection schema changed            | `database.instructions.md` — update relevant section                            |
| Collection removed / deprecated               | `database.instructions.md` — remove section; `firestore.ts` — remove dead types |
| `pos.ts` stats write logic changed            | `analytics.instructions.md` — update TRẠNG THÁI HIỆN TẠI note and schema        |

> **RULE (bắt buộc):** Sau khi thay đổi bất kỳ file nào ở trên, **ngay lập tức** update instruction file tương ứng trong cùng 1 turn. Không để instruction drift khỏi code thực tế.
