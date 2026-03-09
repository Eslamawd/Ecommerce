"use client";

type PaginationControlsProps = {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function PaginationControls({
  currentPage,
  lastPage,
  onPageChange,
  disabled,
}: PaginationControlsProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < lastPage;

  return (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev || disabled}
        className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
      >
        Previous
      </button>

      <p className="text-sm text-muted">
        Page {currentPage} of {lastPage}
      </p>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || disabled}
        className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
      >
        Next
      </button>
    </div>
  );
}
