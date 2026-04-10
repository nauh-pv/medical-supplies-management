import { useState } from "react";
import { Modal, Button, Input } from "@/components/common";

interface Unit {
  id: number;
  name: string;
  description: string;
}

const initialUnits: Unit[] = [
  {
    id: 1,
    name: "Chai",
    description: "Dành cho các loại siro, dung dịch lỏng hoặc thuốc nước.",
  },
  {
    id: 2,
    name: "Viên",
    description: "Đơn vị nhỏ nhất cho các loại thuốc nén, thuốc nang.",
  },
  {
    id: 3,
    name: "Vỉ",
    description: "Bộ nhiều viên đóng gói trong vỉ nhôm nhựa.",
  },
  {
    id: 4,
    name: "Ống",
    description: "Dùng cho thuốc tiêm hoặc dung dịch đóng ống.",
  },
  {
    id: 5,
    name: "Hộp",
    description: "Đóng gói cấp thứ cấp, chứa nhiều vỉ hoặc chai.",
  },
  {
    id: 6,
    name: "Tuýp",
    description: "Dạng tuýp mềm cho thuốc bôi, kem, gel.",
  },
];

export function UnitTable() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setUnits((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name.trim(),
        description: form.description.trim(),
      },
    ]);
    setForm({ name: "", description: "" });
    setAddOpen(false);
  }

  function handleDelete(id: number) {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <>
      {/* Stats + add button row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined text-primary">
                science
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-label font-bold uppercase tracking-wider">
                Tổng đơn vị
              </p>
              <p className="text-2xl font-headline font-bold text-on-surface">
                {units.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tertiary-fixed rounded-xl">
              <span className="material-symbols-outlined text-tertiary">
                update
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-label font-bold uppercase tracking-wider">
                Mới thêm tháng này
              </p>
              <p className="text-2xl font-headline font-bold text-on-surface">
                +3
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)] flex items-center justify-center">
          <Button icon="add" onClick={() => setAddOpen(true)}>
            Thêm đơn vị mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
        <div className="px-8 py-4 bg-surface-container-low/50">
          <div className="grid grid-cols-4 px-2 text-xs font-label font-bold text-on-surface-variant tracking-widest uppercase">
            <div className="col-span-1">Tên đơn vị</div>
            <div className="col-span-2">Mô tả sử dụng</div>
            <div className="col-span-1 text-right">Thao tác</div>
          </div>
        </div>

        <div>
          {units.map((unit) => (
            <div
              key={unit.id}
              className="grid grid-cols-4 px-8 py-5 items-center hover:bg-surface-bright transition-colors border-t border-outline-variant/10"
            >
              <div className="font-bold text-on-surface">{unit.name}</div>
              <div className="col-span-2 text-sm text-on-surface-variant">
                {unit.description || "—"}
              </div>
              <div className="flex justify-end gap-1">
                <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-xl">
                    edit
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
                  className="p-2 hover:bg-error-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-error/60 text-xl">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Unit Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm đơn vị tính mới"
        subtitle="Thiết lập tham số đo lường kho vận"
        maxWidth="max-w-lg"
      >
        <form className="px-10 py-8 space-y-6" onSubmit={handleAdd}>
          <Input
            label="Tên đơn vị tính"
            placeholder="VD: Chai, Lọ, Viên, Vỉ, Ống"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Mô tả
            </label>
            <textarea
              rows={4}
              placeholder="Nhập ghi chú về cách sử dụng đơn vị này (VD: dùng cho thuốc tiêm)..."
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-3 items-start p-4 bg-primary/5 rounded-xl">
            <span className="material-symbols-outlined text-primary text-sm mt-0.5 flex-shrink-0">
              info
            </span>
            <p className="text-xs text-primary/80 leading-relaxed">
              Đơn vị tính này sẽ xuất hiện trong danh sách lựa chọn khi nhập kho
              hoặc tạo mới sản phẩm dược phẩm. Hãy đảm bảo tính nhất quán để
              việc thống kê chính xác.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 justify-center"
            >
              Hủy
            </Button>
            <Button type="submit" icon="save" className="flex-1 justify-center">
              Lưu đơn vị
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
