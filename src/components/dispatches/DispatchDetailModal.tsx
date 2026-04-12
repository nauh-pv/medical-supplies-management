import { Modal, Button, Badge } from "@/components/common";
import type { DispatchOrderDoc } from "@/types/firestore";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "info" | "success" | "warning" | "error" }
> = {
  pending: { label: "Chờ xử lý", variant: "warning" },
  shipping: { label: "Đang vận chuyển", variant: "info" },
  received: { label: "Đã nhận", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "error" },
};

function formatTs(ts: unknown): string {
  if (!ts) return "—";
  const secs = (ts as { seconds: number }).seconds;
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DispatchDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: DispatchOrderDoc | null;
  onConfirmReceived?: (orderId: string) => void;
  confirmingId?: string | null;
}

export function DispatchDetailModal({
  open,
  onClose,
  order,
  onConfirmReceived,
  confirmingId,
}: DispatchDetailModalProps) {
  const status = order
    ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending)
    : STATUS_CONFIG.pending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết đơn xuất kho"
      maxWidth="max-w-4xl"
    >
      {/* Sub-header: code + date + status */}
      <div className="px-10 py-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">
              confirmation_number
            </span>
            {order?.code ?? "—"}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">event</span>
            {formatTs(order?.createdAt)}
          </span>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Body */}
      <div className="px-10 py-8 space-y-8 max-h-[500px] overflow-y-auto">
        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Chi nhánh nhận
            </p>
            <p className="font-bold text-on-surface">
              {order?.toLocationName ?? "—"}
            </p>
            <p className="text-sm text-on-surface-variant">
              Người tạo: {order?.createdByName ?? "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Ghi chú vận chuyển
            </p>
            <p className="text-sm text-on-surface-variant italic">
              {order?.notes || "Không có ghi chú."}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="space-y-3">
          <h4 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            Danh mục vật tư xuất kho
          </h4>
          <div className="bg-surface-container-low rounded-[1.5rem] overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-dim/20">
                  {["Tên thuốc/Vật tư", "Đơn vị", "Số lượng", "Thành tiền"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {(order?.items ?? []).map((item, i) => (
                  <tr key={i} className="bg-surface-container-lowest">
                    <td className="px-5 py-4">
                      <p className="font-bold text-on-surface text-sm">
                        {item.medicineName}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-medium">
                        SKU: {item.medicineSku} | Lô: {item.lot}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {item.unitName}
                    </td>
                    <td className="px-5 py-4 font-bold text-on-surface text-sm">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary text-sm">
                      {item.total.toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-dim/10">
                  <td
                    colSpan={3}
                    className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Tổng giá trị đơn hàng
                  </td>
                  <td className="px-5 py-4 font-headline font-black text-lg text-primary">
                    {(order?.total ?? 0).toLocaleString("vi-VN")}đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline + packages */}
        <div className="flex items-start gap-6">
          <div className="flex-1 bg-surface-container-low/50 rounded-[1.5rem] p-6 border-l-4 border-primary">
            <h5 className="text-xs font-label font-bold uppercase tracking-widest text-primary mb-4">
              Lịch trình vận hành
            </h5>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_0_4px_rgba(0,102,255,0.1)]" />
                  <div className="w-px flex-1 bg-outline-variant mt-2" />
                </div>
                <div className="pb-3">
                  <p className="text-xs font-bold text-on-surface">
                    Xác nhận xuất kho
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    {formatTs(order?.createdAt)} | Bởi{" "}
                    {order?.createdByName ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div
                  className={[
                    "w-2 h-2 rounded-full mt-0.5 flex-shrink-0",
                    order?.shippedAt
                      ? "bg-primary-container shadow-[0_0_0_4px_rgba(0,102,255,0.1)]"
                      : "bg-outline-variant",
                  ].join(" ")}
                />
                <div>
                  <p
                    className={[
                      "text-xs font-bold",
                      order?.shippedAt
                        ? "text-on-surface"
                        : "text-on-surface-variant",
                    ].join(" ")}
                  >
                    Đang trên đường giao hàng
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    {order?.shippedAt
                      ? formatTs(order.shippedAt)
                      : "Đang cập nhật..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-44 p-5 bg-surface-container-lowest border border-surface-container-high rounded-[1.5rem]">
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Tổng kiện hàng
            </p>
            <p className="text-3xl font-headline font-black text-primary">
              {(order?.totalQty ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
        <Button variant="ghost" icon="print">
          In phiếu xuất
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          {onConfirmReceived &&
            order &&
            order.status !== "received" &&
            order.status !== "cancelled" && (
              <Button
                onClick={() => onConfirmReceived(order.id)}
                disabled={confirmingId === order.id}
                icon="check_circle"
              >
                {confirmingId === order.id
                  ? "Đang xử lý…"
                  : "Xác nhận nhập kho"}
              </Button>
            )}
        </div>
      </div>
    </Modal>
  );
}
