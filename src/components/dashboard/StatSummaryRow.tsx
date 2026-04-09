import { StatCard } from "@/components/common";

/** The 4 KPI stat cards at the top of the Dashboard. */
export function StatSummaryRow() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        label="Tổng doanh thu"
        value="$1.2M"
        trend="+12.5%"
        trendUp
        icon="payments"
        progress={75}
      />

      <StatCard
        label="Lợi nhuận ròng"
        value="$428K"
        trend="+4.2%"
        trendUp
        progress={40}
        progressVariant="secondary"
      />

      <StatCard label="Chi nhánh hoạt động" value="14">
        {/* Branch avatar dots */}
        <div className="mt-4 flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary-container border-2 border-white" />
          <div className="w-6 h-6 rounded-full bg-secondary-container border-2 border-white" />
          <div className="w-6 h-6 rounded-full bg-tertiary-fixed border-2 border-white" />
          <div className="w-6 h-6 rounded-full bg-surface-container border-2 border-white flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
            +11
          </div>
        </div>
      </StatCard>

      <StatCard
        label="Tổng mã hàng (SKU)"
        value="28.4K"
        trend="-2.1%"
        trendUp={false}
        progress={25}
        progressVariant="error"
      />
    </section>
  );
}
