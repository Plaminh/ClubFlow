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
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DemoSessionProvider>
        <AppRoutes />
      </DemoSessionProvider>
    </MemoryRouter>,
  );
}

/** Signs in through the shared demo dialog, choosing the option by its visible label. */
export async function signInAs(accountLabel) {
  fireEvent.click(await screen.findByRole('button', { name: 'Sign In' }));
  const dialog = await screen.findByRole('dialog', { name: 'Sign In' });
  const select = within(dialog).getByLabelText('Chọn tài khoản demo');
  const option = within(select).getByRole('option', { name: accountLabel });
  fireEvent.change(select, { target: { value: option.value } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Sign In (demo)' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}
