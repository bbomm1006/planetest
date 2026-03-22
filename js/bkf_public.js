/**
 * bkf_public.js
 * 예약 폼 프론트 위자드 JS
 * bkf_front.php include 후 DOMContentLoaded 에서 bkfInit(slug) 자동 호출
 */

const BKF_API_PUBLIC = '/admin/api_front/bkf_public.php';
const BKF_API_OTP    = '/admin/api_front/bkf_phone_otp.php';

// 폼별 상태 저장소 (여러 폼 동시 지원)
const _bkfState = {};

function bkfGetState(s) {
  if (!_bkfState[s]) {
    _bkfState[s] = {
      cfg:        null,   // get_config 응답
      plan:       [],     // 활성 step_key 순서
      stepIndex:  0,
      // 선택값
      storeId:    null,
      storeName:  '',
      dateYmd:    '',
      timeSlot:   '',
      itemVal:    '',
      // 캘린더
      calYear:    0,
      calMonth:   0,
      calDays:    {},
      calSlots:   [],
      // 번호인증
      otpToken:   '',
      otpVerified: false,
      otpTimer:   null,
    };
  }
  return _bkfState[s];
}

// ─────────────────────────────────────
// API 헬퍼
// ─────────────────────────────────────
function bkfGet(slug, action, params) {
  const q = new URLSearchParams({ slug, action, ...params });
  return fetch(BKF_API_PUBLIC + '?' + q).then(r => r.json());
}
function bkfPost(slug, action, body) {
  return fetch(BKF_API_PUBLIC, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body:    JSON.stringify({ slug, action, ...body }),
  }).then(r => r.json());
}
function bkfOtpPost(action, body) {
  return fetch(BKF_API_OTP, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body:    JSON.stringify({ action, ...body }),
  }).then(r => r.json());
}

function bkfEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────
// 뷰 전환
// ─────────────────────────────────────
function bkfShowView(s, viewKey) {
  ['wizard','done','lookup'].forEach(k => {
    const el = document.getElementById(`bkf-view-${k}-${s}`);
    if (el) el.classList.toggle('bkf-active', k === viewKey);
  });
  const lookupLink = document.getElementById(`bkf-lookup-link-${s}`);
  if (lookupLink) lookupLink.style.display = viewKey === 'wizard' ? '' : 'none';
}

// ─────────────────────────────────────
// 에러 표시
// ─────────────────────────────────────
function bkfShowError(s, msg) {
  const el = document.getElementById(`bkf-error-${s}`);
  if (!el) return;
  el.textContent  = msg || '';
  el.style.display = msg ? '' : 'none';
}

// ─────────────────────────────────────
// 진행바 렌더
// ─────────────────────────────────────
const BKF_STEP_LABEL = {
  store: '지점', date: '날짜', time_slot: '시간',
  item: '항목', info: '정보입력',
};

function bkfRenderProgress(s) {
  const st  = bkfGetState(s);
  const el  = document.getElementById(`bkf-progress-${s}`);
  if (!el) return;
  el.innerHTML = st.plan.map((k, i) => {
    const cls = i < st.stepIndex ? 'done' : i === st.stepIndex ? 'on' : '';
    return `<span class="bkf-progress-step ${cls}" data-step="${i+1}">${bkfEsc(BKF_STEP_LABEL[k] || k)}</span>`;
  }).join('');
}

// ─────────────────────────────────────
// 이전 / 다음 버튼 상태
// ─────────────────────────────────────
function bkfUpdateNav(s) {
  const st     = bkfGetState(s);
  const isFirst = st.stepIndex === 0;
  const isLast  = st.stepIndex === st.plan.length - 1;
  const backBtn   = document.getElementById(`bkf-btn-back-${s}`);
  const nextBtn   = document.getElementById(`bkf-btn-next-${s}`);
  const submitBtn = document.getElementById(`bkf-btn-submit-${s}`);
  if (backBtn)   backBtn.style.display   = isFirst ? 'none' : '';
  if (nextBtn)   nextBtn.style.display   = isLast  ? 'none' : '';
  if (submitBtn) submitBtn.style.display = isLast  ? '' : 'none';
}

// ─────────────────────────────────────
// 선택 요약 칩
// ─────────────────────────────────────
function bkfBuildSummary(s) {
  const st   = bkfGetState(s);
  const chips = [];
  if (st.storeName)  chips.push(`📍 ${bkfEsc(st.storeName)}`);
  if (st.dateYmd)    chips.push(`📅 ${bkfEsc(st.dateYmd)}`);
  if (st.timeSlot)   chips.push(`🕐 ${bkfEsc(st.timeSlot)}`);
  if (st.itemVal)    chips.push(`📌 ${bkfEsc(st.itemVal)}`);
  if (!chips.length) return '';
  return `<div class="bkf-summary-chips">${chips.map(c => `<span class="bkf-chip">${c}</span>`).join('')}</div>`;
}

// ─────────────────────────────────────
// 스텝 렌더 라우터
// ─────────────────────────────────────
function bkfRenderStep(s) {
  const st  = bkfGetState(s);
  const key = st.plan[st.stepIndex];
  const wrap = document.getElementById(`bkf-step-wrap-${s}`);
  if (!wrap) return;

  bkfShowError(s, '');
  bkfRenderProgress(s);
  bkfUpdateNav(s);

  const summary = st.stepIndex > 0 ? bkfBuildSummary(s) : '';

  if (key === 'store')     bkfStepStore(s, wrap, summary);
  else if (key === 'date') bkfStepDate(s, wrap, summary);
  else if (key === 'time_slot') bkfStepTimeSlot(s, wrap, summary);
  else if (key === 'item') bkfStepItem(s, wrap, summary);
  else if (key === 'info') bkfStepInfo(s, wrap, summary);
}

// ─────────────────────────────────────
// Step: 지점 선택
// ─────────────────────────────────────
function bkfStepStore(s, wrap, summary) {
  const st = bkfGetState(s);
  wrap.innerHTML = summary + `<p class="bkf-step-title">지점 선택</p>
    <div class="bkf-loading"><div class="bkf-spinner"></div><span>불러오는 중...</span></div>`;

  bkfGet(s, 'get_stores', {}).then(res => {
    if (!res.ok || !res.data || !res.data.length) {
      wrap.innerHTML = summary + `<p style="color:#6b7280;font-size:.88rem;">연결된 지점이 없습니다.</p>`;
      return;
    }
    const stores = res.data;
    if (!st.storeId) { st.storeId = stores[0].id; st.storeName = stores[0].store_name || stores[0].branch_name || ''; }

    wrap.innerHTML = summary + `<p class="bkf-step-title">지점 선택</p>
      <div class="bkf-store-grid">
        ${stores.map(store => `
          <div class="bkf-store-card ${st.storeId == store.id ? 'bkf-selected' : ''}"
               data-id="${store.id}" data-name="${bkfEsc(store.store_name || store.branch_name || '')}">
            <div class="bkf-store-name">${bkfEsc(store.store_name || store.branch_name || '')}</div>
            ${store.address ? `<div class="bkf-store-addr">${bkfEsc(store.address)}</div>` : ''}
          </div>`).join('')}
      </div>`;

    wrap.querySelectorAll('.bkf-store-card').forEach(card => {
      card.onclick = () => {
        wrap.querySelectorAll('.bkf-store-card').forEach(c => c.classList.remove('bkf-selected'));
        card.classList.add('bkf-selected');
        st.storeId   = parseInt(card.dataset.id);
        st.storeName = card.dataset.name;
        // 날짜 캐시 초기화
        st.dateYmd = ''; st.timeSlot = ''; st.calDays = {};
      };
    });
  });
}

// ─────────────────────────────────────
// Step: 날짜 선택 (캘린더)
// ─────────────────────────────────────
function bkfStepDate(s, wrap, summary) {
  const st = bkfGetState(s);
  if (!st.calYear) {
    const now = new Date();
    st.calYear  = now.getFullYear();
    st.calMonth = now.getMonth() + 1;
  }

  function loadCal() {
    wrap.innerHTML = summary + `<p class="bkf-step-title">날짜 선택</p>
      <div class="bkf-loading"><div class="bkf-spinner"></div><span>불러오는 중...</span></div>`;

    const params = { year: st.calYear, month: st.calMonth };
    if (st.storeId) params.store_id = st.storeId;

    bkfGet(s, 'get_calendar', params).then(res => {
      if (!res.ok) { bkfShowError(s, res.msg || '달력 오류'); return; }
      st.calDays = res.days || {};
      paintCal();
    });
  }

  function paintCal() {
    const today     = new Date().toISOString().slice(0, 10);
    const firstDay  = new Date(st.calYear, st.calMonth - 1, 1).getDay();
    const daysInMon = new Date(st.calYear, st.calMonth, 0).getDate();
    const weekDays  = ['일','월','화','수','목','금','토'];

    let cal = `
      <div class="bkf-cal-nav">
        <button class="bkf-cal-nav-btn" id="bkf-cal-prev-${s}">‹</button>
        <span class="bkf-cal-month">${st.calYear}년 ${st.calMonth}월</span>
        <button class="bkf-cal-nav-btn" id="bkf-cal-next-${s}">›</button>
      </div>
      <table class="bkf-calendar"><thead><tr>
        ${weekDays.map(d => `<th>${d}</th>`).join('')}
      </tr></thead><tbody><tr>`;

    for (let i = 0; i < firstDay; i++) cal += `<td class="bkf-cal-empty"></td>`;

    for (let d = 1; d <= daysInMon; d++) {
      const ds  = `${st.calYear}-${String(st.calMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const day = st.calDays[ds];
      const isPast = ds < today;
      const isFull = day && day.full;
      const isOpen = !isPast && (!day || day.open);
      const isSel  = st.dateYmd === ds;

      let cls = '';
      if (isPast)        cls = 'bkf-cal-past';
      else if (isFull)   cls = 'bkf-cal-full';
      else if (isSel)    cls = 'bkf-cal-selected';
      else if (ds === today) cls = 'bkf-cal-today';

      const clickable = isOpen && !isFull
        ? `data-d="${ds}" style="cursor:pointer;"` : '';

      cal += `<td class="${cls}" ${clickable}>${d}</td>`;

      if ((firstDay + d) % 7 === 0 && d !== daysInMon) cal += `</tr><tr>`;
    }

    const lastPos = (firstDay + daysInMon - 1) % 7;
    if (lastPos < 6) {
      for (let i = lastPos + 1; i <= 6; i++) cal += `<td class="bkf-cal-empty"></td>`;
    }
    cal += `</tr></tbody></table>`;

    wrap.innerHTML = summary + `<p class="bkf-step-title">날짜 선택</p>` + cal;

    document.getElementById(`bkf-cal-prev-${s}`).onclick = () => {
      st.calMonth--;
      if (st.calMonth < 1) { st.calMonth = 12; st.calYear--; }
      loadCal();
    };
    document.getElementById(`bkf-cal-next-${s}`).onclick = () => {
      st.calMonth++;
      if (st.calMonth > 12) { st.calMonth = 1; st.calYear++; }
      loadCal();
    };
    wrap.querySelectorAll('[data-d]').forEach(td => {
      td.onclick = () => {
        wrap.querySelectorAll('[data-d]').forEach(t => t.classList.remove('bkf-cal-selected'));
        td.classList.add('bkf-cal-selected');
        st.dateYmd  = td.dataset.d;
        st.timeSlot = ''; // 날짜 바뀌면 시간 초기화
      };
    });
  }

  loadCal();
}

// ─────────────────────────────────────
// Step: 시간 슬롯 선택
// ─────────────────────────────────────
function bkfStepTimeSlot(s, wrap, summary) {
  const st = bkfGetState(s);
  wrap.innerHTML = summary + `<p class="bkf-step-title">시간 선택</p>
    <div class="bkf-loading"><div class="bkf-spinner"></div><span>불러오는 중...</span></div>`;

  const params = { date: st.dateYmd };
  if (st.storeId) params.store_id = st.storeId;

  bkfGet(s, 'get_slots', params).then(res => {
    if (!res.ok) { bkfShowError(s, res.msg || '시간 조회 실패'); return; }
    const slots = res.slots || [];
    if (!slots.length) {
      wrap.innerHTML = summary + `<p class="bkf-step-title">시간 선택</p>
        <p style="color:#6b7280;font-size:.88rem;padding:20px 0;">선택한 날짜에 예약 가능한 시간이 없습니다.</p>`;
      return;
    }

    wrap.innerHTML = summary + `<p class="bkf-step-title">${bkfEsc(st.dateYmd)} 시간 선택</p>
      <div class="bkf-slot-grid">
        ${slots.map(sl => `
          <button type="button"
            class="bkf-slot-btn ${st.timeSlot === sl.slot_time ? 'bkf-selected' : ''}"
            data-time="${bkfEsc(sl.slot_time)}"
            ${sl.available ? '' : 'disabled'}>
            ${bkfEsc(sl.slot_time)}
            <span class="bkf-slot-remaining">
              ${sl.full ? '마감' : sl.capacity > 0 ? `잔여 ${sl.remaining}석` : ''}
            </span>
          </button>`).join('')}
      </div>`;

    wrap.querySelectorAll('.bkf-slot-btn:not(:disabled)').forEach(btn => {
      btn.onclick = () => {
        wrap.querySelectorAll('.bkf-slot-btn').forEach(b => b.classList.remove('bkf-selected'));
        btn.classList.add('bkf-selected');
        st.timeSlot = btn.dataset.time;
      };
    });
  });
}

// ─────────────────────────────────────
// Step: 항목 선택
// ─────────────────────────────────────
function bkfStepItem(s, wrap, summary) {
  const st  = bkfGetState(s);
  const cfg = st.cfg;
  // 항목 옵션은 get_config 에서 item_select 타입 필드 options 사용
  const itemField = (cfg.fields || []).find(f => f.type === 'item_select');
  const options   = itemField ? (itemField.options || []) : [];

  if (!options.length) {
    wrap.innerHTML = summary + `<p class="bkf-step-title">항목 선택</p>
      <p style="color:#6b7280;font-size:.88rem;padding:20px 0;">등록된 항목이 없습니다.</p>`;
    return;
  }

  wrap.innerHTML = summary + `<p class="bkf-step-title">항목 선택</p>
    <div class="bkf-item-grid">
      ${options.map(opt => `
        <div class="bkf-item-card ${st.itemVal === opt ? 'bkf-selected' : ''}" data-val="${bkfEsc(opt)}">
          ${bkfEsc(opt)}
        </div>`).join('')}
    </div>`;

  wrap.querySelectorAll('.bkf-item-card').forEach(card => {
    card.onclick = () => {
      wrap.querySelectorAll('.bkf-item-card').forEach(c => c.classList.remove('bkf-selected'));
      card.classList.add('bkf-selected');
      st.itemVal = card.dataset.val;
    };
  });
}

// ─────────────────────────────────────
// Step: 정보입력
// ─────────────────────────────────────
function bkfStepInfo(s, wrap, summary) {
  const st  = bkfGetState(s);
  const cfg = st.cfg;
  const phoneVerify = cfg.form && parseInt(cfg.form.phone_verify_use) === 1;

  const fields = (cfg.fields || [])
    .filter(f => f.type !== 'store_select' && f.type !== 'date'
              && f.type !== 'time_slot' && f.type !== 'item_select')
    .sort((a, b) => a.sort_order - b.sort_order);

  let html = summary + `<p class="bkf-step-title">예약자 정보</p>`;

  fields.forEach(f => {
    const req     = parseInt(f.is_required) === 1;
    const reqMark = req ? `<em>*</em>` : '';
    const fid     = `bkf-fi-${s}-${f.field_key}`;

    if (f.field_key === 'phone') {
      // 전화번호 — 번호인증 포함
      html += `<div class="bkf-fg">
        <label class="bkf-label">전화번호 ${reqMark}</label>
        <div class="bkf-phone-row">
          <input type="tel" class="bkf-fi" id="${fid}" placeholder="010-0000-0000" inputmode="numeric"/>
          ${phoneVerify ? `<button type="button" class="bkf-btn-verify" id="bkf-otp-send-${s}" onclick="bkfSendOtp('${s}','submit')">인증</button>` : ''}
        </div>
        ${phoneVerify ? `
          <div id="bkf-otp-wrap-${s}" style="display:none;margin-top:8px;">
            <div class="bkf-phone-row">
              <input type="text" class="bkf-fi" id="bkf-otp-code-${s}"
                     placeholder="인증번호 6자리" maxlength="6" inputmode="numeric"
                     style="letter-spacing:4px;font-weight:700;"/>
              <button type="button" class="bkf-btn-verify" onclick="bkfVerifyOtp('${s}','submit')">확인</button>
            </div>
            <p class="bkf-otp-timer" id="bkf-otp-timer-${s}"></p>
          </div>
          <div id="bkf-otp-verified-${s}" style="display:none;color:#16a34a;font-size:.8rem;margin-top:4px;font-weight:600;">✓ 번호 인증 완료</div>
        ` : ''}
      </div>`;
      return;
    }

    if (f.field_key === 'name') {
      html += `<div class="bkf-fg">
        <label class="bkf-label">이름 ${reqMark}</label>
        <input type="text" class="bkf-fi" id="${fid}" placeholder="홍길동" autocomplete="name"/>
      </div>`;
      return;
    }

    if (f.type === 'text') {
      html += `<div class="bkf-fg">
        <label class="bkf-label">${bkfEsc(f.label)} ${reqMark}</label>
        <input type="text" class="bkf-fi" id="${fid}" data-key="${f.field_key}"
               placeholder="${bkfEsc(f.placeholder || '')}"/>
      </div>`;
    } else if (f.type === 'dropdown') {
      html += `<div class="bkf-fg">
        <label class="bkf-label">${bkfEsc(f.label)} ${reqMark}</label>
        <select class="bkf-fi" id="${fid}" data-key="${f.field_key}">
          <option value="">선택하세요</option>
          ${(f.options || []).map(o => `<option value="${bkfEsc(o)}">${bkfEsc(o)}</option>`).join('')}
        </select>
      </div>`;
    } else if (f.type === 'radio') {
      html += `<div class="bkf-fg">
        <label class="bkf-label">${bkfEsc(f.label)} ${reqMark}</label>
        <div class="bkf-radio-group" id="${fid}" data-key="${f.field_key}">
          ${(f.options || []).map(o => `
            <label class="bkf-radio-opt">
              <input type="radio" name="bkf-r-${s}-${f.field_key}" value="${bkfEsc(o)}"/> ${bkfEsc(o)}
            </label>`).join('')}
        </div>
      </div>`;
    } else if (f.type === 'checkbox') {
      html += `<div class="bkf-fg">
        <label class="bkf-label">${bkfEsc(f.label)} ${reqMark}</label>
        <div class="bkf-check-group" id="${fid}" data-key="${f.field_key}">
          ${(f.options || []).map(o => `
            <label class="bkf-check-opt">
              <input type="checkbox" value="${bkfEsc(o)}"/> ${bkfEsc(o)}
            </label>`).join('')}
        </div>
      </div>`;
    } else if (f.type === 'date_range') {
      html += `<div class="bkf-fg">
        <label class="bkf-label">${bkfEsc(f.label)} ${reqMark}</label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input type="date" class="bkf-fi" id="${fid}-start" data-key="${f.field_key}" style="flex:1;min-width:130px;"/>
          <span style="color:#6b7280;">~</span>
          <input type="date" class="bkf-fi" id="${fid}-end" style="flex:1;min-width:130px;"/>
        </div>
      </div>`;
    }
  });

  wrap.innerHTML = html;

  // 라디오/체크박스 시각 선택 토글
  wrap.querySelectorAll('.bkf-radio-opt input[type=radio]').forEach(inp => {
    inp.onchange = () => {
      const grp = inp.closest('.bkf-radio-group');
      grp.querySelectorAll('.bkf-radio-opt').forEach(l => l.classList.remove('bkf-selected'));
      inp.closest('.bkf-radio-opt').classList.add('bkf-selected');
    };
  });
  wrap.querySelectorAll('.bkf-check-opt input[type=checkbox]').forEach(inp => {
    inp.onchange = () => inp.closest('.bkf-check-opt').classList.toggle('bkf-selected', inp.checked);
  });
}

// ─────────────────────────────────────
// 이전 스텝
// ─────────────────────────────────────
function bkfPrevStep(s) {
  const st = bkfGetState(s);
  if (st.stepIndex <= 0) return;
  st.stepIndex--;
  bkfRenderStep(s);
}

// ─────────────────────────────────────
// 다음 스텝 (유효성 검사 포함)
// ─────────────────────────────────────
function bkfNextStep(s) {
  const st  = bkfGetState(s);
  const key = st.plan[st.stepIndex];

  if (key === 'store' && !st.storeId) {
    bkfShowError(s, '지점을 선택해 주세요.'); return;
  }
  if (key === 'date' && !st.dateYmd) {
    bkfShowError(s, '날짜를 선택해 주세요.'); return;
  }
  if (key === 'time_slot' && !st.timeSlot) {
    bkfShowError(s, '시간을 선택해 주세요.'); return;
  }
  if (key === 'item' && !st.itemVal) {
    bkfShowError(s, '항목을 선택해 주세요.'); return;
  }

  st.stepIndex++;
  bkfRenderStep(s);
}

// ─────────────────────────────────────
// 예약 제출
// ─────────────────────────────────────
async function bkfSubmit(s) {
  const st  = bkfGetState(s);
  const cfg = st.cfg;
  const phoneVerify = cfg.form && parseInt(cfg.form.phone_verify_use) === 1;
  const wrap = document.getElementById(`bkf-step-wrap-${s}`);

  // 이름/전화번호 수집
  const nameEl  = wrap.querySelector(`[id="bkf-fi-${s}-name"]`);
  const phoneEl = wrap.querySelector(`[id="bkf-fi-${s}-phone"]`);
  const name    = nameEl  ? nameEl.value.trim()  : '';
  const phone   = phoneEl ? phoneEl.value.trim() : '';

  if (!name)  { bkfShowError(s, '이름을 입력해 주세요.'); return; }
  if (!phone) { bkfShowError(s, '전화번호를 입력해 주세요.'); return; }

  // 번호인증 확인
  if (phoneVerify && !st.otpVerified) {
    bkfShowError(s, '전화번호 인증을 완료해 주세요.'); return;
  }

  // 필수 동적 필드 검증
  const fields = (cfg.fields || []).filter(f =>
    f.type !== 'store_select' && f.type !== 'date'
    && f.type !== 'time_slot' && f.type !== 'item_select'
    && !['name','phone'].includes(f.field_key)
  );
  for (const f of fields) {
    if (!parseInt(f.is_required)) continue;
    const fid = `bkf-fi-${s}-${f.field_key}`;
    const el  = document.getElementById(fid);
    if (el && !el.value.trim()) {
      bkfShowError(s, `'${f.label}' 항목을 입력해 주세요.`); return;
    }
  }

  // 동적 필드 값 수집
  const payload = { name, phone };
  if (st.dateYmd)  payload.reservation_date = st.dateYmd;
  if (st.timeSlot) payload.reservation_time = st.timeSlot;
  if (st.storeId)  { payload.store_id = st.storeId; payload.store_name = st.storeName; }
  if (phoneVerify && st.otpToken) payload.otp_token = st.otpToken;

  // 항목 필드
  if (st.itemVal) {
    const itemField = (cfg.fields || []).find(f => f.type === 'item_select');
    if (itemField) payload[itemField.field_key] = st.itemVal;
  }

  fields.forEach(f => {
    const fid = `bkf-fi-${s}-${f.field_key}`;
    if (f.type === 'radio') {
      const chk = wrap.querySelector(`[name="bkf-r-${s}-${f.field_key}"]:checked`);
      if (chk) payload[f.field_key] = chk.value;
    } else if (f.type === 'checkbox') {
      const vals = [...wrap.querySelectorAll(`#${fid} input[type=checkbox]:checked`)].map(c => c.value);
      if (vals.length) payload[f.field_key] = vals.join(',');
    } else if (f.type === 'date_range') {
      const vs = (document.getElementById(`${fid}-start`) || {}).value || '';
      const ve = (document.getElementById(`${fid}-end`)   || {}).value || '';
      if (vs || ve) payload[f.field_key] = `${vs}~${ve}`;
    } else {
      const el = document.getElementById(fid);
      if (el && el.value.trim()) payload[f.field_key] = el.value.trim();
    }
  });

  // 제출 버튼 비활성화
  const submitBtn = document.getElementById(`bkf-btn-submit-${s}`);
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '처리 중…'; }

  try {
    const res = await bkfPost(s, 'submit', payload);
    if (!res.ok) {
      bkfShowError(s, res.msg || '예약에 실패했습니다. 다시 시도해 주세요.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = st.cfg?.form?.btn_name || '예약하기'; }
      return;
    }

    // 완료 화면
    const doneNo  = document.getElementById(`bkf-done-no-${s}`);
    const doneSub = document.getElementById(`bkf-done-sub-${s}`);
    if (doneNo)  doneNo.textContent  = `예약번호: ${res.reservation_no}`;
    if (doneSub) doneSub.textContent = '예약번호를 메모해 두세요. 아래에서 예약을 조회하거나 변경할 수 있습니다.';
    bkfShowView(s, 'done');
  } catch (e) {
    bkfShowError(s, '네트워크 오류가 발생했습니다.');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = st.cfg?.form?.btn_name || '예약하기'; }
  }
}

// 새 예약 (상태 리셋)
function bkfRestart(s) {
  const st = bkfGetState(s);
  Object.assign(st, {
    stepIndex:0, storeId:null, storeName:'', dateYmd:'',
    timeSlot:'', itemVal:'', calDays:{}, calSlots:[],
    otpToken:'', otpVerified:false,
  });
  if (st.otpTimer) { clearInterval(st.otpTimer); st.otpTimer = null; }
  bkfShowView(s, 'wizard');
  bkfRenderStep(s);
}

// ─────────────────────────────────────
// 번호인증 OTP
// ─────────────────────────────────────
async function bkfSendOtp(s, context) {
  const st    = bkfGetState(s);
  const phoneInputId = context === 'lookup'
    ? `bkf-lookup-phone-${s}` : `bkf-fi-${s}-phone`;
  const phone = (document.getElementById(phoneInputId) || {}).value?.trim() || '';

  if (!phone) { bkfShowError(s, '전화번호를 먼저 입력해 주세요.'); return; }

  const sendBtn = document.getElementById(
    context === 'lookup' ? `bkf-lookup-verify-btn-${s}` : `bkf-otp-send-${s}`
  );
  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '발송 중…'; }

  try {
    const res = await bkfOtpPost('send', { phone, slug: s });
    if (!res.ok) {
      bkfShowError(s, res.msg || '인증번호 발송 실패');
      if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = '인증'; }
      return;
    }

    // OTP 입력 UI 표시
    const otpWrap = document.getElementById(
      context === 'lookup' ? `bkf-lookup-otp-${s}` : `bkf-otp-wrap-${s}`
    );
    if (otpWrap) otpWrap.style.display = '';

    // 5분 타이머
    if (st.otpTimer) clearInterval(st.otpTimer);
    let sec = 300;
    const timerId = context === 'lookup' ? `bkf-lookup-otp-timer-${s}` : `bkf-otp-timer-${s}`;
    st.otpTimer = setInterval(() => {
      sec--;
      const el = document.getElementById(timerId);
      if (el) el.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} 후 만료`;
      if (sec <= 0) { clearInterval(st.otpTimer); if (el) el.textContent = '인증번호가 만료되었습니다.'; }
    }, 1000);

    if (sendBtn) { sendBtn.textContent = '재발송'; sendBtn.disabled = false; }
  } catch (e) {
    bkfShowError(s, '네트워크 오류');
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = '인증'; }
  }
}

async function bkfVerifyOtp(s, context) {
  const st   = bkfGetState(s);
  const phoneInputId = context === 'lookup' ? `bkf-lookup-phone-${s}` : `bkf-fi-${s}-phone`;
  const codeInputId  = context === 'lookup' ? `bkf-lookup-otp-code-${s}` : `bkf-otp-code-${s}`;
  const phone = (document.getElementById(phoneInputId) || {}).value?.trim().replace(/\D/g,'') || '';
  const code  = (document.getElementById(codeInputId)  || {}).value?.trim() || '';

  if (!code) { bkfShowError(s, '인증번호를 입력해 주세요.'); return; }

  const res = await bkfOtpPost('verify', { phone, code });
  if (!res.ok) { bkfShowError(s, res.msg || '인증 실패'); return; }

  // 인증 성공
  if (st.otpTimer) { clearInterval(st.otpTimer); st.otpTimer = null; }
  st.otpToken    = res.otp_token;
  st.otpVerified = true;
  bkfShowError(s, '');

  const timerEl = document.getElementById(
    context === 'lookup' ? `bkf-lookup-otp-timer-${s}` : `bkf-otp-timer-${s}`
  );
  if (timerEl) timerEl.textContent = '';

  const verifiedEl = document.getElementById(`bkf-otp-verified-${s}`);
  if (verifiedEl) verifiedEl.style.display = '';

  const otpWrap = document.getElementById(
    context === 'lookup' ? `bkf-lookup-otp-${s}` : `bkf-otp-wrap-${s}`
  );
  if (otpWrap) otpWrap.style.display = 'none';
}

// ─────────────────────────────────────
// 예약 조회
// ─────────────────────────────────────
function bkfSwitchLookupTab(s, tab, btn) {
  document.querySelectorAll(`#bkf-view-lookup-${s} .bkf-lookup-tab`).forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`bkf-lookup-phone-${s}`).style.display = tab === 'phone' ? '' : 'none';
  document.getElementById(`bkf-lookup-no-${s}`).style.display    = tab === 'no'    ? '' : 'none';
  document.getElementById(`bkf-lookup-result-${s}`).innerHTML    = '';
  const errEl = document.getElementById(`bkf-lookup-err-${s}`);
  if (errEl) errEl.style.display = 'none';
}

async function bkfDoLookup(s, mode) {
  const errEl    = document.getElementById(`bkf-lookup-err-${s}`);
  const resultEl = document.getElementById(`bkf-lookup-result-${s}`);
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  resultEl.innerHTML = `<div class="bkf-loading"><div class="bkf-spinner"></div><span>조회 중...</span></div>`;

  let payload = {};
  if (mode === 'phone') {
    const name  = (document.getElementById(`bkf-lookup-name-${s}`)  || {}).value?.trim() || '';
    const phone = (document.getElementById(`bkf-lookup-phone-${s}`) || {}).value?.trim() || '';
    if (!name || !phone) {
      resultEl.innerHTML = '';
      if (errEl) { errEl.textContent = '이름과 전화번호를 모두 입력해 주세요.'; errEl.style.display = ''; }
      return;
    }
    payload = { name, phone };
  } else {
    const no = (document.getElementById(`bkf-lookup-no-input-${s}`) || {}).value?.trim() || '';
    if (!no) {
      resultEl.innerHTML = '';
      if (errEl) { errEl.textContent = '예약번호를 입력해 주세요.'; errEl.style.display = ''; }
      return;
    }
    payload = { reservation_no: no };
  }

  try {
    const res = await bkfPost(s, 'lookup', payload);
    if (!res.ok) {
      resultEl.innerHTML = '';
      if (errEl) { errEl.textContent = res.msg || '조회 실패'; errEl.style.display = ''; }
      return;
    }

    const list = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
    if (!list.length) {
      resultEl.innerHTML = `<p style="text-align:center;color:#6b7280;padding:20px 0;font-size:.88rem;">예약 내역을 찾을 수 없습니다.</p>`;
      return;
    }

    resultEl.innerHTML = list.map(b => bkfRenderLookupCard(s, b)).join('');

    // 취소 버튼 이벤트
    resultEl.querySelectorAll('.bkf-cancel-btn-trigger').forEach(btn => {
      btn.onclick = () => bkfCancelReservation(s, btn.dataset.no, btn.dataset.phone);
    });
  } catch (e) {
    resultEl.innerHTML = '';
    if (errEl) { errEl.textContent = '네트워크 오류가 발생했습니다.'; errEl.style.display = ''; }
  }
}

function bkfRenderLookupCard(s, b) {
  const statusColor = { '접수':'#3b82f6','확인':'#f59e0b','완료':'#22c55e','취소':'#94a3b8' };
  const color = statusColor[b.status] || '#94a3b8';
  const canCancel = b.status === '접수';

  return `
    <div class="bkf-lookup-card">
      <div class="bkf-lookup-card-head">
        <span class="bkf-lookup-card-no">${bkfEsc(b.reservation_no || '-')}</span>
        <span class="bkf-status-badge"
          style="background:${color}22;color:${color};border:1px solid ${color}44;">
          ${bkfEsc(b.status)}
        </span>
      </div>
      <div class="bkf-lookup-row">
        <span class="bkf-lookup-row-label">이름</span>
        <span class="bkf-lookup-row-val">${bkfEsc(b.name || '-')}</span>
      </div>
      <div class="bkf-lookup-row">
        <span class="bkf-lookup-row-label">예약일</span>
        <span class="bkf-lookup-row-val">${bkfEsc(b.reservation_date || '-')} ${bkfEsc(b.reservation_time ? b.reservation_time.slice(0,5) : '')}</span>
      </div>
      ${b.store_name ? `<div class="bkf-lookup-row">
        <span class="bkf-lookup-row-label">지점</span>
        <span class="bkf-lookup-row-val">${bkfEsc(b.store_name)}</span>
      </div>` : ''}
      <div class="bkf-lookup-row">
        <span class="bkf-lookup-row-label">접수일</span>
        <span class="bkf-lookup-row-val">${b.created_at ? b.created_at.slice(0,16) : '-'}</span>
      </div>
      ${canCancel ? `
        <div class="bkf-lookup-card-actions">
          <button type="button" class="bkf-btn-cancel bkf-cancel-btn-trigger"
                  data-no="${bkfEsc(b.reservation_no)}" data-phone="${bkfEsc(b.phone || '')}">
            예약 취소
          </button>
        </div>` : ''}
    </div>`;
}

async function bkfCancelReservation(s, reservationNo, phone) {
  if (!confirm(`예약을 취소하시겠습니까?\n\n예약번호: ${reservationNo}`)) return;
  const res = await bkfPost(s, 'cancel', { reservation_no: reservationNo, phone });
  if (res.ok) {
    alert('예약이 취소되었습니다.');
    bkfDoLookup(s, reservationNo ? 'no' : 'phone');
  } else {
    alert(res.msg || '취소에 실패했습니다.');
  }
}

// ─────────────────────────────────────
// 초기화 (DOMContentLoaded 에서 자동 호출)
// ─────────────────────────────────────
async function bkfInit(s) {
  // 로딩 표시
  const loadingEl = document.getElementById(`bkf-loading-${s}`);
  if (loadingEl) loadingEl.style.display = '';

  // 모든 뷰 숨김
  bkfShowView(s, null);

  try {
    const res = await bkfGet(s, 'get_config', {});
    if (!res.ok) {
      if (loadingEl) loadingEl.innerHTML = `<p style="color:#6b7280;">${bkfEsc(res.msg || '예약 폼을 불러올 수 없습니다.')}</p>`;
      return;
    }

    const st = bkfGetState(s);
    st.cfg  = res;

    // 제목 표시
    const titleEl = document.getElementById(`bkf-title-${s}`);
    if (titleEl) titleEl.textContent = res.form?.title || '';

    // 활성 스텝 계획 수립
    st.plan = (res.steps || [])
      .filter(step => parseInt(step.is_active) === 1)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(step => step.step_key);

    if (!st.plan.length) {
      if (loadingEl) loadingEl.innerHTML = `<p style="color:#6b7280;">활성화된 예약 단계가 없습니다. 관리자에서 설정해 주세요.</p>`;
      return;
    }

    // 번호인증 사용 시 조회탭에도 인증 버튼 표시
    if (parseInt(res.form?.phone_verify_use) === 1) {
      const verifyBtn = document.getElementById(`bkf-lookup-verify-btn-${s}`);
      if (verifyBtn) verifyBtn.style.display = '';
    }

    if (loadingEl) loadingEl.style.display = 'none';

    st.stepIndex = 0;
    bkfShowView(s, 'wizard');
    bkfRenderStep(s);

  } catch (e) {
    if (loadingEl) loadingEl.innerHTML = `<p style="color:#6b7280;">네트워크 오류가 발생했습니다.</p>`;
  }
}
