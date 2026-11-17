import Button from '../../atoms/Button/index.js';
import Alert from '../Alert/index.js';
import './AsyncContent.css';

/**
 * Consistent loading and error presentation for data-driven content.
 * status: 'loading' | 'success' | 'error' (from useServiceData).
 */
export default function AsyncContent({ status, error, onRetry, loadingLabel = 'Đang tải dữ liệu…', children }) {
  if (status === 'loading') {
    return (
      <div className="async-content__loading" role="status">
        <span className="async-content__spinner" aria-hidden="true" />
        {loadingLabel}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert tone="error" title="Không tải được dữ liệu" live>
        <p>{error?.message ?? 'Đã có lỗi xảy ra.'}</p>
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Thử lại
          </Button>
        ) : null}
      </Alert>
    );
  }

  return children;
}
