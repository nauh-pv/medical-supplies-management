import { PageHeader } from "@/components/common";
import { ExpiryTable } from "@/components/alerts/ExpiryTable";
import { AlertSectionHeader } from "@/components/alerts/AlertSectionHeader";

export function Alerts() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Cảnh báo hệ thống
          </span>
        }
        title="Cảnh báo hàng hóa"
      />
      <div>
        <AlertSectionHeader
          icon="schedule"
          iconColor="text-warning"
          title="Theo dõi hạn dùng & tồn kho"
        />
        <ExpiryTable />
      </div>
    </main>
  );
}
