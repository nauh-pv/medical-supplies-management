import { useNavigate } from "react-router-dom";
export function ReportStatCards() {
  const navigate = useNavigate();
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
      {/* Primary gradient card — Net Profit */}
      <div className="flex-1 rounded-[1.5rem] bg-gradient-to-br from-primary to-primary-container p-7 flex flex-col justify-between min-h-[160px]">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-primary/60 mb-1">
              Lợi nhuận ròng
            </p>
            <h4 className="text-3xl font-headline font-black text-on-primary">
              940M
            </h4>
            <span className="text-on-primary/70 text-xs mt-1 block">
              VNĐ tháng này
            </span>
          </div>
          <span className="material-symbols-outlined text-on-primary/80 text-3xl">
            show_chart
          </span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-bold text-on-primary/60 mb-1">
            <span>Mục tiêu hàng tháng</span>
            <span>78%</span>
          </div>
          <div className="h-1.5 bg-on-primary/20 rounded-full">
            <div
              className="h-full bg-on-primary rounded-full"
              style={{ width: "78%" }}
            />
          </div>
        </div>
        <button
          onClick={() => navigate("/settlement")}
          className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-on-primary/15 hover:bg-on-primary/25 transition-colors px-4 py-2 text-xs font-label font-bold text-on-primary"
        >
          <span className="material-symbols-outlined text-sm">task_alt</span>
          Quyết toán
        </button>
      </div>

      {/* White card — New orders */}
      <div className="flex-1 rounded-[1.5rem] bg-surface-container-lowest p-7 flex flex-col justify-between min-h-[140px] shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              Đơn hàng mới
            </p>
            <h4 className="text-3xl font-headline font-black text-on-surface">
              1.248
            </h4>
            <span className="text-on-surface-variant text-xs mt-1 block">
              đơn trong tháng
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">
            receipt_long
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            +8.2%
          </span>
          <span className="text-xs text-on-surface-variant">
            so với kỳ trước
          </span>
        </div>
      </div>
    </div>
  );
}
