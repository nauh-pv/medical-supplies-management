---
name: msm-review
description: Pre-commit checklist for Medical Supplies Management with 7 mandatory gates. Run through ALL gates before finishing any task. Catches common mistakes in architecture, design tokens, components, Firebase usage, TypeScript, and summary docs.
---

# MSM – Pre-Commit Review Checklist

> ⚠️ **Run ALL 7 gates before declaring any task complete.** If any gate fails, fix before finishing.

---

## Gate 1: 📁 Files & Architecture

| Check                                      | Rule                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Page file is a thin orchestrator           | No inline JSX block > ~15 lines inside `src/pages/*.tsx`                             |
| Sub-components extracted correctly         | Any section with own state or > ~40 JSX lines → lives in `src/components/<feature>/` |
| New page wraps with correct `<main>` class | `ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background`                        |
| Page starts with `<PageHeader>`            | Not a custom header div                                                              |
| POS page exception respected               | POS uses `pt-16 flex h-screen overflow-hidden` — no PageHeader                       |
| Sidebar / TopBar not modified unless asked | Check `src/layouts/Sidebar.tsx` and `TopBar.tsx` unchanged                           |
| New component in correct folder            | Feature sub-component → `components/<feature>/`, shared → `components/common/`       |

---

## Gate 2: 🎨 Design Tokens

| Check                                | Rule                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| No hardcoded Tailwind palette colors | No `slate-*`, `blue-*`, `red-*`, `gray-*`, `green-*` directly                       |
| Surface hierarchy used correctly     | Use `bg-surface-container-lowest` for cards, `bg-surface-container-low` for headers |
| No 1px borders for separation        | Use background color shifts, not `border-*`                                         |
| Card shadow correct                  | Cards use `shadow-sm`; elevated buttons use `shadow-lg shadow-primary/20`           |
| Correct roundness                    | Large cards: `rounded-[2rem]`; inputs/buttons: `rounded-xl`; pills: `rounded-full`  |
| Primary color via token              | `bg-primary`, `text-primary` — never `bg-blue-700`                                  |
| Text always from token               | `text-on-surface` for body, `text-on-surface-variant` for secondary                 |
| Typography correct                   | Titles: `font-headline`; labels/body: `font-body` or `font-label`                   |

---

## Gate 3: 🧩 Common Components

| Check                                  | Rule                                                       |
| -------------------------------------- | ---------------------------------------------------------- |
| `<Button>` used for all action buttons | Not hand-rolled `<button>` with manual Tailwind styling    |
| `<Badge>` used for all status chips    | Never hand-roll status badges                              |
| `<Input>` used for all text inputs     | Not raw `<input>` with manual styling                      |
| `<Select>` used for all dropdowns      | Never hand-roll `<select>` with icon wrappers and chevron  |
| `<Modal>` used for all dialogs         | Not `position: fixed` overlays, not `window.confirm()`     |
| `<DataTable>` used for tabular data    | Not raw `<table>` unless `DataTable` truly doesn't fit     |
| `<Pagination>` used for paging         | Not custom page number buttons                             |
| `<TabBar>` used for tab navigation     | Not custom tab implementations                             |
| `<PageHeader>` used on every new page  | Not custom page title sections                             |
| New common exported from `index.ts`    | Every new common added to `src/components/common/index.ts` |

---

## Gate 4: 🔥 Firebase / Service Layer

| Check                                                  | Rule                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| Field names match `database.instructions.md` exactly   | Never rename fields in code                                          |
| Denormalized fields used                               | Copy `name`, `sku`, etc. per schema — no extra reads at display time |
| Monetary values as `number` in VNĐ                     | Never formatted strings, never floats with decimals                  |
| Timestamps use Firestore `Timestamp`                   | Never `string` or `Date` for Firestore timestamps                    |
| `runTransaction` used for multi-doc writes             | Never multiple `setDoc`/`updateDoc` calls that must be atomic        |
| Reads before writes in transactions                    | All `tx.get()` calls must happen before any `tx.set()`/`tx.update()` |
| Never query `pos_transactions` for charts              | Use `daily_stats` / `monthly_stats` subcollections                   |
| `daily_stats` updated in same transaction as POS write | Never update stats separately                                        |
| `id` field mirrors document ID                         | Always set `id: ref.id` when creating documents                      |
| Soft delete used where appropriate                     | Set `isActive: false` — never `deleteDoc` for supplier/medicine      |

---

## Gate 5: 📐 TypeScript

| Check                                             | Rule                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| No `any` types                                    | Use proper interfaces from `src/types/firestore.ts`                |
| Firestore types imported from `@/types/firestore` | Never redeclare existing types inline                              |
| Props interfaces defined for every component      | Components are not untyped                                         |
| Async functions have typed return values          | `async function foo(): Promise<SomeType>`                          |
| Event handlers typed correctly                    | `(e: React.FormEvent)`, `(e: React.ChangeEvent<HTMLInputElement>)` |

---

## Gate 6: 🔐 Security

| Check                                             | Rule                                                    |
| ------------------------------------------------- | ------------------------------------------------------- |
| No credential, API key, or env value in source    | Only in environment files, never hardcoded              |
| User input sanitized before Firestore write       | `.trim()` on all string inputs                          |
| No unvalidated user IDs in Firestore paths        | Always use authenticated user UID from context          |
| Destructive actions (delete) require confirmation | Use Modal confirm dialog — never direct delete on click |

---

## Gate 7: 📄 Summary Doc

| Check                                                    | Rule                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| Summary doc created if task was a feature/service/config | File at `docs/summaries/YYYY-MM-DD_<slug>.md`                             |
| Summary doc NOT needed for bug fixes or 1-line changes   | Don't over-document                                                       |
| Summary follows required template                        | Includes: Tóm tắt, Files đã tạo/chỉnh sửa, Giải thích kỹ thuật, Cách dùng |

---

## 🚨 Quick Verification Commands

```bash
# Check for hardcoded Tailwind palette colors in changed files
grep -rn "slate-\|blue-\|red-\|gray-\|green-\|amber-" src/components/ src/pages/

# Check for window.confirm usage
grep -rn "window.confirm" src/

# Check for hand-rolled selects (should use <Select>)
grep -rn "<select " src/

# Check for raw borders (should use bg shifts)
grep -rn "border-[a-z]" src/components/ src/pages/

# Check TypeScript errors
npx tsc --noEmit
```
