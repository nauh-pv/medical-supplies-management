# Mobile Responsive UI

**Ngày:** 2026-05-04  
**Loại:** Feature

---

## Tóm tắt

Toàn bộ UI được làm responsive trên điện thoại (< 768px `md` breakpoint) mà không thay đổi layout hiện tại trên desktop/laptop. Sidebar chuyển thành drawer có thể toggle, TopBar có hamburger menu, tất cả page wrappers xoá cứng `ml-72`, và POS có tab view riêng cho mobile.

---

## Files đã tạo / chỉnh sửa

| File                                               | Hành động | Mô tả                                                                                    |
| -------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `src/components/layout/Sidebar.tsx`                | Cập nhật  | Thêm `open`/`onClose` props, backdrop overlay, slide-in drawer trên mobile, close button |
| `src/components/layout/TopBar.tsx`                 | Cập nhật  | Thêm `onMenuToggle` prop, hamburger button (ẩn trên desktop), responsive width/margin    |
| `src/App.tsx`                                      | Cập nhật  | Thêm `sidebarOpen` state, pass toggle props xuống Sidebar/TopBar, fix 404 route margin   |
| `src/pages/Dashboard.tsx`                          | Cập nhật  | `ml-72` → `md:ml-72`, `px-8` → `px-4 md:px-8`                                            |
| `src/pages/Inventory.tsx`                          | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/Alerts.tsx`                             | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/Branches.tsx`                           | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/Dispatches.tsx`                         | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/Imports.tsx`                            | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/Reports.tsx`                            | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/SalesTransactions.tsx`                  | Cập nhật  | Responsive main wrapper                                                                  |
| `src/pages/POS.tsx`                                | Cập nhật  | Thêm mobile tab toggle (Sản phẩm / Đơn hàng), flex-col layout trên mobile                |
| `src/components/common/PageHeader.tsx`             | Cập nhật  | Stack vertically trên mobile (`flex-col sm:flex-row`)                                    |
| `src/components/pos/ProductGrid.tsx`               | Cập nhật  | 2 cols trên mobile (`grid-cols-2 sm:grid-cols-3`), responsive padding                    |
| `src/components/reports/SalesFilterBar.tsx`        | Cập nhật  | `min-w-[300px]` → `min-w-0 sm:min-w-[300px]`                                             |
| `src/components/inventory/InventoryTable.tsx`      | Cập nhật  | Responsive filter bar padding và min-w                                                   |
| `src/components/branches/BranchTable.tsx`          | Cập nhật  | Action bar `flex-wrap` để không overflow trên mobile                                     |
| `src/components/dispatches/CreateDispatchForm.tsx` | Cập nhật  | Rows table wrapped trong `overflow-x-auto` + `min-w-[480px]`                             |
| `src/components/dashboard/RevenueChart.tsx`        | Cập nhật  | Responsive padding, chart height, gap                                                    |
| `src/components/dashboard/AlertsSection.tsx`       | Cập nhật  | `p-8` → `p-4 sm:p-8`                                                                     |
| `src/components/dashboard/TopSellingTable.tsx`     | Cập nhật  | `p-8` → `p-4 sm:p-8`                                                                     |
| `src/components/dashboard/StockDynamicsPanel.tsx`  | Cập nhật  | `p-8` → `p-4 sm:p-8`                                                                     |
| `src/components/inventory/InventoryStats.tsx`      | Cập nhật  | `p-8` → `p-4 sm:p-8` trên cả 2 bento cards                                               |
| `src/components/reports/RevenueChartPanel.tsx`     | Cập nhật  | `p-8` → `p-4 sm:p-8`                                                                     |
| `src/components/reports/BestSellersPanel.tsx`      | Cập nhật  | `p-8` → `p-4 sm:p-8`                                                                     |
| `src/components/reports/BranchDistribution.tsx`    | Cập nhật  | `p-8` → `p-4 sm:p-8`                                                                     |

---

## Giải thích kỹ thuật

### Chiến lược breakpoint

- Sử dụng `md` (768px) là breakpoint chính phân biệt mobile vs desktop
- Tất cả thay đổi mobile-only dùng prefix `md:` để giữ nguyên desktop layout
- Sidebar và main wrappers dùng `md:ml-72`, `md:px-8` để match

### Sidebar Mobile Drawer

- Trên mobile: `transform -translate-x-full` (ẩn trái màn hình) → `translate-x-0` khi `open=true`
- Backdrop overlay `fixed inset-0 bg-black/40 z-30 md:hidden` để dismiss
- Close button `md:hidden` bên trong sidebar
- Tất cả `<Link>` gọi `onClose()` để tự đóng sau navigation

### TopBar Mobile

- Hamburger button `md:hidden` phía trái, icon history/chat ẩn(`hidden md:flex`)
- User name/role text chỉ hiển thị trên desktop (`hidden md:block`)
- `md:ml-72 md:w-[calc(100%-18rem)]` — full width on mobile

### POS Mobile Layout

- Thêm `mobileView: "products" | "cart"` state
- Tab bar `flex md:hidden` ở top để toggle giữa 2 views
- Container product: `hidden md:flex` / `flex` dựa vào `mobileView`
- Container order: `hidden md:flex md:w-[400px]` / `flex flex-1` dựa vào `mobileView`
- Sau khi checkout thành công: tự động switch về `products`

### DataTable

`DataTable` đã có sẵn `overflow-x-auto` wrapper — tables tự scroll ngang trên mobile.

---

## Cách dùng

Không cần thay đổi code gì thêm. Layout tự responsive dựa theo viewport width:

- `< 768px (md)`: sidebar ẩn, hamburger menu hiển thị, layout full width
- `≥ 768px (md)`: layout desktop giữ nguyên như cũ

---

## Bước tiếp theo (nếu có)

- [ ] Tối ưu typography size cho mobile (text-5xl KPI → text-3xl trên phone)
- [ ] Modal size trên mobile (`max-w-xl` có thể cần `max-w-full mx-4` trên mobile)
