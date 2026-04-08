import { useState } from "react";

const navItems = [
  { icon: "dashboard", label: "Tổng quan", id: "dashboard" },
  { icon: "inventory_2", label: "Kho hàng", id: "inventory" },
  { icon: "local_shipping", label: "Vận chuyển", id: "shipping" },
  { icon: "conveyor_belt", label: "Nhà cung cấp", id: "suppliers" },
  { icon: "analytics", label: "Báo cáo", id: "reports" },
  { icon: "settings", label: "Cài đặt", id: "settings" },
];

export function Sidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="fixed left-0 top-0 flex flex-col z-40 bg-slate-50 dark:bg-slate-900 h-screen w-72 flex-shrink-0">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-500 font-headline">
          MedPrecision
        </h1>
        <p className="text-xs font-label uppercase tracking-widest text-slate-400 mt-1">
          Kho hàng v2.4
        </p>
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
                setActive(item.id);
              }}
              className={
                isActive
                  ? "flex items-center gap-3 text-blue-700 dark:text-blue-400 font-bold border-l-4 border-blue-600 pl-4 py-3 bg-white/50 dark:bg-white/5"
                  : "flex items-center gap-3 text-slate-500 dark:text-slate-400 pl-5 py-3 hover:text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="px-6 py-4 mt-auto border-t border-slate-100 dark:border-slate-800">
        <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-lg">add</span>
          Đơn hàng mới
        </button>
        <div className="mt-6 space-y-2 pb-6">
          <a
            href="#"
            className="flex items-center gap-3 text-slate-500 pl-2 py-2 hover:text-blue-600"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span className="text-sm">Trung tâm hỗ trợ</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 text-slate-500 pl-2 py-2 hover:text-blue-600"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Đăng xuất</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
