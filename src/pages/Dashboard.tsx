import { useState } from "react";

type ChartPeriod = "week" | "month" | "quarter" | "year";

const chartData = [
  { day: "THỨ 2", primary: 120, secondary: 60 },
  { day: "THỨ 3", primary: 140, secondary: 80 },
  { day: "THỨ 4", primary: 180, secondary: 40 },
  { day: "THỨ 5", primary: 110, secondary: 90 },
  { day: "THỨ 6", primary: 200, secondary: 70, highlight: true },
  { day: "THỨ 7", primary: 160, secondary: 50 },
  { day: "CN", primary: 90, secondary: 30 },
];

const periodLabels: Record<ChartPeriod, string> = {
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

export function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      {/* ── Page Header ── */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
            Tổng quan Kho hàng
          </h2>
          <p className="text-on-surface-variant text-sm">
            Trạng thái hệ thống:{" "}
            <span className="text-green-600 font-semibold">Đang hoạt động</span>{" "}
            • Đồng bộ lần cuối: 2 phút trước
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors">
            Xuất PDF
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              file_download
            </span>
            Tải báo cáo
          </button>
        </div>
      </header>

      {/* ── Row 1: Summary Cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-surface-container-lowest p-6 rounded-full shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10">
            <span className="material-symbols-outlined text-7xl text-primary -rotate-12">
              payments
            </span>
          </div>
          <p className="text-xs font-label uppercase tracking-widest text-slate-400 mb-2">
            TỔNG DOANH THU
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-headline font-bold">$1.2M</h3>
            <span className="text-xs font-medium text-green-600">+12.5%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-[9999px] overflow-hidden">
            <div
              className="h-full bg-primary rounded-[9999px]"
              style={{ width: "75%" }}
            />
          </div>
        </div>

        {/* Profit */}
        <div className="bg-surface-container-lowest p-6 rounded-full shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden">
          <p className="text-xs font-label uppercase tracking-widest text-slate-400 mb-2">
            LỢI NHUẬN RÒNG
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-headline font-bold">$428K</h3>
            <span className="text-xs font-medium text-green-600">+4.2%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-[9999px] overflow-hidden">
            <div
              className="h-full bg-secondary rounded-[9999px]"
              style={{ width: "40%" }}
            />
          </div>
        </div>

        {/* Branches */}
        <div className="bg-surface-container-lowest p-6 rounded-full shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden">
          <p className="text-xs font-label uppercase tracking-widest text-slate-400 mb-2">
            CHI NHÁNH HOẠT ĐỘNG
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-headline font-bold">14</h3>
            <span className="text-xs font-medium text-slate-400">Ổn định</span>
          </div>
          <div className="mt-4 flex -space-x-2">
            <div className="w-6 h-6 rounded-[9999px] bg-primary-container border-2 border-white" />
            <div className="w-6 h-6 rounded-[9999px] bg-secondary-container border-2 border-white" />
            <div className="w-6 h-6 rounded-[9999px] bg-tertiary-fixed border-2 border-white" />
            <div className="w-6 h-6 rounded-[9999px] bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">
              +11
            </div>
          </div>
        </div>

        {/* SKU */}
        <div className="bg-surface-container-lowest p-6 rounded-full shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden">
          <p className="text-xs font-label uppercase tracking-widest text-slate-400 mb-2">
            TỔNG MÃ HÀNG (SKU)
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-headline font-bold">28.4K</h3>
            <span className="text-xs font-medium text-error">-2.1%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-[9999px] overflow-hidden">
            <div
              className="h-full bg-error rounded-[9999px]"
              style={{ width: "25%" }}
            />
          </div>
        </div>
      </section>

      {/* ── Row 2: Critical Alerts ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expiring Soon */}
        <div className="bg-surface-container-lowest rounded-full p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-container text-error rounded-xl">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <h4 className="font-headline font-bold text-lg">Sắp hết hạn</h4>
            </div>
            <span className="px-2 py-1 bg-error-container text-error text-[10px] font-bold rounded uppercase">
              HẠN DƯỚI 90 NGÀY
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">
                    vaccines
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Vắc-xin cúm Lô B-22</p>
                  <p className="text-xs text-slate-500">
                    SKU: INF-2201 • 450 Đơn vị
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-error">12 Ngày còn lại</p>
                <p className="text-[10px] text-slate-400">Ưu tiên xử lý: Cao</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl opacity-80">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">
                    pill
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Amoxicillin 500mg dạng uống
                  </p>
                  <p className="text-xs text-slate-500">
                    SKU: AMOX-09 • 1.2K Đơn vị
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-error">28 Ngày còn lại</p>
                <p className="text-[10px] text-slate-400">Đề xuất điều phối</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-surface-container-lowest rounded-full p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tertiary-fixed text-tertiary rounded-xl">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h4 className="font-headline font-bold text-lg">
                Cảnh báo tồn kho thấp
              </h4>
            </div>
            <span className="px-2 py-1 bg-tertiary-fixed text-tertiary text-[10px] font-bold rounded uppercase">
              DƯỚI MỨC TỐI THIỂU
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">
                    medical_services
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Găng tay phẫu thuật (Size M)
                  </p>
                  <p className="text-xs text-slate-500">
                    Hiện tại: 120 • Tối thiểu: 500
                  </p>
                </div>
              </div>
              <div className="text-right">
                <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg uppercase">
                  NHẬP THÊM
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">
                    ecg_heart
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Giấy in nhiệt ECG (Cuộn)
                  </p>
                  <p className="text-xs text-slate-500">
                    Hiện tại: 15 • Tối thiểu: 40
                  </p>
                </div>
              </div>
              <div className="text-right">
                <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg uppercase">
                  NHẬP THÊM
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Row 3: Revenue Chart ── */}
      <section className="bg-surface-container-lowest rounded-full p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h4 className="font-headline font-bold text-xl">
              Xu hướng Doanh thu
            </h4>
            <p className="text-sm text-slate-500">
              Hiệu suất 7 ngày qua trên tất cả các kênh
            </p>
          </div>
          <div className="flex bg-surface-container-low p-1 rounded-xl mr-4">
            {(["week", "month", "quarter", "year"] as ChartPeriod[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    chartPeriod === p
                      ? "bg-primary text-white shadow-sm font-bold"
                      : "text-slate-500 hover:text-primary"
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ),
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-medium cursor-pointer">
              <div className="w-2 h-2 rounded-[9999px] bg-primary" />
              Phân phối
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-medium cursor-pointer">
              <div className="w-2 h-2 rounded-[9999px] bg-secondary" />
              Bán lẻ POS
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-4 px-4">
          {chartData.map((bar) => (
            <div
              key={bar.day}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex items-end gap-1">
                <div
                  className="flex-1 bg-primary-container rounded-t-lg transition-all hover:brightness-110"
                  style={{ height: `${bar.primary}px` }}
                />
                <div
                  className="flex-1 bg-secondary-container rounded-t-lg transition-all hover:brightness-110"
                  style={{ height: `${bar.secondary}px` }}
                />
              </div>
              <span
                className={`text-[10px] font-bold ${bar.highlight ? "text-primary" : "text-slate-400"}`}
              >
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Row 4: Top Selling + Stock Dynamics ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-full p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-headline font-bold text-xl">
              Top thuốc bán chạy
            </h4>
            <button className="text-sm font-semibold text-primary">
              Theo tháng
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-dim/30 rounded-lg">
                <tr>
                  {[
                    "Hạng",
                    "Tên thuốc",
                    "Phân loại",
                    "Doanh số",
                    "Tăng trưởng",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-label uppercase tracking-widest text-slate-500 last:text-right"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-primary">
                    #1
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold">Paracetamol 500mg</p>
                    <p className="text-xs text-slate-400">SKU: PARA-500</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-[9999px] uppercase">
                      Giảm đau
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-right">
                    12,450
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-xs font-medium text-green-600 flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-xs">
                        trending_up
                      </span>{" "}
                      18%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">
                    #2
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold">Augmentin 625mg</p>
                    <p className="text-xs text-slate-400">SKU: AUG-625</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-[9999px] uppercase">
                      Kháng sinh
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-right">
                    8,200
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-xs font-medium text-green-600 flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-xs">
                        trending_up
                      </span>{" "}
                      12%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">
                    #3
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold">Nexium 40mg</p>
                    <p className="text-xs text-slate-400">SKU: NEX-40</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-[9999px] uppercase">
                      Tiêu hóa
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-right">
                    6,900
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-xs font-medium text-red-500 flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-xs">
                        trending_down
                      </span>{" "}
                      4%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Dynamics */}
        <div className="bg-surface-container-lowest rounded-full p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
          <h4 className="font-headline font-bold text-xl mb-8">
            Biến động tồn kho
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <span className="material-symbols-outlined">
                    call_received
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Insulin Glargine</p>
                  <p className="text-xs text-slate-500">Vừa nhập +500 đơn vị</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                VỪA XONG
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <span className="material-symbols-outlined">sync</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Vitamin C 1000mg</p>
                  <p className="text-xs text-slate-500">
                    Tỉ lệ xoay vòng cao: 4.5x
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary">HOT</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <span className="material-symbols-outlined">call_made</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Cồn Y tế 70 độ</p>
                  <p className="text-xs text-slate-500">
                    Xuất kho lớn: -1.2K chai
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                1 GIỜ TRƯỚC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Băng gạc tiệt trùng</p>
                  <p className="text-xs text-slate-500">Đang kiểm kê định kỳ</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                2 GIỜ TRƯỚC
              </span>
            </div>
          </div>
          <button className="w-full mt-8 py-3 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Xem lịch sử kho
          </button>
        </div>
      </section>
    </main>
  );
}
