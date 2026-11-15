import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EXECUTIVE, renderApp } from '../helpers/renderApp.jsx';

// Structural accessibility checks for every screen in a representative state.
// They complement (not replace) the manual keyboard and zoom checklist in
// specs/001-frontend-ui/quickstart.md.
const SCREENS = [
  ['Applicant Portal (visitor)', '/', {}, 'Mô tả chiến dịch'],
  ['Apply form', '/?tab=apply', { accountId: 'ap-haidang', scenarioId: 'accepting' }, 'Tóm tắt hồ sơ'],
  ['My Applications', '/?tab=mine', { accountId: 'ap-minhanh', scenarioId: 'confirmed' }, 'Hồ sơ của tôi'],
  ['Notifications', '/?tab=notifications', { accountId: 'ap-minhanh', scenarioId: 'confirmed' }, 'Thông báo trong ứng dụng'],
  ['Campaign Management', '/executive/campaign', { accountId: EXECUTIVE, scenarioId: 'draft' }, 'Thông tin chiến dịch'],
  ['CV Screening', '/executive/review', { accountId: EXECUTIVE }, 'Tìm và lọc hồ sơ'],
  ['Final Results', '/executive/review?tab=results', { accountId: EXECUTIVE, scenarioId: 'confirmed' }, 'Kết quả cuối theo hồ sơ'],
  ['Interview Scheduling', '/executive/scheduling', { accountId: EXECUTIVE }, 'Lịch nháp'],
  ['Interviewer Workspace', '/interviewer', { accountId: 'iv-hamy', scenarioId: 'confirmed' }, 'Interview Assessment'],
  ['Not found', '/missing-page', {}, 'Đường dẫn không tồn tại'],
];

describe.each(SCREENS)('%s', (_name, path, session, readyHeading) => {
  it('has one h1, one main, landmarks, named controls, and unique ids', async () => {
    const { container } = renderApp(path, session);
    await screen.findByRole('heading', { name: readyHeading });

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    const controls = [
      ...screen.queryAllByRole('textbox'),
      ...screen.queryAllByRole('combobox'),
      ...screen.queryAllByRole('checkbox'),
      ...screen.queryAllByRole('radio'),
      ...screen.queryAllByRole('button'),
      ...screen.queryAllByRole('link'),
      ...screen.queryAllByRole('tab'),
    ];
    for (const control of controls) {
      expect(control).toHaveAccessibleName();
    }
    for (const fileInput of container.querySelectorAll('input[type="file"]')) {
      expect(fileInput).toHaveAccessibleName();
    }

    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });
});
