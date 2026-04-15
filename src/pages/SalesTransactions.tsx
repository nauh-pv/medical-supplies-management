import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/common";
import {
  SalesFilterBar,
  type SalesPeriod,
} from "@/components/reports/SalesFilterBar";
import { SalesStatCards } from "@/components/reports/SalesStatCards";
import { SalesTransactionTable } from "@/components/reports/SalesTransactionTable";
import { getAllPosTransactions } from "@/services/pos";
import { getBranches } from "@/services/inventory";
import type { PosTransactionDoc, UserDoc } from "@/types/firestore";

function getSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

function getPeriodStart(period: SalesPeriod): number {
  const now = new Date();
  switch (period) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.getTime() / 1000;
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d.getTime() / 1000;
    }
    case "quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const d = new Date(now.getFullYear(), qMonth, 1);
      return d.getTime() / 1000;
    }
    case "year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return d.getTime() / 1000;
    }
  }
}

export function SalesTransactions() {
  const [transactions, setTransactions] = useState<PosTransactionDoc[]>([]);
  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [period, setPeriod] = useState<SalesPeriod>("month");

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllPosTransactions(), getBranches()])
      .then(([txs, brs]) => {
        setTransactions(txs);
        setBranches(brs);
      })
      .catch((err) => console.error("SalesTransactions fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        id: b.branchId ?? "",
        name: b.branchName ?? b.displayName,
      })),
    [branches],
  );

  const filtered = useMemo(() => {
    const periodStart = getPeriodStart(period);

    return transactions.filter((tx) => {
      // Period filter
      const txSecs = getSeconds(tx.createdAt);
      if (txSecs < periodStart) return false;

      // Branch filter
      if (selectedBranch && tx.branchId !== selectedBranch) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchCode = tx.code.toLowerCase().includes(q);
        const matchBranch = tx.branchName.toLowerCase().includes(q);
        const matchTotal = tx.total.toString().includes(q);
        if (!matchCode && !matchBranch && !matchTotal) return false;
      }

      return true;
    });
  }, [transactions, search, selectedBranch, period]);

  const totalRevenue = useMemo(
    () => filtered.reduce((s, tx) => s + tx.total, 0),
    [filtered],
  );

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <span className="text-primary">Danh sách hàng bán ra</span>
          </nav>
        }
        title="Danh sách hàng bán ra"
        titleSize="text-4xl"
        subtitle="Theo dõi và phân tích dữ liệu hóa đơn xuất kho bán lẻ trên toàn hệ thống chi nhánh."
      />

      <SalesFilterBar
        search={search}
        onSearchChange={setSearch}
        branches={branchOptions}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        period={period}
        onPeriodChange={setPeriod}
      />

      <SalesStatCards
        totalRevenue={totalRevenue}
        totalOrders={filtered.length}
        loading={loading}
      />

      <SalesTransactionTable data={filtered} loading={loading} />
    </main>
  );
}
