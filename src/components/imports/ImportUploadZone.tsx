/** Upload zone + monthly summary card for the Imports page left column. */
export function ImportUploadZone() {
  return (
    <div className="space-y-6">
      {/* Upload card */}
      <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.04)] relative overflow-hidden group">
        <div className="absolute bottom-0 left-0 w-full h-24 opacity-5 pointer-events-none bg-gradient-to-t from-primary to-transparent" />
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary">
            cloud_upload
          </span>
          Tải lên dữ liệu
        </h3>
        <div className="border-2 border-dashed border-outline-variant/50 rounded-[1.5rem] p-10 flex flex-col items-center justify-center text-center group-hover:border-primary/50 transition-colors cursor-pointer bg-surface-container-low/30">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined text-3xl">
              description
            </span>
          </div>
          <p className="text-sm font-semibold text-on-surface">
            Kéo thả file Excel vào đây
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Hoặc click để chọn file từ máy tính
          </p>
          <p className="text-[10px] uppercase tracking-wider font-bold text-primary mt-6">
            Hỗ trợ .XLSX, .CSV
          </p>
        </div>
      </div>

      {/* Stats summary card */}
      <div className="bg-primary text-on-primary p-8 rounded-[1.5rem] shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
          Tổng nhập kho tháng này
        </p>
        <p className="text-4xl font-black mb-4">
          1,284 <span className="text-lg font-normal opacity-80">SKUs</span>
        </p>
        <div className="flex items-center gap-2 text-xs font-medium bg-white/20 w-fit px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          +12.5% so với tháng trước
        </div>
      </div>
    </div>
  );
}
