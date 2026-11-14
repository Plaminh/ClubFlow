import StatusBadge from '../../molecules/StatusBadge/index.js';
import { APP_NAME, PROJECT_STACK } from '../../../constants/project.js';
import './ClubFlowOverview.css';

export default function ClubFlowOverview({ apiStatus, errorMessage }) {
  return (
    <section className="clubflow-overview" aria-labelledby="clubflow-overview-title">
      <div className="clubflow-overview__header">
        <div>
          <p className="clubflow-overview__eyebrow">{APP_NAME} · Development Preview</p>
          <h2 id="clubflow-overview-title">{APP_NAME} foundation is ready for features</h2>
        </div>
        <StatusBadge status={apiStatus} />
      </div>

      <ul className="clubflow-overview__stack">
        {PROJECT_STACK.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {errorMessage ? (
        <p className="clubflow-overview__error" role="status">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
