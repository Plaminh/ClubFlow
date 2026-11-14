# **ClubFlow — final project brief** 

#### **CSC13008 · 24KTPM1 · HK1 2026–27** 

ClubFlow is the final project for the whole class. Every team keeps its members and builds ClubFlow in its own repository. PA#2 to PA#6 are checked against this brief. 

The idea, the requirements and the screens below come from the PA#1 work of Lâm Gia Hưng, Trịnh Khánh Linh and Văn Viết Minh Phú, the winners of the Final project poll. They are the class's **product owners** (section 6), and each of them earns 0.5 bonus points on the final project. 

Your own PA#1 proposal keeps its mark. Nobody redoes PA#1. 

## **1. The problem** 

When recruiting members, a club may receive CVs through forms, review applications in spreadsheets, and coordinate interview times in group chats, leaving information about each application scattered across several tools. If a student applies for multiple positions and an interviewer serves multiple departments, organizers must also compare role requirements, availability, and rooms to avoid scheduling conflicts. Manual updates can cause applications to be missed, CVs to be assigned to the wrong interviewer, unconfirmed schedules to be shared, or interview feedback to be attached to the wrong application; students may also have difficulty knowing the status of their applications. ClubFlow addresses fragmented recruitment tracking and coordination by keeping application records, assignments, approved schedules, interviewer assessments, and final outcomes in one process with clear ownership, helping clubs manage a campaign and applicants receive accurate information about their applications and results. 

## **2. Users** 

|**User**|**What they want to do**|**Expected outcome / access limit**|
|---|---|---|
|**Club executive**<br>**or recruitment**<br>**lead —**<br>**Executive**|Create a campaign, departments<br>and positions; configure<br>interviewers, their availability<br>and rooms; review CVs; adjust<br>and approve schedules; record<br>and publish application outcomes|Track each application, prepare a<br>workable interview schedule, and<br>communicate a clear decision for<br>each position|
|**Student**<br>**applicant —**<br>**Applicant**|Browse campaigns; submit a CV<br>for one or more positions; choose<br>available interview times; track<br>CV screening, interview<br>schedules, and final results for<br>each application|Know whether an application was<br>received, whether it passed CV<br>screening, when and where to<br>attend an interview, and whether it<br>passed the final selection. Can view<br>only their own application data|



|**User**|**What they want to do**|**Expected outcome / access limit**|
|---|---|---|
|**Assigned club**|Provide availability to the|Prepare for and attend assigned|
|**interviewer —**|Executive; view assigned|interviews, then send feedback on|
|**Interviewer**|interview schedules and CVs;<br>submit an assessment after each<br>assigned interview|the right application. Can read CVs<br>and submit assessments only for<br>assigned applications|



Visitors can view public recruitment campaigns but must sign in to apply. The semester version serves one club, and accounts for all three roles are provided in advance. A department represents a functional unit and does not replace access roles. The Executive enters interviewer availability and selects from a list of existing rooms. 

## **3. Main flow** 

### **3.1. Prototype purpose and entry point** 

The prototype shows **a club Executive coordinating one recruitment campaign** , from preparing campaign details through confirming interview schedules. The user is signed in as an Executive, and all actions belong to the same club and campaign. 

The three screens are connected in this order: 

#### **Create Recruitment Campaign → Application Review → Interview Scheduling.** 

Applicants submit their CVs after the campaign is published; those submissions become the input to application review. In the prototype, sample applications represent submissions received during that period. Moving from Screen 1 to Screen 2 does not automatically create applicants or approve applications. 

### **3.2. How the prototype flow works** 

**Step 1 — Prepare and publish a campaign in Create Recruitment Campaign.** The Executive enters the campaign name, host club, description, opening and closing dates, and application instructions. They add departments and positions, quotas, job descriptions, and requirements. Save as Draft stores the configuration for later editing; Preview Campaign shows what students will see. When the user selects Publish Campaign, the system checks required fields and dates before publishing. If the information is invalid, the user stays on the page and corrects it. After the campaign is published and receives applications, Applications opens Screen 2 for that same campaign. 

**Step 2 — Review each application in Application Review.** The list shows submitted applications, applicants, positions, submission times, and statuses. The Executive searches or filters the list, then selects Review to open an application drawer beside it. The Executive reads the CV and statement, adds an internal note, and selects Shortlist Candidate or Reject. The system updates only the application being reviewed. If one student applies for two positions, the decision for one position does not change the other application. Closing the drawer returns to the list and keeps the current filters. 

**Step 3 — Send eligible applications to scheduling.** Once there is at least one Shortlisted application, the Executive selects Continue to Interview Scheduling. Screen 3 receives the applications that passed CV screening for the same campaign, along with the configured interviewers, availability, and rooms. Only eligible applications enter scheduling. Shortlisted means an application passed CV screening; it does not mean the applicant has been accepted or already has a confirmed interview. 

**Step 4 — Generate and review a schedule in Interview Scheduling.** The Executive selects a date, time window, and interview duration, then generates a draft. The system checks available time slots, an interviewer assigned to the relevant position, both parties’ availability, and an available room. The draft labels assignments as Proposed, applications that could not be scheduled as Unassigned, and assignments with a scheduling conflict as Conflict. The Executive can select Edit, Resolve, or + Assign Slot to adjust or assign an interview manually. The system rechecks the people, time, and room after each change. Save Changes stores the draft only. 

**Step 5 — Approve and confirm the schedule.** After applications close, all applications have been reviewed, and the draft has been checked, the Executive selects Approve & Confirm Schedule. The system displays a summary and allows confirmation only when every Shortlisted application has a valid assignment and none remain Unassigned or in Conflict. After confirmation, the campaign configuration and schedule become read-only. Each applicant and interviewer can view their own confirmed schedule, and Screen 3 shows the Confirmed state. The prototype ends with schedule confirmation; this action does not announce recruitment results. 

### **3.3. After the prototype flow** 

The three prototype screens cover campaign setup, CV screening, and schedule confirmation. After the interviews, each assigned Interviewer submits one assessment for each completed interview through the assigned application record. The Executive records a Pass or Fail decision for each position. The application then displays the result to the applicant and sends an in-app notification. The three prototype screens show the Executive's main flow; the applicant submission/results view and assigned Interviewer assessment view support the remaining steps. 

### **3.4. End-to-end example** 

Student A applies for two positions—Content and Communications—in the same campaign, creating applications A01 and A02. The Executive reviews each CV and shortlists both applications. When scheduling, each application must be assigned an interviewer qualified for its position, and the two interviews cannot overlap because they belong to the same student. If the Executive moves both interviews to 09:00–09:20, the system reports a conflict and blocks approval. After moving one interview to another available slot and checking the draft again, the Executive confirms the schedule. Student A then sees two separate interviews at different times. This example illustrates how the flow works. 

### **3.5. Exception flow** 

- **Required information is missing or the campaign is closed:** show a specific error, do not submit the application, and retain valid information already entered. 

- **The same student applies twice for the same position in one campaign:** open the existing application; applications for other positions remain allowed. 

- **No qualified interviewer, shared available time, or room is available:** leave the application Unassigned and show the reason so the Executive can adjust the draft; do not reject the applicant automatically. 

- **A schedule edit creates an overlap:** identify the affected interviews and block confirmation of the conflicting assignment. 

- **Applications remain unscheduled:** block confirmation and identify the applications that need attention; the Executive adjusts availability, interviewer, or room and regenerates the draft. 

- **A confirmed schedule is opened:** show it as read-only and disable editing and regeneration. 

## **4. Scope** 

This is the starting scope. The product owners may narrow or clarify it (section 6). 

The semester version serves **one club, one active recruitment campaign at a time, and one interview date per campaign** . Accounts for all three roles are provided in advance; the application supports sign-in and role-based access. Each application has one CV screening round, at most one interview with one interviewer, and one assessment for that interview. Confirmed schedules remain available for viewing while the application proceeds to its final decision. 

### **Building** 

1. **Create recruitment campaigns:** Enter campaign details, deadlines, instructions, and a list of departments/positions with their respective quotas. Support saving drafts, previewing, and publishing campaigns. 

2. **Accept applications:** Provide a fixed application form containing student information, a CV in PDF format (maximum 5 MB), a motivation statement (maximum 300 words), and availability based on time slots provided by the club. A student may apply for multiple positions, with a separate application required for each position. Duplicate applications for the same position are not allowed. 

3. **Screen CVs:** Search and filter applications, view CVs and application details in a drawer, add internal notes, and mark each application as Shortlisted or Rejected. Maintain application and applicant statistics, sorting, pagination, and basic CSV export on the application list. 

4. **Prepare interview schedules:** Allow the Executive to assign interviewers to one or more positions, enter their available time slots, and select available rooms. Each room can host only one interview session at a time. All interviews within a campaign must use the same slot duration: 15, 20, or 30 minutes. 

5. **Propose and approve interview schedules:** Schedule only Shortlisted applications by sequentially selecting the first available combination of time slot, interviewer, and room. Display reasons for Unassigned applications, allow draft schedule adjustments, and support schedule table export. Check for conflicts involving applicants, interviewers, and rooms within the campaign. The schedule can only be confirmed after applications have closed, all applications have been reviewed, all required interviews have been scheduled, and no conflicts remain. Once confirmed, the campaign configuration, applications, and schedule become read-only. 

6. **Provide role-based access:** Applicants can view their CV screening status and personal interview schedules. Interviewers can only access their assigned schedules and applicants' CVs. Executives can view and manage all applications within a campaign. CV screening notes must not be visible to Applicants or Interviewers. 

7. **Evaluate candidates and send notifications:** Allow Interviewers to evaluate candidates and notify applicants of their final results (pass/fail). 

### **Not Building** 

1. Support for multiple clubs or simultaneous recruitment campaigns; self-service account registration or recovery; university account verification; and multi-level administrative access control. 

2. Dynamic room creation, room capacity management, university room booking, checking schedules outside the active campaign, or large-scale schedule optimization. 

3. University single sign-on (SSO). 

4. AI-powered CV screening or ranking, advanced analytics dashboards, audit trails, or customizable application forms. 

5. Post-recruitment management of events, members, and internal task assignments; chat, video calls, payments, or a dedicated mobile application. 

## **5. Screens** 

These three screens show the features PA#2 needs. They are a starting point, not a picture to copy: your team chooses the screens, the layout, the content, the colours and the file names ( `index.html` is the first page), and you may build them as static pages or with React. What counts is that your pages deliver these features and that none of the problems below appears in them. 

### **Problems your pages must not have** 

The rubric calls this the Fix these list. Where an item names a screen or a sample value, it describes the authors' screens. Your own pages and content only have to avoid the same problem. 

- **Dates do not fit together.** Applications close on Oct 30, 2026 on Screen 1 and on Nov 5, 2026 on Screen 2, and interviews on Screen 3 are on Oct 27, 2026, before either date. Use one timeline on all three pages. 

- **Screen 2 has the wrong page title.** Its top bar still says "Create Recruitment Campaign · DRAFT MODE". 

- **The drawer on Screen 2 covers most of the list.** The application details and the list must both stay readable at every width. 

- **The counts on Screen 3 do not add up.** The footer says 6 Proposed, 1 Conflict and 2 Unassigned, which makes 9, but the table has 8 rows and only 5 of them are Proposed. 

- **The conflict on Screen 3 is not a conflict.** The banner reports an overlap at 09:20, but no other row overlaps the highlighted one. 

- **The sample people overlap.** Trần Gia Huy and Hoàng Thảo Vy appear as both applicants and interviewers on Screen 3. 

- **"Verified" contradicts the scope.** "Verified Student", "100% verified", "Verified Attachments" and "verified student credentials" all suggest university account verification, which is under Not Building. 

- **The footer is template text.** Remove "© 2025 ClubFlow", Privacy Policy, Terms of Service and Support Center. 

### **Screen 1 — Create Recruitment Campaign** 

This screen allows the Club Executive to configure a recruitment campaign by entering its basic information, application period, recruitment departments, available positions, vacancy quotas, and position requirements. The executive can save the campaign as a draft, preview it, or publish it. After publishing the campaign, the executive proceeds to the application review stage to manage incoming applications. 



<!-- Start of picture text -->
= ClubFiow Create Recruitment Campaign oer woot BOQ reamAmer reson<br>1B Apoteatons Dashboard Recrukment Campaigns New Campaign<br>(interven Scheele GRAFT © serAceSo (8)<br>Create Recruitment‘  Campaign Disove sort © Proview campagn<br>tien<br>fr your eh.<br>1. Campaign Overview & Timeline ——<br>congign Name+ ost |Ogio *<br>a8 Recrutment 2028 ‘Student Actives Board (SAB)<br>‘campaign Desrpion tn +<br>Jo ou stunt conmuntyananeporgenz cretve cpus events, ad inpctu mined styling an ose campus te<br>acres unhersty cohorts<br>© Hapa support -AoptcatonCREED Opening Oate* oral opens 0:00 AM Apleston1/20/2026cosy Date * mas<br>Orr. © popes Suomen instructionfr Cant *<br>Cangidates must complete vei student credentials, submit<br>OF fomat a mothatio statement (max 200 words), nd provide an updated CVin<br>2. Recruitment Departments & Positions ++ Ada Peon<br>=, Content Team comme)<br>Contant eam Specs, Megat commareatons 2<br>te rong socal mel posts, ress cay,and rslom hea campaign nates<br>tong cooywrting sary wh unversty tens, reste salng<br>‘a Event Operations Soon)<br>Support on rnd gts, venue Book coodnston and tage manager rng een<br>©. Design& Media ropense 8<br>Meda Vinal Deer conn ats 2<br>Predice pote designs, ge vt, gt yea ett win ci even tog<br>Prony Cava Adobe Cresive Sue base potogaphy, el design portolo<br> backto Campaigns Saveas Dat<br><!-- End of picture text -->

### **Screen 2 — Application Review** 

This screen allows the Club Executive to review applications submitted to the recruitment campaign. The executive can view application statistics, inspect applicant profiles and statements of purpose, and review attached CVs. For each application, the executive can 

shortlist or reject the applicant. Shortlisted applicants are then passed to the interview scheduling stage. 



<!-- Start of picture text -->
2, Applicant Profile & Submission x<br>- Nguyén Minh Anh © Pending Review<br>5202810889 Vried Student<br>2 minnanh.nguyen@univedu.vn 0912 345 678.<br>(Year 2 Business IT © oPA:365/40<br>=, Content Team Fst choice<br>* stecia & Communications Department « Primary Preference<br>STATEMENT OF PURPOSE Word count 142 / 300 words<br>“Ihave managed communication channels for our freshman cohort and<br>have a strong passion for writing engaging narratives that bring students oy 24 spoicants<br>loser together. | want to contribute directly to SAB's campus campaigns<br>by creating impactful stories, organizing clear social media copy, and<br>learning firsthand from experienced student leaders.”<br>VERIFIED ATTACHMENTS<br>|B _Nowyendtinnanh.cv.20261.4 MB + Uploaded pat i WG<br>Oct 18, 2026<br>EXECUTIVE REVIEWER NOTES (optional vise only to boars)<br>Strong writing sample in portfolio, Clear alignment with SAB values.<br>Recommended for Round 1 panel.<br>‘© Submited on Oct 8, 2026 © Awalting Review<br>© 2025 ciuFow: Student Recrutment Platform. Privacy Policy Terms of Service Support Center<br><!-- End of picture text -->

### **Screen 3 — Interview Scheduling** 

This screen allows the Club Executive to generate and review a proposed interview schedule for shortlisted applicants. The executive can inspect interview dates, time slots, assigned interviewers, rooms, and scheduling conflicts. The executive can edit assignments, resolve conflicts, and export the timetable. Once all necessary assignments and conflicts have been reviewed, the executive can approve and confirm the schedule, completing the interview scheduling stage. 



<!-- Start of picture text -->
& ClubFlow SAB— Recruitment2026 _orarr scHeDuLe BD minnanncia presisen<br>89 Dashboard Dashboard > Recruitment Campaigns > SAB— Recruitment2026 > Interview Scheduling<br>‘4% Recruitment Campaigns Interview Scheduling + :=*:sen 2020<br>El Applications REISTRETD PEER © Approve& Confirm Schedule<br>Generate a proposed schedule for shortlisted applicants, review assignments,<br>G Interview Schedule resolve conflicts, and confirm the final schedule.<br>‘Shortlisted Applications 2 ‘Scheduled Interviews: a Unassigned Applications 3 ‘Scheduling Conflicts A<br>From Stage 2 Ready for Pending timetable Needs Interviewer Requires executive<br>Review scheduling Mcceted slots Sots proposed || fe atlocation overlap action<br>‘Ay Scheduling<br>Interviewer Nguyénconflict detectedThao Vy has overlapping interviews at 09:20 AM in Room A (Media Lab). & Resolve Contict<br>= Automated Scheduling Parameters Avio-AssionEnaine © Regenerate Schedule<br>TARGET DATE rime window stor ouRATION ACTIVE ROOMS / TABLES ASSIGNED PANELISTS<br>6 oct 27,2026 © 09:00 AM - 12:00 PM 20 min per session ~ 3 Rooms: A, B,C +3 Panelists Active<br>© Help & Support Q h m All Slot Statuses ~ @ Save Changes Showing 8 candidates.<br>Mint Anh :<br>Se Exccutive ~ APPLICANT NAME G10 POSITION.APPLIED DATE TIMESLOT ASSIGNEDINTERVIEWER ASSIGNED-«ROOM/TABLE SCHEDULESTATUS AeTiON<br>Nguyén Minh Anh Content oct 27, 09:00 - Room A (Media<br>$20241088 Team 2026 99:20 Tran Gia Huy Lab) eroesees) fan<br>W Lészezdens¢ Thu Ha ContentTeam Oct2026 27,” 99:4009:20 ~ A thao vyNguyén RoomLab)  A (Media # Coco n tiet,n | ecoive |<br>GH Transp9281102 Gia Huy EventOperations oct2026 27, 19:2010:00 - Pham Minh Bde Roommy B (Cont Srrepoeed) fei.<br>a8 PhamPham  QuécQu  Bao BasteDesign & octzone27, levee10:20 - Hoang Théovy Room[07¢ . Proposed et .<br>or 620240741Duc Thang Event Oct 27, 10:40 - 1am Minn Bie Room B (Conf 1 Propose eat<br>Operations: 2026 11:00 Pham stiah 80% Rm) Proposed<br>ML Va$20240512 Mai Linh ContentTeam Oct202627, 1:2011:00 - ‘Tniran Gla Gia HuyHuy RoomLab) A (Media ¢ propsProposed: eait<br>Bul Quang Huy Design& 0ct27, — sracsioned ne : . = ; + Assign<br>ty) HoangHoang Th Thao Vy contentee ©ct27,Sosa  nasstonedUnassigned Unassigned_Unassign Unassigned; -sUnassigreanasslaned + Assignfeel<br>Showing all candidates in SAB Campaign Interview Roster © c Proposed © 1Confict @ 2 Unassigned<br>© 2025 clubfiow. Student Recruitment Platform Privacy Polley Termsof Service Support Center<br><!-- End of picture text -->

## **6. Product owners** 

The authoring team takes the lead on the product. They decide **how ClubFlow behaves and what is in scope** wherever this brief is silent or leaves room, for example which parts of the scope can wait, or what an applicant sees after a rejection. 

- **Ask** under the post ClubFlow — questions for the product owners, which they open in the course Facebook group, starting with #WAD24KTPM1. Do not ask in private messages: one team's answer is everyone's answer. 

- **Answers** come within two working days, under that post. A scope decision posted there applies to every team. Cite it in your repository when you rely on it. 

- **What the product owners do not decide:** marks, deadlines, rubrics, and what PA#2 requires: the features of its three screens and the Fix these list. Those belong to the lecturer. 

- The product owners build ClubFlow like every other team and are marked the same way. 

