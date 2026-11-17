import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';

/** Publishes every recorded, unpublished decision (reference "Công bố kết quả"). */
export default function PublishResultsCard({ pendingIds, onPublish, pending, message }) {
  return (
    <Card title="Công bố kết quả">
      <div className="stack">
        <p>
          {pendingIds.length > 0
            ? `${pendingIds.length} kết quả đã ghi nhận nhưng chưa công bố (${pendingIds.join(', ')}). Công bố sẽ tạo thông báo trong ứng dụng cho từng ứng viên.`
            : 'Không có kết quả nào đang chờ công bố.'}
        </p>
        {message ? (
          <Alert tone={message.tone} title={message.title} live>
            {message.text ? <p>{message.text}</p> : null}
          </Alert>
        ) : null}
        <Button block onClick={onPublish} disabled={pendingIds.length === 0 || pending}>
          Publish Results
        </Button>
        <p className="hint">
          Chỉ kết quả đã công bố mới hiển thị cho ứng viên trong Applicant Portal. Ghi nhận quyết định không tự công bố.
        </p>
      </div>
    </Card>
  );
}
