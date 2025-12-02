'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
  showingFrom: number;
  showingTo: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  showingFrom,
  showingTo,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-border">
      {/* Items per page selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2.5 sm:px-2 py-2 sm:py-1 border border-border rounded bg-background text-sm flex-1 sm:flex-initial touch-manipulation"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          Showing {showingFrom}-{showingTo} of {totalItems}
        </span>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-3 sm:px-2.5 py-2 sm:py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 border border-border rounded bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent active:bg-accent/80 text-sm touch-manipulation"
            aria-label="First page"
          >
            <span className="hidden sm:inline">««</span>
            <span className="sm:hidden">«</span>
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 sm:px-2.5 py-2 sm:py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 border border-border rounded bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent active:bg-accent/80 text-sm touch-manipulation"
            aria-label="Previous page"
          >
            ‹
          </button>

          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 sm:px-2.5 py-2 sm:py-1.5 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] border border-border rounded text-sm touch-manipulation ${
                  currentPage === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent active:bg-accent/80'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-2.5 py-2 sm:py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 border border-border rounded bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent active:bg-accent/80 text-sm touch-manipulation"
            aria-label="Next page"
          >
            ›
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-2.5 py-2 sm:py-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 border border-border rounded bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent active:bg-accent/80 text-sm touch-manipulation"
            aria-label="Last page"
          >
            <span className="hidden sm:inline">»»</span>
            <span className="sm:hidden">»</span>
          </button>
        </div>
      )}
    </div>
  );
}

