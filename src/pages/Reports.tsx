import { useState } from "react";
import { PageHeader, Button } from "@/components/common";
import { RevenueChartPanel } from "@/components/reports/RevenueChartPanel";
import { ReportStatCards } from "@/components/reports/ReportStatCards";
import { BestSellersPanel } from "@/components/reports/BestSellersPanel";
import { BranchDistribution } from "@/components/reports/BranchDistribution";

const TABS = [
  { id: "revenue", label: "Doanh thu & Lợi nhuận" },
  { id: "import", label: "Báo cáo Nhập" },
  { id: "dynamics", label: "Biến động" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Reports() {
  const [tab, setTab] = useState<TabId>("revenue");

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Phân tích
          </span>
        }
        title="Hệ thống Báo cáo & Thống kê"
        titleSize="text-4xl"
        actions={
          <>
            <Button variant="ghost" icon="calendar_month">
              Tháng 10, 2024
            </Button>
            <Button icon="file_download">Xuất báo cáo</Button>
          </>
        }
      />

      {/* Tab nav */}
      <div className="flex items-center gap-1 bg-surface-container-lowest rounded-xl p-1 w-fit shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "px-5 py-2 rounded-lg text-sm font-label font-semibold transition-all",
              tab === t.id
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bento row 1: Chart + Stat cards */}
      <div className="grid grid-cols-12 gap-6">
        <RevenueChartPanel />
        <ReportStatCards />
      </div>

      {/* Bento row 2: Best sellers + Branch distribution */}
      <div className="grid grid-cols-12 gap-6">
        <BestSellersPanel />
        <BranchDistribution />
      </div>
    </main>
  );
}
