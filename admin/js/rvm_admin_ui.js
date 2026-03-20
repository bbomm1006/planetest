/* =========================================================
   예약관리 관리자 UI (RVM Admin UI)
   - 기능/DB 연동 없이 더미 데이터로 동작
   - 화면 구조/컴포넌트 흐름 확정 목적
========================================================= */

(function () {
  'use strict';

  var root = document.getElementById('rvmAdminRoot');
  if (!root) return; // 다른 페이지에서는 초기화하지 않음

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

  // --------------------------
  // Demo 데이터 (더미)
  // --------------------------
  var STEP_TYPES = [
    { key: 'branch', label: '지점' },
    { key: 'date', label: '날짜' },
    { key: 'time', label: '시간' },
    { key: 'item', label: '항목' },
    { key: 'info', label: '정보입력' },
  ];

  var FIELD_TYPES = ['text', 'phone', 'email', 'radio', 'checkbox', 'dropdown'];

  var demo = (function () {
    var instances = [
      { id: 1, name: '예약관리 1', slug: 'reservation-1', is_active: true, description: '기본 시나리오(더미) — 단계/필드/지점 연결 UI 확인용' },
      { id: 2, name: '예약관리 2', slug: 'reservation-2', is_active: true, description: '다른 구성 예시(더미) — 일정 캘린더/알림 UI 확인용' },
      { id: 3, name: '예약관리 3', slug: 'reservation-3', is_active: false, description: '미사용 예시(더미) — 목록/전환 버튼 UI 확인용' },
    ];

    var regions = [
      { id: 1, name: '서울' },
      { id: 2, name: '경기' },
      { id: 3, name: '부산' },
    ];

    var branches = [
      { id: 101, region_id: 1, name: '강남점', is_active: true },
      { id: 102, region_id: 1, name: '홍대점', is_active: true },
      { id: 201, region_id: 2, name: '분당점', is_active: true },
      { id: 202, region_id: 2, name: '수원점', is_active: false },
      { id: 301, region_id: 3, name: '해운대점', is_active: true },
    ];

    function baseSteps() {
      return [
        { step_key: 'branch', sort_order: 10, is_active: true },
        { step_key: 'date', sort_order: 20, is_active: true },
        { step_key: 'time', sort_order: 30, is_active: true },
        { step_key: 'info', sort_order: 40, is_active: true },
      ];
    }

    function altSteps() {
      return [
        { step_key: 'branch', sort_order: 10, is_active: true },
        { step_key: 'date', sort_order: 20, is_active: true },
        { step_key: 'item', sort_order: 30, is_active: true },
        { step_key: 'info', sort_order: 40, is_active: true },
      ];
    }

    function fieldsCommon() {
      return [
        { id: 1, field_type: 'text', name_key: 'customer_name', label: '이름', is_required: true, is_active: true, options: [] },
        { id: 2, field_type: 'phone', name_key: 'customer_phone', label: '전화번호', is_required: true, is_active: true, options: [] },
        { id: 3, field_type: 'email', name_key: 'customer_email', label: '이메일', is_required: false, is_active: true, options: [] },
        { id: 4, field_type: 'radio', name_key: 'visit_purpose', label: '방문 목적', is_required: false, is_active: true, options: ['상담', '시연', '기타'] },
        { id: 5, field_type: 'checkbox', name_key: 'agreements', label: '동의 항목', is_required: false, is_active: true, options: ['개인정보 수집', '이벤트 수신'] },
        { id: 6, field_type: 'dropdown', name_key: 'preferred_slot', label: '선호 시간(드롭다운)', is_required: false, is_active: true, options: ['오전', '오후', '상관없음'] },
      ];
    }

    function fieldsAlt() {
      var f = fieldsCommon();
      // 일부를 바꿔서 화면이 “다른 구성”처럼 보이게 함
      f[3] = { id: 7, field_type: 'dropdown', name_key: 'visit_type', label: '방문 유형', is_required: false, is_active: true, options: ['정기점검', '긴급수리', '기타'] };
      f.splice(4, 1);
      return f;
    }

    function calendarDefaultFor(instanceId) {
      // 현재/다음 달 기준으로 “일부 마감”이 보이도록 더미 생성
      var now = new Date();
      var y = now.getFullYear();
      var m = now.getMonth();

      var times = ['09:00', '10:00', '11:00', '14:00', '15:00'];

      function mkDate(year, monthIndex, day) {
        var dt = new Date(year, monthIndex, day);
        return dt.toISOString().slice(0, 10);
      }

      var map = {};
      var monthDays = new Date(y, m + 1, 0).getDate();
      for (var d = 1; d <= monthDays; d++) {
        var iso = mkDate(y, m, d);
        var closed = (d % 9 === 0) || (instanceId === 2 && d % 7 === 0);
        var baseCap = instanceId === 1 ? 4 : instanceId === 2 ? 3 : 2;
        map[iso] = {
          closed: closed,
          times: times.map(function (t, idx) {
            return { time: t, capacity: baseCap - (idx % 2), booked: closed ? baseCap : Math.max(0, (idx + d) % (baseCap + 1)) };
          })
        };
      }
      return map;
    }

    function bookingsFor(instanceId) {
      // 더미 접수 리스트
      var base = [
        { id: 9001, no: 'RVM-' + instanceId + '-0001', status: '접수', at: '2026-03-19 10:20', branch_id: 101, name: '김서준', phone: '010-1234-5678' },
        { id: 9002, no: 'RVM-' + instanceId + '-0002', status: '확인', at: '2026-03-19 13:00', branch_id: 102, name: '박지연', phone: '010-2222-3333' },
        { id: 9003, no: 'RVM-' + instanceId + '-0003', status: '완료', at: '2026-03-18 09:40', branch_id: 201, name: '이민호', phone: '010-7777-8888' },
        { id: 9004, no: 'RVM-' + instanceId + '-0004', status: '취소', at: '2026-03-17 16:10', branch_id: 301, name: '최유나', phone: '010-4444-5555' },
      ];
      if (instanceId === 3) {
        base = base.map(function (b, i) {
          return Object.assign({}, b, { id: b.id + 100, no: 'RVM-3-0' + (i + 1), status: i === 0 ? '접수' : b.status });
        });
      }
      return base;
    }

    function lookupSettingsDefault() {
      return { allow_by_reservation_no: true, allow_by_name_phone: true };
    }

    return {
      instances: instances,
      regions: regions,
      branches: branches,
      stepsByInstance: {
        1: baseSteps(),
        2: altSteps(),
        3: baseSteps().map(function (s, idx) { return Object.assign({}, s, { is_active: idx !== 2 }); }),
      },
      fieldsByInstance: {
        1: fieldsCommon(),
        2: fieldsAlt(),
        3: fieldsCommon().slice(0, 4),
      },
      branchAssignByInstance: {
        1: [101, 102, 201],
        2: [201, 301],
        3: [101],
      },
      calendarByInstance: {
        1: calendarDefaultFor(1),
        2: calendarDefaultFor(2),
        3: calendarDefaultFor(3),
      },
      notificationByInstance: {
        1: { use_email: true, use_sheet: false, use_alimtalk: true, email_list: 'admin1@example.com, admin2@example.com', sheet_webhook: '', alimtalk_webhook: '' },
        2: { use_email: false, use_sheet: true, use_alimtalk: false, email_list: 'ops@example.com', sheet_webhook: 'https://example.com/webhook-sheet', alimtalk_webhook: '' },
        3: { use_email: false, use_sheet: false, use_alimtalk: false, email_list: '', sheet_webhook: '', alimtalk_webhook: '' },
      },
      statusByInstance: {
        1: { current: '접수' },
        2: { current: '접수' },
        3: { current: '접수' },
      },
      bookingsByInstance: {
        1: bookingsFor(1),
        2: bookingsFor(2),
        3: bookingsFor(3),
      },
      lookupByInstance: {
        1: lookupSettingsDefault(),
        2: lookupSettingsDefault(),
        3: { allow_by_reservation_no: true, allow_by_name_phone: false },
      }
    };
  })();

  // --------------------------
  // Page State (로컬 더미)
  // --------------------------
  var state = {
    mode: 'list', // list | edit
    instanceId: 1,
    editTab: 'steps', // steps | fields | branches | calendar | notification | status | bookings | lookup
    instances: demo.instances.map(function (x) { return Object.assign({}, x); }),

    // config maps
    stepsByInstance: JSON.parse(JSON.stringify(demo.stepsByInstance)),
    fieldsByInstance: JSON.parse(JSON.stringify(demo.fieldsByInstance)),
    branchAssignByInstance: JSON.parse(JSON.stringify(demo.branchAssignByInstance)),
    calendarByInstance: JSON.parse(JSON.stringify(demo.calendarByInstance)),
    notificationByInstance: JSON.parse(JSON.stringify(demo.notificationByInstance)),
    statusByInstance: JSON.parse(JSON.stringify(demo.statusByInstance)),
    bookingsByInstance: JSON.parse(JSON.stringify(demo.bookingsByInstance)),
    lookupByInstance: JSON.parse(JSON.stringify(demo.lookupByInstance)),

    // modal-local
    nextFieldId: 1000,
    nextStepSeq: 100,
    monthCursor: new Date(), // 캘린더 표시용
    selectedDate: null,
    lastStatusPreview: null,
  };

  // ensure instances config exist (safety)
  function getInstance(id) {
    return state.instances.find(function (x) { return x.id === id; });
  }
  function getSteps(id) { return state.stepsByInstance[id] || []; }
  function getFields(id) { return state.fieldsByInstance[id] || []; }
  function getBranchAssign(id) { return state.branchAssignByInstance[id] || []; }
  function getCalendar(id) { return state.calendarByInstance[id] || {}; }
  function getNotification(id) { return state.notificationByInstance[id] || {}; }
  function getBookings(id) { return state.bookingsByInstance[id] || []; }
  function getLookup(id) { return state.lookupByInstance[id] || {}; }

  function branchById(id) {
    return demo.branches.find(function (b) { return b.id === id; });
  }
  function regionById(id) {
    return demo.regions.find(function (r) { return r.id === id; });
  }

  function statusLabel(s) {
    return s;
  }

  function stepLabel(stepKey) {
    var t = STEP_TYPES.find(function (x) { return x.key === stepKey; });
    return t ? t.label : stepKey;
  }

  function fieldTypeLabel(t) {
    return t;
  }

  // --------------------------
  // render helpers
  // --------------------------
  function setModeList() {
    state.mode = 'list';
    state.editTab = 'steps';
    render();
  }

  function setModeEdit(instanceId) {
    state.mode = 'edit';
    state.instanceId = instanceId;
    state.editTab = 'steps';
    state.selectedDate = null;
    render();
  }

  function createNewInstance() {
    var newId = Math.max.apply(
      null,
      state.instances.map(function (x) { return x.id; }).concat([0])
    ) + 1;

    state.instances.unshift({
      id: newId,
      name: '예약관리 ' + newId,
      slug: 'reservation-' + newId,
      is_active: true,
      description: ''
    });

    // minimal starter config
    state.stepsByInstance[newId] = [
      { step_key: 'branch', sort_order: 10, is_active: true },
      { step_key: 'date', sort_order: 20, is_active: true },
      { step_key: 'time', sort_order: 30, is_active: true },
      { step_key: 'info', sort_order: 40, is_active: true },
    ];
    state.fieldsByInstance[newId] = [
      { id: state.nextFieldId++, field_type: 'text', name_key: 'customer_name', label: '이름', is_required: true, is_active: true, options: [] },
      { id: state.nextFieldId++, field_type: 'phone', name_key: 'customer_phone', label: '전화번호', is_required: true, is_active: true, options: [] },
    ];
    state.branchAssignByInstance[newId] = [demo.branches[0] ? demo.branches[0].id : 101];
    state.calendarByInstance[newId] = {};
    state.notificationByInstance[newId] = { use_email: true, use_sheet: false, use_alimtalk: false, email_list: 'admin@example.com', sheet_webhook: '', alimtalk_webhook: '' };
    state.statusByInstance[newId] = { current: '접수' };
    state.bookingsByInstance[newId] = [];
    state.lookupByInstance[newId] = { allow_by_reservation_no: true, allow_by_name_phone: true };

    state.instanceId = newId;
    state.mode = 'edit';
    state.editTab = 'steps';
    render();
    toast('새 예약 테이블(더미) 생성됨', 'success');
  }

  function instanceUsagePill(isActive) {
    if (isActive) return '<span class="rvmAdmin-pill ok">사용</span>';
    return '<span class="rvmAdmin-pill bad">미사용</span>';
  }

  function render() {
    var instance = getInstance(state.instanceId);
    var tabsHtml = '';
    if (state.mode === 'edit') {
      var tabs = [
        { id: 'steps', label: '단계 구성' },
        { id: 'fields', label: '정보입력 필드' },
        { id: 'branches', label: '지점 관리' },
        { id: 'calendar', label: '날짜/시간/수량' },
        { id: 'notification', label: '알림 설정' },
        { id: 'status', label: '예약 상태 관리' },
        { id: 'bookings', label: '예약 접수 리스트' },
        { id: 'lookup', label: '예약 조회 설정' },
      ];
      tabsHtml = '<div class="rvmAdmin-tabs" role="tablist" aria-label="예약관리 설정 탭">' +
        tabs.map(function (t) {
          return '<button type="button" class="rvmAdmin-tab ' + (state.editTab === t.id ? 'on' : '') + '" data-tab="' + esc(t.id) + '" role="tab" aria-selected="' + (state.editTab === t.id ? 'true' : 'false') + '">' +
            esc(t.label) +
            '</button>';
        }).join('') +
        '</div>';
    }

    var mainHtml = '';
    if (state.mode === 'list') {
      mainHtml = renderInstanceList();
    } else {
      mainHtml = renderInstanceEdit(instance);
      mainHtml += tabsHtml;
      mainHtml += renderEditTab(instance);
    }

    root.innerHTML = mainHtml;
    wireUi();
  }

  function renderInstanceList() {
    var rows = state.instances.map(function (ins) {
      return '<tr>' +
        '<td style="font-weight:900">' + esc(ins.name) + '</td>' +
        '<td>' +
        '<label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmSwitch" data-inst="' + esc(ins.id) + '" ' + (ins.is_active ? 'checked' : '') + '><span style="font-weight:800;color:var(--text2)">' + (ins.is_active ? '사용' : '미사용') + '</span></label>' +
        '</td>' +
        '<td>' + instanceUsagePill(ins.is_active) + '</td>' +
        '<td style="width:220px">' +
        '<div class="rvmAdmin-btn-row">' +
        '<button type="button" class="btn btn-sm btn-outline" data-action="edit" data-inst="' + esc(ins.id) + '">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-action="del" data-inst="' + esc(ins.id) + '">삭제</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="4" style="color:var(--text3);padding:18px 8px">예약 테이블 더미가 없습니다.</td></tr>';

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 테이블 목록</h3><p>예약관리 1/2/3처럼 “테이블(인스턴스)” 단위 설정 UI입니다.</p></div>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<button type="button" class="btn btn-primary" data-action="create">➕ 추가</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-table-wrap">' +
      '<table class="rvmAdmin-t">' +
      '<thead><tr><th>예약명</th><th>사용 여부(스위치)</th><th>사용 표시</th><th>관리</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderInstanceEdit(instance) {
    instance = instance || getInstance(state.instanceId);
    var title = instance ? instance.name : '';
    var desc = instance ? instance.description || '' : '';
    var active = instance ? !!instance.is_active : true;

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div>' +
      '<h3>예약 테이블 생성/수정</h3>' +
      '<p>아래는 저장/DB 연동 없이 “UI 입력 구조”만 제공합니다.</p>' +
      '</div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-ghost" data-action="back">목록</button>' +
      '<button type="button" class="btn btn-outline" data-action="dummy-save">저장(더미)</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-6">' +
      '<div class="rvmAdmin-form-row">' +
      '<label>예약명</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvm-edit-name" value="' + esc(title) + '"/>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<div class="rvmAdmin-form-row">' +
      '<label>사용 여부</label>' +
      '<div class="rvmAdmin-switch">' +
      '<input type="checkbox" id="rvm-edit-active" ' + (active ? 'checked' : '') + ' />' +
      '<span style="font-weight:900">' + (active ? '사용' : '미사용') + '</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-12">' +
      '<div class="rvmAdmin-form-row" style="align-items:flex-start">' +
      '<label style="padding-top:10px">설명</label>' +
      '<textarea class="rvmAdmin-textarea" id="rvm-edit-desc">' + esc(desc) + '</textarea>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderEditTab(instance) {
    if (state.editTab === 'steps') return renderStepsTab(instance);
    if (state.editTab === 'fields') return renderFieldsTab(instance);
    if (state.editTab === 'branches') return renderBranchesTab(instance);
    if (state.editTab === 'calendar') return renderCalendarTab(instance);
    if (state.editTab === 'notification') return renderNotificationTab(instance);
    if (state.editTab === 'status') return renderStatusTab(instance);
    if (state.editTab === 'bookings') return renderBookingsTab(instance);
    if (state.editTab === 'lookup') return renderLookupTab(instance);
    return '';
  }

  function renderStepsTab() {
    var steps = getSteps(state.instanceId).slice().sort(function (a, b) { return a.sort_order - b.sort_order; });

    function stepRowHtml(step, idx) {
      var label = stepLabel(step.step_key);
      var isOn = !!step.is_active;
      return '<li class="rvmAdmin-step-item" data-step-index="' + idx + '" draggable="true" data-step-idx="' + esc(idx) + '">' +
        '<div class="rvmAdmin-step-left">' +
        '<div class="grab">⠿</div>' +
        '<div style="min-width:0;flex:1">' +
        '<div class="title">' + esc(label) + '</div>' +
        '<div class="sub">sort: ' + esc(step.sort_order) + ' · key: ' + esc(step.step_key) + '</div>' +
        '</div>' +
        '<div class="rvmAdmin-pill ' + (isOn ? 'ok' : 'bad') + '">' + (isOn ? '활성' : '비활성') + '</div>' +
        '</div>' +
        '<div class="rvmAdmin-btn-row">' +
        '<label class="rvmAdmin-switch" style="gap:8px">' +
        '<input type="checkbox" class="rvmStepActive" data-idx="' + esc(idx) + '"' + (isOn ? 'checked' : '') + '/>' +
        '<span style="font-weight:900;color:var(--text2)">활성</span>' +
        '</label>' +
        '<button type="button" class="btn btn-sm btn-outline rvmStepUp" data-idx="' + esc(idx) + '">↑</button>' +
        '<button type="button" class="btn btn-sm btn-outline rvmStepDown" data-idx="' + esc(idx) + '">↓</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmStepDel" data-idx="' + esc(idx) + '">삭제</button>' +
        '</div>' +
        '</li>';
    }

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>단계 구성 UI</h3><p>지점/날짜/시간/항목/정보입력 단계 추가/삭제 및 순서 변경(더미)</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-primary" data-action="step-add">단계 추가</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<ul class="rvmAdmin-steps-ul" id="rvmStepsUl">' + steps.map(stepRowHtml).join('') + '</ul>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderFieldsTab() {
    var fields = getFields(state.instanceId);
    var rows = fields.slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); }).map(function (f) {
      var opts = (f.options || []);
      var optSummary = (f.field_type === 'radio' || f.field_type === 'checkbox' || f.field_type === 'dropdown') ? (opts.length ? (opts.length + '개 옵션') : '옵션 없음') : '-';
      var req = !!f.is_required;
      var act = !!f.is_active;
      return '<tr>' +
        '<td style="min-width:120px">' + esc(fieldTypeLabel(f.field_type)) + '</td>' +
        '<td style="min-width:160px">' + esc(f.name_key) + '</td>' +
        '<td style="min-width:200px">' + esc(f.label) + '<br><span style="color:var(--text3);font-size:.82rem">옵션: ' + esc(optSummary) + '</span></td>' +
        '<td><span class="rvmAdmin-pill ' + (req ? 'ok' : '') + '">' + (req ? '필수' : '선택') + '</span></td>' +
        '<td><span class="rvmAdmin-pill ' + (act ? 'ok' : 'bad') + '">' + (act ? '활성' : '비활성') + '</span></td>' +
        '<td style="width:210px">' +
        '<div class="rvmAdmin-btn-row">' +
        '<button type="button" class="btn btn-sm btn-outline rvmFieldEdit" data-id="' + esc(f.id) + '">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmFieldDel" data-id="' + esc(f.id) + '">삭제</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    }).join('');

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>정보입력 필드 관리 UI</h3><p>필드 타입(텍스트/전화번호/이메일/라디오/체크박스/드롭다운) 추가/삭제 및 옵션/필수 여부 구성</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-primary" data-action="field-add">필드 추가</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-table-wrap">' +
      '<table class="rvmAdmin-t" style="min-width:940px">' +
      '<thead><tr><th>타입</th><th>키(name_key)</th><th>라벨 / 옵션</th><th>필수 여부</th><th>활성 여부</th><th>관리</th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="6" style="color:var(--text3);padding:18px 8px">더미 필드가 없습니다.</td></tr>') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderBranchesTab() {
    var assigned = getBranchAssign(state.instanceId);
    var assignedSet = {};
    (assigned || []).forEach(function (id) { assignedSet[id] = true; });

    var branchesSorted = demo.branches.slice().sort(function (a, b) {
      if (a.region_id !== b.region_id) return a.region_id - b.region_id;
      return a.id - b.id;
    });

    var regionGroups = {};
    branchesSorted.forEach(function (b) {
      if (!regionGroups[b.region_id]) regionGroups[b.region_id] = [];
      regionGroups[b.region_id].push(b);
    });

    var html = '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>지점 관리 UI</h3><p>지역/지점(사용 여부) + 예약 테이블별 연결 상태(더미)</p></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">';

    Object.keys(regionGroups).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (rid) {
      var r = regionById(parseInt(rid, 10)) || { name: '미정' };
      html += '<div style="margin-bottom:16px">' +
        '<div style="margin-bottom:10px;font-weight:900;color:var(--text2)">' + esc(r.name) + '</div>' +
        '<div class="rvmAdmin-table-wrap">' +
        '<table class="rvmAdmin-t" style="min-width:620px">' +
        '<thead><tr><th>지점명</th><th>사용 여부</th><th>예약 테이블 연결</th></tr></thead>' +
        '<tbody>' +
        regionGroups[rid].map(function (b) {
          var on = !!b.is_active;
          var conn = !!assignedSet[b.id];
          return '<tr>' +
            '<td style="font-weight:900">' + esc(b.name) + '</td>' +
            '<td>' +
            '<label class="rvmAdmin-switch" style="gap:8px">' +
            '<input type="checkbox" class="rvmBranchActive" data-branch="' + esc(b.id) + '"' + (on ? 'checked' : '') + ' />' +
            '<span style="font-weight:900;color:var(--text2)">' + (on ? '사용' : '미사용') + '</span>' +
            '</label>' +
            '</td>' +
            '<td>' +
            '<label class="rvmAdmin-switch" style="gap:8px">' +
            '<input type="checkbox" class="rvmBranchConn" data-branch="' + esc(b.id) + '"' + (conn ? 'checked' : '') + ' />' +
            '<span style="font-weight:900;color:var(--text2)">' + (conn ? '연결됨' : '미연결') + '</span>' +
            '</label>' +
            '</td>' +
            '</tr>';
        }).join('') +
        '</tbody></table></div></div>';
    });

    html += '</div></div></div>';
    return html;
  }

  function defaultTimes() {
    return ['09:00', '10:00', '11:00', '14:00', '15:00'];
  }

  function formatISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  function renderCalendarTab() {
    var instId = state.instanceId;
    var calMap = getCalendar(instId);

    var cur = state.monthCursor instanceof Date ? state.monthCursor : new Date();
    var year = cur.getFullYear();
    var monthIndex = cur.getMonth();

    function daysInMonth(y, m) {
      return new Date(y, m + 1, 0).getDate();
    }

    function firstDow(y, m) {
      // 0=일요일
      return new Date(y, m, 1).getDay();
    }

    var dayCount = daysInMonth(year, monthIndex);
    var leading = firstDow(year, monthIndex);

    var selected = state.selectedDate || null;
    if (selected && !calMap[selected]) {
      // 없으면 기본 생성
      ensureDateInCalendar(instId, selected);
    }

    var totalCells = Math.ceil((leading + dayCount) / 7) * 7;
    var monthTitle = year + '년 ' + (monthIndex + 1) + '월';

    function ensureDateInCalendar(instanceId, iso) {
      var m = getCalendar(instanceId);
      if (m[iso]) return;
      // 기본: 일부 날짜 마감 표시 + 슬롯 용량 랜덤처럼 보이게
      var seed = iso.split('-').reduce(function (acc, part) { return acc + parseInt(part, 10); }, 0);
      var closed = seed % 11 === 0;
      var baseCap = instanceId === 1 ? 4 : instanceId === 2 ? 3 : 2;
      m[iso] = {
        closed: closed,
        times: defaultTimes().map(function (t, idx) {
          return { time: t, capacity: baseCap - (idx % 2), booked: closed ? baseCap : (seed + idx) % (baseCap + 1) };
        })
      };
    }

    // prefill month dates to display closure badges
    for (var d = 1; d <= dayCount; d++) {
      var iso = new Date(year, monthIndex, d).toISOString().slice(0, 10);
      ensureDateInCalendar(instId, iso);
    }

    var DOW = ['일', '월', '화', '수', '목', '금', '토'];
    var dowHtml = '<div class="rvmAdmin-dow">' + DOW.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>';

    function calCell(iso, dayNum) {
      var data = calMap[iso] || {};
      var closed = !!data.closed;
      var on = selected === iso;
      var badgeText = closed ? '마감' : '가능';
      var cls = 'rvmAdmin-cal-day' + (dayNum ? '' : ' muted') + (on ? ' on' : '') + (closed ? ' closed' : '');
      return '<button type="button" class="' + esc(cls) + '" data-iso="' + esc(iso) + '" ' + (dayNum ? '' : 'disabled') + '>' +
        '<div class="num">' + (dayNum || '') + '</div>' +
        '<div class="badge">' + esc(badgeText) + '</div>' +
        '</button>';
    }

    var cellsHtml = '';
    for (var i = 0; i < totalCells; i++) {
      var dayIndex = i - leading + 1;
      if (dayIndex < 1 || dayIndex > dayCount) {
        cellsHtml += '<div style="height:56px"></div>';
        continue;
      }
      var iso = new Date(year, monthIndex, dayIndex).toISOString().slice(0, 10);
      cellsHtml += calCell(iso, dayIndex);
    }

    // right panel data
    var selectedIso = selected;
    if (!selectedIso) {
      selectedIso = new Date(year, monthIndex, 1).toISOString().slice(0, 10);
      state.selectedDate = selectedIso;
    }
    ensureDateInCalendar(instId, selectedIso);

    var selData = calMap[selectedIso];
    var times = selData.times || [];
    var closed = !!selData.closed;

    var rightTimesRows = times.map(function (t, idx) {
      var rem = Math.max(0, (parseInt(t.capacity, 10) || 0) - (parseInt(t.booked, 10) || 0));
      return '<tr>' +
        '<td style="width:160px;font-weight:900">' + esc(t.time) + '</td>' +
        '<td>' +
        '<span style="color:var(--text3);font-weight:800">' + esc(t.booked) + '</span> / ' + esc(t.capacity) +
        '</td>' +
        '<td style="width:220px">' +
        '<input type="number" class="rvmTimeCap" data-idx="' + esc(idx) + '" value="' + esc(t.capacity) + '" min="0" ' + (closed ? 'disabled' : '') + ' style="width:120px;padding:8px 10px;border:1px solid var(--border);border-radius:10px"/>' +
        '</td>' +
        '<td style="width:170px">' +
        '<span class="rvmAdmin-pill ' + (rem > 0 ? 'ok' : 'bad') + '">잔여 ' + esc(rem) + '</span>' +
        '</td>' +
        '</tr>';
    }).join('');

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>날짜/시간/수량 설정 UI</h3><p>캘린더에서 날짜 선택 → 시간대별 수량/예약가능-마감 표시(더미)</p></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-calendar">' +
      '<div class="rvmAdmin-calendar-left">' +
      '<div class="rvmAdmin-month-head">' +
      '<div class="month-title">' + esc(monthTitle) + '</div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-sm btn-outline" data-action="cal-prev">◀</button>' +
      '<button type="button" class="btn btn-sm btn-outline" data-action="cal-next">▶</button>' +
      '</div>' +
      '</div>' +
      '<div>' + dowHtml + '</div>' +
      '<div class="rvmAdmin-cal-grid" aria-label="캘린더">' + cellsHtml + '</div>' +
      '</div>' +
      '<div class="rvmAdmin-calendar-right">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">' +
      '<div>' +
      '<div style="font-weight:900;font-size:1.02rem">' + esc(selectedIso) + '</div>' +
      '<div style="color:var(--text3);font-size:.85rem;font-weight:800">예약 가능/마감 상태는 UI용입니다.</div>' +
      '</div>' +
      '<div class="rvmAdmin-actions">' +
      '<label class="rvmAdmin-switch" style="gap:8px">' +
      '<input type="checkbox" class="rvmDateClosed" ' + (closed ? 'checked' : '') + ' />' +
      '<span style="font-weight:900;color:var(--text2)">' + (closed ? '마감' : '예약가능') + '</span>' +
      '</label>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-table-wrap">' +
      '<table class="rvmAdmin-t" style="min-width:560px">' +
      '<thead><tr><th>시간</th><th>예약/정원</th><th>정원 입력(수량)</th><th>예약 가능 여부</th></tr></thead>' +
      '<tbody>' + rightTimesRows + '</tbody>' +
      '</table>' +
      '</div>' +
      '<div style="margin-top:10px;color:var(--text3);font-size:.85rem;font-weight:800">' +
      '※ 실제 계산/차감/저장은 없습니다. 입력만 UI에 반영됩니다.' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderNotificationTab() {
    var n = getNotification(state.instanceId);
    var useEmail = !!n.use_email;
    var useSheet = !!n.use_sheet;
    var useAlim = !!n.use_alimtalk;
    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>알림 설정 UI</h3><p>관리자 알림 방식 선택(이메일/구글 스프레드시트/알림톡) — 발송 기능 없음</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-outline" data-action="dummy-save">저장(더미)</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-12">' +
      '<div style="display:flex;gap:18px;flex-wrap:wrap">' +
      '<label class="rvmAdmin-switch" style="gap:8px">' +
      '<input type="checkbox" class="rvmNotiUse" data-key="use_email" ' + (useEmail ? 'checked' : '') + '/><span style="font-weight:900;color:var(--text2)">이메일</span>' +
      '</label>' +
      '<label class="rvmAdmin-switch" style="gap:8px">' +
      '<input type="checkbox" class="rvmNotiUse" data-key="use_sheet" ' + (useSheet ? 'checked' : '') + '/><span style="font-weight:900;color:var(--text2)">구글 스프레드시트</span>' +
      '</label>' +
      '<label class="rvmAdmin-switch" style="gap:8px">' +
      '<input type="checkbox" class="rvmNotiUse" data-key="use_alimtalk" ' + (useAlim ? 'checked' : '') + '/><span style="font-weight:900;color:var(--text2)">알림톡</span>' +
      '</label>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-12">' +
      '<div style="margin-top:12px;display:grid;grid-template-columns:1fr;gap:12px">' +
      '<div>' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">이메일 다중 입력(쉼표로 구분)</label>' +
      '<textarea class="rvmAdmin-textarea" id="rvmNotiEmails" ' + (!useEmail ? 'disabled' : '') + ' style="min-height:90px">' + esc(n.email_list || '') + '</textarea>' +
      '</div>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-6">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">구글 스프레드시트 웹훅(더미)</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmNotiSheet" placeholder="https://..." ' + (!useSheet ? 'disabled' : '') + ' value="' + esc(n.sheet_webhook || '') + '" />' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">알림톡 웹훅(더미)</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmNotiAlim" placeholder="https://..." ' + (!useAlim ? 'disabled' : '') + ' value="' + esc(n.alimtalk_webhook || '') + '" />' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderStatusTab() {
    // “상태 변경 셀렉트박스/버튼 UI”를 보여주기 위한 더미 프리뷰
    var cur = (getNotification ? null : null); // keep eslint-like? not needed
    var s = getNotification; // no-op to avoid minifier? (kept as plain)
    var currentStatus = state.statusByInstance[state.instanceId] && state.statusByInstance[state.instanceId].current ? state.statusByInstance[state.instanceId].current : '접수';

    var options = ['접수', '확인', '완료', '취소'].map(function (st) {
      return '<option value="' + esc(st) + '"' + (st === currentStatus ? 'selected' : '') + '>' + esc(st) + '</option>';
    }).join('');

    var preview = state.lastStatusPreview || currentStatus;

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 상태 관리 UI</h3><p>접수/확인/완료/취소 상태값 표시 + 상태 변경(더미) UI</p></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-6">' +
      '<div style="margin-bottom:10px;font-weight:900;color:var(--text2)">' +
      '상태값(표시)' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      ['접수', '확인', '완료', '취소'].map(function (st) {
        var cls = st === '취소' ? 'bad' : st === '완료' ? 'ok' : st === '확인' ? 'warn' : '';
        return '<span class="rvmAdmin-pill ' + cls + '">' + esc(st) + '</span>';
      }).join('') +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<div style="margin-bottom:10px;font-weight:900;color:var(--text2)">' +
      '상태 변경 프리셋(로컬 UI)' +
      '</div>' +
      '<div class="rvmAdmin-form-row" style="margin-bottom:10px">' +
      '<label style="min-width:88px">현재</label>' +
      '<select class="rvmAdmin-select" id="rvmStatusCur">' + options + '</select>' +
      '</div>' +
      '<div class="rvmAdmin-form-row" style="margin-bottom:10px">' +
      '<label style="min-width:88px">다음</label>' +
      '<select class="rvmAdmin-select" id="rvmStatusNext">' + options + '</select>' +
      '</div>' +
      '<div class="rvmAdmin-btn-row">' +
      '<button type="button" class="btn btn-primary" data-action="status-preview">상태 변경(더미)</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-12" style="margin-top:10px">' +
      '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:#fbfcff">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:6px">프리뷰 결과</div>' +
      '<div style="color:var(--text3);font-weight:800">' + esc(preview) + '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderBookingsTab() {
    var bookings = getBookings(state.instanceId);
    var branches = demo.branches;

    var branchOptions = '<option value="0">전체</option>' + branches.map(function (b) {
      return '<option value="' + esc(b.id) + '">' + esc(b.name) + '</option>';
    }).join('');

    var rows = bookings.slice().map(function (bk) {
      return '<tr>' +
        '<td style="font-weight:900">' + esc(bk.no) + '</td>' +
        '<td>' + esc(bk.status) + '</td>' +
        '<td>' + esc(bk.at) + '</td>' +
        '<td>' + esc((branchById(bk.branch_id) || {}).name || '-') + '</td>' +
        '<td>' + esc(bk.name) + '</td>' +
        '<td>' + esc(bk.phone) + '</td>' +
        '<td>' +
        '<div class="rvmAdmin-actions">' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkDetail" data-bid="' + esc(bk.id) + '">상세보기</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    }).join('');

    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 접수 리스트 UI</h3><p>검색/필터 + 리스트 테이블 + 엑셀 다운로드 버튼(더미) + 상세보기 UI</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-success" data-action="bk-export">📥 엑셀 다운로드</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-grid" style="align-items:end">' +
      '<div class="rvmAdmin-col-4">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.86rem;display:block;margin-bottom:6px">검색(예약번호/이름/전화)</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmBkQ" placeholder="예: RVM-1-0001" />' +
      '</div>' +
      '<div class="rvmAdmin-col-3">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.86rem;display:block;margin-bottom:6px">상태</label>' +
      '<select class="rvmAdmin-select" id="rvmBkStatus"><option value="">전체</option>' +
      ['접수', '확인', '완료', '취소'].map(function (st) { return '<option value="' + esc(st) + '">' + esc(st) + '</option>'; }).join('') +
      '</select>' +
      '</div>' +
      '<div class="rvmAdmin-col-5">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.86rem;display:block;margin-bottom:6px">지점</label>' +
      '<select class="rvmAdmin-select" id="rvmBkBranch">' + branchOptions + '</select>' +
      '</div>' +
      '<div class="rvmAdmin-col-12">' +
      '<div class="rvmAdmin-btn-row" style="justify-content:flex-start">' +
      '<button type="button" class="btn btn-outline" data-action="bk-search">🔍 검색</button>' +
      '<button type="button" class="btn btn-ghost" data-action="bk-reset">초기화</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:14px" class="rvmAdmin-table-wrap">' +
      '<table class="rvmAdmin-t" style="min-width:1020px">' +
      '<thead><tr>' +
      '<th>예약번호</th><th>상태</th><th>일시</th><th>지점</th><th>예약자</th><th>연락처</th><th>관리</th>' +
      '</tr></thead>' +
      '<tbody id="rvmBkBody">' + (rows || '<tr><td colspan="7" style="color:var(--text3);padding:18px 8px">데이터 없음(더미)</td></tr>') + '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderLookupTab() {
    var l = getLookup(state.instanceId);
    var allowNo = !!l.allow_by_reservation_no;
    var allowNamePhone = !!l.allow_by_name_phone;
    return '<div class="rvmAdmin__section">' +
      '<div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 조회 설정 UI</h3><p>예약번호 조회 / 이름+전화번호 조회 관련 “설정용” UI(더미)</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-outline" data-action="dummy-save">저장(더미)</button>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-6">' +
      '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:#fbfcff">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:10px">예약번호 조회</div>' +
      '<label class="rvmAdmin-switch" style="gap:10px">' +
      '<input type="checkbox" id="rvmLookupNo" ' + (allowNo ? 'checked' : '') + ' />' +
      '<span style="font-weight:900;color:var(--text2)">예약번호 조회 허용</span>' +
      '</label>' +
      '<div style="margin-top:10px;color:var(--text3);font-weight:800;font-size:.85rem">관리자가 예약번호를 입력해 즉시 상세를 보여주는 흐름(더미)</div>' +
      '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:#fbfcff">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:10px">이름+전화번호 조회</div>' +
      '<label class="rvmAdmin-switch" style="gap:10px">' +
      '<input type="checkbox" id="rvmLookupNamePhone" ' + (allowNamePhone ? 'checked' : '') + ' />' +
      '<span style="font-weight:900;color:var(--text2)">이름/전화 조합 조회 허용</span>' +
      '</label>' +
      '<div style="margin-top:10px;color:var(--text3);font-weight:800;font-size:.85rem">이름과 전화번호를 함께 입력해야 조회되게 할 구조(더미)</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  // --------------------------
  // Event binding
  // --------------------------
  var drag = { fromIdx: null };

  function wireUi() {
    // tabs
    root.querySelectorAll('.rvmAdmin-tab[data-tab]').forEach(function (b) {
      b.onclick = function () {
        state.editTab = b.getAttribute('data-tab');
        render();
      };
    });

    // top header create
    var btnCreate = document.getElementById('rvmAdmin__openCreate');
    if (btnCreate && !btnCreate._rvmWired) {
      btnCreate._rvmWired = true;
      btnCreate.onclick = function () { createNewInstance(); };
    }

    // list mode controls + common buttons
    root.querySelectorAll('[data-action]').forEach(function (el) {
      var act = el.getAttribute('data-action');
      if (!act) return;
      if (el._rvmWired) return;
      el._rvmWired = true;

      if (act === 'create') el.onclick = function () { createNewInstance(); };
      if (act === 'back') el.onclick = function () { setModeList(); };
      if (act === 'dummy-save') el.onclick = function () {
        // 인스턴스 기본 값(더미) 반영
        if (state.mode === 'edit') {
          var nm = document.getElementById('rvm-edit-name');
          var ac = document.getElementById('rvm-edit-active');
          var ds = document.getElementById('rvm-edit-desc');
          if (nm && ac && ds) {
            var inst = getInstance(state.instanceId);
            if (inst) {
              inst.name = nm.value.trim() || inst.name;
              inst.is_active = !!ac.checked;
              inst.description = ds.value || '';
            }
          }

          // 알림(더미) 입력 동기화
          var n = getNotification(state.instanceId);
          var emailsEl = document.getElementById('rvmNotiEmails');
          var sheetEl = document.getElementById('rvmNotiSheet');
          var alimEl = document.getElementById('rvmNotiAlim');
          if (emailsEl && typeof emailsEl.value === 'string') n.email_list = emailsEl.value;
          if (sheetEl && typeof sheetEl.value === 'string') n.sheet_webhook = sheetEl.value;
          if (alimEl && typeof alimEl.value === 'string') n.alimtalk_webhook = alimEl.value;

          // 조회설정(더미) 입력 동기화
          var l = getLookup(state.instanceId);
          var allowNoEl = document.getElementById('rvmLookupNo');
          var allowNamePhoneEl = document.getElementById('rvmLookupNamePhone');
          if (allowNoEl) l.allow_by_reservation_no = !!allowNoEl.checked;
          if (allowNamePhoneEl) l.allow_by_name_phone = !!allowNamePhoneEl.checked;
        }
        toast('저장(더미) 처리됨', 'success');
        render();
      };

      if (act === 'step-add') el.onclick = function () { openStepModal(null); };
      if (act === 'field-add') el.onclick = function () { openFieldModal(null); };
      if (act === 'bk-export') el.onclick = function () { toast('엑셀 다운로드(더미) - 실제 파일 생성 없음', 'warning'); };
      if (act === 'bk-search') el.onclick = function () { filterAndRenderBookings(); };
      if (act === 'bk-reset') el.onclick = function () { resetBookingsFilters(); render(); };
      if (act === 'cal-prev') el.onclick = function () { moveCalendar(-1); };
      if (act === 'cal-next') el.onclick = function () { moveCalendar(1); };
      if (act === 'status-preview') el.onclick = function () {
        var cur = document.getElementById('rvmStatusCur');
        var next = document.getElementById('rvmStatusNext');
        if (!cur || !next) return;
        state.lastStatusPreview = next.value;
        toast('상태 변경 프리뷰(로컬) : ' + next.value, 'success');
        render();
      };
    });

    // instance table actions
    root.querySelectorAll('button[data-action]').forEach(function (b) {
      // already wired via above loop
    });

    // list row: delete/edit + switch
    root.querySelectorAll('input.rvmSwitch[data-inst]').forEach(function (cb) {
      if (cb._rvmWired) return;
      cb._rvmWired = true;
      cb.onchange = function () {
        var id = parseInt(cb.getAttribute('data-inst'), 10);
        var inst = getInstance(id);
        if (inst) inst.is_active = !!cb.checked;
        render();
      };
    });

    root.querySelectorAll('button[data-action="edit"][data-inst]').forEach(function (btn) {
      if (btn._rvmWired) return;
      btn._rvmWired = true;
      btn.onclick = function () {
        var id = parseInt(btn.getAttribute('data-inst'), 10);
        setModeEdit(id);
      };
    });

    root.querySelectorAll('button[data-action="del"][data-inst]').forEach(function (btn) {
      if (btn._rvmWired) return;
      btn._rvmWired = true;
      btn.onclick = function () {
        var id = parseInt(btn.getAttribute('data-inst'), 10);
        if (!confirm('더미 예약 테이블(' + esc(getInstance(id)?.name || '') + ')을 삭제할까요?')) return;
        state.instances = state.instances.filter(function (x) { return x.id !== id; });
        delete state.stepsByInstance[id];
        delete state.fieldsByInstance[id];
        delete state.branchAssignByInstance[id];
        delete state.calendarByInstance[id];
        delete state.notificationByInstance[id];
        delete state.statusByInstance[id];
        delete state.bookingsByInstance[id];
        delete state.lookupByInstance[id];
        if (!state.instances.length) {
          state.instances = demo.instances.map(function (x) { return Object.assign({}, x); });
          state.mode = 'list';
        } else {
          state.instanceId = state.instances[0].id;
          state.mode = 'list';
        }
        toast('삭제됨(로컬 더미)', 'success');
        render();
      };
    });

    // step controls
    root.querySelectorAll('.rvmStepActive[data-idx]').forEach(function (cb) {
      cb.onchange = function () {
        var idx = parseInt(cb.getAttribute('data-idx'), 10);
        var steps = getSteps(state.instanceId).slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
        var picked = steps[idx];
        if (!picked) return;
        picked.is_active = !!cb.checked;
        // write back by matching step_key+sort_order order after sort
        // easier: rebuild array based on current sorted order but mapping by key+sort
        state.stepsByInstance[state.instanceId] = steps.map(function (s, i) {
          return Object.assign({}, s, { sort_order: (i + 1) * 10 });
        });
        render();
      };
    });

    root.querySelectorAll('.rvmStepUp[data-idx], .rvmStepDown[data-idx]').forEach(function (b) {
      b.onclick = function () {
        var idx = parseInt(b.getAttribute('data-idx'), 10);
        var steps = getSteps(state.instanceId).slice().sort(function (a, c) { return a.sort_order - c.sort_order; });
        var toIdx = idx;
        if (b.classList.contains('rvmStepUp')) toIdx = idx - 1;
        if (b.classList.contains('rvmStepDown')) toIdx = idx + 1;
        if (toIdx < 0 || toIdx >= steps.length) return;
        var t = steps[idx];
        steps[idx] = steps[toIdx];
        steps[toIdx] = t;
        state.stepsByInstance[state.instanceId] = steps.map(function (s, i) {
          return Object.assign({}, s, { sort_order: (i + 1) * 10 });
        });
        render();
      };
    });

    root.querySelectorAll('.rvmStepDel[data-idx]').forEach(function (b) {
      b.onclick = function () {
        var idx = parseInt(b.getAttribute('data-idx'), 10);
        var steps = getSteps(state.instanceId).slice().sort(function (a, c) { return a.sort_order - c.sort_order; });
        if (!steps[idx]) return;
        steps.splice(idx, 1);
        state.stepsByInstance[state.instanceId] = steps.map(function (s, i) {
          return Object.assign({}, s, { sort_order: (i + 1) * 10 });
        });
        toast('단계 삭제됨(로컬 더미)', 'success');
        render();
      };
    });

    // drag & drop reorder for steps
    root.querySelectorAll('.rvmAdmin-step-item[draggable="true"]').forEach(function (item) {
      item.addEventListener('dragstart', function () {
        var idx = parseInt(item.getAttribute('data-step-idx') || item.getAttribute('data-idx') || '0', 10);
        drag.fromIdx = idx;
      });
      item.addEventListener('dragover', function (e) { e.preventDefault(); });
      item.addEventListener('drop', function () {
        var to = parseInt(item.getAttribute('data-step-idx') || '0', 10);
        if (drag.fromIdx == null || drag.fromIdx === to) return;
        var steps = getSteps(state.instanceId).slice().sort(function (a, c) { return a.sort_order - c.sort_order; });
        if (!steps[drag.fromIdx] || !steps[to]) return;
        var t = steps[drag.fromIdx];
        steps[drag.fromIdx] = steps[to];
        steps[to] = t;
        state.stepsByInstance[state.instanceId] = steps.map(function (s, i) {
          return Object.assign({}, s, { sort_order: (i + 1) * 10 });
        });
        drag.fromIdx = null;
        toast('순서 변경(드래그, 로컬 더미)', 'success');
        render();
      });
    });

    // field actions
    root.querySelectorAll('.rvmFieldDel[data-id]').forEach(function (b) {
      if (b._rvmWired) return;
      b._rvmWired = true;
      b.onclick = function () {
        var id = parseInt(b.getAttribute('data-id'), 10);
        if (!confirm('필드 삭제(로컬 더미) ?')) return;
        var fields = getFields(state.instanceId).filter(function (f) { return f.id !== id; });
        state.fieldsByInstance[state.instanceId] = fields;
        toast('필드 삭제됨(로컬 더미)', 'success');
        render();
      };
    });

    root.querySelectorAll('.rvmFieldEdit[data-id]').forEach(function (b) {
      if (b._rvmWired) return;
      b._rvmWired = true;
      b.onclick = function () {
        var id = parseInt(b.getAttribute('data-id'), 10);
        var fields = getFields(state.instanceId);
        var f = fields.find(function (x) { return x.id === id; }) || null;
        openFieldModal(f);
      };
    });

    // branches toggles
    root.querySelectorAll('input.rvmBranchConn[data-branch]').forEach(function (cb) {
      if (cb._rvmWired) return;
      cb._rvmWired = true;
      cb.onchange = function () {
        var bid = parseInt(cb.getAttribute('data-branch'), 10);
        var list = getBranchAssign(state.instanceId).slice();
        var idx = list.indexOf(bid);
        if (cb.checked) {
          if (idx < 0) list.push(bid);
        } else {
          if (idx >= 0) list.splice(idx, 1);
        }
        state.branchAssignByInstance[state.instanceId] = list;
        toast('지점 연결(로컬 더미) 반영됨', 'success');
        render();
      };
    });

    // NOTE: branch master 'usage' toggle는 demo.branches에 반영하면 됨(로컬 UI 관점)
    root.querySelectorAll('input.rvmBranchActive[data-branch]').forEach(function (cb) {
      if (cb._rvmWired) return;
      cb._rvmWired = true;
      cb.onchange = function () {
        var bid = parseInt(cb.getAttribute('data-branch'), 10);
        var br = demo.branches.find(function (b) { return b.id === bid; });
        if (br) br.is_active = !!cb.checked;
        toast('지점 사용 여부(더미) 변경됨', 'success');
        render();
      };
    });

    // calendar interactions
    root.querySelectorAll('.rvmAdmin-cal-day[data-iso]').forEach(function (b) {
      b.onclick = function () {
        var iso = b.getAttribute('data-iso');
        state.selectedDate = iso;
        render();
      };
    });

    var dateClosed = document.querySelector('#rvm-edit-active'); // not for calendar
    var closeCb = root.querySelector('input.rvmDateClosed');
    if (closeCb && !closeCb._rvmWired) {
      closeCb._rvmWired = true;
      closeCb.onchange = function () {
        var iso = state.selectedDate;
        if (!iso) return;
        var m = getCalendar(state.instanceId);
        if (!m[iso]) return;
        m[iso].closed = !!closeCb.checked;
        // booked/capacity UI는 더미로 그대로 두되, disabled만 반영
        toast(closeCb.checked ? '해당일 마감 처리(로컬 더미)' : '해당일 예약가능(로컬 더미)', 'success');
        render();
      };
    }

    // time capacity inputs
    root.querySelectorAll('input.rvmTimeCap').forEach(function (inp) {
      inp.onchange = function () {
        var iso = state.selectedDate;
        var idx = parseInt(inp.getAttribute('data-idx'), 10);
        var m = getCalendar(state.instanceId);
        if (!m[iso] || !m[iso].times || !m[iso].times[idx]) return;
        m[iso].times[idx].capacity = parseInt(inp.value, 10) || 0;
        toast('정원(수량) UI 반영(로컬 더미)', 'success');
        render();
      };
    });

    // notification toggles
    root.querySelectorAll('input.rvmNotiUse[data-key]').forEach(function (cb) {
      cb.onchange = function () {
        var k = cb.getAttribute('data-key');
        var n = getNotification(state.instanceId);
        n[k] = !!cb.checked;
        // inputs disabled 상태 반영
        render();
      };
    });

    // notification input -> state 동기화(리렌더로 입력값 날아가는 것 방지)
    var notiEmails = root.querySelector('#rvmNotiEmails');
    if (notiEmails && !notiEmails._rvmWired) {
      notiEmails._rvmWired = true;
      notiEmails.oninput = function () {
        getNotification(state.instanceId).email_list = notiEmails.value;
      };
    }
    var notiSheet = root.querySelector('#rvmNotiSheet');
    if (notiSheet && !notiSheet._rvmWired) {
      notiSheet._rvmWired = true;
      notiSheet.oninput = function () {
        getNotification(state.instanceId).sheet_webhook = notiSheet.value;
      };
    }
    var notiAlim = root.querySelector('#rvmNotiAlim');
    if (notiAlim && !notiAlim._rvmWired) {
      notiAlim._rvmWired = true;
      notiAlim.oninput = function () {
        getNotification(state.instanceId).alimtalk_webhook = notiAlim.value;
      };
    }

    // lookup 탭 체크박스 -> state 동기화
    var lookupNo = root.querySelector('#rvmLookupNo');
    if (lookupNo && !lookupNo._rvmWired) {
      lookupNo._rvmWired = true;
      lookupNo.onchange = function () {
        getLookup(state.instanceId).allow_by_reservation_no = !!lookupNo.checked;
      };
    }
    var lookupNamePhone = root.querySelector('#rvmLookupNamePhone');
    if (lookupNamePhone && !lookupNamePhone._rvmWired) {
      lookupNamePhone._rvmWired = true;
      lookupNamePhone.onchange = function () {
        getLookup(state.instanceId).allow_by_name_phone = !!lookupNamePhone.checked;
      };
    }

    // status preview uses wired in [data-action=status-preview]

    // bookings filters
    // wired in renderBookingsTab buttons

    // booking detail modal
    root.querySelectorAll('button.rvmBkDetail[data-bid]').forEach(function (btn) {
      if (btn._rvmWired) return;
      btn._rvmWired = true;
      btn.onclick = function () {
        var bid = parseInt(btn.getAttribute('data-bid'), 10);
        openBookingDetailModal(bid);
      };
    });
  }

  function openStepModal(step) {
    var typeSel = FIELD_TYPES; // not used; just keep local variable? no

    var currentType = step ? step.step_key : 'branch';
    var currentActive = step ? !!step.is_active : true;

    var html = '';
    html += '<h3 style="margin-top:0">' + (step ? '단계 수정(더미)' : '단계 추가(더미)') + '</h3>';
    html += '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">단계 종류</label>' +
      '<select class="rvmAdmin-select" id="rvmStepType">' +
      STEP_TYPES.map(function (t) {
        return '<option value="' + esc(t.key) + '"' + (t.key === currentType ? 'selected' : '') + '>' + esc(t.label) + '</option>';
      }).join('') +
      '</select>' +
      '</div>' +
      '<div class="rvmAdmin-col-12">' +
      '<label class="rvmAdmin-switch" style="gap:10px;margin-top:8px">' +
      '<input type="checkbox" id="rvmStepActive" ' + (currentActive ? 'checked' : '') + ' />' +
      '<span style="font-weight:900;color:var(--text2)">활성 단계</span>' +
      '</label>' +
      '</div>' +
      '</div>';

    html += '<div style="margin-top:14px" class="rvmAdmin-btn-row">' +
      '<button type="button" class="btn btn-primary" id="rvmStepSave">저장(로컬 더미)</button>' +
      '<button type="button" class="btn btn-ghost" id="rvmStepCancel">취소</button>' +
      '</div>';

    openModal(html);

    var cancel = modalEl.querySelector('#rvmStepCancel');
    var save = modalEl.querySelector('#rvmStepSave');
    cancel.onclick = closeModal;
    save.onclick = function () {
      var type = modalEl.querySelector('#rvmStepType').value;
      var act = modalEl.querySelector('#rvmStepActive').checked;

      var steps = getSteps(state.instanceId);
      steps = steps.slice().sort(function (a, b) { return a.sort_order - b.sort_order; });

      if (step) {
        // 수정은 더미: step_key만 반영
        var idx = steps.findIndex(function (x) { return x.step_key === step.step_key && x.sort_order === step.sort_order; });
        if (idx < 0) idx = 0;
        steps[idx] = Object.assign({}, steps[idx], { step_key: type, is_active: act });
      } else {
        // 추가: 마지막에 append
        steps.push({ step_key: type, sort_order: (steps.length + 1) * 10, is_active: act });
      }

      state.stepsByInstance[state.instanceId] = steps.map(function (s, i) {
        return Object.assign({}, s, { sort_order: (i + 1) * 10 });
      });
      closeModal();
      toast('단계 반영(로컬 더미)', 'success');
      render();
    };
  }

  function openFieldModal(field) {
    var f = field || null;
    var currentType = f ? f.field_type : 'text';
    var currentKey = f ? f.name_key : '';
    var currentLabel = f ? f.label : '';
    var currentReq = f ? !!f.is_required : false;
    var currentAct = f ? !!f.is_active : true;
    var optionsArr = f && f.options ? f.options : [];

    function renderOptionsArea(type) {
      var need = type === 'radio' || type === 'checkbox' || type === 'dropdown';
      if (!need) return '<div style="color:var(--text3);font-weight:800;font-size:.85rem;margin-top:10px">선택형 타입이 아닙니다. 옵션 입력 없음</div>';
      var optStr = optionsArr.join('\n');
      return '<div style="margin-top:12px">' +
        '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">옵션 입력(1줄 1개)</label>' +
        '<textarea class="rvmAdmin-textarea" id="rvmFieldOpts" style="min-height:110px;resize:vertical">' + esc(optStr) + '</textarea>' +
        '<div style="color:var(--text3);font-weight:800;font-size:.85rem;margin-top:8px">더미: 라디오/체크박스/드롭다운에만 옵션이 필요합니다.</div>' +
        '</div>';
    }

    var html = '<h3 style="margin-top:0">' + (f ? '필드 수정(더미)' : '필드 추가(더미)') + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">필드 타입</label>' +
      '<select class="rvmAdmin-select" id="rvmFieldType">' +
      FIELD_TYPES.map(function (t) {
        return '<option value="' + esc(t) + '"' + (t === currentType ? 'selected' : '') + '>' + esc(t) + '</option>';
      }).join('') +
      '</select>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">name_key</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmFieldKey" value="' + esc(currentKey) + '" placeholder="예: customer_name" />' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">라벨</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmFieldLabel" value="' + esc(currentLabel) + '" placeholder="화면에 표시될 문구" />' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<label class="rvmAdmin-switch" style="gap:10px;margin-top:8px">' +
      '<input type="checkbox" id="rvmFieldReq" ' + (currentReq ? 'checked' : '') + ' />' +
      '<span style="font-weight:900;color:var(--text2)">필수</span>' +
      '</label>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<label class="rvmAdmin-switch" style="gap:10px;margin-top:8px">' +
      '<input type="checkbox" id="rvmFieldAct" ' + (currentAct ? 'checked' : '') + ' />' +
      '<span style="font-weight:900;color:var(--text2)">활성</span>' +
      '</label>' +
      '</div>' +
      '<div class="rvmAdmin-col-12" id="rvmFieldOptWrap">' + renderOptionsArea(currentType) + '</div>' +
      '</div>';

    html += '<div style="margin-top:14px" class="rvmAdmin-btn-row">' +
      '<button type="button" class="btn btn-primary" id="rvmFieldSave">저장(로컬 더미)</button>' +
      '<button type="button" class="btn btn-ghost" id="rvmFieldCancel">취소</button>' +
      '</div>';

    openModal(html);

    var typeSel = modalEl.querySelector('#rvmFieldType');
    var optWrap = modalEl.querySelector('#rvmFieldOptWrap');
    typeSel.onchange = function () {
      // optionsArr는 타입 변경 시 초기화하지 않지만 UI만 바꿈
      var type = typeSel.value;
      optWrap.innerHTML = renderOptionsArea(type);
    };

    modalEl.querySelector('#rvmFieldCancel').onclick = function () { closeModal(); };
    modalEl.querySelector('#rvmFieldSave').onclick = function () {
      var type = typeSel.value;
      var key = modalEl.querySelector('#rvmFieldKey').value.trim();
      var lab = modalEl.querySelector('#rvmFieldLabel').value.trim();
      var req = modalEl.querySelector('#rvmFieldReq').checked;
      var act = modalEl.querySelector('#rvmFieldAct').checked;

      if (!key) return alert('name_key 입력 필요');
      if (!lab) return alert('라벨 입력 필요');

      var opts = [];
      if (type === 'radio' || type === 'checkbox' || type === 'dropdown') {
        var ta = modalEl.querySelector('#rvmFieldOpts');
        var txt = ta ? ta.value : '';
        opts = txt.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
      }

      var fields = getFields(state.instanceId).slice();

      if (f) {
        var idx = fields.findIndex(function (x) { return x.id === f.id; });
        if (idx < 0) idx = 0;
        fields[idx] = Object.assign({}, fields[idx], {
          field_type: type,
          name_key: key,
          label: lab,
          is_required: req,
          is_active: act,
          options: opts
        });
      } else {
        fields.push({
          id: state.nextFieldId++,
          field_type: type,
          name_key: key,
          label: lab,
          is_required: req,
          is_active: act,
          options: opts
        });
      }

      state.fieldsByInstance[state.instanceId] = fields;
      closeModal();
      toast('필드 반영(로컬 더미)', 'success');
      render();
    };
  }

  function ensureCalendarMonthDates(instanceId, year, monthIndex) {
    var m = getCalendar(instanceId);
    var dayCount = new Date(year, monthIndex + 1, 0).getDate();
    for (var d = 1; d <= dayCount; d++) {
      var iso = new Date(year, monthIndex, d).toISOString().slice(0, 10);
      if (m[iso]) continue;
      // “캘린더 탭”에서 날짜 선택 시 생성되기 때문에 여기선 최소
      m[iso] = { closed: false, times: defaultTimes().map(function (t, idx) { return { time: t, capacity: 3 - (idx % 2), booked: 0 }; }) };
    }
  }

  function moveCalendar(deltaMonths) {
    var cur = state.monthCursor instanceof Date ? state.monthCursor : new Date();
    var next = new Date(cur.getFullYear(), cur.getMonth() + deltaMonths, 1);
    state.monthCursor = next;
    // selected date는 같은 day로 유지(없으면 1일로)
    var sel = state.selectedDate;
    var iso = null;
    if (sel) {
      var parts = sel.split('-').map(function (x) { return parseInt(x, 10); });
      if (parts.length === 3) {
        iso = new Date(next.getFullYear(), next.getMonth(), parts[2]).toISOString().slice(0, 10);
      }
    }
    if (!iso) iso = new Date(next.getFullYear(), next.getMonth(), 1).toISOString().slice(0, 10);
    state.selectedDate = iso;
    render();
  }

  function filterAndRenderBookings() {
    var q = (document.getElementById('rvmBkQ') && document.getElementById('rvmBkQ').value || '').toLowerCase().trim();
    var st = document.getElementById('rvmBkStatus') ? document.getElementById('rvmBkStatus').value : '';
    var br = document.getElementById('rvmBkBranch') ? parseInt(document.getElementById('rvmBkBranch').value || '0', 10) : 0;

    var bookings = getBookings(state.instanceId);
    var filtered = bookings.filter(function (bk) {
      var okSt = !st || bk.status === st;
      var okBr = !br || bk.branch_id === br;
      var text = (bk.no + ' ' + bk.name + ' ' + bk.phone).toLowerCase();
      var okQ = !q || text.includes(q);
      return okSt && okBr && okQ;
    });

    var body = document.getElementById('rvmBkBody');
    if (!body) return;
    body.innerHTML = filtered.map(function (bk) {
      return '<tr>' +
        '<td style="font-weight:900">' + esc(bk.no) + '</td>' +
        '<td>' + esc(bk.status) + '</td>' +
        '<td>' + esc(bk.at) + '</td>' +
        '<td>' + esc((branchById(bk.branch_id) || {}).name || '-') + '</td>' +
        '<td>' + esc(bk.name) + '</td>' +
        '<td>' + esc(bk.phone) + '</td>' +
        '<td><div class="rvmAdmin-actions">' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkDetail" data-bid="' + esc(bk.id) + '">상세보기</button>' +
        '</div></td>' +
        '</tr>';
    }).join('') || '<tr><td colspan="7" style="color:var(--text3);padding:18px 8px">검색 결과 없음</td></tr>';

    // re-bind detail buttons
    root.querySelectorAll('button.rvmBkDetail[data-bid]').forEach(function (btn) {
      btn.onclick = function () {
        openBookingDetailModal(parseInt(btn.getAttribute('data-bid'), 10));
      };
    });
  }

  function resetBookingsFilters() {
    var qEl = document.getElementById('rvmBkQ');
    var stEl = document.getElementById('rvmBkStatus');
    var brEl = document.getElementById('rvmBkBranch');
    if (qEl) qEl.value = '';
    if (stEl) stEl.value = '';
    if (brEl) brEl.value = '0';
    toast('필터 초기화(로컬)', 'success');
  }

  function openBookingDetailModal(bookingId) {
    var bookings = getBookings(state.instanceId);
    var bk = bookings.find(function (b) { return b.id === bookingId; });
    if (!bk) return;

    var statusOpts = ['접수', '확인', '완료', '취소'].map(function (s) {
      return '<option value="' + esc(s) + '"' + (bk.status === s ? 'selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    var br = branchById(bk.branch_id) || {};

    var html = '<h3 style="margin-top:0">예약 상세 (더미)</h3>' +
      '<div style="margin-bottom:12px;color:var(--text3);font-weight:800">예약번호: ' + esc(bk.no) + '</div>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-6">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:6px">상태</div>' +
      '<select class="rvmAdmin-select" id="rvmBkDetailStatus">' + statusOpts + '</select>' +
      '</div>' +
      '<div class="rvmAdmin-col-6">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:6px">지점</div>' +
      '<div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:#fbfcff;font-weight:900">' + esc(br.name || '-') + '</div>' +
      '</div>' +
      '<div class="rvmAdmin-col-12">' +
      '<div style="font-weight:900;color:var(--text2);margin-bottom:6px">예약자</div>' +
      '<div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:#fbfcff;font-weight:800">' +
      esc(bk.name) + ' / ' + esc(bk.phone) + '</div>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:12px;font-weight:900;color:var(--text2);margin-bottom:6px">상태 변경(로컬 UI)</div>' +
      '<div class="rvmAdmin-btn-row">' +
      '<button type="button" class="btn btn-primary" id="rvmBkDetailSave">변경(더미)</button>' +
      '<button type="button" class="btn btn-ghost" id="rvmBkDetailClose">닫기</button>' +
      '</div>';

    openModal(html);
    modalEl.querySelector('#rvmBkDetailClose').onclick = closeModal;
    modalEl.querySelector('#rvmBkDetailSave').onclick = function () {
      var next = modalEl.querySelector('#rvmBkDetailStatus').value;
      bk.status = next;
      closeModal();
      toast('상태 변경(로컬 더미): ' + next, 'success');
      render();
    };
  }

  // --------------------------
  // init
  // --------------------------
  try {
    root.innerHTML = '<div class="rvmAdmin-card"><div class="rvmAdmin-card__body" style="color:var(--text3);font-weight:900">예약관리 관리자 UI 로딩 중…</div></div>';
    state.mode = 'list';
    render();
  } catch (e) {
    root.innerHTML = '<div class="rvmAdmin-card"><div class="rvmAdmin-card__body" style="color:#b91c1c;font-weight:900">UI 초기화 실패: ' + esc(e && e.message ? e.message : String(e)) + '</div></div>';
  }
})();

