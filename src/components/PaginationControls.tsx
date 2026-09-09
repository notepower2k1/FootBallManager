interface PaginationControlsProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label: string;
}

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
  label,
}: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span className="pagination__status">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </button>
    </nav>
  );
}
