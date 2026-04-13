import { useState, useEffect } from "react";
import { Modal } from "@/components/common";
import { getActiveBatches } from "@/services/inventory";
import type { MedicineDoc, BatchDoc } from "@/types/firestore";

interface BatchSelectModalProps {
  open: boolean;
  onClose: () => void;
  medicine: MedicineDoc | null;
  locationId: string;
  onSelect: (batch: BatchDoc) => void;
}

function formatDate(ts: unknown): string {
  const secs = (ts as { seconds?: number })?.seconds;
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleDateString("vi-VN");
}

export function BatchSelectModal({
  open,
  onClose,
  medicine,
  locationId,
  onSelect,
}: BatchSelectModalProps) {
  const [batches, setBatches] = useState<BatchDoc[]>([]);
  const [nowMs, setNowMs] = useState(0);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);

  // Resetting fetchedFor in an event handler (not an effect) avoids lint issues.
  // This ensures every open of the modal fetches fresh data from Firestore.
  const handleClose = () => {
    setFetchedFor(null);
    onClose();
  };

  // Derived: loading when the modal is open with a medicine but we
  // haven't completed a fetch for that specific medicine yet.
  const loading = open && !!medicine && fetchedFor !== medicine.id;

  useEffect(() => {
    if (!open || !medicine) return;
    if (medicine.id === fetchedFor) return;
    const now = new Date().getTime();
    getActiveBatches(locationId).then((bs) => {
      setBatches(
        bs
          .filter((b) => b.medicineId === medicine.id && b.quantity > 0)
          // FIFO: oldest import first
          .sort((a, b) => {
            const ta =
              (a.importDate as unknown as { seconds?: number })?.seconds ?? 0;
            const tb =
              (b.importDate as unknown as { seconds?: number })?.seconds ?? 0;
            return ta - tb;
          }),
      );
      setNowMs(now);
      setFetchedFor(medicine.id);
    });
  }, [open, medicine, locationId, fetchedFor]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Chọn lô hàng"
      subtitle={medicine?.name ?? ""}
      maxWidth="max-w-lg"
    >
      <div className="px-8 py-6 space-y-3">
        {loading ? (
          <div className="py-10 flex items-center justify-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary">
              progress_activity
            </span>
            <span className="text-sm">Đang tải lô hàng...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="py-10 text-center text-sm text-on-surface-variant">
            Không có lô hàng nào trong kho cho sản phẩm này.
          </div>
        ) : (
          <>
            <p className="text-xs text-on-surface-variant uppercase font-label font-bold tracking-widest mb-4">
              {batches.length} lô có sẵn — Chọn lô để thêm vào đơn
            </p>
            {batches.map((b) => {
              const expirySecs =
                (b.expiryDate as unknown as { seconds?: number })?.seconds ?? 0;
              const daysLeft = expirySecs
                ? Math.ceil((expirySecs * 1000 - nowMs) / 86_400_000)
                : null;
              const isNearExpiry = daysLeft !== null && daysLeft <= 30;
              const isExpired = daysLeft !== null && daysLeft <= 0;

              return (
                <button
                  key={b.id}
                  disabled={isExpired}
                  onClick={() => {
                    onSelect(b);
                    handleClose();
                  }}
                  className={[
                    "w-full text-left rounded-xl p-4 transition-all group border",
                    isExpired
                      ? "opacity-40 cursor-not-allowed bg-surface-container-low border-transparent"
                      : "bg-surface-container-low hover:bg-surface-container hover:border-primary/30 border-transparent hover:shadow-sm",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-on-surface">
                          Lô: {b.lot}
                        </span>
                        {isExpired && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/15 text-error">
                            Hết hạn
                          </span>
                        )}
                        {!isExpired && isNearExpiry && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Sắp HH ({daysLeft}d)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-on-surface-variant">
                        <span>HSD: {formatDate(b.expiryDate)}</span>
                        <span>NK: {formatDate(b.importDate)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">
                        {b.quantity.toLocaleString("vi-VN")}{" "}
                        <span className="text-xs font-normal text-on-surface-variant">
                          {medicine?.unitName}
                        </span>
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                        Giá nhập: {b.importPrice.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors flex-shrink-0">
                      chevron_right
                    </span>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </Modal>
  );
}
