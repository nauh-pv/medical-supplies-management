import { useState } from "react";
import { PageHeader, Button, TabBar } from "@/components/common";
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
    <main className="md:ml-72 pt-24 px-4 md:px-8 pb-12 space-y-8 min-h-screen bg-background">
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

      <TabBar
        tabs={TABS}
        activeTab={tab}
        onTabChange={(id) => setTab(id as TabId)}
        variant="pill"
      />

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
