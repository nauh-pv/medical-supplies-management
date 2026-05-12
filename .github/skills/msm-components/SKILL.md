---
name: msm-components
description: Component decision guide for Medical Supplies Management. Which common component to use for which UI pattern, key props, anti-patterns. Reference before building any UI to avoid duplicating existing components.
---

# MSM – Component Decision Guide

> **Rule**: ALWAYS check this guide before writing any UI primitive. There are 11 common components covering all standard patterns.

All commons imported from `@/components/common`.

---

## 🧭 Decision Tree — "Which component do I need?"

```
Need a clickable action?          → <Button>
Need a status chip/tag?           → <Badge>
Need a text input?                → <Input>
Need a dropdown select?           → <Select>
Need a dialog/popup?              → <Modal>
Need a data table?                → <DataTable>
Need page numbers?                → <Pagination>
Need horizontal tabs?             → <TabBar>
Need a KPI / stat card?           → <StatCard>
Need a section category header?   → <SectionLabel>
Need a page title area?           → <PageHeader>
```

---

## `<Button>`

**Variants:** `primary` (default) | `ghost` | `danger`  
**Sizes:** `sm` | `md` (default) | `lg`  
**Props:** `icon?` (Material Symbol name), `iconPosition?: "left" | "right"`

```tsx
<Button variant="primary" icon="add">Thêm mới</Button>
<Button variant="ghost" icon="print">Xuất PDF</Button>
<Button variant="danger" icon="delete">Xóa</Button>
```

**Anti-patterns:**

- ❌ Never hand-roll `<button className="bg-primary rounded-xl ...">`
- ❌ Never use `bg-blue-600` directly on a button

---

## `<Badge>`

**Variants:** `success` | `warning` | `error` | `info` | `neutral`  
**Props:** `dot?: boolean`

```tsx
<Badge variant="success" dot>Còn hàng</Badge>
<Badge variant="warning">Sắp hết</Badge>
<Badge variant="error">Hết hàng</Badge>
<Badge variant="info">Kê đơn</Badge>
```

**Anti-patterns:**

- ❌ Never hand-roll `<span className="bg-green-100 text-green-700 ...">` status pills

---

## `<Input>`

**Props:** `label?`, `leadingIcon?`, `trailingIcon?`, `error?`, `hint?` + all native `<input>` attrs

```tsx
<Input label="Tên thuốc" placeholder="VD: Atorvastatin 20mg" />
<Input leadingIcon="search" placeholder="Tìm kiếm..." value={search} onChange={...} />
<Input label="Email" type="email" error="Email không hợp lệ" />
```

**Anti-patterns:**

- ❌ Never use raw `<input>` with manual padding/border styling
- ❌ Never add a Material Symbol icon next to a raw `<input>` manually

---

## `<Select>`

**Variants:** `default` (rounded-xl, form style) | `pill` (rounded-full, filter bar style)  
**Props:** `label?`, `leadingIcon?`, `error?`, `variant?` + all native `<select>` attrs

```tsx
// Form style
<Select label="Nhà cung cấp" value={val} onChange={...}>
  <option value="">Chọn...</option>
  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</Select>

// Pill style (filter bar — wrap with fixed width)
<div className="w-48">
  <Select variant="pill" leadingIcon="warehouse" value={loc} onChange={...}>
    <option value="WAREHOUSE">Kho Tổng</option>
  </Select>
</div>
```

**Anti-patterns:**

- ❌ Never hand-roll `<select>` with chevron icon and manual wrapper div

---

## `<Modal>`

**Props:** `open`, `onClose`, `title`, `subtitle?`, `children`, `maxWidth?` (default `"max-w-xl"`)

Closes on **backdrop click** and **Escape key** automatically.

```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Xác nhận xóa"
  maxWidth="max-w-md"
>
  <div className="px-10 py-8 space-y-6">
    <p className="text-sm text-on-surface-variant">Bạn có chắc không?</p>
    <div className="flex gap-3">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(false)}
        className="flex-1 justify-center"
      >
        Hủy
      </Button>
      <Button variant="danger" className="flex-1 justify-center">
        Xóa
      </Button>
    </div>
  </div>
</Modal>
```

**Anti-patterns:**

- ❌ Never use `window.confirm()` for destructive confirmations
- ❌ Never build `position: fixed` overlay manually
- ❌ Never use raw `<dialog>` element

---

## `<DataTable>`

**Props:** `columns: Column<T>[]`, `data: T[]`, `keyField: keyof T`, `emptyText?`

```tsx
const columns: Column<SupplierDoc>[] = [
  { key: "code", header: "Mã NCC" },
  { key: "name", header: "Tên nhà cung cấp" },
  {
    key: "id",
    header: "Trạng thái",
    render: (row) => (
      <Badge variant="success" dot>
        Đang hợp tác
      </Badge>
    ),
  },
];

<DataTable
  columns={columns}
  data={suppliers}
  keyField="id"
  emptyText="Chưa có NCC"
/>;
```

---

## `<Pagination>`

**Props:** `currentPage`, `totalPages`, `onPageChange`, `className?`

```tsx
<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
```

**Anti-patterns:**

- ❌ Never build custom page number buttons

---

## `<TabBar>`

**Variants:** `underline` (page-level) | `pill` (section-level)  
**Props:** `tabs`, `activeTab`, `onTabChange`, `variant?`

```tsx
// Page-level tabs
<TabBar tabs={TABS} activeTab={tab} onTabChange={id => setTab(id as TabId)} />

// Section-level tabs
<TabBar tabs={SUBTABS} activeTab={subtab} onTabChange={...} variant="pill" />
```

---

## `<StatCard>`

**Props:** `label`, `value`, `trend?`, `trendUp?`, `icon?`, `progress?`, `children?`

```tsx
<StatCard
  label="Tổng doanh thu"
  value="₫12.5M"
  trend="+8.3%"
  trendUp
  icon="payments"
/>
```

---

## `<PageHeader>`

**Props:** `eyebrow?`, `title`, `subtitle?`, `actions?`, `titleSize?`

```tsx
<PageHeader
  eyebrow={
    <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
      Kho hàng
    </span>
  }
  title="Quản lý Kho Tổng"
  subtitle="Mô tả ngắn"
  actions={<Button icon="file_download">Xuất</Button>}
/>
```

---

## `<SectionLabel>`

```tsx
<SectionLabel>Kho Chính</SectionLabel>
```

---

## When to Create a New Common

Extract to `src/components/common/` only if:

1. The same UI pattern appears in **≥ 2 different feature folders**
2. The pattern is a pure presentational primitive (no feature-specific data)

After creating:

1. Export from `src/components/common/index.ts`
2. Document in `copilot-instructions.md` under "Available Common Components"
