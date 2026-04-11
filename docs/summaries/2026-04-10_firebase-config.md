# Firebase Config — Firestore Rules, Indexes, Types & Seed

**Ngày:** 2026-04-10  
**Loại:** Config + Schema + Script

---

## Tóm tắt

Thiết lập toàn bộ cấu hình Firebase cho dự án: Security Rules phân quyền theo 2 role, Composite Indexes cho tất cả query patterns, TypeScript interfaces cho 12 collections, và script seed dữ liệu mẫu ban đầu.

---

## Files đã tạo / chỉnh sửa

| File                     | Hành động | Mô tả                                                                                                        |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------ |
| `firestore.rules`        | Tạo mới   | Security rules phân quyền `warehouse_manager` vs `branch` cho 12 collections + subcollections stats          |
| `firestore.indexes.json` | Tạo mới   | 21 composite indexes phục vụ tất cả query patterns (inventory, batches, dispatch, POS, stats...)             |
| `firebase.json`          | Tạo mới   | Entry point cho Firebase CLI — trỏ đến rules và indexes                                                      |
| `storage.rules`          | Tạo mới   | Rules cho Firebase Storage: chỉ `warehouse_manager` upload ảnh, max 5MB, chỉ chấp nhận `image/*`             |
| `scripts/seed.ts`        | Tạo mới   | Script khởi tạo dữ liệu mẫu: 8 units, 4 branches (kể cả WAREHOUSE), 3 suppliers, 5 medicines, inventory      |
| `src/types/firestore.ts` | Tạo mới   | TypeScript interfaces đầy đủ cho tất cả 12 collections + stats subcollections                                |
| `src/services/auth.ts`   | Cập nhật  | `signUp` giờ ghi đủ fields theo `UserDoc` schema: `phone`, `branchId`, `branchName`, `isActive`, `updatedAt` |

---

## Giải thích kỹ thuật

### Security Rules

Dùng helper functions (`isWarehouseManager()`, `isBranch()`, `myBranchId()`) để tái sử dụng logic. Mỗi rule đọc document `/users/{uid}` để lấy role — Firestore cho phép điều này trong rules với `get()`.

**Điểm quan trọng:**

- `dispatch_orders`: branch chỉ được `update` khi chỉ thay đổi `status`, `receivedAt`, `updatedAt` và `status` phải là `"received"` — dùng `affectedKeys().hasOnly(...)` để enforce.
- `stock_movements`: `update` và `delete` luôn là `false` — append-only, không ai được sửa/xoá.
- `pos_transactions`: branch chỉ được `create` (không `update`/`delete`) — bảo vệ tính toàn vẹn dữ liệu.

### Composite Indexes

Firestore yêu cầu composite index cho mọi query kết hợp nhiều field. 21 indexes bao gồm:

- Filter + sort (vd: `branchId ASC, createdAt DESC`)
- Multi-field filter (vd: `status ASC, expiryDate ASC` cho batches sắp hết hạn)
- Stats subcollections dùng `COLLECTION_GROUP` scope để có thể query cross-branch

### TypeScript Types (`src/types/firestore.ts`)

Tất cả interfaces mirror chính xác Firestore schema. Thêm `importPrice` vào `PosTransactionItem` (snapshot từ batch lúc bán) để tính `totalCost` mà không cần đọc lại batch sau này.

---

## Cách dùng

### Import types

```ts
import type {
  MedicineDoc,
  InventoryDoc,
  PosTransactionDoc,
} from "@/types/firestore";
```

### Deploy lên Firebase

```bash
# 1. Cài Firebase CLI
npm install -g firebase-tools
firebase login

# 2. Link project
firebase use --add

# 3. Deploy rules + indexes
firebase deploy --only firestore:rules,firestore:indexes

# 4. Deploy storage rules
firebase deploy --only storage
```

### Chạy seed

```bash
npx tsx scripts/seed.ts
```

---

## Bước tiếp theo

- [ ] Tạo tài khoản `warehouse_manager` đầu tiên qua trang Register, sau đó thủ công set `role: "warehouse_manager"` trên Firebase Console
- [ ] Implement `src/services/inventory.ts` — CRUD cho medicines, inventory
- [ ] Implement `src/services/pos.ts` — `createPosTransaction` dùng `runTransaction`
- [ ] Implement `src/services/stats.ts` — query `daily_stats` và `monthly_stats` cho biểu đồ
