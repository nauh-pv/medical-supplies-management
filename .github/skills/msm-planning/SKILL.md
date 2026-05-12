---
name: msm-planning
description: "MANDATORY FIRST STEP — The Agent MUST run this skill BEFORE any coding task. Read instruction files, produce a plan, present it, then call ask_user for approval. No plan = no code. No ask_user confirmation = no code. Only exception: single-line changes (typo, string, color value)."
---

# MSM – Planning Guide

---

## ⛔ HARD STOP — `ask_user` Confirmation is NON-NEGOTIABLE

After presenting any plan, the Agent MUST call `ask_user`. This is a blocking gate — no `edit`, `create`, or code-writing tool may be called until the user selects "Approved".

**Rules:**

- ❌ Presenting a plan and writing code in the **same response** = VIOLATION
- ❌ Assuming silence or "looks good" in plain text = approval = VIOLATION
- ❌ Saying "Let me know if this is correct" without `ask_user` = VIOLATION
- ✅ The ONLY valid approval is the user clicking "Approved" from `ask_user` options

---

## 📋 When Is a Plan Required?

| Scenario                           | Plan required? |
| ---------------------------------- | -------------- |
| New page or feature                | ✅ Yes         |
| New service function(s)            | ✅ Yes         |
| Changes touching 3+ files          | ✅ Yes         |
| Modifying a common component       | ✅ Yes         |
| Bug fix touching 1–2 lines         | ❌ No          |
| Typo / string value / single color | ❌ No          |

---

## 🔍 Pre-Planning Checklist (Do Before Writing Plan)

1. **Read instruction files** relevant to the task:
   - Architecture → before creating page or component file
   - Design tokens → before choosing any color/spacing
   - Database → before writing Firebase query
   - Analytics → before working with charts/stats
   - `copilot-instructions.md` → before writing any UI primitive

2. **Check existing commons** — does a `Button`, `Modal`, `Input`, `DataTable`, `Badge`, `Select`, etc. already exist?

3. **Check existing services** — does `inventory.ts`, `pos.ts`, `dashboard.ts`, `auth.ts`, `user.ts` already have what you need?

4. **Check existing pages** — is there a similar page pattern to follow?

---

## 📝 Plan Format

### Small Task (bug fix, add prop, 1–2 files)

```
## Task
[One sentence — restate what needs to be done.]

## Files Affected
- MODIFY: path/to/file.ts — what changes
```

### Medium Task (new feature/component, 3–7 files)

```
## Task
[1–2 sentences — what and why.]

## Approach
[How to solve this. Which pattern to follow.]

## Files
- CREATE: src/components/feature/ComponentName.tsx — purpose
- MODIFY: src/pages/Page.tsx — add import + render component
- MODIFY: src/services/service.ts — add service function
```

### Large Task (new page, major feature, 7+ files)

```
## Task
[What the user wants. Business context.]

## Analysis
[Key decisions: which collection(s) to query, which common components to reuse,
 which existing patterns to follow, what NOT to do.]

## Files
- CREATE: [list all new files with full paths and purpose]
- MODIFY: [list all modified files with what changes]

## Data Flow
[How data moves: Firestore → service function → component → UI]

## Out of Scope
[Things explicitly NOT being done in this task]
```

---

## ⚠️ Common Planning Anti-Patterns

| ❌ Wrong                                          | ✅ Correct                                                      |
| ------------------------------------------------- | --------------------------------------------------------------- |
| Hand-rolling a modal with `position: fixed`       | Use `<Modal>` from `@/components/common`                        |
| Querying `pos_transactions` for chart aggregation | Read `daily_stats` or `monthly_stats` subcollection             |
| Adding inline JSX > 15 lines to a page file       | Extract to a sub-component in `src/components/<feature>/`       |
| Creating a new color class not in design tokens   | Use existing token classes from `design-tokens.instructions.md` |
| Using `window.confirm()` for delete confirmation  | Use `<Modal>` confirm dialog                                    |
| Writing a `<select>` with manual styling          | Use `<Select>` from `@/components/common`                       |
| Modifying Sidebar/TopBar without user asking      | Check frozen file list in `msm` orchestrator skill              |
| Hardcoding `slate-*`, `blue-*`, `red-*` colors    | Use design token classes only                                   |
