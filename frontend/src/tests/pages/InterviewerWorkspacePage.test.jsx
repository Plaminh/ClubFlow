import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as applicationService from '../../services/applicationService.js';
import * as demoSessionService from '../../services/demoSessionService.js';
import * as scheduleService from '../../services/scheduleService.js';
import { renderApp } from '../helpers/renderApp.jsx';

const PATH = '/interviewer';

async function openAs(accountId, scenarioId = 'confirmed') {
  renderApp(PATH, { accountId, scenarioId });
  await screen.findByRole('heading', { level: 2, name: /Assigned Interviews|Chưa có buổi phỏng vấn/ });
}

const rowIds = () =>
  within(screen.getByRole('table', { name: 'Các buổi phỏng vấn được phân công' }))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);

describe('Interviewer Workspace', () => {
  it('lists only the signed-in interviewer’s confirmed interviews', async () => {
    await openAs('iv-hamy');

    expect(rowIds()).toEqual(['CF-026', 'CF-030']);
    expect(screen.getByText('Hà My · User Experience Design')).toBeInTheDocument();
  });

  it('shows the campaign context without the Executive-only campaign request', async () => {
    await openAs('iv-hamy');

    expect(screen.getByText(/· Phỏng vấn 05\/11\/2026/)).toBeInTheDocument();
  });

  it('never shows Executive-only screening notes', async () => {
    await openAs('iv-hamy');
    await screen.findByRole('heading', { name: 'CF-026 · Nguyễn Minh Anh' });

    expect(screen.queryByText(/Có kinh nghiệm nghiên cứu người dùng/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ghi chú nội bộ/)).not.toBeInTheDocument();
  });

  it('shows a submitted assessment as read-only', async () => {
    await openAs('iv-hamy');

    expect(await screen.findByText('Đã gửi đánh giá')).toBeInTheDocument();
    expect(screen.getByText('Đề xuất tiếp nhận')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Assessment' })).toBeDisabled();
  });

  it('validates and submits one assessment for a completed interview', async () => {
    await openAs('iv-hamy');
    await screen.findByText('Đã gửi đánh giá');
    fireEvent.click(screen.getByRole('button', { name: 'Chọn CF-030 · Phạm Quốc Bảo' }));

    // Until CF-030 has loaded, CF-026's panel (and its form) must not stay on screen.
    expect(screen.queryByText('Đã gửi đánh giá')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CF-026 · Nguyễn Minh Anh' })).not.toBeInTheDocument();

    await screen.findByRole('heading', { name: 'CF-030 · Phạm Quốc Bảo' });
    const submit = screen.getByRole('button', { name: 'Submit Assessment' });

    fireEvent.click(submit);
    expect(screen.getByText('Vui lòng nhập nhận xét phỏng vấn.')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn đánh giá tổng thể.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nhận xét phỏng vấn')).toHaveFocus();

    fireEvent.change(screen.getByLabelText('Nhận xét phỏng vấn'), { target: { value: 'Tư duy thiết kế tốt.' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Cần cân nhắc' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Assessment' }));

    expect(await screen.findByText('Đã gửi đánh giá (mô phỏng)')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit Assessment' })).toBeDisabled());
    expect(screen.getByText('Tư duy thiết kế tốt.')).toBeInTheDocument();
  });

  it('keeps the form locked for an interview that has not happened yet', async () => {
    await demoSessionService.signIn('exec-recruitment');
    await applicationService.setScreening('CF-028', 'rejected');
    await scheduleService.updateRow('CF-027', { start: '2026-11-05T09:15:00+07:00', interviewerId: 'iv-giahuy', roomId: 'room-b105' });
    await scheduleService.updateRow('CF-031', { start: '2026-11-05T09:00:00+07:00', interviewerId: 'iv-giahuy', roomId: 'room-b105' });
    await scheduleService.confirm();

    await openAs('iv-giahuy', 'screening');

    expect(rowIds()).toEqual(['CF-031', 'CF-027']);
    expect(await screen.findByText('Chưa thể đánh giá')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Assessment' })).toBeDisabled();
  });

  it('shows an empty state before any schedule is confirmed', async () => {
    await openAs('iv-hamy', 'screening');

    expect(screen.getByText('Chưa có buổi phỏng vấn nào được phân công cho bạn')).toBeInTheDocument();
  });

  it('shows a restricted state to other demo roles', async () => {
    renderApp(PATH, { accountId: 'ap-minhanh', scenarioId: 'confirmed' });

    expect(await screen.findByText('Màn hình này dành cho Người phỏng vấn')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
