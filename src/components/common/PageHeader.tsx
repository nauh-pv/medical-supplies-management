import { type ReactNode } from "react";

interface PageHeaderProps {
  /** Optional label rendered above the title — all-caps, primary color. */
  eyebrow?: ReactNode;
  title: string;
  /** Subtitle rendered below the title. */
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Override title size for larger editorial headings (e.g. "4xl"). Defaults to "3xl". */
  titleSize?: string;
  className?: string;
}

/**
 * Asymmetric page header — title left-bottom, actions right-bottom.
 * Supports an optional eyebrow label above the title.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  titleSize = "text-3xl",
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={[
        "flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4",
        className,
      ].join(" ")}
    >
      <div>
        {eyebrow && <div className="mb-1">{eyebrow}</div>}
        <h2
          className={[
            "font-headline font-extrabold text-on-surface tracking-tight leading-tight",
            titleSize,
          ].join(" ")}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 sm:flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </header>
  );
}
