import { useState, useEffect } from "react";
import { getMedicines, getInventory } from "@/services/inventory";
import { useNavigate } from "react-router-dom";

/** Bento-grid KPI section at the top of the Inventory page. */
export function InventoryStats() {
  const navigate = useNavigate();

  const [total, setTotal] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getMedicines(), getInventory("WAREHOUSE")])
      .then(([meds, inv]) => {
        setTotal(meds.length);
        const low = meds.filter((m) => {
          const stock = inv.find((i) => i.medicineId === m.id)?.quantity ?? 0;
          const min =
            inv.find((i) => i.medicineId === m.id)?.minStockLevel ??
            m.minStockLevel;
          return stock <= min;
        }).length;
        setLowStock(low);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* ── Large card: total products ── */}
      <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-4">
            <h3 className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider">
              Tổng sản phẩm hiện có
            </h3>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-extrabold text-on-surface tracking-tighter font-headline">
                {total === null ? (
                  <span className="inline-block w-24 h-10 bg-surface-container-high rounded-lg animate-pulse" />
                ) : (
                  total.toLocaleString("vi-VN")
                )}
              </span>
              <span className="text-emerald-600 font-bold flex items-center text-sm gap-0.5">
                <span className="material-symbols-outlined text-sm">
                  trending_up
                </span>
                +4.2%
              </span>
            </div>
            <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
              Số lượng thuốc được cập nhật mới nhất từ trạm phân phối trung tâm
              sáng nay.
            </p>
          </div>

          {/* Sparkline */}
          <div className="hidden md:block w-48 h-24 bg-surface-container-low rounded-xl relative flex-shrink-0">
            <div className="absolute bottom-4 left-4 right-4 h-12 flex items-end gap-1">
              {[20, 30, 40, 60, 50, 70, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: `rgba(0,80,203,${0.1 + i * 0.1})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Small card: stock alerts ── */}
      <div className="col-span-12 lg:col-span-4 bg-tertiary-container rounded-[2rem] p-4 sm:p-8 text-on-tertiary-container relative overflow-hidden">
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 pointer-events-none">
          warning
        </span>
        <div className="relative z-10 space-y-4">
          <h3 className="font-label text-sm font-bold uppercase tracking-wider opacity-90">
            Cảnh báo tồn kho
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tighter font-headline">
              {lowStock === null ? (
                <span className="inline-block w-12 h-10 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                lowStock
              )}
            </span>
            <span className="text-sm font-medium">mặt hàng</span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            Sản phẩm sắp hết hạn hoặc dưới ngưỡng tồn kho an toàn.
          </p>
          <button
            className="text-xs font-bold underline underline-offset-4 decoration-2 hover:opacity-80 transition-opacity"
            onClick={() => navigate("/alerts")}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
