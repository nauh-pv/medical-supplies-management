import { useState, useEffect } from "react";
import { Modal, Button } from "@/components/common";
import { getImportOrder } from "@/services/inventory";
import type { ImportOrderDoc } from "@/types/firestore";

function formatTs(ts: { seconds: number } | undefined): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface ImportDetailModalProps {
  open: boolean;
  importId: string;
  onClose: () => void;
}

export function ImportDetailModal({
  open,
  importId,
  onClose,
}: ImportDetailModalProps) {
  const [order, setOrder] = useState<ImportOrderDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !importId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setOrder(null);
    getImportOrder(importId)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("ImportDetailModal fetch error:", err);
          setError("Không thể tải dữ liệu đơn nhập.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, importId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết đơn nhập kho"
      subtitle={order ? `Mã đơn: ${order.code}` : "Đang tải..."}
      maxWidth="max-w-5xl"
    >
      <div className="px-8 py-6 space-y-8">
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
        ) : !order ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">inbox</span>
            <span className="text-sm">Không tìm thấy đơn nhập này.</span>
          </div>
        ) : (
          <>
            {/* Summary bento — 4 cards, last one is total value */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Mã nhập kho", value: order.code, highlight: false },
                {
                  label: "Ngày nhập",
                  value: formatTs(
                    order.createdAt as unknown as
                      | { seconds: number }
                      | undefined,
                  ),
                  highlight: false,
                },
                {
                  label: "Nhà cung cấp",
                  value: order.supplierName,
                  highlight: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-5 bg-surface-container-low rounded-[1.5rem]"
                >
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-on-surface truncate">
                    {item.value}
                  </p>
                </div>
              ))}
              {/* Tổng giá trị — highlight card */}
              <div className="p-5 bg-primary-container rounded-[1.5rem] relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-20%] w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <p className="text-[10px] font-bold text-on-primary-container/70 uppercase tracking-widest mb-1">
                  Tổng giá trị
                </p>
                <p className="text-xl font-extrabold font-mono text-on-primary-container">
                  {order.total.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            {/* Products table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-lg flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary">
                    list_alt
                  </span>
                  Danh mục sản phẩm
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  {order.items.length} loại thuốc
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-outline-variant/10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container">
                      {[
                        "Tên thuốc",
                        "Đơn vị",
                        "Lô",
                        "Số lượng",
                        "Đơn giá",
                        "Thành tiền",
                      ].map((h, i) => (
                        <th
                          key={i}
                          className={[
                            "py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest",
                            i >= 3
                              ? "text-right"
                              : i === 1 || i === 2
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
                    {order.items.map((item, i) => (
                      <tr
                        key={i}
                        className={[
                          "hover:bg-primary/5 transition-colors",
                          i % 2 === 1 ? "bg-surface-container-low/40" : "",
                        ].join(" ")}
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                              <span className="material-symbols-outlined text-base">
                                medication
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface text-sm">
                                {item.medicineName}
                              </p>
                              <p className="text-xs text-on-surface-variant font-mono">
                                {item.medicineSku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-5 px-6 text-sm text-on-surface font-medium">
                          {item.unitName}
                        </td>
                        <td className="text-center py-5 px-6">
                          <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded">
                            {item.lot}
                          </span>
                        </td>
                        <td className="text-right py-5 px-6 text-sm font-bold text-on-surface">
                          {item.quantity.toLocaleString("vi-VN")}
                        </td>
                        <td className="text-right py-5 px-6 text-sm text-on-surface-variant font-mono">
                          {item.unitPrice.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="text-right py-5 px-6 text-sm font-bold text-primary font-mono">
                          {item.total.toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {order.notes && (
              <div className="p-4 bg-surface-container-low rounded-2xl text-sm text-on-surface-variant">
                <span className="font-bold text-on-surface">Ghi chú: </span>
                {order.notes}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <Button variant="ghost" icon="print">
                In phiếu
              </Button>
              <Button variant="ghost" icon="download">
                Xuất Excel
              </Button>
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
