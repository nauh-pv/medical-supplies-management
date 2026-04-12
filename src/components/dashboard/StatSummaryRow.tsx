import { StatCard } from "@/components/common";
import type { DashboardStats } from "@/services/dashboard";

function fmt(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}T₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M₫`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K₫`;
  return `${value.toLocaleString("vi-VN")}₫`;
}

interface StatSummaryRowProps {
  stats: DashboardStats | null;
  loading: boolean;
  role?: "warehouse_manager" | "branch";
}

/** The 4 KPI stat cards at the top of the Dashboard. */
export function StatSummaryRow({ stats, loading, role = "warehouse_manager" }: StatSummaryRowProps) {
  const isBranch = role === "branch";
  const revenue = stats?.totalRevenueThisMonth ?? 0;
  const branches = stats?.activeBranches ?? 0;
  const skus = stats?.totalSkus ?? 0;

  return (
    <section className={`grid grid-cols-1 gap-6 ${isBranch ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
      <StatCard
        label="Doanh thu tháng này"
        value={loading ? "—" : fmt(revenue)}
        icon="payments"
        progress={Math.min(100, Math.round((revenue / 100_000_000) * 100))}
      />

      <StatCard
        label="Lợi nhuận ước tính"
        value={loading ? "—" : fmt(revenue * 0.3)}
        progress={40}
        progressVariant="secondary"
      />

      {!isBranch && (
        <StatCard
          label="Chi nhánh hoạt động"
          value={loading ? "—" : String(branches)}
        >
          <div className="mt-4 flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary-container border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-secondary-container border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-tertiary-fixed border-2 border-white" />
            {branches > 3 && (
              <div className="w-6 h-6 rounded-full bg-surface-container border-2 border-white flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
                +{branches - 3}
              </div>
            )}
          </div>
        </StatCard>
      )}

      <StatCard
        label="Tổng mã hàng (SKU)"
        value={loading ? "—" : skus.toLocaleString("vi-VN")}
        progress={Math.min(100, Math.round((skus / 500) * 100))}
        progressVariant="error"
      />
    </section>
  );
}
