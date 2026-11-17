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
    expect(screen.getByText('Hà My · User Experience Design', { ignore: 'option' })).toBeInTheDocument();
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
    expect(screen.getByText('Đề xuất của bạn · chỉ để tham khảo').nextSibling).toHaveTextContent('Đề xuất Pass');
    expect(screen.getByRole('button', { name: 'Submit Assessment' })).toBeDisabled();
    // Read-only: no field is offered for editing or re-submitting.
    expect(screen.queryByLabelText('Nhận xét phỏng vấn')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('offers only notes and an optional Pass/Fail recommendation: no scores or criteria (Q-04)', async () => {
    await openAs('iv-hamy');
    fireEvent.click(await screen.findByRole('button', { name: 'Chọn CF-030 · Phạm Quốc Bảo' }));
    await screen.findByRole('heading', { name: 'CF-030 · Phạm Quốc Bảo' });

    const group = screen.getByRole('group', { name: 'Đề xuất của người phỏng vấn (không bắt buộc)' });
    expect(within(group).getAllByRole('radio').map((radio) => radio.parentElement.textContent)).toEqual([
      'Không nêu đề xuất',
      'Đề xuất Pass',
      'Đề xuất Fail',
    ]);
    expect(within(group).getByRole('radio', { name: 'Không nêu đề xuất' })).toBeChecked();
    expect(within(group).getByText(/không phải kết quả cuối\. Chỉ Ban tuyển dụng ghi nhận và công bố Pass\/Fail/)).toBeInTheDocument();
    const form = group.closest('form');
    expect(within(form).getAllByRole('textbox')).toHaveLength(1);
    expect(within(form).queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(within(form).queryByRole('combobox')).not.toBeInTheDocument();
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

    // Notes are required; the recommendation is not.
    fireEvent.click(submit);
    expect(screen.getByText('Vui lòng nhập nhận xét phỏng vấn.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nhận xét phỏng vấn')).toHaveFocus();

    fireEvent.change(screen.getByLabelText('Nhận xét phỏng vấn'), { target: { value: 'Tư duy thiết kế tốt.' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Đề xuất Fail' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Assessment' }));

    // Submitting is final, so it is confirmed first; cancelling keeps the draft text (Q-06).
    let dialog = await screen.findByRole('dialog', { name: 'Gửi đánh giá cho CF-030?' });
    expect(within(dialog).getByText('Sau khi gửi, đánh giá không thể sửa hay gửi lại.')).toBeInTheDocument();
    expect(within(dialog).getByText('Đề xuất Fail')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nhận xét phỏng vấn')).toHaveValue('Tư duy thiết kế tốt.');

    fireEvent.click(screen.getByRole('button', { name: 'Submit Assessment' }));
    dialog = await screen.findByRole('dialog', { name: 'Gửi đánh giá cho CF-030?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Gửi đánh giá' }));

    expect(await screen.findByText('Đã gửi đánh giá (mô phỏng)')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit Assessment' })).toBeDisabled());
    expect(screen.getByText('Tư duy thiết kế tốt.')).toBeInTheDocument();
    expect(screen.getByText('Đề xuất của bạn · chỉ để tham khảo').nextSibling).toHaveTextContent('Đề xuất Fail');
  });

  it('submits an assessment with notes only, without a recommendation (Q-04)', async () => {
    await openAs('iv-hamy');
    fireEvent.click(await screen.findByRole('button', { name: 'Chọn CF-030 · Phạm Quốc Bảo' }));
    await screen.findByRole('heading', { name: 'CF-030 · Phạm Quốc Bảo' });

    fireEvent.change(screen.getByLabelText('Nhận xét phỏng vấn'), { target: { value: 'Trả lời rõ ràng.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Assessment' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Gửi đánh giá' }));

    expect(await screen.findByText('Đã gửi đánh giá (mô phỏng)')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Đề xuất của bạn · chỉ để tham khảo').nextSibling).toHaveTextContent('Không nêu đề xuất'),
    );
  });

  it('cancels an assessment confirmation when another interview is selected', async () => {
    await openAs('iv-hamy');
    fireEvent.click(await screen.findByRole('button', { name: 'Chọn CF-030 · Phạm Quốc Bảo' }));
    await screen.findByRole('heading', { name: 'CF-030 · Phạm Quốc Bảo' });
    fireEvent.change(screen.getByLabelText('Nhận xét phỏng vấn'), { target: { value: 'Bản nháp cho CF-030.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Assessment' }));
    await screen.findByRole('dialog', { name: 'Gửi đánh giá cho CF-030?' });

    fireEvent.click(screen.getByRole('button', { name: 'Chọn CF-026 · Nguyễn Minh Anh' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'CF-026 · Nguyễn Minh Anh' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Chọn CF-030 · Phạm Quốc Bảo' }));
    await screen.findByRole('heading', { name: 'CF-030 · Phạm Quốc Bảo' });
    expect(screen.getByRole('button', { name: 'Submit Assessment' })).toBeEnabled();
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
