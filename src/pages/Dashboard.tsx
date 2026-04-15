import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common";
import { StatSummaryRow } from "@/components/dashboard/StatSummaryRow";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopSellingTable } from "@/components/dashboard/TopSellingTable";
import { StockDynamicsPanel } from "@/components/dashboard/StockDynamicsPanel";
import { getDashboardData } from "@/services/dashboard";
import type { DashboardData } from "@/services/dashboard";
import { useUserContext } from "@/contexts/UserContext";

export function Dashboard() {
  const userDoc = useUserContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until userDoc is resolved — avoids fetching with wrong locationId
    if (userDoc === null) return;
    const locationId = userDoc.branchId || "WAREHOUSE";
    console.log("check locationId:", locationId);

    setLoading(true);
    getDashboardData(locationId)
      .then(setData)
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, [userDoc]);

  const isBranch = userDoc?.role === "branch";

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        title={isBranch ? "Tổng quan Chi nhánh" : "Tổng quan Kho hàng"}
        subtitle={
          <>
            Trạng thái hệ thống:{" "}
            <span className="text-green-600 font-semibold">Đang hoạt động</span>
          </>
        }
      />

      <StatSummaryRow
        stats={data?.stats ?? null}
        loading={loading}
        role={userDoc?.role ?? "warehouse_manager"}
      />

      {!isBranch && (
        <AlertsSection alerts={data?.stockAlerts ?? null} loading={loading} />
      )}

      <RevenueChart
        data={data?.revenueByDay ?? []}
        loading={loading}
        weekOnly={isBranch}
      />

      {!isBranch && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TopSellingTable
              data={data?.topMedicines ?? []}
              loading={loading}
            />
          </div>
          <StockDynamicsPanel
            activities={data?.recentActivity ?? []}
            loading={loading}
          />
        </section>
      )}
    </main>
  );
}
