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
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { SCREEN_LABELS } from '../constants/labels.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useAction from '../hooks/useAction.js';
import useCampaign from '../hooks/useCampaign.js';
import { applicationActions, useApplicationDetail, useApplications } from '../hooks/useApplications.js';
import { ROUTES, TAB_QUERY_PARAM } from '../routes/paths.js';
import { downloadText } from '../utils/csv.js';
import { formatDate } from '../utils/format.js';

const TABS = [
  { id: 'screening', label: 'CV Screening', marker: 'A' },
  { id: 'results', label: 'Final Results', marker: 'B' },
];

const INITIAL_QUERY = { search: '', positionId: '', status: '', sort: 'newest', page: 1 };

function ScreeningPanel() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [selectedId, setSelectedId] = useState(null);
  const [focusDetail, setFocusDetail] = useState(false);
  const [message, setMessage] = useState(null);
  const [exportMessage, setExportMessage] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const overview = useApplications(query);
  const detail = useApplicationDetail(selectedId);
  const action = useAction();

  if (overview.status !== 'success') {
    return <AsyncContent status={overview.status} error={overview.error} onRetry={overview.reload} />;
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
    const result = await action.run(() => applicationActions.saveNote(selectedId, note));
    setMessage(
      result.ok
        ? { tone: 'success', title: 'Đã lưu ghi chú nội bộ (mô phỏng)' }
        : { tone: 'error', title: 'Chưa lưu được ghi chú', text: result.error?.message },
    );
  }

  async function decide(status) {
    setRejectOpen(false);
    const result = await action.run(() => applicationActions.setScreening(selectedId, status));
    if (result.ok) {
      setMessage({
        tone: 'success',
        title: status === 'shortlisted' ? `${selectedId} đã qua vòng CV` : `${selectedId} đã bị loại ở vòng CV`,
        text: 'Quyết định chỉ áp dụng cho hồ sơ này.',
      });
      overview.reload();
      detail.reload();
    } else {
      setMessage({ tone: 'error', title: 'Chưa ghi nhận được quyết định', text: result.error?.message });
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
        positions={overview.data.positions}
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
          detail.status === 'success' && detail.data ? (
            <ApplicationDetail
              key={detail.data.id}
              detail={detail.data}
              pending={action.pending}
              message={message}
              focusOnMount={focusDetail}
              onSaveNote={saveNote}
              onShortlist={() => decide('shortlisted')}
              onReject={() => setRejectOpen(true)}
              onClose={() => {
                setSelectedId(null);
                setMessage(null);
              }}
            />
          ) : (
            <AsyncContent status={detail.status} error={detail.error} onRetry={detail.reload} />
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
        open={rejectOpen}
        title={`Loại hồ sơ ${selectedId ?? ''}?`}
        confirmLabel="Loại hồ sơ"
        tone="danger"
        busy={action.pending}
        onConfirm={() => decide('rejected')}
        onCancel={() => setRejectOpen(false)}
      >
        <p>Hồ sơ sẽ kết thúc ở vòng CV và không được xếp lịch phỏng vấn. Quyết định chỉ áp dụng cho hồ sơ này.</p>
      </ConfirmDialog>
    </div>
  );
}

function ResultsPanel() {
  return (
    <EmptyState title="Final Results" headingLevel={2}>
      <p>Tab kết quả cuối đang được hoàn thiện.</p>
    </EmptyState>
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
        {tab === 'screening' ? <ScreeningPanel key={dataVersion} /> : <ResultsPanel key={dataVersion} />}
      </div>
    </MainTemplate>
  );
}
