import { useState } from "react";
import type { DailyRevenue } from "@/services/dashboard";

type ChartPeriod = "week" | "month" | "quarter" | "year";

const periodLabels: Record<ChartPeriod, string> = {
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

interface RevenueChartProps {
  data: DailyRevenue[];
  loading: boolean;
  weekOnly?: boolean;
}

/** Revenue trend bar chart — real 7-day POS data. */
export function RevenueChart({ data, loading, weekOnly }: RevenueChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("week");

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const scaledBars = data.map((d) => ({
    day: d.day,
    height: Math.max(8, Math.round((d.revenue / maxRevenue) * 200)),
    value: `${d.revenue.toLocaleString("vi-VN")}₫`,
    highlight: d.highlight,
  }));

  return (
    <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h4 className="font-headline font-bold text-xl text-on-surface">
            Xu hướng Doanh thu
          </h4>
          <p className="text-sm text-on-surface-variant">
            Hiệu suất 7 ngày qua: Bán lẻ
          </p>
        </div>

        {/* Period toggle */}
        {!weekOnly && (
          <div className="flex bg-surface-container-low p-1 rounded-xl mr-4">
            {(["week", "month", "quarter", "year"] as ChartPeriod[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={[
                    "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    period === p
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary",
                  ].join(" ")}
                >
                  {periodLabels[p]}
                </button>
              ),
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg text-xs font-bold text-primary">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          Bán lẻ
        </div>
      </div>

      {/* Bars */}
      <div className="h-64 flex items-end justify-between gap-8 px-8">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm gap-2">
            <span className="material-symbols-outlined animate-spin text-primary">
              progress_activity
            </span>
            Đang tải...
          </div>
        ) : scaledBars.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
            Không có dữ liệu
          </div>
        ) : (
          scaledBars.map((bar) => (
            <div
              key={bar.day}
              className="flex-1 flex flex-col items-center gap-2 relative group"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {bar.value}
              </div>
              <div
                className="w-full bg-secondary-container rounded-t-lg transition-all hover:brightness-90 cursor-help"
                style={{ height: `${bar.height}px` }}
              />
              <span
                className={[
                  "text-[10px] font-bold",
                  bar.highlight ? "text-primary" : "text-on-surface-variant",
                ].join(" ")}
              >
                {bar.day}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
