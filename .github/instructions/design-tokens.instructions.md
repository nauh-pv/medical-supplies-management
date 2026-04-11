---
applyTo: "src/**/*.{tsx,ts}"
---

# Design Tokens — Medical Supplies Management

> **ALWAYS use these token classes. Never use raw Tailwind palette colors (`slate-*`, `blue-*`, `red-*`).**

---

## Surface Hierarchy (use for containment — no borders)

| Token class                   | Hex       | Usage                                     |
| ----------------------------- | --------- | ----------------------------------------- |
| `bg-background`               | `#f8f9fa` | Page base, `<main>`                       |
| `bg-surface-container-low`    | `#f3f4f5` | Table headers, sidebar, secondary areas   |
| `bg-surface-container`        | `#edeeef` | Support cards, chip/filter backgrounds    |
| `bg-surface-container-high`   | `#e7e8e9` | Hover states, divider replacement         |
| `bg-surface-container-lowest` | `#ffffff` | Cards, data tables, primary work surfaces |
| `bg-surface-bright`           | `#f8f9fa` | Row hover highlight                       |
| `bg-surface-variant`          | `#e1e3e4` | Active hover on ghost elements            |

**Rule:** To separate two sections, use a gap with `bg-surface-container-low` — never a 1px border.

---

## Primary / Brand

| Token class                                       | Usage                               |
| ------------------------------------------------- | ----------------------------------- |
| `bg-primary` / `text-primary`                     | `#0050cb` — CTAs, active nav, links |
| `bg-primary-container` / `text-primary-container` | `#0066ff` — gradient end            |
| `bg-primary-fixed`                                | `#dae1ff` — icon container tint     |
| `bg-primary/5`                                    | Hover bg on ghost items             |
| `bg-primary/10`                                   | Info badge bg                       |
| `shadow-primary/20`                               | Elevated button shadow              |

**Gradient:** `bg-gradient-to-br from-primary to-primary-container` at 135° for hero elements.

---

## Semantic Colors

| Purpose              | Background              | Text                         | When to use                                           |
| -------------------- | ----------------------- | ---------------------------- | ----------------------------------------------------- |
| Success / In stock   | `bg-green-100`          | `text-green-700`             | Positive status (use via `<Badge variant="success">`) |
| Warning / Low stock  | `bg-amber-100`          | `text-amber-700`             | Alert (use via `<Badge variant="warning">`)           |
| Error / Out of stock | `bg-error-container`    | `text-error`                 | Negative (`bg-error` = `#ba1a1a`)                     |
| Info / Prescribed    | `bg-primary/10`         | `text-primary`               | Neutral-positive                                      |
| Tertiary / Special   | `bg-tertiary-container` | `text-on-tertiary-container` | Distinct alert cards                                  |

**Always use `<Badge>` for status chips — never hand-roll them.**

---

## Text Colors

| Token                     | Hex       | Usage                                       |
| ------------------------- | --------- | ------------------------------------------- |
| `text-on-surface`         | `#191c1d` | Body copy, headings — never use pure black  |
| `text-on-surface-variant` | `#424656` | Labels, captions, secondary text            |
| `text-on-primary`         | `#ffffff` | Text on primary-colored buttons/backgrounds |

---

## Typography

| Class                       | Font    | Usage                                           |
| --------------------------- | ------- | ----------------------------------------------- |
| `font-headline`             | Manrope | Page titles `h1`–`h3`, stat values, card titles |
| `font-body` or `font-label` | Inter   | Body text, labels, table cells, buttons         |

**Heading sizes by context:**

| Context               | Size                                       |
| --------------------- | ------------------------------------------ |
| Page title (hero)     | `text-4xl font-extrabold`                  |
| Page title (normal)   | `text-3xl font-extrabold`                  |
| Section card title    | `text-xl font-bold`                        |
| Table section heading | `text-lg font-bold`                        |
| KPI value             | `text-5xl font-extrabold tracking-tighter` |

**Labels/category headers:** `text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant`

---

## Spacing & Roundness

| Element                            | Rounding           |
| ---------------------------------- | ------------------ |
| Large content cards / panels       | `rounded-[2rem]`   |
| Medium cards (e.g. stat cards)     | `rounded-[1.5rem]` |
| Pill-style containers / stat cards | `rounded-full`     |
| Buttons, inputs, chips             | `rounded-xl`       |
| Pill buttons / pill selects        | `rounded-full`     |
| Avatars, dots                      | `rounded-full`     |
| Small icon containers              | `rounded-lg`       |

**Rule:** Always derive roundness from mockup first, then fall back to this table. When the mockup shows a pill shape, always use `rounded-full`.

**Page content:** `px-8 pb-12 pt-24 space-y-8`  
**Card inner padding:** `p-6` (sm card) / `p-8` (lg card)

---

## Elevation / Shadow

| Usage                   | Class                                                       |
| ----------------------- | ----------------------------------------------------------- |
| Cards & panels          | `shadow-[0_20px_40px_rgba(0,80,203,0.03)]`                  |
| Elevated primary button | `shadow-lg shadow-primary/20`                               |
| Floating modal          | `shadow-[0_20px_40px_rgba(0,80,203,0.06)] backdrop-blur-xl` |
| TopBar                  | `shadow-[0_20px_40px_rgba(0,80,203,0.06)]`                  |

**Prefer tinted ambient shadows above over generic Tailwind shadows.** Exception: `shadow-sm` is allowed for subtle card elevation (e.g. rounded-full stat cards, table containers) when no specific tinted shadow is specified in the mockup.

---

## Material Symbols Usage

Icons come from `material-symbols-outlined` (variable font). Use `text-[size]` for sizing.

```tsx
<span className="material-symbols-outlined">inventory_2</span>
```

Common icons in this project:  
`dashboard` `inventory_2` `local_shipping` `analytics` `settings` `add` `search` `filter_list`  
`download` `export_notes` `more_vert` `chevron_left` `chevron_right` `trending_up` `trending_down`  
`warning` `timer` `payments` `medication` `pill` `vaccines` `medication_liquid`
