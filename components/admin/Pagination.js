export default function Pagination({ page, totalPages, total, onPageChange, label = "total" }) {
  if (total === 0) return null;

  return (
    <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span className="text-muted" style={{ fontSize: 13 }}>
        Page {page} of {totalPages} · {total} {label}
      </span>
      <div className="btn-group">
        <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <i className="bx bx-chevron-left"></i> Previous
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next <i className="bx bx-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
