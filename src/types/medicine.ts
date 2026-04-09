export type StockStatus = "in-stock" | "out-of-stock" | "low-stock";
export type MedicineCategory = "prescribed" | "otc";

export interface Medicine {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  category: MedicineCategory;
  unit: string;
  importPrice: string;
  sellPrice: string;
  stock: number;
  stockPercent: number;
  status: StockStatus;
}
