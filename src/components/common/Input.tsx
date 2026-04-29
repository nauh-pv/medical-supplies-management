import { type InputHTMLAttributes, forwardRef } from "react";

type InputSize = "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  onTrailingIconClick?: () => void;
  error?: string;
  hint?: string;
  size?: InputSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    leadingIcon,
    trailingIcon,
    onTrailingIconClick,
    error,
    hint,
    size = "md",
    className = "",
    id,
    ...props
  },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const sizeClass = size === "lg" ? "py-3 text-base" : "py-2.5 text-sm";

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={inputId}
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

        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full bg-surface-container-low rounded-xl text-on-surface placeholder:text-on-surface-variant/50",
            sizeClass,
            "outline-none ring-1 ring-transparent",
            "focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest",
            "transition-all",
            error ? "ring-1 ring-error/40" : "",
            leadingIcon ? "pl-10" : "pl-4",
            trailingIcon ? "pr-10" : "pr-4",
            className,
          ].join(" ")}
          {...props}
        />

        {trailingIcon && (
          <span
            onClick={onTrailingIconClick}
            className={[
              "material-symbols-outlined absolute right-3 text-on-surface-variant text-[1.1rem]",
              onTrailingIconClick
                ? "cursor-pointer hover:text-primary transition-colors"
                : "pointer-events-none",
            ].join(" ")}
          >
            {trailingIcon}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-error font-label">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-on-surface-variant font-label">{hint}</p>
      )}
    </div>
  );
});
