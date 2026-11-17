import Button from '../../atoms/Button/index.js';
import './Pagination.css';

/** Previous / next pagination with the current page announced (reference "pagination"). */
export default function Pagination({ page, pageCount, onChange, label = 'Phân trang' }) {
  return (
    <nav className="pagination" aria-label={label}>
      <Button variant="secondary" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        ← Trang trước
      </Button>
      <span className="pagination__status" aria-live="polite">
        Trang {page} / {pageCount}
      </span>
      <Button variant="secondary" onClick={() => onChange(page + 1)} disabled={page >= pageCount}>
        Trang sau →
      </Button>
    </nav>
  );
}
