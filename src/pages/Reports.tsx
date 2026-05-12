import { useState } from "react";
import { PageHeader, Button, TabBar, Select } from "@/components/common";
import { RevenueChartPanel } from "@/components/reports/RevenueChartPanel";
import { ReportStatCards } from "@/components/reports/ReportStatCards";
import { BestSellersPanel } from "@/components/reports/BestSellersPanel";
import { BranchDistribution } from "@/components/reports/BranchDistribution";
import {
  CURRENT_YEAR,
  CURRENT_MONTH_INDEX,
  YEAR_OPTIONS,
  MONTH_LABELS,
} from "@/utils/dateConfig";

const TABS = [
  { id: "revenue", label: "Doanh thu & Lợi nhuận" },
  { id: "import", label: "Báo cáo Nhập" },
  { id: "dynamics", label: "Biến động" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Reports() {
  const [tab, setTab] = useState<TabId>("revenue");
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [month, setMonth] = useState(String(CURRENT_MONTH_INDEX + 1));

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
            <div className="w-28">
              <Select
                variant="pill"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={String(y)}>
                    Năm {y}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-36">
              <Select
                variant="pill"
                leadingIcon="calendar_month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {MONTH_LABELS.map((label, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
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
        <RevenueChartPanel year={year} month={month} />
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
