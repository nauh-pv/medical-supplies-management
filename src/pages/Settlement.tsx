import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, Button, Modal } from "@/components/common";
import {
  SettlementFilterBar,
  type SettlementStatusFilter,
} from "@/components/settlement/SettlementFilterBar";
import { SettlementYearTable } from "@/components/settlement/SettlementYearTable";
import { SettlementConfirmModal } from "@/components/settlement/SettlementConfirmModal";
import { getBranches } from "@/services/inventory";
import { getSettlementsByBranch } from "@/services/settlement";
import type { UserDoc, SettlementDoc } from "@/types/firestore";

const DEFAULT_YEAR = String(new Date().getFullYear());

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

export function Settlement() {
  const [searchParams] = useSearchParams();

  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [branchId, setBranchId] = useState(searchParams.get("branchId") ?? "");
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [statusFilter, setStatusFilter] =
    useState<SettlementStatusFilter>("all");

  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState<SettlementDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [settleTargetMonth, setSettleTargetMonth] = useState<string | null>(
    null,
  );
  const [viewTarget, setViewTarget] = useState<SettlementDoc | null>(null);

  useEffect(() => {
    getBranches()
      .then((brs) => setBranches(brs.filter((b) => b.status === "active")))
      .catch(console.error);
  }, []);

  const loadSettlements = useCallback(async (bid: string, y: string) => {
    if (!bid) return;
    setLoading(true);
    try {
      const all = await getSettlementsByBranch(bid);
      console.log("check all:", all);

      setSettlements(all.filter((s) => s.month.startsWith(y)));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load when arriving with ?branchId query param
  useEffect(() => {
    const paramBranchId = searchParams.get("branchId");
    if (paramBranchId) {
      loadSettlements(paramBranchId, DEFAULT_YEAR);
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
        subtitle="Tổng kho xác nhận quyết toán doanh thu và hàng hóa cho từng chi nhánh theo tháng."
      />

      <SettlementFilterBar
        branches={branches}
        branchId={branchId}
        year={year}
        statusFilter={statusFilter}
        loading={loading}
        onBranchChange={(v) => {
          setBranchId(v);
          setLoaded(false);
          setSettlements([]);
        }}
        onYearChange={(v) => {
          setYear(v);
          setLoaded(false);
          setSettlements([]);
        }}
        onStatusChange={setStatusFilter}
        onLoad={() => loadSettlements(branchId, year)}
      />

      {loaded ? (
        <SettlementYearTable
          settlements={settlements}
          year={year}
          statusFilter={statusFilter}
          onSettle={setSettleTargetMonth}
          onViewDetail={setViewTarget}
        />
      ) : !loading && branchId ? (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-16 text-center text-sm text-on-surface-variant">
          Vui lòng chọn chi nhánh và năm, sau đó nhấn{" "}
          <span className="font-semibold text-on-surface">Tải dữ liệu</span> để
          xem lịch sử quyết toán.
        </div>
      ) : !loading && !branchId ? (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-16 text-center text-sm text-on-surface-variant">
          Vui lòng chọn chi nhánh để bắt đầu.
        </div>
      ) : null}

      <SettlementConfirmModal
        open={!!settleTargetMonth}
        onClose={() => setSettleTargetMonth(null)}
        branchId={branchId}
        branchName={selectedBranchName}
        month={settleTargetMonth ?? ""}
        onSuccess={() => {
          setSettleTargetMonth(null);
          loadSettlements(branchId, year);
        }}
      />

      {/* View detail modal for already-settled months */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={
          viewTarget
            ? `Chi tiết quyết toán Tháng ${
                viewTarget.month.split("-")[1]
              }/${viewTarget.month.split("-")[0]}`
            : ""
        }
        subtitle={viewTarget ? `Chi nhánh: ${viewTarget.branchName}` : ""}
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
