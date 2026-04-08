export function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 flex items-center justify-between px-8 z-30 ml-72 w-[calc(100%-18rem)] h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Tìm kiếm kho dược, SKU, hoặc đơn hàng..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 relative opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-slate-600">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-[9999px]"></span>
          </button>
          <button className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-slate-600">
              history
            </span>
          </button>
          <button className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-slate-600">
              chat_bubble
            </span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

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
