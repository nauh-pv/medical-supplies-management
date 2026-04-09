import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: string;
  progress?: number; // 0-100
  children?: ReactNode; // for sparklines or custom bottom content
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendUp,
  icon,
  progress,
  children,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={[
        "bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Background icon accent */}
      {icon && (
        <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-8xl text-primary -rotate-12 leading-none">
            {icon}
          </span>
        </div>
      )}

      {/* Label */}
      <p className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant mb-2">
        {label}
      </p>

      {/* Value + Trend */}
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={[
              "text-xs font-medium",
              trendUp ? "text-green-600" : "text-error",
            ].join(" ")}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {/* Custom content (sparklines, etc.) */}
      {children}
    </div>
  );
}
