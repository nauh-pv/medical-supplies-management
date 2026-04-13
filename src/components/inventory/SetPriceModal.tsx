import { useState, useEffect } from "react";
import { Modal, Button } from "@/components/common";
import { updateMedicine } from "@/services/inventory";
import type { MedicineDoc } from "@/types/firestore";

interface SetPriceModalProps {
  open: boolean;
  onClose: () => void;
  medicine: MedicineDoc | null;
  onSuccess?: () => void;
}

export function SetPriceModal({
  open,
  onClose,
  medicine,
  onSuccess,
}: SetPriceModalProps) {
  const [sellPrice, setSellPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && medicine) {
      setSellPrice(
        medicine.sellPrice > 0
          ? medicine.sellPrice.toLocaleString("vi-VN")
          : "",
      );
      setError("");
    }
  }, [open, medicine]);

  async function handleSave() {
    const raw = parseFloat(sellPrice.replace(/[^\d.]/g, ""));
    if (isNaN(raw) || raw < 0) {
      setError("Giá bán không hợp lệ.");
      return;
    }
    if (!medicine) return;
    setSaving(true);
    setError("");
    try {
      await updateMedicine(medicine.id, { sellPrice: Math.round(raw) });
      onSuccess?.();
      onClose();
    } catch {
      setError("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cập nhật giá bán"
      subtitle={medicine?.name ?? ""}
      maxWidth="max-w-md"
    >
      <div className="px-8 py-8 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Giá bán (đ/đơn vị)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm select-none">
              ₫
            </span>
            <input
              type="text"
              inputMode="decimal"
              className="w-full bg-surface-container-low rounded-xl pl-9 pr-4 py-3 text-sm text-on-surface font-mono outline-none focus:ring-2 focus:ring-primary/30"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-lg leading-none flex-shrink-0 mt-0.5">
            info
          </span>
          <p className="text-xs text-primary/80 leading-relaxed">
            Giá bán sẽ được cập nhật ngay lập tức trên POS và tất cả các chi
            nhánh.
          </p>
        </div>

        {error && (
          <p className="text-sm text-error bg-error-container/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Hủy
          </Button>
          <Button
            icon={saving ? "progress_activity" : "check"}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 justify-center"
          >
            {saving ? "Đang lưu..." : "Cập nhật giá"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
