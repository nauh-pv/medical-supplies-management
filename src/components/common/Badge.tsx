import { type ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-error-container text-on-error-container",
  info: "bg-primary/10 text-primary",
  neutral: "bg-surface-container text-on-surface-variant",
};

const dotClasses: Record<BadgeVariant, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-error",
  info: "bg-primary",
  neutral: "bg-on-surface-variant",
};

export function Badge({
  variant = "neutral",
  children,
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-label",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={[
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            dotClasses[variant],
          ].join(" ")}
        />
      )}
      {children}
    </span>
  );
}
