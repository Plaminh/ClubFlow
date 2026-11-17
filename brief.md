# ClubFlow PA#3 Assistant Request History

## Record Policy

This file records only assistant requests available from the current conversation and its attached prompt files. Entries are ordered by conversation sequence because exact request times were not supplied.

- **Exact prompt (verbatim)** means the prompt text is reproduced from an available user message or attached prompt file. Wording, spelling, and structure are preserved; only line-ending encoding is normalized.
- **Summary (non-verbatim)** is a labeled navigation aid and is not a substitute for the exact prompt.
- Missing or unavailable prompts are not reconstructed.

## 2026-11-17 — Request 1 — Initial Repository Audit

**Record type:** Exact prompt available from the attached file `144c23b3-bb53-4e58-970a-661526d75f48/pasted-text.txt`.

**Summary (non-verbatim):** Requested a read-only audit of the PA#2-to-PA#3 transition, with no repository changes and a stop for approval.

**Exact prompt (verbatim):**

`````text
Bạn là Senior Frontend Engineer kiêm Technical Auditor của dự án ClubFlow (CSC13008, PA#3).

NHIỆM VỤ HIỆN TẠI: Chỉ audit toàn bộ repository đang mở để đánh giá tiến độ chuyển từ PA#2 sang PA#3. KHÔNG implement, KHÔNG tạo/sửa/xóa file, KHÔNG tự commit, push, checkout, reset, install package hoặc thay đổi configuration. Sau khi audit, dừng lại và chờ tôi phê duyệt kế hoạch.

1. NGUỒN YÊU CẦU
Đọc toàn bộ tài liệu yêu cầu có trong repository, ưu tiên:
- ClubFlow final project brief
- ClubFlow Business Description (nếu có)
- PA3.txt, PA#3 rubric đầy đủ (nếu có)
- Final project milestones/features/rubrics
- Product Owner Q&A/decisions (nếu có)
- PA#2 artifacts, README, brief.md, AI-LOG.md, SELF_ASSESSMENT_REPORT.md
- Rules file (CLAUDE.md, AGENTS.md hoặc tương đương)
- contract-check.mjs và README của công cụ nếu có

Nếu tài liệu quan trọng không có trong repo, báo MISSING REFERENCE; không suy diễn nội dung rubric chưa đọc.
Phân biệt yêu cầu bắt buộc của PA#3, phần tiếp nối từ PA#2 và các yêu cầu chỉ thuộc PA#4/PA#5/PA#6.
Không tự mở rộng phạm vi.

2. AUDIT TOÀN BỘ REPOSITORY
Đọc cấu trúc thư mục và code thực tế. Kiểm tra:
- Git branch hiện tại, working tree, các thay đổi chưa commit
- Commit history liên quan PA#2/PA#3
- package.json, package-lock.json, scripts, dependencies
- Các trang HTML/CSS/JS từ PA#2
- client/, src/, components/, pages/, routes/, hooks/, services/ (nếu có)
- docs/api/, mock/, public/, assets/, test/, scripts/
- Các file tài liệu và cấu hình harness
- Những file trùng lặp, không sử dụng hoặc có nguy cơ gây nhầm lẫn

Chỉ đánh giá dựa trên code thực tế, import/call-site và bằng chứng. File tồn tại chưa có nghĩa là chức năng đã hoàn thiện.
Không khẳng định một luồng hoạt động nếu chưa có bằng chứng.

3. KIỂM TRA KIẾN TRÚC PA#3
Đánh giá:
A. React + Vite trong client/ đã có hay chưa?
B. Các trang PA#2 đã chuyển sang React components hay vẫn là HTML tĩnh?
C. Có router và protected routes không?
D. Có cơ chế sign-in, sign-out và role-based navigation không?
E. Có API client dùng relative /api paths không?
F. Data có lấy từ API hay vẫn hardcoded?
G. Có shared state xử lý campaign, applications, schedule và session không?
H. Có loading, error + Retry, empty states cho các view tải dữ liệu không?
I. Có responsive behavior và semantic markup không?
J. Có tách biệt UI, business logic, API services không?
K. Có test/build/checker và cấu hình tự động kiểm tra không?

4. AUDIT C1–C11
Lập bảng kiểm tra đủ 11 bước:
C1 Public Published Campaign
C2 Sign-in, Roles, Sign-out
C3 Create/Save Draft/Preview/Publish Campaign
C4 Interview Setup
C5 Applicant Submission
C6 My Applications
C7 Application Review
C8 Draft Interview Scheduling
C9 Approve & Confirm Schedule
C10 Interviewer Workspace & Assessments
C11 Final Results & In-app Notifications

Với mỗi bước:
- Role
- Yêu cầu nghiệp vụ
- File/component/route hiện tại
- Đã có UI chưa?
- UI có hoạt động không?
- Có gọi API không?
- Có đúng state transitions không?
- Có validation/exception flow không?
- Status: DONE / PARTIAL / MISSING / UNVERIFIED
- Evidence: file path + line numbers
- Những việc còn thiếu

Đặc biệt kiểm tra:
- Một applicant có thể apply hai positions độc lập
- Duplicate application cho cùng position
- Shortlist/Reject chỉ thay đổi đúng một application
- Chỉ Shortlisted đi vào scheduling
- Conflict theo applicant, interviewer và room
- Unassigned phải có lý do
- Confirm bị chặn nếu còn conflict/unassigned
- Confirmed schedule trở thành read-only
- Interviewer chỉ xem interview/CV được giao
- Assessment thuộc đúng application
- Final Pass/Fail chỉ hiện sau khi publish
- Internal screening notes không bị lộ cho role khác
- Các trạng thái business riêng biệt không bị gộp sai

5. AUDIT API CONTRACT VÀ MOCK
Kiểm tra docs/api/:
- Contract có được viết thành tài liệu trước implementation không?
- Có danh sách endpoint đủ phục vụ C1–C11 không?
- Có request/response examples dạng fenced http không?
- Có HTTP status codes và một error shape thống nhất không?
- Có role/authorization behavior, pagination, filters và validation không?
- Có mô tả dữ liệu và state transition không?
- Có section Changes không?
Kiểm tra mock/server.mjs:
- Chỉ sử dụng Node.js built-in modules?
- Có đủ normal, slow, error, empty modes?
- Mock trả đúng API contract?
- Có deterministic demo data?
- Các hành động mutation có cập nhật state hợp lý?
- Có thể thay mock bằng Express PA#4 mà không sửa cách frontend gọi API không?
- Nếu contract-check tool tồn tại, xác định cách chạy và mức độ đáp ứng hiện tại.

6. ĐỐI CHIẾU VỚI PA#2
Xác định:
- HTML/CSS/assets nào có thể reuse?
- Phần nào cần migrate thành React components?
- Phần nào cần tách thành shared layouts?
- Phần nào chưa đủ phạm vi PA#3?
- Các lỗi từ Fix these list của final brief có còn không?
- Có UI hay business logic nào sai hoặc không nhất quán?

Tuyệt đối không đề xuất rewrite toàn bộ nếu có thể tái sử dụng hợp lý.

7. AUDIT FORM VÀ TRẠNG THÁI UI
Kiểm tra required fields, date validation, quota, PDF <= 5 MB, statement <= 300 words, availability selection, inline errors, giữ lại dữ liệu hợp lệ sau lỗi, disabled/loading submission, duplicate submission, responsive và keyboard accessibility.

8. AUDIT HARNESS VÀ DOCUMENTATION
Kiểm tra rules file, formatting, linting, tests, CI, AI-LOG.md, brief.md, FRONTEND.md, SELF_ASSESSMENT_REPORT.md, git history.
Chỉ ghi nhận những gì có bằng chứng. Không tạo AI log giả, commit giả hoặc CI run giả.
Chỉ rõ phần nào cần làm sớm để phục vụ PA#5, nhưng không thực hiện PA#5 ở phase này.

9. OUTPUT BẮT BUỘC
Trả về báo cáo bằng tiếng Việt, theo cấu trúc:

I. Executive Summary
- Trạng thái thực tế của repository
- Đã hoàn thành những gì
- Những điểm nghẽn chính
- Các yêu cầu PA#3 hiện còn thiếu

II. Repository Inventory
- Tree rút gọn
- Các file/nhóm file quan trọng
- Tech stack thực tế
- Git status/history

III. C1–C11 Coverage Matrix
- Một bảng đầy đủ 11 dòng với DONE/PARTIAL/MISSING/UNVERIFIED và evidence

IV. Rubric Gap Analysis
- Đánh giá 9 tiêu chí PA#3
- Evidence cụ thể
- Chỉ ước tính điểm nếu có đủ rubric và bằng chứng; không tự nhận là điểm chính thức

V. Reusable PA#2 Assets
- Keep
- Refactor
- Migrate
- Replace
- Missing
- Đưa ra lý do kỹ thuật cụ thể

VI. Architecture and Contract Gaps
- Routing, state, services, mock, API contract, validations, tests

VII. Prioritized Backlog
- P0: Blocking
- P1: Required
- P2: Polish
Mỗi item cần có file/scope liên quan, điều kiện hoàn thành và dependency.

VIII. Suggested Implementation Phases
Ưu tiên contract-first và mock-first, sau đó mới kết nối React.
Mỗi phase có goal, phạm vi, dependencies, acceptance criteria, manual tests và commit boundary.
Đề xuất các phần độc lập có thể làm song song.

IX. Next Recommended Action
Chọn đúng một phase đầu tiên để làm sau audit, mô tả ngắn gọn vì sao nên bắt đầu ở đó.

QUY TẮC:
- Không sửa bất cứ file nào.
- Không chạy command làm thay đổi repository.
- Không tự cài package hoặc dependency.
- Không tạo git commit.
- Không giả định một tính năng DONE chỉ vì có giao diện.
- Không bỏ sót bất kỳ bước C1–C11.
- Không gộp yêu cầu PA#3 với PA#4.
- Mọi kết luận phải có evidence; nếu không xác minh được, ghi UNVERIFIED.
- Kết thúc bằng báo cáo audit và chờ tôi review.
`````

## 2026-11-17 — Request 2 — Full Rubric-Based Repository Audit

**Record type:** Exact prompt available from the attached file `22314468-317b-43d8-b1b3-ffbffe08ce8f/pasted-text.txt`.

**Summary (non-verbatim):** Requested a read-only, evidence-based audit against the supplied official PA#3 requirements, C1–C11 checklist, contract/mock rules, nine-part rubric, and submission requirements.

**Exact prompt (verbatim):**

`````text

# CLUBFLOW — PA#3 FULL RUBRIC-BASED REPOSITORY AUDIT

Bạn là Senior React Engineer, Software Architect và Technical Auditor của dự án ClubFlow thuộc môn CSC13008 — 24KTPM1.

NHIỆM VỤ: Audit toàn bộ repository đang mở để đánh giá mức độ hoàn thành PA#3 — Front end in React.

Yêu cầu PA#3 chính thức và các quyết định nghiệp vụ đã được tích hợp trực tiếp bên dưới. Hãy dùng chúng làm chuẩn đánh giá, không tự suy diễn rubric khác.

CHỈ AUDIT, KHÔNG IMPLEMENT.

==================================================
0. QUY TẮC LÀM VIỆC
==================================================

BẮT BUỘC:
- Đọc code thực tế, không chỉ README hoặc task checklist.
- Đọc Git history và working tree.
- Đối chiếu từng kết luận với yêu cầu PA#3.
- Cung cấp file path và line number làm bằng chứng.
- Phân biệt implemented, simulated, documented và tested.
- Phân biệt UI mock trong browser với HTTP mock server.
- Không xem một chức năng là DONE chỉ vì có component hoặc button.
- Không tin tuyệt đối vào kết quả audit trước; kiểm tra lại source hiện tại.
- Không tự mở rộng phạm vi sang PA#4 hoặc PA#5.
- Không tự tạo ra yêu cầu ngoài rubric.
- Nếu có điều không xác minh được, ghi UNVERIFIED.

CẤM:
- Sửa, tạo, xóa hoặc di chuyển bất kỳ file nào.
- Tự commit, push, merge, checkout, reset hoặc rebase.
- Cài dependency.
- Thay đổi Git history.
- Sửa test, mock, contract hoặc documentation.
- Tạo AI-LOG, bằng chứng CI, screenshots hoặc kết quả test giả.
- Chạy lệnh có khả năng phá hủy hoặc thay đổi repository.
- Tự sửa lỗi vừa phát hiện.

Cho phép thực hiện các lệnh chỉ đọc như git status, git log, git show, git diff, rg, đọc package.json và duyệt source.

Nếu muốn chạy test/build nhưng thao tác đó tạo hoặc thay đổi file, không thực hiện trên working tree hiện tại; ghi rõ NOT EXECUTED. Không được coi log test cũ là kết quả test mới.

Trả lời bằng tiếng Việt. Giữ nguyên tên các thuật ngữ kỹ thuật, file và rubric bằng tiếng Anh.

==================================================
1. OFFICIAL PA#3 REQUIREMENTS
==================================================

Milestone:
PA#3 — Front end in React

Course: CSC13008 — 24KTPM1
Weight: 7% môn học
Total: 100 điểm
Deadline: Monday, November 30, 2026, 22:00.

Mục tiêu:
Xây dựng toàn bộ main flow ClubFlow C1–C11 cho cả ba role bằng React + Vite.

Mọi dữ liệu nghiệp vụ phải đến từ HTTP API đã được định nghĩa trước trong docs/api/.

Quy trình bắt buộc:

1. Define API Contract.
2. Commit API Contract.
3. Implement HTTP Mock Server.
4. Commit Mock Server.
5. Connect React frontend to API.
6. Validate full flow and document evidence.

PA#4 sẽ thay Mock Server bằng Express Server trên cùng API contract, không cần thay đổi cách frontend gọi API.

Các yêu cầu kỹ thuật:

A. Frontend
- React + Vite.
- Source trong client/.
- Một CSS framework hoặc plain CSS, được bundle vào build.
- React Router với BrowserRouter hoặc HashRouter.
- Không dùng Next.js hoặc Remix framework mode.
- Các màn hình C1–C11 phải truy cập được bằng navigation thực tế.
- Không có main-flow business data hardcoded trong components.
- Dữ liệu campaigns, positions, applications, interviewers, slots, rooms, schedules, assessments và results đến từ API.

B. Routing/Auth
- Sign-in cho Executive, Applicant, Interviewer.
- Demo accounts cấp sẵn.
- Mỗi role có home và navigation phù hợp.
- Protected route chuyển người chưa đăng nhập tới Sign In.
- Sau Sign In quay về protected route ban đầu.
- Role khác không được truy cập UI của role không phù hợp.
- Sign Out xóa session/token.
- Auth user và token được quản lý trong shared context, truy cập bằng hook.
- Request sau đăng nhập mang Authorization: Bearer <token>.
- Security enforcement thật bằng JWT/DB là PA#4, không bắt buộc trong PA#3.

C. API States
Mọi màn hình load dữ liệu phải có:
- Loading.
- Error và Retry.
- Empty state.
- Successful data state.

D. Forms
- Label rõ ràng cho mỗi input.
- Inline validation.
- Error gắn với đúng field.
- Hiển thị lỗi 400 từ API vào field tương ứng.
- Giữ dữ liệu người dùng đã nhập sau khi bị lỗi.
- Chống duplicate submit.
- Không reload toàn bộ trang khi submit.

E. Responsive/Accessibility
- Kiểm tra 360px, 768px và 1280px.
- Không horizontal page scroll.
- Không nội dung bị cắt.
- Tap targets độc lập cao ít nhất 44px ở 360px.
- Table rộng phải được xử lý trong wrapper hoặc responsive layout.
- Semantic landmarks.
- Một h1 trên mỗi screen.
- Không skip heading levels.
- Navigation dùng links.
- Actions dùng buttons.
- Form inputs có labels.
- Rendered HTML đạt 0 W3C validation errors.

==================================================
2. MAIN FLOW C1–C11 — FULL CHECKLIST
==================================================

Dữ liệu theo example trong ClubFlow Final Brief:
- Một club.
- Một campaign.
- Một timeline nhất quán.
- Student A apply hai positions: Content và Communications.
- Hai application A01 và A02 độc lập.
- Screening, scheduling, assessment và final result là các giai đoạn riêng.

C1 — PUBLIC PUBLISHED CAMPAIGN
Role: Visitor

Kiểm tra:
- Visitor xem được campaign đã Published.
- Hiển thị description, opening/closing dates, instructions.
- Departments và positions với quotas, descriptions, requirements.
- Draft campaign không hiển thị công khai.
- Apply khi chưa sign-in chuyển đến Sign In.
- Sau Sign In, người dùng có thể tiếp tục.
- Nội dung lấy từ API.

C2 — SIGN-IN, ROLES, SIGN-OUT
Role: Everyone

Kiểm tra:
- Demo accounts của ba role.
- Sign In hoạt động qua API.
- Token và user được quản lý tập trung.
- Role-based landing page/navigation.
- Protected routes.
- Direct URL access và reload.
- Return URL sau Sign In.
- Cross-role route protection.
- Sign Out.
- Unknown route có Not Found.
- Browser Back hoạt động.

C3 — CREATE AND PUBLISH CAMPAIGN
Role: Executive

Kiểm tra:
- Campaign name.
- Host club.
- Description.
- Opening/closing dates.
- Application instructions.
- Departments.
- Positions.
- Quotas.
- Job descriptions.
- Requirements.
- Add/remove position rows.
- Save as Draft.
- Preview Campaign.
- Publish Campaign.
- Missing required field phải bị từ chối.
- Impossible dates phải bị từ chối.
- Inline field errors.
- Dữ liệu hợp lệ đã nhập không bị mất.
- Mutation phản ánh API response.

C4 — INTERVIEW SETUP
Role: Executive

Kiểm tra:
- Assign interviewer cho một hoặc nhiều positions.
- Chỉnh interviewer availability.
- Chọn rooms từ danh sách có sẵn.
- Configure interview date và available slots.
- Slot duration chung: 15, 20 hoặc 30 phút.
- Các lựa chọn được lưu qua API/mock.
- Giao diện phải hỗ trợ cấu hình, không chỉ hiển thị fixture read-only.

C5 — APPLICANT SUBMISSION
Role: Applicant

Kiểm tra:
- Fixed application form.
- Student information.
- PDF CV tối đa 5 MB.
- Motivation statement tối đa 300 words.
- Availability từ club-defined slots.
- Apply position thứ nhất.
- Apply position thứ hai độc lập.
- Apply trùng cùng position phải mở hồ sơ đã có.
- Closed campaign từ chối submission.
- Giữ thông tin đã nhập sau lỗi.
- Inline errors.
- Duplicate-submit prevention.
- HTTP API nhận yêu cầu.
- PA#3 mock có thể bỏ qua nội dung file upload, nhưng vẫn phải hỗ trợ luồng submission và phản hồi theo contract.

C6 — MY APPLICATIONS
Role: Applicant

Kiểm tra:
- Một row cho mỗi application.
- Submitted/Pending Review.
- Shortlisted.
- Rejected.
- Confirmed interview time và room chỉ sau confirmation.
- Final Pass/Fail chỉ khi đã published.
- Applicant chỉ thấy application của mình.
- A01 và A02 có trạng thái độc lập.
- Empty state hoạt động.

C7 — APPLICATION REVIEW
Role: Executive

Kiểm tra:
- Application statistics.
- Search.
- Filter.
- Sort.
- Pagination.
- CSV export.
- Application drawer.
- CV và motivation statement đọc được.
- Drawer và list cùng dễ đọc.
- Internal screening notes.
- Shortlist Candidate.
- Reject.
- Chỉ thay đổi application được chọn.
- Đóng drawer không reset filters.
- Continue to Interview Scheduling khi có Shortlisted.
- Stats tính từ API data.

C8 — DRAFT INTERVIEW SCHEDULING
Role: Executive

Kiểm tra:
- Interview date.
- Time window.
- Slot duration.
- Generate Draft.
- Proposed.
- Unassigned cùng lý do.
- Conflict cùng thông tin overlap.
- Edit assignment.
- Resolve conflict.
- Assign Slot thủ công.
- Save Changes.
- Export schedule.
- Chỉ Shortlisted applications tham gia.
- Conflict theo applicant, interviewer hoặc room.
- Cùng applicant với hai applications không được có overlapping interviews.
- Adjacent non-overlapping slots phải được chấp nhận.

LƯU Ý:
Rubric PA#3 cho phép mock trả fixed schedule responses từ mock/data/. Không bắt buộc implement first-fit scheduling engine thật ngay ở PA#3.

Tuy nhiên, các conflict và status hiển thị phải hợp lý, nhất quán và có thể demo.

C9 — APPROVE AND CONFIRM
Role: Executive

Kiểm tra:
- Confirmation summary.
- Không cho confirm nếu còn Unassigned.
- Không cho confirm nếu còn Conflict.
- Thông báo rõ applications cần xử lý.
- Đúng điều kiện applications closed/reviewed theo business brief.
- Sau confirmation:
  + Campaign/schedule hiển thị read-only.
  + Editing disabled.
  + Regeneration disabled.
  + Confirmed state hiển thị.
- Sau confirm, không tự công bố final recruitment result.

C10 — INTERVIEWER WORKSPACE
Role: Interviewer

Kiểm tra:
- Assigned confirmed interviews.
- Chỉ CV của assigned applications.
- Application details phù hợp.
- Assessment form.
- Mỗi interview tối đa một assessment theo main flow.
- Không được gửi assessment cho interview không được giao.
- Không lộ internal screening notes.
- Loading/error/empty states.

C11 — FINAL RESULTS AND NOTIFICATIONS
Roles: Executive, Applicant

Kiểm tra:
- Executive record Pass/Fail per application.
- Executive publish final result.
- Applicant thấy result thuộc application tương ứng.
- Result chưa published không hiển thị như kết quả cuối.
- In-app notification sau publish.
- Không tự đồng nhất shortlisted với final pass.
- A01 và A02 phải có decisions/results độc lập.

Với từng C1–C11, audit:
- UI.
- Route.
- Component.
- Hooks.
- Service.
- HTTP request.
- Mock response.
- Shared state.
- Validation.
- Exception paths.
- Tests.
- Evidence.

Status:
DONE: được chứng minh hoạt động đầy đủ với PA#3 mock HTTP.
PARTIAL: có triển khai nhưng thiếu yêu cầu.
MISSING: chưa có.
UNVERIFIED: tồn tại code nhưng chưa đủ bằng chứng runtime.

==================================================
3. FIX THESE — MANDATORY
==================================================

Kiểm tra trên toàn bộ runtime UI:

1. Timeline nhất quán giữa mọi screen.
2. Mỗi screen có title đúng ngữ cảnh.
3. Application drawer và list đều đọc được.
4. Counts phải cộng đúng và tính từ API data.
5. Scheduling Conflict phải là overlap có thật.
6. Không có người vừa là Applicant vừa là Interviewer trong sample data.
7. Không có wording "Verified Student", "100% verified" hoặc university verification không thuộc scope.
8. Không có template footer như Privacy Policy, Terms of Service, Support Center hay copyright mẫu sai.

Mỗi lỗi cần:
- Location.
- Evidence.
- Impact.
- Cách khắc phục đề xuất.
- Mức độ nghiêm trọng.

==================================================
4. API CONTRACT — MANDATORY
==================================================

Contract bắt buộc nằm trong docs/api/.

docs/api/README.md phải có:
- Base path /api.
- Authorization: Bearer <token>.
- Một error response shape nhất quán.
- HTTP status code conventions.
- Endpoint inventory table.
- Method, path, role, documentation file cho từng endpoint.

Mỗi resource documentation phải nêu:
- Endpoint và role.
- Path/query parameters.
- Request body fields và types.
- Required/optional.
- Limits/validation.
- Success response.
- 400 field errors.
- 401 unauthenticated.
- 403 forbidden.
- 404 not found.
- 409 conflict, khi phù hợp.
- Ít nhất một executable request/response example cho mỗi endpoint.
- ## Changes section.

Định dạng examples bắt buộc:
- Request trong fenced http block.
- Response trong fenced http block.
- Response bắt đầu bằng HTTP/1.1 <status>.
- Protected example sử dụng:
  Authorization: Bearer {{token:studentA}}
- Upload có thể dùng fenced sh với curl.

Ví dụ về ý nghĩa:
- POST /api/auth/login phải có example trả token và user.
- GET /api/applications phải có example với response fields chính xác.
- Lỗi validation phải dùng cùng error shape ở các resources.

Kiểm tra:
A. Mọi HTTP request của frontend có nằm trong contract?
B. Mọi endpoint trong contract có example?
C. Example có đúng HTTP method/path/response status?
D. Request body có thể thực sự gửi được?
E. Field names có khớp với frontend và mock?
F. Có một error shape xuyên suốt?
G. Có coverage đủ C1–C11?
H. Có ghi ## Changes đúng lịch sử?
I. Có contract-first commit history?
J. Có endpoint dư, không dùng hoặc không thuộc scope?

Quan trọng:
Không được tạo hoặc sửa contract chỉ để khớp một implementation sai.
Nếu contract và implementation mâu thuẫn, phải báo rõ.

==================================================
5. MOCK HTTP SERVER — MANDATORY
==================================================

Yêu cầu:
- File: mock/server.mjs.
- Seed data: mock/data/.
- Node.js built-in modules only.
- Không npm install riêng cho mock.
- PORT default: 3001.
- Start bằng: node mock/server.mjs.
- State thay đổi trong RAM và reset khi restart.
- Demo accounts có role tương ứng.
- Mock authentication token có thể là token giả.
- Token cần tiếp tục hợp lệ sau khi mock restart.
- Log một dòng cho mỗi request: method, path, status.

Bốn modes bắt buộc:

normal:
- Response khoảng 150 ms.
- Trả dữ liệu và mutations bình thường.

slow:
- Response khoảng 2 giây.
- Frontend phải hiển thị loading.

error:
- HTTP 500 với error shape thống nhất cho mọi request ngoại trừ sign-in.
- Frontend phải hiển thị error và Retry.

empty:
- Mọi list trong response là [].
- Áp dụng cả nested lists.
- Single-object endpoints vẫn trả object.
- Frontend hiển thị empty states và counts bằng 0.

Phải chứng minh được:
- Campaign publish success/failure.
- Duplicate application.
- Two distinct applications A01/A02.
- Screening decisions.
- Proposed, Conflict, Unassigned.
- Confirmation refusal.
- Confirmed schedule.
- Assessment.
- Published result và notification.

Không bắt buộc mock tính first-fit tự động.
Không bắt buộc mock lưu data xuống PostgreSQL.
Không bắt buộc JWT thật hoặc Multer thật.

==================================================
6. CONTRACT-CHECKER REQUIREMENTS
==================================================

Công cụ chính thức: contract-check.mjs.

Cách chạy theo tài liệu:
Terminal 1:
  node mock/server.mjs

Terminal 2:
  node tools/contract-check.mjs --base http://localhost:3001

Audit xem checker đã có trong repo chưa.

Nếu được lưu ở path khác, chỉ rõ path và command tương ứng.

Checker:
- Đọc docs/api/README.md trước.
- Đọc các docs/api/*.md khác theo alphabet.
- Đọc examples từ trên xuống dưới.
- Gửi đến cùng một mock server instance.
- Các mutations ảnh hưởng examples tiếp theo.
- Vì vậy phải restart mock trước mỗi full run.
- HTTP request block phải có answer block.
- Mỗi endpoint ở README phải có example.
- Mỗi example phải thuộc endpoint được khai báo.
- So sánh HTTP status code.
- So sánh JSON field names ở mọi cấp.
- Differences in values mặc định được ghi NOTE.
- --strict-values có thể dùng để kiểm tra chặt hơn.
- Auth tokens được lấy từ Demo accounts table trong FRONTEND.md.
- File uploads có thể dùng curl examples.

Demo accounts table cần có cột:
Name in examples | Role | E-mail or User name | Password

Audit:
- Checker có thể chạy không?
- Contract parser có đọc được examples không?
- Có endpoint mismatch không?
- Có response schema mismatch không?
- Có thiếu demo account không?
- Có phụ thuộc external network không?
- Có trường hợp test chạy lần hai sai do không restart mock không?
- Có chỉnh contract một cách thiếu căn cứ để checker pass không?

Nếu không thể chạy checker an toàn trong read-only audit, báo NOT EXECUTED và hướng dẫn command cần chạy sau.

==================================================
7. REACT HTTP INTEGRATION
==================================================

Frontend bắt buộc gọi relative API paths:
  /api/...

Không được phụ thuộc absolute localhost API URL trong runtime.

Vite proxy:
- server.proxy chuyển /api tới http://localhost:3001.
- preview.proxy cũng chuyển /api tới http://localhost:3001.

Kiểm tra toàn bộ frontend:
- API client.
- Authentication headers.
- Request/response handling.
- Service layers.
- Context/hooks.
- Mutations.
- Error handling.
- File/FormData handling.
- Loading state.
- Empty state.
- Retry.
- Request duplication.
- Debounce/cancellation cho search.
- Route reload.
- Browser Back.
- State synchronization.

Đặc biệt:
Không chấp nhận domain services vẫn import browser in-memory mock store làm nguồn dữ liệu chính.

Các fixtures có thể tồn tại trong mock/data/, nhưng màn hình phải lấy data từ HTTP API.

Sau mutation, UI cần cập nhật từ API response mà không hard reload trang.

==================================================
8. PRODUCT OWNER DECISIONS Q-01–Q-07
==================================================

Đây là nội dung nghiệp vụ được cung cấp để đối chiếu.
Nếu repository thiếu nguồn hoặc URL bài đăng công khai, báo thiếu reference link; không tự phủ nhận nội dung hoặc bịa nguồn.

Q-01 — First-Fit
- Chỉ Shortlisted applications.
- Sắp application theo submission time tăng dần.
- Nếu bằng nhau dùng application ID.
- Thử time slots sớm nhất.
- Trong mỗi slot, duyệt interviewers và rooms theo thứ tự cố định.
- Lấy tổ hợp hợp lệ đầu tiên.
- Không xếp được thì Unassigned kèm reason.
- Không yêu cầu global optimization.
- Implementation first-fit thật thuộc PA#4; PA#3 mock có thể dùng fixed answers.

Q-02 — Time conventions
- Vietnam timezone UTC+7.
- Chỉ nhận application trước closing timestamp.
- Nếu closing date chỉ có ngày, nhận hết ngày được chọn và đóng lúc 00:00 ngày kế tiếp.

Q-03 — Published campaign editing
- Published không có nghĩa là mọi field lập tức read-only.
- Executive có thể thêm position, đổi quota, gia hạn/đóng đơn sớm trong giai đoạn phù hợp.
- Không xóa position nếu đã có applications gắn vào.
- Interview date và applicant availability slots bị khóa sau application hợp lệ đầu tiên.
- Khi Confirmed, campaign configuration, submitted applications và confirmed schedule read-only.

Q-04 — Assessments
- Một assessment cho mỗi assigned, completed interview.
- Form nhận xét đơn giản là đủ.
- Criteria scores và đề xuất Pass/Fail là optional.
- Executive quyết định final result.

Q-05 — Notifications
- In-app notification sau khi Executive publish result là bắt buộc.
- Email/Brevo không bắt buộc cho PA#3.

Q-06 — Optional edits
- Applicant edit/withdraw submitted application: optional, chỉ khi campaign còn nhận đơn và application chưa reviewed.
- Interviewer edit submitted assessment: optional, chỉ assigned interviewer, trước final result publication.
- Confirmed schedule read-only; không yêu cầu post-confirmation rescheduling.

Q-07 — CV privacy
- PDF tối đa 5 MB.
- Applicant chỉ xem CV của mình.
- Interviewer chỉ xem CV của assigned applications.
- Executive xem CV trong campaign quản lý.
- Quyền áp dụng cả direct file URL trong final backend.
- PA#3 kiểm tra role UI/mock behavior; PA#4 kiểm tra enforcement bằng backend.

Đối chiếu các quyết định này với:
- docs/requirements/
- docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md
- SCREEN_REQUIREMENTS.md
- UI flow
- Service/mocks
- API contract
- Tests

Chỉ rõ mâu thuẫn nào là bug thật, mâu thuẫn nào là optional và mâu thuẫn nào thuộc PA#4.

==================================================
9. KNOWN PREVIOUS AUDIT FINDINGS
==================================================

Một cuộc audit trước từng báo cáo repository ở trạng thái:

- Branch dev.
- HEAD 9144868.
- Working tree sạch.
- React 19, Vite 8, React Router 7.
- React source đang nằm ở frontend/.
- Có 5 business screens, Sign In và My Profile.
- Có Atomic Design.
- Có frontend/src/services/.
- Có frontend/src/mocks/store.js.
- Chỉ GET /api/health gọi HTTP backend.
- Domain services vẫn dùng mock store.
- Chưa có complete docs/api/.
- Chưa có mock/server.mjs.
- Chưa có normal/slow/error/empty modes ở HTTP level.
- C4 chưa có đầy đủ interviewer assignment và availability editor.
- Scheduling Generate Draft dùng template, không phải first-fit.
- Existing root/backend scaffolds chỉ phục vụ groundwork của PA#4.
- Frontend có nhiều tests nhưng chưa chứng minh PA#3 HTTP integration.
- SELF_ASSESSMENT_REPORT.md còn placeholder.
- AI-LOG.md đã tồn tại.
- README và frontend docs đã có một số thông tin API readiness.

Đây chỉ là previous audit baseline, KHÔNG phải trạng thái chắc chắn của HEAD hiện tại.

Hãy:
1. Xác minh Git HEAD và working tree hiện tại.
2. Kiểm tra từng nhận định bằng code thật.
3. Báo item đã thay đổi kể từ audit cũ.
4. Không lặp lại kết luận cũ nếu source mới đã sửa.
5. Không coi first-fit engine, PostgreSQL hoặc JWT thật là điều kiện DONE bắt buộc của PA#3.

Đặc biệt ưu tiên reuse existing pages/components/hooks/services.
Không đề xuất rewrite toàn bộ nếu chỉ cần chuyển data source.

==================================================
10. OFFICIAL RUBRIC — 100 POINTS
==================================================

Đánh giá theo đúng chín tiêu chí:

RUBRIC 1 — WHOLE MAIN FLOW — 25
Top band: 22–25.
- C1–C11 chạy đầy đủ.
- Truy cập qua links/buttons.
- Đúng 3 roles.
- A01/A02 độc lập.
- Không có lỗi Fix These.

Bands:
22–25: full flow.
15–21: một/hai bước thiếu hoặc lỗi.
8–14: khoảng nửa luồng hoặc chỉ một role.
0–7: chủ yếu chỉ có screens/PA#2 prototype hoặc build không mở được.

RUBRIC 2 — ROUTING, SIGN-IN, SHARED STATE — 10
Top band: 9–10.
- Deep links và reload.
- Not Found.
- Back navigation.
- Auth redirects.
- Role restrictions.
- Token/user trong shared context.
- Authorization header.
- API response-driven updates.
- Filters preserved.

Bands:
9–10: đầy đủ.
5–8: một/hai lỗi.
1–4: chỉ navigate nội bộ hoặc role lấy từ URL/checkbox.
0: không có router/sign-in.

RUBRIC 3 — DATA FROM API — 10
Top band: 9–10.
- Empty mode mọi list và counts 0.
- Slow mode loading.
- Error mode error + Retry.
- Retry hoạt động khi normal trở lại.
- Không hardcoded domain data.
- Không request lặp khi chờ.
- Search debounce/cancel.

Bands:
9–10: đầy đủ.
5–8: một/hai màn hình lỗi.
1–4: đa số hardcoded hoặc freeze on error.
0: không có request đến mock.

RUBRIC 4 — FORMS — 10
Top band: 9–10.
- Visible label mỗi input.
- Validation trước gửi.
- Field errors inline và accessible.
- API 400 mapping đúng field.
- Preserve user input.
- Prevent double submit.
- PDF ≤5 MB, SOP ≤300 words.
- Đầy đủ các main-flow forms C2/C3/C4/C5/C7/C8/C10/C11.

Bands:
9–10: đầy đủ.
5–8: một/hai lỗi.
1–4: thiếu validation hoặc reload trang.
0: không có working forms.

RUBRIC 5 — CONTRACT AND MOCK — 15
Top band: 14–15.
- README contract hoàn chỉnh.
- Endpoint schemas/errors/examples.
- Mọi frontend request có trong contract.
- Mọi example khớp mock.
- Contract committed trước consumer code.
- Changes history.
- Node built-in only.
- Four mock modes.

Bands:
14–15: đầy đủ.
9–13: thiếu một số endpoints/examples/errors.
4–8: contract đến sau code, thiếu Changes hoặc mock cần npm install.
0–3: không có contract/mock HTTP.

RUBRIC 6 — RESPONSIVE, SEMANTIC, VALID — 5
Top score: 5.
- 360/768/1280.
- No page horizontal scroll.
- 44px tap targets at 360px.
- Semantic HTML.
- One h1, proper headings.
- Correct links/buttons.
- 0 W3C rendered HTML errors.

Bands:
5: hoàn chỉnh.
3–4: một/hai lỗi.
0–2: nhiều màn hình vỡ hoặc semantics kém.

RUBRIC 7 — BRIEF AND RULES FILE — 10
Top band: 9–10.
- brief.md phản ánh các prompt thật đã giao assistant.
- Rules file phản ánh React stack và API contract.
- Chỉ gọi endpoints trong contract.
- Không sửa contract/mock ngoài phạm vi đã duyệt.
- Relative /api only.
- No component business hardcode.
- Loading/error/empty.
- No unauthorized dependencies.
- Responsive/semantic constraints.
- C1–C11, four modes, direct routes và widths là acceptance gates.

Bands:
9–10: đầy đủ, specific.
5–8: thiếu một vài constraints hoặc rules cũ.
1–4: brief quá sơ sài.
0: không có brief.

RUBRIC 8 — AI-LOG.MD — 10
Top band: 9–10.
- Một entry cho mỗi assistant task trong PA#3.
- Tool và request rõ ràng.
- Changed/Rejected cụ thể.
- Ít nhất hai incident có evidence thực tế về lỗi assistant, check phát hiện và cách xử lý.
- Có commit tương ứng.
- Không tạo log hồi tố giả.
- Giữ entries cũ nguyên vẹn.

Bands:
9–10: đầy đủ và traceable.
5–8: log thật nhưng Changed/Rejected chung chung.
1–4: chỉ một entry hoặc viết lại cuối kỳ.
0: missing hoặc sai history.

RUBRIC 9 — COMMIT HISTORY — 5
Top score: 5.
- Contract commit trước mock và frontend consumer.
- Mock commit trước frontend integration.
- Mỗi step/group có commit riêng.
- Commit message cụ thể.
- Có commit baseline trước assistant requests.
- Commit đúng tác giả.
- History phản ánh thực tế.

Bands:
5: lịch sử đúng và rõ.
2–4: mixed commits hoặc contract đến muộn.
0–1: mọi thứ trong một commit hoặc không có .git.

CHẤM ĐIỂM:
- Có điểm đề xuất cho từng tiêu chí.
- Mỗi điểm phải kèm evidence.
- Không đủ evidence: đánh dấu PROVISIONAL.
- Không dùng điểm tuyệt đối như chắc chắn đã chấm.
- Không tự chấm 100 nếu chưa có execution evidence.
- Nếu không thể chạy runtime, thể hiện rõ mức độ không chắc chắn.
- Phân biệt earned evidence với khả năng đạt điểm sau khi fix.

==================================================
11. SUBMISSION REQUIREMENTS
==================================================

Deadline:
November 30, 2026, 22:00.

Một ZIP repository cho nhóm.
Tên:
<StudentID1>-<StudentID2>-<StudentID3>_<total>.zip

Student IDs theo thứ tự tăng dần.

ZIP phải bao gồm:
- Hidden .git directory.
- client/ source.
- client/dist/ được build sau thay đổi cuối.
- mock/server.mjs.
- mock/data/.
- docs/api/.
- Project rules file.
- FRONTEND.md.
- brief.md.
- AI-LOG.md với ## PA#3.
- SELF_ASSESSMENT_REPORT.md.

Không bao gồm:
- node_modules/.
- .env chứa secrets.
- Các artifact tạm không cần thiết.

FRONTEND.md phải có:
1. Team members, IDs.
2. How to run mock và frontend.
3. Demo accounts:
   exec
   studentA
   int-content
   int-comms
   (và các tài khoản cần thiết khác)
4. Routes table: path, role, C-step, endpoint.
5. Product Owner decisions với links nguồn nếu có.
6. Libraries và lý do sử dụng.
7. Not done.

Lưu ý:
- Route chỉ hợp lệ sau một bước nhất định phải ghi rõ.
- Route mở trước bước đó phải có message hợp lý, không blank.
- Các tài liệu yêu cầu viết English.
- Text giao diện có thể viết Vietnamese.
- Self-assessment phải ghi từng criterion, claimed points, evidence và limitations.
- Tổng self-assessment phải khớp tên ZIP.
- Rubric có honesty adjustment nếu khai điểm lệch quá lớn hoặc thiếu Self-Assessment.

Kiểm tra cấu trúc submission nhưng KHÔNG tạo ZIP trong lần audit này.

==================================================
12. AUDIT PROCEDURE
==================================================

Thực hiện theo thứ tự:

STEP A — SOURCE INVENTORY
- Git branch/HEAD/status.
- Folder tree.
- Dependencies.
- Frontend/backend/mock structure.
- Documentation.
- Tests/quality gates.
- File duplication.
- Runtime versus reference-only assets.

STEP B — PA#3 STRUCTURAL COMPLIANCE
- React/Vite.
- client/.
- Router.
- relative /api.
- proxy + preview.proxy.
- mock/server.mjs.
- mock/data/.
- docs/api/.
- client/dist/.
- Required documentation.

STEP C — C1–C11 TRACE
Theo dõi thực tế:
route -> page -> hook -> service -> HTTP API -> mock -> response -> UI update.

Chỉ ra chỗ flow bị đứt.

STEP D — CONTRACT TRACE
Lập endpoint inventory:
- Expected by flow.
- Defined in contract.
- Implemented in mock.
- Called by frontend.
- Covered by example.
- Covered by test.

STEP E — FORMS AND STATES
Kiểm tra UI validations, API errors, loading/error/empty, state updates, privacy, interaction.

STEP F — RUBRIC SCORING
Chấm đủ 9 tiêu chí kèm evidence và confidence.

STEP G — COMMIT/HARNESS
Kiểm tra contract-first history, AI-LOG, brief, rules.

STEP H — SUBMISSION READINESS
Đối chiếu tất cả deliverables.

STEP I — GAP PRIORITIZATION
Đề xuất implementation phases tối thiểu, ưu tiên tận dụng source hiện tại.

==================================================
13. REQUIRED REPORT FORMAT
==================================================

Trả về báo cáo có đầy đủ:

I. EXECUTIVE SUMMARY
- Repository hiện đang ở trạng thái nào?
- Các phần đã hoàn thiện?
- Các phần thiếu bắt buộc?
- Mức độ sẵn sàng PA#3.
- 3–5 blockers quan trọng nhất.

II. REPOSITORY & GIT INVENTORY
- Tree.
- Tech stack.
- Current branch/HEAD.
- Working tree.
- Key modules.
- Commit history.
- Các thay đổi kể từ previous audit.

III. PA#3 STRUCTURAL COMPLIANCE MATRIX
Columns:
Requirement | Expected | Actual | Status | Evidence | Action

IV. C1–C11 COVERAGE MATRIX
Columns:
Step | Role | UI | API | Mock | Validation | Tests | Status | Evidence | Missing Work

Phải có đúng 11 bước.
Không gộp hoặc bỏ qua bước nào.

V. API CONTRACT GAP ANALYSIS
- Endpoint inventory.
- Missing endpoints.
- Contract schema problems.
- Missing examples.
- Missing error responses.
- Token/accounts issues.
- Contract-first history.
- Contract checker readiness.

VI. MOCK SERVER GAP ANALYSIS
- Node built-in requirement.
- Startup/port.
- Demo data.
- Mutations.
- Authentication.
- Four modes.
- Request logging.
- Restart behavior.
- Contract consistency.

VII. REACT INTEGRATION GAP ANALYSIS
- Service imports.
- Browser mocks.
- HTTP API client.
- Auth context/token.
- Relative paths.
- Vite proxies.
- State changes.
- Loading/error/empty.
- Search/retry.
- Forms.

VIII. BUSINESS RULES AND FIX THESE
- Q-01–Q-07 consistency.
- Scheduling conditions.
- Screening/applicant ownership.
- Timeline.
- Sample fixtures.
- UI issues.

IX. OFFICIAL RUBRIC SCORING
Table:
Criterion | Max | Estimated Current | Evidence | Confidence | Gap | Priority

Nine criteria.
Total /100.
Cảnh báo nếu điểm chỉ là provisional.

X. REUSABLE SOURCE ANALYSIS
Phân nhóm:
KEEP
REFACTOR
MOVE
REPLACE
REMOVE (only if justified)
CREATE

Chỉ ra file paths cụ thể.
Không đề xuất rewrite nếu không cần.

XI. PRIORITIZED BACKLOG
P0 — Blocking.
P1 — Required for full marks.
P2 — Quality/polish.
P3 — Out of scope for PA#3 / defer to PA#4.

Mỗi item cần:
- Description.
- Files.
- Rubric criteria.
- Dependency.
- Acceptance criteria.
- Estimated complexity: S/M/L.
- Risk of regression.

XII. PHASED IMPLEMENTATION PLAN
Đề xuất phases tối thiểu.

Thứ tự mặc định để xem xét:
1. Requirements + repository alignment.
2. API contract.
3. HTTP mock.
4. React HTTP integration.
5. Functional gap fixes.
6. Testing + submission.

Có thể thay đổi nếu source đã hoàn thành một phần.

Mỗi phase cần:
- Goal.
- Exact scope.
- Files impacted.
- Dependencies.
- Acceptance criteria.
- Manual tests.
- Automated checks.
- Proposed commit boundary.
- Có cần human review trước commit không?
- Phần Hoàng hoặc Nguyệt có thể làm độc lập.

Phân công hiện tại:
- Hoàng: Executive Campaign Management, Application Review/Final Results, Interview Scheduling.
- Nguyệt: Applicant Portal, Interviewer Workspace.
- Shared API contract/mock/auth phải được thống nhất trước khi chia triển khai.

XIII. NEXT ACTION
Đề xuất đúng MỘT phase đầu tiên.

Giải thích:
- Vì sao phase này là ưu tiên?
- Cần chỉnh file nào?
- Điều kiện DONE?
- Cần review những gì trước commit?
- Những thứ tuyệt đối không nên sửa ở phase này?

==================================================
14. FINAL INSTRUCTIONS
==================================================

Không viết code mới.

Không sửa source.

Không commit.

Không tự đi sang implementation phase.

Không đánh giá thiếu rubric vì toàn bộ yêu cầu PA#3 chính thức đã được tích hợp trong prompt này.

Không tuyên bố first-fit, PostgreSQL, production JWT hoặc backend Express là bắt buộc hoàn thiện ở PA#3.

Không lấy completion của React UI làm bằng chứng API integration.

Không dựa vào số lượng tasks checked để kết luận DONE.

Mọi finding phải có evidence cụ thể hoặc nhãn UNVERIFIED.

Mục tiêu cuối là giúp nhóm biết chính xác:
- Đã có những gì.
- Còn thiếu những gì theo 100 điểm PA#3.
- Tái sử dụng được những gì.
- Cần làm những phase nào.
- Phase tiếp theo nên bắt đầu ở đâu.

Sau khi hoàn tất báo cáo, DỪNG LẠI và chờ tôi review trước khi thực hiện bất kỳ thay đổi nào.
`````

## 2026-11-17 — Request 3 — Phase 1 Requirements and Repository Alignment

**Record type:** Exact prompt available from the user message that authorized Phase 1 implementation.

**Summary (non-verbatim):** Authorized the Git-aware `frontend/` to `client/` migration and documentation/rule alignment while prohibiting contract, mock, business, backend, database, dependency, commit, and push changes.

**Exact prompt (verbatim):**

`````text
Bạn là Senior React Engineer của dự án ClubFlow.

Thực hiện Phase 1 — PA#3 Requirements & Repository Alignment.

Đây là implementation phase, nhưng chưa được phép tự commit.

BỐI CẢNH:

- PA#3 yêu cầu React/Vite trong client/.
- Source hiện nằm ở frontend/.
- UI, components, hooks và services đã tồn tại.
- API contract và HTTP mock chưa được triển khai.
- Các source nghiệp vụ hiện tại phải được bảo toàn.

NHIỆM VỤ:

1. Kiểm tra Git branch, HEAD và working tree.
   Nếu có thay đổi chưa commit, báo lại và không ghi đè.

2. Lập inventory các đường dẫn phụ thuộc frontend/:

   - Root package.json/workspaces/scripts
   - Vite/Vitest/ESLint configuration
   - Import paths và aliases
   - Test scripts
   - Documentation
   - Build/output paths
   - CI workflows nếu có

3. Chuẩn hóa frontend/ thành client/ bằng Git-aware move.

   - Giữ toàn bộ React source.
   - Không rewrite components.
   - Không đổi UI behavior.
   - Không thay đổi business logic.
   - Cập nhật các đường dẫn cần thiết.
   - Không di chuyển backend hoặc database.

4. Kiểm tra AGENTS.md:

   - Giữ những rules hợp lệ.
   - Bổ sung constraints cho PA#3:
     contract-first, HTTP mock-first,
     relative /api, no hardcoded business data,
     loading/error/empty states,
     no unauthorized contract/mock changes,
     preserve existing UI,
     no dependency changes without approval.
   - Không rewrite toàn bộ rules file nếu không cần.

5. Chuẩn bị brief.md:

   - Chỉ ghi những yêu cầu/prompt PA#3 thực tế
     được cung cấp cho assistant và có thể xác minh.
   - Không bịa lại prompt lịch sử.
   - Không tuyên bố các bước chưa thực hiện là đã DONE.

6. Chuẩn bị FRONTEND.md:

   - Đúng các section bắt buộc theo rubric.
   - Chỉ điền thông tin đã xác minh.
   - Demo accounts, routes và team details
     chưa xác minh thì đánh dấu cần bổ sung.
   - Không tạo fake evidence hoặc fake test results.

7. Kiểm tra cấu trúc client/ sau move.

8. Nếu môi trường cho phép, chạy:

   - npm run lint
   - npm test
   - npm run build
     theo đúng scripts thực tế.

   Không được sửa hoặc bỏ test chỉ để pass.
   Nếu một command không chạy được, báo nguyên nhân.

9. Review toàn bộ diff:

   - Files moved
   - Files modified
   - Behavior changes (nếu có)
   - Unexpected modifications
   - Test/build results

RÀNG BUỘC:

- Không implement API contract trong phase này.
- Không tạo HTTP mock server.
- Không sửa domain services.
- Không chỉnh C1–C11 business logic.
- Không đụng Express/PostgreSQL.
- Không tự commit hoặc push.
- Không cài dependency khi chưa được duyệt.

OUTPUT:
I. Summary
II. Files moved/modified
III. Git diff review
IV. Test/build results
V. PA#3 structural compliance
VI. Remaining issues
VII. Proposed commit boundaries

Đề xuất tách commit:
A. refactor: move React frontend into client
B. docs: align PA3 frontend requirements and rules

Không thực hiện hai commit này.
Dừng lại để tôi review và phê duyệt.
`````

## 2026-11-17 — Request 4 — Phase 1 Documentation Finalization

**Record type:** Exact prompt available from the current user message.

**Summary (non-verbatim):** Approved the workspace migration technically and requested documentation-only corrections for prompt history, AI logging, demo account labeling, and historical Spec Kit accuracy.

**Exact prompt (verbatim):**

`````text
Review and finalize PA#3 Phase 1 documentation only.

The React workspace migration is approved technically.
Do NOT repeat the move or modify application code.

Fix the following:

1. brief.md

- Preserve a truthful history of actual assistant requests.
- Include the original prompts verbatim when available.
- Clearly distinguish exact prompts from summaries.
- Do not reconstruct or invent missing prompts.
- Keep chronological order.

2. AI-LOG.md

- Add the Rejected field to the Phase 1 entry.
- Record only genuine rejected suggestions or changes.
- Use "Rejected: None" if nothing was rejected.
- Verify that the Tool field correctly identifies the
  assistant used for the task.
- Preserve all existing historical entries.

3. FRONTEND.md

- Ensure the Demo Accounts section clearly distinguishes
  existing browser-demo accounts from required PA#3 accounts.
- Document required handles:
  exec, studentA, int-content, int-comms.
- Use the official "Name in examples" column convention.
- Do not claim these accounts work over HTTP yet.
- Keep unverified credentials clearly marked.
- Preserve the seven required FRONTEND.md sections.

4. Historical documentation

- Review Spec Kit sections that describe the original
  frontend/ implementation decisions.
- Preserve historical accuracy where appropriate.
- Use an explicit dated migration note rather than
  rewriting historical decisions as if client/ existed
  at the time.
- Do not modify old AI-LOG entries.

5. Check

- git diff --check
- git diff --cached --check
- Documentation consistency
- No unintended source or configuration changes

Do not implement API contracts or the mock server.
Do not modify React, backend, database or dependencies.
Do not commit or push.

Return the final documentation diff for review.
`````
