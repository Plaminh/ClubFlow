import { formatDate } from './format.js';

/** Submission-window message per campaign phase (BR-02). */
export function phaseMessage(phase, campaign) {
  const open = formatDate(campaign.opensOn);
  const close = formatDate(campaign.closesOn);
  if (phase === 'before-open') {
    return { tone: 'warning', title: 'Chưa mở nhận hồ sơ', text: `Hồ sơ được nhận từ ${open}. Hiện chưa thể nộp hồ sơ.` };
  }
  if (phase === 'open') {
    return { tone: 'success', title: 'Đang nhận hồ sơ', text: `Ứng viên có thể nộp hồ sơ từ ${open} đến hết ${close}.` };
  }
  return {
    tone: 'error',
    title: 'Đã đóng nhận hồ sơ',
    text: `Hạn nộp hồ sơ là ${close} nên không thể nộp thêm. Ứng viên đã nộp vẫn theo dõi được hồ sơ của mình.`,
  };
}
