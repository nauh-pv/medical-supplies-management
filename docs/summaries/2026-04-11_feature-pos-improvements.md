# Feature: POS Improvements + Firebase Storage CORS Fix

**Ngày:** 2026-04-11  
**Loại:** Feature + Config

---

## Tóm tắt

Sửa lỗi CORS Firebase Storage khi upload ảnh thuốc, fix bug tồn kho POS hiển thị sai (dùng wrong inventory doc), thêm tồn kho vào product card, refetch sau thanh toán, và hiển thị toast thành công.

---

## Files đã tạo / chỉnh sửa

| File                                 | Hành động | Mô tả                                                                                                              |
| ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `cors.json`                          | Tạo mới   | CORS config cho Firebase Storage — cần deploy bằng `gsutil`                                                        |
| `src/components/pos/ProductGrid.tsx` | Cập nhật  | Fix `getStock` dùng deterministic ID; thêm `refetchTrigger` prop; thêm số tồn kho vào card; hiển thị ảnh thay icon |
| `src/pages/POS.tsx`                  | Cập nhật  | Thêm `refetchTrigger` state (tăng sau checkout); toast thành công tự dismiss sau 4s; cap qty theo stock            |

---

## Giải thích kỹ thuật

### CORS Firebase Storage

Firebase Storage mặc định chặn cross-origin request từ `localhost`. Cần chạy:

```bash
gsutil cors set cors.json gs://btap3-193b1.firebasestorage.app
```

File `cors.json` cho phép origin `localhost:5173`, `localhost:4173`, và các domain production.

### Bug tồn kho POS = 0

`getStock()` trong ProductGrid dùng `Array.find((i) => i.medicineId === medicineId)` — có thể trả về doc cũ (random ID, qty=0) thay vì doc mới `WAREHOUSE_{id}`. Fix: ưu tiên doc có `id === ${locationId}_${medicineId}`.

### ProductGrid không update sau bán hàng

`useEffect` dependency array chỉ có `[locationId]`, không có `refetchTrigger`. Sau khi `createPosTransaction` thành công, POS.tsx increment `refetchTrigger` → ProductGrid fetch lại Firestore → hiển thị tồn kho mới.

### Stock cap

`handleAddToCart` và `handleQtyChange` trong POS.tsx giờ không cho phép qty vượt quá `item.stock`.

---

## Cách deploy CORS

```bash
# Yêu cầu Google Cloud SDK (gcloud/gsutil)
gsutil cors set cors.json gs://btap3-193b1.firebasestorage.app

# Kiểm tra sau khi deploy
gsutil cors get gs://btap3-193b1.firebasestorage.app
```

---

## Bước tiếp theo (nếu có)

- [ ] Thêm real-time listener (onSnapshot) cho inventory trong ProductGrid để update tức thì không cần checkout
- [ ] Cho phép vào domain production vào cors.json (thay `localhost` bằng domain thật)
