import { useState, useEffect } from "react";
import { Modal, Button, Badge, DataTable } from "@/components/common";
import { getBatchesByMedicine } from "@/services/inventory";
import type { BatchDoc } from "@/types/firestore";

function formatTs(ts: { seconds: number } | undefined): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("vi-VN");
}

function isNearExpiry(ts: { seconds: number } | undefined): boolean {
  if (!ts) return false;
  const diff = ts.seconds * 1000 - Date.now();
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // < 90 days
}

function isExpired(ts: { seconds: number } | undefined): boolean {
  if (!ts) return false;
  return ts.seconds * 1000 < Date.now();
}

interface BatchHistoryModalProps {
  open: boolean;
  onClose: () => void;
  medicineId: string;
  medicineName: string;
  unitName: string;
  sku: string;
  locationId: string;
}

export function BatchHistoryModal({
  open,
  onClose,
  medicineId,
  medicineName,
  unitName,
  sku,
  locationId,
}: BatchHistoryModalProps) {
  const [batches, setBatches] = useState<BatchDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !medicineId || !locationId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getBatchesByMedicine(medicineId, locationId)
      .then((data) => {
        if (!cancelled) {
          setBatches(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("BatchHistoryModal fetch error:", err);
          setError("Không thể tải dữ liệu lô hàng.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, medicineId]);

  const totalStock = batches.reduce((s, b) => s + b.quantity, 0);
  const activeBatches = batches.filter((b) => b.status === "active").length;
  const nearExpiryCount = batches.filter((b) =>
    isNearExpiry(b.expiryDate as unknown as { seconds: number } | undefined),
  ).length;
  const avgPrice =
    batches.length > 0
      ? Math.round(
          batches.reduce((s, b) => s + b.importPrice, 0) / batches.length,
        )
      : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lịch sử nhập kho theo lô"
      subtitle={`${medicineName} · SKU: ${sku}`}
      maxWidth="max-w-5xl"
    >
      {/* Stats bar */}
      <div className="px-10 py-5 grid grid-cols-4 gap-6 bg-surface-container-low/50 border-t border-outline-variant/10">
        {[
          {
            label: "Tổng tồn kho",
            value: `${totalStock.toLocaleString("vi-VN")}`,
            sub: unitName,
            color: "text-primary",
          },
          {
            label: "Số lô hiện hành",
            value: String(activeBatches).padStart(2, "0"),
            sub: "",
            color: "text-on-surface",
          },
          {
            label: "Lô sắp hết hạn",
            value: String(nearExpiryCount).padStart(2, "0"),
            sub: "",
            color: nearExpiryCount > 0 ? "text-error" : "text-on-surface",
          },
          {
            label: "Giá nhập TB",
            value: avgPrice.toLocaleString("vi-VN"),
            sub: "VNĐ",
            color: "text-on-surface",
          },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
              {stat.label}
            </span>
            <span
              className={[
                "text-xl font-headline font-extrabold",
                stat.color,
              ].join(" ")}
            >
              {stat.value}{" "}
              {stat.sub && (
                <small className="text-sm font-normal text-on-surface-variant">
                  {stat.sub}
                </small>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="max-h-[400px] overflow-y-auto px-10 py-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-error">
            <span className="material-symbols-outlined text-4xl">error</span>
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: "lot",
                header: "Số lô",
                className: "font-bold text-primary font-mono text-xs",
              },
              {
                key: "importDate",
                header: "Ngày nhập",
                className: "text-on-surface-variant",
                render: (b) =>
                  formatTs(
                    b.importDate as unknown as { seconds: number } | undefined,
                  ),
              },
              {
                key: "supplierName",
                header: "Nhà cung cấp",
                className: "font-medium",
              },
              {
                key: "quantity",
                header: "Còn lại",
                headerClassName: "text-right",
                className: "text-right font-bold",
                render: (b) => b.quantity.toLocaleString("vi-VN"),
              },
              {
                key: "initialQuantity",
                header: "Nhập ban đầu",
                headerClassName: "text-right",
                className: "text-right text-on-surface-variant",
                render: (b) => b.initialQuantity.toLocaleString("vi-VN"),
              },
              {
                key: "unitName_col",
                header: "Đơn vị",
                headerClassName: "text-center",
                className: "text-center text-on-surface-variant",
                render: () => unitName,
              },
              {
                key: "importPrice",
                header: "Giá nhập",
                headerClassName: "text-right",
                className: "text-right text-on-surface-variant font-mono",
                render: (b) => b.importPrice.toLocaleString("vi-VN"),
              },
              {
                key: "expiryDate",
                header: "Hạn dùng",
                render: (b) => {
                  const expTs = b.expiryDate as unknown as
                    | { seconds: number }
                    | undefined;
                  const expired = isExpired(expTs);
                  const nearExpiry = !expired && isNearExpiry(expTs);
                  const expiryVariant = expired
                    ? "error"
                    : nearExpiry
                      ? "warning"
                      : "info";
                  return (
                    <Badge variant={expiryVariant}>{formatTs(expTs)}</Badge>
                  );
                },
              },
              {
                key: "status",
                header: "Trạng thái",
                headerClassName: "text-center",
                className: "text-center",
                render: (b) => {
                  const statusVariant =
                    b.status === "active"
                      ? "success"
                      : b.status === "expired"
                        ? "error"
                        : "neutral";
                  const statusLabel =
                    b.status === "active"
                      ? "Đang dùng"
                      : b.status === "expired"
                        ? "Hết hạn"
                        : "Thu hồi";
                  return <Badge variant={statusVariant}>{statusLabel}</Badge>;
                },
              },
            ]}
            data={batches}
            keyField="id"
            loading={loading}
            showIndex
            tableClassName="w-full text-left border-separate border-spacing-y-1.5"
            headerRowClassName=""
            rowClassName={(_, i) =>
              [
                "hover:bg-surface-bright transition-colors",
                i % 2 === 1 ? "bg-surface-container-low/30" : "",
              ].join(" ")
            }
            emptyText="Chưa có lô hàng nào được ghi nhận."
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant italic">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">
            info
          </span>
          Hiển thị tất cả lô hàng của thuốc này theo thứ tự nhập gần nhất.
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" icon="download">
            Xuất báo cáo
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </Modal>
  );
}
