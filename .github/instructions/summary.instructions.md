---
applyTo: "**"
---

# Summary File Rule — Medical Supplies Management

> **RULE (enforce every time):**
>
> Sau **mọi** tác vụ implement, config, hoặc tạo file mới theo yêu cầu của user, **bắt buộc** tạo file tóm tắt tại:
>
> ```
> docs/summaries/YYYY-MM-DD_<slug>.md
> ```
>
> File này giải thích **cái vừa làm là gì**, tại sao làm vậy, và cách dùng nó.

---

## Khi nào tạo summary file?

Tạo khi user yêu cầu một trong các dạng sau:

| Trigger                 | Ví dụ                                            |
| ----------------------- | ------------------------------------------------ |
| Implement tính năng mới | "implement trang Alerts", "làm modal thêm thuốc" |
| Tạo file config         | "config firebase", "setup environment"           |
| Tạo service / hook      | "viết service cho inventory", "tạo hook usePOS"  |
| Thiết kế / tạo schema   | "thiết kế database", "tạo types"                 |
| Chạy script hoặc seed   | "seed dữ liệu", "chạy migration"                 |
| Cài đặt / tích hợp      | "tích hợp Charts", "setup Firebase Storage"      |

**Không cần tạo** khi chỉ: đọc file, trả lời câu hỏi, sửa bug nhỏ 1 dòng, chỉnh typo, hay cập nhật instruction file.

---

## Cấu trúc bắt buộc của summary file

```markdown
# [Tên tính năng / tác vụ]

**Ngày:** YYYY-MM-DD  
**Loại:** Feature | Config | Service | Schema | Script | Integration

---

## Tóm tắt

1–3 câu mô tả ngắn gọn đã làm gì.

---

## Files đã tạo / chỉnh sửa

| File               | Hành động | Mô tả               |
| ------------------ | --------- | ------------------- |
| `path/to/file.ts`  | Tạo mới   | Giải thích ngắn     |
| `path/to/other.ts` | Cập nhật  | Giải thích thay đổi |

---

## Giải thích kỹ thuật

Giải thích tại sao thiết kế như vậy, các quyết định quan trọng, trade-off nếu có.

---

## Cách dùng

Code snippet hoặc hướng dẫn ngắn gọn để dùng thứ vừa tạo.

---

## Bước tiếp theo (nếu có)

- [ ] Việc cần làm tiếp theo
```

---

## Quy tắc đặt tên file

| Tác vụ                 | Tên file                         |
| ---------------------- | -------------------------------- |
| Database schema config | `YYYY-MM-DD_firebase-config.md`  |
| Tạo trang mới          | `YYYY-MM-DD_page-<tên-trang>.md` |
| Implement tính năng    | `YYYY-MM-DD_feature-<tên>.md`    |
| Tạo service            | `YYYY-MM-DD_service-<tên>.md`    |
| Seed / script          | `YYYY-MM-DD_script-<tên>.md`     |
| Thiết kế schema        | `YYYY-MM-DD_schema-<tên>.md`     |

Slug dùng kebab-case, tiếng Anh, ngắn gọn (tối đa 4 từ).
