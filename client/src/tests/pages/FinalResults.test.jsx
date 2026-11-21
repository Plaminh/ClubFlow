import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getMockApiState } from '../helpers/mockApi.js';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';

const PATH = '/executive/review?tab=results';

async function openResults(scenarioId = 'confirmed') {
  renderApp(PATH, { accountId: EXECUTIVE, scenarioId });
  await screen.findByRole('tab', { name: /Final Results/, selected: true });
}

const resultRows = () =>
  within(screen.getByRole('table', { name: 'Kết quả cuối theo hồ sơ' }))
    .getAllByRole('row')
    .slice(1);

describe('Application Review — Final Results', () => {
  it('lists only shortlisted applications with confirmed interviews; CV-rejected ones are excluded', async () => {
    await openResults();
    await screen.findByRole('heading', { name: 'Kết quả cuối theo hồ sơ' });

    expect(
      resultRows().map(
        (row) => within(row).getAllByRole('cell')[0].querySelector('strong').textContent,
      ),
    ).toEqual(['CF-026', 'CF-027', 'CF-030', 'CF-031']);
    expect(screen.getByText(/CF-028 và CF-029 bị loại ở vòng CV/)).toBeInTheDocument();
    expect(screen.getByText(/“Qua vòng CV” không có nghĩa là Pass/)).toBeInTheDocument();
  });

  it('shows assessment and publication status per application', async () => {
    await openResults();
    const [cf026, cf027, cf030] = await waitFor(() => resultRows());

    expect(within(cf026).getByText('Đã gửi')).toBeInTheDocument();
    expect(within(cf026).getByText('Pass')).toBeInTheDocument();
    expect(within(cf026).getByText('Đã công bố')).toBeInTheDocument();
    expect(within(cf027).getByText('Fail')).toBeInTheDocument();
    expect(within(cf027).getByText('Chưa công bố')).toBeInTheDocument();
    expect(within(cf030).getByText('Chờ đánh giá')).toBeInTheDocument();
    expect(within(cf030).getByText('Chưa ghi nhận')).toBeInTheDocument();
  });

  it('views the interviewer assessment as advisory information', async () => {
    await openResults();
    fireEvent.click(await screen.findByRole('button', { name: 'Mở CF-027 · Nguyễn Minh Anh' }));
    const toggle = screen.getByRole('button', { name: 'View Assessment' });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const assessment = (
      await screen.findByText('Đánh giá của người phỏng vấn · chỉ để tham khảo')
    ).closest('.panel-subtle');
    // CF-027 has notes but no recommendation; the Executive recorded Fail on their own.
    expect(within(assessment).getByText(/Ý tưởng nội dung còn chung chung/)).toBeInTheDocument();
    expect(
      within(assessment).getByText('Đề xuất của người phỏng vấn:').parentElement,
    ).toHaveTextContent('Không nêu đề xuất');
    expect(within(assessment).getByText(/Đề xuất không phải kết quả cuối/)).toBeInTheDocument();
  });

  it('keeps the interviewer recommendation visually apart from the Executive final decision (Q-04)', async () => {
    await openResults();
    await screen.findByRole('heading', { name: 'CF-026 · Nguyễn Minh Anh' });
    fireEvent.click(screen.getByRole('button', { name: 'View Assessment' }));

    const assessment = (
      await screen.findByText('Đánh giá của người phỏng vấn · chỉ để tham khảo')
    ).closest('.panel-subtle');
    expect(
      within(assessment).getByText('Đề xuất của người phỏng vấn:').parentElement,
    ).toHaveTextContent('Đề xuất Pass');
    // The recommendation is plain text: Pass/Fail badges belong to the final decision only.
    expect(assessment.querySelector('.badge')).toBeNull();

    const decision = screen.getByText('Quyết định cuối của Ban tuyển dụng').parentElement;
    expect(within(decision).getByText('Pass', { selector: '.badge' })).toBeInTheDocument();
    expect(within(decision).getByText('Đã công bố · chỉ đọc')).toBeInTheDocument();
  });

  it('blocks Pass/Fail until an assessment exists and after publication', async () => {
    await openResults();
    fireEvent.click(await screen.findByRole('button', { name: 'Mở CF-030 · Phạm Quốc Bảo' }));
    expect(screen.getByRole('button', { name: 'Record Pass' })).toBeDisabled();
    expect(
      screen.getByText('Cần có đánh giá phỏng vấn trước khi ghi nhận quyết định.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mở CF-026 · Nguyễn Minh Anh' }));
    expect(screen.getByRole('button', { name: 'Record Fail' })).toBeDisabled();
    expect(screen.getByText('Kết quả đã công bố nên không thể thay đổi.')).toBeInTheDocument();
  });

  it('records a decision, publishes after confirmation, and notifies only that applicant', async () => {
    await openResults();
    fireEvent.click(await screen.findByRole('button', { name: 'Mở CF-027 · Nguyễn Minh Anh' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record Pass' }));
    expect(await screen.findByText('Đã ghi nhận Pass cho CF-027')).toBeInTheDocument();
    expect(
      await screen.findByText(/1 kết quả đã ghi nhận nhưng chưa công bố \(CF-027\)/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Publish Results' }));
    const dialog = await screen.findByRole('dialog', { name: 'Công bố kết quả?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publish Results' }));

    expect(await screen.findByText('Đã công bố CF-027')).toBeInTheDocument();
    expect(screen.queryByText(/mô phỏng/)).not.toBeInTheDocument();
    expect(await screen.findByText('Không có kết quả nào đang chờ công bố.')).toBeInTheDocument();

    // Notifications are created server-side, once per published application, only for its applicant.
    const notifications = getMockApiState().notifications;
    expect(
      notifications.filter((item) => item.applicationId === 'CF-027').map((item) => item.accountId),
    ).toEqual(['ap-minhanh']);
    expect(getMockApiState().results.find((item) => item.applicationId === 'CF-027')).toMatchObject(
      { decision: 'pass', publishedAt: expect.any(String) },
    );
  });

  it('explains that results start after schedule confirmation', async () => {
    await openResults('screening');

    expect(await screen.findByText('Chưa có lịch phỏng vấn đã xác nhận')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mở Interview Scheduling →' })).toHaveAttribute(
      'href',
      '/executive/scheduling',
    );
  });
});
