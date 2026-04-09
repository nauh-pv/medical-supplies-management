import { useState } from "react";

type ChartPeriod = "week" | "month" | "quarter" | "year";

const chartData = [
  { day: "THỨ 2", primary: 120, secondary: 60 },
  { day: "THỨ 3", primary: 140, secondary: 80 },
  { day: "THỨ 4", primary: 180, secondary: 40 },
  { day: "THỨ 5", primary: 110, secondary: 90 },
  { day: "THỨ 6", primary: 200, secondary: 70, highlight: true },
  { day: "THỨ 7", primary: 160, secondary: 50 },
  { day: "CN", primary: 90, secondary: 30 },
];

const periodLabels: Record<ChartPeriod, string> = {
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

/** Revenue trend bar chart with period toggle. */
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
            Hiệu suất 7 ngày qua trên tất cả các kênh
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-xl">
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
        <div className="flex gap-2">
          {[
            { color: "bg-primary", label: "Phân phối" },
            { color: "bg-secondary", label: "Bán lẻ POS" },
          ].map(({ color, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-medium"
            >
              <div className={["w-2 h-2 rounded-full", color].join(" ")} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="h-64 flex items-end justify-between gap-4 px-4">
        {chartData.map((bar) => (
          <div
            key={bar.day}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full flex items-end gap-1">
              <div
                className="flex-1 bg-primary-container rounded-t-lg transition-all hover:brightness-110"
                style={{ height: `${bar.primary}px` }}
              />
              <div
                className="flex-1 bg-secondary-container rounded-t-lg transition-all hover:brightness-110"
                style={{ height: `${bar.secondary}px` }}
              />
            </div>
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
