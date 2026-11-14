import StatusBadge from '../../molecules/StatusBadge/index.js';
import { APP_NAME, PROJECT_STACK } from '../../../constants/project.js';
import './ProjectOverview.css';

export default function ProjectOverview({ apiStatus, errorMessage }) {
  return (
    <section className="project-overview" aria-labelledby="project-overview-title">
      <div className="project-overview__header">
        <div>
          <p className="project-overview__eyebrow">{APP_NAME} · Development Preview</p>
          <h2 id="project-overview-title">{APP_NAME} foundation is ready for features</h2>
        </div>
        <StatusBadge status={apiStatus} />
      </div>

      <ul className="project-overview__stack">
        {PROJECT_STACK.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {errorMessage ? (
        <p className="project-overview__error" role="status">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
