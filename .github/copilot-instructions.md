---
applyTo: "src/**/*.{tsx,ts}"
---

# UI Common Components — Medical Supplies Management

> **RULES (enforce every time):**
>
> 1. **Always check this registry before writing any UI.** Reuse existing commons — never duplicate.
> 2. Read `architecture.instructions.md` before creating any new page or component file.
> 3. Read `design-tokens.instructions.md` before choosing any color, spacing, or typography class.
> 4. When a new common is **created**: add it to `src/components/common/index.ts` AND add a section here.
> 5. When a common is **modified** (new prop, new variant, changed behaviour): update the relevant section in this file to reflect the change.
> 6. Never use hardcoded Tailwind colors (`slate-*`, `blue-*`, `red-*`). Always use design-token classes.
> 7. **When the user sends an HTML mockup:** ONLY implement/update the components explicitly shown in that mockup. Never touch, refactor, or "improve" any other existing UI component that is not shown in the mockup. If a component already exists and the mockup shows an updated version of it, replace it with the new mockup version exactly — do not keep the old version.
> 8. **Always prefer common components.** Before writing any UI primitive (button, badge, input, modal, table, pagination, stat card…), check if a matching common already exists. If a pattern appears in ≥ 2 places, extract it into `src/components/common/` immediately.
> 9. **Always decompose large components.** Any JSX block > ~40 lines or with its own internal state must be extracted into a named sub-component in the appropriate `src/components/<feature>/` folder. Pages in `src/pages/` must remain thin orchestrators with no inline JSX blocks longer than ~15 lines.

---

## Design System Summary (from DESIGN.md)

- **No 1px borders** — use background-color shifts (`surface-container-low`, `surface-container-lowest`, etc.) for containment.
- **Shadow:** `shadow-[0_20px_40px_rgba(0,80,203,0.03)]` for cards; `shadow-lg shadow-primary/20` for elevated buttons; `shadow-sm` for subtle card elevation.
- **Fonts:** `font-headline` (Manrope) for titles/display; `font-body`/`font-label` (Inter) for body/UI.
- **Roundness:** `rounded-[2rem]` for large content cards; `rounded-full` for pill-style cards/buttons/selects; `rounded-xl` for inputs & standard buttons.
- **Text color:** Always use `text-on-surface` (#191c1d), never pure black.
- **Primary:** `#0050cb` / `bg-primary`. Gradients: `from-primary to-primary-container` at 135°.

---

## Available Common Components

All exported from `@/components/common`.

### `<Button>`

**File:** `src/components/common/Button.tsx`

Variants: `primary` (default) | `ghost` | `danger`  
Sizes: `sm` | `md` (default) | `lg`  
Props: `icon?: string` (Material Symbol name), `iconPosition?: "left" | "right"`

```tsx
import { Button } from "@/components/common";

<Button variant="primary" icon="file_download">Tải báo cáo</Button>
<Button variant="ghost" icon="print" iconPosition="right">Xuất PDF</Button>
<Button variant="danger" icon="delete">Xóa</Button>
```

---

### `<Badge>`

**File:** `src/components/common/Badge.tsx`

Variants: `success` | `warning` | `error` | `info` | `neutral` (default)  
Props: `dot?: boolean` — shows a colored dot before text

```tsx
import { Badge } from "@/components/common";

<Badge variant="success" dot>Còn hàng</Badge>
<Badge variant="warning">Sắp hết</Badge>
<Badge variant="error">Hết hàng</Badge>
<Badge variant="info">Mới nhập</Badge>
```

---

### `<StatCard>`

**File:** `src/components/common/StatCard.tsx`

Props: `label`, `value`, `trend?` (e.g. "+12.5%"), `trendUp?`, `icon?` (Material Symbol), `progress?` (0–100), `children?` (custom bottom content)

```tsx
import { StatCard } from "@/components/common";

<StatCard
  label="Tổng doanh thu"
  value="$1.2M"
  trend="+12.5%"
  trendUp
  icon="payments"
  progress={75}
/>;
```

---

### `<Input>`

**File:** `src/components/common/Input.tsx`

Props: `label?`, `leadingIcon?`, `trailingIcon?` (Material Symbol names), `error?`, `hint?` + all native `<input>` attributes

```tsx
import { Input } from "@/components/common";

<Input
  label="Tìm kiếm SKU"
  leadingIcon="search"
  placeholder="VD: MED-00123"
/>
<Input label="Email" type="email" error="Email không hợp lệ" />
```

---

### `<SectionLabel>`

**File:** `src/components/common/SectionLabel.tsx`

Use for category/section headers. All-caps, wide tracking, no decorative lines.

```tsx
import { SectionLabel } from "@/components/common";

<SectionLabel>Kho Chính</SectionLabel>;
```

---

### `<PageHeader>`

**File:** `src/components/common/PageHeader.tsx`

Asymmetric editorial header — title bottom-left, actions bottom-right.  
Props: `eyebrow?` (ReactNode above title), `title`, `subtitle?`, `actions?`, `titleSize?` (default `"text-3xl"`)

```tsx
import { PageHeader, Button } from "@/components/common";

<PageHeader
  eyebrow={
    <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
      Cơ sở dữ liệu
    </span>
  }
  title="Quản lý Kho Tổng"
  titleSize="text-4xl"
  subtitle={
    <>
      Trạng thái:{" "}
      <span className="text-green-600 font-semibold">Đang hoạt động</span>
    </>
  }
  actions={
    <>
      <Button variant="ghost">Xuất PDF</Button>
      <Button icon="file_download">Tải báo cáo</Button>
    </>
  }
/>;
```

---

### `<DataTable>`

**File:** `src/components/common/DataTable.tsx`

No-line table: alternating row fills, hover highlight, no dividers, label uppercase headers. Generic over row type `T`.

Props: `columns: Column<T>[]`, `data: T[]`, `keyField: keyof T`, `emptyText?`

```tsx
import { DataTable } from "@/components/common";
import type { Column } from "@/components/common";

type Product = { id: string; name: string; stock: number };

const columns: Column<Product>[] = [
  { key: "id", header: "Mã SKU" },
  { key: "name", header: "Tên sản phẩm" },
  {
    key: "stock",
    header: "Tồn kho",
    render: (row) => (
      <Badge variant={row.stock > 10 ? "success" : "warning"}>
        {row.stock}
      </Badge>
    ),
  },
];

<DataTable columns={columns} data={products} keyField="id" />;
```

---

### `<Pagination>`

**File:** `src/components/common/Pagination.tsx`

Smart page number list with ellipsis. Never build raw pagination buttons elsewhere.

Props: `currentPage`, `totalPages`, `onPageChange`, `className?`

```tsx
import { Pagination } from "@/components/common";

<Pagination currentPage={page} totalPages={321} onPageChange={setPage} />;
```

---

### `<TabBar>`

**File:** `src/components/common/TabBar.tsx`

Variants: `underline` (default) — border-bottom style for page-level tabs | `pill` — filled chip style for section-level tabs  
Props: `tabs: { id: string; label: string }[]`, `activeTab: string`, `onTabChange: (id: string) => void`, `variant?`, `className?`

```tsx
import { TabBar } from "@/components/common";

const TABS = [
  { id: "medicines", label: "Kho thuốc" },
  { id: "imports", label: "Quản lý nhập kho" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// Underline variant (page-level tabs)
<TabBar tabs={TABS} activeTab={tab} onTabChange={(id) => setTab(id as TabId)} />

// Pill variant (section-level tabs)
<TabBar tabs={TABS} activeTab={tab} onTabChange={(id) => setTab(id as TabId)} variant="pill" />
```

---

### `<Modal>`

**File:** `src/components/common/Modal.tsx`

Glassmorphism dialog. Closes on backdrop click **and** Escape key. Always use this — never build raw `<dialog>` or `position: fixed` modals inline.

Props: `open`, `onClose`, `title`, `subtitle?` (shown below title in header), `children`, `maxWidth?` (Tailwind class, default `"max-w-xl"`)

```tsx
import { Modal, Button, Input } from "@/components/common";

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Thêm Thuốc Mới"
  subtitle="Đăng ký dược phẩm mới vào cơ sở dữ liệu."
  maxWidth="max-w-lg"
>
  <div className="px-10 py-8 space-y-6">
    <Input label="Tên thuốc" placeholder="VD: Atorvastatin 20mg" />
    <div className="flex gap-3 pt-2">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(false)}
        className="flex-1 justify-center"
      >
        Hủy bỏ
      </Button>
      <Button icon="save" className="flex-1 justify-center">
        Lưu Thông Tin
      </Button>
    </div>
  </div>
</Modal>;
```

---

## How to Add a New Common

1. Create file in `src/components/common/YourComponent.tsx`.
2. Export it in `src/components/common/index.ts`.
3. Add a section to **this file** documenting: variants/props + a usage snippet.
