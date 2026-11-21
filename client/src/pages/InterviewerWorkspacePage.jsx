import { useState } from 'react';
import Badge from '../components/atoms/Badge/index.js';
import Alert from '../components/molecules/Alert/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import Card from '../components/molecules/Card/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import StatCard from '../components/molecules/StatCard/index.js';
import AssessmentForm from '../components/organisms/AssessmentForm/index.js';
import AssignedInterviewsTable from '../components/organisms/AssignedInterviewsTable/index.js';
import InterviewDetailCard from '../components/organisms/InterviewDetailCard/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useAction from '../hooks/useAction.js';
import {
  interviewerActions,
  useAssignedInterviews,
  useInterviewDetail,
} from '../hooks/useInterviewerWorkspace.js';
import { formatDate } from '../utils/format.js';

export default function InterviewerWorkspacePage() {
  const { account } = useDemoSession();
  const assigned = useAssignedInterviews();
  const [chosenId, setChosenId] = useState(null);
  const [message, setMessage] = useState(null);
  const action = useAction();
  const interviews = assigned.data?.interviews ?? [];
  const selectedId = interviews.some((item) => item.interviewId === chosenId)
    ? chosenId
    : (interviews[0]?.interviewId ?? null);
  const detail = useInterviewDetail(selectedId);
  // Never show (or submit for) the previous interview while the newly selected one loads.
  const current = detail.data && detail.data.interviewId === selectedId ? detail.data : null;
  const interviewDate = assigned.data?.interviewDate;
  const campaignName = assigned.data?.campaignName;

  const heading = {
    eyebrow: 'Không gian phỏng vấn · CLB Công nghệ & Sáng tạo',
    title: SCREEN_LABELS.interviewerWorkspace,
    description: 'Xem các buổi phỏng vấn được phân công cho bạn và gửi đánh giá sau phỏng vấn.',
    actions: account ? (
      <Badge tone="info">{`${account.displayName} · ${account.description}`}</Badge>
    ) : null,
    context: campaignName
      ? `${campaignName}${interviewDate ? ` · Phỏng vấn ${formatDate(interviewDate)}` : ''}`
      : null,
  };

  if (assigned.status !== 'success') {
    return (
      <MainTemplate {...heading}>
        <AsyncContent status={assigned.status} error={assigned.error} onRetry={assigned.reload} />
      </MainTemplate>
    );
  }

  if (interviews.length === 0) {
    return (
      <MainTemplate {...heading}>
        <EmptyState title="Chưa có buổi phỏng vấn nào được phân công cho bạn">
          <p>
            Khi Ban tuyển dụng xác nhận lịch phỏng vấn, các buổi của bạn sẽ hiển thị tại đây. Bạn
            không thể xem lịch của người phỏng vấn khác.
          </p>
        </EmptyState>
      </MainTemplate>
    );
  }

  const done = interviews.filter((item) => item.assessmentStatus === 'submitted').length;

  async function openCv(applicationId) {
    const result = await action.run(() => interviewerActions.downloadCv(applicationId));
    if (!result.ok) {
      setMessage({ tone: 'error', title: 'Chưa mở được CV', text: result.error?.message });
      return;
    }
    const url = URL.createObjectURL(result.value);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function submitAssessment(id, values) {
    const result = await action.run(() => interviewerActions.submitAssessment(id, values));
    if (result.ok) {
      setMessage({
        tone: 'success',
        title: 'Đã gửi đánh giá',
        text: 'Mỗi buổi phỏng vấn chỉ có một đánh giá. Quyết định Pass/Fail do Ban tuyển dụng ghi nhận ở màn hình Application Review, không phải ở đây.',
      });
      assigned.reload();
      detail.reload();
    }
    return result;
  }

  return (
    <MainTemplate {...heading}>
      <div className="stack stack--roomy">
        <section aria-label="Tổng quan phỏng vấn của bạn">
          <div className="stats-grid">
            <StatCard value={interviews.length} label="Phỏng vấn được phân công" />
            <StatCard value={done} label="Đã đánh giá" />
            <StatCard value={interviews.length - done} label="Chờ đánh giá" />
            <StatCard value={formatDate(interviewDate)} label="Ngày phỏng vấn" />
          </div>
        </section>

        <Card
          title="Assigned Interviews"
          subtitle={`Chỉ gồm lịch đã Confirmed và được phân công cho ${account?.displayName ?? 'bạn'}. Ghi chú sàng lọc nội bộ của Ban tuyển dụng không hiển thị ở đây.`}
        >
          <div className="stack">
            <AssignedInterviewsTable
              interviews={interviews}
              selectedId={selectedId}
              onSelect={(id) => {
                setChosenId(id);
                setMessage(null);
              }}
            />
            <p className="hint">
              Bạn chỉ thấy các buổi được phân công cho mình; máy chủ từ chối truy cập buổi phỏng vấn
              của người khác.
            </p>
          </div>
        </Card>

        {message ? (
          <Alert tone={message.tone} title={message.title} live>
            <p>{message.text}</p>
          </Alert>
        ) : null}

        {current ? (
          <div className="two-column">
            <InterviewDetailCard
              interview={current}
              onOpenCv={() => openCv(current.applicationId)}
              cvPending={action.pending}
            />
            <AssessmentForm
              key={current.interviewId}
              interview={current}
              onSubmit={submitAssessment}
            />
          </div>
        ) : (
          <AsyncContent
            status={detail.status === 'error' ? 'error' : 'loading'}
            error={detail.error}
            onRetry={detail.reload}
          />
        )}
      </div>
    </MainTemplate>
  );
}
