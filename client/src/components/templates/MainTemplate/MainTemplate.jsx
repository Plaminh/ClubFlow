import { useEffect } from 'react';
import StepIndicator from '../../molecules/StepIndicator/index.js';
import './MainTemplate.css';

const EXECUTIVE_STEPS = ['Tạo chiến dịch', 'Duyệt hồ sơ', 'Xếp lịch phỏng vấn'];

/**
 * Page template: heading block (eyebrow, single <h1>, description, actions),
 * optional campaign context and Executive step strip, then page content.
 * The surrounding <main> landmark is provided by AppLayout.
 */
export default function MainTemplate({
  eyebrow,
  title,
  description,
  actions,
  context,
  step,
  children,
}) {
  useEffect(() => {
    document.title = title ? `${title} · ClubFlow` : 'ClubFlow';
  }, [title]);

  return (
    <div className="main-template">
      <div className="main-template__heading">
        <div className="main-template__intro">
          {eyebrow ? <p className="main-template__eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {description ? <p className="main-template__description">{description}</p> : null}
        </div>
        {actions ? <div className="main-template__actions">{actions}</div> : null}
      </div>
      {context ? (
        <p className="campaign-context">
          <strong>Chiến dịch:</strong> {context}
        </p>
      ) : null}
      {step ? (
        <StepIndicator steps={EXECUTIVE_STEPS} current={step} label="Tiến trình tuyển thành viên" />
      ) : null}
      {children}
    </div>
  );
}
