import { useState } from "react";
import { Badge, Button, TabBar } from "@/components/common";

const TABS = [
  { id: "expiry", label: "Thuốc sắp hết hạn" },
  { id: "low-stock", label: "Tồn kho thấp" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const EXPIRY_ITEMS = [
  {
    id: "EX001",
    name: "Amoxicillin Capsules 500mg",
    lot: "AMX-2024-087",
    expiry: "2025-01-15",
    daysLeft: 22,
    stock: 180,
    location: "Khu A - Giá 3",
  },
  {
    id: "EX002",
    name: "Insulin Glargine 100IU/ml",
    lot: "INS-2024-041",
    expiry: "2025-01-28",
    daysLeft: 35,
    stock: 56,
    location: "Tủ lạnh - Ngăn 2",
  },
  {
    id: "EX003",
    name: "Cefuroxime 500mg Tablets",
    lot: "CEF-2023-195",
    expiry: "2025-02-10",
    daysLeft: 48,
    stock: 94,
    location: "Khu B - Giá 1",
  },
  {
    id: "EX004",
    name: "Methotrexate 2.5mg",
    lot: "MTX-2024-012",
    expiry: "2024-12-30",
    daysLeft: 6,
    stock: 30,
    location: "Tủ kiểm soát - Ngăn 4",
  },
  {
    id: "EX005",
    name: "Dexamethasone Injection 4mg",
    lot: "DEX-2024-068",
    expiry: "2025-03-05",
    daysLeft: 71,
    stock: 120,
    location: "Khu A - Giá 7",
  },
];

const BRANCHES = [
  "Tất cả chi nhánh",
  "Chi nhánh Trung tâm",
  "Chi nhánh Quận 7",
  "Chi nhánh Bình Thạnh",
];
const CATEGORIES = [
  "Tất cả danh mục",
  "Kháng sinh",
  "Nội tiết",
  "Tim mạch",
  "Vật tư y tế",
];

function daysLeftBadge(days: number) {
  if (days <= 14) return { variant: "error" as const, pulse: true };
  if (days <= 30) return { variant: "warning" as const, pulse: true };
  return { variant: "info" as const, pulse: false };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ExpiryTable() {
  const [tab, setTab] = useState<TabId>("expiry");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
      {/* Tab + filters header */}
      <div className="px-8 pt-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <TabBar
            tabs={TABS}
            activeTab={tab}
            onTabChange={(id) => setTab(id as TabId)}
            variant="pill"
          />

          {/* Filters */}
          <div className="flex gap-3">
            <select
              className="bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {BRANCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <select
              className="bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-low">
            {[
              "Tên thuốc",
              "Số lô",
              "Ngày hết hạn",
              "Còn lại",
              "Tồn kho",
              "Vị trí",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-8 py-3 text-left text-[10px] font-label font-bold uppercase tracking-[0.08em] text-on-surface-variant first:pl-8 last:pr-8"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {EXPIRY_ITEMS.map((item, idx) => {
            const badge = daysLeftBadge(item.daysLeft);
            return (
              <tr
                key={item.id}
                className={[
                  "group transition-colors hover:bg-surface-bright",
                  idx % 2 === 0
                    ? "bg-surface-container-lowest"
                    : "bg-surface-container-low/30",
                ].join(" ")}
              >
                <td className="px-8 py-4">
                  <p className="text-sm font-label font-semibold text-on-surface">
                    {item.name}
                  </p>
                </td>
                <td className="px-8 py-4">
                  <span className="text-xs font-mono text-on-surface-variant">
                    {item.lot}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-sm text-on-surface">
                    {formatDate(item.expiry)}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    {badge.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span
                          className={[
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            badge.variant === "error"
                              ? "bg-error"
                              : "bg-warning",
                          ].join(" ")}
                        />
                        <span
                          className={[
                            "relative inline-flex rounded-full h-2 w-2",
                            badge.variant === "error"
                              ? "bg-error"
                              : "bg-warning",
                          ].join(" ")}
                        />
                      </span>
                    )}
                    <Badge variant={badge.variant}>{item.daysLeft} ngày</Badge>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-sm text-on-surface">{item.stock}</span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-xs text-on-surface-variant">
                    {item.location}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <Button variant="ghost" icon="send" size="sm">
                    Điều phối
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
