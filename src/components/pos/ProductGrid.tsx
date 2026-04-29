import { useState, useEffect } from "react";
import { Input, Badge } from "@/components/common";
import { getMedicines, getInventory } from "@/services/inventory";
import type { MedicineDoc, InventoryDoc } from "@/types/firestore";
import { useUserContext } from "@/contexts/UserContext";

const STATUS_BADGE: Record<
  string,
  { variant: "success" | "warning" | "error"; label: string }
> = {
  "in-stock": { variant: "success", label: "Còn hàng" },
  "low-stock": { variant: "warning", label: "Sắp hết" },
  "out-of-stock": { variant: "error", label: "Hết hàng" },
};

function getDisplayStatus(qty: number, min: number) {
  if (qty === 0) return "out-of-stock";
  if (qty <= min) return "low-stock";
  return "in-stock";
}

interface ProductGridProps {
  refetchTrigger?: number;
  onMedicineClick: (medicine: MedicineDoc, stock: number) => void;
}

export function ProductGrid({
  onMedicineClick,
  refetchTrigger,
}: ProductGridProps) {
  const userDoc = useUserContext();
  const [medicines, setMedicines] = useState<MedicineDoc[]>([]);
  const [inventory, setInventory] = useState<InventoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const locationId = userDoc?.branchId || "WAREHOUSE";

  useEffect(() => {
    let cancelled = false;
    if (!locationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([getMedicines(), getInventory(locationId)]).then(
      ([meds, inv]) => {
        if (!cancelled) {
          setMedicines(meds);
          setInventory(inv);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [locationId, refetchTrigger]);

  function getStock(medicineId: string) {
    const preferred = inventory.find(
      (i) => i.id === `${locationId}_${medicineId}`,
    );
    if (preferred) return preferred.quantity;
    return inventory.find((i) => i.medicineId === medicineId)?.quantity ?? 0;
  }

  const categories = [
    "Tất cả",
    ...Array.from(
      new Set(
        medicines.map((m) => (m.category === "prescribed" ? "Kê đơn" : "OTC")),
      ),
    ),
  ];

  const filtered = medicines
    .filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.sku.toLowerCase().includes(search.toLowerCase());
      const cat = m.category === "prescribed" ? "Kê đơn" : "OTC";
      const matchCat = activeCategory === "Tất cả" || cat === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      // Sort: in-stock first, out-of-stock last
      const stockA = getStock(a.id);
      const stockB = getStock(b.id);
      if (stockA === 0 && stockB > 0) return 1;
      if (stockB === 0 && stockA > 0) return -1;
      return 0;
    });

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 min-w-0">
      {/* Search + category */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Tìm kiếm sản phẩm, SKU..."
          leadingIcon="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                "px-4 py-1.5 rounded-xl text-xs font-label font-semibold transition-all",
                activeCategory === cat
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
          <span className="text-sm">Đang tải sản phẩm...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.length > 0 ? (
            filtered.map((m) => {
              const stock = getStock(m.id);
              const status = getDisplayStatus(stock, m.minStockLevel);
              const s = STATUS_BADGE[status];
              const isOutOfStock = status === "out-of-stock";
              return (
                <button
                  key={m.id}
                  disabled={isOutOfStock}
                  onClick={() => onMedicineClick(m, stock)}
                  className={[
                    "bg-surface-container-lowest rounded-[1.25rem] p-5 text-left flex flex-col gap-3 shadow-[0_20px_40px_rgba(0,80,203,0.03)] transition-all",
                    isOutOfStock
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-[0_20px_40px_rgba(0,80,203,0.08)] hover:-translate-y-0.5 hover:bg-surface-bright",
                  ].join(" ")}
                >
                  {m.imageUrl ? (
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                        medication
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-label font-semibold text-on-surface leading-snug mb-0.5">
                      {m.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">{m.sku}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-0.5">
                      Tồn kho:{" "}
                      <span
                        className={
                          stock === 0
                            ? "text-error font-semibold"
                            : stock <= m.minStockLevel
                              ? "text-warning font-semibold"
                              : "font-semibold text-on-surface"
                        }
                      >
                        {stock}
                      </span>{" "}
                      {m.unitName}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-headline font-bold text-primary">
                      {m.sellPrice.toLocaleString("vi-VN")}₫
                    </span>
                    <Badge variant={s.variant} dot>
                      {s.label}
                    </Badge>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-on-surface-variant">
              Không có sản phẩm nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
