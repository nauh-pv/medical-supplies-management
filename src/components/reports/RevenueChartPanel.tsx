import { useState } from "react";
import { MONTH_SHORT_LABELS } from "@/utils/dateConfig";

const REVENUE_DATA = [55, 72, 48, 80, 65, 90, 58, 76, 82, 100, 63, 70];

const PERIODS = ["Tuần", "Tháng", "Quý", "Năm"] as const;
type Period = (typeof PERIODS)[number];

interface RevenueChartPanelProps {
  year?: string;
  month?: string;
}

export function RevenueChartPanel({ year, month }: RevenueChartPanelProps) {
  const [period, setPeriod] = useState<Period>("Tháng");
  const maxVal = Math.max(...REVENUE_DATA);
  const displayLabel =
    month && year
      ? `Tháng ${month}/${year}`
      : year
        ? `Năm ${year}`
        : "Tháng này";

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[1.5rem] p-4 sm:p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Doanh thu & Lợi nhuận
          </p>
          <h4 className="text-4xl font-headline font-black text-on-surface">
            2.840.000.000
            <span className="text-lg font-medium text-on-surface-variant ml-2">
              VNĐ — {displayLabel}
            </span>
          </h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              +12.4%
            </span>
            <span className="text-xs text-on-surface-variant">
              so với kỳ trước
            </span>
          </div>
        </div>

        {/* Period toggle */}
        <div className="flex bg-surface-container-low rounded-xl p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all",
                period === p
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2 h-48">
        {MONTH_SHORT_LABELS.map((m, i) => (
          <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full flex flex-col items-center gap-0.5 justify-end"
              style={{ height: "10rem" }}
            >
              {/* Revenue bar */}
              <div
                className="w-full rounded-t-lg bg-primary-container hover:bg-primary transition-colors cursor-pointer relative group"
                style={{ height: `${(REVENUE_DATA[i] / maxVal) * 100}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[9px] py-0.5 px-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {(REVENUE_DATA[i] * 28.4).toFixed(0)}M
                </div>
              </div>
            </div>
            <span className="text-[9px] font-label font-bold text-on-surface-variant uppercase">
              {m}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-on-surface-variant">Doanh thu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary-container" />
          <span className="text-xs text-on-surface-variant">Lợi nhuận</span>
        </div>
      </div>
    </div>
  );
}
