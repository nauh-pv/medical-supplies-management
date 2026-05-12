import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/common";
import { SalesFilterBar } from "@/components/reports/SalesFilterBar";
import { SalesStatCards } from "@/components/reports/SalesStatCards";
import { SalesTransactionTable } from "@/components/reports/SalesTransactionTable";
import { getAllPosTransactions } from "@/services/pos";
import { getBranches } from "@/services/inventory";
import type { PosTransactionDoc, UserDoc } from "@/types/firestore";
import { CURRENT_YEAR, CURRENT_MONTH_INDEX } from "@/utils/dateConfig";

function getSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

export function SalesTransactions() {
  const [transactions, setTransactions] = useState<PosTransactionDoc[]>([]);
  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH_INDEX);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllPosTransactions(), getBranches()])
      .then(([txs, brs]) => {
        setTransactions(txs);
        const brsValid = brs.filter((d) => d.status === "active");
        setBranches(brsValid);
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
    const monthStart = new Date(selectedYear, selectedMonth, 1).getTime() / 1000;
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 1).getTime() / 1000;

    return transactions.filter((tx) => {
      // Month filter
      const txSecs = getSeconds(tx.createdAt);
      if (txSecs < monthStart || txSecs >= monthEnd) return false;

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
  }, [transactions, search, selectedBranch, selectedMonth, selectedYear]);

  const totalRevenue = useMemo(
    () => filtered.reduce((s, tx) => s + tx.total, 0),
    [filtered],
  );

  const totalProfit = useMemo(
    () =>
      filtered.reduce(
        (s, tx) =>
          s +
          tx.items.reduce(
            (is, item) =>
              is + (item.unitPrice - item.importPrice) * item.quantity,
            0,
          ),
        0,
      ),
    [filtered],
  );

  return (
    <main className="md:ml-72 pt-24 px-4 md:px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Danh sách hàng bán ra
          </span>
        }
        title="Báo cáo"
        subtitle="Theo dõi và phân tích dữ liệu hóa đơn xuất kho bán lẻ trên toàn hệ thống chi nhánh."
      />

      <SalesStatCards
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        totalOrders={filtered.length}
        loading={loading}
      />

      <SalesFilterBar
        search={search}
        onSearchChange={setSearch}
        branches={branchOptions}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <SalesTransactionTable data={filtered} loading={loading} />
    </main>
  );
}
