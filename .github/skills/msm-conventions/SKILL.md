---
name: msm-conventions
description: Code conventions, TypeScript rules, import order, naming, file structure, and development rules for Medical Supplies Management. Reference before writing any code to ensure consistent style.
---

# MSM – Code Conventions

---

## Code Style Rules

| Rule                | Value                                                       |
| ------------------- | ----------------------------------------------------------- |
| Language            | TypeScript (strict)                                         |
| Module system       | ES6 imports — no `require()`                                |
| Quotes              | Double quotes in JSX attributes; single in TS if consistent |
| Trailing semicolons | Yes                                                         |
| Indentation         | 2 spaces                                                    |
| Max file lines      | ~200 lines guideline — extract if larger                    |
| Empty lines         | Max 1 consecutive                                           |

---

## Import Order

```typescript
// 1. React
import { useState, useEffect } from "react";

// 2. External packages
import { collection, getDocs } from "firebase/firestore";

// 3. Internal aliases (@/)
import { Button, Modal, Input } from "@/components/common";
import { db } from "@/services/firebase";
import type { SupplierDoc } from "@/types/firestore";

// 4. Relative imports (./)
import { SupplierTable } from "./SupplierTable";
```

---

## Naming Conventions

| Entity                         | Convention               | Example                                         |
| ------------------------------ | ------------------------ | ----------------------------------------------- |
| Page files                     | PascalCase               | `Inventory.tsx`, `Settlement.tsx`               |
| Component files                | PascalCase               | `SupplierTable.tsx`, `BranchFormModal.tsx`      |
| Service files                  | camelCase                | `inventory.ts`, `pos.ts`                        |
| Type files                     | camelCase                | `firestore.ts`, `medicine.ts`                   |
| Component folders              | camelCase (feature noun) | `suppliers/`, `reports/`, `dashboard/`          |
| Constants                      | UPPER_SNAKE_CASE         | `ITEMS_PER_PAGE`, `WAREHOUSE_ID`                |
| Boolean state                  | `is*` or `has*` prefix   | `isLoading`, `hasError`, `isOpen`               |
| Handler functions              | `handle*` or verb        | `handleSubmit`, `handleDelete`, `loadSuppliers` |
| Async loaders inside component | `load*`                  | `loadSuppliers()`, `loadBranches()`             |

---

## Component Naming Consistency Rule (CRITICAL)

Feature folder → component name must be consistent:

```
Folder:    src/components/suppliers/
File:      SupplierTable.tsx
Export:    export function SupplierTable()
```

```
Folder:    src/components/settlement/
File:      SettlementFilterBar.tsx
Export:    export function SettlementFilterBar()
```

---

## JSX Conventions

```tsx
// ✅ Self-close empty elements
<Input label="Name" />

// ✅ Extract logic — no inline IIFE or inline ternary chains > 2 conditions
const badgeVariant = stock === 0 ? "error" : stock < 10 ? "warning" : "success";
<Badge variant={badgeVariant}>{stock}</Badge>

// ✅ Boolean short-circuit for conditional rendering
{isLoading && <Spinner />}
{!isLoading && <DataTable ... />}

// ✅ className strings stay readable — break onto new line for > 3 classes
<div className={[
  "flex items-center gap-4",
  isActive ? "bg-primary/10" : "bg-surface-container-low",
].join(" ")}
```

---

## TypeScript Rules

| Rule                                       | Detail                                                             |
| ------------------------------------------ | ------------------------------------------------------------------ |
| No `any`                                   | Use proper types from `@/types/firestore`                          |
| Prefer `interface` over `type` for objects | `interface SupplierForm { ... }`                                   |
| Form state typed with an interface         | Never untyped form objects                                         |
| Handler event types explicit               | `(e: React.FormEvent)`, `(e: React.ChangeEvent<HTMLInputElement>)` |
| Firestore types imported, not redeclared   | Use `SupplierDoc`, `MedicineDoc`, etc. from `@/types/firestore`    |
| Enum-like strings as `const`               | `const WAREHOUSE_ID = "WAREHOUSE" as const`                        |

---

## File Structure Rules

| Rule                               | Detail                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Page = thin orchestrator           | No direct Firebase calls in page files — delegate to service functions |
| Sub-component has own state        | If a section manages its own `useState`, extract to sub-component      |
| Service functions are pure async   | No React imports, no side effects, just Firestore calls                |
| Types in `src/types/firestore.ts`  | Shared Firestore types — not in component files                        |
| Local form types in component file | `SupplierForm` interface defined at top of `SupplierTable.tsx`         |
