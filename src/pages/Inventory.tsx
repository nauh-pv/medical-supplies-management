import { useState } from "react";
import { PageHeader, Button } from "@/components/common";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { SupportCards } from "@/components/inventory/SupportCards";
import { AddMedicineModal } from "@/components/inventory/AddMedicineModal";
import { SetPriceModal } from "@/components/inventory/SetPriceModal";

export function Inventory() {
  const [addOpen, setAddOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Cơ sở dữ liệu Thuốc
          </span>
        }
        title="Quản lý Kho Tổng"
        titleSize="text-4xl"
        actions={
          <>
            <Button
              variant="ghost"
              icon="payments"
              onClick={() => setPriceOpen(true)}
            >
              Thiết lập giá
            </Button>
            <Button icon="add" onClick={() => setAddOpen(true)}>
              Thêm thuốc mới
            </Button>
          </>
        }
      />

      <InventoryStats />
      <InventoryTable />
      <SupportCards />

      <AddMedicineModal open={addOpen} onClose={() => setAddOpen(false)} />
      <SetPriceModal open={priceOpen} onClose={() => setPriceOpen(false)} />
    </main>
  );
}
