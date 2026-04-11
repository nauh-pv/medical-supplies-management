import { PageHeader } from "@/components/common";
import { UnitTable } from "@/components/units/UnitTable";

export function Units() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Cấu hình hệ thống
          </span>
        }
        title="Danh mục đơn vị tính"
        subtitle="Quản lý các đơn vị đo lường cho dược phẩm và vật tư y tế trong hệ thống kho."
      />
      <UnitTable />
    </main>
  );
}
