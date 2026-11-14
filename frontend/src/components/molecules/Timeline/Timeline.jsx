import './Timeline.css';

/** Campaign milestones (reference "Mốc thời gian chiến dịch"). items: [{ date, label }] */
export default function Timeline({ title = 'Mốc thời gian chiến dịch', items }) {
  return (
    <section className="timeline" aria-label={title}>
      <h2 className="section-kicker timeline__title">{title}</h2>
      <ol className="timeline__grid">
        {items.map((item) => (
          <li key={item.label} className="timeline__item">
            <strong>{item.date}</strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
