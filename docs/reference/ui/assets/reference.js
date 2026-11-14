/* ClubFlow UI reference — minimal vanilla JS. All data below is fictional and in-memory only.
   Nothing here is real authentication or storage. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  if (params.has('all')) document.body.classList.add('all');

  /* ---------- tabs (roving focus, arrow keys) ---------- */
  function initTabs(root, onChange) {
    var tabs = $$('[role=tab]', root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      if (onChange) onChange(tab.id);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    return { select: function (id) { select(document.getElementById(id), false); } };
  }

  /* ---------- modal (focus trap, Esc, restore focus) ---------- */
  function initModal(backdrop) {
    var opener = null;
    function focusables() { return $$('a[href],button:not([disabled]),input,select,textarea', backdrop).filter(function (e) { return !e.hidden; }); }
    function open(from) { opener = from || document.activeElement; backdrop.hidden = false; var f = focusables(); if (f[0]) f[0].focus(); }
    function close() { backdrop.hidden = true; if (opener && opener.focus) opener.focus(); }
    backdrop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    $$('[data-close]', backdrop).forEach(function (b) { b.addEventListener('click', close); });
    return { open: open, close: close };
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function badge(cls, text) { return '<span class="badge ' + cls + '">' + esc(text) + '</span>'; }
  function words(s) { var t = s.trim(); return t ? t.split(/\s+/).length : 0; }

  var page = document.body.getAttribute('data-page');

  /* =====================================================================
     applicant.html
     ===================================================================== */
  if (page === 'applicant') {
    var ACCOUNTS = {
      minhanh: { name: 'Nguyễn Minh Anh', sid: '26DEMO0142', email: 'minh.anh@demo.example', faculty: 'Công nghệ thông tin', apps: ['CF-026', 'CF-027'] },
      quocbao: { name: 'Phạm Quốc Bảo', sid: '26DEMO0177', email: 'quoc.bao@demo.example', faculty: 'Thiết kế', apps: ['CF-030'] },
      khanhlinh: { name: 'Vũ Khánh Linh', sid: '26DEMO0203', email: 'khanh.linh@demo.example', faculty: 'Truyền thông', apps: ['CF-031'] },
      baongoc: { name: 'Trần Bảo Ngọc', sid: '26DEMO0119', email: 'bao.ngoc@demo.example', faculty: 'Truyền thông', apps: ['CF-028'] },
      thaovy: { name: 'Lê Hoàng Thảo Vy', sid: '26DEMO0231', email: 'thao.vy@demo.example', faculty: 'Công nghệ thông tin', apps: ['CF-029'] },
      haidang: { name: 'Trương Hải Đăng', sid: '26DEMO0258', email: 'hai.dang@demo.example', faculty: 'Thiết kế', apps: [] }
    };
    var UX = 'User Experience Design', CC = 'Content Creation';
    /* base = what exists once submitted; later = screening / schedule / final result states */
    var APPS = {
      'CF-026': { pos: UX, at: '14/10/2026, 09:42', screen: 'pass', slot: '05/11/2026 · 09:00–09:15 · Phòng A-201', result: { v: 'Pass', published: true } },
      'CF-027': { pos: CC, at: '14/10/2026, 10:05', screen: 'pass', slot: '05/11/2026 · 09:15–09:30 · Phòng B-105', result: { v: 'Fail', published: false } },
      'CF-028': { pos: CC, at: '15/10/2026, 11:08', screen: 'reject', slot: null, result: null },
      'CF-029': { pos: UX, at: '16/10/2026, 08:45', screen: 'reject', slot: null, result: null },
      'CF-030': { pos: UX, at: '17/10/2026, 14:20', screen: 'pass', slot: '05/11/2026 · 09:15–09:30 · Phòng A-201', result: { v: 'Pass', published: false } },
      'CF-031': { pos: CC, at: '18/10/2026, 15:30', screen: 'pass', slot: '05/11/2026 · 09:00–09:15 · Phòng B-105', result: { v: 'Pass', published: false } }
    };
    var added = {};            // in-memory simulated submissions: user -> [ {id,pos,at} ]
    var state = { phase: params.get('phase') || 'open', user: null };

    var PHASE_TEXT = {
      notopen: { cls: 'warn', t: 'Chưa mở nhận hồ sơ', d: 'Hồ sơ được nhận từ 12/10/2026. Hiện chưa thể nộp hồ sơ.' },
      open: { cls: 'ok', t: 'Đang nhận hồ sơ', d: 'Ứng viên có thể nộp hồ sơ từ 12/10/2026 đến 30/10/2026.' },
      closed: { cls: 'err', t: 'Đã đóng nhận hồ sơ', d: 'Hạn nộp hồ sơ là 30/10/2026 nên không thể nộp thêm. Ứng viên đã nộp vẫn theo dõi được hồ sơ của mình.' }
    };

    var modal = initModal($('#signin-modal'));
    var tabsApi = initTabs($('#portal-tabs'));
    var ids = { campaign: 'tab-campaign', apply: 'tab-apply', mine: 'tab-mine', notes: 'tab-notes' };

    function userApps() {
      if (!state.user) return [];
      var a = ACCOUNTS[state.user].apps.map(function (id) { return { id: id, d: APPS[id] }; });
      (added[state.user] || []).forEach(function (n) { a.push({ id: n.id, d: { pos: n.pos, at: n.at, screen: 'new', slot: null, result: null } }); });
      return a;
    }

    function appView(app) {
      var d = app.d, closed = state.phase === 'closed';
      var screen = (!closed || d.screen === 'new') ? { c: 'b-amber', t: 'Chờ duyệt' } : d.screen === 'pass' ? { c: 'b-green', t: 'Qua vòng CV' } : { c: 'b-red', t: 'Loại ở vòng CV' };
      var interview, slot = '', result, note = '';
      if (!closed || d.screen === 'new') { interview = badge('b-gray', 'Chưa có lịch'); result = '<span class="muted">Chưa có</span>'; note = 'Hồ sơ đang chờ Ban tuyển dụng duyệt. “Qua vòng CV” sau này chỉ nghĩa là đủ điều kiện vào lịch phỏng vấn, chưa phải kết quả cuối.'; }
      else if (d.screen === 'reject') { interview = badge('b-gray', 'Không có phỏng vấn'); result = '<span class="muted">Không áp dụng</span>'; note = 'Hồ sơ không được chuyển sang vòng phỏng vấn.'; }
      else {
        interview = badge('b-green', 'Confirmed'); slot = d.slot;
        if (d.result && d.result.published) { result = badge(d.result.v === 'Pass' ? 'b-green' : 'b-red', d.result.v === 'Pass' ? 'Final Pass' : 'Final Fail'); note = 'Kết quả đã được công bố cho hồ sơ ' + app.id + '.'; }
        else { result = badge('b-amber', 'Chưa công bố'); note = 'Lịch phỏng vấn đã được xác nhận. Kết quả cuối chỉ hiển thị sau khi Ban tuyển dụng công bố.'; }
      }
      return { screen: screen, interview: interview, slot: slot, result: result, note: note };
    }

    function render() {
      var u = state.user ? ACCOUNTS[state.user] : null, p = PHASE_TEXT[state.phase];
      /* header */
      $('#who').textContent = u ? u.name + ' · Applicant' : 'Khách (chưa đăng nhập)';
      $('#btn-signin').hidden = !!u; $('#btn-signout').hidden = !u;
      /* campaign status */
      var st = $('#campaign-status'); st.className = 'alert ' + p.cls; st.innerHTML = '<b>' + p.t + '</b>' + p.d;
      var apply = $('#btn-apply-now'), why = $('#apply-why');
      apply.disabled = state.phase !== 'open';
      why.textContent = state.phase === 'open' ? (u ? '' : 'Nộp hồ sơ cần đăng nhập; khách vẫn xem được thông tin công khai.') : p.d;
      /* apply tab */
      var gate = $('#apply-gate'), form = $('#apply-form-wrap'), closedNote = $('#apply-closed');
      gate.hidden = !!u; form.hidden = !u; closedNote.hidden = state.phase === 'open';
      closedNote.innerHTML = '<b>' + p.t + '</b>' + p.d + ' Biểu mẫu bên dưới chỉ để xem và đang bị vô hiệu hóa.';
      $$('#apply-form input:not([readonly]), #apply-form select, #apply-form textarea, #apply-form button').forEach(function (c) { c.disabled = state.phase !== 'open'; });
      if (u) {
        $('#f-name').value = u.name; $('#f-sid').value = u.sid; $('#f-email').value = u.email; $('#f-faculty').value = u.faculty;
        var applied = userApps().map(function (a) { return a.d.pos; });
        $$('#f-position option').forEach(function (o) { if (o.value) o.textContent = o.value + (applied.indexOf(o.value) > -1 ? ' (đã nộp)' : ''); });
      }
      summary();
      /* my applications */
      var mine = $('#mine-list'), apps = userApps();
      $('#mine-gate').hidden = !!u;
      $('#mine-wrap').hidden = !u;
      if (u) {
        $('#mine-count').textContent = apps.length + ' hồ sơ của ' + u.name;
        if (!apps.length) { mine.innerHTML = '<div class="empty"><b>Bạn chưa có hồ sơ nào</b>Chọn tab Apply để nộp hồ sơ cho một vị trí. Bạn có thể ứng tuyển nhiều vị trí, mỗi vị trí một hồ sơ.</div>'; }
        else mine.innerHTML = '<div class="table-wrap"><table class="table-stack"><thead><tr><th>Hồ sơ</th><th>Vị trí</th><th>Ngày nộp</th><th>Sàng lọc CV</th><th>Phỏng vấn</th><th>Kết quả cuối</th></tr></thead><tbody>' +
          apps.map(function (a) { var v = appView(a); return '<tr><td data-label="Hồ sơ"><b>' + a.id + '</b></td><td data-label="Vị trí">' + esc(a.d.pos) + '</td><td data-label="Ngày nộp">' + a.d.at + '</td><td data-label="Sàng lọc CV">' + badge(v.screen.c, v.screen.t) + '</td><td data-label="Phỏng vấn">' + v.interview + (v.slot ? '<span class="sub">' + v.slot + '</span>' : '') + '</td><td data-label="Kết quả cuối">' + v.result + '</td></tr><tr class="note-row"><td colspan="6" class="small muted" style="padding-top:0">' + a.id + ' · ' + v.note + '</td></tr>'; }).join('') + '</tbody></table></div>';
      }
      /* notifications: only published results + confirmed schedules; unpublished results never appear */
      $('#notes-gate').hidden = !!u; $('#notes-wrap').hidden = !u;
      var notes = [];
      if (u && state.phase === 'closed') apps.forEach(function (a) {
        if (a.d.screen === 'pass') notes.push({ t: 'Lịch phỏng vấn ' + a.id + ' đã được xác nhận', d: a.d.slot + '.' });
        if (a.d.result && a.d.result.published) notes.push({ t: 'Kết quả ' + a.id + ' đã được công bố', d: a.d.pos + ': ' + (a.d.result.v === 'Pass' ? 'Final Pass' : 'Final Fail') + '.' });
      });
      if (u && state.phase === 'open') apps.forEach(function (a) { notes.push({ t: 'Đã nhận hồ sơ ' + a.id, d: a.d.pos + ' · nộp ' + a.d.at + '.' }); });
      $('#notes-list').innerHTML = notes.length ? notes.map(function (n) { return '<div class="item"><b>' + esc(n.t) + '</b><span class="meta">' + esc(n.d) + '</span></div>'; }).join('') : (u ? '<div class="empty"><b>Chưa có thông báo</b>Thông báo về lịch phỏng vấn và kết quả đã công bố sẽ hiện ở đây.</div>' : '');
      $('#notes-count').textContent = notes.length; $('#notes-count').hidden = !notes.length;
    }

    /* ---- apply form behaviour ---- */
    var MAX_WORDS = 300, MAX_BYTES = 5 * 1024 * 1024;
    function setErr(id, msg) { var f = $('#' + id).closest('.field'), e = $('#err-' + id.replace('f-', '')); f.classList.toggle('has-error', !!msg); e.hidden = !msg; e.textContent = msg || ''; $('#' + id).setAttribute('aria-invalid', !!msg); return !msg; }
    function summary() {
      var pos = $('#f-position').value, slots = $$('input[name=slot]:checked').map(function (c) { return c.value; });
      var f = $('#f-cv').files[0];
      $('#sum-pos').textContent = pos || 'Chưa chọn';
      $('#sum-slots').textContent = slots.length ? slots.join(', ') : 'Chưa chọn';
      $('#sum-cv').textContent = f ? f.name : 'Chưa chọn tệp';
      var n = words($('#f-sop').value); $('#sum-sop').textContent = n + ' / ' + MAX_WORDS + ' từ';
    }
    function counter() { var n = words($('#f-sop').value), c = $('#sop-counter'); c.classList.toggle('over', n > MAX_WORDS); c.innerHTML = '<span>Tối đa ' + MAX_WORDS + ' từ</span><b>' + n + ' / ' + MAX_WORDS + ' từ</b>'; }
    function checkCv() {
      var f = $('#f-cv').files[0];
      if (!f) return setErr('f-cv', 'Vui lòng chọn CV định dạng PDF.');
      if (!/\.pdf$/i.test(f.name) || (f.type && f.type !== 'application/pdf')) return setErr('f-cv', 'Tệp phải là PDF (.pdf).');
      if (f.size > MAX_BYTES) return setErr('f-cv', 'CV tối đa 5 MB; tệp hiện tại ' + (f.size / 1048576).toFixed(1).replace('.', ',') + ' MB.');
      return setErr('f-cv', '');
    }
    function checkSop() { var n = words($('#f-sop').value); if (!n) return setErr('f-sop', 'Vui lòng viết bài trình bày nguyện vọng.'); if (n > MAX_WORDS) return setErr('f-sop', 'Bài trình bày dài ' + n + ' từ; tối đa ' + MAX_WORDS + ' từ.'); return setErr('f-sop', ''); }
    function checkPos() {
      var v = $('#f-position').value, dup = false;
      if (!v) return setErr('f-position', 'Vui lòng chọn vị trí ứng tuyển.');
      userApps().forEach(function (a) { if (a.d.pos === v) { dup = a.id; } });
      if (dup) return setErr('f-position', 'Bạn đã nộp hồ sơ ' + dup + ' cho vị trí này. Mỗi vị trí chỉ có một hồ sơ trong chiến dịch; bạn vẫn có thể ứng tuyển vị trí khác.');
      return setErr('f-position', '');
    }
    function checkSlots() {
      var ok = $$('input[name=slot]:checked').length > 0, f = $('#slot-field');
      f.classList.toggle('has-error', !ok); $('#err-slot').hidden = ok; $('#err-slot').textContent = ok ? '' : 'Chọn ít nhất một khung giờ có thể tham gia.'; return ok;
    }
    $('#f-sop').addEventListener('input', function () { counter(); summary(); if (words($('#f-sop').value) > MAX_WORDS || $('#f-sop').closest('.field').classList.contains('has-error')) checkSop(); });
    $('#f-cv').addEventListener('change', function () { checkCv(); summary(); });
    $('#f-position').addEventListener('change', function () { checkPos(); summary(); });
    $$('input[name=slot]').forEach(function (c) { c.addEventListener('change', function () { checkSlots(); summary(); }); });
    $('#apply-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var res = [checkPos(), checkCv(), checkSop(), checkSlots()];
      var ok = res.every(Boolean), box = $('#apply-result');
      if (!ok) { box.className = 'alert err'; box.hidden = false; box.innerHTML = '<b>Chưa thể gửi hồ sơ</b>Hãy sửa các trường được đánh dấu. Dữ liệu bạn đã nhập hợp lệ vẫn được giữ lại.'; var bad = $('.has-error input,.has-error select,.has-error textarea', $('#apply-form')); if (bad) bad.focus(); return; }
      var n = 32 + Object.keys(added).reduce(function (s, k) { return s + added[k].length; }, 0);
      (added[state.user] = added[state.user] || []).push({ id: 'CF-0' + n, pos: $('#f-position').value, at: '12/10/2026, 10:00' });
      box.className = 'alert ok'; box.hidden = false; box.innerHTML = '<b>Đã gửi hồ sơ (mô phỏng)</b>Hồ sơ mới xuất hiện trong tab My Applications. Đây chỉ là demo trong bộ nhớ, không ghi vào cơ sở dữ liệu.';
      render();
    });

    /* ---- sign in / out ---- */
    function openSignin(from) { modal.open(from); }
    $('#btn-signin').addEventListener('click', function () { openSignin(this); });
    $('#btn-signout').addEventListener('click', function () { state.user = null; added = {}; render(); tabsApi.select(ids.campaign); });
    $('#btn-apply-now').addEventListener('click', function () { if (!state.user) openSignin(this); else tabsApi.select(ids.apply); });
    $$('[data-open-signin]').forEach(function (b) { b.addEventListener('click', function () { openSignin(this); }); });
    $('#signin-form').addEventListener('submit', function (e) { e.preventDefault(); state.user = $('#demo-account').value; modal.close(); render(); });
    $('#demo-phase').addEventListener('change', function () { state.phase = this.value; $('#apply-result').hidden = true; render(); });

    $('#demo-phase').value = state.phase;
    if (params.get('as') && ACCOUNTS[params.get('as')]) { state.user = params.get('as'); $('#demo-account').value = state.user; }
    counter(); render();
    if (params.get('tab') && ids[params.get('tab')]) tabsApi.select(ids[params.get('tab')]);
  }

  /* =====================================================================
     interviewer.html
     ===================================================================== */
  if (page === 'interviewer') {
    var IV = {
      'CF-026': { name: 'Nguyễn Minh Anh', pos: 'User Experience Design', time: '09:00–09:15', room: 'A-201', status: 'submitted', fac: 'Công nghệ thông tin', year: 'Năm 2', sop: 'Muốn hiểu cách sinh viên dùng các công cụ học tập và hoạt động câu lạc bộ; đã từng phỏng vấn người dùng và dựng luồng màn hình trên Figma.', rec: 'Đề xuất tiếp nhận', notes: 'Trình bày rõ ràng, nêu được ví dụ cụ thể về phỏng vấn người dùng. Cần luyện thêm cách ưu tiên phản hồi khi nhu cầu người dùng khác nhau.' },
      'CF-030': { name: 'Phạm Quốc Bảo', pos: 'User Experience Design', time: '09:15–09:30', room: 'A-201', status: 'ready', fac: 'Thiết kế', year: 'Năm 3', sop: 'Quan tâm đến thiết kế tương tác và muốn thực hành quy trình thiết kế theo nhóm cùng Ban Digital Product.', rec: '', notes: '' }
    };
    var current = 'CF-030';
    var STATUS = { submitted: ['b-green', 'Đã đánh giá'], ready: ['b-amber', 'Chờ đánh giá'] };
    var submitted = { 'CF-026': true };

    function row(id) { return $('tr[data-id="' + id + '"]'); }
    function showDetail(id) {
      current = id; var d = IV[id];
      $$('#assigned tbody tr').forEach(function (r) { r.classList.toggle('selected', r.getAttribute('data-id') === id); });
      $('#d-id').textContent = id + ' · ' + d.name;
      $('#d-pos').textContent = d.pos; $('#d-when').textContent = '05/11/2026 · ' + d.time + ' · Phòng ' + d.room;
      $('#d-cv').textContent = 'CV-' + id + '.pdf (mẫu hư cấu)'; $('#d-fac').textContent = d.fac + ' · ' + d.year; $('#d-sop').textContent = d.sop;
      $('#cv-note').hidden = true;
      $('#a-who').textContent = id + ' · ' + d.name + ' · ' + d.pos;
      var done = !!submitted[id];
      $('#assess-form').hidden = done; $('#assess-done').hidden = !done;
      if (done) { $('#done-rec').textContent = d.rec; $('#done-notes').textContent = d.notes; }
      else { $('#a-notes').value = ''; $$('input[name=rec]').forEach(function (r) { r.checked = false; }); clearAErr(); }
      $('#assess-result').hidden = true;
    }
    function clearAErr() { $$('#assess-form .has-error').forEach(function (f) { f.classList.remove('has-error'); }); $$('#assess-form .error-text').forEach(function (e) { e.hidden = true; }); }
    $$('#assigned [data-cv]').forEach(function (b) { b.addEventListener('click', function () { showDetail(this.closest('tr').getAttribute('data-id')); $('#cv-note').hidden = false; }); });
    $$('#assigned [data-select]').forEach(function (b) { b.addEventListener('click', function () { showDetail(this.closest('tr').getAttribute('data-id')); $('#detail-card').scrollIntoView({ block: 'nearest' }); }); });
    $('#btn-cv').addEventListener('click', function () { var n = $('#cv-note'); n.hidden = !n.hidden; });
    $('#assess-form').addEventListener('submit', function (e) {
      e.preventDefault(); clearAErr();
      var notes = $('#a-notes').value.trim(), rec = $('input[name=rec]:checked'), ok = true;
      if (!notes) { $('#a-notes').closest('.field').classList.add('has-error'); $('#err-notes').hidden = false; ok = false; }
      if (!rec) { $('#rec-field').classList.add('has-error'); $('#err-rec').hidden = false; ok = false; }
      var box = $('#assess-result');
      if (!ok) { box.className = 'alert err'; box.hidden = false; box.innerHTML = '<b>Chưa thể gửi đánh giá</b>Điền nhận xét và chọn đề xuất. Nội dung đã nhập được giữ lại.'; return; }
      IV[current].rec = rec.value; IV[current].notes = notes; submitted[current] = true; IV[current].status = 'submitted';
      var r = row(current); r.querySelector('.st').innerHTML = badge('b-green', 'Đã đánh giá');
      $('#cnt-done').textContent = Object.keys(submitted).length; $('#cnt-wait').textContent = 2 - Object.keys(submitted).length;
      showDetail(current);
      box = $('#assess-result'); box.className = 'alert ok'; box.hidden = false; box.innerHTML = '<b>Đã gửi đánh giá (mô phỏng)</b>Mỗi buổi phỏng vấn chỉ có một đánh giá. Quyết định Pass/Fail do Ban tuyển dụng ghi nhận ở màn hình Application Review, không phải ở đây.';
    });
    var out = $('#btn-signout'), back = $('#btn-signin-back');
    out.addEventListener('click', function () { $('#app').hidden = true; $('#signed-out').hidden = false; $('#who').textContent = 'Chưa đăng nhập'; out.hidden = true; back.hidden = false; back.focus(); });
    back.addEventListener('click', function () { $('#app').hidden = false; $('#signed-out').hidden = true; $('#who').textContent = 'Hà My · Interviewer'; out.hidden = false; back.hidden = true; out.focus(); });
    showDetail(params.get('sel') === 'CF-026' ? 'CF-026' : 'CF-030');
  }

  /* =====================================================================
     review-final-results-preview.html
     ===================================================================== */
  if (page === 'review') {
    var rtabs = initTabs($('#review-tabs'));
    var FR = {
      'CF-026': { name: 'Nguyễn Minh Anh', pos: 'User Experience Design', iv: 'Hà My', when: '05/11/2026 · 09:00–09:15 · A-201', assess: 'submitted', dec: 'Pass', pub: true, rec: 'Đề xuất tiếp nhận', notes: 'Trình bày rõ ràng, nêu được ví dụ cụ thể về phỏng vấn người dùng.' },
      'CF-027': { name: 'Nguyễn Minh Anh', pos: 'Content Creation', iv: 'Gia Huy', when: '05/11/2026 · 09:15–09:30 · B-105', assess: 'submitted', dec: 'Fail', pub: false, rec: 'Cần cân nhắc', notes: 'Ý tưởng nội dung còn chung chung; chưa nêu được kế hoạch phối hợp với nhóm thiết kế.' },
      'CF-030': { name: 'Phạm Quốc Bảo', pos: 'User Experience Design', iv: 'Hà My', when: '05/11/2026 · 09:15–09:30 · A-201', assess: 'pending', dec: null, pub: false },
      'CF-031': { name: 'Vũ Khánh Linh', pos: 'Content Creation', iv: 'Gia Huy', when: '05/11/2026 · 09:00–09:15 · B-105', assess: 'pending', dec: null, pub: false }
    };
    var sel = 'CF-027';
    function frRender() {
      var rows = Object.keys(FR).map(function (id) {
        var d = FR[id];
        var a = d.assess === 'submitted' ? badge('b-green', 'Đã gửi') : badge('b-amber', 'Chờ đánh giá');
        var dec = d.dec ? badge(d.dec === 'Pass' ? 'b-green' : 'b-red', d.dec) : badge('b-gray', 'Chưa ghi nhận');
        var pub = d.pub ? badge('b-green', 'Published') : d.dec ? badge('b-amber', 'Chưa công bố') : badge('b-gray', '—');
        return '<tr class="' + (id === sel ? 'selected' : '') + '"><td data-label="Hồ sơ"><b>' + id + '</b><span class="sub">' + d.name + '</span></td><td data-label="Vị trí">' + d.pos + '</td><td data-label="Phỏng vấn">' + badge('b-green', 'Confirmed') + '<span class="sub">' + d.when + '</span></td><td data-label="Đánh giá">' + a + '</td><td data-label="Người phỏng vấn">' + d.iv + '</td><td data-label="Quyết định">' + dec + '</td><td data-label="Công bố">' + pub + '</td><td class="actions"><button class="btn btn-sm" data-pick="' + id + '" aria-pressed="' + (id === sel) + '">' + (id === sel ? 'Đang xem' : 'Mở') + '</button></td></tr>';
      }).join('');
      $('#fr-body').innerHTML = rows;
      $$('[data-pick]').forEach(function (b) { b.addEventListener('click', function () { sel = this.getAttribute('data-pick'); frRender(); }); });
      var d = FR[sel];
      $('#fr-title').textContent = sel + ' · ' + d.name;
      $('#fr-sub').textContent = d.pos + ' · ' + d.when + ' · Người phỏng vấn: ' + d.iv;
      var canDecide = d.assess === 'submitted' && !d.pub;
      $('#assess-view').innerHTML = d.assess === 'submitted' ? '<div class="panel-gray"><h3>Đánh giá của người phỏng vấn · chỉ để tham khảo</h3><p class="small"><b>Đề xuất:</b> ' + esc(d.rec) + '</p><p class="small" style="margin-top:4px">' + esc(d.notes) + '</p></div>' : '<div class="alert warn"><b>Chưa có đánh giá</b>Người phỏng vấn ' + d.iv + ' chưa gửi đánh giá, nên chưa thể ghi nhận Pass/Fail cho ' + sel + '.</div>';
      $('#btn-pass').disabled = !canDecide; $('#btn-fail').disabled = !canDecide;
      $('#decision-state').innerHTML = d.dec ? 'Quyết định hiện tại: ' + badge(d.dec === 'Pass' ? 'b-green' : 'b-red', d.dec) + ' ' + (d.pub ? badge('b-green', 'Published · chỉ đọc') : badge('b-amber', 'Chưa công bố')) : 'Chưa ghi nhận quyết định.';
      $('#decide-why').textContent = d.pub ? 'Kết quả đã công bố, không thể thay đổi trong prototype này.' : d.assess === 'submitted' ? 'Quyết định chỉ áp dụng cho ' + sel + '; hồ sơ khác của cùng ứng viên được quyết định riêng.' : 'Cần có đánh giá phỏng vấn trước khi ghi nhận quyết định.';
      var unpub = Object.keys(FR).filter(function (k) { return FR[k].dec && !FR[k].pub; });
      $('#btn-publish').disabled = !unpub.length;
      $('#publish-why').textContent = unpub.length ? unpub.length + ' kết quả đã ghi nhận nhưng chưa công bố (' + unpub.join(', ') + '). Công bố sẽ tạo thông báo trong ứng dụng cho từng ứng viên.' : 'Không có kết quả nào đang chờ công bố.';
    }
    ['pass', 'fail'].forEach(function (k) { $('#btn-' + k).addEventListener('click', function () { FR[sel].dec = k === 'pass' ? 'Pass' : 'Fail'; frRender(); }); });
    $('#btn-publish').addEventListener('click', function () {
      var ids2 = Object.keys(FR).filter(function (k) { return FR[k].dec && !FR[k].pub; });
      ids2.forEach(function (k) { FR[k].pub = true; });
      var b = $('#publish-result'); b.hidden = false; b.className = 'alert ok';
      b.innerHTML = '<b>Đã công bố ' + ids2.join(', ') + ' (mô phỏng)</b>Mỗi hồ sơ tạo một thông báo trong ứng dụng cho ứng viên tương ứng. Không có email, SMS hay push.';
      frRender();
    });
    $('#btn-view-assess').addEventListener('click', function () { var v = $('#assess-view'); v.hidden = !v.hidden; this.setAttribute('aria-expanded', !v.hidden); });
    if (params.get('tab') === 'screening') rtabs.select('tab-screening');
    frRender();
  }
})();
