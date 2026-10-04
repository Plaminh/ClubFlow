import StatusBadge from '../../molecules/StatusBadge/index.js';
import { PROJECT_STACK } from '../../../constants/project.js';
import './ProjectOverview.css';

export default function ProjectOverview({ apiStatus, errorMessage }) {
  return (
    <section className="project-overview" aria-labelledby="project-overview-title">
      <div className="project-overview__header">
        <div>
          <p className="project-overview__eyebrow">Course Project Scaffold</p>
          <h2 id="project-overview-title">Framework is ready for features</h2>
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
