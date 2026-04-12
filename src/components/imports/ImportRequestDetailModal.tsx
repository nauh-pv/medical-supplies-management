import { useState, useEffect } from "react";
import { Modal, Button, Badge } from "@/components/common";
import { getImportRequests } from "@/services/inventory";
import type { ImportRequestDoc, ImportRequestStatus } from "@/types/firestore";

function formatTs(ts: { seconds: number } | undefined): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions);
}

const statusConfig: Record<
  ImportRequestStatus,
  { label: string; variant: "info" | "success" | "error" | "neutral" }
> = {
  pending: { label: "Chờ duyệt", variant: "info" },
  approved: { label: "Đã duyệt", variant: "success" },
  rejected: { label: "Từ chối", variant: "error" },
  fulfilled: { label: "Hoàn thành", variant: "neutral" },
};

const priorityConfig = {
  urgent: { label: "Khẩn cấp", variant: "error" as const },
  normal: { label: "Bình thường", variant: "info" as const },
  low: { label: "Thấp", variant: "neutral" as const },
};

interface ImportRequestDetailModalProps {
  open: boolean;
  requestId: string;
  onClose: () => void;
  /** Pass the full request object to skip fetching (branch side already has it). */
  request?: ImportRequestDoc | null;
  onConfirmFulfilled?: (requestId: string) => void;
  confirmingId?: string | null;
}

export function ImportRequestDetailModal({
  open,
  requestId,
  onClose,
  request: requestProp,
  onConfirmFulfilled,
  confirmingId,
}: ImportRequestDetailModalProps) {
  const [fetched, setFetched] = useState<ImportRequestDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use provided request or fetch by ID (manager side)
  const req = requestProp ?? fetched;

  useEffect(() => {
    if (requestProp) return; // already have the data
    if (!open || !requestId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setFetched(null);
    getImportRequests()
      .then((all) => {
        if (!cancelled) {
          const found = all.find((r) => r.id === requestId) ?? null;
          setFetched(found);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("ImportRequestDetailModal fetch error:", err);
          setError("Không thể tải dữ liệu yêu cầu.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, requestId, requestProp]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết yêu cầu nhập thuốc"
      subtitle={req ? `Mã: ${req.code}` : "Đang tải..."}
      maxWidth="max-w-4xl"
    >
      <div className="px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              progress_activity
            </span>
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-error">
            <span className="material-symbols-outlined text-4xl">error</span>
            <span className="text-sm">{error}</span>
          </div>
        ) : !req ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">inbox</span>
            <span className="text-sm">Không tìm thấy yêu cầu này.</span>
          </div>
        ) : (
          <>
            {/* Summary bento */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Chi nhánh", value: req.branchName },
                { label: "Người tạo", value: req.createdByName },
                {
                  label: "Ngày tạo",
                  value: formatTs(
                    req.createdAt as unknown as { seconds: number } | undefined,
                  ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 bg-surface-container-low rounded-2xl"
                >
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-on-surface truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Status + priority + total */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Trạng thái
                </p>
                <Badge variant={statusConfig[req.status].variant}>
                  {statusConfig[req.status].label}
                </Badge>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Mức ưu tiên
                </p>
                <Badge variant={priorityConfig[req.priority].variant}>
                  {priorityConfig[req.priority].label}
                </Badge>
              </div>
              <div className="p-4 bg-primary-container rounded-2xl relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <p className="text-[10px] font-bold text-on-primary-container/70 uppercase tracking-widest mb-1">
                  Tổng giá trị ước tính
                </p>
                <p className="text-xl font-extrabold font-mono text-on-primary-container">
                  {req.total.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-base flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary">
                    list_alt
                  </span>
                  Danh mục yêu cầu
                </h3>
                <div className="flex">
                  <p className="text-xs">Trạng thái:</p>
                  <Badge variant={statusConfig[req.status].variant}>
                    {statusConfig[req.status].label}
                  </Badge>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  {req.items.length} mặt hàng
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-outline-variant/10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container">
                      {[
                        "Tên thuốc",
                        "Đơn vị",
                        "Số lượng",
                        "Đơn giá ước tính",
                        "Thành tiền",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className={[
                            "py-3 px-5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest",
                            i >= 2
                              ? "text-right"
                              : i === 1
                                ? "text-center"
                                : "",
                          ].join(" ")}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-surface-container-lowest">
                    {req.items.map((item, i) => (
                      <tr
                        key={i}
                        className={[
                          "hover:bg-primary/5 transition-colors",
                          i % 2 === 1 ? "bg-surface-container-low/40" : "",
                        ].join(" ")}
                      >
                        <td className="py-4 px-5">
                          <p className="font-semibold text-on-surface text-sm">
                            {item.medicineName}
                          </p>
                          <p className="text-xs text-on-surface-variant font-mono">
                            {item.medicineSku}
                          </p>
                        </td>
                        <td className="text-center py-4 px-5 text-sm text-on-surface-variant">
                          {item.unitName}
                        </td>
                        <td className="text-right py-4 px-5 text-sm font-bold text-on-surface">
                          {item.quantity.toLocaleString("vi-VN")}
                        </td>
                        <td className="text-right py-4 px-5 text-sm text-on-surface-variant font-mono">
                          {item.estimatedPrice.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="text-right py-4 px-5 text-sm font-bold text-primary font-mono">
                          {(item.quantity * item.estimatedPrice).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {req.notes && (
              <div className="p-4 bg-surface-container-low rounded-2xl text-sm text-on-surface-variant">
                <span className="font-bold text-on-surface">Ghi chú: </span>
                {req.notes}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/10">
              <Button variant="ghost" icon="print">
                In phiếu
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Đóng
              </Button>
              {onConfirmFulfilled && req.status === "approved" && (
                <Button
                  icon="check_circle"
                  onClick={() => onConfirmFulfilled(req.id)}
                  disabled={confirmingId === req.id}
                >
                  {confirmingId === req.id
                    ? "Đang xử lý…"
                    : "Xác nhận nhập kho"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
