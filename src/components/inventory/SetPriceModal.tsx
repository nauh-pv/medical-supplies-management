import { useState } from "react";
import { Modal, Button } from "@/components/common";

interface SetPriceModalProps {
  open: boolean;
  onClose: () => void;
  medicineName?: string;
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm select-none">
          ₫
        </span>
        <input
          type="text"
          inputMode="decimal"
          className="w-full bg-surface-container-low rounded-xl pl-9 pr-4 py-3 text-sm text-on-surface font-mono outline-none focus:ring-2 focus:ring-primary/30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function SetPriceModal({
  open,
  onClose,
  medicineName = "Sản phẩm đã chọn",
}: SetPriceModalProps) {
  const [importPrice, setImportPrice] = useState("22.500");
  const [sellPrice, setSellPrice] = useState("28.900");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thiết Lập Giá"
      subtitle={medicineName}
      maxWidth="max-w-md"
    >
      <div className="px-8 py-8 space-y-5">
        <PriceInput
          label="Giá nhập (mỗi đơn vị)"
          value={importPrice}
          onChange={setImportPrice}
        />
        <PriceInput
          label="Giá bán (thị trường)"
          value={sellPrice}
          onChange={setSellPrice}
        />

        <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-lg leading-none flex-shrink-0 mt-0.5">
            info
          </span>
          <p className="text-xs text-primary/80 leading-relaxed">
            Việc cập nhật giá sẽ được phản ánh ngay lập tức trên tất cả các nhà
            thuốc và hệ thống thanh toán được kết nối.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Hủy
          </Button>
          <Button
            icon="check"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Cập nhật giá
          </Button>
        </div>
      </div>
    </Modal>
  );
}
