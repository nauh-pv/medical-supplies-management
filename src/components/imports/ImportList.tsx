import { useState } from "react";
import { Badge, Pagination } from "@/components/common";
import { ImportDetailModal } from "@/components/inventory/ImportDetailModal";

type ImportStatus = "received" | "pending" | "shipping" | "approved";

interface ImportRow {
  id: string;
  type: "warehouse" | "branch";
  date: string;
  status: ImportStatus;
  total: string;
}

const mockImports: ImportRow[] = [
  {
    id: "WH-REQ-8821",
    type: "warehouse",
    date: "12/10/2023 14:30",
    status: "shipping",
    total: "14.200.000\u0111",
  },
  {
    id: "BR-REQ-4490",
    type: "branch",
    date: "11/10/2023 09:15",
    status: "pending",
    total: "5.800.000\u0111",
  },
  {
    id: "WH-REQ-8815",
    type: "warehouse",
    date: "10/10/2023 16:45",
    status: "received",
    total: "28.500.000\u0111",
  },
  {
    id: "WH-REQ-8812",
    type: "warehouse",
    date: "10/10/2023 08:20",
    status: "shipping",
    total: "42.000.000\u0111",
  },
];

const statusConfig: Record<
  ImportStatus,
  { label: string; variant: "info" | "warning" | "neutral" | "success" }
> = {
  shipping: { label: "\u0110ang v\u1eadn chuy\u1ec3n", variant: "warning" },
  pending: { label: "Ch\u1edd duy\u1ec7t", variant: "info" },
  received: { label: "\u0110\u00e3 nh\u1eadn", variant: "neutral" },
  approved: { label: "\u0110\u00e3 duy\u1ec7t", variant: "success" },
};

const stats = [
  {
    label: "T\u1ed5ng l\u1ec7nh",
    value: "124",
    icon: "package_2",
    iconColor: "text-primary",
    sub: "+12% th\u00e1ng n\u00e0y",
    subColor: "text-green-600",
  },
  {
    label: "\u0110ang v\u1eadn chuy\u1ec3n",
    value: "08",
    icon: "local_shipping",
    iconColor: "text-tertiary",
    sub: "D\u1ef1 ki\u1ebfn \u0111\u1ebfn trong h\u00f4m nay",
    subColor: "text-on-surface-variant",
  },
  {
    label: "Ch\u1edd duy\u1ec7t",
    value: "15",
    icon: "hourglass_empty",
    iconColor: "text-secondary",
    sub: "Y\u00eau c\u1ea7u t\u1eeb chi nh\u00e1nh",
    subColor: "text-on-surface-variant",
  },
  {
    label: "\u0110\u00e3 nh\u1eadn",
    value: "101",
    icon: "task_alt",
    iconColor: "text-green-600",
    sub: "Ho\u00e0n th\u00e0nh trong qu\u00fd",
    subColor: "text-on-surface-variant",
  },
];

export function ImportList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)]"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`material-symbols-outlined text-2xl ${s.iconColor}`}
              >
                {s.icon}
              </span>
            </div>
            <p className="text-3xl font-headline font-bold text-on-surface mb-1">
              {s.value}
            </p>
            <p className="text-xs font-label text-on-surface-variant mb-2">
              {s.label}
            </p>
            <p className={`text-xs font-label ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
        <div className="px-8 py-5 flex items-center gap-4 border-b border-outline-variant/10">
          <select className="h-9 rounded-xl px-3 text-sm font-label bg-surface-container-low text-on-surface-variant focus:outline-none">
            <option>T\u1ea5t c\u1ea3 tr\u1ea1ng th\u00e1i</option>
            <option>\u0110ang v\u1eadn chuy\u1ec3n</option>
            <option>Ch\u1edd duy\u1ec7t</option>
            <option>\u0110\u00e3 nh\u1eadn</option>
            <option>\u0110\u00e3 duy\u1ec7t</option>
          </select>
          <select className="h-9 rounded-xl px-3 text-sm font-label bg-surface-container-low text-on-surface-variant focus:outline-none">
            <option>T\u1ea5t c\u1ea3 lo\u1ea1i</option>
            <option>Kho t\u1ed5ng</option>
            <option>Chi nh\u00e1nh</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/30">
              <th className="px-8 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                M\u00e3 \u0111\u01a1n
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                Lo\u1ea1i
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                Ng\u00e0y t\u1ea1o
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                Tr\u1ea1ng th\u00e1i
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                T\u1ed5ng gi\u00e1 tr\u1ecb
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                H\u00e0nh \u0111\u1ed9ng
              </th>
            </tr>
          </thead>
          <tbody>
            {mockImports.map((row, i) => (
              <tr
                key={row.id}
                className={`group ${i % 2 === 0 ? "bg-white" : "bg-surface-container-lowest/30"} hover:bg-primary/5 transition-colors`}
              >
                <td className="px-8 py-4 text-sm font-label font-semibold text-primary">
                  {row.id}
                </td>
                <td className="px-4 py-4 text-sm font-label text-on-surface-variant">
                  {row.type === "warehouse"
                    ? "Kho t\u1ed5ng"
                    : "Chi nh\u00e1nh"}
                </td>
                <td className="px-4 py-4 text-sm font-label text-on-surface-variant">
                  {row.date}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={statusConfig[row.status].variant}>
                    {statusConfig[row.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm font-label font-semibold text-on-surface">
                  {row.total}
                </td>
                <td className="px-4 py-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedId(row.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-label font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                  >
                    Xem chi ti\u1ebft
                  </button>
                  {row.status === "shipping" && (
                    <button className="px-3 py-1.5 rounded-lg text-xs font-label font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
                      \u0110\u00e3 nh\u1eadn
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-8 py-5 border-t border-outline-variant/10 bg-surface-container-low/20 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">
            Hi\u1ec3n th\u1ecb{" "}
            <span className="font-bold text-on-surface">
              {(page - 1) * 4 + 1}&ndash;{Math.min(page * 4, 124)}
            </span>{" "}
            tr\u00ean 124 l\u1ec7nh nh\u1eadp h\u00e0ng
          </p>
          <Pagination
            currentPage={page}
            totalPages={31}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ImportDetailModal
        open={!!selectedId}
        importId={selectedId ?? ""}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
