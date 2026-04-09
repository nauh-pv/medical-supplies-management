import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Asymmetric page header — title left-bottom, actions right-bottom.
 * Mirrors the editorial layout from the design system.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={["flex justify-between items-end gap-4", className].join(" ")}
    >
      <div>
        <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
