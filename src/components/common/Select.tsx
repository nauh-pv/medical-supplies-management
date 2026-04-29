import { type SelectHTMLAttributes, type ReactNode } from "react";

type SelectVariant = "default" | "pill";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  leadingIcon?: string;
  error?: string;
  hint?: string;
  variant?: SelectVariant;
  children?: ReactNode;
}

export function Select({
  label,
  leadingIcon,
  error,
  hint,
  variant = "default",
  className = "",
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leadingIcon && (
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant pointer-events-none text-[1.1rem]">
            {leadingIcon}
          </span>
        )}

        <select
          id={selectId}
          className={[
            "w-full appearance-none text-sm text-on-surface",
            "outline-none transition-all cursor-pointer",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            variant === "pill"
              ? "bg-surface-container-lowest border border-outline-variant/20 rounded-full shadow-sm py-2.5 ring-1 ring-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              : "bg-surface-container-low rounded-xl py-2.5 ring-1 ring-transparent focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest",
            error ? "ring-1 ring-error/40" : "",
            leadingIcon ? "pl-10" : "pl-4",
            "pr-10",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {children}
        </select>

        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[1.1rem]">
          expand_more
        </span>
      </div>

      {error && <p className="text-xs text-error font-label">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-on-surface-variant font-label">{hint}</p>
      )}
    </div>
  );
}
