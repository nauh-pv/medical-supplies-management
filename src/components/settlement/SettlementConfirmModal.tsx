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

function formatMonth(month: string): string {
  if (!month) return "";
  const [year, m] = month.split("-");
  return `Tháng ${m}/${year}`;
}

interface SettlementConfirmModalProps {
  open: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  month: string;
  onSuccess: () => void;
}

export function SettlementConfirmModal({
  open,
  onClose,
  branchId,
  branchName,
  month,
  onSuccess,
}: SettlementConfirmModalProps) {
  const userDoc = useUserContext();
  const [loading, setLoading] = useState(false);
  const [dispatches, setDispatches] = useState<DispatchOrderDoc[]>([]);
  const [summary, setSummary] = useState({
    totalDispatched: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !branchId || !month) return;
    setLoading(true);
    setNotes("");
    Promise.all([
      getDispatchesForSettlement(branchId, month),
      getPosForSettlement(branchId, month),
    ])
      .then(([dispatchData, posTxs]) => {
        setDispatches(dispatchData);
        setSummary(calcSettlementSummary(dispatchData, posTxs));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, branchId, month]);

  async function handleConfirm() {
    if (!userDoc) return;
    setSaving(true);
    try {
      await createSettlement({
        branchId,
        branchName,
        month,
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
      title={`Xác nhận quyết toán ${formatMonth(month)}`}
      subtitle={`Chi nhánh: ${branchName}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="px-10 py-16 text-center text-sm text-on-surface-variant">
          Đang tải dữ liệu tháng...
        </div>
      ) : (
        <>
          {/* Scrollable content */}
          <div className="px-10 pt-6 pb-4 space-y-6 max-h-[55vh] overflow-y-auto">
            <SettlementSummaryCards
              totalRevenue={summary.totalRevenue}
              totalProfit={summary.totalProfit}
            />

            <SettlementDispatchTable dispatches={dispatches} />

            {summary.totalRevenue === 0 && (
              <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error font-medium">
                ⚠️ Tháng này không có doanh thu bán lẻ. Không thể quyết toán.
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
              disabled={saving || summary.totalRevenue === 0}
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
