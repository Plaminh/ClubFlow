import Card from '../../molecules/Card/index.js';
import './InterviewerAssignmentsCard.css';

/** Interviewer ↔ position assignments and availability entered by the Executive. */
export default function InterviewerAssignmentsCard({ assignments }) {
  return (
    <Card title="Phân công người phỏng vấn">
      <div className="stack">
        <div className="assignment-grid">
          {assignments.map((assignment) => (
            <article key={assignment.interviewerId} className="assignment-card">
              <h3>{assignment.interviewerName}</h3>
              <p>
                <strong>Position:</strong> {assignment.positionNames.join(', ')}
              </p>
              <p>
                <strong>Thời gian rảnh:</strong> {assignment.availabilityText}
              </p>
            </article>
          ))}
        </div>
        <p className="hint">
          {assignments.map((assignment) => assignment.interviewerName).join(' và ')} là người phỏng
          vấn; họ không xuất hiện trong danh sách ứng viên. Ban tuyển dụng nhập giờ rảnh do người
          phỏng vấn cung cấp.
        </p>
      </div>
    </Card>
  );
}
