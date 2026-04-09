import { Input } from "@/components/common";

export function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 flex items-center justify-between px-8 z-30 ml-72 w-[calc(100%-18rem)] h-16 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center flex-1 max-w-xl">
        <Input
          leadingIcon="search"
          placeholder="Tìm kiếm kho dược, SKU, hoặc đơn hàng..."
          aria-label="Tìm kiếm"
          className="rounded-full"
        />
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
            <p className="text-xs font-bold text-on-surface">Quản trị viên</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
              Trưởng kho tổng
            </p>
          </div>
          <img
            alt="Administrator Profile"
            className="w-10 h-10 rounded-[9999px] object-cover border-2 border-primary-container"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBb3vtFugWbKFXae9TAAu-HGxniX-h-Kjg1OTIG6TxDCyCkPu1GZNakFb-hku4Y4bG0W1AW_RMVKCsjqfUom-gJ3Ne-bTjvnR3FyL2Hx7gjeikhLOkBbYR08TLITcY2SFmjTCCq3dBv3FwVMXOhD1T4sBBHReaUhxfZ87ABifzzmHUJOAmZqvwPSZL8GGaDxkCBNAvGC9YrG3UQ8MpdjnfY-tQoWEfoLegiC5Z4egIZi0roK3036X20zubHc6sboPGfh8TIVjXd8FQ"
          />
        </div>
      </div>
    </header>
  );
}
