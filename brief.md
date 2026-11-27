# ClubFlow PA#3 Assistant Request History

## Record Policy

This file records only assistant requests available from the current conversation and its attached prompt files. Entries are ordered by conversation sequence because exact request times were not supplied.

- **Exact prompt (verbatim)** means the prompt text is reproduced from an available user message or attached prompt file. Wording, spelling, and structure are preserved; only line-ending encoding is normalized.
- **Summary (non-verbatim)** is a labeled navigation aid and is not a substitute for the exact prompt.
- Missing or unavailable prompts are not reconstructed.

## Language of this file

The PA#3 brief records the prompts exactly as they were given to the assistants. Requests 4, 5 and 6 — including the two main implementation prompts (Request 5, the PA#3 master prompt, and Request 6, the remediation prompt) — were written in English. Requests 1–3 and 7–14 were written in Vietnamese, the team's working language. Each of those is kept verbatim and followed by an **English translation (non-verbatim)**; Request 2, which mostly restates the official PA#3 rubric, is translated as a section-by-section outline. Every request also has a one-line English summary.

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

**English translation (non-verbatim):**

`````text
You are the Senior Frontend Engineer and Technical Auditor of the ClubFlow project (CSC13008, PA#3).

CURRENT TASK: Only audit the whole open repository to assess progress from PA#2 to PA#3. Do NOT implement, do NOT create/edit/delete files, do NOT commit, push, checkout, reset, install packages or change configuration. After the audit, stop and wait for my approval of the plan.

1. SOURCES OF REQUIREMENTS
Read every requirement document in the repository, in this priority: the ClubFlow final project brief; the ClubFlow Business Description (if any); PA3.txt and the full PA#3 rubric (if any); the final project milestones/features/rubrics; Product Owner Q&A/decisions (if any); the PA#2 artifacts, README, brief.md, AI-LOG.md, SELF_ASSESSMENT_REPORT.md; the rules file (CLAUDE.md, AGENTS.md or equivalent); contract-check.mjs and its README if present.
If an important document is missing from the repo, report MISSING REFERENCE; do not infer rubric content you have not read.
Separate mandatory PA#3 requirements, what carries over from PA#2, and requirements that belong only to PA#4/PA#5/PA#6. Do not widen the scope.

2. AUDIT THE WHOLE REPOSITORY
Read the folder structure and the actual code. Check: the current Git branch, the working tree and uncommitted changes; the commit history for PA#2/PA#3; package.json, package-lock.json, scripts, dependencies; the PA#2 HTML/CSS/JS pages; client/, src/, components/, pages/, routes/, hooks/, services/ (if any); docs/api/, mock/, public/, assets/, test/, scripts/; documentation and harness configuration; duplicate, unused or confusing files.
Judge only from actual code, imports/call sites and evidence. A file existing does not mean the feature is finished. Do not claim a flow works without evidence.

3. CHECK THE PA#3 ARCHITECTURE
A. Is React + Vite in client/? B. Have the PA#2 pages become React components, or are they still static HTML? C. Is there a router and protected routes? D. Sign-in, sign-out and role-based navigation? E. An API client using relative /api paths? F. Does data come from the API or is it still hardcoded? G. Shared state for campaign, applications, schedule and session? H. Loading, error + Retry and empty states on data views? I. Responsive behaviour and semantic markup? J. UI, business logic and API services kept apart? K. Tests/build/checker and automatic checks configured?

4. AUDIT C1–C11
A table of all 11 steps: C1 Public Published Campaign; C2 Sign-in, Roles, Sign-out; C3 Create/Save Draft/Preview/Publish Campaign; C4 Interview Setup; C5 Applicant Submission; C6 My Applications; C7 Application Review; C8 Draft Interview Scheduling; C9 Approve & Confirm Schedule; C10 Interviewer Workspace & Assessments; C11 Final Results & In-app Notifications.
For each step: role; business requirement; current file/component/route; is there a UI; does the UI work; does it call the API; correct state transitions; validation/exception flow; Status DONE / PARTIAL / MISSING / UNVERIFIED; evidence (file path + line numbers); what is missing.
Check in particular: one applicant can apply for two positions independently; a duplicate application for the same position; Shortlist/Reject changes exactly one application; only Shortlisted applications enter scheduling; Conflict by applicant, interviewer and room; Unassigned has a reason; Confirm is blocked while Conflict/Unassigned remain; a confirmed schedule becomes read-only; an Interviewer sees only assigned interviews and CVs; an assessment belongs to the right application; final Pass/Fail appears only after publishing; internal screening notes are not shown to other roles; separate business states are not merged.

5. AUDIT THE API CONTRACT AND THE MOCK
docs/api/: written before the implementation? Enough endpoints for C1–C11? Request/response examples fenced as http? Status codes and one error shape? Role/authorization behaviour, pagination, filters, validation? Data and state transitions described? A Changes section?
mock/server.mjs: Node.js built-in modules only? The normal, slow, error, empty modes? Answers as the contract says? Deterministic demo data? Mutations update state sensibly? Can the PA#4 Express server replace the mock without changing how the front end calls the API? If contract-check exists, find how to run it and how far it passes now.

6. COMPARE WITH PA#2
Which HTML/CSS/assets can be reused; what must become React components; what should become shared layouts; what is not yet enough for PA#3; whether problems from the brief's Fix these list remain; any wrong or inconsistent UI or business logic. Never propose a full rewrite where reasonable reuse is possible.

7. AUDIT FORMS AND UI STATES
Required fields, date validation, quota, PDF <= 5 MB, statement <= 300 words, availability selection, inline errors, valid data kept after an error, disabled/loading submission, duplicate submission, responsiveness and keyboard accessibility.

8. AUDIT THE HARNESS AND DOCUMENTATION
The rules file, formatting, linting, tests, CI, AI-LOG.md, brief.md, FRONTEND.md, SELF_ASSESSMENT_REPORT.md, git history. Record only what has evidence. Do not create a fake AI log, fake commits or fake CI runs. Say what should be done early for PA#5, but do not do PA#5 in this phase.

9. REQUIRED OUTPUT
A report in Vietnamese: I. Executive Summary (actual state, what is done, main blockers, missing PA#3 requirements). II. Repository Inventory (short tree, important files, actual stack, git status/history). III. C1–C11 Coverage Matrix (11 rows, DONE/PARTIAL/MISSING/UNVERIFIED, evidence). IV. Rubric Gap Analysis (the 9 PA#3 criteria with evidence; estimate marks only with the full rubric and evidence, never as an official mark). V. Reusable PA#2 Assets (Keep, Refactor, Migrate, Replace, Missing, with technical reasons). VI. Architecture and Contract Gaps (routing, state, services, mock, contract, validation, tests). VII. Prioritized Backlog (P0 blocking, P1 required, P2 polish; each with files/scope, done condition, dependency). VIII. Suggested Implementation Phases (contract-first and mock-first, then React; each with goal, scope, dependencies, acceptance criteria, manual tests, commit boundary; parts that can run in parallel). IX. Next Recommended Action (exactly one first phase, and briefly why).

RULES: Edit no file. Run no command that changes the repository. Install no package or dependency. Create no git commit. Do not assume a feature is DONE because it has a UI. Skip none of C1–C11. Do not mix PA#3 and PA#4 requirements. Every conclusion needs evidence; if it cannot be verified, write UNVERIFIED. End with the audit report and wait for my review.
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

**English translation (non-verbatim):**

`````text
(English outline, section by section. Most of this prompt restates the official PA#3 rubric, which is in English in the course documents; sections that only restate it are summarised in one line.)

Role: Senior React Engineer, Software Architect and Technical Auditor of ClubFlow (CSC13008, 24KTPM1). Task: audit the whole open repository against PA#3 — Front end in React. The official PA#3 requirements and the business decisions are included below; use them as the standard and do not invent another rubric. AUDIT ONLY, DO NOT IMPLEMENT.

0. Working rules. Must: read the actual code, not only the README or task checklists; read the Git history and working tree; compare every conclusion with PA#3; give file paths and line numbers as evidence; tell implemented, simulated, documented and tested apart; tell an in-browser UI mock from the HTTP mock server; never call a feature DONE because a component or button exists; do not trust earlier audits, re-check the current source; do not widen the scope to PA#4 or PA#5; invent no requirement outside the rubric; write UNVERIFIED for what cannot be verified. Forbidden: editing, creating, deleting or moving any file; commit, push, merge, checkout, reset or rebase; installing dependencies; changing Git history; editing tests, mock, contract or documentation; fake AI-LOG entries, CI evidence, screenshots or test results; destructive commands; fixing what was found. Read-only commands (git status/log/show/diff, rg, reading package.json and the source) are allowed. If running tests/build would create or change files, do not run them on the working tree and write NOT EXECUTED; old test logs are not new results. Answer in Vietnamese, keeping technical terms, file names and rubric terms in English.

1. Official PA#3 requirements (restated from the rubric): React + Vite in client/, one CSS framework or plain CSS, React Router (BrowserRouter or HashRouter), no Next.js or Remix framework mode; C1–C11 reachable through real navigation; no main-flow business data hardcoded; contract first, committed, then the HTTP mock, committed, then React connected, then the flow validated; sign-in for the three roles with demo accounts, protected routes and return after sign-in, role refusal, sign-out clearing the session, user and token in one context read through a hook, Bearer header on every request (real JWT/DB security is PA#4); loading, error with Retry, empty and success states on every data screen; forms with labels, inline per-field errors, API 400 errors on the matching fields, values kept after an error, no double submit, no full-page reload; 360/768/1280 px with no horizontal scroll, 44 px tap targets at 360 px, wide tables in a wrapper, landmarks, one h1, no skipped heading level, links for navigation and buttons for actions, 0 W3C errors.

2. Main flow C1–C11 (restated from the rubric and the brief's example: Student A applies for Content and Communications, A01 and A02), with what each step must do and the checks for each.

3. Fix these (mandatory): one consistent timeline on every screen; each screen's own title; drawer and list both readable; counts that add up, computed from API data; a Conflict that is a real overlap; nobody both an Applicant and an Interviewer in the sample data; no "Verified Student", "100% verified" or university-verification wording; no template footer (Privacy Policy, Terms of Service, Support Center, wrong copyright).

4. API contract (mandatory, restated from the rubric), audited with: A. is every front-end request in the contract; B. does every endpoint have an example; C. are method, path and status right; D. can each request body really be sent; E. do field names match the front end and the mock; F. one error shape; G. coverage of C1–C11; H. a correct ## Changes history; I. contract-first commit history; J. unused or out-of-scope endpoints.

5. HTTP mock (mandatory): mock/server.mjs with data in mock/data/, Node built-in modules only, no npm install, PORT default 3001, started with node mock/server.mjs, state in memory and reset on restart, demo accounts with roles, a made-up token that stays valid after a restart, one log line per request (method, path, status), and the four modes normal (~150 ms), slow, error, empty as the rubric defines them.

6. Contract checker: the official tool is contract-check.mjs, run with the mock in one terminal and node tools/contract-check.mjs --base http://localhost:3001 in another; check whether it is in the repo; it reads README.md first, then the other files alphabetically, top to bottom, against one mock instance, so the mock must be restarted before each full run.

7. React HTTP integration: relative /api paths only, no absolute localhost URL at runtime; Vite server.proxy and preview.proxy both forward /api to http://localhost:3001; audit the API client, auth headers, request/response handling, service layers, context/hooks, mutations, error handling, file/FormData handling, loading and empty states.

8. Product owner decisions Q-01 to Q-07, given for comparison (report a missing source link rather than deny or invent content): Q-01 first-fit scheduling (Shortlisted only, by submission time then application ID, earliest slots first, interviewers and rooms in a fixed order, first valid combination, otherwise Unassigned with a reason, no global optimisation; the real first-fit belongs to PA#4 and the PA#3 mock may use fixed answers); Q-02 Vietnam time (UTC+7), applications only before the closing timestamp, a date-only closing date accepts the whole day and closes at 00:00 the next day; Q-03 to Q-07 on published-campaign editing, assessments, notifications, optional edits and CV privacy, as recorded in FRONTEND.md section 5.

9. Known findings of the previous audit: verify the current Git HEAD and working tree; re-check each finding against the real code; report what changed since; do not repeat a finding the new source has fixed; do not treat a first-fit engine, PostgreSQL or real JWT as a PA#3 DONE condition.

10. Official rubric, 100 points (restated: the nine criteria and their bands).

11. Submission requirements (restated): one ZIP named <StudentID1>-<StudentID2>-<StudentID3>_<total>.zip with IDs ascending, containing .git, client/ and a fresh client/dist/, mock/server.mjs and mock/data/, docs/api/, the rules file, FRONTEND.md (team, how to run, demo accounts, routes, product owner decisions, libraries, not done), brief.md, AI-LOG.md with ## PA#3, SELF_ASSESSMENT_REPORT.md.

12. Audit procedure, in order: Step A source inventory (branch/HEAD/status, tree, dependencies, front end/back end/mock structure, documentation, tests and quality gates, duplicate files, runtime versus reference-only assets); Step B PA#3 structural compliance (React/Vite, client/, router, relative /api, proxy and preview.proxy, mock/server.mjs, mock/data/, …); then the later steps for C1–C11, contract, mock, integration, business rules and rubric scoring.

13. Required report format: I. Executive summary; II. Repository and Git inventory; III. PA#3 structural compliance matrix; IV. C1–C11 coverage matrix; V. API contract gap analysis; VI. Mock server gap analysis; VII. React integration gap analysis; VIII. Business rules and Fix these; IX. Official rubric scoring; X. Reusable source analysis; XI. Prioritized backlog; XII. Phased implementation plan (requirements and repository alignment; API contract; HTTP mock; React HTTP integration; functional gap fixes; testing and submission); XIII. Next action.

14. Final instructions: write no new code; edit no source; no commit; do not move on to implementation; do not score against a missing rubric, since the official PA#3 requirements are all in this prompt; do not claim first-fit, PostgreSQL, production JWT or an Express back end are required to be finished in PA#3; React UI completion is not evidence of API integration; the number of checked tasks is not evidence of DONE; every finding needs specific evidence or the label UNVERIFIED. The goal is for the team to know exactly what exists and what is still missing.
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

**English translation (non-verbatim):**

`````text
You are the Senior React Engineer of the ClubFlow project.

Carry out Phase 1 — PA#3 Requirements & Repository Alignment.

This is an implementation phase, but you may not commit on your own.

CONTEXT:
- PA#3 requires React/Vite in client/.
- The source is currently in frontend/.
- The UI, components, hooks and services already exist.
- The API contract and the HTTP mock are not implemented yet.
- The current business source must be preserved.

TASKS:
1. Check the Git branch, HEAD and working tree. If there are uncommitted changes, report them and do not overwrite them.
2. Inventory the paths that depend on frontend/: root package.json/workspaces/scripts; Vite/Vitest/ESLint configuration; import paths and aliases; test scripts; documentation; build/output paths; CI workflows if any.
3. Turn frontend/ into client/ with a Git-aware move: keep all React source; do not rewrite components; do not change UI behaviour; do not change business logic; update the paths that need it; do not move the back end or the database.
4. Check AGENTS.md: keep the valid rules; add the PA#3 constraints (contract-first, HTTP mock-first, relative /api, no hardcoded business data, loading/error/empty states, no unauthorised contract/mock changes, preserve the existing UI, no dependency changes without approval); do not rewrite the whole rules file if not needed.
5. Prepare brief.md: record only the PA#3 requirements/prompts actually given to the assistant that can be verified; do not reconstruct past prompts; do not claim steps not yet done are DONE.
6. Prepare FRONTEND.md: the sections the rubric requires; fill in only verified information; mark demo accounts, routes and team details that are not verified as to be completed; no fake evidence or fake test results.
7. Check the structure of client/ after the move.
8. If the environment allows, run npm run lint, npm test and npm run build, as the actual scripts define them. Never edit or drop a test just to pass. If a command cannot run, report why.
9. Review the whole diff: files moved; files modified; behaviour changes (if any); unexpected modifications; test/build results.

CONSTRAINTS: Do not implement the API contract in this phase. Do not create the HTTP mock server. Do not edit domain services. Do not change C1–C11 business logic. Do not touch Express/PostgreSQL. Do not commit or push. Do not install dependencies without approval.

OUTPUT: I. Summary; II. Files moved/modified; III. Git diff review; IV. Test/build results; V. PA#3 structural compliance; VI. Remaining issues; VII. Proposed commit boundaries.

Proposed commits: A. refactor: move React frontend into client; B. docs: align PA3 frontend requirements and rules.
Do not make these two commits. Stop so I can review and approve.
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

## 2026-11-18 — Request 5 — Autonomous PA#3 Phase 2B–6 Implementation

**Record type:** Exact prompt supplied in the attached user request that authorized implementation, verification, local commits, and final reporting.

**Exact prompt (verbatim):**

`````text

# CLUBFLOW PA#3 — AUTONOMOUS IMPLEMENTATION MASTER PROMPT

You are the Lead Software Engineer, API Architect, QA Engineer, and Technical Auditor responsible for completing ClubFlow PA#3.

Project: ClubFlow
Course: CSC13008 — 24KTPM1
Milestone: PA#3 — Front end in React
Deadline: November 30, 2026, 22:00
Weight: 7%
Rubric: 100 points

MISSION:
Autonomously complete every remaining phase of PA#3, starting from Phase 2B through Phase 6.

WORKFLOW:
AUDIT → PLAN → IMPLEMENT → VERIFY → FIX → REVERIFY → COMMIT → NEXT PHASE.

You are authorized to:
- Inspect the full repository.
- Create, edit, refactor, and remove files within the approved PA#3 scope.
- Run development servers and automated tests.
- Run official contract-checking tools.
- Fix implementation defects.
- Update truthful documentation.
- Create LOCAL Git commits after successful verification.

Do not request approval between ordinary implementation steps.

Do not stop merely because one phase has been completed. Continue until all phases are finished, unless a genuine blocker or safety condition requires stopping.

DO NOT:
- Push to remote.
- Merge, rebase, reset, or rewrite Git history.
- Delete or overwrite unrelated work.
- Change branches without authorization.
- Commit secrets, real student data, or credentials.
- Weaken tests or validation to obtain green results.
- Falsify test output, screenshots, logs, or commit history.
- Implement unrelated features.
- Rewrite the React frontend unnecessarily.
- Claim unverified behavior is working.

If a major specification conflict cannot be resolved using authoritative sources, stop at the affected boundary and report the blocker. Never silently invent policy.

==================================================
0. INITIAL REPOSITORY AUDIT
==================================================

Before changing any file, inspect:

- Git branch, HEAD, working tree and recent commits.
- AGENTS.md and client/AGENTS.md.
- brief.md.
- FRONTEND.md.
- AI-LOG.md.
- Official PA#3 rubric, if available.
- ClubFlow final project brief.
- Product Owner Q-01–Q-07.
- docs/requirements/.
- docs/frontend/INTEGRATION.md.
- docs/api/.
- specs/001-frontend-ui/.
- client/src/routes/.
- client/src/pages/.
- client/src/hooks/.
- client/src/services/.
- client/src/contexts/.
- client/src/mocks/.
- client/src/tests/.
- Root package.json, lockfile, Vite and Vitest configs.

Expected prior state:
- Branch: pa3-finalize.
- Phase 1 completed.
- React workspace located in client/.
- Existing React 19 + Vite frontend.
- Atomic Design architecture.
- Five business screens plus account screens.
- Domain services still primarily use browser mocks.
- Phase 2A API design completed.
- Complete domain HTTP contract and mock not yet implemented.

VERIFY these assumptions against the actual HEAD.

If earlier work has already completed a task, do not redo it. Preserve working implementations.

Run the existing baseline checks where practical:
- npm run lint
- npm test
- npm run build

Record actual results.

Working-tree safety:
- If unrelated uncommitted changes exist, preserve them.
- Never use git clean, reset --hard, or force checkout.
- Stage only files belonging to the current verified phase.
- Do not use unrestricted git add . or git add -A.

==================================================
1. SOURCE OF TRUTH AND SCOPE
==================================================

Priority order:

1. Official PA#3 rubric.
2. ClubFlow final project brief.
3. Published Product Owner decisions Q-01–Q-07.
4. Approved API contract after Phase 2B.
5. Existing business requirements.
6. Existing service interfaces and UI implementation.

Where sources disagree, document the conflict and follow the highest-authority applicable source.

PA#3 requires:
- React + Vite in client/.
- C1–C11.
- Three roles.
- API contract in docs/api/.
- HTTP mock in mock/server.mjs.
- Four mock modes.
- Relative /api requests.
- Loading/error/empty states.
- Forms and validation.
- Responsive/semantic HTML.
- Documentation and evidence.
- Appropriate Git history.

NOT REQUIRED FOR PA#3:
- Express domain implementation.
- PostgreSQL persistence.
- Production JWT.
- Real Cloudinary integration.
- Production first-fit scheduling algorithm.
- Email/Brevo integration.
- Production concurrency transactions.

These belong to PA#4 or optional future work.

Preserve the existing backend/database scaffold unless a strictly necessary nonbehavioral compatibility adjustment is justified. Do not implement PA#4.

==================================================
2. PHASE 2B — WRITE API CONTRACT
==================================================

GOAL:
Create the complete HTTP API contract for ClubFlow C1–C11.

Use the existing Phase 2A design as a blueprint, but independently audit it before implementation.

Read existing domain service signatures and DTOs.

Preserve current page/component interfaces whenever feasible.

Create or update:

docs/api/README.md
docs/api/00-resource-models.md
docs/api/01-auth-profile.md
docs/api/02-public-applicant.md
docs/api/03-review-files.md
docs/api/04-scheduling.md
docs/api/05-interviewer.md
docs/api/06-results-notifications.md
docs/api/07-campaign-management.md

Adjust filenames and order if necessary for the official checker.

API CONTRACT REQUIREMENTS:

Base path:
  /api

Authorization:
  Authorization: Bearer <token>

Response conventions:
- Direct success DTOs.
- Consistent JSON error shape.
- Appropriate 200/201/204/400/401/403/404/409.
- 200 and empty arrays for empty collections.
- Explicit required fields, types and limits.
- Stable resource IDs.
- Role ownership and visibility.
- Deterministic examples.

Common error shape:
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "fieldErrors": {},
  "details": {}
}

fieldErrors and details may be optional, but each documented response must accurately reflect which keys are present.

README.md must include:
- Base path.
- Authentication.
- Status conventions.
- Common error shape.
- Complete endpoint inventory.
- Method, path, allowed role, and resource document.

Every endpoint must include:
- Purpose.
- Allowed roles.
- Path/query fields.
- Request fields, types and limits.
- Success response.
- Applicable error responses.
- At least one executable request/response example.

Every resource contract file must contain:
## Changes

Record actual changes only.

MANDATORY DESIGN CORRECTIONS:

A. Login:
Use username and password.

Do not use "handle" as the login request field.

B. Required accounts:
- exec
- studentA
- int-content
- int-comms

Add studentB when needed for testing ownership or application submission.

FRONTEND.md must have:
Name in examples | Role | User name | Password

C. Canonical example:
- A01: Student A → Content.
- A02: Student A → Communications.
- Separate screening, interview, assessment, result.

Preserve unrelated legacy fixture identities.

D. Multipart upload examples:
Use fenced sh/curl request blocks, immediately followed by fenced http response blocks.

Support:
{{token:studentA}}
{{file:cv.pdf:200KB}}

Use only example syntax the official checker understands.

E. Campaign timeline:
Support a coherent journey from draft → published → accepting applications → closed → schedule confirmed → assessments → results.

Use one primary campaign.

Do not add a test-only production endpoint to manipulate time.

If closure must be demonstrated, use a real business action allowed by Q-03, such as closing applications early, or a deterministic valid fixture state. Document the approach precisely.

F. Endpoint minimization:
Remove redundant endpoints if their behavior can safely be supported through an existing composite endpoint.

Do not remove required capabilities.

G. Schedule semantics:
Clearly distinguish Generate Draft, Edit/Resolve, Save Changes, and Confirm.

Save Changes must have meaningful behavior if exposed as a separate API action.

CONTRACT COVERAGE:
C1 Public campaign
C2 Sign-in and roles
C3 Create, draft, preview, publish
C4 Interviewer setup
C5 Applicant submission
C6 My applications
C7 Application review
C8 Draft scheduling
C9 Confirmation
C10 Interviewer assessments
C11 Final results and notifications

PHASE 2B VERIFICATION:

Audit every endpoint against:
- Existing frontend services.
- C1–C11.
- Required roles.
- Request/response field names.
- Error cases.
- State transitions.
- HTTP example order.
- Checker parser requirements.

Ensure every example maps to an endpoint in README.

Run appropriate static/documentation checks.

Do not implement the mock yet.

If the official checker is unavailable, mark checker execution as NOT RUN rather than claiming PASS.

==================================================
3. PHASE 2C — CONTRACT REVIEW AND COMMIT
==================================================

Perform an independent contract review.

Check:
- No missing C1–C11 operation.
- No undocumented frontend-required operation.
- No contradictory status codes.
- No inconsistent DTO fields.
- No unauthorized data leakage.
- No missing error shape.
- No unpaired request/response examples.
- No invented production requirements.
- No impossible fixture transitions.
- No contradictory application IDs.
- No duplicate active campaign assumption.
- No malformed token placeholders.

Review git diff carefully.

Keep contract implementation independent from mock implementation.

Update brief.md and AI-LOG.md truthfully.

Do not fabricate historical prompts.

Verification:
- git diff --check
- Contract structural validation
- Markdown/reference consistency
- Coverage matrices

If Phase 2B/2C checks pass, create a scoped local commit:

docs: define PA3 API contract

After committing:
- Verify the commit exists.
- Verify the expected files were committed.
- Preserve unrelated untracked files.
- Record the commit hash.

Then automatically proceed to Phase 3.

==================================================
4. PHASE 3 — IMPLEMENT HTTP MOCK SERVER
==================================================

GOAL:
Implement a stateful HTTP mock server that satisfies the committed contract.

Required structure:
mock/server.mjs
mock/data/

Runtime:
node mock/server.mjs

Default PORT:
3001

Use only Node.js built-in modules.

No Express, third-party router, database, or extra npm installation for the mock.

MOCK BEHAVIOR:

- Start from deterministic mock/data fixtures.
- Keep mutations in memory.
- Reset state when the process restarts.
- Preserve valid deterministic tokens across restart.
- Authenticate demo accounts.
- Determine role/identity from token.
- Apply role and ownership rules.
- Return exact documented status codes and response fields.
- Log method, request path, and response status.
- Handle JSON and required multipart uploads.
- Handle CSV and PDF endpoints correctly.

Four modes are mandatory:

NORMAL:
- Approximately 150 ms response.
- Functional data and mutations.

SLOW:
- Approximately 2 seconds response.
- Same API behavior.
- React must display loading.

ERROR:
- Return HTTP 500 with the documented error shape.
- Sign-in remains available.
- React must display error and Retry.

EMPTY:
- All arrays in responses become [].
- Nested arrays also become [].
- Single-resource endpoints continue to return valid objects.
- React must display correct empty states and zero counts.

BUSINESS BEHAVIOR:

- Draft/publish campaign.
- Published campaign editing per Q-03.
- Add/update/remove eligible positions.
- Configure interview setup.
- Apply for multiple positions.
- Detect duplicate applications.
- Keep A01/A02 independent.
- Screen each application independently.
- Generate deterministic draft schedule.
- Show Proposed/Conflict/Unassigned correctly.
- Edit/resolve assignments and recalculate conflicts.
- Refuse invalid confirmation.
- Confirm valid schedule.
- Lock confirmed campaign/schedule.
- Show assigned interviewer work.
- Accept assigned assessments.
- Record and publish final results.
- Create applicant notifications.

Real first-fit optimization is not required.
Use fixed deterministic generation where appropriate.

Do not use arbitrary fake success responses that break state continuity.

Preserve application, interviewer and room conflict checks in draft edits.

==================================================
5. PHASE 3 — CONTRACT VERIFICATION
==================================================

Locate the OFFICIAL contract-check.mjs supplied for the course.

If not present in the repository, look for the exact official file in the available project/course attachments.

Copy the official checker into tools/contract-check.mjs when accessible.

Do not replace it with a simplified homemade checker.

If the exact tool is unavailable, report that limitation and run equivalent manual HTTP checks, but do not claim the official checker passed.

For the normal run:

Terminal/process A:
node mock/server.mjs

Terminal/process B:
node tools/contract-check.mjs --base http://localhost:3001

IMPORTANT:
Restart the mock from fresh seed before every full checker run because examples mutate state.

Verify:
- All examples covered.
- All status codes match.
- All JSON field names match.
- All endpoint inventory entries covered.
- No undocumented example endpoints.
- Login placeholders resolve correctly.
- Multipart uploads work.
- No unintentional value NOTE inconsistencies.

Run strict-values separately where compatible and investigate mismatches rather than ignoring them.

Test each of the four mock modes using safe startup/restart procedures.

Write tests for:
- Login/role handling.
- Campaign publishing and validation.
- Duplicate application.
- A01/A02 independence.
- Review mutations.
- Conflict/Unassigned.
- Confirmation refusal and lock.
- Assessment ownership.
- Result publication and notification.
- Mock restart/reset behavior.

Use Node built-in testing tools if helpful.

Do not weaken the contract to make implementation tests pass.

If the code violates a correct contract:
FIX THE CODE.

If the contract itself is genuinely wrong:
Document why, add an accurate Changes entry, and keep a separate explicit corrective commit before proceeding. Do not silently change the approved contract.

Run:
npm run lint
npm test
npm run build

Run additional mock tests as appropriate.

If any required gate fails:
- Diagnose the cause.
- Fix implementation.
- Re-run the failing gate.
- Re-run all relevant regression gates.

Commit only once verified.

Suggested commit:
feat: implement contract-driven PA3 HTTP mock

Record the commit hash.

Then proceed to Phase 4.

==================================================
6. PHASE 4 — REACT HTTP INTEGRATION
==================================================

GOAL:
Convert all main-flow domain services from browser mock state to HTTP API.

PRESERVE:
- Existing pages.
- Atomic Design components.
- Existing CSS/design tokens.
- Existing route structure where possible.
- Existing hooks.
- Existing form validation.
- Existing service interfaces where feasible.

Do not rewrite the frontend.

Use:
client/src/services/apiClient.js

All domain calls must use relative /api paths.

Configure client/vite.config.js:

server.proxy:
  /api → http://localhost:3001

preview.proxy:
  /api → http://localhost:3001

Avoid absolute API URLs in runtime.

AUTH INTEGRATION:

- Login via HTTP.
- Token returned by mock.
- Shared user/token auth context.
- Register token provider for API client.
- Sign-out clears token.
- Protected routes work.
- Return to intended route after sign-in.
- Role navigation is correct.
- Bearer header attached after login.
- Mock restart does not incorrectly invalidate valid demo tokens.

DATA INTEGRATION:

Replace browser mock imports in:
- authService
- profileService
- campaignService
- portalService
- applicationService
- scheduleService
- interviewerService
- resultService

Keep service adapters where response mapping is needed.

No page should read domain data directly from client-side fixtures.

No domain service should depend on client/src/mocks/store.js as the runtime source of truth.

Handle:
- JSON.
- FormData.
- PDF downloads.
- CSV exports.
- Pagination.
- Search/filter/sort.
- 400 field errors.
- 401 unauthenticated.
- 403 forbidden.
- 404 not found.
- 409 conflict.
- 500/server errors.
- Empty list responses.
- Aborted/stale requests.

UI REQUIREMENTS:

Every data screen:
- Loading.
- Error with Retry.
- Empty.
- Success.

After a mutation, update UI using API response or an API refetch.

Avoid full page reloads.

Search must use debounce or request cancellation.

Preserve filters when closing application drawer.

Do not create repeated requests while the UI is simply waiting.

INTEGRATION ORDER:

1. Relative API client and Vite proxy.
2. Authentication/shared session.
3. Public campaign.
4. Campaign management.
5. Applicant submission and My Applications.
6. Application review.
7. Interview setup and scheduling.
8. Interviewer workspace.
9. Final results and notifications.

For each group:

AUDIT → IMPLEMENT → TEST → FIX → REVERIFY → COMMIT.

Use separate local commits for meaningful groups, such as:

feat: integrate PA3 authentication and API client
feat: integrate campaign and applicant API flows
feat: integrate application review and scheduling APIs
feat: integrate interviewer and results APIs

You may split commits further when justified.

Do not mix unrelated domains merely to reduce commit count.

==================================================
7. PHASE 5 — FUNCTIONAL COMPLETION
==================================================

GOAL:
Close all remaining C1–C11 gaps identified by the original audits and new integration tests.

MANDATORY AREAS:

A. C4 Interview Setup:
- Edit interviewer-position assignments.
- Edit interviewer availability.
- Choose existing rooms.
- Configure date/window.
- Configure duration 15/20/30.
- Save changes via HTTP.
- Validate invalid combinations.

B. Q-03 Published Campaign:
- Published campaigns allow valid edits.
- Add position when permitted.
- Update quotas.
- Extend or close application window.
- Do not delete positions with applications.
- Lock relevant interview configuration after the first valid application.
- Confirmed campaigns and schedules become read-only.

C. Applicant:
- Multi-position applications.
- Duplicate opens existing application.
- PDF <= 5 MB.
- SOP <= 300 words.
- Availability from club slots.
- Closed campaign preserves form data on error.
- Own records only.

D. Executive:
- Application search/filter/sort/pagination.
- Statistics.
- CSV.
- Drawer/detail/CV.
- Internal notes.
- Independent screening decisions.

E. Scheduling:
- Proposed, Conflict and Unassigned.
- Correct overlap checks.
- Reasons displayed.
- Draft edits/save/export.
- Confirmation refusal.
- Confirmed read-only.

F. Interviewer:
- Assigned interviews only.
- Assigned CVs only.
- No private screening notes.
- One assessment per assigned completed interview.

G. Results:
- Pass/Fail per application.
- Publish results.
- Applicant sees published results only.
- In-app notifications.

H. UI:
- No hardcoded domain counts.
- No false conflicts.
- No inconsistent dates.
- No incorrect page titles.
- No applicant/interviewer identity overlap.
- No prohibited "verified" claims.
- No template footer.
- Responsive drawer/list behavior.

PRODUCT OWNER DECISIONS:

Q-01:
First-fit real engine deferred to PA#4.
PA#3 mock may generate fixed valid drafts.

Q-02:
Use Vietnam time UTC+7.
Date-only closing closes at 00:00 the next day.

Q-03:
Published campaigns allow constrained edits.
Confirmed state locks required records.

Q-04:
Simple assessment form sufficient.
Executive controls final result.

Q-05:
In-app notifications required.
Email optional.

Q-06:
Applicant withdrawal/edit and assessment editing optional.
Do not implement unless needed for already-approved scope.

Q-07:
Respect role-specific CV visibility in the mock contract.
Real direct-URL enforcement belongs to PA#4.

VERIFICATION:

Create or extend tests that prove each previously missing behavior.

For every C-step:
- Working UI.
- HTTP request.
- Correct mock response.
- Correct state update.
- Required error case.
- Role visibility.

Re-run relevant automated gates.

Commit distinct functional fixes after verification.

Suggested messages:
feat: complete PA3 interview setup
fix: align published campaign editing with PO decisions
test: cover PA3 workflow and error states

==================================================
8. PHASE 6 — FULL QA AND SUBMISSION
==================================================

GOAL:
Verify PA#3 as the lecturer will grade it and prepare the required submission artifacts.

OFFICIAL RUBRIC:

1. Whole Main Flow: 25
2. Routing, Sign-in, Shared State: 10
3. Data from API: 10
4. Forms: 10
5. Contract and Mock: 15
6. Responsive, Semantic, Valid: 5
7. Brief and Rules File: 10
8. AI-LOG.md: 10
9. Commit History: 5

Total: 100.

A. AUTOMATED CHECKS

Run:
npm run lint
npm test
npm run build

Run the official contract-check against a freshly started normal mock.

Check:
- All documented examples.
- HTTP status codes.
- Response fields.
- Endpoint coverage.
- Demo credentials.
- State changes.
- Upload behavior.

B. MOCK MODES

Test:
- normal
- slow
- error
- empty

Verify UI responses.

C. FULL C1–C11 FLOW

Walk through the application using its own links/buttons:

1. Executive creates/publishes campaign.
2. Visitor sees published campaign.
3. Student A signs in.
4. Student A submits Content application.
5. Student A submits Communications application.
6. Executive reviews A01 and A02 separately.
7. Executive shortlists them.
8. Applications close.
9. Executive generates draft schedule.
10. Conflict is displayed where appropriate.
11. Executive resolves conflicts.
12. Executive confirms.
13. Applicant sees confirmed schedule.
14. Interviewer sees assigned interviews.
15. Interviewer submits assessment.
16. Executive records and publishes results.
17. Applicant sees result and notification.

Check the failure cases in the official brief.

Use a clean deterministic mock state for each independent test.

D. ROUTES

Open all routes directly.
Reload each route.
Test Browser Back.
Test unknown route.
Test protected routes when signed out.
Test cross-role route access.

E. RESPONSIVE

Check all important routes at:
- 360px
- 768px
- 1280px

No page horizontal scrolling.
No clipped UI.
Buttons/links at least 44px tall at 360px.
Tables handle overflow.
Drawer and list stay readable.
Semantic landmarks and one h1 per screen.

Use browser automation if available.

If browser tooling is unavailable, explicitly mark manual browser verification as NOT EXECUTED. Do not fabricate screenshots or W3C results.

F. W3C VALIDATION

Validate rendered HTML of main screens, not just dist/index.html.

Aim for 0 errors.

G. DOCUMENTATION

Complete:
- FRONTEND.md
- brief.md
- AI-LOG.md
- SELF_ASSESSMENT_REPORT.md
- AGENTS.md
- docs/api/

FRONTEND.md:
1. Team.
2. How to run.
3. Demo accounts.
4. Routes.
5. Product Owner decisions.
6. Libraries.
7. Not done.

Write required documentation in English.

Do not invent member names, student IDs or public PO links.

If information is unavailable, mark it explicitly as requiring human input.

brief.md must preserve real prompts, not reconstructed prompts.

AI-LOG.md:
- Preserve history.
- Add truthful PA#3 entries.
- Record tool, request, kept, changed, rejected and verification.
- Record only real incidents and checks.
- Do not claim a rejected suggestion existed when none did.

SELF_ASSESSMENT_REPORT.md:
- One row per rubric criterion.
- Claimed score.
- Evidence path/route/test/commit.
- Total.
- Limitations/not done.

Do not overclaim unverified points.

H. BUILD

Ensure:
client/dist/

is rebuilt from the latest source.

Verify the production preview against the HTTP mock.

I. SUBMISSION AUDIT

Required:
- Repository source.
- Hidden .git directory.
- client/ and client/dist/.
- mock/server.mjs and mock/data/.
- docs/api/.
- AGENTS.md or approved rules file.
- FRONTEND.md.
- brief.md.
- AI-LOG.md.
- SELF_ASSESSMENT_REPORT.md.

Exclude:
- node_modules/.
- .env with real secrets.
- Temporary artifacts and real uploaded CVs.

Do not use GitHub Download ZIP or git archive when .git must be included.

Prepare a local submission ZIP only if all required identity fields and submission checks can be completed accurately.

If not, produce the exact missing-field checklist instead.
Do not invent student IDs or scores.

Do not push or submit externally.

==================================================
9. CONTINUOUS QUALITY GATES
==================================================

After every implementation phase:

1. Inspect git diff.
2. Check for unexpected files.
3. Run focused tests.
4. Run full relevant quality gates.
5. Investigate all failures.
6. Fix underlying implementation.
7. Re-run tests.
8. Validate the contract when affected.
9. Review security and behavior regressions.
10. Update truthful AI-LOG/documentation.
11. Stage only phase-related files.
12. Review staged diff.
13. Commit locally.
14. Record commit hash.
15. Continue to next phase.

Do not commit if required gates fail.

Do not silently skip a failing check.

Do not create a passing test that cannot detect the targeted defect.

Do not weaken expectations, mock behavior, contract, or validation just to pass.

If a dependency is genuinely necessary:
- Check whether the existing stack can solve the problem.
- Explain why the dependency is necessary.
- Respect repository approval rules.
- Avoid packages with unnecessary install scripts.

==================================================
10. PHASE COMPLETION RULES
==================================================

A phase is DONE only when:

- Its functional acceptance criteria are met.
- Its required files exist.
- Applicable tests pass.
- No unresolved critical regression exists.
- Documentation is truthful.
- Diff has been reviewed.
- A scoped Git commit has been created.
- Commit hash has been recorded.

If a phase cannot be completed:
- Explain the exact blocker.
- Preserve working code.
- Do not commit an incomplete phase as DONE.
- Do not continue into dependent phases that require the missing behavior.
- You may complete independent safe work, but never mask the blocker.

Avoid unnecessary back-and-forth questions.
Resolve ordinary technical decisions from the rubric, source and tests.

Stop only for genuine blockers, unsafe/destructive operations, unavailable authoritative inputs that materially affect correctness, or irreconcilable requirements.

==================================================
11. FINAL REPORT
==================================================

After all possible work is complete, return a comprehensive report IN VIETNAMESE:

I. Executive Summary
- PA#3 completion status
- Implemented features
- Remaining limitations

II. Git History
- Branch
- Final HEAD
- All new commits and messages
- Working-tree status

III. Phase Results
For Phase 2B/2C, 3, 4, 5 and 6:
- Changes
- Checks
- Results
- Commit hash

IV. C1–C11 Coverage Matrix
- UI
- HTTP API
- Mock
- Validation
- Tests
- Status

V. Official Rubric Assessment
- Nine criteria
- Max points
- Evidence-based estimate
- Total /100
- Confidence and missing verification

VI. Quality Gates
- Lint
- Frontend tests
- Mock tests
- Build
- Official contract-check
- Four modes
- Browser tests
- Responsive
- W3C

For every check, distinguish PASS, FAIL and NOT RUN.

VII. Submission Readiness
- Required files
- Missing artifacts
- Build output
- ZIP status
- Remaining human inputs

VIII. PA#4 Handoff
- Confirmed API contract
- Backend rules still to implement
- Mock behavior to replace with Express
- Known technical risks

FINAL INSTRUCTION:

Start immediately at Phase 2B.

Work autonomously through Phase 6.

Verify before every commit.

Commit only successful, reviewed work.

NEVER PUSH.

Do not stop after one phase unless a genuine blocker prevents safe continuation.
`````


## 2026-11-18 — Request 6 — Autonomous PA#3 Remediation and Final Verification

**Record type:** Exact prompt available from current conversation.

**Summary (non-verbatim):** Requested autonomous continuation of PA#3 remediation, resolving all verified defects, completing C10/C11 and remaining audit findings, running quality gates, updating documentation and producing the final audit report in Vietnamese.

**Exact prompt (verbatim):**

````text
# CLUBFLOW PA#3 — CLAUDE CODE AUTONOMOUS REMEDIATION

You are the Lead Full-Stack Engineer, React Architect, QA Engineer, and Technical Auditor for ClubFlow.

PROJECT:
ClubFlow — CSC13008, 24KTPM1
Milestone: PA#3 React Frontend
Deadline: November 30, 2026, 22:00

MISSION:
Continue from the CURRENT repository state, resolve all verified defects, complete unfinished Phase 4–6 work, independently verify the implementation, and automatically commit and push each successfully verified milestone.

EXECUTION LOOP:
AUDIT → PLAN → IMPLEMENT → TEST → FIX → REVERIFY → COMMIT → PUSH → NEXT TASK.

Work autonomously. Do not stop after C10 or C11. Continue until all feasible PA#3 tasks are complete, unless there is a genuine blocker.

You are authorized to:
- Modify source and documentation within PA#3 scope.
- Run local development servers and tests.
- Write meaningful regression tests.
- Create local commits after verification.
- Push verified commits to origin/pa3-finalize.

You must NOT:
- Force push or rewrite Git history.
- Merge or rebase automatically.
- Push to main, dev, or another branch.
- Delete unrelated work.
- Weaken tests or validation to obtain PASS.
- Fabricate screenshots, logs or official verification results.
- Implement unrelated PA#4 functionality.
- Commit secrets, node_modules, or real student CVs.

==================================================
1. VERIFY CURRENT STATE
==================================================

First inspect:

git branch --show-current
git status --short
git log -15 --oneline
git remote -v

Expected previous audit:
- Branch: pa3-finalize.
- Last audited HEAD: 4269f19.
- Contract committed before mock.
- Mock committed before React consumers.
- C1–C9 mostly HTTP-integrated.
- C10/C11 still use browser fixtures.
- Incomplete Spec Kit tasks T061–T083.

Treat the audit as a hypothesis, not proof.
Reinspect current source before editing.

Read:
- AGENTS.md and client/AGENTS.md.
- Official PA#3 rubric and ClubFlow brief.
- Product Owner decisions Q01–Q07.
- docs/api/.
- FRONTEND.md.
- AI-LOG.md.
- specs/002-pa3-http-integration/.
- client/src/services/, hooks/, pages/, contexts/.
- mock/server.mjs and mock/data/.
- Existing tests.

Preserve any unrelated uncommitted files.

Do not recreate completed specifications or restart Phase 2.

==================================================
2. FIX C10 — INTERVIEWER HTTP INTEGRATION
==================================================

Inspect and update:
- client/src/services/interviewerService.js
- client/src/hooks/useInterviewerWorkspace.js
- client/src/pages/InterviewerWorkspacePage.jsx
- Related tests.

Replace all runtime browser mock/store calls with the documented HTTP endpoints.

Implement:
- Assigned interview list.
- Interview detail.
- Authorized CV access.
- One assessment per completed, assigned interview.

Required UI states:
- Loading.
- Error with Retry.
- Empty.
- Success.

Verify:
- API empty means UI empty.
- API 500 means UI error, not fixture fallback.
- Only assigned interviews are visible.
- No CF-* records appear from old browser state.
- Assessment submission actually mutates HTTP mock state.
- 400/401/403/404/409 errors behave correctly.

Add focused tests proving the HTTP behavior.

After verification:
Commit:
feat: integrate interviewer assessment APIs

Push only after verifying fast-forward remote status.

==================================================
3. FIX C11 — FINAL RESULTS HTTP INTEGRATION
==================================================

Inspect and update:
- client/src/services/resultService.js
- client/src/hooks/useFinalResults.js
- client/src/pages/ApplicationReviewPage.jsx
- Applicant portal result/notification displays.
- Related tests.

Use only the committed API contract.

Required:
- Load actual HTTP result candidates.
- Load assessment details.
- Record Pass/Fail per application.
- Publish recorded results.
- Show published results to the correct applicant.
- Generate in-app notifications.

Verify:
- A01 and A02 are independent.
- Results are private before publication.
- No stale CF-* fixtures or November 5 timeline.
- No false "(mô phỏng)" labels.
- HTTP error/empty modes affect the UI correctly.
- Duplicate publication does not duplicate notifications.
- Published results are read-only.

Add focused tests and HTTP workflow verification.

After verification:
Commit:
feat: integrate final results APIs

Push only after verifying fast-forward remote status.

==================================================
4. FIX REMAINING AUDIT FINDINGS
==================================================

A. Mock modes:
- Normal: approximately 150ms delay.
- Slow: approximately 2000ms delay.
- Error: HTTP 500 for all endpoints except login.
- Empty: empty all arrays including nested arrays and show zero counts.

Do not silently exempt health or auth/me from error mode unless the official rubric requires it.

B. Application Review:
- Add search debounce around 300ms.
- Preserve request cancellation.
- Prevent stale responses from overwriting newer results.

C. Duplicate application:
- Handle HTTP 409.
- Preserve input.
- Link or navigate to the existing application using existingApplicationId.

D. Demo controls:
- Remove inaccurate browser-only data/reset descriptions.
- Ensure demo scenario selection does not override HTTP campaign state.

E. Responsive:
- Fix brand-link mobile tap target to at least 44px.
- Review major routes at 360, 768 and 1280px.
- No horizontal page overflow.

F. Regression tests:
- Earlier baseline: 295 frontend tests.
- Most recent audit: 259 frontend tests.
- Investigate the difference using Git history.
- Restore missing meaningful coverage if needed.
- Never add meaningless tests merely to increase totals.

Group coherent fixes into separate verified commits and push after each.

==================================================
5. COMPLETE FULL C1–C11 HTTP WORKFLOW
==================================================

Use the same deterministic HTTP mock state and consistent campaign timeline.

Test:

1. Executive creates and publishes a campaign.
2. Visitor sees the campaign.
3. Student A signs in.
4. Student A submits A01 Content.
5. Student A submits A02 Communications.
6. Duplicate A01 returns 409.
7. A01 and A02 maintain independent state.
8. Executive reviews and shortlists applications.
9. Applications close according to Q03.
10. Executive generates a draft schedule.
11. Conflict and Unassigned states have reasons.
12. Executive fixes assignments.
13. Valid schedule confirmation succeeds.
14. Confirmed schedule becomes read-only.
15. Applicant sees assigned interview information.
16. Interviewer sees only assigned interviews.
17. Interviewer submits assessment after the interview.
18. Executive records Pass/Fail.
19. Executive publishes results.
20. Student A sees published results and notifications.

Test negative authorization and ownership cases.

Do not fake success by bypassing HTTP services.

==================================================
6. AUTOMATED AND BROWSER VERIFICATION
==================================================

Run and record:

npm run lint
npm test
npm run build
npm run verify:mock-http
node tools/validate-api-docs.mjs

Run the original official contract-check.mjs if it is available.

If not available:
- Report OFFICIAL CHECKER: NOT RUN.
- Do not substitute a custom checker while claiming it is official.

Restart the HTTP mock before stateful checks.

Verify four modes on API and browser.

Browser verification:
- C1–C11.
- Deep links.
- Login/logout.
- Role guards.
- Loading/Error/Retry/Empty.
- Form validation.
- 360/768/1280 responsive.
- Actual rendered DOM.
- No horizontal overflow.
- Accessible labels and one h1 per screen.

Run W3C validation if actual tooling is available.
Otherwise report NOT RUN.

Do not invent evidence.

==================================================
7. DOCUMENTATION AND SUBMISSION
==================================================

Update:
- FRONTEND.md.
- AI-LOG.md.
- brief.md.
- SELF_ASSESSMENT_REPORT.md.
- Spec Kit tasks and evidence.

FRONTEND.md must accurately document:
- Team members.
- Run commands.
- Demo accounts.
- Routes and HTTP integration.
- Product Owner decisions.
- Libraries.
- Remaining Not Done.

Self-assessment must use all nine PA#3 rubric criteria and evidence-based scores.

Preserve real historical prompts in brief.md.
Preserve old AI-LOG entries.

Do not invent student IDs or Product Owner URLs.

Rebuild client/dist from final source.

Verify submission:
- Repository including .git.
- client/dist.
- mock/server.mjs and mock/data.
- docs/api.
- FRONTEND.md.
- brief.md.
- AI-LOG.md.
- SELF_ASSESSMENT_REPORT.md.
- AGENTS.md.

Exclude:
- node_modules.
- .env secrets.
- Temporary files.
- Real CV data.

Only generate submission ZIP when actual student IDs and required naming details are available.

==================================================
8. GIT COMMIT AND PUSH POLICY
==================================================

For each completed milestone:

1. Review source diff.
2. Run targeted tests.
3. Run relevant full regression gates.
4. Fix failures.
5. Reverify.
6. Stage only the milestone's files.
7. Commit with a meaningful message.
8. Fetch origin.
9. Confirm local history is a fast-forward of origin/pa3-finalize.
10. Push to origin/pa3-finalize.
11. Verify remote synchronization.
12. Continue automatically.

Do not force push.
Do not auto-merge or rebase divergent history.
Do not push failed work.

==================================================
9. FINAL INDEPENDENT AUDIT
==================================================

Once implementation appears complete:

Run a fresh audit as if you were the lecturer.

Evaluate:

1. Whole Main Flow /25.
2. Routing/Auth/State /10.
3. API Data States /10.
4. Forms /10.
5. Contract/Mock /15.
6. Responsive/Semantic/W3C /5.
7. Brief/Rules /10.
8. AI-LOG /10.
9. Commit History /5.

Do not give full marks without verified evidence.

Produce:
- Final score estimate.
- C1–C11 evidence matrix.
- Remaining P0/P1/P2/P3 defects.
- Test results.
- Official checker status.
- Browser/W3C status.
- Git commit hashes.
- Push verification.
- Submission readiness.

If any P0/P1 issue is found:
Fix it, rerun relevant tests, commit and push again.

==================================================
10. STOP CONDITIONS
==================================================

Only stop when:
- All feasible Phase 4–6 tasks are completed.
- Required verification gates pass.
- No P0/P1 blockers remain.
- Final report is produced.

Or when:
- A genuine specification blocker cannot be resolved.
- Unrelated user work would be overwritten.
- Required tools are unavailable and completion cannot safely be asserted.
- Remote branch has diverged.
- Git push is rejected.
- An unsafe destructive action would be necessary.

Do not stop to request approval for ordinary technical decisions.

FINAL OUTPUT:
Write the final report in Vietnamese.

Begin by auditing the current repository and resuming the next incomplete task.
````

## 2026-11-19 - Request 7 - Check the repository against the lecturer's documents

**Record type:** Exact prompt (the user's own words, in the conversation).

**Summary (non-verbatim):** Read every lecturer document and check the repository against those documents only.

**Exact prompt (verbatim):**

`````text
Đọc toàn bộ files trong thư mục tài liệu của giảng viên và check repo đã hoàn thiện theo yêu cầu này chưa? Không tự sinh các yêu cầu, bám theo trong tài liệu.
`````

**English translation (non-verbatim):**

`````text
Read every file in the lecturer's documents folder and check whether the repo is finished according to these requirements. Do not invent requirements; stick to the documents.
`````

## 2026-11-19 - Request 8 - Fix the contract, the logs and the report

**Record type:** Exact prompt.

**Summary (non-verbatim):** Carry out the four steps proposed after the check: contract and mock fixes, AI-LOG and self-assessment, FRONTEND.md, build and ZIP.

**Exact prompt (verbatim):**

`````text
Bạn hãy làm (1), (2), (3), (4).
`````

**English translation (non-verbatim):**

`````text
Do (1), (2), (3), (4).
`````

## 2026-11-19 - Request 9 - Fix the repeated requests

**Record type:** Exact prompt.

**Summary (non-verbatim):** Fix the repeated requests reported after the delivery-mode run.

**Exact prompt (verbatim):**

`````text
Sửa lỗi request lặp.
`````

**English translation (non-verbatim):**

`````text
Fix the repeated requests.
`````

## 2026-11-19 - Request 10 - Check and fix criteria 1 to 7

**Record type:** Exact prompt.

**Summary (non-verbatim):** After a plan to reach the maximum on the self-assessed criteria, check and fix criteria 1 to 7 now; criteria 8 and 9 are out of scope.

**Exact prompt (verbatim):**

`````text
mục 8, 9. bỏ qua.
Bạn kiểm tra và làm làm 1->7 ngay bây giờ.
`````

**English translation (non-verbatim):**

`````text
Skip items 8 and 9.
Check and do 1 to 7 right now.
`````


## 2026-11-20 - Request 11 - Check the repository against PA#3, then remove the legacy browser data and add the C8 scheduling form

**Record type:** Exact prompts.

**Summary (non-verbatim):** First, check whether the current source meets the PA#3 requirements (the lecturer's PA#3 rubric, contract-check README and milestone document were attached). The check found a stale `client/dist/`, PA#2 browser fixtures still in the production bundle, the C8 date/time window/duration not chosen on the Scheduling screen, and an out-of-date self-assessment. Second, fix two of them in order and in separate commits: remove `client/src/mocks/` and the legacy demo-session service and verify the bundle no longer contains fixture names; then extend the contract of `POST .../schedule/draft/generate` with a `{date, window, slotMinutes}` body, a `## Changes` line, mock validation with 400 errors, error examples (400, 409), and a form on `InterviewSchedulingPage.jsx`; finally rebuild and run `contract-check`.

**Exact prompt 1 (verbatim):**

`````text
check xem source hiện tại đã thỏa các yêu cầu trong PA3 chưa
`````

**English translation (non-verbatim):**

`````text
Check whether the current source meets the PA3 requirements.
`````

**Exact prompt 2 (verbatim):**

`````text
Đồng ý, bạn bắt tay vào cả hai việc đi. Thứ tự nên là:

**Mục 3 trước (gỡ legacy):**
- Xóa `client/src/mocks/` hoàn toàn
- Sửa `DemoSessionContext.jsx` để không import `demoSessionService` nữa
- Kiểm tra xem có file nào khác còn reference đến legacy data không
- Build lại và verify `dist/assets/index-*.js` không còn chuỗi "Nguyễn Minh Anh" hay "Gia Huy"
- Commit riêng với message rõ ràng

**Rồi đến mục 2 (C8):**
- Sửa contract `docs/api/interview-scheduling.md`: thêm `Request body: {date, window, slotMinutes}` cho endpoint `POST .../schedule/draft/generate`
- Thêm `## Changes` section ghi rõ thay đổi
- Cập nhật mock để handle body mới (validate date/window/slotMinutes, trả lỗi 400 nếu thiếu)
- Thêm vài ví dụ lỗi vào contract (400 cho missing fields, 409 cho conflict)
- Sửa `InterviewSchedulingPage.jsx`: thêm form với 3 input (date picker, time window selector, duration dropdown)
- Commit riêng, message ghi rõ "Add C8 scheduling form with date/window/duration selection"

Sau khi xong cả hai, build lại lần cuối rồi chạy `contract-check` để đảm bảo mock vẫn pass.

Bạn làm xong thì báo lại, mình sẽ kiểm tra và chuyển sang sửa `SELF_ASSESSMENT_REPORT.md` (mục 4).
`````

**English translation (non-verbatim):**

`````text
Agreed, start on both tasks. The order should be:

Item 3 first (remove the legacy data):
- Delete client/src/mocks/ entirely
- Change DemoSessionContext.jsx so it no longer imports demoSessionService
- Check whether any other file still references the legacy data
- Rebuild and verify that dist/assets/index-*.js no longer contains "Nguyễn Minh Anh" or "Gia Huy"
- A separate commit with a clear message

Then item 2 (C8):
- Edit the contract docs/api/interview-scheduling.md: add "Request body: {date, window, slotMinutes}" to POST .../schedule/draft/generate
- Add a ## Changes line stating the change
- Update the mock to handle the new body (validate date/window/slotMinutes, return 400 when missing)
- Add a few error examples to the contract (400 for missing fields, 409 for conflict)
- Edit InterviewSchedulingPage.jsx: add a form with 3 inputs (date picker, time window selector, duration dropdown)
- A separate commit, with a message that says "Add C8 scheduling form with date/window/duration selection"

After both, build one last time and run contract-check to make sure the mock still passes.

When you are done, report back; I will check and move on to fixing SELF_ASSESSMENT_REPORT.md (item 4).
`````

## 2026-11-20 - Request 12 - Fix the flaky test, correct the self-assessment, package the zip

**Record type:** Exact prompts.

**Summary (non-verbatim):** Fix the flaky "shows loading, then supports retry" test; then update `SELF_ASSESSMENT_REPORT.md` with the figures the assistant verified (commit count and authors as `git log` shows them, 56 examples, 287/17 tests, C8 done, total 95); then build and package the zip with `tar.exe`, excluding every `node_modules` and the local `.env`, and check its contents.

**Exact prompt 1 (verbatim):**

`````text
Tốt, cả hai commit đều đúng yêu cầu. Đặc biệt:
- Việc giữ `tests/fixtures/` là hợp lý (test cần, app không dùng)
- Đổi tên field thành `interviewDate`/`interviewWindow` để nhất quán với code hiện có là quyết định tốt
- 4 ví dụ lỗi (400, 409) chứng minh mock handle được các trạng thái quan trọng

Tuy nhiên, có **một vấn đề cần fix trước khi nộp**: test "shows loading, then supports retry" chập chờn. Rubric ghi rõ "All tests pass", nếu giám khảo chạy và thấy timeout thì sẽ trừ điểm tiêu chí 4 (Testing). Bạn nên debug và fix luôn.

Sau khi fix test chập chờn, chuyển sang **mục 4: sửa SELF_ASSESSMENT_REPORT.md**. Các điểm cần cập nhật:

**Số liệu mới:**
- Commit: 78 (76 cũ + 2 mới)
- Tác giả: 3 (HUYNH THAI HOANG đã có commit)
- Contract examples: 56 (thay vì 52)
- Client tests: 287 (thay vì 282)
- Mock tests: 17 (thay vì 14)
- C8: Done (thay vì "Not done")

**Điểm tiêu chí 1 (Functional requirements):**
- C8 đã đúng rubric → tăng từ 15-21 lên 25
- Các tiêu chí khác giữ nguyên
- Tổng điểm cần tính lại

**Các mục khác:**
- Mục 9 (Known issues): gỡ dòng "the changes of 2026-11-19 are not committed yet"
- Thêm dòng về test chập chờn đã fix
- Ghi rõ 3 tác giả và số commit của từng người

Bạn fix test chập chờn trước, rồi mình sẽ sửa SELF_ASSESSMENT_REPORT.md. Sau đó build lần cuối và đóng gói zip.
`````

**English translation (non-verbatim):**

`````text
Good, both commits are as asked. In particular:
- Keeping tests/fixtures/ is sensible (the tests need it, the app does not use it)
- Naming the fields interviewDate/interviewWindow to stay consistent with the existing code is a good decision
- The 4 error examples (400, 409) show the mock handles the important states

However, there is one problem to fix before hand-in: the test "shows loading, then supports retry" is flaky. The rubric clearly says "All tests pass"; if the examiner runs it and sees a timeout, criterion 4 (Testing) loses marks. Debug and fix it now.

After fixing the flaky test, move on to item 4: fix SELF_ASSESSMENT_REPORT.md. Points to update:

New figures:
- Commits: 78 (76 old + 2 new)
- Authors: 3 (HUYNH THAI HOANG has commits)
- Contract examples: 56 (instead of 52)
- Client tests: 287 (instead of 282)
- Mock tests: 17 (instead of 14)
- C8: Done (instead of "Not done")

Criterion 1 (Functional requirements):
- C8 now meets the rubric → raise from 15-21 to 25
- Keep the other criteria
- Recompute the total

Other items:
- Item 9 (Known issues): remove the line "the changes of 2026-11-19 are not committed yet"
- Add a line about the fixed flaky test
- State the 3 authors and each one's number of commits

Fix the flaky test first, then I will fix SELF_ASSESSMENT_REPORT.md. Then build one last time and package the zip.

(Note from the assistant's answer at the time: the PA#3 rubric has no "All tests pass" line and its criterion 4 is Forms, not Testing; git log showed two authors, not three; criterion 1 was already claimed at 25.)
`````

**Exact prompt 2 (verbatim):**

`````text
Đồng ý với tất cả các số liệu và cách xử lý bạn đề xuất:

**Số liệu chính xác:**
- 79 commit (Plaminh 76, HUYNH THAI HOANG 3)
- 2 tác giả có commit (thành viên thứ ba chưa có)
- 56 contract examples
- 287 client tests, 17 mock tests
- C8: Done
- Tổng điểm: 95

**Tiêu chí 9 (Honesty/Integrity):**
Giữ 3/5, sửa thành: "Two of three members have commits (76 / 3). The third member contributed to design and review but has not made any commits yet." Bỏ dòng "the changes of 2026-11-19 are not committed yet".

**Về test chập chờn:**
Cảm ơn đã chỉ ra - đúng là tiêu chí 4 PA#3 là "Forms" chứ không phải "Testing". Fix test vẫn có ích cho PA#4 và đảm bảo bộ test ổn định khi giám khảo chạy.

Bạn sửa `SELF_ASSESSMENT_REPORT.md` theo các số liệu trên đi. Sau khi xong, báo lại để mình build lần cuối và đóng gói zip. File zip sẽ có tên theo format: `PA3_MSSV_95.zip` (bạn thay MSSV bằng mã số sinh viên thực tế).
`````

**English translation (non-verbatim):**

`````text
I agree with all the figures and the handling you proposed:

Correct figures:
- 79 commits (Plaminh 76, HUYNH THAI HOANG 3)
- 2 authors with commits (the third member has none yet)
- 56 contract examples
- 287 client tests, 17 mock tests
- C8: Done
- Total: 95

Criterion 9 (Honesty/Integrity):
Keep 3/5, changed to: "Two of three members have commits (76 / 3). The third member contributed to design and review but has not made any commits yet." Remove the line "the changes of 2026-11-19 are not committed yet".

About the flaky test:
Thanks for pointing it out — PA#3 criterion 4 is indeed "Forms", not "Testing". Fixing the test still helps for PA#4 and keeps the suite stable when the examiner runs it.

Update SELF_ASSESSMENT_REPORT.md with the figures above. When done, report back so I can build one last time and package the zip. The zip will be named PA3_MSSV_95.zip (replace MSSV with the real student IDs).

(Note: criterion 9 of the rubric is Commit history; the assistant's answer pointed out that the file name must be <IDs ascending>_<total>.zip.)
`````

**Exact prompt 3 (verbatim).** The message before it, a packaging checklist (build, zip with exclusions, check the zip, submit), is not reproduced here; the assistant's answer corrected its exclusions.

`````text
Chính xác, bạn phát hiện rất đúng. Ba lỗi đó sẽ tạo ra file zip sai:
- Quá nặng vì sót `client/node_modules` và `backend/node_modules`
- Thiếu `.env.example` (vi phạm AGENTS.md)
- Thiếu `.git/` (tiêu chí 9 bị 0-1 điểm)

Lệnh `tar.exe` của bạn là giải pháp tốt nhất cho Windows:
- Giữ được thư mục ẩn `.git/`
- `--exclude=node_modules` loại ở mọi cấp
- Nén chính thư mục repo (`clubflow`) thay vì nội dung bên trong

**Bạn chạy giúp mình nhé:**
1. Build lại (không bắt buộc nhưng để chắc chắn)
2. Nén bằng lệnh `tar.exe` bạn đề xuất
3. Chạy 3 lệnh kiểm tra
4. Báo kết quả

Sau đó nộp qua Google Classroom (assignment PA#3) bằng tài khoản `@student.hcmus.edu.vn`.

Cảm ơn bạn đã kiểm tra kỹ trước khi nén. Những chi tiết này rất quan trọng để tránh mất điểm oan.
`````

**English translation (non-verbatim):**

`````text
Exactly, you spotted it correctly. Those three mistakes would make a wrong zip file:
- Too large, because client/node_modules and backend/node_modules slip in
- Missing .env.example (against AGENTS.md)
- Missing .git/ (criterion 9 would get 0-1 points)

Your tar.exe command is the best solution on Windows:
- It keeps the hidden .git/ folder
- --exclude=node_modules excludes it at every level
- It zips the repo folder itself (clubflow) rather than its contents

Please run it for me:
1. Build again (not required, but to be sure)
2. Zip with the tar.exe command you proposed
3. Run the 3 check commands
4. Report the results

Then I will submit on Google Classroom (the PA#3 assignment) with the @student.hcmus.edu.vn account.

Thanks for checking carefully before zipping. These details matter to avoid losing marks for nothing.
`````

## 2026-11-20 - Request 13 - Run guide, then the pre-submission QA run

**Record type:** Exact prompts (the QA prompt is summarised; its steps are listed).

**Summary (non-verbatim):** A guide to running and testing the prototype. Then, as QA and release engineer, in PowerShell and in order, stopping at the first failure and changing no code without permission: (1) Node >= 22.12 and `npm ci`; (2) `npm run lint` and `npm test` (about 322 tests); (3) `npm run verify:mock-http`; (4) start the mock hidden, run `node tools/contract-check.mjs --base http://localhost:3001`, expect 56/56 and 0 FAIL, stop the mock; (5) the main bundle in `client/dist/assets/` must be about 380–410 KB, not over 600 KB; (6) the zip has no `node_modules`, no `clubflow/.env`, and has `.env.example`, `.git/HEAD`, `client/dist/index.html`; (7) the self-assessment says 95 / 100, the commit count and C8 done. Output: a Markdown table and "SẴN SÀNG NỘP" or "CẦN KHẮC PHỤC". After the first run stopped at `npm ci`, the follow-up allowed stopping PIDs 460 and 25952, running `npm ci` again and repeating the run.

**Exact prompt 1 (verbatim):**

`````text
hướng dẫn t chạy và kiểm thử prototype
`````

**English translation (non-verbatim):**

`````text
Show me how to run and test the prototype.
`````

## 2026-11-20 - Request 14 - AI-LOG and self-assessment in the course templates

**Record type:** Exact prompt.

**Summary (non-verbatim):** With the course's `AI-LOG.md` template and `SELF_ASSESSMENT_REPORT.md` template attached, update the format of both files.

**Exact prompt (verbatim):**

`````text
cập nhật lại format của ai log và self assess
`````

**English translation (non-verbatim):**

`````text
Update the format of the AI log and the self-assessment.
`````

## 2026-11-20 - Request 15 - Act on a second review of the submission

**Record type:** Summary only. The message was a review of the submission produced in another assistant session and pasted by the team; it is not reproduced here.

**Summary (non-verbatim):** The pasted review found the package, the mock modes, contract-check (56/56) and the commit order correct, and proposed four fixes: an English version of the Vietnamese prompts in `brief.md`; the "Not recorded at the time" lines in `AI-LOG.md` (no change proposed); `FRONTEND.md` still saying 52 of 52 and a "Verified" status column in its team table; and the stale `.git/.MERGE_MSG.swp`. It ended by offering to fix items 1 and 3.

## PA#4

Entries below this heading belong to PA#4. The PA#3 entries above are unchanged. The record policy above still applies.

## 2026-11-28 - PA#4 T050 (issue #13) - Request 1 - Implement the issue brief

**Record type:** Exact prompt. The file it names is the team's own Vietnamese brief for issue #13 (kept in `internal_notes/`, which git ignores); it is summarised, not reproduced.

**Summary (non-verbatim):** Read `issue-13.md` and implement it. The brief asks for: contract first (`docs/api/07-campaign-management.md`: opening requests, PA#4 seed example, draft date order); migrations `020`, `030` and their seeds; `GET`/`POST`/`PATCH /api/campaigns…`, `DELETE …/positions/{id}` and `POST …/publish` (R1) in the skeleton's layers; R1 tests committed red before the code; the C3 check; and the issue's "Done when" list. It says to ask the team before deciding its open points. Asked through the assistant's question form, the team chose: PR 1 now and the "publish succeeds" test in PR 2 after migration `040`; slots computed per hour of the window; a published campaign active from `opensOn` through `interviewDate`; local commits only.

**Exact prompt (verbatim):**

`````text
Read the issue-13.md and implement it.
`````

## 2026-11-28 - PA#4 T050 (issue #13) - Request 2 - Suggest the open decisions from the requirements

**Record type:** Exact prompt.

**Summary (non-verbatim):** Before answering the last two questions (which dates make a campaign "active", and how far to go with git), read `docs/requirements` and suggest the decisions.

**Exact prompt (verbatim):**

`````text
Read docs/requirements clarify and suggest for me the decisions.
`````

## 2026-11-28 - PA#4 T050 (issue #13) - Request 3 - Check the "Done when" list

**Record type:** Exact prompt.

**Summary (non-verbatim):** Check the work against the issue's "Done when" list and say what is left.

**Exact prompt (verbatim):**

`````text
Does this satisfied the "done means". What is left back.
`````

## 2026-11-28 - PA#4 T050 (issue #13) - Request 4 - Write BACKEND.md and check again

**Record type:** Exact prompt.

**Summary (non-verbatim):** For "Done when" item 7, write `BACKEND.md` with this issue's rows. For item 6, count `npm test` for this issue's scope only. Then check again whether the issue is complete.

**Exact prompt (verbatim):**

`````text
  #7 (Done means) Write a BACKEND.md and noted in that
  6. npm test cover the scope for this issue, not all. 
Then verify again this issue complete?
`````

## 2026-11-28 - PA#4 T050 (issue #13) - Request 5 - Explain "one publish that succeeds"

**Record type:** Exact prompt.

**Summary (non-verbatim):** Explain what the issue means by "one publish that succeeds", without adding an `AI-LOG.md` entry for this question.

**Exact prompt (verbatim):**

`````text
What is "one publish that succeeds", no log AI on this.
`````

## 2026-11-28 - PA#4 T050 (issue #13) - Request 6 - Next steps

**Record type:** Exact prompt.

**Summary (non-verbatim):** Say what to do next.

**Exact prompt (verbatim):**

`````text
What to do next
`````

## 2026-11-28 - PA#4 T050 (issue #13) - Request 7 - Close out PR 1

**Record type:** Exact prompt.

**Summary (non-verbatim):** Save this session's prompts in `brief.md`, then push the branch and open PR 1 into `feature/pa4`.

**Exact prompt (verbatim):**

`````text
Close out PR1 and save this prompt into brief.
`````
