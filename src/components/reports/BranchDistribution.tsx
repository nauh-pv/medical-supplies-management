const BRANCHES = [
  {
    name: "Chi nhánh Trung tâm",
    percent: 34,
    revenue: "965M",
    color: "bg-primary",
  },
  {
    name: "Chi nhánh Quận 7",
    percent: 22,
    revenue: "625M",
    color: "bg-primary-container",
  },
  {
    name: "Chi nhánh Bình Thạnh",
    percent: 18,
    revenue: "511M",
    color: "bg-secondary-container",
  },
  {
    name: "Chi nhánh Gò Vấp",
    percent: 15,
    revenue: "426M",
    color: "bg-tertiary-container",
  },
  {
    name: "Chi nhánh Thủ Đức",
    percent: 11,
    revenue: "313M",
    color: "bg-surface-container",
  },
];

export function BranchDistribution() {
  return (
    <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-[1.5rem] p-4 sm:p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)] flex flex-col">
      <div className="mb-6">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Phân phối doanh thu
        </p>
        <h4 className="text-xl font-headline font-bold text-on-surface">
          Theo chi nhánh
        </h4>
      </div>

      <div className="space-y-4 flex-1">
        {BRANCHES.map((b) => (
          <div key={b.name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-label text-on-surface">
                {b.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">
                  {b.revenue}
                </span>
                <span className="text-xs font-label font-bold text-on-surface">
                  {b.percent}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-surface-container-low rounded-full">
              <div
                className={["h-full rounded-full transition-all", b.color].join(
                  " ",
                )}
                style={{ width: `${b.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 flex items-start gap-2 bg-surface-container-low p-3 rounded-xl">
        <span className="material-symbols-outlined text-on-surface-variant text-sm leading-none mt-0.5 flex-shrink-0">
          info
        </span>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Dữ liệu được cập nhật theo thời gian thực từ hệ thống quản lý bán hàng
          của từng chi nhánh.
        </p>
      </div>
    </div>
  );
}
