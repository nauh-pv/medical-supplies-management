---
applyTo: "src/**/*.{tsx,ts}"
---

# UI Common Components — Medical Supplies Management

> **RULE:** Before building any UI, read this file first. Always reuse existing common components. Only build new ones when there is no suitable match. Update this file whenever a new common is added.

---

## Design System Summary (from DESIGN.md)

- **No 1px borders** — use background-color shifts (`surface-container-low`, `surface-container-lowest`, etc.) for containment.
- **Shadow:** `shadow-[0_20px_40px_rgba(0,80,203,0.03)]` for cards; `shadow-lg shadow-primary/20` for elevated buttons.
- **Fonts:** `font-headline` (Manrope) for titles/display; `font-body`/`font-label` (Inter) for body/UI.
- **Roundness:** `rounded-xl` (0.5rem) for inputs & buttons; `rounded-[1.5rem]` or `rounded-full` for cards.
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

```tsx
import { PageHeader, Button } from "@/components/common";

<PageHeader
  title="Tổng quan Kho hàng"
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

No-line table: alternating row fills, no dividers, label-md uppercase headers. Generic over row type `T`.

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

## How to Add a New Common

1. Create file in `src/components/common/YourComponent.tsx`.
2. Export it in `src/components/common/index.ts`.
3. Add a section to this file documenting: variants/props + a usage snippet.
