---
name: msm-pages
description: Step-by-step guide for adding new pages in Medical Supplies Management. Covers file creation, router registration, sidebar entry, PageHeader, thin orchestrator rules, and sub-component folder setup. Reference when creating any new screen.
---

# MSM – Pages Guide

---

## 🚀 How to Add a New Page (Step-by-Step)

Follow these steps **in order**. Missing a step causes the page to be unreachable.

---

### Step 1: Create the Page File

**Path:** `src/pages/FeatureName.tsx`

```tsx
import { PageHeader } from "@/components/common";
import { FeatureMainContent } from "@/components/featureName/FeatureMainContent";

export function FeatureName() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Danh mục
          </span>
        }
        title="Tên Trang"
        subtitle="Mô tả ngắn về trang này."
      />
      <FeatureMainContent />
    </main>
  );
}
```

**Rules:**

- Page file is a **thin orchestrator** — no inline JSX blocks > ~15 lines
- Always wrap with `<main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">`
- Always start with `<PageHeader>`
- No Firebase calls directly in the page — delegate to service functions called from sub-components

**POS Exception:** POS uses special layout:

```tsx
<div className="ml-72 pt-16 flex h-screen overflow-hidden bg-background">
  <ProductGrid /> {/* flex-1 overflow-y-auto */}
  <OrderSummary /> {/* w-[400px] flex-shrink-0 */}
</div>
```

---

### Step 2: Create the Sub-Components Folder

**Path:** `src/components/featureName/`

Required structure:

```
src/components/featureName/
├── FeatureMainContent.tsx     # Main table/list component — owns state, Firestore calls
├── FeatureFormModal.tsx       # Add/Edit modal if needed
└── FeatureFilters.tsx         # Filter bar if complex
```

**Naming rule:** Folder is camelCase noun (`suppliers/`, `settlement/`, `reports/`).

---

### Step 3: Register Route in `src/App.tsx`

```tsx
// 1. Import the page at the top
import { FeatureName } from "@/pages/FeatureName";

// 2. Add inside the protected Route block
<Route path="/feature-name" element={<FeatureName />} />;
```

**Existing routes:**
| Path | Page |
|------|------|
| `/` | Dashboard |
| `/inventory` | Inventory (tabs: medicines, imports, suppliers, units) |
| `/pos` | POS |
| `/dispatches` | Dispatches |
| `/branches` | Branches |
| `/imports` | Imports |
| `/alerts` | Alerts |
| `/reports` | Reports |
| `/sales-transactions` | SalesTransactions |

---

### Step 4: Add to Sidebar (only if user asks)

> ⚠️ **Sidebar.tsx is FROZEN.** Only add here if the user explicitly says "add to sidebar" or "add to navigation menu".

File: `src/components/layout/Sidebar.tsx`

```tsx
// 1. Add to NavId union type
export type NavId = ...|  "featureName";

// 2. Add to NAV_PATH
const NAV_PATH: Record<NavId, string> = {
  ...existing,
  featureName: "/feature-name",
};

// 3. Add to navItems array
const navItems = [
  ...existing,
  { icon: "material_symbol_name", label: "Tên menu", id: "featureName" as NavId },
];

// 4. Add to role visibility if needed
// - BRANCH_NAV_IDS: shown to branch users
// - BRANCH_ONLY_IDS: hidden from warehouse_manager
```

---

### Step 5: Add a Tab to Existing Page (Alternative to New Page)

If the feature is a sub-tab of an existing page (like Inventory's tabs):

```tsx
// In the parent page (e.g., Inventory.tsx):

type InventoryTab = "medicines" | "imports" | "suppliers" | "units" | "newTab";

const INVENTORY_TABS = [
  ...existingTabs,
  { id: "newTab" as InventoryTab, label: "Tên tab mới" },
] as const;

// In the render:
{
  tab === "newTab" && <NewTabComponent />;
}
```

---

## 📋 Page File Template (Full)

```tsx
import { useState } from "react";
import { PageHeader, TabBar, Button } from "@/components/common";
import { FeatureContent } from "@/components/featureName/FeatureContent";
import { FeatureFormModal } from "@/components/featureName/FeatureFormModal";

type FeatureTab = "list" | "history";

const FEATURE_TABS = [
  { id: "list" as FeatureTab, label: "Danh sách" },
  { id: "history" as FeatureTab, label: "Lịch sử" },
] as const;

export function FeaturePage() {
  const [tab, setTab] = useState<FeatureTab>("list");
  const [addOpen, setAddOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Danh mục
          </span>
        }
        title="Tên Trang"
        actions={
          <Button icon="add" onClick={() => setAddOpen(true)}>
            Thêm mới
          </Button>
        }
      />

      <TabBar
        tabs={FEATURE_TABS}
        activeTab={tab}
        onTabChange={(id) => setTab(id as FeatureTab)}
      />

      {tab === "list" && <FeatureContent refetchTrigger={refetchTrigger} />}

      <FeatureFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          setAddOpen(false);
          setRefetchTrigger((n) => n + 1);
        }}
      />
    </main>
  );
}
```
