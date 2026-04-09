import { Button, SectionLabel } from "@/components/common";

export type NavId =
  | "dashboard"
  | "inventory"
  | "shipping"
  | "suppliers"
  | "reports"
  | "settings";

const navItems: { icon: string; label: string; id: NavId }[] = [
  { icon: "dashboard", label: "Tổng quan", id: "dashboard" },
  { icon: "inventory_2", label: "Kho hàng", id: "inventory" },
  { icon: "local_shipping", label: "Vận chuyển", id: "shipping" },
  { icon: "conveyor_belt", label: "Nhà cung cấp", id: "suppliers" },
  { icon: "analytics", label: "Báo cáo", id: "reports" },
  { icon: "settings", label: "Cài đặt", id: "settings" },
];

interface SidebarProps {
  active: NavId;
  onNavigate: (id: NavId) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 flex flex-col z-40 bg-slate-50 dark:bg-slate-900 h-screen w-72 flex-shrink-0">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
          MedPrecision
        </h1>
        <SectionLabel className="mt-1">Kho hàng v2.4</SectionLabel>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              className={
                isActive
                  ? "flex items-center gap-3 text-primary font-bold border-l-2 border-primary pl-4 py-3 bg-primary/5"
                  : "flex items-center gap-3 text-on-surface-variant pl-5 py-3 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="px-6 py-4 mt-auto">
        <Button icon="add" className="w-full justify-center">
          Đơn hàng mới
        </Button>
        <div className="mt-6 space-y-2 pb-6">
          <a
            href="#"
            className="flex items-center gap-3 text-on-surface-variant pl-2 py-2 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span className="text-sm">Trung tâm hỗ trợ</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 text-on-surface-variant pl-2 py-2 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Đăng xuất</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
