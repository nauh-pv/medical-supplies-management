import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, Button, Modal } from "@/components/common";
import { SettlementFilterBar } from "@/components/settlement/SettlementFilterBar";
import { SettlementOverview } from "@/components/settlement/SettlementYearTable";
import { SettlementConfirmModal } from "@/components/settlement/SettlementConfirmModal";
import { getBranches } from "@/services/inventory";
import {
  getSettlementsByBranch,
  getDispatchesForSettlement,
  getPosForSettlement,
  calcSettlementSummary,
} from "@/services/settlement";
import type { UserDoc, SettlementDoc } from "@/types/firestore";

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function toDateStr(ts: unknown): string {
  const secs = (ts as { seconds?: number })?.seconds;
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleDateString("vi-VN");
}

function formatDateRange(startDate: string, endDate: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const s = new Date(startDate).toLocaleDateString("vi-VN", opts);
  const e = new Date(endDate).toLocaleDateString("vi-VN", opts);
  return `${s} → ${e}`;
}

/** Get the day after a given date string (YYYY-MM-DD) */
function nextDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Settlement() {
  const [searchParams] = useSearchParams();

  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [branchId, setBranchId] = useState(searchParams.get("branchId") ?? "");

  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState<SettlementDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Unsettled period info
  const [unsettledLoading, setUnsettledLoading] = useState(false);
  const [unsettledRevenue, setUnsettledRevenue] = useState(0);
  const [unsettledProfit, setUnsettledProfit] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<SettlementDoc | null>(null);

  useEffect(() => {
    getBranches()
      .then((brs) => setBranches(brs.filter((b) => b.status === "active")))
      .catch(console.error);
  }, []);

  // Calculate unsettled start date
  const unsettledStartDate =
    settlements.length > 0
      ? nextDay(settlements[0].endDate) // settlements sorted desc, [0] is latest
      : "2024-01-01"; // fallback: start of records

  const unsettledEndDate = todayStr();

  const unsettledDays = Math.max(
    0,
    Math.ceil(
      (new Date(unsettledEndDate).getTime() -
        new Date(unsettledStartDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const loadSettlements = useCallback(async (bid: string) => {
    if (!bid) return;
    setLoading(true);
    try {
      const all = await getSettlementsByBranch(bid);
      setSettlements(all);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load unsettled amounts after settlements are loaded
  useEffect(() => {
    if (!loaded || !branchId || unsettledStartDate > unsettledEndDate) return;
    setUnsettledLoading(true);
    Promise.all([
      getDispatchesForSettlement(
        branchId,
        unsettledStartDate,
        unsettledEndDate,
      ),
      getPosForSettlement(branchId, unsettledStartDate, unsettledEndDate),
    ])
      .then(([dispatches, posTxs]) => {
        const summary = calcSettlementSummary(dispatches, posTxs);
        setUnsettledRevenue(summary.totalRevenue);
        setUnsettledProfit(summary.totalProfit);
      })
      .catch(console.error)
      .finally(() => setUnsettledLoading(false));
  }, [loaded, branchId, unsettledStartDate, unsettledEndDate]);

  // Auto-load when arriving with ?branchId query param
  useEffect(() => {
    const paramBranchId = searchParams.get("branchId");
    if (paramBranchId) {
      loadSettlements(paramBranchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBranchName =
    branches.find((b) => (b.branchId ?? b.uid) === branchId)?.branchName ?? "";

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Tài chính
          </span>
        }
        title="Quyết toán"
        subtitle="Tổng kho xác nhận quyết toán doanh thu và hàng hóa cho từng chi nhánh theo kỳ tùy chọn."
      />

      <SettlementFilterBar
        branches={branches}
        branchId={branchId}
        loading={loading}
        onBranchChange={(v) => {
          setBranchId(v);
          setLoaded(false);
          setSettlements([]);
          setUnsettledRevenue(0);
          setUnsettledProfit(0);
        }}
        onLoad={() => loadSettlements(branchId)}
      />

      {loaded ? (
        <SettlementOverview
          settlements={settlements}
          unsettled={{
            startDate: unsettledStartDate,
            endDate: unsettledEndDate,
            days: unsettledDays,
            loading: unsettledLoading,
            totalRevenue: unsettledRevenue,
            totalProfit: unsettledProfit,
          }}
          onCreateNew={() => setShowCreateModal(true)}
          onViewDetail={setViewTarget}
        />
      ) : !loading && branchId ? (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-16 text-center text-sm text-on-surface-variant">
          Vui lòng chọn chi nhánh, sau đó nhấn{" "}
          <span className="font-semibold text-on-surface">Tải dữ liệu</span> để
          xem lịch sử quyết toán.
        </div>
      ) : !loading && !branchId ? (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-16 text-center text-sm text-on-surface-variant">
          Vui lòng chọn chi nhánh để bắt đầu.
        </div>
      ) : null}

      <SettlementConfirmModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        branchId={branchId}
        branchName={selectedBranchName}
        defaultStartDate={unsettledStartDate}
        defaultEndDate={unsettledEndDate}
        onSuccess={() => {
          setShowCreateModal(false);
          loadSettlements(branchId);
        }}
      />

      {/* View detail modal for a settlement */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget ? `Chi tiết quyết toán` : ""}
        subtitle={
          viewTarget
            ? `${viewTarget.branchName} — ${formatDateRange(viewTarget.startDate, viewTarget.endDate)}`
            : ""
        }
        maxWidth="max-w-lg"
      >
        {viewTarget && (
          <div className="px-10 py-8 space-y-6">
            <div className="rounded-xl bg-surface-container-low p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  Doanh thu bán ra
                </span>
                <span className="font-bold text-on-surface">
                  {fmt(viewTarget.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/20 pt-2">
                <span className="text-on-surface-variant font-semibold">
                  Lợi nhuận gộp
                </span>
                <span className="font-bold text-primary">
                  {fmt(viewTarget.totalProfit)}
                </span>
              </div>
            </div>

            <div className="text-sm space-y-2 text-on-surface-variant">
              <div>
                Kỳ quyết toán:{" "}
                <span className="text-on-surface font-medium">
                  {formatDateRange(viewTarget.startDate, viewTarget.endDate)}
                </span>
              </div>
              <div>
                Người quyết toán:{" "}
                <span className="text-on-surface font-medium">
                  {viewTarget.createdByName}
                </span>
              </div>
              <div>
                Ngày quyết toán:{" "}
                <span className="text-on-surface font-medium">
                  {toDateStr(viewTarget.createdAt)}
                </span>
              </div>
              {viewTarget.notes && (
                <div>
                  Ghi chú:{" "}
                  <span className="text-on-surface">{viewTarget.notes}</span>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => setViewTarget(null)}
              className="w-full justify-center"
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>
    </main>
  );
}
