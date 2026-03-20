/* =========================================================
   예약관리 관리자 UI (RVM Admin UI) — 재설계 버전
   
   ★ 주요 수정 사항 ★
   1. 캘린더 날짜/시간 등록 플로우 완전 재설계
      - 날짜 클릭 → 우측 패널에서 시간 슬롯 직접 추가 가능
      - 일괄 설정(range)과 단건 추가(날짜별) 명확히 분리
      - 날짜에 시간이 등록되면 즉시 캘린더에 배지(가능/마감) 표시
   2. _rvmWired 플래그 방식 → render 후 이벤트 바인딩 방식 통일
      (DOM 재생성 후 항상 새로 바인딩, _rvmWired 혼용 제거)
   3. 날짜 범위 input max 고정 버그 수정 → 실제 미래 날짜 입력 가능
   4. selectedDate가 탭 전환 후에도 유지됨
   5. 시간 추가 모달 → 시간(HH:MM) + 정원 직접 입력
   6. 시간 삭제 버튼 추가
========================================================= */

(function () {
  'use strict';

  var root = document.getElementById('rvmAdminRoot');
  if (!root) return;

  /* ── 유틸 ─────────────────────────────────────────── */
  function toast(msg, type) {
    if (typeof window.showToast === 'function') return window.showToast(msg, type || 'default');
    alert(msg);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatISODate(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function parseIso(iso) {
    var p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function todayIso() {
    var n = new Date();
    return formatISODate(new Date(n.getFullYear(), n.getMonth(), n.getDate()));
  }

  /* ── 모달 ─────────────────────────────────────────── */
  var modalBg = document.getElementById('rvmAdminModalBg');
  var modalEl = document.getElementById('rvmAdminModal');

  function openModal(html) {
    if (!modalBg || !modalEl) return;
    modalEl.innerHTML = html;
    modalBg.classList.add('open');
    modalBg.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modalBg) return;
    modalBg.classList.remove('open');
    modalBg.setAttribute('aria-hidden', 'true');
    if (modalEl) modalEl.innerHTML = '';
  }

  if (modalBg) {
    modalBg.onclick = function (e) {
      if (e.target === modalBg) closeModal();
    };
  }

  /* ── 상수 ─────────────────────────────────────────── */
  var STEP_TYPES = [
    { key: 'branch', label: '지점' },
    { key: 'date',   label: '날짜' },
    { key: 'time',   label: '시간' },
    { key: 'item',   label: '항목' },
    { key: 'info',   label: '정보입력' },
  ];

  var FIELD_TYPES = ['text', 'phone', 'email', 'radio', 'checkbox', 'dropdown'];

  /* ── 더미 데이터 ──────────────────────────────────── */
  var demo = (function () {
    var instances = [
      { id: 1, name: '예약관리 1', slug: 'reservation-1', is_active: true, description: '기본 시나리오 — 지점/날짜/시간/정보입력' },
      { id: 2, name: '예약관리 2', slug: 'reservation-2', is_active: true, description: '항목 포함 시나리오 — 지점/날짜/항목/정보입력' },
      { id: 3, name: '예약관리 3', slug: 'reservation-3', is_active: false, description: '미사용 예시' },
    ];

    var regions = [
      { id: 1, name: '서울' },
      { id: 2, name: '경기' },
      { id: 3, name: '부산' },
    ];

    var branches = [
      { id: 101, region_id: 1, name: '강남점',   is_active: true  },
      { id: 102, region_id: 1, name: '홍대점',   is_active: true  },
      { id: 201, region_id: 2, name: '분당점',   is_active: true  },
      { id: 202, region_id: 2, name: '수원점',   is_active: false },
      { id: 301, region_id: 3, name: '해운대점', is_active: true  },
    ];

    // 오늘 기준으로 더미 캘린더 데이터 생성(시간 슬롯이 실제로 들어있는 날짜들)
    function makeCalendarDemo() {
      var cal = {};
      var now = new Date();
      var today = formatISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
      // 오늘 포함 앞으로 5일치 시간 슬롯 미리 넣어둠
      for (var i = 0; i < 5; i++) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        var iso = formatISODate(d);
        cal[iso] = {
          closed: i === 2, // 모레는 마감
          times: [
            { time: '09:00', capacity: 3, booked: i },
            { time: '10:00', capacity: 3, booked: Math.max(0, i - 1) },
            { time: '11:00', capacity: 2, booked: 0 },
            { time: '14:00', capacity: 3, booked: 0 },
            { time: '15:00', capacity: 3, booked: 0 },
          ],
          itemByBranch: {}
        };
      }
      return cal;
    }

    function fieldsCommon() {
      return [
        { id: 1, field_type: 'text',     name_key: 'customer_name',  label: '이름',         is_required: true,  is_active: true,  options: [] },
        { id: 2, field_type: 'phone',    name_key: 'customer_phone', label: '전화번호',     is_required: true,  is_active: true,  options: [] },
        { id: 3, field_type: 'email',    name_key: 'customer_email', label: '이메일',       is_required: false, is_active: true,  options: [] },
        { id: 4, field_type: 'radio',    name_key: 'visit_purpose',  label: '방문 목적',   is_required: false, is_active: true,  options: ['상담', '시연', '기타'] },
        { id: 5, field_type: 'checkbox', name_key: 'agreements',     label: '동의 항목',   is_required: false, is_active: true,  options: ['개인정보 수집', '이벤트 수신'] },
      ];
    }

    function bookingsFor(instanceId) {
      return [
        { id: 9001, no: 'RVM-'+instanceId+'-0001', status: '접수',  at: '2026-03-19 10:20', branch_id: 101, name: '김서준', phone: '010-1234-5678' },
        { id: 9002, no: 'RVM-'+instanceId+'-0002', status: '확인',  at: '2026-03-19 13:00', branch_id: 102, name: '박지연', phone: '010-2222-3333' },
        { id: 9003, no: 'RVM-'+instanceId+'-0003', status: '완료',  at: '2026-03-18 09:40', branch_id: 201, name: '이민호', phone: '010-7777-8888' },
        { id: 9004, no: 'RVM-'+instanceId+'-0004', status: '취소',  at: '2026-03-17 16:10', branch_id: 301, name: '최유나', phone: '010-4444-5555' },
        { id: 9005, no: 'RVM-'+instanceId+'-0005', status: '접수',  at: '2026-03-20 11:10', branch_id: 101, name: '한지민', phone: '010-9090-1010' },
        { id: 9006, no: 'RVM-'+instanceId+'-0006', status: '확인',  at: '2026-03-20 15:30', branch_id: 201, name: '정다은', phone: '010-3030-4040' },
        { id: 9007, no: 'RVM-'+instanceId+'-0007', status: '완료',  at: '2026-03-16 14:00', branch_id: 102, name: '윤도현', phone: '010-5151-6161' },
        { id: 9008, no: 'RVM-'+instanceId+'-0008', status: '접수',  at: '2026-03-15 09:15', branch_id: 201, name: '오서연', phone: '010-7272-8383' },
      ];
    }

    return {
      instances: instances,
      regions: regions,
      branches: branches,
      stepsByInstance: {
        1: [ { step_key: 'branch', sort_order: 10, is_active: true }, { step_key: 'date', sort_order: 20, is_active: true }, { step_key: 'time', sort_order: 30, is_active: true }, { step_key: 'info', sort_order: 40, is_active: true } ],
        2: [ { step_key: 'branch', sort_order: 10, is_active: true }, { step_key: 'date', sort_order: 20, is_active: true }, { step_key: 'item', sort_order: 30, is_active: true }, { step_key: 'info', sort_order: 40, is_active: true } ],
        3: [ { step_key: 'branch', sort_order: 10, is_active: true }, { step_key: 'date', sort_order: 20, is_active: true }, { step_key: 'time', sort_order: 30, is_active: true }, { step_key: 'info', sort_order: 40, is_active: true } ],
      },
      fieldsByInstance:      { 1: fieldsCommon(), 2: fieldsCommon().slice(0, 3), 3: fieldsCommon().slice(0, 2) },
      branchAssignByInstance:{ 1: [101, 102, 201], 2: [201, 301], 3: [101] },
      calendarByInstance:    { 1: makeCalendarDemo(), 2: makeCalendarDemo(), 3: {} },
      notificationByInstance:{ 1: { use_email: true, use_sheet: false, use_alimtalk: true, email_list: 'admin@example.com', sheet_webhook: '', alimtalk_webhook: '' }, 2: { use_email: false, use_sheet: true, use_alimtalk: false, email_list: '', sheet_webhook: 'https://example.com/hook', alimtalk_webhook: '' }, 3: { use_email: false, use_sheet: false, use_alimtalk: false, email_list: '', sheet_webhook: '', alimtalk_webhook: '' } },
      bookingsByInstance:    { 1: bookingsFor(1), 2: bookingsFor(2), 3: bookingsFor(3) },
      lookupByInstance:      { 1: { allow_by_reservation_no: true, allow_by_name_phone: true }, 2: { allow_by_reservation_no: true, allow_by_name_phone: true }, 3: { allow_by_reservation_no: true, allow_by_name_phone: false } },
      itemsByBranchByInstance: {
        1: { 101: [{ id: 5001, name: '스케일링',    is_active: true }, { id: 5002, name: '기본진료', is_active: true }], 102: [{ id: 5003, name: '시연/상담', is_active: true }], 201: [{ id: 5004, name: '검사', is_active: true }] },
        2: { 201: [{ id: 5101, name: '정기점검', is_active: true }], 301: [{ id: 5102, name: '긴급수리', is_active: true }, { id: 5103, name: '기타', is_active: true }] },
        3: { 101: [] },
      },
    };
  })();

  /* ── 상태(State) ──────────────────────────────────── */
  var state = {
    mode: 'list',           // 'list' | 'edit'
    instanceId: 1,
    editTab: 'steps',       // steps | fields | branches | calendar | notification | bookings | lookup
    instances:             demo.instances.map(function(x){ return Object.assign({}, x); }),
    stepsByInstance:       JSON.parse(JSON.stringify(demo.stepsByInstance)),
    fieldsByInstance:      JSON.parse(JSON.stringify(demo.fieldsByInstance)),
    branchAssignByInstance:JSON.parse(JSON.stringify(demo.branchAssignByInstance)),
    calendarByInstance:    JSON.parse(JSON.stringify(demo.calendarByInstance)),
    notificationByInstance:JSON.parse(JSON.stringify(demo.notificationByInstance)),
    bookingsByInstance:    JSON.parse(JSON.stringify(demo.bookingsByInstance)),
    lookupByInstance:      JSON.parse(JSON.stringify(demo.lookupByInstance)),
    itemsByBranchByInstance:JSON.parse(JSON.stringify(demo.itemsByBranchByInstance)),
    regionsMaster:  JSON.parse(JSON.stringify(demo.regions)),
    branchesMaster: JSON.parse(JSON.stringify(demo.branches)),
    nextFieldId: 1000,
    nextStepSeq: 100,
    nextItemId:  5300,
    nextBranchId: 500,
    monthCursor: new Date(),
    selectedDate: null,          // 캘린더 탭에서 선택된 날짜 (탭 전환 후에도 유지)
    calendarBranchId: null,
    branchItemBranchId: null,
    drag: { fromIdx: null },
    bkFilter: {},
  };

  /* ── 셀렉터 헬퍼 ─────────────────────────────────── */
  function getInstance(id)  { return state.instances.find(function(x){ return x.id === id; }); }
  function getSteps(id)     { return state.stepsByInstance[id] || []; }
  function getFields(id)    { return state.fieldsByInstance[id] || []; }
  function getBranchAssign(id)    { return state.branchAssignByInstance[id] || []; }
  function getCalendar(id)        { return state.calendarByInstance[id] || (state.calendarByInstance[id] = {}); }
  function getNotification(id)    { return state.notificationByInstance[id] || {}; }
  function getBookings(id)        { return state.bookingsByInstance[id] || []; }
  function getLookup(id)          { return state.lookupByInstance[id] || {}; }
  function getItemsByBranch(instId, branchId) { var m = state.itemsByBranchByInstance[instId] || {}; return m[branchId] || []; }
  function setItemsByBranch(instId, branchId, items) { if (!state.itemsByBranchByInstance[instId]) state.itemsByBranchByInstance[instId] = {}; state.itemsByBranchByInstance[instId][branchId] = items; }
  function branchById(id)  { return (state.branchesMaster || []).find(function(b){ return b.id === id; }); }
  function regionById(id)  { return (state.regionsMaster  || []).find(function(r){ return r.id === id; }); }
  function stepLabel(k)    { var t = STEP_TYPES.find(function(x){ return x.key === k; }); return t ? t.label : k; }

  /* ── 더미 예약 필드값 ────────────────────────────── */
  function dummyFieldValue(bk, field) {
    var seed = (parseInt(bk.id, 10) || 0) + String(field.name_key || '').length * 17;
    var opts = Array.isArray(field.options) ? field.options : [];
    if (field.field_type === 'text')     return field.label + ' ' + (seed % 90 + 10);
    if (field.field_type === 'phone')    return '010-' + (1000 + seed % 9000) + '-' + (1000 + (seed * 7) % 9000);
    if (field.field_type === 'email')    return 'user' + (seed % 1000) + '@example.com';
    if (field.field_type === 'radio')    return opts.length ? opts[seed % opts.length] : '-';
    if (field.field_type === 'dropdown') return opts.length ? opts[(seed+3) % opts.length] : '-';
    if (field.field_type === 'checkbox') { if (!opts.length) return '-'; var a = opts[seed % opts.length]; var b = opts[(seed+1) % opts.length]; return a === b ? a : a + ', ' + b; }
    return '-';
  }

  /* ── 모드 전환 ───────────────────────────────────── */
  function setModeList() {
    state.mode = 'list';
    state.editTab = 'steps';
    render();
  }

  function safeOptions(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { var p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch(e){ return []; }
  }

  function loadInstanceData(id, cb) {
    var api = window.RvmApi;
    if (!api) { if (cb) cb(); return; }
    Promise.all([
      api.stepList(id),
      api.fieldList(id),
      api.instanceBranchList(id)
    ]).then(function(res) {
      state.stepsByInstance[id]        = (res[0].steps  || []).map(function(s){ return Object.assign({}, s, { is_active: !!parseInt(s.is_active,10), sort_order: parseInt(s.sort_order,10)||0 }); });
      state.fieldsByInstance[id]       = (res[1].fields || []).map(function(f){ return Object.assign({}, f, { is_active: !!parseInt(f.is_active,10), is_required: !!parseInt(f.is_required,10), options: safeOptions(f.options) }); });
      var assigned = (res[2].branches || []).map(function(b){ return parseInt(b.id||b.branch_id,10); });
      state.branchAssignByInstance[id] = assigned;
      if (cb) cb();
    }).catch(function(e) { console.error('loadInstanceData error', e); if (cb) cb(); });
  }

  function setModeEdit(instanceId) {
    state.mode = 'edit';
    state.instanceId = instanceId;
    state.editTab = 'steps';
    var td = todayIso();
    if (!state.selectedDate || state.selectedDate < td) state.selectedDate = td;
    root.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text3)">불러오는 중…</div>';
    loadInstanceData(instanceId, function() {
      var assigns = getBranchAssign(instanceId);
      state.calendarBranchId   = assigns[0] || null;
      state.branchItemBranchId = assigns[0] || null;
      render();
    });
  }

  function createNewInstance() {
    var api = window.RvmApi;
    var name = '예약관리 ' + (state.instances.length + 1);
    var slug = 'reservation-' + Date.now();
    if (!api) {
      var newId = Math.max.apply(null, state.instances.map(function(x){ return x.id; }).concat([0])) + 1;
      state.instances.unshift({ id: newId, name: name, slug: slug, is_active: true, description: '' });
      state.stepsByInstance[newId] = [];
      state.fieldsByInstance[newId] = [];
      state.branchAssignByInstance[newId] = [];
      state.instanceId = newId; state.mode = 'edit'; state.editTab = 'steps';
      toast('새 예약 테이블 생성됨', 'success'); render(); return;
    }
    api.instanceSave({ id: 0, name: name, slug: slug, is_active: true, sort_order: 0 }).then(function(res) {
      toast('새 예약 테이블 생성됨', 'success');
      loadAll(function() { setModeEdit(res.id); });
    }).catch(function(e) { toast(e.message || '생성 실패', 'error'); });
  }

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  function render() {
    var instance = getInstance(state.instanceId);
    var html = '';

    if (state.mode === 'list') {
      html = renderInstanceList();
    } else {
      // 탭 목록
      var tabs = [
        { id: 'steps',        label: '단계 구성' },
        { id: 'fields',       label: '정보입력 필드' },
        { id: 'branches',     label: '지점 관리' },
        { id: 'calendar',     label: '날짜/시간 설정' },
        { id: 'notification', label: '알림 설정' },
        { id: 'bookings',     label: '예약 접수 리스트' },
        { id: 'lookup',       label: '예약 조회 설정' },
      ];
      var tabsHtml = '<div class="rvmAdmin-tabs" role="tablist">' +
        tabs.map(function(t) {
          return '<button type="button" class="rvmAdmin-tab ' + (state.editTab === t.id ? 'on' : '') + '" data-tab="' + esc(t.id) + '">' + esc(t.label) + '</button>';
        }).join('') + '</div>';

      html = renderInstanceEdit(instance) + tabsHtml + renderEditTab(instance);
    }

    root.innerHTML = html;
    wireUi();
  }

  /* ─── 목록 ───────────────────────────────────────── */
  function renderInstanceList() {
    var rows = state.instances.map(function(ins) {
      return '<tr>' +
        '<td style="font-weight:900">' + esc(ins.name) + '</td>' +
        '<td><span class="rvmAdmin-pill ' + (ins.is_active ? 'ok' : 'bad') + '">' + (ins.is_active ? '사용' : '미사용') + '</span></td>' +
        '<td style="width:220px"><div class="rvmAdmin-btn-row">' +
        '<button type="button" class="btn btn-sm btn-outline" data-action="edit" data-inst="' + esc(ins.id) + '">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-action="del" data-inst="' + esc(ins.id) + '">삭제</button>' +
        '</div></td>' + '</tr>';
    }).join('') || '<tr><td colspan="3" style="color:var(--text3);padding:18px 8px">예약 테이블이 없습니다.</td></tr>';

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>예약 테이블 목록</h3><p>예약 테이블 단위로 단계/필드/지점/날짜를 독립 설정합니다.</p></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t">' +
      '<thead><tr><th>예약명</th><th>상태</th><th>관리</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div></div></div>';
  }

  /* ─── 편집 헤더(기본정보) ────────────────────────── */
  function renderInstanceEdit(instance) {
    instance = instance || getInstance(state.instanceId);
    var title  = instance ? instance.name : '';
    var desc   = instance ? (instance.description || '') : '';
    var active = instance ? !!instance.is_active : true;

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 테이블 설정</h3><p>기본 정보 편집 후 하단 탭에서 단계/필드/날짜 등을 설정하세요.</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-ghost" data-action="back">← 목록</button>' +
      '<button type="button" class="btn btn-outline" data-action="dummy-save">저장</button>' +
      '</div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-6"><div class="rvmAdmin-form-row"><label>예약명</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvm-edit-name" value="' + esc(title) + '"/></div></div>' +
      '<div class="rvmAdmin-col-6"><div class="rvmAdmin-form-row"><label>사용 여부</label>' +
      '<label class="rvmAdmin-switch"><input type="checkbox" id="rvm-edit-active" ' + (active ? 'checked' : '') + '/>' +
      '<span style="font-weight:900">' + (active ? '사용' : '미사용') + '</span></label></div></div>' +
      '<div class="rvmAdmin-col-12"><div class="rvmAdmin-form-row" style="align-items:flex-start"><label style="padding-top:10px">설명</label>' +
      '<textarea class="rvmAdmin-textarea" id="rvm-edit-desc">' + esc(desc) + '</textarea></div></div>' +
      '</div></div></div></div>';
  }

  function renderEditTab(instance) {
    if (state.editTab === 'steps')        return renderStepsTab();
    if (state.editTab === 'fields')       return renderFieldsTab();
    if (state.editTab === 'branches')     return renderBranchesTab();
    if (state.editTab === 'calendar')     return renderCalendarTab();
    if (state.editTab === 'notification') return renderNotificationTab();
    if (state.editTab === 'bookings')     return renderBookingsTab();
    if (state.editTab === 'lookup')       return renderLookupTab();
    return '';
  }

  /* ─── 단계 구성 탭 ──────────────────────────────── */
  function renderStepsTab() {
    var steps = getSteps(state.instanceId).slice().sort(function(a,b){ return a.sort_order - b.sort_order; });
    var listHtml = steps.map(function(step, idx) {
      var isOn = !!step.is_active;
      return '<li class="rvmAdmin-step-item" draggable="true" data-step-idx="' + idx + '">' +
        '<div class="rvmAdmin-step-left">' +
        '<div class="grab">⠿</div>' +
        '<div style="min-width:0;flex:1">' +
        '<div class="title">' + esc(stepLabel(step.step_key)) + '</div>' +
        '<div class="sub">key: ' + esc(step.step_key) + ' · 순서: ' + esc(step.sort_order) + '</div>' +
        '</div>' +
        '<div class="rvmAdmin-pill ' + (isOn ? 'ok' : 'bad') + '">' + (isOn ? '활성' : '비활성') + '</div>' +
        '</div>' +
        '<div class="rvmAdmin-btn-row">' +
        '<label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmStepActive" data-idx="' + idx + '"' + (isOn ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">활성</span></label>' +
        '<button type="button" class="btn btn-sm btn-outline rvmStepUp" data-idx="' + idx + '">↑</button>' +
        '<button type="button" class="btn btn-sm btn-outline rvmStepDown" data-idx="' + idx + '">↓</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmStepDel" data-idx="' + idx + '">삭제</button>' +
        '</div></li>';
    }).join('');

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>단계 구성</h3><p>예약 흐름 단계를 추가/삭제/순서 변경합니다. 드래그 또는 ↑↓ 버튼으로 순서를 조정하세요.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary" data-action="step-add">+ 단계 추가</button></div></div>' +
      '<div class="rvmAdmin-card__body"><ul class="rvmAdmin-steps-ul" id="rvmStepsUl">' + (listHtml || '<li style="color:var(--text3);padding:14px 0">단계가 없습니다.</li>') + '</ul></div>' +
      '</div></div>';
  }

  /* ─── 정보입력 필드 탭 ──────────────────────────── */
  function renderFieldsTab() {
    var fields = getFields(state.instanceId);
    var rows = fields.map(function(f) {
      var opts = Array.isArray(f.options) ? f.options : [];
      var optSummary = (f.field_type === 'radio' || f.field_type === 'checkbox' || f.field_type === 'dropdown') ? (opts.length ? opts.length + '개 옵션' : '옵션 없음') : '-';
      return '<tr>' +
        '<td style="min-width:100px">' + esc(f.field_type) + '</td>' +
        '<td style="min-width:140px">' + esc(f.name_key) + '</td>' +
        '<td style="min-width:180px">' + esc(f.label) + '<br><span style="color:var(--text3);font-size:.82rem">옵션: ' + esc(optSummary) + '</span></td>' +
        '<td><span class="rvmAdmin-pill ' + (f.is_required ? 'ok' : '') + '">' + (f.is_required ? '필수' : '선택') + '</span></td>' +
        '<td><span class="rvmAdmin-pill ' + (f.is_active ? 'ok' : 'bad') + '">' + (f.is_active ? '활성' : '비활성') + '</span></td>' +
        '<td style="width:180px"><div class="rvmAdmin-btn-row">' +
        '<button type="button" class="btn btn-sm btn-outline rvmFieldEdit" data-id="' + esc(f.id) + '">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmFieldDel" data-id="' + esc(f.id) + '">삭제</button>' +
        '</div></td></tr>';
    }).join('');

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>정보입력 필드 관리</h3><p>예약자 입력 항목(이름/전화/이메일/라디오/체크박스/드롭다운)을 구성합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary" data-action="field-add">+ 필드 추가</button></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:900px">' +
      '<thead><tr><th>타입</th><th>키(name_key)</th><th>라벨/옵션</th><th>필수</th><th>활성</th><th>관리</th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="6" style="color:var(--text3);padding:18px 8px">필드가 없습니다.</td></tr>') + '</tbody>' +
      '</table></div></div></div></div>';
  }

  /* ─── 지점 관리 탭 ──────────────────────────────── */
  function renderBranchesTab() {
    var assigned = getBranchAssign(state.instanceId);
    var assignedSet = {};
    assigned.forEach(function(id){ assignedSet[id] = true; });

    // ① 지점 목록 + 연결 체크를 한 테이블에 통합 (지역별 그룹 제거 → 단순 평면 테이블)
    var masterRows = (state.branchesMaster || []).slice()
      .sort(function(a,b){ return a.region_id !== b.region_id ? a.region_id - b.region_id : a.id - b.id; })
      .map(function(b) {
        var rName = regionById(b.region_id) ? regionById(b.region_id).name : '-';
        var isConn = !!assignedSet[b.id];
        return '<tr>' +
          '<td style="color:var(--text3);font-size:.85rem">' + esc(rName) + '</td>' +
          '<td style="font-weight:900">' + esc(b.name) + '</td>' +
          '<td>' +
          '<label class="rvmAdmin-switch" style="gap:8px">' +
          '<input type="checkbox" class="rvmBranchActive" data-branch="' + esc(b.id) + '"' + (b.is_active ? ' checked' : '') + '/>' +
          '<span style="font-weight:800;color:var(--text2)">' + (b.is_active ? '사용' : '미사용') + '</span>' +
          '</label>' +
          '</td>' +
          '<td>' +
          '<label class="rvmAdmin-switch" style="gap:8px">' +
          '<input type="checkbox" class="rvmBranchConn" data-branch="' + esc(b.id) + '"' + (isConn ? ' checked' : '') + '/>' +
          '<span style="font-weight:800;color:var(--text2)">' + (isConn ? '이 테이블에 연결됨' : '미연결') + '</span>' +
          '</label>' +
          '</td>' +
          '<td style="width:160px"><div class="rvmAdmin-btn-row">' +
          '<button type="button" class="btn btn-sm btn-outline rvmBranchMasterEdit" data-id="' + esc(b.id) + '">수정</button>' +
          '<button type="button" class="btn btn-sm btn-danger rvmBranchMasterDel" data-id="' + esc(b.id) + '">삭제</button>' +
          '</div></td>' +
          '</tr>';
      }).join('');

    // ② 지점별 항목 관리 (단계에 item 이 있을 때만 의미있음)
    var steps = getSteps(state.instanceId);
    var hasItemStep = steps.some(function(s){ return s.is_active && s.step_key === 'item'; });

    var selectedBranch = state.branchItemBranchId;
    if (!selectedBranch || assigned.indexOf(selectedBranch) < 0) selectedBranch = assigned[0] || null;
    var brOpts = assigned.map(function(bid) {
      var br = branchById(bid);
      return br ? '<option value="' + esc(bid) + '"' + (String(bid) === String(selectedBranch) ? ' selected' : '') + '>' + esc(br.name) + '</option>' : '';
    }).join('');
    var items = selectedBranch ? getItemsByBranch(state.instanceId, selectedBranch) : [];
    var itemRows = items.map(function(it) {
      return '<tr>' +
        '<td style="font-weight:900">' + esc(it.name) + '</td>' +
        '<td><span class="rvmAdmin-pill ' + (it.is_active ? 'ok' : 'bad') + '">' + (it.is_active ? '사용' : '미사용') + '</span></td>' +
        '<td style="width:100px"><button type="button" class="btn btn-sm btn-danger rvmBranchItemDel" data-id="' + esc(it.id) + '">삭제</button></td>' +
        '</tr>';
    }).join('');

    var itemSectionHtml = hasItemStep
      ? '<div class="rvmAdmin-card" style="margin-top:10px">' +
        '<div class="rvmAdmin-card__head">' +
        '<div><h3>지점별 항목</h3><p>단계에 "항목"이 있을 때 지점별 예약 항목을 설정합니다.</p></div>' +
        '</div>' +
        '<div class="rvmAdmin-card__body">' +
        '<div style="display:flex;gap:10px;align-items:flex-end;margin-bottom:12px">' +
        '<div style="flex:1"><label style="font-weight:900;color:var(--text2);font-size:.86rem;display:block;margin-bottom:6px">지점 선택</label>' +
        '<select class="rvmAdmin-select" id="rvmBranchItemSel">' + (brOpts || '<option value="">연결된 지점 없음</option>') + '</select></div>' +
        '<button type="button" class="btn btn-primary" id="rvmBranchItemAdd"' + (!selectedBranch ? ' disabled' : '') + '>+ 항목 추가</button>' +
        '</div>' +
        '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:480px"><thead><tr><th>항목명</th><th>사용</th><th></th></tr></thead>' +
        '<tbody>' + (itemRows || '<tr><td colspan="3" style="color:var(--text3);padding:14px 8px">"+ 항목 추가" 버튼으로 항목을 만드세요.</td></tr>') + '</tbody></table></div>' +
        '</div></div>'
      : '<div style="margin-top:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:#f8fafc;color:var(--text3);font-size:.86rem;font-weight:800">' +
        '단계 구성에서 "항목" 단계를 활성화하면 지점별 항목 설정이 여기에 표시됩니다.' +
        '</div>';

    // ③ 지역 마스터 관리
    var regionRows = (state.regionsMaster || []).map(function(r) {
      var branchCount = (state.branchesMaster || []).filter(function(b){ return b.region_id === r.id; }).length;
      return '<tr>' +
        '<td style="font-weight:900">' + esc(r.name) + '</td>' +
        '<td style="color:var(--text3)">' + branchCount + '개 지점</td>' +
        '<td style="width:160px"><div class="rvmAdmin-btn-row">' +
        '<button type="button" class="btn btn-sm btn-outline rvmRegionEdit" data-id="' + esc(r.id) + '">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmRegionDel" data-id="' + esc(r.id) + '"' + (branchCount > 0 ? ' disabled title="소속 지점이 있어 삭제할 수 없습니다"' : '') + '>삭제</button>' +
        '</div></td>' +
        '</tr>';
    }).join('');

    return '<div class="rvmAdmin__section">' +

      // ① 지역 관리
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>지역 관리</h3><p>지점을 묶는 지역(시/도 단위 등)을 먼저 설정하세요. 지역이 있어야 지점을 추가할 수 있습니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary" id="rvmRegionAdd">+ 지역 추가</button></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:400px">' +
      '<thead><tr><th>지역명</th><th>소속 지점 수</th><th>관리</th></tr></thead>' +
      '<tbody>' + (regionRows || '<tr><td colspan="3" style="color:var(--text3);padding:18px 8px">지역이 없습니다. "+ 지역 추가"로 먼저 만드세요.</td></tr>') + '</tbody>' +
      '</table></div>' +
      '</div></div>' +

      // ② 지점 관리
      '<div class="rvmAdmin-card" style="margin-top:10px">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>지점 관리</h3><p>지점 추가/수정/삭제, 사용 여부, 이 예약 테이블에 연결할 지점을 체크하세요.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary" id="rvmBranchMasterAdd"' + (!(state.regionsMaster && state.regionsMaster.length) ? ' disabled title="지역을 먼저 추가하세요"' : '') + '>+ 지점 추가</button></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:680px">' +
      '<thead><tr><th>지역</th><th>지점명</th><th>사용 여부</th><th>테이블 연결</th><th>관리</th></tr></thead>' +
      '<tbody>' + (masterRows || '<tr><td colspan="5" style="color:var(--text3);padding:18px 8px">지점이 없습니다. "+ 지점 추가"로 만드세요.</td></tr>') + '</tbody>' +
      '</table></div>' +
      '</div></div>' +

      itemSectionHtml +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════
     ★ 캘린더 탭 — 핵심 재설계 부분 ★
     
     플로우:
       1. 캘린더에서 날짜 클릭
       2. 우측 패널 → 해당 날짜에 등록된 시간 슬롯 목록
       3. "시간 추가" 버튼 → 모달에서 시간(HH:MM) + 정원 입력
       4. 저장 → 캘린더 해당 날짜 셀에 "가능/마감" 배지 즉시 표시
       5. 시간별 정원 수정 → 인풋에서 바로 수정
       6. 시간 삭제 → 삭제 버튼으로 개별 제거
       7. 날짜 마감/해제 → 우측 상단 토글
       8. 일괄 설정 → 날짜 범위 + 시간 목록으로 한번에 적용
  ═══════════════════════════════════════════════════ */
  function renderCalendarTab() {
    var instId  = state.instanceId;
    var calMap  = getCalendar(instId);

    var assigned = getBranchAssign(instId);
    if (!state.calendarBranchId || assigned.indexOf(state.calendarBranchId) < 0) {
      state.calendarBranchId = assigned[0] || null;
    }
    var selBranchId = state.calendarBranchId;

    var steps = getSteps(instId).slice().sort(function(a,b){ return a.sort_order - b.sort_order; });
    var hasItem = steps.some(function(s){ return s.is_active && s.step_key === 'item'; });
    var anchorMode = hasItem ? 'item' : 'time';

    var cur = state.monthCursor instanceof Date ? state.monthCursor : new Date();
    var year = cur.getFullYear();
    var mon  = cur.getMonth();
    var now  = new Date();
    var td   = todayIso();
    var dayCount = new Date(year, mon + 1, 0).getDate();
    var leading  = new Date(year, mon, 1).getDay();
    var prevDisabled = (year < now.getFullYear() || (year === now.getFullYear() && mon <= now.getMonth()));
    var monthTitle = year + '년 ' + (mon + 1) + '월';

    var monthStart = formatISODate(new Date(year, mon, 1));
    var monthEnd   = formatISODate(new Date(year, mon + 1, 0));
    var selIso = state.selectedDate;
    if (!selIso || selIso < monthStart || selIso > monthEnd) {
      selIso = (td >= monthStart && td <= monthEnd) ? td : monthStart;
    }
    if (selIso < td) selIso = td;
    state.selectedDate = selIso;

    // ─ 달력 그리드
    var DOW = ['일','월','화','수','목','금','토'];
    var dowHtml = '<div class="rvmAdmin-dow">' +
      DOW.map(function(x,i){
        var col = i===0?'color:#c0392b':i===6?'color:#2563eb':'';
        return '<span' + (col?' style="'+col+'"':'') + '>' + esc(x) + '</span>';
      }).join('') + '</div>';

    var totalCells = Math.ceil((leading + dayCount) / 7) * 7;
    var cellsHtml = '';
    for (var ci = 0; ci < totalCells; ci++) {
      var dayNum = ci - leading + 1;
      if (dayNum < 1 || dayNum > dayCount) { cellsHtml += '<div class="rvmAdmin-cal-empty"></div>'; continue; }
      var iso  = formatISODate(new Date(year, mon, dayNum));
      var data = calMap[iso];
      var hasTimes = !!(data && data.times && data.times.length > 0);
      var isClosed = hasTimes && !!data.closed;
      var isPast   = iso < td;
      var isOn     = selIso === iso;
      var dow      = (leading + dayNum - 1) % 7;
      var numCol   = dow===0?'#c0392b':dow===6?'#2563eb':'';
      var badge = hasTimes
        ? (isClosed ? '<span class="rvmAdmin-cal-badge closed">마감</span>' : '<span class="rvmAdmin-cal-badge open">가능</span>')
        : '';
      var cls = 'rvmAdmin-cal-day' + (isOn?' on':'') + (isPast?' past':'') + (isClosed?' closed':'');
      cellsHtml += '<button type="button" class="' + cls + '" data-iso="' + esc(iso) + '"' + (isPast?' disabled':'') + '>' +
        '<span class="rvm-cal-num"' + (numCol?' style="color:'+numCol+'"':'') + '>' + dayNum + '</span>' +
        badge + '</button>';
    }

    // ─ 지점 셀렉트 (복수 지점일 때만)
    var branchOpts = assigned.map(function(bid){
      var br = branchById(bid);
      return br ? '<option value="'+esc(bid)+'"'+(String(bid)===String(selBranchId)?' selected':'')+'>'+esc(br.name)+'</option>' : '';
    }).join('');

    // ─ 선택 날짜 데이터
    var selData  = calMap[selIso] || { closed: false, times: [], itemByBranch: {} };
    var isPastSel = selIso < td;
    var hasTimes  = !!(selData.times && selData.times.length > 0);
    var isClosed  = !!selData.closed;

    // ─ 시간/항목 행
    var timeRows = '';
    if (anchorMode === 'time') {
      if (hasTimes) {
        timeRows = (selData.times || []).map(function(t) {
          var booked   = parseInt(t.booked,   10) || 0;
          var capacity = parseInt(t.capacity, 10) || 0;
          var rem = Math.max(0, capacity - booked);
          return '<tr>' +
            '<td style="font-weight:900;width:90px">' + esc(t.time) + '</td>' +
            '<td style="width:110px;color:var(--text3)">' + esc(booked) + ' / ' + esc(capacity) + '</td>' +
            '<td style="width:160px"><input type="number" class="rvmTimeCap" data-time="' + esc(t.time) + '" value="' + esc(capacity) + '" min="' + esc(booked) + '"' + (isPastSel||isClosed?' disabled':'') + ' style="width:86px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-size:.9rem"/></td>' +
            '<td style="width:90px"><span class="rvmAdmin-pill ' + (rem>0?'ok':'bad') + '">잔여 ' + esc(rem) + '</span></td>' +
            '<td style="width:70px">' + (!isPastSel?'<button type="button" class="btn btn-sm btn-danger rvmTimeDel" data-time="'+esc(t.time)+'">삭제</button>':'') + '</td></tr>';
        }).join('');
      } else {
        timeRows = '<tr><td colspan="5" style="color:var(--text3);padding:20px 8px">' +
          (isPastSel ? '과거 날짜입니다.' : '"+ 시간 추가" 버튼으로 이 날짜에 시간 슬롯을 등록하세요.') + '</td></tr>';
      }
    } else {
      var items = getItemsByBranch(instId, selBranchId) || [];
      if (!selData.itemByBranch) selData.itemByBranch = {};
      if (!selData.itemByBranch[selBranchId]) selData.itemByBranch[selBranchId] = { capacityByItemId:{}, bookedByItemId:{} };
      var capMap = selData.itemByBranch[selBranchId].capacityByItemId || {};
      var bkMap  = selData.itemByBranch[selBranchId].bookedByItemId  || {};
      if (items.length) {
        timeRows = items.map(function(it) {
          var cap    = capMap[it.id]!=null ? parseInt(capMap[it.id],10) : 3;
          var booked = bkMap[it.id] !=null ? parseInt(bkMap[it.id], 10) : 0;
          var rem    = Math.max(0, cap - booked);
          return '<tr>' +
            '<td style="font-weight:900">' + esc(it.name) + '</td>' +
            '<td style="width:110px;color:var(--text3)">' + esc(booked) + ' / ' + esc(cap) + '</td>' +
            '<td style="width:160px"><input type="number" class="rvmItemCap" data-item-id="'+esc(it.id)+'" value="'+esc(cap)+'" min="'+esc(booked)+'"'+(isPastSel||isClosed?' disabled':'')+' style="width:86px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-size:.9rem"/></td>' +
            '<td style="width:90px"><span class="rvmAdmin-pill ' + (rem>0?'ok':'bad') + '">잔여 ' + esc(rem) + '</span></td>' +
            '<td style="width:70px"></td></tr>';
        }).join('');
      } else {
        timeRows = '<tr><td colspan="5" style="color:var(--text3);padding:20px 8px">지점 관리 탭에서 항목을 먼저 추가하세요.</td></tr>';
      }
    }

    // ─ 일괄 설정 (details 태그로 접힘/펼침)
    var maxDate = formatISODate(new Date(now.getFullYear()+1, now.getMonth(), now.getDate()));
    var defaultTo = formatISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate()+6));
    var bulkHtml = '';
    if (anchorMode === 'time') {
      bulkHtml =
        '<details class="rvmAdmin-bulk-details">' +
        '<summary class="rvmAdmin-bulk-summary">📅 날짜 범위 일괄 설정 (펼치기)</summary>' +
        '<div class="rvmAdmin-bulk-body">' +
        '<p style="color:var(--text3);font-size:.84rem;margin-bottom:12px">날짜 범위에 동일한 시간/정원을 한번에 적용합니다. 이미 있는 슬롯은 정원만 업데이트됩니다.</p>' +
        '<div class="rvmAdmin-bulk-row">' +
        '<div class="rvmAdmin-bulk-field"><label>시작일</label><input class="rvmAdmin-input" type="date" id="rvmBulkFrom" min="'+esc(td)+'" max="'+esc(maxDate)+'" value="'+esc(td)+'"/></div>' +
        '<div class="rvmAdmin-bulk-field"><label>종료일</label><input class="rvmAdmin-input" type="date" id="rvmBulkTo" min="'+esc(td)+'" max="'+esc(maxDate)+'" value="'+esc(defaultTo)+'"/></div>' +
        '<div class="rvmAdmin-bulk-field"><label>시간 (쉼표 구분)</label><input class="rvmAdmin-input" type="text" id="rvmBulkTimes" placeholder="09:00, 10:00, 14:00" value="09:00, 10:00, 11:00"/></div>' +
        '<div class="rvmAdmin-bulk-field"><label>슬롯당 정원</label><input class="rvmAdmin-input" type="number" id="rvmBulkCap" value="3" min="1" style="max-width:90px"/></div>' +
        '<div class="rvmAdmin-bulk-field" style="align-self:flex-end"><button type="button" class="btn btn-primary" id="rvmBulkApply">적용</button></div>' +
        '</div></div></details>';
    }

    // ─ 선택 날짜 레이블
    var selDateLabel = (function(){
      var d = parseIso(selIso);
      return selIso + ' (' + ['일','월','화','수','목','금','토'][d.getDay()] + ')';
    })();

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>날짜 / 시간 설정</h3><p>날짜 클릭 → 하단 패널에서 시간 추가/수정 → 캘린더 배지(가능·마감) 확인</p></div>' +
      (assigned.length > 1 ? '<div><select class="rvmAdmin-select" id="rvmCalBranchSel" style="min-width:120px">' + branchOpts + '</select></div>' : '') +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      bulkHtml +

      // ── 달력 풀 너비
      '<div class="rvmAdmin-cal-wrap">' +
      '<div class="rvmAdmin-month-nav">' +
      '<button type="button" class="btn btn-sm btn-outline" data-action="cal-prev"' + (prevDisabled?' disabled':'') + '>◀</button>' +
      '<span class="rvmAdmin-month-title">' + esc(monthTitle) + '</span>' +
      '<button type="button" class="btn btn-sm btn-outline" data-action="cal-next">▶</button>' +
      '</div>' +
      dowHtml +
      '<div class="rvmAdmin-cal-grid">' + cellsHtml + '</div>' +
      '</div>' +

      // ── 선택 날짜 패널 (달력 바로 아래)
      '<div class="rvmAdmin-time-panel">' +
      '<div class="rvmAdmin-time-panel__head">' +
      '<div style="font-weight:900;font-size:.95rem">' + esc(selDateLabel) +
      '<span style="color:var(--text3);font-size:.82rem;font-weight:800;margin-left:8px">' + (anchorMode==='item'?'항목별 정원':'시간대별 슬롯') + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:8px;align-items:center">' +
      (anchorMode==='time'&&!isPastSel ? '<button type="button" class="btn btn-sm btn-primary" id="rvmCalAddTime">+ 시간 추가</button>' : '') +
      '<label class="rvmAdmin-switch" style="gap:6px">' +
      '<input type="checkbox" class="rvmDateClosed"' + (isClosed?' checked':'') + (isPastSel||!hasTimes?' disabled':'') + '/>' +
      '<span style="font-weight:900;font-size:.88rem;color:' + (isClosed?'#c0392b':'var(--text2)') + '">' + (hasTimes?(isClosed?'마감':'예약가능'):'미설정') + '</span>' +
      '</label>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:440px">' +
      '<thead><tr><th>' + (anchorMode==='item'?'항목':'시간') + '</th><th>예약/정원</th><th>정원 수정</th><th>잔여</th><th></th></tr></thead>' +
      '<tbody>' + timeRows + '</tbody>' +
      '</table></div>' +
      '</div>' + // time-panel

      '</div></div></div>';
  }


  /* ─── 알림 설정 탭 ──────────────────────────────── */
  function renderNotificationTab() {
    var n = getNotification(state.instanceId);
    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>알림 설정</h3><p>예약 접수 시 관리자에게 발송할 알림 방식을 설정합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-outline" data-action="dummy-save">저장</button></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-12"><div style="display:flex;gap:18px;flex-wrap:wrap">' +
      '<label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmNotiUse" data-key="use_email"' + (n.use_email ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">이메일</span></label>' +
      '<label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmNotiUse" data-key="use_sheet"' + (n.use_sheet ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">구글 스프레드시트</span></label>' +
      '<label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmNotiUse" data-key="use_alimtalk"' + (n.use_alimtalk ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">알림톡</span></label>' +
      '</div></div>' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px;margin-top:8px">이메일 주소 (쉼표로 구분)</label>' +
      '<textarea class="rvmAdmin-textarea" id="rvmNotiEmails"' + (!n.use_email ? ' disabled' : '') + ' style="min-height:80px">' + esc(n.email_list || '') + '</textarea></div>' +
      '<div class="rvmAdmin-col-6"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">구글 스프레드시트 웹훅</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmNotiSheet" placeholder="https://..." ' + (!n.use_sheet ? 'disabled' : '') + ' value="' + esc(n.sheet_webhook || '') + '"/></div>' +
      '<div class="rvmAdmin-col-6"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">알림톡 웹훅</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmNotiAlim" placeholder="https://..." ' + (!n.use_alimtalk ? 'disabled' : '') + ' value="' + esc(n.alimtalk_webhook || '') + '"/></div>' +
      '</div></div></div></div>';
  }

  /* ─── 예약 접수 리스트 탭 ───────────────────────── */
  function renderBookingsTab() {
    var bookings     = getBookings(state.instanceId);
    var activeFields = getFields(state.instanceId).filter(function(f){ return !!f.is_active; });
    var td = todayIso();

    // 저장된 필터 값 복원 (탭 전환 후에도 유지)
    var fq      = state.bkFilter ? (state.bkFilter.q      || '') : '';
    var fst     = state.bkFilter ? (state.bkFilter.status || '') : '';
    var fbr     = state.bkFilter ? (state.bkFilter.branch || '0') : '0';
    var fDateFrom = state.bkFilter ? (state.bkFilter.dateFrom || '') : '';
    var fDateTo   = state.bkFilter ? (state.bkFilter.dateTo   || '') : '';

    var rows = bookings.map(function(bk) {
      var statusOpts = ['접수','확인','완료','취소'].map(function(st){
        return '<option value="' + esc(st) + '"' + (st === bk.status ? ' selected' : '') + '>' + esc(st) + '</option>';
      }).join('');
      var fieldTds = activeFields.map(function(f){ return '<td style="min-width:140px">' + esc(dummyFieldValue(bk, f)) + '</td>'; }).join('');
      var pillCls = bk.status === '완료' ? 'ok' : bk.status === '취소' ? 'bad' : bk.status === '확인' ? 'warn' : '';
      return '<tr>' +
        '<td style="font-weight:900;white-space:nowrap">' + esc(bk.no) + '</td>' +
        '<td><span class="rvmAdmin-pill ' + pillCls + '">' + esc(bk.status) + '</span></td>' +
        '<td style="min-width:120px"><select class="rvmAdmin-select rvmBkStatusSel" data-bid="' + esc(bk.id) + '">' + statusOpts + '</select></td>' +
        '<td style="white-space:nowrap">' + esc(bk.at) + '</td>' +
        '<td>' + esc((branchById(bk.branch_id) || {}).name || '-') + '</td>' +
        fieldTds +
        '<td><div class="rvmAdmin-actions">' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkStatusSet" data-bid="' + esc(bk.id) + '">변경</button>' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkDetail" data-bid="' + esc(bk.id) + '">상세</button>' +
        '</div></td></tr>';
    }).join('');

    var branchOpts = '<option value="0">전체</option>' +
      (state.branchesMaster || []).map(function(b){ return '<option value="' + esc(b.id) + '"' + (String(b.id) === String(fbr) ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('');

    var statusOpts = '<option value="">전체</option>' +
      ['접수','확인','완료','취소'].map(function(st){ return '<option value="' + esc(st) + '"' + (st === fst ? ' selected' : '') + '>' + esc(st) + '</option>'; }).join('');

    var colCount = 6 + activeFields.length;

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 접수 리스트</h3><p>날짜·상태·지점·키워드로 필터링하고 상태를 변경합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-success" data-action="bk-export">📥 엑셀 다운로드</button></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +

      // ── 검색 필터 행
      '<div class="rvmAdmin-bk-filters">' +

      // 날짜 범위
      '<div class="rvmAdmin-bk-filter-group">' +
      '<label>날짜</label>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      '<input class="rvmAdmin-input" type="date" id="rvmBkDateFrom" value="' + esc(fDateFrom) + '" style="min-width:0;flex:1"/>' +
      '<span style="color:var(--text3);font-weight:900;white-space:nowrap">~</span>' +
      '<input class="rvmAdmin-input" type="date" id="rvmBkDateTo" value="' + esc(fDateTo) + '" style="min-width:0;flex:1"/>' +
      '</div>' +
      '</div>' +

      // 오늘 빠른 버튼
      '<div class="rvmAdmin-bk-filter-group" style="justify-content:flex-end">' +
      '<label>&nbsp;</label>' +
      '<button type="button" class="btn btn-outline" id="rvmBkToday" style="white-space:nowrap">📅 오늘</button>' +
      '</div>' +

      // 키워드
      '<div class="rvmAdmin-bk-filter-group">' +
      '<label>검색</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmBkQ" value="' + esc(fq) + '" placeholder="예약번호 / 이름 / 전화번호"/>' +
      '</div>' +

      // 상태
      '<div class="rvmAdmin-bk-filter-group">' +
      '<label>상태</label>' +
      '<select class="rvmAdmin-select" id="rvmBkStatus">' + statusOpts + '</select>' +
      '</div>' +

      // 지점
      '<div class="rvmAdmin-bk-filter-group">' +
      '<label>지점</label>' +
      '<select class="rvmAdmin-select" id="rvmBkBranch">' + branchOpts + '</select>' +
      '</div>' +

      // 버튼
      '<div class="rvmAdmin-bk-filter-group" style="justify-content:flex-end">' +
      '<label>&nbsp;</label>' +
      '<div style="display:flex;gap:6px">' +
      '<button type="button" class="btn btn-primary" data-action="bk-search">🔍 검색</button>' +
      '<button type="button" class="btn btn-ghost" data-action="bk-reset">초기화</button>' +
      '</div>' +
      '</div>' +

      '</div>' + // rvmAdmin-bk-filters

      // ── 결과 요약 배지
      '<div id="rvmBkSummary" style="margin:10px 0 4px;font-size:.85rem;font-weight:800;color:var(--text3)"></div>' +

      // ── 테이블
      '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:960px"><thead><tr>' +
      '<th>예약번호</th><th>상태</th><th>상태 변경</th><th style="white-space:nowrap">예약 일시</th><th>지점</th>' +
      activeFields.map(function(f){ return '<th>' + esc(f.label) + '</th>'; }).join('') +
      '<th>관리</th></tr></thead>' +
      '<tbody id="rvmBkBody">' + (rows || '<tr><td colspan="' + colCount + '" style="color:var(--text3);padding:18px 8px">예약 데이터가 없습니다.</td></tr>') + '</tbody>' +
      '</table></div>' +
      '</div></div></div>';
  }

  /* ─── 예약 조회 설정 탭 ─────────────────────────── */
  function renderLookupTab() {
    var l = getLookup(state.instanceId);
    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>예약 조회 설정</h3><p>프론트에서 고객이 예약을 조회하는 방식을 설정합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-outline" data-action="dummy-save">저장</button></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-6"><div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:#fbfcff">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:10px">예약번호 조회</div>' +
      '<label class="rvmAdmin-switch" style="gap:10px"><input type="checkbox" id="rvmLookupNo"' + (l.allow_by_reservation_no ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">예약번호 조회 허용</span></label>' +
      '<div style="margin-top:8px;color:var(--text3);font-weight:800;font-size:.85rem">예약번호 입력으로 즉시 조회</div></div></div>' +
      '<div class="rvmAdmin-col-6"><div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:#fbfcff">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:10px">이름+전화번호 조회</div>' +
      '<label class="rvmAdmin-switch" style="gap:10px"><input type="checkbox" id="rvmLookupNamePhone"' + (l.allow_by_name_phone ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">이름/전화 조합 조회 허용</span></label>' +
      '<div style="margin-top:8px;color:var(--text3);font-weight:800;font-size:.85rem">이름과 전화번호를 함께 입력해야 조회</div></div></div>' +
      '</div></div></div></div>';
  }

  /* ════════════════════════════════════════════════════
     WIRE UI — render 후 항상 새로 바인딩
     (_rvmWired 패턴 완전 제거 → 단순하고 명확하게)
  ════════════════════════════════════════════════════ */
  function wireUi() {
    // ─ 탭 전환
    root.querySelectorAll('.rvmAdmin-tab[data-tab]').forEach(function(b) {
      b.onclick = function() { state.editTab = b.getAttribute('data-tab'); render(); };
    });

    // ─ 전역 버튼 (상단 생성 버튼은 root 바깥에 있을 수 있음)
    var btnCreate = document.getElementById('rvmAdmin__openCreate');
    if (btnCreate) btnCreate.onclick = function() { createNewInstance(); };

    // ─ data-action 버튼들
    root.querySelectorAll('[data-action]').forEach(function(el) {
      var act = el.getAttribute('data-action');
      if (act === 'create')      el.onclick = function() { createNewInstance(); };
      if (act === 'back')        el.onclick = function() { setModeList(); };
      if (act === 'edit')        el.onclick = function() { setModeEdit(parseInt(el.getAttribute('data-inst'), 10)); };
      if (act === 'del')         el.onclick = function() { deleteInstance(parseInt(el.getAttribute('data-inst'), 10)); };
      if (act === 'step-add')    el.onclick = function() { openStepModal(null); };
      if (act === 'field-add')   el.onclick = function() { openFieldModal(null); };
      if (act === 'bk-export')   el.onclick = function() { toast('엑셀 다운로드 - 실제 파일 생성 없음', 'warning'); };
      if (act === 'bk-search')   el.onclick = function() { filterAndRenderBookings(); };
      if (act === 'bk-reset')    el.onclick = function() { resetBookingsFilters(); render(); };
      if (act === 'cal-prev')    el.onclick = function() { moveCalendar(-1); };
      if (act === 'cal-next')    el.onclick = function() { moveCalendar(1); };
      if (act === 'dummy-save')  el.onclick = function() {
        var tab = state.editTab;
        if (tab === 'notification') { saveNotification(); }
        else if (tab === 'lookup')  { saveLookup(); }
        else { syncAndSave(); }
      };
    });

    // ─ 인스턴스 목록: 사용 여부 토글
    root.querySelectorAll('input.rvmSwitch[data-inst]').forEach(function(cb) {
      cb.onchange = function() {
        var inst = getInstance(parseInt(cb.getAttribute('data-inst'), 10));
        if (inst) inst.is_active = !!cb.checked;
        render();
      };
    });

    // ─ 단계 탭 컨트롤
    root.querySelectorAll('.rvmStepActive[data-idx]').forEach(function(cb) {
      cb.onchange = function() { toggleStep(parseInt(cb.getAttribute('data-idx'), 10), !!cb.checked); };
    });
    root.querySelectorAll('.rvmStepUp[data-idx]').forEach(function(b) {
      b.onclick = function() { moveStep(parseInt(b.getAttribute('data-idx'), 10), -1); };
    });
    root.querySelectorAll('.rvmStepDown[data-idx]').forEach(function(b) {
      b.onclick = function() { moveStep(parseInt(b.getAttribute('data-idx'), 10), 1); };
    });
    root.querySelectorAll('.rvmStepDel[data-idx]').forEach(function(b) {
      b.onclick = function() { deleteStep(parseInt(b.getAttribute('data-idx'), 10)); };
    });
    // 드래그 & 드롭
    root.querySelectorAll('.rvmAdmin-step-item[data-step-idx]').forEach(function(item) {
      item.ondragstart = function() { state.drag.fromIdx = parseInt(item.getAttribute('data-step-idx'), 10); };
      item.ondragover  = function(e) { e.preventDefault(); };
      item.ondrop      = function() {
        var to = parseInt(item.getAttribute('data-step-idx'), 10);
        if (state.drag.fromIdx == null || state.drag.fromIdx === to) return;
        swapStep(state.drag.fromIdx, to);
        state.drag.fromIdx = null;
      };
    });

    // ─ 필드 탭 컨트롤
    root.querySelectorAll('.rvmFieldEdit[data-id]').forEach(function(b) {
      b.onclick = function() {
        var f = getFields(state.instanceId).find(function(x){ return x.id === parseInt(b.getAttribute('data-id'), 10); });
        openFieldModal(f || null);
      };
    });
    root.querySelectorAll('.rvmFieldDel[data-id]').forEach(function(b) {
      b.onclick = function() {
        if (!confirm('필드를 삭제할까요?')) return;
        var id = parseInt(b.getAttribute('data-id'), 10);
        state.fieldsByInstance[state.instanceId] = getFields(state.instanceId).filter(function(f){ return f.id !== id; });
        var api = window.RvmApi;
        if (api) api.fieldDelete(id).catch(function(e){ console.error('fieldDelete', e); });
        toast('필드 삭제됨', 'success'); render();
      };
    });

    // ─ 지역 관리
    var btnRegionAdd = root.querySelector('#rvmRegionAdd');
    if (btnRegionAdd) btnRegionAdd.onclick = function() { openRegionModal(null); };
    root.querySelectorAll('button.rvmRegionEdit[data-id]').forEach(function(b) {
      b.onclick = function() {
        var r = (state.regionsMaster || []).find(function(x){ return x.id === parseInt(b.getAttribute('data-id'), 10); });
        openRegionModal(r || null);
      };
    });
    root.querySelectorAll('button.rvmRegionDel[data-id]').forEach(function(b) {
      b.onclick = function() {
        var id = parseInt(b.getAttribute('data-id'), 10);
        var r  = regionById(id);
        var branchCount = (state.branchesMaster || []).filter(function(x){ return x.region_id === id; }).length;
        if (branchCount > 0) { alert('"' + (r ? r.name : id) + '" 지역에 소속 지점(' + branchCount + '개)이 있어 삭제할 수 없습니다.\n지점을 먼저 삭제하거나 다른 지역으로 이동하세요.'); return; }
        if (!confirm('"' + (r ? r.name : id) + '" 지역을 삭제할까요?')) return;
        state.regionsMaster = (state.regionsMaster || []).filter(function(x){ return x.id !== id; });
        var api = window.RvmApi;
        if (api) api.regionDelete(id).catch(function(e){ console.error('regionDelete', e); });
        toast('지역 삭제됨', 'success'); render();
      };
    });

    // ─ 지점 탭 컨트롤
    root.querySelectorAll('input.rvmBranchConn[data-branch]').forEach(function(cb) {
      cb.onchange = function() {
        var bid = parseInt(cb.getAttribute('data-branch'), 10);
        var list = getBranchAssign(state.instanceId).slice();
        var idx = list.indexOf(bid);
        if (cb.checked) { if (idx < 0) list.push(bid); }
        else            { if (idx >= 0) list.splice(idx, 1); }
        state.branchAssignByInstance[state.instanceId] = list;
        var api = window.RvmApi;
        if (api) api.instanceBranchSync(state.instanceId, list).catch(function(e){ console.error('branchSync', e); });
        toast('지점 연결 변경됨', 'success'); render();
      };
    });
    root.querySelectorAll('input.rvmBranchActive[data-branch]').forEach(function(cb) {
      cb.onchange = function() {
        var br = branchById(parseInt(cb.getAttribute('data-branch'), 10));
        if (br) {
          br.is_active = !!cb.checked;
          var api = window.RvmApi;
          if (api) api.branchSave({ id: br.id, region_id: br.region_id, name: br.name, is_active: br.is_active ? 1 : 0, sort_order: br.sort_order||0 }).catch(function(e){ console.error('branchSave', e); });
        }
        toast('지점 사용 여부 변경됨', 'success'); render();
      };
    });
    var btnBranchAdd = root.querySelector('#rvmBranchMasterAdd');
    if (btnBranchAdd) btnBranchAdd.onclick = function() { openBranchMasterModal(null); };
    root.querySelectorAll('button.rvmBranchMasterEdit[data-id]').forEach(function(b) {
      b.onclick = function() {
        var br = (state.branchesMaster || []).find(function(x){ return x.id === parseInt(b.getAttribute('data-id'), 10); });
        openBranchMasterModal(br || null);
      };
    });
    root.querySelectorAll('button.rvmBranchMasterDel[data-id]').forEach(function(b) {
      b.onclick = function() {
        var id = parseInt(b.getAttribute('data-id'), 10);
        var br = branchById(id);
        if (!confirm('지점 "' + (br ? br.name : id) + '" 을 삭제할까요?')) return;
        state.branchesMaster = (state.branchesMaster || []).filter(function(x){ return x.id !== id; });
        Object.keys(state.branchAssignByInstance || {}).forEach(function(instId) {
          state.branchAssignByInstance[instId] = (state.branchAssignByInstance[instId] || []).filter(function(bid){ return bid !== id; });
        });
        if (state.branchItemBranchId === id) state.branchItemBranchId = getBranchAssign(state.instanceId)[0] || null;
        if (state.calendarBranchId   === id) state.calendarBranchId   = getBranchAssign(state.instanceId)[0] || null;
        var api = window.RvmApi;
        if (api) api.branchDelete(id).catch(function(e){ console.error('branchDelete', e); });
        toast('지점 삭제됨', 'success'); render();
      };
    });
    var rvmBranchItemSel = root.querySelector('#rvmBranchItemSel');
    if (rvmBranchItemSel) rvmBranchItemSel.onchange = function() {
      state.branchItemBranchId = parseInt(rvmBranchItemSel.value, 10) || null;
      render();
    };
    var rvmBranchItemAdd = root.querySelector('#rvmBranchItemAdd');
    if (rvmBranchItemAdd) rvmBranchItemAdd.onclick = function() { openBranchItemModal(state.branchItemBranchId, null); };
    root.querySelectorAll('button.rvmBranchItemDel[data-id]').forEach(function(b) {
      b.onclick = function() {
        var itemId = parseInt(b.getAttribute('data-id'), 10);
        var bid = state.branchItemBranchId;
        if (!bid) return;
        setItemsByBranch(state.instanceId, bid, getItemsByBranch(state.instanceId, bid).filter(function(x){ return x.id !== itemId; }));
        var api = window.RvmApi;
        if (api) api.branchItemDelete(itemId).catch(function(e){ console.error('branchItemDelete', e); });
        toast('항목 삭제됨', 'success'); render();
      };
    });

    // ─ ★ 캘린더 탭 컨트롤
    // 달력 날짜 클릭
    root.querySelectorAll('.rvmAdmin-cal-day[data-iso]').forEach(function(b) {
      b.onclick = function() {
        state.selectedDate = b.getAttribute('data-iso');
        render();
      };
    });
    // 기준 지점 변경
    var calBranchSel = root.querySelector('#rvmCalBranchSel');
    if (calBranchSel) calBranchSel.onchange = function() {
      state.calendarBranchId = parseInt(calBranchSel.value, 10) || null;
      render();
    };
    // 날짜 마감/해제 토글
    var closeCb = root.querySelector('input.rvmDateClosed');
    if (closeCb) closeCb.onchange = function() {
      var iso = state.selectedDate;
      if (!iso) return;
      var m = getCalendar(state.instanceId);
      if (!m[iso]) return;
      m[iso].closed = !!closeCb.checked;
      toast(closeCb.checked ? '해당일 마감 처리됨' : '해당일 예약가능으로 변경됨', 'success');
      render();
    };
    // ★ 시간 추가 버튼 (단건 추가)
    var btnAddTime = root.querySelector('#rvmCalAddTime');
    if (btnAddTime) btnAddTime.onclick = function() { openAddTimeModal(); };
    // ★ 시간 삭제 버튼
    root.querySelectorAll('button.rvmTimeDel[data-time]').forEach(function(b) {
      b.onclick = function() {
        var iso  = state.selectedDate;
        var time = b.getAttribute('data-time');
        if (!iso || !time) return;
        var m = getCalendar(state.instanceId);
        if (!m[iso]) return;
        m[iso].times = (m[iso].times || []).filter(function(t){ return t.time !== time; });
        // 시간이 모두 삭제되면 calMap에서 해당 날짜 항목도 제거
        if (!m[iso].times.length) delete m[iso];
        toast('시간 슬롯 삭제됨', 'success'); render();
      };
    });
    // 시간 정원 수정
    root.querySelectorAll('input.rvmTimeCap[data-time]').forEach(function(inp) {
      inp.onchange = function() {
        var iso  = state.selectedDate;
        var time = inp.getAttribute('data-time');
        var m = getCalendar(state.instanceId);
        if (!m || !m[iso] || !m[iso].times) return;
        var slot = m[iso].times.find(function(x){ return x.time === time; });
        if (!slot) return;
        var cap = Math.max(parseInt(inp.value, 10) || 0, parseInt(slot.booked, 10) || 0);
        slot.capacity = cap;
        toast('정원 반영됨', 'success'); render();
      };
    });
    // 항목 정원 수정
    root.querySelectorAll('input.rvmItemCap[data-item-id]').forEach(function(inp) {
      inp.onchange = function() {
        var iso    = state.selectedDate;
        var itemId = parseInt(inp.getAttribute('data-item-id'), 10);
        var bid    = state.calendarBranchId;
        var m      = getCalendar(state.instanceId);
        if (!m[iso]) m[iso] = { closed: false, times: [], itemByBranch: {} };
        if (!m[iso].itemByBranch) m[iso].itemByBranch = {};
        if (!m[iso].itemByBranch[bid]) m[iso].itemByBranch[bid] = { capacityByItemId: {}, bookedByItemId: {} };
        var booked = parseInt((m[iso].itemByBranch[bid].bookedByItemId || {})[itemId], 10) || 0;
        m[iso].itemByBranch[bid].capacityByItemId[itemId] = Math.max(parseInt(inp.value, 10) || 0, booked);
        toast('항목 정원 반영됨', 'success'); render();
      };
    });
    // 일괄 설정 적용
    var bulkBtn = root.querySelector('#rvmBulkApply');
    if (bulkBtn) bulkBtn.onclick = function() { applyBulkCalendar(); };

    // ─ 알림 설정
    root.querySelectorAll('input.rvmNotiUse[data-key]').forEach(function(cb) {
      cb.onchange = function() { getNotification(state.instanceId)[cb.getAttribute('data-key')] = !!cb.checked; render(); };
    });
    var notiEmails = root.querySelector('#rvmNotiEmails');
    if (notiEmails) notiEmails.oninput = function() { getNotification(state.instanceId).email_list = notiEmails.value; };
    var notiSheet  = root.querySelector('#rvmNotiSheet');
    if (notiSheet)  notiSheet.oninput  = function() { getNotification(state.instanceId).sheet_webhook = notiSheet.value; };
    var notiAlim   = root.querySelector('#rvmNotiAlim');
    if (notiAlim)   notiAlim.oninput   = function() { getNotification(state.instanceId).alimtalk_webhook = notiAlim.value; };

    // ─ 예약 조회 설정
    var lookupNo = root.querySelector('#rvmLookupNo');
    if (lookupNo) lookupNo.onchange = function() { getLookup(state.instanceId).allow_by_reservation_no = !!lookupNo.checked; };
    var lookupNP = root.querySelector('#rvmLookupNamePhone');
    if (lookupNP) lookupNP.onchange = function() { getLookup(state.instanceId).allow_by_name_phone = !!lookupNP.checked; };

    // ─ 예약 접수 리스트
    var btnToday = root.querySelector('#rvmBkToday');
    if (btnToday) btnToday.onclick = function() {
      var td = todayIso();
      var fromEl = document.getElementById('rvmBkDateFrom');
      var toEl   = document.getElementById('rvmBkDateTo');
      if (fromEl) fromEl.value = td;
      if (toEl)   toEl.value   = td;
      filterAndRenderBookings();
    };
    root.querySelectorAll('.rvmBkDetail[data-bid]').forEach(function(btn) {
      btn.onclick = function() { openBookingDetailModal(parseInt(btn.getAttribute('data-bid'), 10)); };
    });
    root.querySelectorAll('.rvmBkStatusSet[data-bid]').forEach(function(btn) {
      btn.onclick = function() {
        var bid = parseInt(btn.getAttribute('data-bid'), 10);
        var tr  = btn.closest('tr');
        var sel = tr ? tr.querySelector('select.rvmBkStatusSel') : null;
        if (!sel) return;
        var bk = getBookings(state.instanceId).find(function(x){ return x.id === bid; });
        if (!bk) return;
        bk.status = sel.value;
        toast('상태 변경: ' + sel.value, 'success'); render();
      };
    });
  }

  /* ════════════════════════════════════════════════════
     액션 함수들
  ════════════════════════════════════════════════════ */

  function deleteInstance(id) {
    var inst = getInstance(id);
    if (!confirm('"' + (inst ? inst.name : id) + '" 예약 테이블을 삭제할까요?')) return;
    var api = window.RvmApi;
    if (!api) {
      state.instances = state.instances.filter(function(x){ return x.id !== id; });
      ['stepsByInstance','fieldsByInstance','branchAssignByInstance','calendarByInstance','notificationByInstance','bookingsByInstance','lookupByInstance','itemsByBranchByInstance'].forEach(function(k){ delete state[k][id]; });
      state.mode = 'list'; toast('삭제됨', 'success'); render(); return;
    }
    api.instanceDelete(id).then(function() {
      state.instances = state.instances.filter(function(x){ return x.id !== id; });
      ['stepsByInstance','fieldsByInstance','branchAssignByInstance','calendarByInstance','notificationByInstance','bookingsByInstance','lookupByInstance','itemsByBranchByInstance'].forEach(function(k){ delete state[k][id]; });
      state.mode = 'list'; toast('삭제됨', 'success'); render();
    }).catch(function(e) { toast(e.message || '삭제 실패', 'error'); });
  }

  function saveNotification() {
    var n = getNotification(state.instanceId);
    var useEmail = !!(root.querySelector('input.rvmNotiUse[data-key="use_email"]') || {checked:n.use_email}).checked;
    var useSheet = !!(root.querySelector('input.rvmNotiUse[data-key="use_sheet"]') || {checked:n.use_sheet}).checked;
    var useAlim  = !!(root.querySelector('input.rvmNotiUse[data-key="use_alimtalk"]') || {checked:n.use_alimtalk}).checked;
    var emails   = ((document.getElementById('rvmNotiEmails') || {}).value || '').trim();
    var sheet    = ((document.getElementById('rvmNotiSheet')  || {}).value || '').trim();
    var alim     = ((document.getElementById('rvmNotiAlim')   || {}).value || '').trim();
    Object.assign(n, { use_email: useEmail, use_sheet: useSheet, use_alimtalk: useAlim, email_list: emails, sheet_webhook: sheet, alimtalk_webhook: alim });
    var api = window.RvmApi;
    if (!api) { toast('알림 설정 저장됨', 'success'); return; }
    api.settingsSave({ instance_id: state.instanceId, use_email: useEmail ? 1 : 0, use_sheet: useSheet ? 1 : 0, use_alimtalk: useAlim ? 1 : 0, email_list: emails, sheet_webhook: sheet, alimtalk_webhook: alim })
      .then(function(){ toast('알림 설정 저장됨', 'success'); })
      .catch(function(e){ toast(e.message||'저장 실패', 'error'); });
  }

  function saveLookup() {
    var l = getLookup(state.instanceId);
    var noEl   = document.getElementById('rvmLookupNo');
    var npEl   = document.getElementById('rvmLookupNamePhone');
    if (noEl) l.allow_by_reservation_no = !!noEl.checked;
    if (npEl) l.allow_by_name_phone     = !!npEl.checked;
    toast('예약 조회 설정 저장됨', 'success');
  }

    function syncAndSave() {
    if (state.mode !== 'edit') { toast('저장됨', 'success'); return; }
    var inst = getInstance(state.instanceId);
    var nm = document.getElementById('rvm-edit-name');
    var ac = document.getElementById('rvm-edit-active');
    var ds = document.getElementById('rvm-edit-desc');
    if (!inst || !nm) { toast('저장됨', 'success'); return; }
    var newName = (nm.value || '').trim() || inst.name;
    var newActive = ac ? !!ac.checked : !!inst.is_active;
    var newDesc   = ds ? (ds.value || '') : (inst.description || '');
    inst.name = newName; inst.is_active = newActive; inst.description = newDesc;
    var api = window.RvmApi;
    if (!api) { toast('저장됨', 'success'); render(); return; }
    api.instanceSave({ id: inst.id, name: newName, slug: inst.slug || '', is_active: newActive, sort_order: inst.sort_order || 0 })
      .then(function() { toast('저장됨', 'success'); render(); })
      .catch(function(e) { toast(e.message || '저장 실패', 'error'); });
  }

  function toggleStep(idx, isActive) {
    var steps = sortedSteps();
    if (!steps[idx]) return;
    steps[idx].is_active = isActive;
    saveSteps(steps); render();
  }
  function moveStep(idx, delta) {
    var steps = sortedSteps();
    var toIdx = idx + delta;
    if (toIdx < 0 || toIdx >= steps.length) return;
    var tmp = steps[idx]; steps[idx] = steps[toIdx]; steps[toIdx] = tmp;
    saveSteps(steps); render();
  }
  function swapStep(from, to) {
    var steps = sortedSteps();
    var tmp = steps[from]; steps[from] = steps[to]; steps[to] = tmp;
    saveSteps(steps); render();
  }
  function deleteStep(idx) {
    var steps = sortedSteps();
    steps.splice(idx, 1);
    saveSteps(steps); toast('단계 삭제됨', 'success'); render();
  }
  function sortedSteps() { return getSteps(state.instanceId).slice().sort(function(a,b){ return a.sort_order - b.sort_order; }); }
  function saveSteps(steps) {
    var ordered = steps.map(function(s,i){ return Object.assign({}, s, { sort_order: (i+1)*10 }); });
    state.stepsByInstance[state.instanceId] = ordered;
    var api = window.RvmApi;
    if (!api) return;
    api.stepBulkSave(state.instanceId, ordered.map(function(s){ return { step_key: s.step_key, sort_order: s.sort_order, is_active: s.is_active ? 1 : 0 }; }))
      .catch(function(e){ console.error('saveSteps error', e); });
  }

  function moveCalendar(delta) {
    var cur  = state.monthCursor instanceof Date ? state.monthCursor : new Date();
    var next = new Date(cur.getFullYear(), cur.getMonth() + delta, 1);
    state.monthCursor = next;
    var td = todayIso();
    var monthStart = formatISODate(new Date(next.getFullYear(), next.getMonth(), 1));
    state.selectedDate = td >= monthStart ? td : monthStart;
    render();
  }

  /* ═══════════════════════════════════════════════════
     ★ 일괄 캘린더 설정 (버그 수정: max 고정 제거)
  ═══════════════════════════════════════════════════ */
  function applyBulkCalendar() {
    var fromEl  = root.querySelector('#rvmBulkFrom');
    var toEl    = root.querySelector('#rvmBulkTo');
    var timesEl = root.querySelector('#rvmBulkTimes');
    var capEl   = root.querySelector('#rvmBulkCap');
    if (!fromEl || !toEl || !timesEl || !capEl) return;

    var fromIso = (fromEl.value || '').trim();
    var toIso   = (toEl.value   || '').trim();
    if (!fromIso || !toIso) return alert('시작일과 종료일을 입력하세요.');
    if (fromIso > toIso)    return alert('시작일은 종료일보다 이전이어야 합니다.');

    var cap = Math.max(1, parseInt(capEl.value, 10) || 1);
    // ★ 임의 시간 형식(HH:MM) 허용 — 더 이상 기본 시간 목록 제약 없음
    var pickedTimes = (timesEl.value || '').split(',').map(function(x){ return x.trim(); }).filter(function(x){ return /^\d{2}:\d{2}$/.test(x); });
    if (!pickedTimes.length) return alert('시간 형식이 맞지 않습니다. 예: 09:00, 10:30');
    pickedTimes = pickedTimes.filter(function(t, i){ return pickedTimes.indexOf(t) === i; }); // 중복 제거

    var td = todayIso();
    var m  = getCalendar(state.instanceId);
    var inserted = 0;

    var cur = parseIso(fromIso);
    var end = parseIso(toIso);
    while (cur <= end) {
      var isoKey = formatISODate(cur);
      if (isoKey >= td) {
        if (!m[isoKey]) m[isoKey] = { closed: false, times: [], itemByBranch: {} };
        if (!m[isoKey].times) m[isoKey].times = [];
        pickedTimes.forEach(function(pt) {
          var slot = m[isoKey].times.find(function(x){ return x.time === pt; });
          if (!slot) {
            m[isoKey].times.push({ time: pt, capacity: cap, booked: 0 });
            inserted++;
          } else {
            // 기존 슬롯의 정원만 업데이트(예약수 보존)
            slot.capacity = Math.max(cap, parseInt(slot.booked, 10) || 0);
          }
        });
      }
      cur.setDate(cur.getDate() + 1);
    }

    var api = window.RvmApi;
    if (!api) { toast('일괄 적용 완료: ' + inserted + '개 슬롯 추가됨', 'success'); render(); return; }
    var bid = state.calendarBranchId;
    if (!bid) { toast('일괄 적용 완료: ' + inserted + '개 슬롯 추가됨', 'success'); render(); return; }
    // API로 bulk 저장: 날짜별 슬롯 목록 수집
    var slots = [];
    var cur2 = parseIso(fromIso); var end2 = parseIso(toIso);
    while (cur2 <= end2) {
      var k2 = formatISODate(cur2);
      if (k2 >= td && m[k2] && m[k2].times) {
        m[k2].times.forEach(function(t) {
          slots.push({ slot_date: k2, slot_time: t.time + ':00', capacity: t.capacity });
        });
      }
      cur2.setDate(cur2.getDate() + 1);
    }
    if (slots.length) {
      api.slotBulkSave({ instance_id: state.instanceId, branch_id: bid, slots: slots })
        .then(function(){ toast('일괄 저장 완료: ' + inserted + '개 슬롯', 'success'); render(); })
        .catch(function(e){ toast(e.message||'일괄 저장 실패','error'); render(); });
    } else {
      toast('일괄 적용 완료: ' + inserted + '개 슬롯 추가됨', 'success'); render();
    }
  }

  function renderBkRows(filtered, activeFields) {
    var colCount = 6 + activeFields.length;
    var body    = document.getElementById('rvmBkBody');
    var summary = document.getElementById('rvmBkSummary');
    if (!body) return;
    if (summary) summary.textContent = '검색 결과: ' + filtered.length + '건';
    body.innerHTML = filtered.map(function(bk) {
      var statusOpts = ['접수','확인','완료','취소'].map(function(s){ return '<option value="' + esc(s) + '"' + (s === bk.status ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
      var extraObj = {}; try { extraObj = JSON.parse(bk.extra_json || '{}'); } catch(e){}
      var fieldTds = activeFields.map(function(f){ return '<td style="min-width:140px">' + esc(String(extraObj[f.name_key] || '')); + '</td>'; }).join('');
      var pillCls = bk.status === '완료' ? 'ok' : bk.status === '취소' ? 'bad' : bk.status === '확인' ? 'warn' : '';
      var bkBrName = esc((branchById(bk.branch_id) || {}).name || bk.branch_name || '-');
      return '<tr>' +
        '<td style="font-weight:900;white-space:nowrap">' + esc(bk.reservation_no || bk.no) + '</td>' +
        '<td><span class="rvmAdmin-pill ' + pillCls + '">' + esc(bk.status) + '</span></td>' +
        '<td style="min-width:120px"><select class="rvmAdmin-select rvmBkStatusSel" data-bid="' + esc(bk.id) + '">' + statusOpts + '</select></td>' +
        '<td style="white-space:nowrap">' + esc(bk.reservation_at || bk.at || '') + '</td>' +
        '<td>' + bkBrName + '</td>' +
        '<td>' + esc(bk.customer_name || bk.name || '') + ' / ' + esc(bk.customer_phone || bk.phone || '') + '</td>' +
        '<td><div class="rvmAdmin-actions">' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkStatusSet" data-bid="' + esc(bk.id) + '">변경</button>' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkDetail" data-bid="' + esc(bk.id) + '">상세</button>' +
        '</div></td></tr>';
    }).join('') || '<tr><td colspan="' + colCount + '" style="color:var(--text3);padding:18px 8px">검색 결과가 없습니다.</td></tr>';
    body.querySelectorAll('.rvmBkDetail[data-bid]').forEach(function(btn) {
      btn.onclick = function() { openBookingDetailModal(parseInt(btn.getAttribute('data-bid'), 10)); };
    });
    body.querySelectorAll('.rvmBkStatusSet[data-bid]').forEach(function(btn) {
      btn.onclick = function() {
        var bid = parseInt(btn.getAttribute('data-bid'), 10);
        var tr  = btn.closest('tr');
        var sel = tr ? tr.querySelector('select.rvmBkStatusSel') : null;
        if (!sel) return;
        var newStatus = sel.value;
        var api = window.RvmApi;
        if (api) {
          api.bookingStatusUpdate(bid, newStatus, '').then(function(){ toast('상태 변경: ' + newStatus, 'success'); filterAndRenderBookings(); }).catch(function(e){ toast(e.message||'실패','error'); });
        } else {
          var bk = getBookings(state.instanceId).find(function(x){ return x.id === bid; });
          if (bk) bk.status = newStatus;
          toast('상태 변경: ' + newStatus, 'success'); render();
        }
      };
    });
  }

  function filterAndRenderBookings() {
    var q        = ((document.getElementById('rvmBkQ')        || {}).value || '').toLowerCase().trim();
    var st       = ((document.getElementById('rvmBkStatus')   || {}).value || '');
    var br       = parseInt(((document.getElementById('rvmBkBranch') || {}).value || '0'), 10);
    var dateFrom = ((document.getElementById('rvmBkDateFrom') || {}).value || '').trim();
    var dateTo   = ((document.getElementById('rvmBkDateTo')   || {}).value || '').trim();
    state.bkFilter = { q: q, status: st, branch: String(br), dateFrom: dateFrom, dateTo: dateTo };
    var activeFields = getFields(state.instanceId).filter(function(f){ return !!f.is_active; });
    var api = window.RvmApi;
    if (!api) {
      var filtered = getBookings(state.instanceId).filter(function(bk) {
        var text = ((bk.reservation_no||bk.no||'') + ' ' + (bk.customer_name||bk.name||'') + ' ' + (bk.customer_phone||bk.phone||'')).toLowerCase();
        var bkDate = (bk.reservation_at||bk.at||'').slice(0,10);
        return (!st||bk.status===st) && (!br||bk.branch_id===br) && (!q||text.indexOf(q)>=0) && (!dateFrom||bkDate>=dateFrom) && (!dateTo||bkDate<=dateTo);
      });
      renderBkRows(filtered, activeFields); return;
    }
    var params = { instance_id: state.instanceId, page: 1, per_page: 100 };
    if (st) params.status = st;
    if (br) params.branch_id = br;
    if (q)  params.q = q;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo)   params.date_to   = dateTo;
    api.bookingList(params).then(function(res) {
      state.bookingsByInstance[state.instanceId] = res.bookings || res.rows || [];
      renderBkRows(state.bookingsByInstance[state.instanceId], activeFields);
    }).catch(function(e) {
      var body = document.getElementById('rvmBkBody');
      if (body) body.innerHTML = '<tr><td colspan="8" style="color:#b91c1c">' + esc(e.message||'로드 실패') + '</td></tr>';
    });

    // 예약 목록 탭이 활성화될 때 API 로드 되도록 아래를 보존
    var body    = document.getElementById('rvmBkBody');
    var summary = document.getElementById('rvmBkSummary');
    if (!body) return;
    if (summary) summary.textContent = '불러오는 중…';
    body.innerHTML = '<tr><td colspan="8" style="color:var(--text3);padding:18px 8px">불러오는 중…</td></tr>';

    body.querySelectorAll('.rvmBkDetail[data-bid]').forEach(function(btn) {
      btn.onclick = function() { openBookingDetailModal(parseInt(btn.getAttribute('data-bid'), 10)); };
    });
    body.querySelectorAll('.rvmBkStatusSet[data-bid]').forEach(function(btn) {
      btn.onclick = function() {
        var bid = parseInt(btn.getAttribute('data-bid'), 10);
        var tr  = btn.closest('tr');
        var sel = tr ? tr.querySelector('select.rvmBkStatusSel') : null;
        if (!sel) return;
        var bk  = getBookings(state.instanceId).find(function(x){ return x.id === bid; });
        if (!bk) return;
        var newStatus = sel.value;
        bk.status = newStatus;
        var api = window.RvmApi;
        if (api) {
          api.bookingStatusUpdate(bid, newStatus, '').catch(function(e){ console.error('statusUpdate', e); });
        }
        toast('상태 변경: ' + newStatus, 'success'); render();
      };
    });
  }

  function resetBookingsFilters() {
    state.bkFilter = {};
    var els = ['rvmBkQ','rvmBkStatus','rvmBkDateFrom','rvmBkDateTo'];
    els.forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
    var brEl = document.getElementById('rvmBkBranch');
    if (brEl) brEl.value = '0';
    toast('필터 초기화됨', 'success');
    filterAndRenderBookings();
  }

  /* ════════════════════════════════════════════════════
     ★ 시간 추가 모달 (신규)
     - 단일 날짜에 시간(HH:MM) + 정원 직접 입력
  ════════════════════════════════════════════════════ */
  function openAddTimeModal() {
    var iso = state.selectedDate;
    if (!iso) return;

    var html = '<h3 style="margin-top:0">시간 슬롯 추가 — ' + esc(iso) + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-6">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">시간 (HH:MM)</label>' +
      '<input class="rvmAdmin-input" type="time" id="rvmAddTimeVal" value="09:00" required/>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">정원</label>' +
      '<input class="rvmAdmin-input" type="number" id="rvmAddTimeCap" value="3" min="1"/>' +
      '</div>' +
      '<div class="rvmAdmin-col-12" style="color:var(--text3);font-weight:800;font-size:.83rem">이미 동일 시간이 등록된 경우 중복 추가되지 않습니다.</div>' +
      '</div>' +
      '<div style="margin-top:16px" class="rvmAdmin-btn-row">' +
      '<button type="button" class="btn btn-primary" id="rvmAddTimeSave">추가</button>' +
      '<button type="button" class="btn btn-ghost" id="rvmAddTimeCancel">취소</button>' +
      '</div>';

    openModal(html);

    modalEl.querySelector('#rvmAddTimeCancel').onclick = closeModal;
    modalEl.querySelector('#rvmAddTimeSave').onclick = function() {
      var timeVal = (modalEl.querySelector('#rvmAddTimeVal').value || '').trim();
      var capVal  = Math.max(1, parseInt(modalEl.querySelector('#rvmAddTimeCap').value, 10) || 1);

      if (!/^\d{2}:\d{2}$/.test(timeVal)) return alert('시간 형식이 올바르지 않습니다. 예: 09:30');

      var m = getCalendar(state.instanceId);
      if (!m[iso]) m[iso] = { closed: false, times: [], itemByBranch: {} };
      if (!m[iso].times) m[iso].times = [];

      var exists = m[iso].times.find(function(t){ return t.time === timeVal; });
      if (exists) { alert(timeVal + ' 슬롯이 이미 등록되어 있습니다.'); return; }

      var api = window.RvmApi;
      if (!api) {
        m[iso].times.push({ time: timeVal, capacity: capVal, booked: 0 });
        m[iso].times.sort(function(a, b){ return a.time < b.time ? -1 : 1; });
        closeModal(); toast(iso + ' · ' + timeVal + ' 슬롯 추가됨', 'success'); render(); return;
      }
      var bid = state.calendarBranchId;
      if (!bid) { alert('지점을 먼저 선택하세요.'); return; }
      api.slotSave({ id: 0, instance_id: state.instanceId, branch_id: bid, slot_date: iso, slot_time: timeVal + ':00', capacity: capVal }).then(function() {
        m[iso].times.push({ time: timeVal, capacity: capVal, booked: 0 });
        m[iso].times.sort(function(a, b){ return a.time < b.time ? -1 : 1; });
        closeModal(); toast(iso + ' · ' + timeVal + ' 슬롯 추가됨', 'success'); render();
      }).catch(function(e){ toast(e.message||'슬롯 저장 실패', 'error'); });
    };
  }

  /* ─── 단계 추가/수정 모달 ──────────────────────── */
  function openStepModal(step) {
    var curKey    = step ? step.step_key : 'branch';
    var curActive = step ? !!step.is_active : true;

    var html = '<h3 style="margin-top:0">' + (step ? '단계 수정' : '단계 추가') + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">단계 종류</label>' +
      '<select class="rvmAdmin-select" id="rvmStepType">' +
      STEP_TYPES.map(function(t){ return '<option value="' + esc(t.key) + '"' + (t.key === curKey ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="rvmAdmin-col-12"><label class="rvmAdmin-switch" style="gap:10px;margin-top:8px"><input type="checkbox" id="rvmStepActive"' + (curActive ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">활성 단계</span></label></div>' +
      '</div>' +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmStepSave">저장</button><button type="button" class="btn btn-ghost" id="rvmStepCancel">취소</button></div>';

    openModal(html);
    modalEl.querySelector('#rvmStepCancel').onclick = closeModal;
    modalEl.querySelector('#rvmStepSave').onclick = function() {
      var type = modalEl.querySelector('#rvmStepType').value;
      var act  = !!modalEl.querySelector('#rvmStepActive').checked;
      var steps = sortedSteps();
      if (step) {
        var idx = steps.findIndex(function(x){ return x.step_key === step.step_key && x.sort_order === step.sort_order; });
        if (idx >= 0) steps[idx] = Object.assign({}, steps[idx], { step_key: type, is_active: act });
      } else {
        steps.push({ step_key: type, sort_order: (steps.length + 1) * 10, is_active: act });
      }
      saveSteps(steps);
      closeModal(); toast('단계 반영됨', 'success'); render();
    };
  }

  /* ─── 필드 추가/수정 모달 ──────────────────────── */
  function openFieldModal(field) {
    var f            = field || null;
    var currentType  = f ? f.field_type : 'text';
    var currentKey   = f ? f.name_key  : '';
    var currentLabel = f ? f.label     : '';
    var currentReq   = f ? !!f.is_required : false;
    var currentAct   = f ? !!f.is_active   : true;
    var optionsArr   = (f && f.options) ? f.options.slice() : [];

    function renderOptsArea(type) {
      var need = type === 'radio' || type === 'checkbox' || type === 'dropdown';
      if (!need) return '<div style="color:var(--text3);font-weight:800;font-size:.85rem;margin-top:8px">선택형(radio/checkbox/dropdown)이 아닐 때는 옵션이 없습니다.</div>';
      return '<div style="margin-top:10px"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">옵션 목록 (1줄 1개)</label>' +
        '<textarea class="rvmAdmin-textarea" id="rvmFieldOpts" style="min-height:100px;resize:vertical">' + esc(optionsArr.join('\n')) + '</textarea></div>';
    }

    var html = '<h3 style="margin-top:0">' + (f ? '필드 수정' : '필드 추가') + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">필드 타입</label>' +
      '<select class="rvmAdmin-select" id="rvmFieldType">' + FIELD_TYPES.map(function(t){ return '<option value="' + esc(t) + '"' + (t === currentType ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
      '<div class="rvmAdmin-col-6"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">name_key</label><input class="rvmAdmin-input" type="text" id="rvmFieldKey" value="' + esc(currentKey) + '" placeholder="예: customer_name"/></div>' +
      '<div class="rvmAdmin-col-6"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">라벨</label><input class="rvmAdmin-input" type="text" id="rvmFieldLabel" value="' + esc(currentLabel) + '" placeholder="화면 표시명"/></div>' +
      '<div class="rvmAdmin-col-6"><label class="rvmAdmin-switch" style="gap:10px;margin-top:6px"><input type="checkbox" id="rvmFieldReq"' + (currentReq ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">필수</span></label></div>' +
      '<div class="rvmAdmin-col-6"><label class="rvmAdmin-switch" style="gap:10px;margin-top:6px"><input type="checkbox" id="rvmFieldAct"' + (currentAct ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">활성</span></label></div>' +
      '<div class="rvmAdmin-col-12" id="rvmFieldOptWrap">' + renderOptsArea(currentType) + '</div>' +
      '</div>' +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmFieldSave">저장</button><button type="button" class="btn btn-ghost" id="rvmFieldCancel">취소</button></div>';

    openModal(html);

    var typeSel = modalEl.querySelector('#rvmFieldType');
    var optWrap = modalEl.querySelector('#rvmFieldOptWrap');
    typeSel.onchange = function() { optWrap.innerHTML = renderOptsArea(typeSel.value); };
    modalEl.querySelector('#rvmFieldCancel').onclick = closeModal;
    modalEl.querySelector('#rvmFieldSave').onclick = function() {
      var type = typeSel.value;
      var key  = (modalEl.querySelector('#rvmFieldKey').value || '').trim();
      var lab  = (modalEl.querySelector('#rvmFieldLabel').value || '').trim();
      var req  = !!modalEl.querySelector('#rvmFieldReq').checked;
      var act  = !!modalEl.querySelector('#rvmFieldAct').checked;
      if (!key) return alert('name_key를 입력하세요.');
      if (!lab) return alert('라벨을 입력하세요.');
      var opts = [];
      if (type === 'radio' || type === 'checkbox' || type === 'dropdown') {
        var ta = modalEl.querySelector('#rvmFieldOpts');
        if (ta) opts = ta.value.split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean);
      }
      var api = window.RvmApi;
      var fieldData = { instance_id: state.instanceId, id: f ? f.id : 0, field_type: type, name_key: key, label: lab, is_required: req ? 1 : 0, is_active: act ? 1 : 0, options: opts, sort_order: f ? (f.sort_order||0) : 999 };
      if (!api) {
        var fields = getFields(state.instanceId).slice();
        if (f) {
          var idx = fields.findIndex(function(x){ return x.id === f.id; });
          if (idx >= 0) fields[idx] = Object.assign({}, fields[idx], { field_type: type, name_key: key, label: lab, is_required: req, is_active: act, options: opts });
        } else {
          fields.push({ id: state.nextFieldId++, field_type: type, name_key: key, label: lab, is_required: req, is_active: act, options: opts });
        }
        state.fieldsByInstance[state.instanceId] = fields;
        closeModal(); toast('필드 반영됨', 'success'); render(); return;
      }
      api.fieldSave(fieldData).then(function() {
        closeModal(); toast('필드 저장됨', 'success');
        loadInstanceData(state.instanceId, function(){ render(); });
      }).catch(function(e){ toast(e.message||'필드 저장 실패','error'); });
    };
  }

  /* ─── 지점별 항목 추가 모달 ───────────────────── */
  function openBranchItemModal(branchId, item) {
    var html = '<h3 style="margin-top:0">' + (item ? '항목 수정' : '항목 추가') + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">항목명</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmItemName" value="' + esc(item ? item.name : '') + '" placeholder="예: 스케일링, 상담, 정기점검..."/></div>' +
      '<div class="rvmAdmin-col-12"><label class="rvmAdmin-switch" style="gap:10px;margin-top:6px"><input type="checkbox" id="rvmItemActive"' + ((item ? !!item.is_active : true) ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">사용</span></label></div>' +
      '</div>' +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmItemSave">저장</button><button type="button" class="btn btn-ghost" id="rvmItemCancel">취소</button></div>';

    openModal(html);
    modalEl.querySelector('#rvmItemCancel').onclick = closeModal;
    modalEl.querySelector('#rvmItemSave').onclick = function() {
      var name   = (modalEl.querySelector('#rvmItemName').value || '').trim();
      var active = !!modalEl.querySelector('#rvmItemActive').checked;
      if (!name)     return alert('항목명을 입력하세요.');
      if (!branchId) return alert('대상 지점이 선택되지 않았습니다.');
      var items = getItemsByBranch(state.instanceId, branchId).slice();
      var api = window.RvmApi;
      if (!api) {
        if (item) { var idx = items.findIndex(function(x){ return x.id === item.id; }); if (idx >= 0) items[idx] = Object.assign({}, items[idx], { name: name, is_active: active }); }
        else { items.push({ id: state.nextItemId++, name: name, is_active: active }); }
        setItemsByBranch(state.instanceId, branchId, items);
        closeModal(); toast('항목 반영됨', 'success'); render(); return;
      }
      api.branchItemSave({ id: item ? item.id : 0, instance_id: state.instanceId, branch_id: branchId, name: name, is_active: active ? 1 : 0, sort_order: item ? (item.sort_order||0) : 999 }).then(function() {
        return api.branchItemList(state.instanceId, branchId);
      }).then(function(r) {
        setItemsByBranch(state.instanceId, branchId, r.items || []);
        closeModal(); toast('항목 반영됨', 'success'); render();
      }).catch(function(e){ toast(e.message||'저장 실패', 'error'); });
    };
  }

  /* ─── 지역 추가/수정 모달 ──────────────────────── */
  function openRegionModal(region) {
    var isEdit   = !!region;
    var curName  = region ? region.name : '';

    var html = '<h3 style="margin-top:0">' + (isEdit ? '지역 수정' : '지역 추가') + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">지역명</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmRegionName" value="' + esc(curName) + '" placeholder="예: 서울, 경기, 부산 ..."/>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:16px" class="rvmAdmin-btn-row">' +
      '<button type="button" class="btn btn-primary" id="rvmRegionSave">저장</button>' +
      '<button type="button" class="btn btn-ghost" id="rvmRegionCancel">취소</button>' +
      '</div>';

    openModal(html);
    modalEl.querySelector('#rvmRegionCancel').onclick = closeModal;
    modalEl.querySelector('#rvmRegionSave').onclick = function() {
      var name = (modalEl.querySelector('#rvmRegionName').value || '').trim();
      if (!name) return alert('지역명을 입력하세요.');

      // 중복 체크
      var dup = (state.regionsMaster || []).find(function(r){
        return r.name === name && (!isEdit || r.id !== region.id);
      });
      if (dup) return alert('"' + name + '" 은 이미 있는 지역명입니다.');

      if (isEdit) {
        region.name = name;
      } else {
        var maxId = (state.regionsMaster || []).reduce(function(acc, r){ return Math.max(acc, r.id || 0); }, 0);
        state.regionsMaster.push({ id: maxId + 1, name: name });
      }
      closeModal();
      toast((isEdit ? '지역 수정됨: ' : '지역 추가됨: ') + name, 'success');
      render();
    };
  }

  /* ─── 지점 마스터 추가/수정 모달 ──────────────── */
  function openBranchMasterModal(branch) {
    var isEdit  = !!branch;
    var curRid  = branch ? branch.region_id : ((state.regionsMaster && state.regionsMaster[0]) ? state.regionsMaster[0].id : 1);
    var curName = branch ? branch.name : '';
    var curAct  = branch ? !!branch.is_active : true;
    var regOpts = (state.regionsMaster || []).map(function(r){ return '<option value="' + esc(r.id) + '"' + (r.id === curRid ? ' selected' : '') + '>' + esc(r.name) + '</option>'; }).join('');

    var html = '<h3 style="margin-top:0">' + (isEdit ? '지점 수정' : '지점 추가') + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">지역</label><select class="rvmAdmin-select" id="rvmBranchMasterRegionSel">' + regOpts + '</select></div>' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">지점명</label><input class="rvmAdmin-input" type="text" id="rvmBranchMasterName" value="' + esc(curName) + '" placeholder="예: 강남점"/></div>' +
      '<div class="rvmAdmin-col-12"><label class="rvmAdmin-switch" style="gap:10px;margin-top:6px"><input type="checkbox" id="rvmBranchMasterActive"' + (curAct ? ' checked' : '') + '/><span style="font-weight:900;color:var(--text2)">사용</span></label></div>' +
      '</div>' +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmBranchMasterSave">저장</button><button type="button" class="btn btn-ghost" id="rvmBranchMasterCancel">취소</button></div>';

    openModal(html);
    modalEl.querySelector('#rvmBranchMasterCancel').onclick = closeModal;
    modalEl.querySelector('#rvmBranchMasterSave').onclick = function() {
      var rid  = parseInt(modalEl.querySelector('#rvmBranchMasterRegionSel').value, 10);
      var name = (modalEl.querySelector('#rvmBranchMasterName').value || '').trim();
      var act  = !!modalEl.querySelector('#rvmBranchMasterActive').checked;
      if (!rid)  return alert('지역을 선택하세요.');
      if (!name) return alert('지점명을 입력하세요.');
      if (isEdit) {
        branch.region_id = rid; branch.name = name; branch.is_active = act;
      } else {
        var maxId = (state.branchesMaster || []).reduce(function(acc, b){ return Math.max(acc, b.id || 0); }, 0);
        state.branchesMaster.push({ id: maxId + 1, region_id: rid, name: name, is_active: act });
      }
      closeModal(); toast('지점 반영됨', 'success'); render();
    };
  }

  /* ─── 예약 상세 모달 ────────────────────────────── */
  function openBookingDetailModal(bookingId) {
    var bk = getBookings(state.instanceId).find(function(b){ return b.id === bookingId; });
    if (!bk) return;
    var br           = branchById(bk.branch_id) || {};
    var activeFields = getFields(state.instanceId).filter(function(f){ return !!f.is_active; });
    var statusOpts   = ['접수','확인','완료','취소'].map(function(s){ return '<option value="' + esc(s) + '"' + (bk.status === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
    var fieldRows    = activeFields.map(function(f){ return '<tr><td style="font-weight:900;min-width:160px">' + esc(f.label) + '</td><td>' + esc(dummyFieldValue(bk, f)) + '</td></tr>'; }).join('');

    var html = '<h3 style="margin-top:0">예약 상세</h3>' +
      '<div style="margin-bottom:10px;color:var(--text3);font-weight:800">예약번호: ' + esc(bk.no) + '</div>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-6"><div style="font-weight:900;color:var(--text2);margin-bottom:6px">지점</div><div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:#fbfcff;font-weight:900">' + esc(br.name || '-') + '</div></div>' +
      '<div class="rvmAdmin-col-6"><div style="font-weight:900;color:var(--text2);margin-bottom:6px">상태 변경</div><select class="rvmAdmin-select" id="rvmBkDetailStatus">' + statusOpts + '</select></div>' +
      '</div>' +
      (fieldRows ? '<div style="margin-top:12px" class="rvmAdmin-table-wrap"><table class="rvmAdmin-t"><thead><tr><th>필드</th><th>값</th></tr></thead><tbody>' + fieldRows + '</tbody></table></div>' : '') +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmBkDetailSave">상태 변경</button><button type="button" class="btn btn-ghost" id="rvmBkDetailClose">닫기</button></div>';

    openModal(html);
    modalEl.querySelector('#rvmBkDetailClose').onclick = closeModal;
    modalEl.querySelector('#rvmBkDetailSave').onclick = function() {
      bk.status = modalEl.querySelector('#rvmBkDetailStatus').value;
      closeModal(); toast('상태 변경: ' + bk.status, 'success'); render();
    };
  }

  /* ─── 초기화 (API 연동) ──────────────────────────── */
  function loadAll(cb) {
    var api = window.RvmApi;
    if (!api) {
      // rvm_api.js 미로드 시 더미 데이터로 폴백
      state.mode = 'list';
      try { if (typeof cb === 'function') { cb(); } else { render(); } } catch(e) { console.error(e); }
      return;
    }
    root.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text3)">불러오는 중…</div>';
    Promise.all([
      api.instanceList(),
      api.regionList(),
      api.branchList()
    ]).then(function(results) {
      var instR = results[0], regR = results[1], brR = results[2];
      state.instances      = (instR.instances || []).map(function(x){ return Object.assign({}, x, { is_active: !!parseInt(x.is_active, 10) }); });
      state.regionsMaster  = regR.regions  || [];
      state.branchesMaster = (brR.branches || []).map(function(x){ return Object.assign({}, x, { is_active: !!parseInt(x.is_active, 10) }); });
      if (state.instances.length) state.instanceId = state.instances[0].id;
      state.mode = 'list';
      try {
        if (typeof cb === 'function') { cb(); } else { render(); }
      } catch(e) {
        root.innerHTML = '<div class="rvmAdmin-card"><div class="rvmAdmin-card__body" style="color:#b91c1c;font-weight:900">UI 초기화 실패: ' + esc(e && e.message ? e.message : String(e)) + '</div></div>';
      }
    }).catch(function(e) {
      root.innerHTML = '<div class="rvmAdmin-card"><div class="rvmAdmin-card__body" style="color:#b91c1c;font-weight:900">데이터 로드 실패: ' + esc(e && e.message ? String(e.message) : String(e)) + '</div></div>';
    });
  }
  loadAll();

})();
