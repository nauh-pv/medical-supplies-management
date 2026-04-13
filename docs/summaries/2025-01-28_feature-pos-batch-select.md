# POS Batch Selection Flow

**Ngày:** 2025-01-28  
**Loại:** Feature

---

## Tóm tắt

Thêm bước chọn lô hàng vào luồng POS: khi người dùng click vào sản phẩm, một modal hiện ra danh sách các lô theo thứ tự FIFO (nhập trước xuất trước). Người dùng chọn lô → thêm vào giỏ với thông tin lô, đồng thời checkout sẽ trừ số lượng đúng vào `batches/{id}.quantity`.

---

## Files đã tạo / chỉnh sửa

| File                                      | Hành động | Mô tả                                                               |
| ----------------------------------------- | --------- | ------------------------------------------------------------------- |
| `src/components/pos/BatchSelectModal.tsx` | Tạo mới   | Modal chọn lô cho một thuốc cụ thể                                  |
| `src/pages/POS.tsx`                       | Cập nhật  | CartItem type mới, pendingMedicine state, handler chọn lô           |
| `src/components/pos/ProductGrid.tsx`      | Cập nhật  | `onAddToCart` → `onMedicineClick` (không thêm thẳng vào giỏ nữa)    |
| `src/components/pos/OrderSummary.tsx`     | Cập nhật  | Hiển thị "Lô: XXX" trong mỗi dòng giỏ hàng, cap nút + theo stock lô |
| `src/services/pos.ts`                     | Cập nhật  | Input type nhận `batchId/lot/importPrice`; runTransaction trừ batch |

---

## Giải thích kỹ thuật

### BatchSelectModal

- **Loading state**: Không dùng `setLoading(true)` đồng bộ trong effect (vi phạm lint rule `Avoid calling setState() directly within an effect`). Thay vào đó dùng _derived loading_ qua state `fetchedFor`:
  ```ts
  const loading = open && !!medicine && fetchedFor !== medicine.id;
  ```
  Effect chỉ gọi setState trong `.then()` callback (async), rồi set `fetchedFor = medicine.id` sau khi fetch xong.
- **FIFO sort**: batches sort theo `importDate.seconds` ASC.
- **Disabled rows**: lô đã hết hạn (`daysLeft <= 0`) bị disable. Lô sắp hết hạn (`<= 30 ngày`) hiển thị badge "Sắp HH (Xd)".

### CartItem key → batchId

Giỏ hàng nay keyed bằng `batchId` thay vì `medicineId`, cho phép cùng một thuốc từ hai lô khác nhau xuất hiện dưới dạng hai dòng riêng biệt.

### Batch deduction khi checkout

`pos.ts / createPosTransaction` đọc tất cả `batchRefs` trước trong `Promise.all` (đảm bảo reads-before-writes của Firestore SDK), rồi `increment(-quantity)` cho từng batch.

---

## Cách dùng

```
POS page → click thẻ thuốc
  → BatchSelectModal mở (fetch getActiveBatches(locationId) filtered by medicineId)
  → User click một lô
  → handleBatchSelect(batch):
       CartItem { id: batchId, lot, stock: batch.quantity, importPrice }
       thêm vào cart / tăng qty nếu batchId đã có
  → checkout → pos.ts deduct inventory + batch
```

---

## Bước tiếp theo (nếu có)

- [ ] Khi cart có nhiều lô của cùng một thuốc → tổng hợp khi in hoá đơn (optional)
- [ ] Refetch batch list nếu stock thay đổi trong khi modal đang mở (race condition nhẹ)
