import { Modal, Button, Badge } from "@/components/common";
import type { MedicineDoc, InventoryDoc } from "@/types/firestore";

interface MedicineDetailModalProps {
  open: boolean;
  medicine: MedicineDoc | null;
  inventoryDoc: InventoryDoc | null;
  onClose: () => void;
  onEdit?: () => void;
  onViewBatches?: () => void;
}

function StockBar({ qty, min }: { qty: number; min: number }) {
  const max = Math.max(qty, min * 3, 1);
  const pct = Math.min(100, (qty / max) * 100);
  const color =
    qty === 0 ? "bg-error" : qty <= min ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
      <div
        className={["h-full rounded-full transition-all", color].join(" ")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MedicineDetailModal({
  open,
  medicine,
  inventoryDoc,
  onClose,
  onEdit,
  onViewBatches,
}: MedicineDetailModalProps) {
  if (!medicine) return null;

  const stock = inventoryDoc?.quantity ?? 0;
  const minLevel = inventoryDoc?.minStockLevel ?? medicine.minStockLevel;

  const statusVariant =
    stock === 0 ? "error" : stock <= minLevel ? "warning" : "success";
  const statusLabel =
    stock === 0 ? "Hết hàng" : stock <= minLevel ? "Sắp hết" : "Còn hàng";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={medicine.name}
      subtitle={`SKU: ${medicine.sku}`}
      maxWidth="max-w-2xl"
    >
      <div className="px-8 py-6 space-y-6">
        {/* Header row: icon + status */}
        <div className="flex items-center gap-4">
          <div
            className={[
              "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
              medicine.iconBg,
              medicine.iconColor,
            ].join(" ")}
          >
            <span className="material-symbols-outlined text-3xl">
              {medicine.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  medicine.category === "prescribed" ? "info" : "neutral"
                }
              >
                {medicine.category === "prescribed" ? "Kê đơn" : "Không kê đơn"}
              </Badge>
              <Badge variant={medicine.isActive ? "success" : "neutral"}>
                {medicine.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
              </Badge>
              <Badge variant={statusVariant} dot>
                {statusLabel}
              </Badge>
            </div>
            {medicine.description && (
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {medicine.description}
              </p>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Giá nhập",
              value: `${medicine.importPrice.toLocaleString("vi-VN")}đ`,
              icon: "input",
              bg: "bg-surface-container-low",
            },
            {
              label: "Giá bán",
              value: `${medicine.sellPrice.toLocaleString("vi-VN")}đ`,
              icon: "sell",
              bg: "bg-primary-container",
              highlight: true,
            },
            {
              label: "Tồn kho",
              value: stock.toLocaleString("vi-VN"),
              icon: "inventory_2",
              bg: "bg-surface-container-low",
            },
            {
              label: "Tồn tối thiểu",
              value: minLevel.toLocaleString("vi-VN"),
              icon: "warning",
              bg: "bg-surface-container-low",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={["p-4 rounded-2xl", card.bg].join(" ")}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={[
                    "material-symbols-outlined text-base",
                    card.highlight
                      ? "text-on-primary-container/70"
                      : "text-primary",
                  ].join(" ")}
                >
                  {card.icon}
                </span>
                <p
                  className={[
                    "text-[10px] font-bold uppercase tracking-widest",
                    card.highlight
                      ? "text-on-primary-container/70"
                      : "text-on-surface-variant",
                  ].join(" ")}
                >
                  {card.label}
                </p>
              </div>
              <p
                className={[
                  "text-lg font-extrabold font-mono",
                  card.highlight
                    ? "text-on-primary-container"
                    : "text-on-surface",
                ].join(" ")}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Stock bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-bold uppercase tracking-widest">
              Mức tồn kho hiện tại
            </span>
            <span>
              {stock} / {minLevel} (tối thiểu)
            </span>
          </div>
          <StockBar qty={stock} min={minLevel} />
        </div>

        {/* Detail rows */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm border-t border-outline-variant/10 pt-4">
          {[
            { label: "Đơn vị tính", value: medicine.unitName },
            {
              label: "Lãi gộp",
              value: `${Math.round(((medicine.sellPrice - medicine.importPrice) / medicine.importPrice) * 100)}%`,
            },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-on-surface-variant">{row.label}</span>
              <span className="font-semibold text-on-surface">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-outline-variant/10">
          <Button
            variant="ghost"
            icon="history"
            onClick={onViewBatches}
            className="flex-1 justify-center"
          >
            Xem lô hàng
          </Button>
          <Button
            variant="ghost"
            icon="edit"
            onClick={onEdit}
            className="flex-1 justify-center"
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
