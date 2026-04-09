interface SupportCardProps {
  icon: string;
  title: string;
  description: string;
  dashed?: boolean;
}

function SupportCard({
  icon,
  title,
  description,
  dashed = false,
}: SupportCardProps) {
  return (
    <div
      className={[
        "bg-surface-container rounded-[1.5rem] p-6 hover:bg-surface-container-high transition-colors cursor-pointer",
        dashed ? "border-2 border-dashed border-primary/20" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-4 mb-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <h4 className="font-headline font-bold text-on-surface">{title}</h4>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/** Three quick-action support cards at the bottom of the Inventory page. */
export function SupportCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <SupportCard
        icon="history"
        title="Lịch sử xuất nhập"
        description="Xem lại các biến động kho gần nhất của hệ thống trạm y tế."
      />
      <SupportCard
        icon="inventory"
        title="Kiểm kê định kỳ"
        description="Bắt đầu quy trình đối soát thực tế định kỳ hàng tháng."
      />
      <SupportCard
        icon="help_center"
        title="Hướng dẫn sử dụng"
        description="Tìm hiểu cách quản lý danh mục thuốc và vật tư y tế chuẩn hóa."
        dashed
      />
    </div>
  );
}
