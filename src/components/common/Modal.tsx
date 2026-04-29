import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Tailwind max-width class. Defaults to "max-w-xl". */
  maxWidth?: string;
}

/**
 * Glassmorphism modal overlay.
 * Closes on backdrop click or Escape key.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-xl",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          "bg-surface-container-lowest w-full rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.12)] overflow-hidden",
          maxWidth,
        ].join(" ")}
      >
        {/* Header */}
        <div className="px-10 py-8 bg-surface-container-low flex justify-between items-start gap-4">
          <div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
