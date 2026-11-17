import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Modal from '../../components/organisms/Modal/index.js';

function Harness({ onClose = () => {} }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mở
      </button>
      <Modal
        open={open}
        title="Xác nhận"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        footer={<button type="button">Đồng ý</button>}
      >
        <input aria-label="Ghi chú" />
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('opens as a labelled modal dialog and focuses the first control', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Mở' }));

    const dialog = screen.getByRole('dialog', { name: 'Xác nhận' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Đóng' })).toHaveFocus();
  });

  it('traps Tab and Shift+Tab inside the dialog', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Mở' }));
    const dialog = screen.getByRole('dialog');
    const first = screen.getByRole('button', { name: 'Đóng' });
    const last = screen.getByRole('button', { name: 'Đồng ý' });

    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(first).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('closes on Escape and on the close button, returning focus to the opener', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Mở' });
    opener.focus();

    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();

    fireEvent.click(opener);
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
