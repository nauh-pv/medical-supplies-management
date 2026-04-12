# Dashboard DB Connect + POS Fixes

**Ngày:** 2026-04-11  
**Loại:** Feature + Fix

---

## Tóm tắt

Kết nối trang Tổng quan với Firestore (doanh thu, top thuốc, cảnh báo kho, giao dịch gần đây). Sửa lỗi POS checkout không hiển thị lỗi và tính VAT sai. Sắp xếp sản phẩm hết hàng về cuối ProductGrid.

---

## Files đã tạo / chỉnh sửa

| File                                              | Hành động | Mô tả                                                                        |
| ------------------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `src/services/dashboard.ts`                       | Tạo mới   | Service tổng hợp dữ liệu Dashboard từ Firestore                              |
| `src/pages/Dashboard.tsx`                         | Cập nhật  | Fetch data qua `getDashboardData`, pass props xuống components               |
| `src/components/dashboard/StatSummaryRow.tsx`     | Cập nhật  | Nhận props `stats, loading` — hiển thị doanh thu tháng, SKU count, chi nhánh |
| `src/components/dashboard/RevenueChart.tsx`       | Cập nhật  | Nhận props `data, loading` — scale bar heights từ revenue thực tế            |
| `src/components/dashboard/TopSellingTable.tsx`    | Cập nhật  | Nhận props `data, loading` — top 5 thuốc theo tổng qty bán                   |
| `src/components/dashboard/AlertsSection.tsx`      | Cập nhật  | Nhận props `alerts, loading` — low stock và batch sắp hết hạn từ Firestore   |
| `src/components/dashboard/StockDynamicsPanel.tsx` | Cập nhật  | Nhận props `activities, loading` — 6 POS giao dịch gần nhất                  |
| `src/services/pos.ts`                             | Cập nhật  | Xóa VAT khỏi tính toán total (vat = 0)                                       |
| `src/pages/POS.tsx`                               | Cập nhật  | Thêm `errorMsg` state, catch lỗi checkout, hiển thị error toast              |
| `src/components/pos/ProductGrid.tsx`              | Cập nhật  | Di chuyển `getStock` trước `filtered`; sort out-of-stock về cuối             |

---

## Giải thích kỹ thuật

### `getDashboardData(locationId)`

- Gọi `Promise.all` 1 lần duy nhất: fetch `pos_transactions` (limit 500), `branches`, `medicines`, `inventory`, `batches`
- Từ transactions: tính `totalRevenueThisMonth`, aggregate `topMedicines` (group by medicineId)
- Revenue chart: group transactions theo date string `YYYY-MM-DD` cho 7 ngày gần nhất
- `expiringSoon`: lọc batches có `expiryDate ≤ 30 ngày`, `status === "active"`, `quantity > 0`
- Không cần composite Firestore index vì batches chỉ filter `locationId` (single field)

### POS fixes

- **VAT**: Đã bỏ `VAT_RATE = 0.08`, tổng tiền trong Firestore khớp với những gì OrderSummary hiển thị
- **Error handling**: `try/catch` bắt lỗi Firestore transaction, hiển thị red toast 5 giây
- **Cart snapshot**: Dùng `cartSnapshot` capture trước `setCart([])` để success message chính xác

### ProductGrid sort

- `getStock` chuyển lên trước `filtered` để rõ ràng về dependency ordering
- `.sort()` đặt products có `stock === 0` sau products có stock > 0

---

## Cách dùng

```tsx
// Dashboard tự fetch — không cần config gì thêm
<Dashboard />

// ProductGrid sort out-of-stock tự động
<ProductGrid onAddToCart={...} refetchTrigger={n} />
```

---

## Bước tiếp theo (nếu có)

- [ ] Thêm period filtering thực tế cho RevenueChart (month/quarter/year)
- [ ] Cảnh báo kho có nút "Tạo yêu cầu nhập hàng" trực tiếp từ Dashboard
