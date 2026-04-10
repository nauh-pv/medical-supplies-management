import { useState } from "react";

type ChartPeriod = "week" | "month" | "quarter" | "year";

const chartData = [
  { day: "THỨ 2", height: 120, value: "$12,450" },
  { day: "THỨ 3", height: 140, value: "$15,200" },
  { day: "THỨ 4", height: 110, value: "$11,800" },
  { day: "THỨ 5", height: 170, value: "$18,900" },
  { day: "THỨ 6", height: 200, value: "$22,400", highlight: true },
  { day: "THỨ 7", height: 150, value: "$16,500" },
  { day: "CN", height: 90, value: "$9,800" },
];

const periodLabels: Record<ChartPeriod, string> = {
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

/** Revenue trend bar chart — single bars, POS legend, hover tooltips. */
export function RevenueChart() {
  const [period, setPeriod] = useState<ChartPeriod>("week");

  return (
    <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h4 className="font-headline font-bold text-xl text-on-surface">
            Xu hướng Doanh thu
          </h4>
          <p className="text-sm text-on-surface-variant">
            Hiệu suất 7 ngày qua: Bán lẻ POS
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-xl mr-4">
          {(["week", "month", "quarter", "year"] as ChartPeriod[]).map((p) => (
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
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg text-xs font-bold text-primary cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          Bán lẻ POS
        </div>
      </div>

      {/* Bars */}
      <div className="h-64 flex items-end justify-between gap-8 px-8">
        {chartData.map((bar) => (
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
        ))}
      </div>
    </section>
  );
}
