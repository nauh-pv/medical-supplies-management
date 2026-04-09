import { type ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

/** Category header — label-sm all-caps with wide tracking, "tabbed folder" feel. No lines. */
export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p
      className={[
        "text-xs font-label font-semibold uppercase tracking-[0.05em] text-on-surface-variant",
        className,
      ].join(" ")}
    >
      {children}
    </p>
  );
}
