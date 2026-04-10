import { useState } from "react";
import { Modal, Button } from "@/components/common";

interface AddMedicineModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Kháng sinh",
  "Thực phẩm chức năng",
  "Vật tư tiêu hao",
  "Thuốc gây nghiện/Hướng thần",
];
const UNITS = ["Viên", "Vỉ", "Chai", "Hộp", "Ống"];

export function AddMedicineModal({ open, onClose }: AddMedicineModalProps) {
  const [form, setForm] = useState({ name: "", category: "", unit: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm thuốc mới"
      subtitle="Đăng ký dược phẩm mới vào cơ sở dữ liệu hệ thống."
    >
      <form className="px-10 py-8 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-5">
          {/* Tên thuốc/vật tư */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Tên thuốc/vật tư
            </label>
            <input
              type="text"
              placeholder="Nhập tên thuốc hoặc vật tư y tế..."
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Danh mục */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Danh mục
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
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
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xl">
                expand_more
              </span>
            </div>
          </div>

          {/* Đơn vị tính */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Đơn vị tính
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
              >
                <option value="">Chọn đơn vị</option>
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xl">
                expand_more
              </span>
            </div>
          </div>

          {/* Tải ảnh sản phẩm */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Tải ảnh sản phẩm
            </label>
            <div className="w-full aspect-video bg-surface-container-high rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container transition-colors">
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
            Hủy
          </Button>
          <Button type="submit" icon="save" className="flex-1 justify-center">
            Thêm thuốc
          </Button>
        </div>
      </form>
    </Modal>
  );
}
