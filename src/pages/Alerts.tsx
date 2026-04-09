import { PageHeader, Button } from "@/components/common";
import { LowStockGrid } from "@/components/alerts/LowStockGrid";
import { ExpiryTable } from "@/components/alerts/ExpiryTable";

export function Alerts() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-error">
            Cảnh báo hệ thống
          </span>
        }
        title="Cảnh báo hàng hóa"
        titleSize="text-4xl"
        actions={
          <>
            <Button variant="ghost" icon="filter_list">
              Bộ lọc
            </Button>
            <Button icon="local_shipping">Điều phối hàng</Button>
          </>
        }
      />

      {/* Low stock warning cards */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-error">warning</span>
          <h2 className="text-lg font-headline font-bold text-on-surface">
            Tồn kho nguy hiểm
          </h2>
          <span className="px-2 py-0.5 rounded-lg bg-error/10 text-error text-xs font-label font-bold">
            4 mặt hàng
          </span>
        </div>
        <LowStockGrid />
      </div>

      {/* Expiry / low stock table */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-warning">
            schedule
          </span>
          <h2 className="text-lg font-headline font-bold text-on-surface">
            Theo dõi hạn dùng & tồn kho
          </h2>
        </div>
        <ExpiryTable />
      </div>
    </main>
  );
}
