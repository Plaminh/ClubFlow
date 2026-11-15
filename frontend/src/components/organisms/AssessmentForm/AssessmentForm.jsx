import { useState } from 'react';
import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import ChoiceGroup from '../../molecules/ChoiceGroup/index.js';
import FormField from '../../molecules/FormField/index.js';
import { RECOMMENDATION_LABELS, getLabel } from '../../../constants/labels.js';
import { formatDateTime } from '../../../utils/format.js';
import { validateAssessmentInput } from '../../../utils/validation.js';

const RECOMMENDATIONS = Object.entries(RECOMMENDATION_LABELS).map(([value, label]) => ({ value, label }));

/**
 * One assessment per completed, assigned interview (reference "Interview
 * Assessment"). Fields follow the reference (notes + overall recommendation);
 * the final field list is open question Q-04, so keep this form easy to change.
 * The recommendation is advisory — only the Executive records Pass/Fail.
 */
export default function AssessmentForm({ interview, onSubmit }) {
  const [values, setValues] = useState({ notes: '', recommendation: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [pending, setPending] = useState(false);
  const subtitle = `${interview.applicationId} · ${interview.applicantName} · ${interview.positionName}`;

  if (interview.assessment) {
    return (
      <Card title="Interview Assessment" subtitle={subtitle} actions={<Badge tone="success">Đã gửi</Badge>}>
        <div className="stack">
          {banner ? (
            <Alert tone={banner.tone} title={banner.title} live>
              <p>{banner.text}</p>
            </Alert>
          ) : (
            <Alert tone="success" title="Đã gửi đánh giá">
              <p>Đánh giá này đã khóa; không thể gửi lần hai.</p>
            </Alert>
          )}
          <dl className="summary-list">
            <div>
              <dt>Đánh giá tổng thể</dt>
              <dd>{getLabel(RECOMMENDATION_LABELS, interview.assessment.recommendation)}</dd>
            </div>
            <div>
              <dt>Nhận xét</dt>
              <dd>{interview.assessment.notes}</dd>
            </div>
            <div>
              <dt>Thời gian gửi</dt>
              <dd>{formatDateTime(interview.assessment.submittedAt)}</dd>
            </div>
          </dl>
          <div>
            <Button disabled>Submit Assessment</Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!interview.canAssess) {
    return (
      <Card title="Interview Assessment" subtitle={subtitle} actions={<Badge tone="warning">Chưa diễn ra</Badge>}>
        <div className="stack">
          <Alert tone="warning" title="Chưa thể đánh giá">
            <p>Buổi phỏng vấn chưa diễn ra xong. Biểu mẫu mở sau khi buổi phỏng vấn kết thúc.</p>
          </Alert>
          <FormField id="assessment-notes-locked" label="Nhận xét phỏng vấn">
            {(props) => <textarea {...props} rows={3} disabled />}
          </FormField>
          <div>
            <Button disabled>Submit Assessment</Button>
          </div>
        </div>
      </Card>
    );
  }

  function set(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const fieldErrors = validateAssessmentInput(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setBanner({ tone: 'error', title: 'Chưa thể gửi đánh giá', text: 'Điền nhận xét và chọn đề xuất. Nội dung đã nhập được giữ lại.' });
      return;
    }
    setPending(true);
    const result = await onSubmit(values);
    setPending(false);
    if (!result.ok) {
      setErrors(result.error?.fieldErrors ?? {});
      setBanner({ tone: 'error', title: 'Chưa thể gửi đánh giá', text: result.error?.message ?? '' });
    }
  }

  return (
    <Card title="Interview Assessment" subtitle={subtitle}>
      <form className="stack" noValidate onSubmit={handleSubmit}>
        {banner ? (
          <Alert tone={banner.tone} title={banner.title} live>
            <p>{banner.text}</p>
          </Alert>
        ) : null}
        <FormField id="assessment-notes" label="Nhận xét phỏng vấn" error={errors.notes}>
          {(props) => (
            <textarea
              {...props}
              rows={5}
              placeholder="Ghi nhận xét ngắn về buổi phỏng vấn…"
              value={values.notes}
              onChange={(event) => set('notes', event.target.value)}
            />
          )}
        </FormField>
        <ChoiceGroup
          legend="Đánh giá tổng thể"
          name="recommendation"
          type="radio"
          options={RECOMMENDATIONS}
          value={values.recommendation}
          onChange={(value) => set('recommendation', value)}
          hint="Đây là đánh giá tham khảo, không phải kết quả Pass/Fail. Chỉ Ban tuyển dụng ghi nhận và công bố kết quả cuối."
          error={errors.recommendation}
        />
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? 'Đang gửi…' : 'Submit Assessment'}
          </Button>
        </div>
        <p className="hint">Mỗi buổi phỏng vấn đã diễn ra chỉ có một đánh giá.</p>
      </form>
    </Card>
  );
}
