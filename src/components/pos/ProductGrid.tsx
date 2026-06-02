import { useState, useEffect } from "react";
import { Input, Badge } from "@/components/common";
import { getMedicines, getInventory, getServices } from "@/services/inventory";
import type { MedicineDoc, InventoryDoc, ServiceDoc } from "@/types/firestore";
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
  onServiceClick: (service: ServiceDoc) => void;
}

type CatalogItem =
  | { kind: "medicine"; medicine: MedicineDoc; stock: number }
  | { kind: "service"; service: ServiceDoc };

export function ProductGrid({
  onMedicineClick,
  onServiceClick,
  refetchTrigger,
}: ProductGridProps) {
  const userDoc = useUserContext();
  const [medicines, setMedicines] = useState<MedicineDoc[]>([]);
  const [inventory, setInventory] = useState<InventoryDoc[]>([]);
  const [services, setServices] = useState<ServiceDoc[]>([]);
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
    Promise.all([getMedicines(), getInventory(locationId), getServices()]).then(
      ([meds, inv, svc]) => {
        if (!cancelled) {
          setMedicines(meds);
          setInventory(inv);
          setServices(svc);
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
    "Dịch vụ",
    ...Array.from(
      new Set(
        medicines.map((m) => (m.category === "prescribed" ? "Kê đơn" : "OTC")),
      ),
    ),
  ];

  const catalogItems: CatalogItem[] = [
    ...medicines.map((medicine) => ({
      kind: "medicine" as const,
      medicine,
      stock: getStock(medicine.id),
    })),
    ...services.map((service) => ({
      kind: "service" as const,
      service,
    })),
  ];

  const filtered = catalogItems
    .filter((item) => {
      const matchSearch =
        item.kind === "medicine"
          ? item.medicine.name.toLowerCase().includes(search.toLowerCase()) ||
            item.medicine.sku.toLowerCase().includes(search.toLowerCase())
          : item.service.name.toLowerCase().includes(search.toLowerCase()) ||
            item.service.code.toLowerCase().includes(search.toLowerCase()) ||
            item.service.type.toLowerCase().includes(search.toLowerCase());

      if (activeCategory === "Tất cả") return matchSearch;
      if (activeCategory === "Dịch vụ")
        return matchSearch && item.kind === "service";
      if (item.kind === "medicine") {
        const cat = item.medicine.category === "prescribed" ? "Kê đơn" : "OTC";
        return matchSearch && cat === activeCategory;
      }
      return false;
    })
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "medicine" ? -1 : 1;
      if (a.kind === "medicine" && b.kind === "medicine") {
        if (a.stock === 0 && b.stock > 0) return 1;
        if (b.stock === 0 && a.stock > 0) return -1;
        return a.medicine.name.localeCompare(b.medicine.name, "vi");
      }
      if (a.kind === "service" && b.kind === "service") {
        return a.service.name.localeCompare(b.service.name, "vi");
      }
      return 0;
    });

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 min-w-0 w-full">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              if (item.kind === "medicine") {
                const stock = item.stock;
                const status = getDisplayStatus(
                  stock,
                  item.medicine.minStockLevel,
                );
                const s = STATUS_BADGE[status];
                const isOutOfStock = status === "out-of-stock";
                return (
                  <button
                    key={item.medicine.id}
                    disabled={isOutOfStock}
                    onClick={() => onMedicineClick(item.medicine, stock)}
                    className={[
                      "bg-surface-container-lowest rounded-[1.25rem] p-5 text-left flex flex-col gap-3 shadow-[0_20px_40px_rgba(0,80,203,0.03)] transition-all",
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-[0_20px_40px_rgba(0,80,203,0.08)] hover:-translate-y-0.5 hover:bg-surface-bright",
                    ].join(" ")}
                  >
                    {item.medicine.imageUrl ? (
                      <img
                        src={item.medicine.imageUrl}
                        alt={item.medicine.name}
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
                        {item.medicine.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {item.medicine.sku}
                      </p>
                      <p className="text-xs text-on-surface-variant/70 mt-0.5">
                        Tồn kho:{" "}
                        <span
                          className={
                            stock === 0
                              ? "text-error font-semibold"
                              : stock <= item.medicine.minStockLevel
                                ? "text-warning font-semibold"
                                : "font-semibold text-on-surface"
                          }
                        >
                          {stock}
                        </span>{" "}
                        {item.medicine.unitName}
                      </p>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-base font-headline font-bold text-primary">
                        {item.medicine.sellPrice.toLocaleString("vi-VN")}₫
                      </span>
                      <Badge variant={s.variant} dot>
                        {s.label}
                      </Badge>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={item.service.id}
                  onClick={() => onServiceClick(item.service)}
                  className="bg-surface-container-lowest rounded-[1.25rem] p-5 text-left flex flex-col gap-3 shadow-[0_20px_40px_rgba(0,80,203,0.03)] transition-all hover:shadow-[0_20px_40px_rgba(0,80,203,0.08)] hover:-translate-y-0.5 hover:bg-surface-bright"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      medical_services
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-label font-semibold text-on-surface leading-snug mb-0.5">
                      {item.service.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.service.code}
                    </p>
                    <p className="text-xs text-on-surface-variant/70 mt-0.5">
                      Loại:{" "}
                      <span className="font-semibold text-on-surface">
                        Dịch vụ
                      </span>
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-headline font-bold text-primary">
                      {item.service.price.toLocaleString("vi-VN")}₫
                    </span>
                    <Badge variant="info" dot>
                      Dịch vụ
                    </Badge>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-on-surface-variant">
              Không có sản phẩm hoặc dịch vụ nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
