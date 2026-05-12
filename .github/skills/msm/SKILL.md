---
name: msm
description: Main orchestrator for the Medical Supplies Management web project. Enforces planning gate, directory rules, and review checklist. Always active. Use alongside msm-* specialist skills.
---

# MSM – Workflow Orchestrator

## 🤝 Specialist Skills

| Skill             | Use when                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `msm-planning`    | **MANDATORY FIRST STEP** — plan template, ask_user approval gate, anti-patterns                       |
| `msm-components`  | Building UI — which common component to use, props, anti-patterns                                     |
| `msm-patterns`    | Coding — Firebase queries, useState/useEffect, form handling, loading states                          |
| `msm-api`         | Firebase service layer — how to add new service functions, Firestore patterns                         |
| `msm-pages`       | Creating a new page — folder setup, router, sidebar, PageHeader, thin orchestrators                   |
| `msm-conventions` | Code style — naming, imports, TypeScript rules, file structure, 200-line guideline                    |
| `msm-review`      | Pre-commit checklist — 7 gates covering design tokens, architecture, components, Firebase, TypeScript |

---

## ⚠️ Critical Directory Rules

| Directory                | Access        | Rule                                                                     |
| ------------------------ | ------------- | ------------------------------------------------------------------------ |
| `src/`                   | ✅ Read/Write | **Only place to modify source code**                                     |
| `src/components/common/` | ⚠️ Caution    | Shared primitives — only modify when adding/changing a common component  |
| `src/layout/`            | ⚠️ Caution    | Sidebar & TopBar are **frozen** — only change if user explicitly says so |
| `public/`                | ❌ Rarely     | Only for static assets when needed                                       |
| `scripts/`               | ❌ Never      | Seed scripts — only run, never modify unless asked                       |
| `docs/summaries/`        | ✅ Write      | Create summary doc after every feature/config/service task               |

---

## 🔄 Mandatory Workflow (3 Phases)

| Phase             | Required Steps                                                                           | Hard Gate                                 |
| ----------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| 🟡 **1. Plan**    | Read relevant instruction files → analyze scope → write plan → present with `ask_user`   | ⛔ No code before user selects "Approved" |
| 🟢 **2. Execute** | Apply changes only in `src/` → follow `msm-conventions` → use existing common components | —                                         |
| 🔴 **3. Review**  | Run `msm-review` checklist → create summary doc → `ask_user` for verification            | ⛔ Never self-declare done                |

---

## 🔒 Frozen Files (Do NOT Touch Unless Explicitly Asked)

```
src/layouts/Sidebar.tsx    ← Never add routes here unless user says "update sidebar"
src/layouts/TopBar.tsx     ← Never change unless user asks
src/main.tsx               ← Only change for global provider additions
tailwind.config.js         ← Only change for new design token additions
```

---

## 📋 Instruction Files to Read Before Coding

| File                            | Read when                                              |
| ------------------------------- | ------------------------------------------------------ |
| `architecture.instructions.md`  | Creating any new page or component                     |
| `design-tokens.instructions.md` | Choosing any color, spacing, or typography class       |
| `database.instructions.md`      | Writing any Firebase query or service function         |
| `analytics.instructions.md`     | Working with charts or stats aggregation               |
| `copilot-instructions.md`       | Checking available common components before writing UI |
