import { useState } from "react";
import { Modal, Button, Input } from "@/components/common";

interface AddMedicineModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Kháng sinh",
  "Thuốc giảm đau",
  "Thuốc kháng virus",
  "Tim mạch",
  "Vật tư y tế",
  "Vitamin & Thực phẩm bổ sung",
];
const UNITS = [
  "Vỉ (10 viên)",
  "Chai (100ml)",
  "Ống (1ml)",
  "Hộp",
  "Tuýp",
  "Viên",
];

export function AddMedicineModal({ open, onClose }: AddMedicineModalProps) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "",
    stock: "",
    expiry: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm Thuốc Mới"
      subtitle="Đăng ký dược phẩm mới vào cơ sở dữ liệu hệ thống."
    >
      <form className="px-10 py-8 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <Input
              label="Tên thuốc"
              placeholder="VD: Atorvastatin 20mg"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Danh mục
            </label>
            <select
              className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">Chọn danh mục</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Đơn vị tính
            </label>
            <select
              className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            >
              <option value="">Chọn đơn vị</option>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Tồn kho ban đầu"
              type="number"
              placeholder="0"
              leadingIcon="inventory_2"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
            />
          </div>

          <div>
            <Input
              label="Ngày hết hạn"
              type="date"
              leadingIcon="event"
              value={form.expiry}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiry: e.target.value }))
              }
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Tải ảnh sản phẩm
            </label>
            <div className="w-full aspect-video bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">
                add_a_photo
              </span>
              <p className="text-xs text-on-surface-variant font-medium">
                Tải ảnh sản phẩm lên hoặc kéo thả vào đây
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Hủy bỏ
          </Button>
          <Button type="submit" icon="save" className="flex-1 justify-center">
            Lưu Thông Tin
          </Button>
        </div>
      </form>
    </Modal>
  );
}
