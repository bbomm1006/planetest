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
   ★ DB 연동: 더미 데이터 제거, API fetch로 실제 저장/조회
========================================================= */

(function () {
  'use strict';

  var API = '/admin/api/customReser_admin.php';

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

  /* ── API fetch 헬퍼 ──────────────────────────────── */
  function apiGet(params) {
    var qs = Object.keys(params).map(function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(API + '?' + qs, { credentials: 'same-origin' }).then(function(r){ return r.json(); });
  }

  function apiPost(body) {
    return fetch(API, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r){ return r.json(); });
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

  /* ── 상태(State) ──────────────────────────────────── */
  var state = {
    mode: 'list',
    instanceId: null,
    editTab: 'steps',
    instances: [],
    stepsByInstance: {},
    fieldsByInstance: {},
    branchAssignByInstance: {},
    calendarByInstance: {},
    notificationByInstance: {},
    bookingsByInstance: {},
    lookupByInstance: {},
    itemsByBranchByInstance: {},
    regionsMaster: [],
    branchesMaster: [],
    nextFieldId: 1000,
    nextStepSeq: 100,
    nextItemId:  5300,
    nextBranchId: 500,
    monthCursor: new Date(),
    selectedDate: null,
    calendarBranchId: null,
    branchItemBranchId: null,
    drag: { fromIdx: null },
    bkFilter: {},
    loading: false,
    /* 캘린더 탭에서 날짜별 슬롯을 DB에서 로드한 결과 캐시 (instanceId:branchId:date → slots[]) */
    slotCache: {},
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

  /* ── 슬롯 캐시 키 ────────────────────────────────── */
  function slotCacheKey(iid, bid, date) { return iid + ':' + bid + ':' + date; }

  /* ── 예약 필드값 표시 (실제 extra_json 기반) ─────── */
  function bookingFieldValue(bk, field) {
    var extra = {};
    try { extra = JSON.parse(bk.extra_json || '{}'); } catch(e) {}
    var key = field.name_key || '';
    if (key === 'customer_name')  return bk.customer_name  || '-';
    if (key === 'customer_phone') return bk.customer_phone || '-';
    if (key === 'customer_email') return bk.customer_email || '-';
    var val = extra[key];
    if (val == null) return '-';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  }

  /* ── 모드 전환 ───────────────────────────────────── */
  function setModeList() {
    state.mode = 'list';
    state.editTab = 'steps';
    state.instanceId = null;
    loadInstances();
  }

  function setModeEdit(instanceId) {
    state.mode = 'edit';
    state.instanceId = instanceId;
    state.editTab = 'steps';
    state.calendarByInstance[instanceId] = {};
    state.slotCache = {};
    var td = todayIso();
    if (!state.selectedDate || state.selectedDate < td) state.selectedDate = td;
    loadEditData(instanceId);
  }

  /* ── 초기 로드 ───────────────────────────────────── */
  function loadInstances() {
    state.loading = true;
    renderLoading();
    apiGet({ action: 'instance_list' }).then(function(data) {
      state.loading = false;
      if (data.ok) {
        state.instances = (data.instances || []).map(function(x){
          return Object.assign({}, x, { id: parseInt(x.id, 10), is_active: !!parseInt(x.is_active, 10) });
        });
      }
      render();
    }).catch(function() { state.loading = false; render(); });
  }

  function loadEditData(iid) {
    state.loading = true;
    renderLoading();
    /* 병렬 로드: 지역/지점 마스터 + 인스턴스 메타 */
    Promise.all([
      apiGet({ action: 'region_list' }),
      apiGet({ action: 'branch_list' }),
      apiGet({ action: 'steps_list', instance_id: iid }),
      apiGet({ action: 'fields_list', instance_id: iid }),
      apiGet({ action: 'instance_branch_list', instance_id: iid }),
      apiGet({ action: 'settings_get', instance_id: iid }),
    ]).then(function(results) {
      state.loading = false;
      var rReg = results[0], rBr = results[1], rSt = results[2], rFld = results[3], rIBr = results[4], rSet = results[5];

      if (rReg.ok) state.regionsMaster = (rReg.regions || []).map(function(r){ return Object.assign({}, r, { id: parseInt(r.id, 10) }); });
      if (rBr.ok)  state.branchesMaster = (rBr.branches || []).map(function(b){ return Object.assign({}, b, { id: parseInt(b.id, 10), region_id: parseInt(b.region_id, 10), is_active: !!parseInt(b.is_active, 10) }); });

      if (rSt.ok) {
        state.stepsByInstance[iid] = (rSt.steps || []).map(function(s){
          return Object.assign({}, s, { is_active: !!parseInt(s.is_active, 10), sort_order: parseInt(s.sort_order, 10) });
        });
      }
      if (rFld.ok) {
        state.fieldsByInstance[iid] = (rFld.fields || []).map(function(f){
          var opts = f.options || [];
          if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch(e){ opts = []; } }
          return Object.assign({}, f, { id: parseInt(f.id, 10), is_active: !!parseInt(f.is_active, 10), is_required: !!parseInt(f.is_required, 10), options: Array.isArray(opts) ? opts : [] });
        });
      }
      if (rIBr.ok) {
        state.branchAssignByInstance[iid] = (rIBr.assigned || []).map(function(x){ return parseInt(x.branch_id, 10); });
      }

      var assigns = getBranchAssign(iid);
      state.calendarBranchId   = assigns[0] || null;
      state.branchItemBranchId = assigns[0] || null;

      /* 알림 설정 매핑 */
      var s = rSet.ok && rSet.settings ? rSet.settings : {};
      state.notificationByInstance[iid] = {
        use_email:        !!parseInt(s.notify_use_email, 10),
        use_sheet:        !!parseInt(s.notify_use_sheet, 10),
        use_alimtalk:     !!parseInt(s.notify_use_alim, 10),
        email_list:       s.notify_emails || '',
        sheet_webhook:    s.spreadsheet_webhook || '',
        alimtalk_webhook: s.alimtalk_webhook || '',
      };

      /* lookupByInstance: settings 테이블에 없으므로 기본값 유지 */
      if (!state.lookupByInstance[iid]) {
        state.lookupByInstance[iid] = { allow_by_reservation_no: true, allow_by_name_phone: true };
      }

      render();
    }).catch(function(e) { state.loading = false; console.error(e); render(); });
  }

  /* ── 예약 접수 리스트 로드 ──────────────────────── */
  function loadBookings(iid, filters) {
    var params = Object.assign({ action: 'booking_list', instance_id: iid }, filters || {});
    return apiGet(params).then(function(data) {
      if (data.ok) {
        state.bookingsByInstance[iid] = (data.rows || []).map(function(b){
          return Object.assign({}, b, { id: parseInt(b.id, 10), branch_id: parseInt(b.branch_id, 10) });
        });
      }
      return data;
    });
  }

  /* ── 슬롯 로드 (캘린더 날짜 클릭) ──────────────── */
  function loadSlotsForDate(iid, bid, date) {
    var key = slotCacheKey(iid, bid, date);
    return apiGet({ action: 'slot_list', instance_id: iid, branch_id: bid, date: date }).then(function(data) {
      if (data.ok) {
        /* calendarByInstance에 통합 */
        var cal = getCalendar(iid);
        if (!cal[date]) cal[date] = { closed: false, times: [], itemByBranch: {} };
        cal[date].times = (data.slots || []).map(function(sl){
          return {
            id: parseInt(sl.id, 10),
            time: (sl.slot_time || '').slice(0, 5),
            capacity: parseInt(sl.capacity, 10),
            booked: parseInt(sl.booked, 10),
          };
        });
        state.slotCache[key] = true;
      }
      return data;
    });
  }

  /* ── 항목(item) 로드 ────────────────────────────── */
  function loadItems(iid) {
    return apiGet({ action: 'item_list', instance_id: iid }).then(function(data) {
      if (data.ok) {
        /* branchId 무관 — instance 단위로 관리. UI는 branch별로 분리해 표시 */
        var items = (data.items || []).map(function(it){
          return Object.assign({}, it, { id: parseInt(it.id, 10), branch_id: parseInt(it.branch_id || 0, 10), is_active: !!parseInt(it.is_active, 10) });
        });
        /* branchId 별로 분리 */
        var byBranch = {};
        items.forEach(function(it){
          var bid = it.branch_id || 0;
          if (!byBranch[bid]) byBranch[bid] = [];
          byBranch[bid].push(it);
        });
        state.itemsByBranchByInstance[iid] = byBranch;
      }
      return data;
    });
  }

  /* ── 신규 인스턴스 생성 ─────────────────────────── */
  function createNewInstance() {
    openModal(
      '<h3 style="margin-top:0">예약 테이블 추가</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">예약명</label><input class="rvmAdmin-input" type="text" id="rvmNewName" placeholder="예: 강남점 예약"/></div>' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">slug (영문소문자·숫자·하이픈)</label><input class="rvmAdmin-input" type="text" id="rvmNewSlug" placeholder="예: gangnam-reservation"/></div>' +
      '<div class="rvmAdmin-col-12"><label class="rvmAdmin-switch" style="gap:10px"><input type="checkbox" id="rvmNewActive" checked/><span style="font-weight:900;color:var(--text2)">사용</span></label></div>' +
      '</div>' +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmNewSave">저장</button><button type="button" class="btn btn-ghost" id="rvmNewCancel">취소</button></div>'
    );
    modalEl.querySelector('#rvmNewCancel').onclick = closeModal;
    modalEl.querySelector('#rvmNewSave').onclick = function() {
      var name = (modalEl.querySelector('#rvmNewName').value || '').trim();
      var slug = (modalEl.querySelector('#rvmNewSlug').value || '').trim();
      var act  = !!modalEl.querySelector('#rvmNewActive').checked;
      if (!name) return alert('예약명을 입력하세요.');
      if (!slug) return alert('slug를 입력하세요.');
      apiPost({ action: 'instance_save', name: name, slug: slug, is_active: act ? 1 : 0, sort_order: 0 }).then(function(data) {
        if (!data.ok) return alert(data.msg || '저장 실패');
        closeModal();
        toast('예약 테이블 생성됨', 'success');
        setModeEdit(parseInt(data.id, 10));
      });
    };
  }

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  function renderLoading() {
    root.innerHTML = '<div class="rvmAdmin-card"><div class="rvmAdmin-card__body" style="color:var(--text3);font-weight:900;padding:24px">로딩 중…</div></div>';
  }

  function render() {
    var instance = getInstance(state.instanceId);
    var html = '';

    if (state.mode === 'list') {
      html = renderInstanceList();
    } else {
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
        '<td><code style="font-size:.82rem;color:var(--text3)">' + esc(ins.slug || '') + '</code></td>' +
        '<td><span class="rvmAdmin-pill ' + (ins.is_active ? 'ok' : 'bad') + '">' + (ins.is_active ? '사용' : '미사용') + '</span></td>' +
        '<td><div class="rvmAdmin-btn-row" style="justify-content:flex-end">' +
        '<button type="button" class="btn btn-sm btn-outline" data-action="edit" data-inst="' + esc(ins.id) + '">설정</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-action="del" data-inst="' + esc(ins.id) + '">삭제</button>' +
        '</div></td></tr>';
    }).join('') || '<tr><td colspan="4" style="color:var(--text3);padding:24px 12px;text-align:center">등록된 예약 테이블이 없습니다. 오른쪽 버튼으로 추가하세요.</td></tr>';

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>예약 테이블 목록</h3><p>인스턴스 단위로 단계·필드·지점·날짜를 독립 설정합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary" data-action="create">+ 예약 테이블 추가</button></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t">' +
      '<thead><tr><th>예약명</th><th>Slug</th><th>상태</th><th style="text-align:right">관리</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div></div></div>';
  }

  /* ─── 편집 헤더(기본정보) ────────────────────────── */
  function renderInstanceEdit(instance) {
    instance = instance || getInstance(state.instanceId);
    var title  = instance ? instance.name : '';
    var slug   = instance ? (instance.slug || '') : '';
    var desc   = instance ? (instance.description || '') : '';
    var active = instance ? !!instance.is_active : true;

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head">' +
      '<div><h3>' + esc(title || '예약 테이블') + '</h3><p>기본 정보 수정 후 저장하고 아래 탭에서 상세 설정하세요.</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="back">← 목록</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="dummy-save">저장</button>' +
      '</div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-grid">' +
      '<div class="rvmAdmin-col-6"><div class="rvmAdmin-form-row"><label>예약명</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvm-edit-name" value="' + esc(title) + '" placeholder="예: 강남점 예약"/></div></div>' +
      '<div class="rvmAdmin-col-6"><div class="rvmAdmin-form-row"><label>Slug</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvm-edit-slug" value="' + esc(slug) + '" placeholder="영문소문자·숫자·하이픈"/></div></div>' +
      '<div class="rvmAdmin-col-6"><div class="rvmAdmin-form-row"><label>사용 여부</label>' +
      '<label class="rvmAdmin-switch"><input type="checkbox" id="rvm-edit-active"' + (active ? ' checked' : '') + '/>' +
      '<span style="font-weight:800;font-size:.88rem">' + (active ? '사용 중' : '미사용') + '</span></label></div></div>' +
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
      '<div class="rvmAdmin-card__head"><div><h3>단계 구성</h3><p>예약 흐름 단계를 추가·삭제·순서 변경합니다. 드래그 또는 ↑↓ 버튼으로 순서를 조정하세요.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary btn-sm" data-action="step-add">+ 단계 추가</button></div></div>' +
      '<div class="rvmAdmin-card__body"><ul class="rvmAdmin-steps-ul" id="rvmStepsUl">' + (listHtml || '<li style="color:var(--text3);padding:16px 0;text-align:center">단계가 없습니다.</li>') + '</ul></div>' +
      '</div></div>';
  }

  /* ─── 정보입력 필드 탭 ──────────────────────────── */
  function renderFieldsTab() {
    var fields = getFields(state.instanceId);
    var rows = fields.map(function(f) {
      var opts = Array.isArray(f.options) ? f.options : [];
      var optSummary = (f.field_type === 'radio' || f.field_type === 'checkbox' || f.field_type === 'dropdown') ? (opts.length ? opts.length + '개 옵션' : '옵션 없음') : '-';
      return '<tr>' +
        '<td style="font-weight:900">' + esc(f.label) + '</td>' +
        '<td><code>' + esc(f.field_type) + '</code></td>' +
        '<td><code>' + esc(f.name_key) + '</code></td>' +
        '<td>' + esc(optSummary) + '</td>' +
        '<td><span class="rvmAdmin-pill ' + (f.is_required ? 'warn' : '') + '">' + (f.is_required ? '필수' : '선택') + '</span></td>' +
        '<td><span class="rvmAdmin-pill ' + (f.is_active ? 'ok' : 'bad') + '">' + (f.is_active ? '활성' : '비활성') + '</span></td>' +
        '<td><div class="rvmAdmin-btn-row">' +
        '<button type="button" class="btn btn-sm btn-outline rvmFieldEdit" data-id="' + esc(f.id) + '">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmFieldDel" data-id="' + esc(f.id) + '">삭제</button>' +
        '</div></td></tr>';
    }).join('') || '<tr><td colspan="7" style="color:var(--text3);padding:14px 8px">필드가 없습니다.</td></tr>';

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>정보입력 필드</h3><p>예약 시 고객에게 표시할 입력 항목을 관리합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary btn-sm" data-action="field-add">+ 필드 추가</button></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t">' +
      '<thead><tr><th>라벨</th><th>타입</th><th>name_key</th><th>옵션</th><th>필수</th><th>상태</th><th>관리</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div></div></div>';
  }

  /* ─── 지점 관리 탭 ──────────────────────────────── */
  function renderBranchesTab() {
    var assigns = getBranchAssign(state.instanceId);
    var regions = state.regionsMaster || [];
    var branches = state.branchesMaster || [];

    /* 지역별 그룹 */
    var regionHtml = regions.map(function(r) {
      var brs = branches.filter(function(b){ return b.region_id === r.id; });
      var brRows = brs.map(function(b) {
        var connected = assigns.indexOf(b.id) >= 0;
        return '<tr>' +
          '<td>' + esc(b.name) + '</td>' +
          '<td><span class="rvmAdmin-pill ' + (b.is_active ? 'ok' : 'bad') + '">' + (b.is_active ? '사용' : '미사용') + '</span></td>' +
          '<td><label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmBranchConn" data-branch="' + esc(b.id) + '"' + (connected ? ' checked' : '') + '/><span style="font-weight:900;font-size:.85rem">연결</span></label></td>' +
          '<td><label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmBranchActive" data-branch="' + esc(b.id) + '"' + (b.is_active ? ' checked' : '') + '/><span style="font-weight:900;font-size:.85rem">사용</span></label></td>' +
          '<td><div class="rvmAdmin-btn-row">' +
          '<button type="button" class="btn btn-sm btn-outline rvmBranchMasterEdit" data-id="' + esc(b.id) + '">수정</button>' +
          '<button type="button" class="btn btn-sm btn-danger rvmBranchMasterDel" data-id="' + esc(b.id) + '">삭제</button>' +
          '</div></td></tr>';
      }).join('') || '<tr><td colspan="5" style="color:var(--text3)">지점 없음</td></tr>';

      return '<div style="margin-bottom:18px">' +
        '<div style="font-weight:900;color:var(--text2);margin-bottom:8px;display:flex;align-items:center;gap:8px">' +
        esc(r.name) +
        '<button type="button" class="btn btn-sm btn-outline rvmRegionEdit" data-id="' + esc(r.id) + '" style="margin-left:4px">수정</button>' +
        '<button type="button" class="btn btn-sm btn-danger rvmRegionDel" data-id="' + esc(r.id) + '">삭제</button>' +
        '</div>' +
        '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t"><thead><tr><th>지점명</th><th>상태</th><th>이 인스턴스 연결</th><th>지점 사용여부</th><th>관리</th></tr></thead><tbody>' + brRows + '</tbody></table></div>' +
        '</div>';
    }).join('') || '<p style="color:var(--text3)">지역이 없습니다.</p>';

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>지점 관리</h3><p>지역·지점 마스터를 관리하고, 이 인스턴스에 연결할 지점을 체크하세요.</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<button type="button" class="btn btn-outline btn-sm" id="rvmRegionAdd">+ 지역</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="rvmBranchMasterAdd">+ 지점</button>' +
      '</div></div>' +
      '<div class="rvmAdmin-card__body">' + regionHtml + '</div>' +
      '</div></div>';
  }

  /* ─── 캘린더/날짜 탭 ────────────────────────────── */
  function renderCalendarTab() {
    var iid = state.instanceId;
    var assigns = getBranchAssign(iid);
    var branchOpts = assigns.map(function(bid) {
      var b = branchById(bid);
      return '<option value="' + esc(bid) + '"' + (bid === state.calendarBranchId ? ' selected' : '') + '>' + esc(b ? b.name : bid) + '</option>';
    }).join('');

    /* 달력 */
    var cursor  = state.monthCursor instanceof Date ? state.monthCursor : new Date();
    var year    = cursor.getFullYear();
    var month   = cursor.getMonth();
    var today   = todayIso();
    var cal     = getCalendar(iid);
    var firstDay = new Date(year, month, 1).getDay(); // 0=일
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var monthLabel = year + '년 ' + (month + 1) + '월';

    var cells = '';
    for (var i = 0; i < firstDay; i++) cells += '<div class="rvmAdmin-cal-empty"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var iso = formatISODate(new Date(year, month, d));
      var isPast = iso < today;
      var isSelected = iso === state.selectedDate;
      var dayData = cal[iso];
      var hasTimes = dayData && dayData.times && dayData.times.length > 0;
      var isClosed = dayData && dayData.closed;
      var badge = '';
      if (hasTimes && !isClosed) {
        var totalCap = dayData.times.reduce(function(a,t){ return a + (parseInt(t.capacity, 10)||0); }, 0);
        var totalBk  = dayData.times.reduce(function(a,t){ return a + (parseInt(t.booked, 10)||0); }, 0);
        badge = totalBk >= totalCap
          ? '<span class="rvmAdmin-cal-badge bad">마감</span>'
          : '<span class="rvmAdmin-cal-badge ok">가능</span>';
      }
      if (isClosed) badge = '<span class="rvmAdmin-cal-badge bad">휴무</span>';
      cells += '<button type="button" class="rvmAdmin-cal-day' +
        (isPast ? ' past' : '') + (isSelected ? ' selected' : '') + (isClosed ? ' closed' : '') +
        '" data-iso="' + esc(iso) + '">' + d + badge + '</button>';
    }

    /* 선택일 패널 */
    var panelHtml = '';
    if (state.selectedDate) {
      var sd = state.selectedDate;
      var sdData = cal[sd] || { closed: false, times: [] };
      var closedChecked = sdData.closed ? ' checked' : '';
      var timeRows = (sdData.times || []).map(function(sl) {
        var slId = sl.id || 0;
        return '<tr>' +
          '<td style="font-weight:900">' + esc(sl.time) + '</td>' +
          '<td>' + esc(sl.booked) + ' / <input class="rvmAdmin-input rvmTimeCap" type="number" data-time="' + esc(sl.time) + '" data-slot-id="' + esc(slId) + '" value="' + esc(sl.capacity) + '" min="' + esc(sl.booked) + '" style="width:72px;display:inline-block;padding:4px 6px"/></td>' +
          '<td><button type="button" class="btn btn-sm btn-danger rvmTimeDel" data-time="' + esc(sl.time) + '" data-slot-id="' + esc(slId) + '">삭제</button></td>' +
          '</tr>';
      }).join('') || '<tr><td colspan="3" style="color:var(--text3)">시간 없음</td></tr>';

      panelHtml = '<div class="rvmAdmin-card" style="margin-top:14px">' +
        '<div class="rvmAdmin-card__head"><div><h3>' + esc(sd) + ' 시간 슬롯</h3></div>' +
        '<div class="rvmAdmin-actions">' +
        '<label class="rvmAdmin-switch" style="gap:8px"><input type="checkbox" class="rvmDateClosed"' + closedChecked + '/><span style="font-weight:900;font-size:.88rem">휴무일</span></label>' +
        '<button type="button" class="btn btn-primary" id="rvmCalAddTime">+ 시간 추가</button>' +
        '</div></div>' +
        '<div class="rvmAdmin-card__body"><div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t"><thead><tr><th>시간</th><th>예약/정원</th><th>삭제</th></tr></thead><tbody>' + timeRows + '</tbody></table></div></div></div>';
    }

    /* 일괄 설정 */
    var bulkHtml = '<details class="rvmAdmin-bulk-details" style="margin-top:14px">' +
      '<summary class="rvmAdmin-bulk-summary">일괄 시간 등록 (날짜 범위)</summary>' +
      '<div class="rvmAdmin-bulk-body"><div class="rvmAdmin-grid" style="gap:10px">' +
      '<div class="rvmAdmin-col-4"><label style="font-weight:800;font-size:.83rem;display:block;margin-bottom:4px;color:var(--text2)">시작일</label><input class="rvmAdmin-input" type="date" id="rvmBulkFrom" value="' + esc(todayIso()) + '"/></div>' +
      '<div class="rvmAdmin-col-4"><label style="font-weight:800;font-size:.83rem;display:block;margin-bottom:4px;color:var(--text2)">종료일</label><input class="rvmAdmin-input" type="date" id="rvmBulkTo" value="' + esc(todayIso()) + '"/></div>' +
      '<div class="rvmAdmin-col-4"><label style="font-weight:800;font-size:.83rem;display:block;margin-bottom:4px;color:var(--text2)">정원</label><input class="rvmAdmin-input" type="number" id="rvmBulkCap" value="3" min="1"/></div>' +
      '<div class="rvmAdmin-col-12"><label style="font-weight:800;font-size:.83rem;display:block;margin-bottom:4px;color:var(--text2)">시간 목록 (쉼표 구분)</label><input class="rvmAdmin-input" type="text" id="rvmBulkTimes" placeholder="09:00,10:00,11:00,14:00,15:00"/></div>' +
      '<div class="rvmAdmin-col-12"><button type="button" class="btn btn-primary" id="rvmBulkApply">일괄 등록</button></div>' +
      '</div></div></details>';

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>날짜/시간 설정</h3><p>지점을 선택하고 날짜를 클릭해 슬롯을 관리하세요.</p></div>' +
      '<div class="rvmAdmin-actions">' +
      '<select class="rvmAdmin-select" id="rvmCalBranchSel" style="min-width:120px">' + branchOpts + '</select>' +
      '<button type="button" class="btn btn-ghost" data-action="cal-prev">‹</button>' +
      '<span style="font-weight:900;font-size:1rem">' + esc(monthLabel) + '</span>' +
      '<button type="button" class="btn btn-ghost" data-action="cal-next">›</button>' +
      '</div></div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-cal-grid">' +
      '<div class="rvmAdmin-cal-head">일</div><div class="rvmAdmin-cal-head">월</div><div class="rvmAdmin-cal-head">화</div><div class="rvmAdmin-cal-head">수</div><div class="rvmAdmin-cal-head">목</div><div class="rvmAdmin-cal-head">금</div><div class="rvmAdmin-cal-head">토</div>' +
      cells +
      '</div>' +
      panelHtml +
      bulkHtml +
      '</div></div></div>';
  }

  /* ─── 알림 설정 탭 ──────────────────────────────── */
  function renderNotificationTab() {
    var n = getNotification(state.instanceId);
    function notiBox(key, label, inputId, value, placeholder) {
      var checked = !!n[key];
      return '<div class="rvmAdmin-col-12"><div class="rvmAdmin-noti-box">' +
        '<label class="rvmAdmin-switch"><input type="checkbox" class="rvmNotiUse" data-key="' + esc(key) + '"' + (checked ? ' checked' : '') + '/>' +
        '<span style="font-weight:900;font-size:.92rem">' + esc(label) + '</span>' +
        '<span class="rvmAdmin-pill ' + (checked ? 'ok' : '') + '" style="margin-left:4px">' + (checked ? '사용' : '꺼짐') + '</span>' +
        '</label>' +
        '<input class="rvmAdmin-input" type="text" id="' + esc(inputId) + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '"/>' +
        '</div></div>';
    }
    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>알림 설정</h3><p>예약 접수 시 관리자에게 알림을 보냅니다. 사용할 방식을 켜고 저장하세요.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary btn-sm" data-action="dummy-save">저장</button></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-grid" style="gap:12px">' +
      notiBox('use_email', '이메일 알림', 'rvmNotiEmails', n.email_list || '', '수신 이메일 (쉼표로 구분)') +
      notiBox('use_sheet', '스프레드시트 연동', 'rvmNotiSheet', n.sheet_webhook || '', 'Google Sheets Webhook URL') +
      notiBox('use_alimtalk', '알림톡 발송', 'rvmNotiAlim', n.alimtalk_webhook || '', '알림톡 Webhook URL') +
      '</div></div></div></div>';
  }

  /* ─── 예약 접수 리스트 탭 ───────────────────────── */
  function renderBookingsTab() {
    var iid = state.instanceId;
    var bf = state.bkFilter || {};
    var fq       = bf.q       || '';
    var fStatus  = bf.status  || '';
    var fBranch  = bf.branch  || '0';
    var fDateFrom = bf.dateFrom || '';
    var fDateTo   = bf.dateTo   || '';

    var activeFields = getFields(iid).filter(function(f){ return !!f.is_active; });
    var assigns = getBranchAssign(iid);

    var statusOpts = '<option value="">전체</option>' + ['접수','확인','완료','취소'].map(function(s){
      return '<option value="' + esc(s) + '"' + (s === fStatus ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');

    var branchOpts = '<option value="0">전체</option>' + assigns.map(function(bid) {
      var b = branchById(bid);
      return '<option value="' + esc(bid) + '"' + (String(bid) === fBranch ? ' selected' : '') + '>' + esc(b ? b.name : bid) + '</option>';
    }).join('');

    var bookings = getBookings(iid);
    var colCount = 6 + activeFields.length;
    var rows = bookings.map(function(bk) {
      var statusOpts2 = ['접수','확인','완료','취소'].map(function(s){ return '<option value="' + esc(s) + '"' + (s === bk.status ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
      var fieldTds    = activeFields.map(function(f){ return '<td style="min-width:140px">' + esc(bookingFieldValue(bk, f)) + '</td>'; }).join('');
      var pillCls     = bk.status === '완료' ? 'ok' : bk.status === '취소' ? 'bad' : bk.status === '확인' ? 'warn' : '';
      var atStr = bk.reservation_at || bk.at || '';
      return '<tr>' +
        '<td style="font-weight:900;white-space:nowrap">' + esc(bk.reservation_no || bk.no || '') + '</td>' +
        '<td><span class="rvmAdmin-pill ' + pillCls + '">' + esc(bk.status) + '</span></td>' +
        '<td style="min-width:120px"><select class="rvmAdmin-select rvmBkStatusSel" data-bid="' + esc(bk.id) + '">' + statusOpts2 + '</select></td>' +
        '<td style="white-space:nowrap">' + esc(atStr) + '</td>' +
        '<td>' + esc(bk.branch_name || (branchById(bk.branch_id) || {}).name || '-') + '</td>' +
        fieldTds +
        '<td><div class="rvmAdmin-actions">' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkStatusSet" data-bid="' + esc(bk.id) + '">변경</button>' +
        '<button type="button" class="btn btn-sm btn-outline rvmBkDetail" data-bid="' + esc(bk.id) + '">상세</button>' +
        '</div></td></tr>';
    }).join('') || '<tr><td colspan="' + colCount + '" style="color:var(--text3);padding:18px 8px">예약 데이터가 없습니다.<br><small style="font-weight:400">검색 버튼을 눌러 조회하세요.</small></td></tr>';

    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>예약 접수 리스트</h3><p>실제 DB에서 예약 데이터를 조회합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-outline btn-sm" data-action="bk-export">엑셀 다운로드</button></div>' +
      '</div>' +
      '<div class="rvmAdmin-card__body">' +
      '<div class="rvmAdmin-bk-filters">' +
      '<div class="rvmAdmin-bk-filter-group"><label>날짜</label>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      '<input class="rvmAdmin-input" type="date" id="rvmBkDateFrom" value="' + esc(fDateFrom) + '" style="min-width:0;flex:1"/>' +
      '<span style="color:var(--text3);font-weight:900;white-space:nowrap">~</span>' +
      '<input class="rvmAdmin-input" type="date" id="rvmBkDateTo" value="' + esc(fDateTo) + '" style="min-width:0;flex:1"/>' +
      '</div></div>' +
      '<div class="rvmAdmin-bk-filter-group" style="justify-content:flex-end"><label>&nbsp;</label>' +
      '<button type="button" class="btn btn-outline btn-sm" id="rvmBkToday" style="white-space:nowrap">오늘</button></div>' +
      '<div class="rvmAdmin-bk-filter-group"><label>검색</label>' +
      '<input class="rvmAdmin-input" type="text" id="rvmBkQ" value="' + esc(fq) + '" placeholder="예약번호 / 이름 / 전화번호"/></div>' +
      '<div class="rvmAdmin-bk-filter-group"><label>상태</label><select class="rvmAdmin-select" id="rvmBkStatus">' + statusOpts + '</select></div>' +
      '<div class="rvmAdmin-bk-filter-group"><label>지점</label><select class="rvmAdmin-select" id="rvmBkBranch">' + branchOpts + '</select></div>' +
      '<div class="rvmAdmin-bk-filter-group" style="justify-content:flex-end"><label>&nbsp;</label>' +
      '<div style="display:flex;gap:6px">' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="bk-search">검색</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="bk-reset">초기화</button>' +
      '</div></div>' +
      '</div>' +
      '<div id="rvmBkSummary" style="margin:10px 0 4px;font-size:.85rem;font-weight:800;color:var(--text3)"></div>' +
      '<div class="rvmAdmin-table-wrap"><table class="rvmAdmin-t" style="min-width:960px"><thead><tr>' +
      '<th>예약번호</th><th>상태</th><th>상태 변경</th><th style="white-space:nowrap">예약 일시</th><th>지점</th>' +
      activeFields.map(function(f){ return '<th>' + esc(f.label) + '</th>'; }).join('') +
      '<th>관리</th></tr></thead>' +
      '<tbody id="rvmBkBody">' + rows + '</tbody>' +
      '</table></div>' +
      '</div></div></div>';
  }

  /* ─── 예약 조회 설정 탭 ─────────────────────────── */
  function renderLookupTab() {
    var l = getLookup(state.instanceId);
    function lookupBox(id, checked, title, desc) {
      return '<div class="rvmAdmin-col-6"><div class="rvmAdmin-lookup-box">' +
        '<div style="font-weight:900;color:var(--text1);margin-bottom:10px;font-size:.95rem">' + esc(title) + '</div>' +
        '<label class="rvmAdmin-switch"><input type="checkbox" id="' + esc(id) + '"' + (checked ? ' checked' : '') + '/>' +
        '<span style="font-weight:800;font-size:.88rem">허용</span>' +
        '<span class="rvmAdmin-pill ' + (checked ? 'ok' : '') + '" style="margin-left:4px">' + (checked ? '사용' : '꺼짐') + '</span>' +
        '</label>' +
        '<div style="margin-top:8px;color:var(--text3);font-size:.83rem">' + esc(desc) + '</div>' +
        '</div></div>';
    }
    return '<div class="rvmAdmin__section"><div class="rvmAdmin-card">' +
      '<div class="rvmAdmin-card__head"><div><h3>예약 조회 설정</h3><p>고객이 프론트에서 예약을 조회할 수 있는 방법을 설정합니다.</p></div>' +
      '<div class="rvmAdmin-actions"><button type="button" class="btn btn-primary btn-sm" data-action="dummy-save">저장</button></div></div>' +
      '<div class="rvmAdmin-card__body"><div class="rvmAdmin-grid" style="gap:12px">' +
      lookupBox('rvmLookupNo', l.allow_by_reservation_no, '예약번호 조회', '예약번호를 입력해 즉시 조회합니다.') +
      lookupBox('rvmLookupNamePhone', l.allow_by_name_phone, '이름 + 연락처 조회', '이름과 전화번호를 함께 입력해야 조회됩니다.') +
      '</div></div></div></div>';
  }

  /* ════════════════════════════════════════════════════
     WIRE UI
  ════════════════════════════════════════════════════ */
  function wireUi() {
    root.querySelectorAll('.rvmAdmin-tab[data-tab]').forEach(function(b) {
      b.onclick = function() {
        state.editTab = b.getAttribute('data-tab');
        /* 예약 리스트 탭 전환 시 자동 로드 */
        if (state.editTab === 'bookings') {
          loadBookings(state.instanceId, buildBkFilter()).then(function(){ render(); });
        } else {
          render();
        }
      };
    });

    var btnCreate = document.getElementById('rvmAdmin__openCreate');
    if (btnCreate) btnCreate.onclick = function() { createNewInstance(); };

    root.querySelectorAll('[data-action]').forEach(function(el) {
      var act = el.getAttribute('data-action');
      if (act === 'create')      el.onclick = function() { createNewInstance(); };
      if (act === 'back')        el.onclick = function() { setModeList(); };
      if (act === 'edit')        el.onclick = function() { setModeEdit(parseInt(el.getAttribute('data-inst'), 10)); };
      if (act === 'del')         el.onclick = function() { deleteInstance(parseInt(el.getAttribute('data-inst'), 10)); };
      if (act === 'step-add')    el.onclick = function() { openStepModal(null); };
      if (act === 'field-add')   el.onclick = function() { openFieldModal(null); };
      if (act === 'bk-export')   el.onclick = function() { toast('엑셀 다운로드 — 준비 중', 'warning'); };
      if (act === 'bk-search')   el.onclick = function() { doSearchBookings(); };
      if (act === 'bk-reset')    el.onclick = function() { resetBookingsFilters(); };
      if (act === 'cal-prev')    el.onclick = function() { moveCalendar(-1); };
      if (act === 'cal-next')    el.onclick = function() { moveCalendar(1); };
      if (act === 'dummy-save')  el.onclick = function() { syncAndSave(); };
    });

    /* 단계 탭 */
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

    /* 필드 탭 */
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
        apiPost({ action: 'field_delete', id: id, instance_id: state.instanceId }).then(function(data) {
          if (!data.ok) return alert(data.msg || '삭제 실패');
          state.fieldsByInstance[state.instanceId] = getFields(state.instanceId).filter(function(f){ return f.id !== id; });
          toast('필드 삭제됨', 'success'); render();
        });
      };
    });

    /* 지역 관리 */
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
        if (!confirm('\"' + (r ? r.name : id) + '\" 지역을 삭제할까요?')) return;
        apiPost({ action: 'region_delete', id: id }).then(function(data) {
          if (!data.ok) return alert(data.msg || '삭제 실패');
          state.regionsMaster = (state.regionsMaster || []).filter(function(x){ return x.id !== id; });
          toast('지역 삭제됨', 'success'); render();
        });
      };
    });

    /* 지점 탭 */
    root.querySelectorAll('input.rvmBranchConn[data-branch]').forEach(function(cb) {
      cb.onchange = function() {
        var bid = parseInt(cb.getAttribute('data-branch'), 10);
        var list = getBranchAssign(state.instanceId).slice();
        var idx = list.indexOf(bid);
        if (cb.checked) { if (idx < 0) list.push(bid); }
        else            { if (idx >= 0) list.splice(idx, 1); }
        state.branchAssignByInstance[state.instanceId] = list;
        /* DB 즉시 반영 */
        apiPost({ action: 'instance_branch_set', instance_id: state.instanceId, branch_ids: list }).then(function(data) {
          if (!data.ok) return alert(data.msg || '저장 실패');
          toast('지점 연결 변경됨', 'success'); render();
        });
      };
    });
    root.querySelectorAll('input.rvmBranchActive[data-branch]').forEach(function(cb) {
      cb.onchange = function() {
        var br = branchById(parseInt(cb.getAttribute('data-branch'), 10));
        if (!br) return;
        br.is_active = !!cb.checked;
        apiPost({ action: 'branch_save', id: br.id, region_id: br.region_id, name: br.name, is_active: br.is_active ? 1 : 0, sort_order: br.sort_order || 0 }).then(function(data) {
          if (!data.ok) return alert(data.msg || '저장 실패');
          toast('지점 사용 여부 변경됨', 'success'); render();
        });
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
        if (!confirm('지점 \"' + (br ? br.name : id) + '\" 을 삭제할까요?')) return;
        apiPost({ action: 'branch_delete', id: id }).then(function(data) {
          if (!data.ok) return alert(data.msg || '삭제 실패');
          state.branchesMaster = (state.branchesMaster || []).filter(function(x){ return x.id !== id; });
          var iid = state.instanceId;
          state.branchAssignByInstance[iid] = (getBranchAssign(iid)).filter(function(bid){ return bid !== id; });
          if (state.branchItemBranchId === id) state.branchItemBranchId = getBranchAssign(iid)[0] || null;
          if (state.calendarBranchId   === id) state.calendarBranchId   = getBranchAssign(iid)[0] || null;
          toast('지점 삭제됨', 'success'); render();
        });
      };
    });

    /* 캘린더 탭 */
    root.querySelectorAll('.rvmAdmin-cal-day[data-iso]').forEach(function(b) {
      b.onclick = function() {
        var iso = b.getAttribute('data-iso');
        state.selectedDate = iso;
        /* 슬롯 DB 로드 후 재렌더 */
        if (state.calendarBranchId && !state.slotCache[slotCacheKey(state.instanceId, state.calendarBranchId, iso)]) {
          loadSlotsForDate(state.instanceId, state.calendarBranchId, iso).then(function(){ render(); });
        } else {
          render();
        }
      };
    });
    var calBranchSel = root.querySelector('#rvmCalBranchSel');
    if (calBranchSel) calBranchSel.onchange = function() {
      state.calendarBranchId = parseInt(calBranchSel.value, 10) || null;
      state.slotCache = {};
      state.calendarByInstance[state.instanceId] = {};
      render();
    };
    var closeCb = root.querySelector('input.rvmDateClosed');
    if (closeCb) closeCb.onchange = function() {
      var iso = state.selectedDate;
      var bid = state.calendarBranchId;
      if (!iso || !bid) return;
      var closed = !!closeCb.checked;
      /* DB 반영: day_closure_save 또는 delete */
      var action = closed ? 'day_closure_save' : 'day_closure_delete';
      apiPost({ action: action, instance_id: state.instanceId, branch_id: bid, closure_date: iso }).then(function(data) {
        if (!data.ok) return alert(data.msg || '처리 실패');
        var m = getCalendar(state.instanceId);
        if (!m[iso]) m[iso] = { closed: false, times: [] };
        m[iso].closed = closed;
        toast(closed ? '해당일 휴무 처리됨' : '해당일 예약가능으로 변경됨', 'success');
        render();
      });
    };
    var btnAddTime = root.querySelector('#rvmCalAddTime');
    if (btnAddTime) btnAddTime.onclick = function() { openAddTimeModal(); };
    root.querySelectorAll('button.rvmTimeDel[data-time]').forEach(function(b) {
      b.onclick = function() {
        var slotId = parseInt(b.getAttribute('data-slot-id') || '0', 10);
        var iso  = state.selectedDate;
        var time = b.getAttribute('data-time');
        if (!iso || !time) return;
        if (slotId > 0) {
          apiPost({ action: 'slot_delete', id: slotId }).then(function(data) {
            if (!data.ok) return alert(data.msg || '삭제 실패 (예약이 있는 슬롯은 삭제 불가)');
            var m = getCalendar(state.instanceId);
            if (m[iso]) m[iso].times = (m[iso].times || []).filter(function(t){ return t.time !== time; });
            var key = slotCacheKey(state.instanceId, state.calendarBranchId, iso);
            delete state.slotCache[key];
            toast('시간 슬롯 삭제됨', 'success'); render();
          });
        } else {
          var m = getCalendar(state.instanceId);
          if (m[iso]) m[iso].times = (m[iso].times || []).filter(function(t){ return t.time !== time; });
          render();
        }
      };
    });
    root.querySelectorAll('input.rvmTimeCap[data-time]').forEach(function(inp) {
      inp.onchange = function() {
        var slotId = parseInt(inp.getAttribute('data-slot-id') || '0', 10);
        var cap = Math.max(parseInt(inp.value, 10) || 1, 1);
        if (slotId > 0) {
          apiPost({ action: 'slot_set_capacity', id: slotId, capacity: cap }).then(function(data) {
            if (!data.ok) return alert(data.msg || '정원 변경 실패');
            var iso  = state.selectedDate;
            var time = inp.getAttribute('data-time');
            var m = getCalendar(state.instanceId);
            if (m[iso] && m[iso].times) {
              var sl = m[iso].times.find(function(x){ return x.time === time; });
              if (sl) sl.capacity = cap;
            }
            toast('정원 반영됨', 'success'); render();
          });
        }
      };
    });
    var bulkBtn = root.querySelector('#rvmBulkApply');
    if (bulkBtn) bulkBtn.onclick = function() { applyBulkCalendar(); };

    /* 알림 설정 */
    root.querySelectorAll('input.rvmNotiUse[data-key]').forEach(function(cb) {
      cb.onchange = function() { getNotification(state.instanceId)[cb.getAttribute('data-key')] = !!cb.checked; render(); };
    });
    var notiEmails = root.querySelector('#rvmNotiEmails');
    if (notiEmails) notiEmails.oninput = function() { getNotification(state.instanceId).email_list = notiEmails.value; };
    var notiSheet  = root.querySelector('#rvmNotiSheet');
    if (notiSheet)  notiSheet.oninput  = function() { getNotification(state.instanceId).sheet_webhook = notiSheet.value; };
    var notiAlim   = root.querySelector('#rvmNotiAlim');
    if (notiAlim)   notiAlim.oninput   = function() { getNotification(state.instanceId).alimtalk_webhook = notiAlim.value; };

    /* 예약 조회 설정 */
    var lookupNo = root.querySelector('#rvmLookupNo');
    if (lookupNo) lookupNo.onchange = function() { getLookup(state.instanceId).allow_by_reservation_no = !!lookupNo.checked; };
    var lookupNP = root.querySelector('#rvmLookupNamePhone');
    if (lookupNP) lookupNP.onchange = function() { getLookup(state.instanceId).allow_by_name_phone = !!lookupNP.checked; };

    /* 예약 접수 리스트 */
    var btnToday = root.querySelector('#rvmBkToday');
    if (btnToday) btnToday.onclick = function() {
      var td = todayIso();
      var fromEl = document.getElementById('rvmBkDateFrom');
      var toEl   = document.getElementById('rvmBkDateTo');
      if (fromEl) fromEl.value = td;
      if (toEl)   toEl.value   = td;
      doSearchBookings();
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
        apiPost({ action: 'booking_set_status', id: bid, status: sel.value }).then(function(data) {
          if (!data.ok) return alert(data.msg || '상태 변경 실패');
          var bk = getBookings(state.instanceId).find(function(x){ return x.id === bid; });
          if (bk) bk.status = sel.value;
          toast('상태 변경: ' + sel.value, 'success'); render();
        });
      };
    });
  }

  /* ════════════════════════════════════════════════════
     액션 함수들
  ════════════════════════════════════════════════════ */

  function deleteInstance(id) {
    var inst = getInstance(id);
    if (!confirm('\"' + (inst ? inst.name : id) + '\" 예약 테이블을 삭제할까요?')) return;
    apiPost({ action: 'instance_delete', id: id }).then(function(data) {
      if (!data.ok) return alert(data.msg || '삭제 실패');
      state.instances = state.instances.filter(function(x){ return x.id !== id; });
      state.mode = 'list';
      toast('삭제됨', 'success'); render();
    });
  }

  function syncAndSave() {
    if (state.mode !== 'edit') { toast('저장됨', 'success'); return; }
    var inst = getInstance(state.instanceId);
    var nm = document.getElementById('rvm-edit-name');
    var sl = document.getElementById('rvm-edit-slug');
    var ac = document.getElementById('rvm-edit-active');
    var ds = document.getElementById('rvm-edit-desc');

    var name = nm ? (nm.value || '').trim() : (inst ? inst.name : '');
    var slug = sl ? (sl.value || '').trim() : (inst ? inst.slug : '');
    var act  = ac ? !!ac.checked : (inst ? !!inst.is_active : true);
    var desc = ds ? (ds.value || '') : (inst ? (inst.description || '') : '');

    if (!name) return alert('예약명을 입력하세요.');
    if (!slug) return alert('slug를 입력하세요.');

    var payload = { action: 'instance_save', id: state.instanceId, name: name, slug: slug, is_active: act ? 1 : 0, sort_order: inst ? (inst.sort_order || 0) : 0 };

    apiPost(payload).then(function(data) {
      if (!data.ok) return alert(data.msg || '저장 실패');
      if (inst) { inst.name = name; inst.slug = slug; inst.is_active = act; inst.description = desc; }

      /* 알림 설정도 함께 저장 */
      var n = getNotification(state.instanceId);
      return apiPost({
        action: 'settings_save',
        instance_id: state.instanceId,
        notify_emails: n.email_list || '',
        spreadsheet_webhook: n.sheet_webhook || '',
        alimtalk_webhook: n.alimtalk_webhook || '',
        notify_use_email: n.use_email ? 1 : 0,
        notify_use_sheet: n.use_sheet ? 1 : 0,
        notify_use_alim:  n.use_alimtalk ? 1 : 0,
      });
    }).then(function(data) {
      if (data && !data.ok) return alert(data.msg || '알림 설정 저장 실패');
      toast('저장됨', 'success'); render();
    }).catch(function(){ toast('저장됨', 'success'); render(); });
  }

  /* ── 단계 조작 ──────────────────────────────────── */
  function sortedSteps() { return getSteps(state.instanceId).slice().sort(function(a,b){ return a.sort_order - b.sort_order; }); }
  function saveStepsToDb(steps) {
    state.stepsByInstance[state.instanceId] = steps.map(function(s,i){ return Object.assign({}, s, { sort_order: (i+1)*10 }); });
    return apiPost({ action: 'steps_save', instance_id: state.instanceId, steps: state.stepsByInstance[state.instanceId] });
  }

  function toggleStep(idx, isActive) {
    var steps = sortedSteps();
    if (!steps[idx]) return;
    steps[idx].is_active = isActive;
    saveStepsToDb(steps).then(function(data){ if (!data.ok) alert(data.msg || '저장 실패'); render(); });
  }
  function moveStep(idx, delta) {
    var steps = sortedSteps();
    var toIdx = idx + delta;
    if (toIdx < 0 || toIdx >= steps.length) return;
    var tmp = steps[idx]; steps[idx] = steps[toIdx]; steps[toIdx] = tmp;
    saveStepsToDb(steps).then(function(data){ if (!data.ok) alert(data.msg || '저장 실패'); render(); });
  }
  function swapStep(from, to) {
    var steps = sortedSteps();
    var tmp = steps[from]; steps[from] = steps[to]; steps[to] = tmp;
    saveStepsToDb(steps).then(function(data){ if (!data.ok) alert(data.msg || '저장 실패'); render(); });
  }
  function deleteStep(idx) {
    var steps = sortedSteps();
    steps.splice(idx, 1);
    saveStepsToDb(steps).then(function(data){
      if (!data.ok) alert(data.msg || '저장 실패');
      toast('단계 삭제됨', 'success'); render();
    });
  }

  /* ── 달력 이동 ──────────────────────────────────── */
  function moveCalendar(delta) {
    var cur  = state.monthCursor instanceof Date ? state.monthCursor : new Date();
    var next = new Date(cur.getFullYear(), cur.getMonth() + delta, 1);
    state.monthCursor = next;
    state.slotCache = {};
    state.calendarByInstance[state.instanceId] = {};
    var td = todayIso();
    var monthStart = formatISODate(new Date(next.getFullYear(), next.getMonth(), 1));
    state.selectedDate = td >= monthStart ? td : monthStart;
    render();
  }

  /* ── 일괄 캘린더 설정 ───────────────────────────── */
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
    var pickedTimes = (timesEl.value || '').split(',').map(function(x){ return x.trim(); }).filter(function(x){ return /^\d{2}:\d{2}$/.test(x); });
    if (!pickedTimes.length) return alert('시간 형식이 맞지 않습니다. 예: 09:00, 10:30');
    pickedTimes = pickedTimes.filter(function(t, i){ return pickedTimes.indexOf(t) === i; });

    var bid = state.calendarBranchId;
    if (!bid) return alert('지점을 선택하세요.');

    apiPost({
      action: 'slot_bulk_create',
      instance_id: state.instanceId,
      branch_id: bid,
      date_from: fromIso,
      date_to: toIso,
      times: pickedTimes,
      capacity: cap,
    }).then(function(data) {
      if (!data.ok) return alert(data.msg || '일괄 등록 실패');
      /* 캐시 초기화 후 재렌더 */
      state.slotCache = {};
      state.calendarByInstance[state.instanceId] = {};
      toast('일괄 등록 완료: ' + (data.inserted_or_updated || 0) + '개 슬롯', 'success');
      /* 선택된 날짜 슬롯 다시 로드 */
      if (state.selectedDate && bid) {
        loadSlotsForDate(state.instanceId, bid, state.selectedDate).then(function(){ render(); });
      } else {
        render();
      }
    });
  }

  /* ── 예약 검색 ──────────────────────────────────── */
  function buildBkFilter() {
    var q        = ((document.getElementById('rvmBkQ')        || {}).value || '').trim();
    var st       = ((document.getElementById('rvmBkStatus')   || {}).value || '');
    var br       = ((document.getElementById('rvmBkBranch')   || {}).value || '0');
    var dateFrom = ((document.getElementById('rvmBkDateFrom') || {}).value || '').trim();
    var dateTo   = ((document.getElementById('rvmBkDateTo')   || {}).value || '').trim();
    return { q: q, status: st, branch_id: br !== '0' ? br : '', dateFrom: dateFrom, dateTo: dateTo };
  }

  function doSearchBookings() {
    var f = buildBkFilter();
    state.bkFilter = { q: f.q, status: f.status, branch: f.branch_id, dateFrom: f.dateFrom, dateTo: f.dateTo };
    var apiParams = { instance_id: state.instanceId };
    if (f.q)          apiParams.q         = f.q;
    if (f.status)     apiParams.status    = f.status;
    if (f.branch_id)  apiParams.branch_id = f.branch_id;
    /* 날짜 필터는 서버 쿼리에 없으므로 클라이언트에서 걸러냄 */
    loadBookings(state.instanceId, apiParams).then(function(data) {
      /* 날짜 필터 클라이언트 적용 */
      if (f.dateFrom || f.dateTo) {
        state.bookingsByInstance[state.instanceId] = getBookings(state.instanceId).filter(function(bk) {
          var bkDate = (bk.reservation_at || bk.at || '').slice(0, 10);
          var okFrom = !f.dateFrom || bkDate >= f.dateFrom;
          var okTo   = !f.dateTo   || bkDate <= f.dateTo;
          return okFrom && okTo;
        });
      }
      var summary = document.getElementById('rvmBkSummary');
      if (summary) summary.textContent = '전체 ' + getBookings(state.instanceId).length + '건';
      render();
    });
  }

  function resetBookingsFilters() {
    state.bkFilter = {};
    var els = ['rvmBkQ','rvmBkStatus','rvmBkDateFrom','rvmBkDateTo'];
    els.forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
    var brEl = document.getElementById('rvmBkBranch');
    if (brEl) brEl.value = '0';
    toast('필터 초기화됨', 'success');
    loadBookings(state.instanceId, {}).then(function(){ render(); });
  }

  /* ── 시간 추가 모달 ─────────────────────────────── */
  function openAddTimeModal() {
    var iso = state.selectedDate;
    var bid = state.calendarBranchId;
    if (!iso) return;
    if (!bid) return alert('지점을 먼저 선택하세요.');

    var html = '<h3 style="margin-top:0">시간 슬롯 추가 — ' + esc(iso) + '</h3>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-6"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">시간 (HH:MM)</label>' +
      '<input class="rvmAdmin-input" type="time" id="rvmAddTimeVal" value="09:00" required/></div>' +
      '<div class="rvmAdmin-col-6"><label style="font-weight:900;color:var(--text2);font-size:.9rem;display:block;margin-bottom:6px">정원</label>' +
      '<input class="rvmAdmin-input" type="number" id="rvmAddTimeCap" value="3" min="1"/></div>' +
      '<div class="rvmAdmin-col-12" style="color:var(--text3);font-weight:800;font-size:.83rem">이미 동일 시간이 등록된 경우 정원만 업데이트됩니다.</div>' +
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

      apiPost({
        action: 'slot_bulk_create',
        instance_id: state.instanceId,
        branch_id: bid,
        date_from: iso,
        date_to: iso,
        times: [timeVal],
        capacity: capVal,
      }).then(function(data) {
        if (!data.ok) return alert(data.msg || '추가 실패');
        closeModal();
        var key = slotCacheKey(state.instanceId, bid, iso);
        delete state.slotCache[key];
        return loadSlotsForDate(state.instanceId, bid, iso);
      }).then(function() {
        toast(iso + ' · ' + timeVal + ' 슬롯 추가됨', 'success');
        render();
      });
    };
  }

  /* ── 단계 추가/수정 모달 ────────────────────────── */
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
      saveStepsToDb(steps).then(function(data) {
        if (!data.ok) return alert(data.msg || '저장 실패');
        closeModal(); toast('단계 반영됨', 'success'); render();
      });
    };
  }

  /* ── 필드 추가/수정 모달 ────────────────────────── */
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
      var fields = getFields(state.instanceId).slice();
      var sortOrd = f ? (f.sort_order || 0) : (fields.length + 1) * 10;
      apiPost({
        action: 'field_save',
        instance_id: state.instanceId,
        id: f ? f.id : 0,
        field_type: type,
        name_key: key,
        label: lab,
        options: opts,
        sort_order: sortOrd,
        is_required: req ? 1 : 0,
        is_active:   act ? 1 : 0,
      }).then(function(data) {
        if (!data.ok) return alert(data.msg || '저장 실패');
        var newField = { id: data.id || (f ? f.id : state.nextFieldId++), field_type: type, name_key: key, label: lab, is_required: req, is_active: act, options: opts, sort_order: sortOrd };
        if (f) {
          var idx = fields.findIndex(function(x){ return x.id === f.id; });
          if (idx >= 0) fields[idx] = newField;
        } else {
          fields.push(newField);
        }
        state.fieldsByInstance[state.instanceId] = fields;
        closeModal(); toast('필드 반영됨', 'success'); render();
      });
    };
  }

  /* ── 지역 추가/수정 모달 ────────────────────────── */
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
      apiPost({ action: 'region_save', id: isEdit ? region.id : 0, name: name, is_active: 1, sort_order: 0 }).then(function(data) {
        if (!data.ok) return alert(data.msg || '저장 실패');
        if (isEdit) {
          region.name = name;
        } else {
          state.regionsMaster.push({ id: parseInt(data.id, 10), name: name, is_active: 1, sort_order: 0 });
        }
        closeModal();
        toast((isEdit ? '지역 수정됨: ' : '지역 추가됨: ') + name, 'success');
        render();
      });
    };
  }

  /* ── 지점 마스터 추가/수정 모달 ────────────────── */
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
      apiPost({ action: 'branch_save', id: isEdit ? branch.id : 0, region_id: rid, name: name, is_active: act ? 1 : 0, sort_order: 0 }).then(function(data) {
        if (!data.ok) return alert(data.msg || '저장 실패');
        if (isEdit) {
          branch.region_id = rid; branch.name = name; branch.is_active = act;
        } else {
          state.branchesMaster.push({ id: parseInt(data.id, 10), region_id: rid, name: name, is_active: act, sort_order: 0 });
        }
        closeModal(); toast('지점 반영됨', 'success'); render();
      });
    };
  }

  /* ── 예약 상세 모달 ────────────────────────────── */
  function openBookingDetailModal(bookingId) {
    var bk = getBookings(state.instanceId).find(function(b){ return b.id === bookingId; });
    if (!bk) return;
    var br           = branchById(bk.branch_id) || {};
    var activeFields = getFields(state.instanceId).filter(function(f){ return !!f.is_active; });
    var statusOpts   = ['접수','확인','완료','취소'].map(function(s){ return '<option value="' + esc(s) + '"' + (bk.status === s ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
    var fieldRows    = activeFields.map(function(f){ return '<tr><td style="font-weight:900;min-width:160px">' + esc(f.label) + '</td><td>' + esc(bookingFieldValue(bk, f)) + '</td></tr>'; }).join('');

    var html = '<h3 style="margin-top:0">예약 상세</h3>' +
      '<div style="margin-bottom:10px;color:var(--text3);font-weight:800">예약번호: ' + esc(bk.reservation_no || bk.no || '') + '</div>' +
      '<div class="rvmAdmin-grid" style="gap:12px">' +
      '<div class="rvmAdmin-col-6"><div style="font-weight:900;color:var(--text2);margin-bottom:6px">지점</div><div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:#fbfcff;font-weight:900">' + esc(bk.branch_name || br.name || '-') + '</div></div>' +
      '<div class="rvmAdmin-col-6"><div style="font-weight:900;color:var(--text2);margin-bottom:6px">상태 변경</div><select class="rvmAdmin-select" id="rvmBkDetailStatus">' + statusOpts + '</select></div>' +
      '</div>' +
      (fieldRows ? '<div style="margin-top:12px" class="rvmAdmin-table-wrap"><table class="rvmAdmin-t"><thead><tr><th>필드</th><th>값</th></tr></thead><tbody>' + fieldRows + '</tbody></table></div>' : '') +
      '<div style="margin-top:14px" class="rvmAdmin-btn-row"><button type="button" class="btn btn-primary" id="rvmBkDetailSave">상태 변경</button><button type="button" class="btn btn-ghost" id="rvmBkDetailClose">닫기</button></div>';

    openModal(html);
    modalEl.querySelector('#rvmBkDetailClose').onclick = closeModal;
    modalEl.querySelector('#rvmBkDetailSave').onclick = function() {
      var newStatus = modalEl.querySelector('#rvmBkDetailStatus').value;
      apiPost({ action: 'booking_set_status', id: bk.id, status: newStatus }).then(function(data) {
        if (!data.ok) return alert(data.msg || '상태 변경 실패');
        bk.status = newStatus;
        closeModal(); toast('상태 변경: ' + newStatus, 'success'); render();
      });
    };
  }

  /* ─── 초기화 ─────────────────────────────────────── */
  try {
    state.mode = 'list';
    loadInstances();
  } catch (e) {
    root.innerHTML = '<div class="rvmAdmin-card"><div class="rvmAdmin-card__body" style="color:#b91c1c;font-weight:900">UI 초기화 실패: ' + esc(e && e.message ? e.message : String(e)) + '</div></div>';
    console.error('[rvm_admin_ui] init error:', e);
  }

})();
