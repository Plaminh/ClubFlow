import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DemoSessionProvider } from '../../contexts/DemoSessionContext.jsx';
import AppRoutes from '../../routes/AppRoutes.jsx';
import { renderApp } from '../helpers/renderApp.jsx';
import {
  addMockApiApplication,
  sessionUserFor,
  setMockApiMode,
  setMockApiScenario,
} from '../helpers/mockApi.js';

const MINH_ANH = 'ap-minhanh';
const HAI_DANG = 'ap-haidang';

function pdf(name = 'cv-hai-dang.pdf', size = 300 * 1024, type = 'application/pdf') {
  return new File([new Uint8Array(size)], name, { type });
}

async function openTab(tab, options) {
  renderApp(`/?tab=${tab}`, options);
  await screen.findByRole('tab', { selected: true });
}

function fillValidForm({
  position = 'User Experience Design',
  sop = 'Em muốn tham gia câu lạc bộ.',
} = {}) {
  const positionSelect = screen.getByLabelText('Vị trí ứng tuyển');
  fireEvent.change(positionSelect, {
    target: { value: within(positionSelect).getByRole('option', { name: position }).value },
  });
  fireEvent.change(screen.getByLabelText('CV (PDF, tối đa 5 MB)'), { target: { files: [pdf()] } });
  fireEvent.change(screen.getByLabelText('Bài trình bày nguyện vọng (Statement of Purpose)'), {
    target: { value: sop },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: '09:00–10:00' }));
}

describe('Applicant Portal', () => {
  it('requests the public campaign once when a saved applicant session is restored', async () => {
    // No StrictMode here: its double effects would hide a real second request.
    window.sessionStorage.setItem(
      'clubflow.demoSession',
      JSON.stringify({ token: 'mock-token-studentA', user: sessionUserFor(MINH_ANH) }),
    );
    render(
      <MemoryRouter initialEntries={['/']}>
        <DemoSessionProvider>
          <AppRoutes />
        </DemoSessionProvider>
      </MemoryRouter>,
    );

    await screen.findByRole('tab', { selected: true });
    const campaignRequests = fetch.mock.calls.filter(([url]) =>
      String(url).includes('/campaigns/current'),
    );
    expect(campaignRequests).toHaveLength(1);
  });

  it('shows the public campaign to visitors and asks them to sign in to apply (BR-02)', async () => {
    renderApp('/', { scenarioId: 'accepting' });

    await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' });
    expect(
      await screen.findByText('Đang nhận hồ sơ', { selector: '.alert__title' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Digital Product' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply Now' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('keeps private tabs behind the demo sign-in', async () => {
    await openTab('mine', { scenarioId: 'accepting' });

    expect(screen.getByText('Đăng nhập để xem hồ sơ của bạn')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Notifications/ }));
    expect(screen.getByText('Đăng nhập để xem thông báo')).toBeInTheDocument();
  });

  it('explains when applications are not open yet and disables the form', async () => {
    await openTab('apply', { scenarioId: 'before-open', accountId: HAI_DANG });

    expect(screen.getAllByText('Chưa mở nhận hồ sơ').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeDisabled();
  });

  it('hides a draft campaign from the public', async () => {
    renderApp('/', { scenarioId: 'draft' });

    expect(await screen.findByText('Chưa có chiến dịch đang được công bố')).toBeInTheDocument();
  });

  it('validates the form with specific messages and keeps valid input', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: HAI_DANG });
    fireEvent.change(screen.getByLabelText('Bài trình bày nguyện vọng (Statement of Purpose)'), {
      target: { value: 'Nội dung hợp lệ.' },
    });
    fireEvent.change(screen.getByLabelText('CV (PDF, tối đa 5 MB)'), {
      target: { files: [pdf('cv.docx', 1024, 'application/msword')] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Chưa thể gửi hồ sơ');
    expect(screen.getByText('Vui lòng chọn vị trí ứng tuyển.')).toBeInTheDocument();
    expect(screen.getByText('Tệp phải là PDF (.pdf).')).toBeInTheDocument();
    expect(screen.getByText('Chọn ít nhất một khung giờ có thể tham gia.')).toBeInTheDocument();
    expect(screen.getByLabelText('Bài trình bày nguyện vọng (Statement of Purpose)')).toHaveValue(
      'Nội dung hợp lệ.',
    );
    await waitFor(() => expect(screen.getByLabelText('Vị trí ứng tuyển')).toHaveFocus());
  });

  it('rejects a CV over 5 MB and counts SOP words up to the 300-word limit', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: HAI_DANG });
    const sop = screen.getByLabelText('Bài trình bày nguyện vọng (Statement of Purpose)');

    fireEvent.change(sop, { target: { value: Array(300).fill('từ').join(' ') } });
    expect(screen.getAllByText('300 / 300 từ').length).toBeGreaterThan(0);
    fireEvent.change(sop, { target: { value: Array(301).fill('từ').join(' ') } });
    expect(screen.getAllByText('301 / 300 từ').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('CV (PDF, tối đa 5 MB)'), {
      target: { files: [pdf('cv.pdf', 6 * 1024 * 1024)] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(screen.getByText('Bài trình bày dài 301 từ; tối đa 300 từ.')).toBeInTheDocument();
    expect(screen.getByText('CV tối đa 5 MB; tệp hiện tại 6,0 MB.')).toBeInTheDocument();
  });

  it('accepts the exact 5 MB PDF and 300-word boundaries', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: HAI_DANG });
    fillValidForm({ sop: Array(300).fill('từ').join(' ') });
    fireEvent.change(screen.getByLabelText('CV (PDF, tối đa 5 MB)'), {
      target: { files: [pdf('boundary.pdf', 5 * 1024 * 1024)] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(await screen.findByText('Đã gửi hồ sơ CF-032')).toBeInTheDocument();
  });

  it('submits a valid application that then appears in My Applications as Pending Review', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: HAI_DANG });
    fillValidForm();

    expect(
      screen.getByText(/sau khi gửi, bạn không thể sửa hồ sơ, đổi CV hay đổi khung giờ đã chọn/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(await screen.findByText('Đã gửi hồ sơ CF-032')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /My Applications/ }));
    const table = await screen.findByRole('table', { name: 'Hồ sơ của tôi' });
    expect(within(table).getByText('CF-032')).toBeInTheDocument();
    expect(within(table).getByText('Chờ duyệt')).toBeInTheDocument();
    // A submitted application is read-only for the applicant: no edit or withdraw action (Q-06).
    expect(within(table).queryByRole('button')).not.toBeInTheDocument();
    expect(within(table).queryByRole('link')).not.toBeInTheDocument();
  });

  it('points to the existing application instead of creating a duplicate (BR-05)', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: MINH_ANH });
    const positionSelect = screen.getByLabelText('Vị trí ứng tuyển');

    expect(
      within(positionSelect).getByRole('option', { name: 'User Experience Design (đã nộp)' }),
    ).toBeInTheDocument();
    fireEvent.change(positionSelect, { target: { value: 'pos-ux' } });

    expect(screen.getByText(/Bạn đã nộp hồ sơ CF-026 cho vị trí này/)).toBeInTheDocument();
  });

  it('shows the account faculty as the selected option, matching what is submitted', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: MINH_ANH });
    const faculty = screen.getByLabelText('Khoa');
    expect(faculty).toHaveValue('Information Technology');
    expect(faculty.selectedOptions[0]).toHaveTextContent('Information Technology');
  });

  it('handles a server-side 409 duplicate: keeps the input and links to the existing application', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: HAI_DANG });
    fillValidForm({ sop: 'Nội dung phải được giữ lại.' });
    // Another tab already submitted this position; this page does not know yet.
    addMockApiApplication({ id: 'CF-099', applicantId: HAI_DANG, positionId: 'pos-ux' });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(await screen.findByText('Hồ sơ cho vị trí này đã tồn tại')).toBeInTheDocument();
    expect(screen.getAllByText(/Bạn đã nộp hồ sơ CF-099 cho vị trí này/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Bài trình bày nguyện vọng (Statement of Purpose)')).toHaveValue(
      'Nội dung phải được giữ lại.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xem hồ sơ CF-099' }));
    const table = await screen.findByRole('table', { name: 'Hồ sơ của tôi' });
    expect(within(table).getByText('CF-099')).toBeInTheDocument();
  });

  it('tracks each application independently and never shows unconfirmed interviews or results (BR-08)', async () => {
    await openTab('mine', { scenarioId: 'screening', accountId: MINH_ANH });
    const table = await screen.findByRole('table', { name: 'Hồ sơ của tôi' });

    expect(within(table).getAllByText('Qua vòng CV')).toHaveLength(2);
    expect(within(table).getAllByText('Chưa có lịch')).toHaveLength(2);
    expect(within(table).queryByText('Confirmed')).not.toBeInTheDocument();
    expect(within(table).queryByText(/Final/)).not.toBeInTheDocument();
  });

  it('shows confirmed interviews, only the published result, and its notification', async () => {
    await openTab('mine', { scenarioId: 'confirmed', accountId: MINH_ANH });
    const rows = within(await screen.findByRole('table', { name: 'Hồ sơ của tôi' }))
      .getAllByRole('row')
      .slice(1);
    const cf026 = rows.find((row) => within(row).queryByText('CF-026'));
    const cf027 = rows.find((row) => within(row).queryByText('CF-027'));

    expect(within(cf026).getByText('Final Pass')).toBeInTheDocument();
    expect(within(cf027).getByText('Chưa công bố')).toBeInTheDocument();
    expect(within(cf027).queryByText(/Fail/)).not.toBeInTheDocument();
    expect(within(cf027).getByText(/09:15–09:30 · Phòng B-105/)).toBeInTheDocument();

    const notificationsTab = screen.getByRole('tab', { name: /Notifications/ });
    expect(notificationsTab).toHaveTextContent('1');
    fireEvent.click(notificationsTab);
    expect(
      screen.getByText('Kết quả hồ sơ CF-026 (User Experience Design) đã được công bố: Pass.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/CF-027/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' }));
    await waitFor(() => expect(screen.queryByText('Mới')).not.toBeInTheDocument());
  });

  it('reports a failed "mark all read" instead of failing silently', async () => {
    await openTab('notifications', { scenarioId: 'confirmed', accountId: MINH_ANH });
    const button = await screen.findByRole('button', { name: 'Đánh dấu tất cả đã đọc' });
    setMockApiMode('error');
    fireEvent.click(button);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Chưa thể đánh dấu đã đọc');
    expect(alert).toHaveTextContent('The mock is running in deterministic error mode.');
    expect(screen.getByText('Mới')).toBeInTheDocument();
  });

  it('retains a valid draft when the campaign closes during submission', async () => {
    await openTab('apply', { scenarioId: 'accepting', accountId: HAI_DANG });
    fillValidForm({ sop: 'Nội dung cần được giữ lại khi máy chủ từ chối.' });
    setMockApiScenario('screening');

    fireEvent.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(await screen.findByText('Applications are closed.')).toBeInTheDocument();
    expect(screen.getByLabelText('Bài trình bày nguyện vọng (Statement of Purpose)')).toHaveValue(
      'Nội dung cần được giữ lại khi máy chủ từ chối.',
    );
  });

  it('shows retryable HTTP errors and recovers in place', async () => {
    setMockApiMode('error');
    renderApp('/', { scenarioId: 'accepting' });
    expect(
      await screen.findByText('The mock is running in deterministic error mode.'),
    ).toBeInTheDocument();
    setMockApiMode('normal');
    fireEvent.click(screen.getByRole('button', { name: /Thử lại/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Applicant Portal' }),
    ).toBeInTheDocument();
  });

  it('renders genuine empty HTTP collections without fixture fallbacks', async () => {
    setMockApiMode('empty');
    await openTab('mine', { scenarioId: 'accepting', accountId: HAI_DANG });
    expect(screen.getByText('Bạn chưa có hồ sơ nào')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Notifications/ }));
    expect(screen.getByText('Chưa có thông báo')).toBeInTheDocument();
  });
});
