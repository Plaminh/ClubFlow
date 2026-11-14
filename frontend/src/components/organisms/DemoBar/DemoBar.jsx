import { useId } from 'react';
import Badge from '../../atoms/Badge/index.js';
import Button from '../../atoms/Button/index.js';
import { formatDateTime } from '../../../utils/format.js';
import './DemoBar.css';

const SIMULATIONS = [
  { id: 'normal', label: 'Bình thường' },
  { id: 'slow', label: 'Chậm (xem trạng thái tải)' },
  { id: 'error', label: 'Lỗi mạng (xem trạng thái lỗi)' },
];

/**
 * Demo controls: scenario (fixed demo clock), simulated network mode, reset.
 * Clearly labeled so nobody mistakes it for product functionality; collapsed
 * by default so it does not push page content down on small screens.
 */
export default function DemoBar({ scenarios, scenarioId, onScenarioChange, simulation, onSimulationChange, onReset }) {
  const scenarioFieldId = useId();
  const simulationFieldId = useId();
  const scenario = scenarios.find((item) => item.id === scenarioId);

  return (
    <section className="demo-bar" aria-label="Điều khiển bản demo">
      <details className="container demo-bar__details">
        <summary className="demo-bar__summary">
          <Badge tone="warning">Demo</Badge>
          <span>
            {scenario?.label ?? '—'} · thời điểm demo <strong>{scenario ? formatDateTime(scenario.now) : '—'}</strong>
          </span>
          <span className="demo-bar__toggle">Tùy chọn demo</span>
        </summary>
        <div className="demo-bar__panel">
          <p className="hint">
            Dữ liệu hư cấu trong bộ nhớ trình duyệt; tải lại trang sẽ khôi phục dữ liệu ban đầu của kịch bản.
          </p>
          <div className="demo-bar__controls">
            <label className="demo-bar__field" htmlFor={scenarioFieldId}>
              <span>Kịch bản</span>
              <select
                id={scenarioFieldId}
                value={scenarioId}
                onChange={(event) => onScenarioChange(event.target.value)}
              >
                {scenarios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({formatDateTime(item.now)})
                  </option>
                ))}
              </select>
            </label>
            <label className="demo-bar__field" htmlFor={simulationFieldId}>
              <span>Mạng</span>
              <select
                id={simulationFieldId}
                value={simulation}
                onChange={(event) => onSimulationChange(event.target.value)}
              >
                {SIMULATIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="secondary" onClick={onReset}>
              Đặt lại dữ liệu demo
            </Button>
          </div>
        </div>
      </details>
    </section>
  );
}
