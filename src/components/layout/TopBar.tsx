import { Input } from "@/components/common";
import type { UserDoc } from "@/types/firestore";

const ROLE_LABEL: Record<string, string> = {
  warehouse_manager: "Quản lý kho tổng",
  branch: "Nhân viên chi nhánh",
};

interface TopBarProps {
  userDoc?: UserDoc | null;
}

export function TopBar({ userDoc }: TopBarProps) {
  const displayName = userDoc?.displayName ?? "Người dùng";
  const roleLabel = userDoc ? (ROLE_LABEL[userDoc.role] ?? userDoc.role) : "—";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
  return (
    <header className="fixed top-0 right-0 left-0 flex items-center justify-between px-8 z-30 ml-72 w-[calc(100%-18rem)] h-16 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center flex-1 w-full">
        {/* <Input
          leadingIcon="search"
          placeholder="Tìm kiếm kho dược, SKU, hoặc đơn hàng..."
          aria-label="Tìm kiếm"
          className="rounded-full"
        /> */}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="hover:bg-surface-container rounded-full p-2 relative opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="hover:bg-surface-container rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-on-surface-variant">
              history
            </span>
          </button>
          <button className="hover:bg-surface-container rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-on-surface-variant">
              chat_bubble
            </span>
          </button>
        </div>

        <div className="h-8 w-px bg-surface-container-high"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
              {roleLabel}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary-container text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
