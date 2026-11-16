/*
 * ClubFlow demo fixtures — fictional data only.
 * Source: docs/reference/ui/UI_REFERENCE_NOTES.md and the reference pages.
 * Only the mock layer (src/mocks, src/services) may import this file.
 *
 * Date and time convention (Q-02): absolute instants are UTC ISO 8601 strings
 * ("2026-11-05T02:00:00.000Z"), the way the API will serialize TIMESTAMPTZ
 * values; date-only fields are calendar dates (YYYY-MM-DD) and interview-window
 * times are wall-clock "HH:mm", both in the business time zone
 * Asia/Ho_Chi_Minh (UTC+7, no daylight saving).
 * The base records describe the `screening` scenario; scenarios.js derives the
 * other scenarios from them.
 */

const BUSINESS_UTC_OFFSET = '+07:00';

/** Instant of a Vietnam wall-clock date and time, serialized in UTC. */
export const at = (date, time) => new Date(`${date}T${time}:00${BUSINESS_UTC_OFFSET}`).toISOString();

export const INTERVIEW_DATE = '2026-11-05';

export const ACCOUNTS = Object.freeze([
  {
    id: 'exec-recruitment',
    role: 'executive',
    displayName: 'Ban tuyển dụng',
    description: 'CLB Công nghệ & Sáng tạo',
  },
  { id: 'iv-hamy', role: 'interviewer', displayName: 'Hà My', description: 'User Experience Design' },
  { id: 'iv-giahuy', role: 'interviewer', displayName: 'Gia Huy', description: 'Content Creation' },
  {
    id: 'ap-minhanh',
    role: 'applicant',
    displayName: 'Nguyễn Minh Anh',
    studentId: '26DEMO0142',
    email: 'minh.anh@demo.example',
    faculty: 'Công nghệ thông tin',
    year: 'Năm 2',
  },
  {
    id: 'ap-quocbao',
    role: 'applicant',
    displayName: 'Phạm Quốc Bảo',
    studentId: '26DEMO0177',
    email: 'quoc.bao@demo.example',
    faculty: 'Thiết kế',
    year: 'Năm 3',
  },
  {
    id: 'ap-khanhlinh',
    role: 'applicant',
    displayName: 'Vũ Khánh Linh',
    studentId: '26DEMO0203',
    email: 'khanh.linh@demo.example',
    faculty: 'Truyền thông',
    year: 'Năm 2',
  },
  {
    id: 'ap-baongoc',
    role: 'applicant',
    displayName: 'Trần Bảo Ngọc',
    studentId: '26DEMO0119',
    email: 'bao.ngoc@demo.example',
    faculty: 'Truyền thông',
    year: 'Năm 1',
  },
  {
    id: 'ap-thaovy',
    role: 'applicant',
    displayName: 'Lê Hoàng Thảo Vy',
    studentId: '26DEMO0231',
    email: 'thao.vy@demo.example',
    faculty: 'Công nghệ thông tin',
    year: 'Năm 2',
  },
  {
    id: 'ap-haidang',
    role: 'applicant',
    displayName: 'Trương Hải Đăng',
    studentId: '26DEMO0258',
    email: 'hai.dang@demo.example',
    faculty: 'Thiết kế',
    year: 'Năm 1',
  },
]);

const CAMPAIGN = {
  id: 'cmp-2026-hk1',
  name: 'Tuyển Thành Viên Câu Lạc Bộ Công Nghệ & Sáng Tạo — Đợt Tuyển Chính Thức Học Kỳ 1, Năm Học 2026–2027, Dành Cho Sinh Viên Các Khoa Công Nghệ Thông Tin, Thiết Kế Và Truyền Thông',
  hostClub: 'CLB Công nghệ & Sáng tạo',
  description:
    'Cùng xây dựng các sản phẩm số và nội dung truyền thông hữu ích cho cộng đồng sinh viên trong năm học 2026–2027.',
  instructions:
    'Chọn một vị trí phù hợp, chuẩn bị CV định dạng PDF tối đa 5 MB, viết bài trình bày nguyện vọng tối đa 300 từ và chọn các khung giờ phỏng vấn có thể tham gia. Mỗi vị trí cần một hồ sơ riêng.',
  opensOn: '2026-10-12',
  closesOn: '2026-10-30',
  interviewDate: INTERVIEW_DATE,
  interviewWindow: { start: '09:00', end: '12:00' },
  slotMinutes: 15,
  status: 'published',
  publishedAt: at('2026-10-08', '09:00'),
};

const DEPARTMENTS = [
  { id: 'dep-digital', name: 'Digital Product' },
  { id: 'dep-comms', name: 'Communications' },
];

const POSITIONS = [
  {
    id: 'pos-ux',
    departmentId: 'dep-digital',
    name: 'User Experience Design',
    quota: 2,
    description: 'Nghiên cứu nhu cầu và phác thảo luồng sản phẩm số cho sinh viên.',
    requirements: 'Biết dùng Figma, trình bày rõ ràng và có tư duy lấy người dùng làm trung tâm.',
  },
  {
    id: 'pos-content',
    departmentId: 'dep-comms',
    name: 'Content Creation',
    quota: 2,
    description: 'Lên ý tưởng và viết nội dung cho các kênh truyền thông của câu lạc bộ.',
    requirements: 'Viết mạch lạc, chủ động phản hồi và phối hợp tốt với nhóm thiết kế.',
  },
];

// Club-provided availability slots that applicants choose from (applicant reference).
const SLOTS = [
  { id: 'slot-0900', start: at(INTERVIEW_DATE, '09:00'), end: at(INTERVIEW_DATE, '10:00') },
  { id: 'slot-1000', start: at(INTERVIEW_DATE, '10:00'), end: at(INTERVIEW_DATE, '11:00') },
  { id: 'slot-1100', start: at(INTERVIEW_DATE, '11:00'), end: at(INTERVIEW_DATE, '12:00') },
];

const ROOMS = [
  { id: 'room-a201', name: 'A-201' },
  { id: 'room-b105', name: 'B-105' },
];

// Executive-entered interviewer assignments and availability (scheduling reference).
const ASSIGNMENTS = [
  {
    interviewerId: 'iv-hamy',
    positionIds: ['pos-ux'],
    availability: [{ start: at(INTERVIEW_DATE, '09:00'), end: at(INTERVIEW_DATE, '10:30') }],
  },
  {
    interviewerId: 'iv-giahuy',
    positionIds: ['pos-content'],
    availability: [{ start: at(INTERVIEW_DATE, '09:00'), end: at(INTERVIEW_DATE, '11:00') }],
  },
];

const SOP_026 = [
  'Em mong muốn tham gia vị trí User Experience Design vì em thích tìm hiểu cách sinh viên sử dụng các công cụ học tập và hoạt động câu lạc bộ. Trong một dự án môn học gần đây, em đã phỏng vấn người dùng, tổng hợp những khó khăn thường gặp và xây dựng luồng màn hình trên Figma. Em muốn tiếp tục rèn luyện cách đặt câu hỏi, ưu tiên phản hồi và trình bày quyết định thiết kế bằng lập luận rõ ràng.',
  'Nếu được tham gia, em có thể dành thời gian cố định mỗi tuần để phối hợp cùng Ban Digital Product, kiểm thử ý tưởng với sinh viên và hỗ trợ ghi chép kết quả nghiên cứu. Em tin rằng sự kiên nhẫn, tinh thần lắng nghe và thói quen hoàn thành công việc đúng hạn sẽ giúp em đóng góp tích cực cho các sản phẩm số của câu lạc bộ.',
].join('\n\n');

const cv = (id, sizeKb) => ({ fileName: `CV-${id}.pdf`, sizeBytes: sizeKb * 1024 });

// Screening-scenario state of each application (review.html).
const APPLICATIONS = [
  {
    id: 'CF-026',
    applicantId: 'ap-minhanh',
    positionId: 'pos-ux',
    submittedAt: at('2026-10-14', '09:42'),
    slotIds: ['slot-0900'],
    sop: SOP_026,
    cv: cv('CF-026', 412),
    screeningStatus: 'shortlisted',
    reviewedAt: at('2026-10-31', '08:20'),
    privateNote:
      'Có kinh nghiệm nghiên cứu người dùng; cần hỏi thêm cách ưu tiên phản hồi khi các nhóm người dùng có nhu cầu khác nhau.',
  },
  {
    id: 'CF-027',
    applicantId: 'ap-minhanh',
    positionId: 'pos-content',
    submittedAt: at('2026-10-14', '10:05'),
    slotIds: ['slot-0900'],
    sop: 'Em muốn thử sức ở vị trí Content Creation để viết nội dung giới thiệu các sản phẩm số của câu lạc bộ tới sinh viên. Em thường viết bài tổng kết cho lớp và muốn học cách lên kế hoạch nội dung theo chiến dịch.',
    cv: cv('CF-027', 398),
    screeningStatus: 'shortlisted',
    reviewedAt: at('2026-10-31', '08:25'),
    privateNote: '',
  },
  {
    id: 'CF-028',
    applicantId: 'ap-baongoc',
    positionId: 'pos-content',
    submittedAt: at('2026-10-15', '11:08'),
    slotIds: ['slot-1000'],
    sop: 'Em yêu thích viết lách và đã quản lý fanpage của lớp trong một năm. Em mong muốn học thêm cách xây dựng nội dung có kế hoạch và đo lường hiệu quả bài đăng.',
    cv: cv('CF-028', 356),
    screeningStatus: 'pendingReview',
    reviewedAt: null,
    privateNote: '',
  },
  {
    id: 'CF-029',
    applicantId: 'ap-thaovy',
    positionId: 'pos-ux',
    submittedAt: at('2026-10-16', '08:45'),
    slotIds: ['slot-1100'],
    sop: 'Em quan tâm đến thiết kế giao diện và muốn tìm hiểu quy trình làm sản phẩm thực tế cùng các bạn trong câu lạc bộ.',
    cv: cv('CF-029', 289),
    screeningStatus: 'rejected',
    reviewedAt: at('2026-10-31', '08:30'),
    privateNote: '',
  },
  {
    id: 'CF-030',
    applicantId: 'ap-quocbao',
    positionId: 'pos-ux',
    submittedAt: at('2026-10-17', '14:20'),
    slotIds: ['slot-0900', 'slot-1000'],
    sop: 'Em quan tâm đến thiết kế tương tác và muốn thực hành quy trình thiết kế theo nhóm cùng Ban Digital Product.',
    cv: cv('CF-030', 455),
    screeningStatus: 'shortlisted',
    reviewedAt: at('2026-10-31', '08:35'),
    privateNote: '',
  },
  {
    id: 'CF-031',
    applicantId: 'ap-khanhlinh',
    positionId: 'pos-content',
    submittedAt: at('2026-10-18', '15:30'),
    slotIds: ['slot-0900'],
    sop: 'Em muốn đóng góp vào các kênh truyền thông của câu lạc bộ, đặc biệt là nội dung video ngắn giới thiệu hoạt động của các ban.',
    cv: cv('CF-031', 377),
    screeningStatus: 'shortlisted',
    reviewedAt: at('2026-10-31', '08:40'),
    privateNote: '',
  },
];

// Draft schedule as shown in scheduling.html (generated draft, before fixes).
const DRAFT_INTERVIEWS = [
  { id: 'iv-026', applicationId: 'CF-026', interviewerId: 'iv-hamy', roomId: 'room-a201', start: at(INTERVIEW_DATE, '09:00') },
  { id: 'iv-027', applicationId: 'CF-027', interviewerId: 'iv-giahuy', roomId: 'room-b105', start: at(INTERVIEW_DATE, '09:00') },
  { id: 'iv-030', applicationId: 'CF-030', interviewerId: 'iv-hamy', roomId: 'room-a201', start: at(INTERVIEW_DATE, '09:15') },
  {
    id: 'iv-031',
    applicationId: 'CF-031',
    interviewerId: 'iv-giahuy',
    roomId: null,
    start: null,
    note: 'Gia Huy và cả hai phòng đã được xếp trong ca 09:00–09:15, ca chung đầu tiên của ứng viên; cần gán khung giờ khác.',
  },
];

// Confirmed schedule (scheduling.html confirmed example and UI_REFERENCE_NOTES.md).
const CONFIRMED_INTERVIEWS = [
  { id: 'iv-026', applicationId: 'CF-026', interviewerId: 'iv-hamy', roomId: 'room-a201', start: at(INTERVIEW_DATE, '09:00') },
  { id: 'iv-027', applicationId: 'CF-027', interviewerId: 'iv-giahuy', roomId: 'room-b105', start: at(INTERVIEW_DATE, '09:15') },
  { id: 'iv-030', applicationId: 'CF-030', interviewerId: 'iv-hamy', roomId: 'room-a201', start: at(INTERVIEW_DATE, '09:15') },
  { id: 'iv-031', applicationId: 'CF-031', interviewerId: 'iv-giahuy', roomId: 'room-b105', start: at(INTERVIEW_DATE, '09:00') },
];

const CONFIRMED_ASSESSMENTS = [
  {
    id: 'as-026',
    interviewId: 'iv-026',
    interviewerId: 'iv-hamy',
    recommendation: 'pass',
    notes: 'Trình bày rõ ràng, nêu được ví dụ cụ thể về phỏng vấn người dùng.',
    submittedAt: at(INTERVIEW_DATE, '09:20'),
  },
  {
    id: 'as-027',
    interviewId: 'iv-027',
    interviewerId: 'iv-giahuy',
    // No recommendation: it is optional, and the Executive still decided (Fail).
    recommendation: null,
    notes: 'Ý tưởng nội dung còn chung chung; chưa nêu được kế hoạch phối hợp với nhóm thiết kế.',
    submittedAt: at(INTERVIEW_DATE, '09:35'),
  },
];

const CONFIRMED_RESULTS = [
  { applicationId: 'CF-026', decision: 'pass', recordedAt: at(INTERVIEW_DATE, '11:00'), publishedAt: at(INTERVIEW_DATE, '12:00') },
  { applicationId: 'CF-027', decision: 'fail', recordedAt: at(INTERVIEW_DATE, '11:05'), publishedAt: null },
];

const CONFIRMED_NOTIFICATIONS = [
  {
    id: 'nt-cf-026',
    accountId: 'ap-minhanh',
    applicationId: 'CF-026',
    message: 'Kết quả hồ sơ CF-026 (User Experience Design) đã được công bố: Pass.',
    createdAt: at(INTERVIEW_DATE, '12:00'),
    readAt: null,
  },
];

export const BASE = Object.freeze({
  campaign: CAMPAIGN,
  departments: DEPARTMENTS,
  positions: POSITIONS,
  slots: SLOTS,
  rooms: ROOMS,
  assignments: ASSIGNMENTS,
  applications: APPLICATIONS,
  draftInterviews: DRAFT_INTERVIEWS,
  confirmedInterviews: CONFIRMED_INTERVIEWS,
  confirmedAssessments: CONFIRMED_ASSESSMENTS,
  confirmedResults: CONFIRMED_RESULTS,
  confirmedNotifications: CONFIRMED_NOTIFICATIONS,
});

// Single fictional sample CV used for every demo application (copied from the
// reference package). Real CVs must be served through an authorized endpoint.
export const SAMPLE_CV_URL = '/demo/fictional-sample-cv.pdf';
