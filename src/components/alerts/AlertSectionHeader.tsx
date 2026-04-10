import { Badge } from "@/components/common";

interface AlertSectionHeaderProps {
  icon: string;
  iconColor: string;
  title: string;
  badgeLabel?: string;
  badgeVariant?: "error" | "warning" | "info" | "success" | "neutral";
}

export function AlertSectionHeader({
  icon,
  iconColor,
  title,
  badgeLabel,
  badgeVariant = "error",
}: AlertSectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={["material-symbols-outlined", iconColor].join(" ")}>
        {icon}
      </span>
      <h2 className="text-lg font-headline font-bold text-on-surface">
        {title}
      </h2>
      {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
    </div>
  );
}
