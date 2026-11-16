import { formatDate } from './format.js';

/**
 * Submission-window message per campaign phase (BR-02). The opening and
 * closing dates are calendar days in Vietnam time (Q-02): the window runs from
 * 00:00 on the opening day until the end of the closing day.
 */
export function phaseMessage(phase, campaign) {
  const open = formatDate(campaign.opensOn);
  const close = formatDate(campaign.closesOn);
  if (phase === 'before-open') {
    return {
      tone: 'warning',
      title: 'Chưa mở nhận hồ sơ',
      text: `Hồ sơ được nhận từ 00:00 ngày ${open} (giờ Việt Nam). Hiện chưa thể nộp hồ sơ.`,
    };
  }
  if (phase === 'open') {
    return {
      tone: 'success',
      title: 'Đang nhận hồ sơ',
      text: `Ứng viên có thể nộp hồ sơ từ ${open} đến hết ngày ${close} (giờ Việt Nam).`,
    };
  }
  return {
    tone: 'error',
    title: 'Đã đóng nhận hồ sơ',
    text: `Hạn nộp hồ sơ là hết ngày ${close} (giờ Việt Nam) nên không thể nộp thêm. Ứng viên đã nộp vẫn theo dõi được hồ sơ của mình.`,
  };
}
