interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-8 text-center text-on-surface-variant"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={[
              "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-primary text-on-primary font-bold"
                : "hover:bg-surface-container-high text-on-surface",
            ].join(" ")}
          >
            {page}
          </button>
        ),
      )}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
