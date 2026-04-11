import { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/common";
import { addMedicine, getUnits, updateMedicine } from "@/services/inventory";
import type { UnitDoc, MedicineDoc } from "@/types/firestore";

interface AddMedicineModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  medicine?: MedicineDoc | null;
}

const ICON_OPTIONS = [
  { icon: "medication", bg: "bg-primary/10", color: "text-primary" },
  {
    icon: "pill",
    bg: "bg-secondary-fixed-dim",
    color: "text-on-secondary-fixed-variant",
  },
  { icon: "vaccines", bg: "bg-tertiary-fixed", color: "text-tertiary" },
  { icon: "medication_liquid", bg: "bg-primary/10", color: "text-primary" },
  { icon: "emergency", bg: "bg-error-container", color: "text-error" },
  { icon: "science", bg: "bg-secondary/10", color: "text-secondary" },
];

function generateSku() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "MED-";
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function AddMedicineModal({
  open,
  onClose,
  onSuccess,
  medicine,
}: AddMedicineModalProps) {
  const isEdit = !!medicine;
  const [units, setUnits] = useState<UnitDoc[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [form, setForm] = useState({
    sku: generateSku(),
    name: "",
    description: "",
    category: "" as "" | "prescribed" | "otc",
    unitId: "",
    importPrice: "",
    sellPrice: "",
    minStockLevel: "",
  });

  useEffect(() => {
    if (open) {
      getUnits().then(setUnits);
      if (medicine) {
        // Edit mode — prefill from existing medicine
        const iconMatch = ICON_OPTIONS.findIndex(
          (o) => o.icon === medicine.icon,
        );
        setIconIdx(iconMatch >= 0 ? iconMatch : 0);
        setForm({
          sku: medicine.sku,
          name: medicine.name,
          description: medicine.description,
          category: medicine.category,
          unitId: medicine.unitId,
          importPrice: String(medicine.importPrice),
          sellPrice: String(medicine.sellPrice),
          minStockLevel: String(medicine.minStockLevel),
        });
      } else {
        setForm({
          sku: generateSku(),
          name: "",
          description: "",
          category: "",
          unitId: "",
          importPrice: "",
          sellPrice: "",
          minStockLevel: "",
        });
        setIconIdx(0);
      }
      setError("");
    }
  }, [open, medicine]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category || !form.unitId) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    const importPrice = Number(form.importPrice);
    const sellPrice = Number(form.sellPrice);
    const minStockLevel = Number(form.minStockLevel);
    if (importPrice <= 0 || sellPrice <= 0) {
      setError("Giá nhập và giá bán phải lớn hơn 0.");
      return;
    }

    const selectedUnit = units.find((u) => u.id === form.unitId);
    if (!selectedUnit) {
      setError("Đơn vị tính không hợp lệ.");
      return;
    }

    const { icon, bg: iconBg, color: iconColor } = ICON_OPTIONS[iconIdx];

    setSaving(true);
    setError("");
    try {
      if (isEdit && medicine) {
        await updateMedicine(medicine.id, {
          sku: form.sku,
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          unitId: selectedUnit.id,
          unitName: selectedUnit.name,
          importPrice,
          sellPrice,
          minStockLevel: minStockLevel || 10,
          icon,
          iconBg,
          iconColor,
        });
      } else {
        await addMedicine({
          sku: form.sku,
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          unitId: selectedUnit.id,
          unitName: selectedUnit.name,
          importPrice,
          sellPrice,
          minStockLevel: minStockLevel || 10,
          icon,
          iconBg,
          iconColor,
        });
      }
      onSuccess?.();
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}
      subtitle={
        isEdit
          ? "Cập nhật thông tin dược phẩm trong hệ thống."
          : "Đăng ký dược phẩm mới vào cơ sở dữ liệu hệ thống."
      }
      maxWidth="max-w-2xl"
    >
      <form className="px-10 py-8 space-y-6" onSubmit={handleSubmit}>
        {/* Row 1: SKU + Tên thuốc */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Mã SKU
            </label>
            <input
              type="text"
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface font-mono outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              required
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Tên thuốc/vật tư <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên thuốc hoặc vật tư y tế..."
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Row 2: Danh mục + Đơn vị */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Danh mục <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as "prescribed" | "otc",
                  }))
                }
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="prescribed">Kê đơn</option>
                <option value="otc">Không kê đơn (OTC)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xl">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Đơn vị tính <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                value={form.unitId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitId: e.target.value }))
                }
                required
              >
                <option value="">Chọn đơn vị</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xl">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Giá nhập + Giá bán + Tồn kho tối thiểu */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Giá nhập (VNĐ) *"
            type="number"
            placeholder="VD: 45000"
            value={form.importPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, importPrice: e.target.value }))
            }
          />
          <Input
            label="Giá bán (VNĐ) *"
            type="number"
            placeholder="VD: 62000"
            value={form.sellPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, sellPrice: e.target.value }))
            }
          />
          <Input
            label="Tồn kho tối thiểu"
            type="number"
            placeholder="Mặc định: 10"
            value={form.minStockLevel}
            onChange={(e) =>
              setForm((f) => ({ ...f, minStockLevel: e.target.value }))
            }
          />
        </div>

        {/* Row 4: Mô tả */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Mô tả
          </label>
          <input
            type="text"
            placeholder="Mô tả ngắn cho thuốc/vật tư này..."
            className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        {/* Row 5: Chọn icon */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Biểu tượng
          </label>
          <div className="flex gap-3">
            {ICON_OPTIONS.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIconIdx(i)}
                className={[
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  opt.bg,
                  opt.color,
                  i === iconIdx
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-50 hover:opacity-100",
                ].join(" ")}
              >
                <span className="material-symbols-outlined text-xl">
                  {opt.icon}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-error bg-error-container/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            icon={saving ? "progress_activity" : "save"}
            className="flex-1 justify-center"
          >
            {saving ? "Đang lưu..." : "Thêm thuốc"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
