import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'vitest';
import { DemoSessionProvider } from '../../contexts/DemoSessionContext.jsx';
import AppRoutes from '../../routes/AppRoutes.jsx';
import { restoreDemoState } from '../../services/demoSessionService.js';

export const EXECUTIVE = 'exec-recruitment';

/**
 * Renders the full app (shell + routes + demo session) at `path`, optionally
 * already signed in as a demo account and in a given scenario.
 */
export function renderApp(path = '/', { accountId, scenarioId } = {}) {
  restoreDemoState({ accountId, scenarioId });
  // StrictMode as in main.jsx, so effects run twice like in development.
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <DemoSessionProvider>
          <AppRoutes />
        </DemoSessionProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

/** Development-only account switch in the DemoBar, choosing the option by its visible label. */
export async function signInAs(accountLabel) {
  const demo = await screen.findByRole('region', { name: 'Điều khiển bản demo' });
  const select = within(demo).getByLabelText(/Đổi tài khoản nhanh/);
  const option = await within(select).findByRole('option', { name: accountLabel });
  fireEvent.change(select, { target: { value: option.value } });
  await waitFor(() => expect(screen.queryByRole('link', { name: 'Đăng nhập' })).not.toBeInTheDocument());
}

export const DEMO_PASSWORD = 'ClubFlowDemo!';

/** Fills and submits the simulated Sign In form on /login. */
export async function submitSignIn(email, password = DEMO_PASSWORD) {
  fireEvent.change(await screen.findByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
}

/** Opens the header account menu (signed-in users only). */
export async function openAccountMenu() {
  const trigger = await screen.findByRole('button', { name: /^Tài khoản của/ });
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    fireEvent.click(trigger);
  }
  return trigger;
}

export async function signOut() {
  await openAccountMenu();
  fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
}
