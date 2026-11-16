import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/atoms/Button/index.js';
import Alert from '../components/molecules/Alert/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import Card from '../components/molecules/Card/index.js';
import EmptyState from '../components/molecules/EmptyState/index.js';
import Pagination from '../components/molecules/Pagination/index.js';
import StatCard from '../components/molecules/StatCard/index.js';
import Tabs from '../components/molecules/Tabs/index.js';
import ApplicationDetail from '../components/organisms/ApplicationDetail/index.js';
import ApplicationFilters from '../components/organisms/ApplicationFilters/index.js';
import ApplicationList from '../components/organisms/ApplicationList/index.js';
import ConfirmDialog from '../components/organisms/ConfirmDialog/index.js';
import FinalDecisionPanel from '../components/organisms/FinalDecisionPanel/index.js';
import FinalResultsTable from '../components/organisms/FinalResultsTable/index.js';
import PublishResultsCard from '../components/organisms/PublishResultsCard/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useAction from '../hooks/useAction.js';
import useCampaign from '../hooks/useCampaign.js';
import { resultActions, useAssessment, useFinalResults } from '../hooks/useFinalResults.js';
import { applicationActions, useApplicationDetail, useApplications } from '../hooks/useApplications.js';
import { ROUTES, TAB_QUERY_PARAM } from '../routes/paths.js';
import { downloadText } from '../utils/csv.js';
import { formatDate } from '../utils/format.js';

const TABS = [
  { id: 'screening', label: 'CV Screening', marker: 'A' },
  { id: 'results', label: 'Final Results', marker: 'B' },
];

const INITIAL_QUERY = { search: '', positionId: '', status: '', sort: 'newest', page: 1 };

/** `campaign` is the page's single useCampaign() resource (positions for the filter). */
function ScreeningPanel({ campaign }) {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [selectedId, setSelectedId] = useState(null);
  const [focusDetail, setFocusDetail] = useState(false);
  const [message, setMessage] = useState(null);
  const [exportMessage, setExportMessage] = useState(null);
  // Pin both the application and decision while confirmation is open. A later
  // selection must never retarget an irreversible action (Q-06).
  const [confirming, setConfirming] = useState(null);
  const overview = useApplications(query);
  const detail = useApplicationDetail(selectedId);
  const action = useAction();
  // Never show (or act on) the previous application while the newly selected one loads.
  const current = detail.data && detail.data.id === selectedId ? detail.data : null;

  if (campaign.status !== 'success' || overview.status !== 'success') {
    const failed = [campaign, overview].filter((resource) => resource.status === 'error');
    // One retry reloads every request that failed.
    const retry = () => failed.forEach((resource) => resource.reload());
    return <AsyncContent status={failed.length > 0 ? 'error' : 'loading'} error={failed[0]?.error} onRetry={retry} />;
  }

  const { list, stats } = overview.data;
  const filtered = stats.isFiltered;
  const first = list.total === 0 ? 0 : (list.page - 1) * list.pageSize + 1;
  const last = Math.min(list.page * list.pageSize, list.total);

  function updateQuery(change) {
    setQuery((previous) => ({ ...previous, ...change, page: change.page ?? 1 }));
  }

  function select(id) {
    setSelectedId(id);
    setMessage(null);
    setFocusDetail(true);
  }

  async function saveNote(note) {
    const id = current.id;
    const result = await action.run(() => applicationActions.saveNote(id, note));
    setMessage(
      result.ok
        ? { applicationId: id, tone: 'success', title: 'Đã lưu ghi chú nội bộ (mô phỏng)' }
        : { applicationId: id, tone: 'error', title: 'Chưa lưu được ghi chú', text: result.error?.message },
    );
  }

  async function decide(target) {
    setConfirming(null);
    const { id, status } = target;
    const result = await action.run(() => applicationActions.setScreening(id, status));
    if (result.ok) {
      setMessage({
        applicationId: id,
        tone: 'success',
        title: status === 'shortlisted' ? `${id} đã qua vòng CV` : `${id} đã bị loại ở vòng CV`,
        text: 'Quyết định chỉ áp dụng cho hồ sơ này và không thể thay đổi.',
      });
      overview.reload();
      detail.reload();
    } else {
      setMessage({ applicationId: id, tone: 'error', title: 'Chưa ghi nhận được quyết định', text: result.error?.message });
    }
  }

  async function exportCsv() {
    const result = await action.run(() => applicationActions.exportCsv(query));
    if (result.ok) {
      downloadText(result.value.fileName, result.value.content);
      setExportMessage({
        tone: 'success',
        title: `Đã xuất ${result.value.rowCount} hồ sơ ${filtered ? 'theo bộ lọc hiện tại' : 'của chiến dịch'} (mô phỏng)`,
        text: 'Tệp CSV không gồm ghi chú nội bộ và tệp CV.',
      });
    } else {
      setExportMessage({ tone: 'error', title: 'Chưa xuất được CSV', text: result.error?.message });
    }
  }

  const { campaign: totals } = stats;
  const hasApplications = totals.applications > 0;

  return (
    <div className="stack stack--roomy">
      <section className="stack stack--tight" aria-label="Thống kê hồ sơ toàn chiến dịch">
        <div className="stats-grid">
          <StatCard value={totals.applications} label="Tổng hồ sơ" />
          <StatCard value={totals.applicants} label="Ứng viên riêng biệt" />
          <StatCard value={totals.shortlisted} label="Qua vòng CV" />
          <StatCard value={`${totals.pendingReview} + ${totals.rejected}`} label="Chờ duyệt + Loại" />
        </div>
        <p className="hint">
          Số liệu toàn chiến dịch. Một ứng viên có thể nộp nhiều hồ sơ cho các vị trí khác nhau.
        </p>
      </section>

      <ApplicationFilters
        query={query}
        positions={campaign.data.positions}
        onChange={updateQuery}
        onExport={exportCsv}
        exporting={action.pending}
      />
      {exportMessage ? (
        <Alert tone={exportMessage.tone} title={exportMessage.title} live>
          <p>{exportMessage.text}</p>
        </Alert>
      ) : null}

      <div className={selectedId ? 'split-layout' : 'stack'}>
        <Card
          title={`Hồ sơ · đang hiển thị ${first}–${last} / ${list.total}`}
          subtitle={
            filtered
              ? `Theo bộ lọc: ${stats.filtered.applications} hồ sơ · ${stats.filtered.applicants} ứng viên riêng biệt.`
              : `Toàn chiến dịch · ${list.pageCount} trang, ${list.pageSize} hồ sơ mỗi trang.`
          }
        >
          {list.total === 0 ? (
            hasApplications ? (
              <EmptyState
                title="Không có hồ sơ phù hợp bộ lọc"
                headingLevel={3}
                actions={
                  <Button variant="secondary" onClick={() => setQuery(INITIAL_QUERY)}>
                    Xóa bộ lọc
                  </Button>
                }
              />
            ) : (
              <EmptyState title="Chưa có hồ sơ nào" headingLevel={3}>
                <p>Hồ sơ sẽ xuất hiện khi chiến dịch được công bố và ứng viên nộp hồ sơ trong thời gian nhận đơn.</p>
              </EmptyState>
            )
          ) : (
            <>
              <ApplicationList items={list.items} selectedId={selectedId} onSelect={select} />
              <Pagination
                label="Phân trang hồ sơ"
                page={list.page}
                pageCount={list.pageCount}
                onChange={(page) => updateQuery({ page })}
              />
            </>
          )}
        </Card>

        {selectedId ? (
          current ? (
            <ApplicationDetail
              key={current.id}
              detail={current}
              pending={action.pending}
              message={message?.applicationId === current.id ? message : null}
              focusOnMount={focusDetail}
              onSaveNote={saveNote}
              onShortlist={() => setConfirming({ id: current.id, status: 'shortlisted' })}
              onReject={() => setConfirming({ id: current.id, status: 'rejected' })}
              onClose={() => {
                setSelectedId(null);
                setMessage(null);
              }}
            />
          ) : (
            <AsyncContent status={detail.status === 'error' ? 'error' : 'loading'} error={detail.error} onRetry={detail.reload} />
          )
        ) : null}
      </div>

      {hasApplications ? (
        <Alert tone="info">
          <p>
            <strong>
              {totals.shortlisted} hồ sơ đã qua vòng CV; {totals.pendingReview} hồ sơ vẫn chờ duyệt.
            </strong>{' '}
            “Qua vòng CV” chỉ nghĩa là đủ điều kiện được đưa vào lịch nháp, chưa phải kết quả tuyển cuối.
          </p>
          {totals.shortlisted > 0 ? (
            <Button to={ROUTES.EXECUTIVE_SCHEDULING}>Tiếp tục tới Interview Scheduling →</Button>
          ) : null}
        </Alert>
      ) : null}

      <ConfirmDialog
        open={confirming?.status === 'shortlisted'}
        title={`Cho hồ sơ ${confirming?.id ?? ''} qua vòng CV?`}
        confirmLabel="Shortlist Candidate"
        busy={action.pending}
        onConfirm={() => decide(confirming)}
        onCancel={() => setConfirming(null)}
      >
        <p>
          Hồ sơ sẽ đủ điều kiện được xếp lịch phỏng vấn; đây chưa phải kết quả tuyển cuối. Quyết định chỉ áp dụng cho hồ
          sơ này.
        </p>
        <p>
          <strong>Quyết định vòng CV đã lưu không thể thay đổi hay hoàn tác.</strong>
        </p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirming?.status === 'rejected'}
        title={`Loại hồ sơ ${confirming?.id ?? ''}?`}
        confirmLabel="Loại hồ sơ"
        tone="danger"
        busy={action.pending}
        onConfirm={() => decide(confirming)}
        onCancel={() => setConfirming(null)}
      >
        <p>Hồ sơ sẽ kết thúc ở vòng CV và không được xếp lịch phỏng vấn. Quyết định chỉ áp dụng cho hồ sơ này.</p>
        <p>
          <strong>Quyết định vòng CV đã lưu không thể thay đổi hay hoàn tác.</strong>
        </p>
      </ConfirmDialog>
    </div>
  );
}

function ResultsPanel() {
  const results = useFinalResults();
  const [chosenId, setChosenId] = useState(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [decisionMessage, setDecisionMessage] = useState(null);
  const [publishMessage, setPublishMessage] = useState(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const action = useAction();
  const rows = results.data?.rows ?? [];
  const selected = rows.find((row) => row.applicationId === chosenId) ?? rows[0] ?? null;
  const assessment = useAssessment(selected?.applicationId, assessmentOpen && selected?.assessmentStatus === 'submitted');

  if (results.status !== 'success') {
    return <AsyncContent status={results.status} error={results.error} onRetry={results.reload} />;
  }

  const { scheduleConfirmed, interviewDate, rejectedIds } = results.data;
  if (!scheduleConfirmed) {
    return (
      <EmptyState
        title="Chưa có lịch phỏng vấn đã xác nhận"
        actions={<Button to={ROUTES.EXECUTIVE_SCHEDULING}>Mở Interview Scheduling →</Button>}
      >
        <p>
          Final Results là giai đoạn sau phỏng vấn. Danh sách chỉ xuất hiện sau khi lịch được xác nhận và buổi phỏng vấn
          diễn ra.
        </p>
      </EmptyState>
    );
  }

  const pendingIds = rows.filter((row) => row.decision && !row.publishedAt).map((row) => row.applicationId);

  function select(id) {
    setChosenId(id);
    setAssessmentOpen(false);
    setDecisionMessage(null);
  }

  async function record(decision) {
    const id = selected.applicationId;
    const result = await action.run(() => resultActions.record(id, decision));
    if (result.ok) {
      setDecisionMessage({
        tone: 'success',
        title: `Đã ghi nhận ${decision === 'pass' ? 'Pass' : 'Fail'} cho ${id} (mô phỏng)`,
        text: 'Kết quả chưa hiển thị cho ứng viên cho đến khi được công bố.',
      });
      results.reload();
    } else {
      setDecisionMessage({ tone: 'error', title: 'Chưa ghi nhận được quyết định', text: result.error?.message });
    }
  }

  async function publish() {
    const result = await action.run(() => resultActions.publishRecorded());
    setPublishOpen(false);
    if (result.ok) {
      setPublishMessage({
        tone: 'success',
        title: `Đã công bố ${result.value.publishedIds.join(', ')} (mô phỏng)`,
        text: 'Mỗi hồ sơ tạo một thông báo trong ứng dụng cho ứng viên tương ứng. Không có email, SMS hay push.',
      });
      results.reload();
    } else {
      setPublishMessage({ tone: 'error', title: 'Chưa công bố được kết quả', text: result.error?.message });
    }
  }

  return (
    <div className="stack stack--roomy">
      <Alert tone="info" title="Final Results là giai đoạn sau phỏng vấn">
        <p>
          “Qua vòng CV” không có nghĩa là Pass. Mỗi quyết định thuộc về từng hồ sơ riêng, nên cùng một ứng viên có thể có
          kết quả khác nhau ở các vị trí.
          {rejectedIds.length > 0 ? ` ${rejectedIds.join(' và ')} bị loại ở vòng CV nên không nằm trong danh sách này.` : ''}
        </p>
      </Alert>
      <Card
        title="Kết quả cuối theo hồ sơ"
        subtitle={`Chỉ gồm hồ sơ Qua vòng CV đã có lịch phỏng vấn Confirmed ngày ${formatDate(interviewDate)}.`}
      >
        <FinalResultsTable rows={rows} selectedId={selected?.applicationId} onSelect={select} />
      </Card>
      {selected ? (
        <div className="split-layout split-layout--wide-first">
          <FinalDecisionPanel
            row={selected}
            assessment={assessment}
            assessmentOpen={assessmentOpen}
            onToggleAssessment={() => setAssessmentOpen((open) => !open)}
            onRecord={record}
            pending={action.pending}
            message={decisionMessage}
          />
          <PublishResultsCard
            pendingIds={pendingIds}
            onPublish={() => setPublishOpen(true)}
            pending={action.pending}
            message={publishMessage}
          />
        </div>
      ) : null}
      <ConfirmDialog
        open={publishOpen}
        title="Công bố kết quả?"
        confirmLabel="Publish Results"
        busy={action.pending}
        onConfirm={publish}
        onCancel={() => setPublishOpen(false)}
      >
        <p>
          Công bố {pendingIds.join(', ')}. Ứng viên sẽ thấy kết quả và nhận thông báo trong ứng dụng; kết quả đã công bố
          không thể thay đổi.
        </p>
      </ConfirmDialog>
    </div>
  );
}

export default function ApplicationReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataVersion } = useDemoSession();
  const campaignResource = useCampaign();
  const tab = TABS.some((item) => item.id === searchParams.get(TAB_QUERY_PARAM))
    ? searchParams.get(TAB_QUERY_PARAM)
    : 'screening';
  const campaign = campaignResource.data?.campaign;

  return (
    <MainTemplate
      eyebrow="Bước 2 / 3 · CLB Công nghệ & Sáng tạo"
      title={SCREEN_LABELS.applicationReview}
      description="Duyệt độc lập từng hồ sơ của cùng một chiến dịch."
      actions={
        <Button variant="secondary" to={ROUTES.EXECUTIVE_CAMPAIGN}>
          ← Về chiến dịch
        </Button>
      }
      context={campaign ? `${campaign.name} · Đóng đơn ${formatDate(campaign.closesOn)}` : null}
      step={2}
    >
      <Tabs
        idPrefix="review"
        label="Các phần của Application Review"
        tabs={TABS}
        value={tab}
        onChange={(id) => setSearchParams({ [TAB_QUERY_PARAM]: id }, { replace: true })}
      />
      <div role="tabpanel" id={`review-panel-${tab}`} aria-labelledby={`review-tab-${tab}`}>
        {tab === 'screening' ? <ScreeningPanel key={dataVersion} campaign={campaignResource} /> : <ResultsPanel key={dataVersion} />}
      </div>
    </MainTemplate>
  );
}
