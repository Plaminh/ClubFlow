import './PositionCard.css';

/** Read-only department + position summary (reference "position-card"). */
export default function PositionCard({
  departmentName,
  name,
  quota,
  description,
  requirements,
  headingLevel = 3,
}) {
  const Heading = `h${headingLevel}`;

  return (
    <article className="position-card">
      <div>
        <p className="section-kicker">Department</p>
        <Heading className="position-card__department">{departmentName || '—'}</Heading>
        <p className="position-card__meta">{quota} chỉ tiêu</p>
      </div>
      <div className="position-card__details">
        <p>
          <strong>Position:</strong> {name || '—'}
        </p>
        <p>
          <strong>Mô tả công việc:</strong> {description || '—'}
        </p>
        <p>
          <strong>Yêu cầu:</strong> {requirements || '—'}
        </p>
      </div>
    </article>
  );
}
