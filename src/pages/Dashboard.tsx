import { PageHeader } from "@/components/common";
import { StatSummaryRow } from "@/components/dashboard/StatSummaryRow";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopSellingTable } from "@/components/dashboard/TopSellingTable";
import { StockDynamicsPanel } from "@/components/dashboard/StockDynamicsPanel";

export function Dashboard() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        title="Tổng quan Kho hàng"
        subtitle={
          <>
            Trạng thái hệ thống:{" "}
            <span className="text-green-600 font-semibold">Đang hoạt động</span>{" "}
            • Đồng bộ lần cuối: 2 phút trước
          </>
        }
      />

      <StatSummaryRow />

      <AlertsSection />

      <RevenueChart />

      {/* ── Row 4: Top Selling + Stock Dynamics ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TopSellingTable />
        </div>
        <StockDynamicsPanel />
      </section>
    </main>
  );
}
