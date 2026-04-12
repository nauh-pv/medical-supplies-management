import type { UserDoc } from "@/types/firestore";

interface BranchStatCardsProps {
  branches: UserDoc[];
  loading: boolean;
}

export function BranchStatCards({ branches, loading }: BranchStatCardsProps) {
  const total = branches.length;
  const active = branches.filter((b) => b.status === "active").length;
  const paused = total - active;

  const STATS = [
    {
      label: "Tổng số chi nhánh",
      value: loading ? "—" : String(total),
      suffix: "cơ sở",
      valueColor: "text-on-surface",
      bottomIcon: "analytics",
      bottomIconColor: "text-primary",
      bottomText: "Toàn hệ thống",
      bottomTextColor: "text-primary",
    },
    {
      label: "Đang hoạt động",
      value: loading ? "—" : String(active),
      suffix: "đang mở cửa",
      valueColor: "text-emerald-600",
      bottomIcon: "check_circle",
      bottomIconColor: "text-emerald-600",
      bottomText:
        total > 0 ? `${Math.round((active / total) * 100)}% hiệu suất` : "—",
      bottomTextColor: "text-emerald-600",
    },
    {
      label: "Tạm dừng",
      value: loading ? "—" : String(paused),
      suffix: "chi nhánh",
      valueColor: "text-on-surface-variant",
      bottomIcon: "pause_circle",
      bottomIconColor: "text-on-surface-variant",
      bottomText: paused > 0 ? "Cần kiểm tra" : "Không có",
      bottomTextColor: "text-on-surface-variant",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="bg-surface-container-lowest p-6 rounded-full shadow-sm relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
          <div className="flex flex-col relative z-10">
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
              {s.label}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-4xl font-headline font-extrabold ${s.valueColor}`}
              >
                {s.value}
              </span>
              <span className="text-xs text-on-surface-variant">
                {s.suffix}
              </span>
            </div>
          </div>
          <div
            className={`mt-4 flex items-center gap-1 ${s.bottomTextColor} relative z-10`}
          >
            <span
              className={`material-symbols-outlined text-xs ${s.bottomIconColor}`}
            >
              {s.bottomIcon}
            </span>
            <span className="text-[10px] font-bold">{s.bottomText}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
