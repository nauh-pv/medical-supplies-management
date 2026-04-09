import { PageHeader, Button } from "@/components/common";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { SupportCards } from "@/components/inventory/SupportCards";

export function Inventory() {
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
            <Button variant="ghost" icon="payments">
              Thiết lập giá
            </Button>
            <Button icon="add">Thêm thuốc mới</Button>
          </>
        }
      />

      <InventoryStats />

      <InventoryTable />

      <SupportCards />
    </main>
  );
}
