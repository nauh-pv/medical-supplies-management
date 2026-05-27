import { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/common";
import { SettlementSummaryCards } from "./SettlementSummaryCards";
import { SettlementDispatchTable } from "./SettlementDispatchTable";
import {
  getDispatchesForSettlement,
  getPosForSettlement,
  calcSettlementSummary,
  createSettlement,
} from "@/services/settlement";
import { useUserContext } from "@/contexts/UserContext";
import type { DispatchOrderDoc } from "@/types/firestore";

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "";
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const s = new Date(startDate).toLocaleDateString("vi-VN", opts);
  const e = new Date(endDate).toLocaleDateString("vi-VN", opts);
  return `${s} → ${e}`;
}

interface SettlementConfirmModalProps {
  open: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  defaultStartDate: string;
  defaultEndDate: string;
  onSuccess: () => void;
}

export function SettlementConfirmModal({
  open,
  onClose,
  branchId,
  branchName,
  defaultStartDate,
  defaultEndDate,
  onSuccess,
}: SettlementConfirmModalProps) {
  const userDoc = useUserContext();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [loading, setLoading] = useState(false);
  const [dispatches, setDispatches] = useState<DispatchOrderDoc[]>([]);
  const [summary, setSummary] = useState({
    totalDispatched: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync defaults when modal opens
  useEffect(() => {
    if (open) {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
    }
  }, [open, defaultStartDate, defaultEndDate]);

  useEffect(() => {
    if (!open || !branchId || !startDate || !endDate) return;
    setLoading(true);
    setNotes("");
    Promise.all([
      getDispatchesForSettlement(branchId, startDate, endDate),
      getPosForSettlement(branchId, startDate, endDate),
    ])
      .then(([dispatchData, posTxs]) => {
        setDispatches(dispatchData);
        setSummary(calcSettlementSummary(dispatchData, posTxs));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, branchId, startDate, endDate]);

  async function handleConfirm() {
    if (!userDoc) return;
    setSaving(true);
    try {
      await createSettlement({
        branchId,
        branchName,
        startDate,
        endDate,
        totalDispatched: summary.totalDispatched,
        totalRevenue: summary.totalRevenue,
        totalProfit: summary.totalProfit,
        createdBy: userDoc.uid,
        createdByName: userDoc.displayName,
        notes: notes.trim(),
      });
      onSuccess();
    } catch (err) {
      console.error("Settlement save error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xác nhận quyết toán"
      subtitle={`Chi nhánh: ${branchName}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="px-10 py-16 text-center text-sm text-on-surface-variant">
          Đang tải dữ liệu kỳ quyết toán...
        </div>
      ) : (
        <>
          {/* Scrollable content */}
          <div className="px-10 pt-6 pb-4 space-y-6 max-h-[55vh] overflow-y-auto">
            {/* Date range inputs */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Từ ngày"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Đến ngày"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Kỳ quyết toán:{" "}
              <span className="font-semibold text-on-surface">
                {formatDateRange(startDate, endDate)}
              </span>
            </div>

            <SettlementSummaryCards
              totalRevenue={summary.totalRevenue}
              totalProfit={summary.totalProfit}
            />

            <SettlementDispatchTable dispatches={dispatches} />

            {summary.totalRevenue === 0 && (
              <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error font-medium">
                ⚠️ Kỳ này không có doanh thu bán lẻ. Không thể quyết toán.
              </div>
            )}

            <Input
              label="Ghi chú (tùy chọn)"
              placeholder="Nhập ghi chú về kỳ quyết toán này..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <p className="text-xs text-on-surface-variant">
              ⚠️ Sau khi xác nhận, kỳ quyết toán này sẽ được lưu vĩnh viễn và
              không thể thay đổi.
            </p>
          </div>

          {/* Sticky buttons */}
          <div className="px-10 py-5 border-t border-outline-variant/10 flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 justify-center"
            >
              Hủy bỏ
            </Button>
            <Button
              icon="task_alt"
              onClick={handleConfirm}
              disabled={
                saving ||
                summary.totalRevenue === 0 ||
                !startDate ||
                !endDate ||
                startDate > endDate
              }
              className="flex-1 justify-center"
            >
              {saving ? "Đang lưu..." : "Xác nhận quyết toán"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
