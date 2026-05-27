import { useMemo } from "react";

export default function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  className = "",
}) {
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return { pages, showStartEllipsis: start > 1, showEndEllipsis: end < totalPages };
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className={`pagination ${className}`} aria-label="Table pagination">
      <button
        type="button"
        className="pagination-btn pagination-btn-nav"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        «
      </button>
      <button
        type="button"
        className="pagination-btn pagination-btn-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pageNumbers.showStartEllipsis && (
        <>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          <span className="pagination-ellipsis">…</span>
        </>
      )}

      {pageNumbers.pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`pagination-btn ${page === currentPage ? "pagination-btn-active" : ""}`}
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {pageNumbers.showEndEllipsis && (
        <>
          <span className="pagination-ellipsis">…</span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="pagination-btn pagination-btn-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Next page"
      >
        ›
      </button>
      <button
        type="button"
        className="pagination-btn pagination-btn-nav"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  );
}
