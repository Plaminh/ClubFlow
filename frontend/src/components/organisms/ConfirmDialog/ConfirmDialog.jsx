import Button from '../../atoms/Button/index.js';
import Modal from '../Modal/index.js';

/**
 * Confirmation for important or hard-to-undo actions (publish, reject,
 * regenerate, confirm schedule). The cancel button gets initial focus.
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Hủy',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} disabled={busy}>
            {busy ? 'Đang xử lý…' : confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
