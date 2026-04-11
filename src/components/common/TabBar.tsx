interface TabItem {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: readonly TabItem[] | TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /** "underline" — border-bottom line style (for page-level tabs).
   *  "pill" — filled container with active chip (for section-level tabs). */
  variant?: "underline" | "pill";
  className?: string;
}

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  className = "",
}: TabBarProps) {
  if (variant === "pill") {
    return (
      <div
        className={[
          "flex items-center gap-1 bg-surface-container-low rounded-xl p-1 w-fit",
          className,
        ].join(" ")}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={[
              "px-5 py-2 rounded-lg text-sm font-label font-semibold transition-all",
              activeTab === t.id
                ? "bg-primary text-on-primary shadow-sm font-bold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={[
        "flex gap-8 border-b border-outline-variant/20",
        className,
      ].join(" ")}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={[
            "pb-4 px-2 text-sm font-medium transition-all",
            activeTab === t.id
              ? "text-primary font-bold border-b-2 border-primary"
              : "text-on-surface-variant hover:text-primary",
          ].join(" ")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
