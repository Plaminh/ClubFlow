import { useEffect, useRef, useState } from 'react';
import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import Alert from '../../molecules/Alert/index.js';
import Card from '../../molecules/Card/index.js';
import ChoiceGroup from '../../molecules/ChoiceGroup/index.js';
import FormField from '../../molecules/FormField/index.js';
import ConfirmDialog from '../ConfirmDialog/index.js';
import { RECOMMENDATION_LABELS, getLabel } from '../../../constants/labels.js';
import { formatDateTime } from '../../../utils/format.js';
import { validateAssessmentInput } from '../../../utils/validation.js';

// '' = no recommendation (the default); it is sent to the service as null.
const RECOMMENDATIONS = [
  { value: '', label: RECOMMENDATION_LABELS.none },
  { value: 'pass', label: RECOMMENDATION_LABELS.pass },
  { value: 'fail', label: RECOMMENDATION_LABELS.fail },
];

/**
 * One assessment per completed, assigned interview (reference "Interview
 * Assessment"). Team-selected Q-04: interview notes are required; the
 * recommendation (Pass or Fail) is optional and advisory. There are no scores
 * and no criteria. Only the Executive records the final Pass/Fail.
 */
export default function AssessmentForm({ interview, onSubmit }) {
  const [values, setValues] = useState({ notes: '', recommendation: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [pending, setPending] = useState(false);
  // Snapshot the target and payload shown in the confirmation. Neither a
  // selection change nor later form edits may retarget the final submission.
  const [confirmation, setConfirmation] = useState(null);
  const [focusErrors, setFocusErrors] = useState(0);
  const formRef = useRef(null);
  const subtitle = `${interview.applicationId} · ${interview.applicantName} · ${interview.positionName}`;

  // UI-FR-017: after a failed submit, move focus to the first invalid field.
  useEffect(() => {
    if (focusErrors > 0) {
      formRef.current?.querySelector('[aria-invalid="true"], .choice-group--invalid input')?.focus();
    }
  }, [focusErrors]);

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
              <dt>Nhận xét phỏng vấn</dt>
              <dd>{interview.assessment.notes}</dd>
            </div>
            <div>
              <dt>Đề xuất của bạn · chỉ để tham khảo</dt>
              <dd>{getLabel(RECOMMENDATION_LABELS, interview.assessment.recommendation, RECOMMENDATION_LABELS.none)}</dd>
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

  // A submitted assessment is final (Q-06), so a valid form asks once before sending.
  function handleSubmit(event) {
    event.preventDefault();
    const fieldErrors = validateAssessmentInput(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setBanner({ tone: 'error', title: 'Chưa thể gửi đánh giá', text: 'Hãy nhập nhận xét phỏng vấn. Nội dung đã nhập được giữ lại.' });
      setFocusErrors((count) => count + 1);
      return;
    }
    setConfirmation({
      interviewId: interview.interviewId,
      applicationId: interview.applicationId,
      values: { notes: values.notes, recommendation: values.recommendation || null },
    });
  }

  async function submitConfirmed() {
    if (!confirmation || pending) {
      return;
    }
    const target = confirmation;
    setConfirmation(null);
    setPending(true);
    const result = await onSubmit(target.interviewId, target.values);
    setPending(false);
    if (!result.ok) {
      setErrors(result.error?.fieldErrors ?? {});
      setBanner({ tone: 'error', title: 'Chưa thể gửi đánh giá', text: result.error?.message ?? '' });
      if (result.error?.fieldErrors) {
        setFocusErrors((count) => count + 1);
      }
    }
  }

  return (
    <Card title="Interview Assessment" subtitle={subtitle}>
      <form ref={formRef} className="stack" noValidate onSubmit={handleSubmit}>
        {banner ? (
          <Alert tone={banner.tone} title={banner.title} live>
            <p>{banner.text}</p>
          </Alert>
        ) : null}
        <FormField id="assessment-notes" label="Nhận xét phỏng vấn" hint="Bắt buộc." error={errors.notes}>
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
          legend="Đề xuất của người phỏng vấn (không bắt buộc)"
          name="recommendation"
          type="radio"
          options={RECOMMENDATIONS}
          value={values.recommendation}
          onChange={(value) => set('recommendation', value)}
          hint="Đề xuất chỉ để Ban tuyển dụng tham khảo, không phải kết quả cuối. Chỉ Ban tuyển dụng ghi nhận và công bố Pass/Fail."
          error={errors.recommendation}
        />
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? 'Đang gửi…' : 'Submit Assessment'}
          </Button>
        </div>
        <p className="hint">
          Mỗi buổi phỏng vấn đã diễn ra chỉ có một đánh giá. Sau khi gửi, đánh giá chỉ đọc: không thể sửa hay gửi lại.
        </p>
      </form>
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={`Gửi đánh giá cho ${confirmation?.applicationId ?? ''}?`}
        confirmLabel="Gửi đánh giá"
        busy={pending}
        onConfirm={submitConfirmed}
        onCancel={() => setConfirmation(null)}
      >
        <p>
          Đề xuất:{' '}
          <strong>{getLabel(RECOMMENDATION_LABELS, confirmation?.values.recommendation, RECOMMENDATION_LABELS.none)}</strong>.
          Ban tuyển dụng sẽ đọc đánh giá này trước khi ghi nhận kết quả cuối.
        </p>
        <p>
          <strong>Sau khi gửi, đánh giá không thể sửa hay gửi lại.</strong>
        </p>
      </ConfirmDialog>
    </Card>
  );
}
