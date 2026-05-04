# DataTable Unification — Replace All Raw Tables

**Ngày:** 2026-04-26  
**Loại:** Feature

---

## Tóm tắt

Mở rộng `DataTable` common component với 8 prop mới (`loading`, `showIndex`, `indexOffset`, `headerRowClassName`, `rowClassName`, `footer`, `tableClassName`, `keyField` optional) và thay thế toàn bộ 15 lần dùng `<table>` thô trong 14 file bằng `<DataTable>`. Tất cả bảng giờ có STT (`showIndex`) và skeleton loading nhất quán.

---

## Files đã tạo / chỉnh sửa

| File                                                  | Hành động | Mô tả                                                                                                 |
| ----------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `src/components/common/DataTable.tsx`                 | Cập nhật  | Thêm 8 prop mới, `Column<T>` thêm `headerClassName`, `keyField` optional, default padding `px-6 py-4` |
| `src/components/imports/ImportRequestDetailModal.tsx` | Cập nhật  | Thay table items bằng DataTable + showIndex                                                           |
| `src/components/dispatches/DispatchDetailModal.tsx`   | Cập nhật  | Thay table bằng DataTable với `footer` prop cho totals row                                            |
| `src/components/inventory/ImportDetailModal.tsx`      | Cập nhật  | Thay table 6 cột bằng DataTable + showIndex                                                           |
| `src/components/units/UnitTable.tsx`                  | Cập nhật  | Thay table + loading spinner bằng DataTable (loading prop)                                            |
| `src/components/suppliers/SupplierTable.tsx`          | Cập nhật  | Thay table bằng DataTable + xóa manual empty check                                                    |
| `src/components/branches/BranchTable.tsx`             | Cập nhật  | Thay table + xóa TABLE_HEADERS constant + thêm STT                                                    |
| `src/components/inventory/BatchHistoryModal.tsx`      | Cập nhật  | Thay table với `border-separate` styling via `tableClassName`                                         |
| `src/components/inventory/InventoryImportTab.tsx`     | Cập nhật  | Thay conditional loading/empty/table với DataTable                                                    |
| `src/components/alerts/ExpiryTable.tsx`               | Cập nhật  | Thay 2 sub-tables (expiry + low-stock) bằng 2 DataTable với generic types                             |
| `src/components/dispatches/DispatchList.tsx`          | Cập nhật  | Thay mixed-type table (dispatch + request rows) bằng `DataTable<CombinedRow>`                         |
| `src/components/imports/ImportList.tsx`               | Cập nhật  | Thay mixed-type table bằng `DataTable<CombinedRow>` + giữ error state riêng                           |
| `src/components/inventory/InventoryTable.tsx`         | Cập nhật  | Thay table 8 cột phức tạp bằng DataTable; giữ error state riêng                                       |
| `src/components/reports/SalesTransactionTable.tsx`    | Cập nhật  | Thay main table 7 cột + detail modal items table 4 cột                                                |

---

## Giải thích kỹ thuật

### Props mới của DataTable

| Prop                 | Default                      | Dùng khi                                                               |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `loading`            | `false`                      | Thay spinner riêng; hiển thị skeleton rows trong table                 |
| `loadingRows`        | `5`                          | Số skeleton rows                                                       |
| `showIndex`          | `false`                      | Thêm cột STT tự động trước tất cả columns                              |
| `indexOffset`        | `0`                          | Offset cho STT khi paginate: `(page-1) * PAGE_SIZE`                    |
| `headerRowClassName` | `"bg-surface-container-low"` | Override màu nền header row                                            |
| `rowClassName`       | alternating pattern          | Override class từng row (dùng cho tables cần hover styles khác)        |
| `footer`             | `undefined`                  | ReactNode rendered là `<tr>` cuối `<tbody>` — dùng cho totals row      |
| `tableClassName`     | `"w-full border-collapse"`   | Override `<table>` class (e.g. `border-separate border-spacing-y-1.5`) |
| `keyField`           | `undefined`                  | Optional — nếu bỏ qua, dùng row index làm React key                    |

### Column interface mới

```ts
export interface Column<T> {
  key: keyof T | string;
  header: string;
  headerClassName?: string; // NEW — extra class cho <th>
  className?: string;
  render?: (row: T, index: number) => ReactNode;
}
```

### Xử lý mixed-type rows (DispatchList, ImportList)

Cả hai dùng discriminated union `CombinedRow`:

```ts
type CombinedRow =
  | { rowType: "dispatch"; data: DispatchOrderDoc }
  | { rowType: "request"; data: ImportRequestDoc };
```

Bên trong `render: (row) => ...`, TypeScript narrowing hoạt động đúng với `row.rowType === "dispatch"`.

### Error state

DataTable không xử lý error state. Các component có error state (InventoryTable, ImportList, BatchHistoryModal, ExpiryTable) giữ riêng block error ngoài DataTable:

```tsx
{error ? <ErrorBlock /> : <DataTable loading={loading} ... />}
```

---

## Cách dùng

```tsx
import { DataTable } from "@/components/common";
import type { Column } from "@/components/common";

const cols: Column<MyType>[] = [
  { key: "name", header: "Tên", render: (row) => <strong>{row.name}</strong> },
  {
    key: "amount",
    header: "Số tiền",
    headerClassName: "text-right",
    className: "text-right font-mono",
  },
];

<DataTable
  columns={cols}
  data={pagedData}
  keyField="id"
  loading={loading}
  loadingRows={10}
  showIndex
  indexOffset={(page - 1) * PAGE_SIZE}
  headerRowClassName="bg-surface-container-low"
  emptyText="Chưa có dữ liệu."
/>;
```
