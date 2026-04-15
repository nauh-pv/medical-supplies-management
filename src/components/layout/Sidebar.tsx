import { Link, useLocation } from "react-router-dom";
import type { UserRole } from "@/types/firestore";

export type NavId =
  | "dashboard"
  | "inventory"
  | "reports"
  | "alerts"
  | "pos"
  | "medication"
  | "branches"
  | "imports"
  | "settings";

const NAV_PATH: Record<NavId, string> = {
  dashboard: "/",
  inventory: "/inventory",
  reports: "/sales-transactions",
  alerts: "/alerts",
  pos: "/pos",
  medication: "/dispatches",
  branches: "/branches",
  imports: "/imports",
  settings: "/settings",
};

const navItems: { icon: string; label: string; id: NavId }[] = [
  { icon: "dashboard", label: "Tổng quan", id: "dashboard" },
  { icon: "inventory_2", label: "Kho hàng", id: "inventory" },
  { icon: "analytics", label: "Báo cáo", id: "reports" },
  // { icon: "warning", label: "Cảnh báo hàng hóa", id: "alerts" },
  { icon: "point_of_sale", label: "Bán hàng", id: "pos" },
  { icon: "medication", label: "Quản lý xuất kho", id: "medication" },
  { icon: "account_tree", label: "Chi nhánh", id: "branches" },
  { icon: "input", label: "Yêu cầu nhập thuốc", id: "imports" },
  { icon: "settings", label: "Cài đặt", id: "settings" },
];

const BRANCH_NAV_IDS: NavId[] = ["dashboard", "pos"];

// Nav items that are ONLY for branch users (hidden from warehouse_manager)
const BRANCH_ONLY_IDS: NavId[] = ["imports"];

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

export function Sidebar({ role, onLogout }: SidebarProps) {
  const { pathname } = useLocation();

  const visibleItems = navItems.filter((item) =>
    role === "branch"
      ? BRANCH_NAV_IDS.includes(item.id)
      : !BRANCH_ONLY_IDS.includes(item.id),
  );

  function isActive(id: NavId) {
    const path = NAV_PATH[id];
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  return (
    <aside className="fixed left-0 top-0 flex flex-col z-40 bg-surface-container-low h-screen w-72 flex-shrink-0 border-r border-outline-variant/20">
      <div className="px-6 py-8 mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          MediStock
        </h1>
        <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mt-1">
          Hệ thống quản lý tổng kho
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {visibleItems.map((item) => {
          const active = isActive(item.id);
          return (
            <Link
              key={item.id}
              to={NAV_PATH[item.id]}
              className={
                active
                  ? "flex items-center gap-3 text-primary font-bold border-l-4 border-primary pl-4 py-3 bg-primary/5 transition-all"
                  : "flex items-center gap-3 text-on-surface-variant pl-5 py-3 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
              }
            >
              <span
                className="material-symbols-outlined"
                style={
                  active ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto border-t border-outline-variant/20 pt-4 pb-6 space-y-1">
        <a
          href="#"
          className="flex items-center gap-3 text-on-surface-variant pl-5 py-3 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
        >
          <span className="material-symbols-outlined">support_agent</span>
          <span className="text-sm font-medium">Hỗ trợ kỹ thuật</span>
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onLogout();
          }}
          className="flex items-center gap-3 text-on-surface-variant pl-5 py-3 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Đăng xuất</span>
        </a>
      </div>
    </aside>
  );
}
