/**
 * rvmReser_public.js
 * 프론트 예약 UI — lib/rvmReser_front.php 단락과 연동
 * API: /admin/api_front/customReser_public.php (기존 그대로 사용)
 * 셀렉터 네임스페이스: rvmReser-*  (customReser-* 와 독립 공존)
 */
(function () {
  'use strict';

  var API = '/admin/api_front/customReser_public.php';

  /* ── API 헬퍼 ─────────────────────────────────────── */
  function call(slug, action, data, method) {
    method = (method || 'GET').toUpperCase();
    if (method === 'GET') {
      var q = new URLSearchParams();
      q.set('slug', slug);
      q.set('action', action);
      if (data) {
        Object.keys(data).forEach(function (k) {
          if (data[k] != null && data[k] !== '') q.set(k, String(data[k]));
        });
      }
      return fetch(API + '?' + q.toString()).then(function (r) { return r.json(); });
    }
    var body = Object.assign({ slug: slug, action: action }, data || {});
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 단계 플랜 구성 ───────────────────────────────── */
  function buildPlan(cfg) {
    var mode  = cfg.capacity_mode || 'time';
    var steps = (cfg.steps || [])
      .filter(function (s) { return parseInt(s.is_active, 10) === 1; })
      .sort(function (a, b) { return a.sort_order - b.sort_order; });
    var out = [];
    for (var i = 0; i < steps.length; i++) {
      var k = steps[i].step_key;
      if (k === 'time' && mode !== 'time') continue;
      if (k === 'item' && mode !== 'item') continue;
      out.push(k);
    }
    return out;
  }

  /* ════════════════════════════════════════════════════
     메인 초기화
  ════════════════════════════════════════════════════ */
  function initRvmReser(root, slug) {
    var msgEl    = root.querySelector('#rvmReser-msg');
    var progEl   = root.querySelector('#rvmReser-progress');
    var hostEl   = root.querySelector('#rvmReser-step-host');
    var actEl    = root.querySelector('#rvmReser-actions');
    var capHint  = root.querySelector('#rvmReser-cap-hint');

    /* 상태 */
    var st = {
      cfg:         null,
      plan:        [],
      stepIndex:   0,
      branchId:    0,
      dateYmd:     '',
      slotId:      0,
      itemQuotaId: 0,
      itemId:      0,
      extra:       {},
      calYear:     0,
      calMonth:    0,
      calDays:     null,
    };

    /* ── 메시지 ────────────────────────────────────── */
    function showMsg(text, ok) {
      if (!msgEl) return;
      if (!text) { msgEl.innerHTML = ''; return; }
      msgEl.innerHTML = '<div class="rvmReser-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>';
    }

    /* ── 진행 표시 ─────────────────────────────────── */
    function renderProgress() {
      if (!progEl) return;
      var labels = { branch: '지점', date: '날짜', time: '시간', item: '항목', info: '정보' };
      progEl.innerHTML = st.plan.map(function (k, i) {
        var cls = i < st.stepIndex ? 'done' : i === st.stepIndex ? 'active' : '';
        return '<span class="rvmReser-prog-step ' + cls + '">' + (labels[k] || k) + '</span>';
      }).join('<span class="rvmReser-prog-sep">›</span>');
    }

    /* ── 버튼 렌더 ─────────────────────────────────── */
    function renderActions() {
      if (!actEl) return;
      var html = '';
      if (st.stepIndex > 0) html += '<button type="button" class="rvmReser-btn ghost" id="rvmReser-btn-prev">← 이전</button>';
      if (st.stepIndex < st.plan.length - 1) html += '<button type="button" class="rvmReser-btn primary" id="rvmReser-btn-next">다음 →</button>';
      if (st.stepIndex === st.plan.length - 1) html += '<button type="button" class="rvmReser-btn primary" id="rvmReser-btn-submit">예약 완료</button>';
      actEl.innerHTML = html;
      var prevBtn   = actEl.querySelector('#rvmReser-btn-prev');
      var nextBtn   = actEl.querySelector('#rvmReser-btn-next');
      var submitBtn = actEl.querySelector('#rvmReser-btn-submit');
      if (prevBtn)   prevBtn.onclick   = function () { goStep(st.stepIndex - 1); };
      if (nextBtn)   nextBtn.onclick   = function () { goNext(); };
      if (submitBtn) submitBtn.onclick = function () { doSubmit(); };
    }

    /* ── 단계 이동 ─────────────────────────────────── */
    function goStep(idx) {
      if (idx < 0 || idx >= st.plan.length) return;
      st.stepIndex = idx;
      showMsg('');
      renderProgress();
      renderStep();
      renderActions();
    }

    function goNext() {
      var cur = st.plan[st.stepIndex];
      var err = validateStep(cur);
      if (err) { showMsg(err, false); return; }
      showMsg('');
      goStep(st.stepIndex + 1);
    }

    function validateStep(key) {
      if (key === 'branch' && !st.branchId)  return '지점을 선택해 주세요.';
      if (key === 'date'   && !st.dateYmd)   return '날짜를 선택해 주세요.';
      if (key === 'time'   && !st.slotId)    return '시간을 선택해 주세요.';
      if (key === 'item'   && !st.itemQuotaId) return '항목을 선택해 주세요.';
      if (key === 'info') {
        var fields = (st.cfg && st.cfg.fields) || [];
        for (var i = 0; i < fields.length; i++) {
          var f = fields[i];
          if (!parseInt(f.is_required, 10)) continue;
          var val = st.extra[f.name_key] || '';
          if (!val || (Array.isArray(val) && !val.length)) return '\"' + f.label + '\" 은(는) 필수 항목입니다.';
        }
      }
      return '';
    }

    /* ── 각 단계 렌더 ──────────────────────────────── */
    function renderStep() {
      if (!hostEl) return;
      var key = st.plan[st.stepIndex];
      if (key === 'branch') renderBranchStep();
      else if (key === 'date') renderDateStep();
      else if (key === 'time') renderTimeStep();
      else if (key === 'item') renderItemStep();
      else if (key === 'info') renderInfoStep();
    }

    /* 지점 선택 */
    function renderBranchStep() {
      var branches = (st.cfg && st.cfg.branches) || [];
      var html = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">지점 선택</h3>';
      if (!branches.length) {
        html += '<p class="rvmReser-empty">예약 가능한 지점이 없습니다.</p>';
      } else {
        html += '<div class="rvmReser-branch-list">';
        branches.forEach(function (b) {
          var sel = parseInt(b.id, 10) === st.branchId;
          html += '<button type="button" class="rvmReser-branch-btn' + (sel ? ' on' : '') + '" data-bid="' + esc(b.id) + '">';
          if (b.region_name) html += '<span class="rvmReser-branch-region">' + esc(b.region_name) + '</span>';
          html += esc(b.name) + '</button>';
        });
        html += '</div>';
      }
      html += '</div>';
      hostEl.innerHTML = html;
      hostEl.querySelectorAll('.rvmReser-branch-btn[data-bid]').forEach(function (btn) {
        btn.onclick = function () {
          st.branchId = parseInt(btn.getAttribute('data-bid'), 10);
          /* 지점 바뀌면 날짜/시간 초기화 */
          st.dateYmd = ''; st.slotId = 0; st.itemQuotaId = 0;
          renderBranchStep();
        };
      });
    }

    /* 날짜 선택 */
    function renderDateStep() {
      if (!st.branchId) { hostEl.innerHTML = '<p class="rvmReser-empty">지점을 먼저 선택하세요.</p>'; return; }
      var now = new Date();
      if (!st.calYear)  st.calYear  = now.getFullYear();
      if (!st.calMonth) st.calMonth = now.getMonth() + 1;

      function loadAndRender() {
        hostEl.innerHTML = '<div class="rvmReser-step-inner"><p class="rvmReser-loading">달력 로딩 중…</p></div>';
        call(slug, 'calendar', { branch_id: st.branchId, year: st.calYear, month: st.calMonth }, 'GET')
          .then(function (data) {
            if (!data.ok) { hostEl.innerHTML = '<p class="rvmReser-empty">달력을 불러올 수 없습니다.</p>'; return; }
            st.calDays = data.days || {};
            renderCalendar();
          });
      }

      function renderCalendar() {
        var days = st.calDays || {};
        var y = st.calYear, m = st.calMonth;
        var firstDay = new Date(y, m - 1, 1).getDay();
        var daysInMonth = new Date(y, m, 0).getDate();
        var today = (function(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); })();

        var html = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">날짜 선택</h3>';
        html += '<div class="rvmReser-cal-nav">';
        html += '<button type="button" class="rvmReser-btn ghost" id="rvmReser-cal-prev">‹</button>';
        html += '<span class="rvmReser-cal-month-label">' + y + '년 ' + m + '월</span>';
        html += '<button type="button" class="rvmReser-btn ghost" id="rvmReser-cal-next">›</button>';
        html += '</div>';
        html += '<div class="rvmReser-cal-grid">';
        ['일','월','화','수','목','금','토'].forEach(function(d){ html += '<div class="rvmReser-cal-head">' + d + '</div>'; });
        for (var i = 0; i < firstDay; i++) html += '<div class="rvmReser-cal-empty"></div>';
        for (var d = 1; d <= daysInMonth; d++) {
          var iso = y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
          var info = days[iso] || {};
          var isPast   = iso < today;
          var isClosed = info.closed || (!isPast && !info.capacity);
          var isFull   = !isClosed && !isPast && (parseInt(info.booked,10)||0) >= (parseInt(info.capacity,10)||0);
          var isOpen   = !isPast && !isClosed && !isFull;
          var isSel    = iso === st.dateYmd;
          var cls = 'rvmReser-cal-day';
          if (isPast)   cls += ' past';
          if (isClosed) cls += ' closed';
          if (isFull)   cls += ' full';
          if (isSel)    cls += ' selected';
          var dis = (isPast || isClosed || isFull) ? ' disabled' : '';
          html += '<button type="button" class="' + cls + '" data-iso="' + esc(iso) + '"' + dis + '>' + d;
          if (isOpen)   html += '<span class="rvmReser-cal-badge ok">가능</span>';
          if (isFull)   html += '<span class="rvmReser-cal-badge bad">마감</span>';
          if (isClosed) html += '<span class="rvmReser-cal-badge bad">휴무</span>';
          html += '</button>';
        }
        html += '</div></div>';
        hostEl.innerHTML = html;
        var prevBtn = hostEl.querySelector('#rvmReser-cal-prev');
        var nextBtn = hostEl.querySelector('#rvmReser-cal-next');
        if (prevBtn) prevBtn.onclick = function () {
          st.calMonth--;
          if (st.calMonth < 1) { st.calMonth = 12; st.calYear--; }
          loadAndRender();
        };
        if (nextBtn) nextBtn.onclick = function () {
          st.calMonth++;
          if (st.calMonth > 12) { st.calMonth = 1; st.calYear++; }
          loadAndRender();
        };
        hostEl.querySelectorAll('.rvmReser-cal-day[data-iso]').forEach(function (btn) {
          btn.onclick = function () {
            if (btn.disabled) return;
            st.dateYmd = btn.getAttribute('data-iso');
            st.slotId = 0; st.itemQuotaId = 0;
            renderCalendar();
          };
        });
      }

      loadAndRender();
    }

    /* 시간 선택 */
    function renderTimeStep() {
      if (!st.branchId || !st.dateYmd) {
        hostEl.innerHTML = '<p class="rvmReser-empty">지점과 날짜를 먼저 선택하세요.</p>';
        return;
      }
      hostEl.innerHTML = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">시간 선택</h3><p class="rvmReser-loading">로딩 중…</p></div>';
      call(slug, 'slots', { branch_id: st.branchId, date: st.dateYmd }, 'GET').then(function (data) {
        if (!data.ok) { hostEl.innerHTML = '<p class="rvmReser-empty">시간을 불러올 수 없습니다.</p>'; return; }
        var slots = data.slots || [];
        if (data.closed || !slots.length) {
          hostEl.innerHTML = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">시간 선택</h3><p class="rvmReser-empty">예약 가능한 시간이 없습니다.</p></div>';
          return;
        }
        var html = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">시간 선택</h3><div class="rvmReser-slot-list">';
        slots.forEach(function (s) {
          var avail = !!parseInt(s.available, 10);
          var sel = parseInt(s.id, 10) === st.slotId;
          html += '<button type="button" class="rvmReser-slot-btn' + (sel ? ' on' : '') + (avail ? '' : ' disabled') + '" data-slot="' + esc(s.id) + '"' + (avail ? '' : ' disabled') + '>';
          html += esc((s.slot_time || '').slice(0, 5));
          if (!avail) html += ' <small>(마감)</small>';
          html += '</button>';
        });
        html += '</div></div>';
        hostEl.innerHTML = html;
        hostEl.querySelectorAll('.rvmReser-slot-btn[data-slot]').forEach(function (btn) {
          btn.onclick = function () {
            if (btn.disabled) return;
            st.slotId = parseInt(btn.getAttribute('data-slot'), 10);
            hostEl.querySelectorAll('.rvmReser-slot-btn').forEach(function (x) { x.classList.remove('on'); });
            btn.classList.add('on');
          };
        });
      });
    }

    /* 항목 선택 (item 모드) */
    function renderItemStep() {
      if (!st.branchId || !st.dateYmd) {
        hostEl.innerHTML = '<p class="rvmReser-empty">지점과 날짜를 먼저 선택하세요.</p>';
        return;
      }
      hostEl.innerHTML = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">항목 선택</h3><p class="rvmReser-loading">로딩 중…</p></div>';
      call(slug, 'item_quotas', { branch_id: st.branchId, date: st.dateYmd }, 'GET').then(function (data) {
        if (!data.ok) { hostEl.innerHTML = '<p class="rvmReser-empty">항목을 불러올 수 없습니다.</p>'; return; }
        var quotas = data.quotas || [];
        if (!quotas.length) {
          hostEl.innerHTML = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">항목 선택</h3><p class="rvmReser-empty">예약 가능한 항목이 없습니다.</p></div>';
          return;
        }
        var html = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">항목 선택</h3><div class="rvmReser-item-list">';
        quotas.forEach(function (q) {
          var avail = !!parseInt(q.available, 10);
          var sel = parseInt(q.id, 10) === st.itemQuotaId;
          html += '<button type="button" class="rvmReser-item-btn' + (sel ? ' on' : '') + (avail ? '' : ' disabled') + '" data-iq="' + esc(q.id) + '" data-item-id="' + esc(q.item_id) + '"' + (avail ? '' : ' disabled') + '>';
          html += esc(q.item_name || '-');
          if (!avail) html += ' <small>(마감)</small>';
          html += '</button>';
        });
        html += '</div></div>';
        hostEl.innerHTML = html;
        hostEl.querySelectorAll('.rvmReser-item-btn[data-iq]').forEach(function (btn) {
          btn.onclick = function () {
            if (btn.disabled) return;
            st.itemQuotaId = parseInt(btn.getAttribute('data-iq'), 10);
            st.itemId      = parseInt(btn.getAttribute('data-item-id'), 10);
            hostEl.querySelectorAll('.rvmReser-item-btn').forEach(function (x) { x.classList.remove('on'); });
            btn.classList.add('on');
          };
        });
      });
    }

    /* 정보입력 */
    function renderInfoStep() {
      var fields = (st.cfg && st.cfg.fields) || [];
      var html = '<div class="rvmReser-step-inner"><h3 class="rvmReser-step-title">예약 정보 입력</h3><div class="rvmReser-fields">';
      fields.forEach(function (f) {
        var req = parseInt(f.is_required, 10) ? ' *' : '';
        var opts = Array.isArray(f.options) ? f.options : (function(){ try{ return JSON.parse(f.options_json||'[]'); } catch(e){ return []; } })();
        html += '<div class="rvmReser-field"><label>' + esc(f.label) + '<span class="req">' + req + '</span></label>';
        var cur = st.extra[f.name_key] || '';
        if (f.field_type === 'text' || f.field_type === 'email') {
          html += '<input type="' + esc(f.field_type) + '" class="rvmReser-input" data-key="' + esc(f.name_key) + '" value="' + esc(cur) + '"/>';
        } else if (f.field_type === 'phone') {
          html += '<input type="tel" class="rvmReser-input" inputmode="numeric" data-key="' + esc(f.name_key) + '" value="' + esc(cur) + '" placeholder="숫자만"/>';
        } else if (f.field_type === 'radio') {
          html += '<div class="rvmReser-radios">';
          opts.forEach(function (o) {
            var chk = cur === o ? ' checked' : '';
            html += '<label><input type="radio" name="rvmReser-' + esc(f.name_key) + '" data-key="' + esc(f.name_key) + '" value="' + esc(o) + '"' + chk + '/>' + esc(o) + '</label>';
          });
          html += '</div>';
        } else if (f.field_type === 'checkbox') {
          var curArr = Array.isArray(cur) ? cur : [];
          html += '<div class="rvmReser-checks">';
          opts.forEach(function (o) {
            var chk = curArr.indexOf(o) >= 0 ? ' checked' : '';
            html += '<label><input type="checkbox" data-key="' + esc(f.name_key) + '" value="' + esc(o) + '"' + chk + '/>' + esc(o) + '</label>';
          });
          html += '</div>';
        } else if (f.field_type === 'dropdown') {
          html += '<select class="rvmReser-select" data-key="' + esc(f.name_key) + '"><option value="">선택</option>';
          opts.forEach(function (o) {
            html += '<option value="' + esc(o) + '"' + (cur === o ? ' selected' : '') + '>' + esc(o) + '</option>';
          });
          html += '</select>';
        }
        html += '</div>';
      });
      html += '</div></div>';
      hostEl.innerHTML = html;

      /* 입력값 st.extra 동기화 */
      hostEl.querySelectorAll('[data-key]').forEach(function (el) {
        var key = el.getAttribute('data-key');
        el.addEventListener('change', function () {
          if (el.type === 'checkbox') {
            var arr = Array.from(hostEl.querySelectorAll('input[type=checkbox][data-key="' + key + '"]:checked')).map(function(x){ return x.value; });
            st.extra[key] = arr;
          } else if (el.type === 'radio') {
            if (el.checked) st.extra[key] = el.value;
          } else {
            st.extra[key] = el.value;
          }
        });
        el.addEventListener('input', function () {
          if (el.type !== 'checkbox' && el.type !== 'radio') st.extra[key] = el.value;
        });
        /* 초기값 동기화 */
        if (el.type === 'checkbox') {
          var arr = Array.from(hostEl.querySelectorAll('input[type=checkbox][data-key="' + key + '"]:checked')).map(function(x){ return x.value; });
          if (arr.length) st.extra[key] = arr;
        } else if (el.tagName === 'SELECT' || el.type === 'radio') {
          if (el.value) st.extra[key] = el.value;
        }
      });
    }

    /* ── 예약 제출 ─────────────────────────────────── */
    function doSubmit() {
      /* 마지막 단계 유효성 검사 */
      var err = validateStep(st.plan[st.stepIndex]);
      if (err) { showMsg(err, false); return; }
      /* extra_json 최신화 */
      hostEl.querySelectorAll('[data-key]').forEach(function (el) {
        var key = el.getAttribute('data-key');
        if (!key) return;
        if (el.type === 'checkbox') {
          var arr = Array.from(hostEl.querySelectorAll('input[type=checkbox][data-key="' + key + '"]:checked')).map(function(x){ return x.value; });
          st.extra[key] = arr;
        } else if (el.type === 'radio') {
          if (el.checked) st.extra[key] = el.value;
        } else {
          st.extra[key] = el.value;
        }
      });

      var payload = {
        branch_id:      st.branchId,
        customer_name:  st.extra['customer_name'] || '',
        customer_phone: st.extra['customer_phone'] || '',
        customer_email: st.extra['customer_email'] || '',
        slot_id:        st.slotId || undefined,
        item_quota_id:  st.itemQuotaId || undefined,
        extra:          st.extra,
      };

      if (actEl) actEl.innerHTML = '<p class="rvmReser-loading">예약 중…</p>';
      call(slug, 'book', payload, 'POST').then(function (data) {
        if (!data.ok) {
          showMsg(data.msg || '예약에 실패했습니다. 다시 시도해 주세요.', false);
          renderActions();
          return;
        }
        /* 완료 화면 */
        if (hostEl) {
          hostEl.innerHTML =
            '<div class="rvmReser-step-inner rvmReser-done">' +
            '<div class="rvmReser-done-icon">✅</div>' +
            '<h3>예약이 완료되었습니다!</h3>' +
            '<p class="rvmReser-done-no">예약번호: <strong>' + esc(data.reservation_no || '') + '</strong></p>' +
            '<p class="rvmReser-done-sub">조회 시 예약번호 또는 이름+연락처를 이용하세요.</p>' +
            '</div>';
        }
        if (progEl) progEl.innerHTML = '';
        if (actEl)  actEl.innerHTML  = '';
        showMsg('');
      }).catch(function () {
        showMsg('네트워크 오류가 발생했습니다.', false);
        renderActions();
      });
    }

    /* ── 초기 로드 ─────────────────────────────────── */
    if (!hostEl) return;
    hostEl.innerHTML = '<p class="rvmReser-loading">예약 정보 로딩 중…</p>';
    call(slug, 'config', {}, 'GET').then(function (data) {
      if (!data.ok) {
        hostEl.innerHTML = '<p class="rvmReser-empty">예약 설정을 불러올 수 없습니다.<br><small>' + esc(data.msg || '') + '</small></p>';
        return;
      }
      st.cfg  = data;
      st.plan = buildPlan(data);

      if (!st.plan.length) {
        hostEl.innerHTML = '<p class="rvmReser-empty">예약 단계가 설정되지 않았습니다.</p>';
        return;
      }

      var capHintText = '';
      if (capHint) {
        if (data.capacity_mode === 'item') capHintText = '항목별 예약 방식입니다.';
        capHint.textContent = capHintText;
        capHint.hidden = !capHintText;
      }

      goStep(0);
    }).catch(function () {
      hostEl.innerHTML = '<p class="rvmReser-empty">예약 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.</p>';
    });

    /* ════════════════════════════════════════════════
       예약 조회 (lookup)
    ════════════════════════════════════════════════ */
    var lookupSuite = root.querySelector('.rvmReser-lookup-wrap');
    if (!lookupSuite) return;

    var luMsg    = root.querySelector('#rvmReser-lookup-msg');
    var luResult = root.querySelector('#rvmReser-result');
    var luNoEl   = root.querySelector('#rvmReser-lookup-no');
    var luNameEl = root.querySelector('#rvmReser-lookup-name');
    var luPhEl   = root.querySelector('#rvmReser-lookup-phone');
    var luBtn    = root.querySelector('#rvmReser-lookup-btn');

    function showLuMsg(text, ok) {
      if (!luMsg) return;
      luMsg.innerHTML = text ? '<div class="rvmReser-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>' : '';
    }

    function renderBookingCard(bk) {
      var statusCls = bk.status === '완료' ? 'ok' : bk.status === '취소' ? 'bad' : 'warn';
      return '<div class="rvmReser-card rvmReser-result-card">' +
        '<div class="rvmReser-result-row"><span>예약번호</span><strong>' + esc(bk.reservation_no || '') + '</strong></div>' +
        '<div class="rvmReser-result-row"><span>상태</span><span class="rvmReser-pill ' + statusCls + '">' + esc(bk.status) + '</span></div>' +
        '<div class="rvmReser-result-row"><span>지점</span><strong>' + esc(bk.branch_name || '-') + '</strong></div>' +
        '<div class="rvmReser-result-row"><span>예약일시</span><strong>' + esc(bk.reservation_at || '-') + '</strong></div>' +
        (bk.status !== '취소' && bk.status !== '완료'
          ? '<button type="button" class="rvmReser-btn danger" id="rvmReser-cancel-btn" data-id="' + esc(bk.id) + '" style="margin-top:12px;width:100%">예약 취소</button>'
          : '') +
        '</div>';
    }

    if (luBtn) {
      luBtn.onclick = function () {
        var no   = luNoEl   ? (luNoEl.value   || '').trim() : '';
        var name = luNameEl ? (luNameEl.value  || '').trim() : '';
        var ph   = luPhEl   ? (luPhEl.value    || '').trim() : '';

        if (!no && (!name || !ph)) {
          showLuMsg('예약번호 또는 이름+연락처를 입력하세요.', false);
          return;
        }
        showLuMsg('');
        if (luResult) luResult.innerHTML = '<p class="rvmReser-loading">조회 중…</p>';

        var params = no ? { reservation_no: no } : { customer_name: name, customer_phone: ph };
        call(slug, 'lookup', params, 'POST').then(function (data) {
          if (!data.ok || !data.booking) {
            if (luResult) luResult.innerHTML = '';
            showLuMsg(data.msg || '예약 내역을 찾을 수 없습니다.', false);
            return;
          }
          var bk = data.booking;
          if (luResult) {
            luResult.innerHTML = renderBookingCard(bk);
            var cancelBtn = luResult.querySelector('#rvmReser-cancel-btn');
            if (cancelBtn) {
              cancelBtn.onclick = function () {
                if (!confirm('예약을 취소할까요?')) return;
                call(slug, 'cancel', { reservation_no: bk.reservation_no, customer_phone: bk.customer_phone }, 'POST').then(function (cr) {
                  if (!cr.ok) { showLuMsg(cr.msg || '취소 실패', false); return; }
                  showLuMsg('예약이 취소되었습니다.', true);
                  bk.status = '취소';
                  luResult.innerHTML = renderBookingCard(bk);
                });
              };
            }
          }
        }).catch(function () {
          if (luResult) luResult.innerHTML = '';
          showLuMsg('조회 중 오류가 발생했습니다.', false);
        });
      };
    }
  }

  /* ── 부트 ────────────────────────────────────────── */
  function boot() {
    document.querySelectorAll('.rvmReser-suite[data-rvmreser-slug]').forEach(function (root) {
      var slug = (root.getAttribute('data-rvmreser-slug') || '').trim();
      if (!slug) return;
      initRvmReser(root, slug);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
