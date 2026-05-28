import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/common";
import { SalesFilterBar } from "@/components/reports/SalesFilterBar";
import { SalesStatCards } from "@/components/reports/SalesStatCards";
import { SalesTransactionTable } from "@/components/reports/SalesTransactionTable";
import { getAllPosTransactions } from "@/services/pos";
import { getBranches } from "@/services/inventory";
import type { PosTransactionDoc, UserDoc } from "@/types/firestore";

function getSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInput(date);
}

function shiftDate(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

function formatRange(startDate: string, endDate: string): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const start = new Date(startDate).toLocaleDateString("vi-VN", options);
  const end = new Date(endDate).toLocaleDateString("vi-VN", options);
  return `${start} → ${end}`;
}

export function SalesTransactions() {
  const [transactions, setTransactions] = useState<PosTransactionDoc[]>([]);
  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("WAREHOUSE");
  const [selectedStartDate, setSelectedStartDate] = useState(daysAgo(29));
  const [selectedEndDate, setSelectedEndDate] = useState(
    toDateInput(new Date()),
  );
  const today = useMemo(() => toDateInput(new Date()), []);

  const dateRangeErrors = useMemo(() => {
    const start = new Date(`${selectedStartDate}T00:00:00`).getTime();
    const end = new Date(`${selectedEndDate}T00:00:00`).getTime();
    const todayEnd = new Date(`${today}T00:00:00`).getTime();

    return {
      startDate: start >= end ? "Từ ngày phải bé hơn đến ngày." : undefined,
      endDate:
        end > todayEnd
          ? "Đến ngày phải bé hơn hoặc bằng ngày hiện tại."
          : undefined,
    };
  }, [selectedStartDate, selectedEndDate, today]);

  const isDateRangeValid =
    !dateRangeErrors.startDate && !dateRangeErrors.endDate;

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
      [
        { id: "WAREHOUSE", name: "Tổng kho" },
        branches.map((b) => ({
          id: b.branchId ?? "",
          name: b.branchName ?? b.displayName,
        })),
      ].flat(),
    [branches],
  );

  const selectedBranchName =
    branchOptions.find((branch) => branch.id === selectedBranch)?.name ??
    "Tất cả cơ sở";

  const rangeLabel = formatRange(selectedStartDate, selectedEndDate);

  const filterBounds = useMemo(() => {
    const start = new Date(`${selectedStartDate}T00:00:00`).getTime() / 1000;
    const end = new Date(`${selectedEndDate}T23:59:59`).getTime() / 1000 + 1;
    return { start, end };
  }, [selectedStartDate, selectedEndDate]);

  const filtered = useMemo(() => {
    if (!isDateRangeValid) return [];

    return transactions.filter((tx) => {
      const txSecs = getSeconds(tx.createdAt);
      if (txSecs < filterBounds.start || txSecs >= filterBounds.end)
        return false;

      if (selectedBranch && tx.branchId !== selectedBranch) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchCode = tx.code.toLowerCase().includes(q);
        const matchBranch = tx.branchName.toLowerCase().includes(q);
        const matchTotal = tx.total.toString().includes(q);
        if (!matchCode && !matchBranch && !matchTotal) return false;
      }

      return true;
    });
  }, [transactions, search, selectedBranch, filterBounds, isDateRangeValid]);

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
        subtitle={
          <>
            <span className="text-on-surface-variant">
              {selectedBranchName}
            </span>
            <span className="mx-2 text-on-surface-variant">•</span>
            <span className="text-on-surface">{rangeLabel}</span>
            <span className="ml-2 text-on-surface-variant">
              (mặc định 30 ngày gần nhất)
            </span>
          </>
        }
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
        selectedStartDate={selectedStartDate}
        onStartDateChange={setSelectedStartDate}
        selectedEndDate={selectedEndDate}
        onEndDateChange={setSelectedEndDate}
        startDateError={dateRangeErrors.startDate}
        endDateError={dateRangeErrors.endDate}
        maxEndDate={today}
        maxStartDate={shiftDate(
          selectedEndDate < today ? selectedEndDate : today,
          -1,
        )}
        minEndDate={shiftDate(selectedStartDate, 1)}
      />

      <SalesTransactionTable data={filtered} loading={loading} />
    </main>
  );
}
