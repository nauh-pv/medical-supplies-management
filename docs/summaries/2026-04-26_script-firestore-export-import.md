# Firestore Export / Import Scripts

**Ngày:** 2026-04-26  
**Loại:** Script

---

## Tóm tắt

Tạo 2 scripts để export toàn bộ dữ liệu Firestore ra file JSON và import ngược lại vào môi trường khác. Hỗ trợ chọn env file, selective import theo collection, và clean import.

---

## Files đã tạo / chỉnh sửa

| File                         | Hành động | Mô tả                                           |
| ---------------------------- | --------- | ----------------------------------------------- |
| `scripts/exportFirestore.ts` | Tạo mới   | Script export toàn bộ Firestore → JSON          |
| `scripts/importFirestore.ts` | Tạo mới   | Script import JSON → Firestore target           |
| `package.json`               | Cập nhật  | Thêm npm scripts: db:export, db:import, db:seed |
| `.gitignore`                 | Cập nhật  | Thêm `data/` vào ignore                         |

---

## Giải thích kỹ thuật

- **Timestamp serialization**: Firestore Timestamp được chuyển sang `{ __type: "Timestamp", seconds, nanoseconds }` khi export và deserialize ngược khi import, đảm bảo không mất dữ liệu thời gian.
- **Batch write limit**: Firestore giới hạn 500 operations/batch → script chia chunk 450 docs/batch.
- **Safety**: Import script yêu cầu confirm trước khi ghi, hiển thị rõ source vs target project.
- **11 collections** được export: users, medicines, inventory, batches, suppliers, units, branches, import_orders, dispatch_orders, import_requests, pos_transactions.

---

## Cách dùng

### Export dữ liệu

```bash
# Export từ env dev (mặc định)
npm run db:export

# Export từ env staging
npm run db:export:staging

# Export với custom output
npx tsx scripts/exportFirestore.ts --env=.env.dev --out=my-backup.json
```

Output: `data/firestore-export_<projectId>_<date>.json`

### Import dữ liệu vào môi trường khác

```bash
# Import vào staging
npx tsx scripts/importFirestore.ts --file=data/firestore-export_xxx.json --env=.env.staging

# Import chỉ một số collections
npx tsx scripts/importFirestore.ts --file=data/xxx.json --env=.env.staging --collections=medicines,units

# Xóa dữ liệu cũ trước khi import
npx tsx scripts/importFirestore.ts --file=data/xxx.json --env=.env.staging --clean
```

---

## Bước tiếp theo (nếu có)

- [ ] Tạo file `.env.staging` và `.env.production` với Firebase config tương ứng
- [ ] Chạy `npm run db:export` để test export
