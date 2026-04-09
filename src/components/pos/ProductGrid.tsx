import { useState } from "react";
import { Input, Badge } from "@/components/common";

const CATEGORIES = [
  "Tất cả",
  "Kháng sinh",
  "Tim mạch",
  "Giảm đau",
  "Vitamin",
  "Vật tư y tế",
];

const PRODUCTS = [
  {
    id: "P001",
    name: "Atorvastatin 20mg",
    category: "Tim mạch",
    price: 28900,
    stock: 240,
    status: "in-stock" as const,
    icon: "medication",
  },
  {
    id: "P002",
    name: "Amoxicillin 500mg",
    category: "Kháng sinh",
    price: 15500,
    stock: 85,
    status: "low-stock" as const,
    icon: "medication",
  },
  {
    id: "P003",
    name: "Ibuprofen 400mg",
    category: "Giảm đau",
    price: 8200,
    stock: 320,
    status: "in-stock" as const,
    icon: "medication",
  },
  {
    id: "P004",
    name: "Vitamin D3 1000IU",
    category: "Vitamin",
    price: 12000,
    stock: 0,
    status: "out-of-stock" as const,
    icon: "vitamins",
  },
  {
    id: "P005",
    name: "Omeprazole 20mg",
    category: "Tiêu hóa",
    price: 19800,
    stock: 150,
    status: "in-stock" as const,
    icon: "medication",
  },
  {
    id: "P006",
    name: "Metformin 500mg",
    category: "Nội tiết",
    price: 7500,
    stock: 42,
    status: "low-stock" as const,
    icon: "medication",
  },
  {
    id: "P007",
    name: "Amlodipine 5mg",
    category: "Tim mạch",
    price: 22400,
    stock: 200,
    status: "in-stock" as const,
    icon: "medication",
  },
  {
    id: "P008",
    name: "Paracetamol 500mg",
    category: "Giảm đau",
    price: 4200,
    stock: 580,
    status: "in-stock" as const,
    icon: "medication",
  },
  {
    id: "P009",
    name: "Bông y tế vô trùng",
    category: "Vật tư y tế",
    price: 35000,
    stock: 120,
    status: "in-stock" as const,
    icon: "medical_services",
  },
];

const STATUS_BADGE: Record<
  string,
  { variant: "success" | "warning" | "error"; label: string }
> = {
  "in-stock": { variant: "success", label: "Còn hàng" },
  "low-stock": { variant: "warning", label: "Sắp hết" },
  "out-of-stock": { variant: "error", label: "Hết hàng" },
};

interface ProductGridProps {
  onAddToCart: (product: (typeof PRODUCTS)[number]) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "Tất cả" || p.category === activeCategory;
    return matchSearch && matchCategory;
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
          {CATEGORIES.map((cat) => (
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
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((p) => {
          const s = STATUS_BADGE[p.status];
          const isOutOfStock = p.status === "out-of-stock";
          return (
            <button
              key={p.id}
              disabled={isOutOfStock}
              onClick={() => onAddToCart(p)}
              className={[
                "bg-surface-container-lowest rounded-[1.25rem] p-5 text-left flex flex-col gap-3 shadow-[0_20px_40px_rgba(0,80,203,0.03)] transition-all",
                isOutOfStock
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-[0_20px_40px_rgba(0,80,203,0.08)] hover:-translate-y-0.5 hover:bg-surface-bright",
              ].join(" ")}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {p.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-label font-semibold text-on-surface leading-snug mb-1">
                  {p.name}
                </p>
                <p className="text-xs text-on-surface-variant">{p.category}</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-base font-headline font-bold text-primary">
                  {p.price.toLocaleString("vi-VN")}₫
                </span>
                <Badge variant={s.variant} dot>
                  {s.label}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
