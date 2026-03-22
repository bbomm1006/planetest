// =====================================================
// BKF ADMIN — 전역 변수
// =====================================================
let bkfCurrentFormId   = 0;
let bkfCurrentFormData = {};
let bkfSlugChecked     = false;
let bkfSaving          = false;
let bkfFieldDragSrc    = null;
let bkfOptDragSrc      = null;
let bkfStepDragSrc     = null;

// escHtml: XSS 방지
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// bkfApiGet / bkfApiPost: JSON 파싱 에러를 잡는 안전 래퍼
async function bkfApiGet(url, params = {}) {
  try { return await apiGet(url, params); }
  catch(e) { console.error('[BKF] GET 오류', url, e); return { ok: false, msg: '서버 응답 오류' }; }
}
async function bkfApiPost(url, data = {}) {
  try { return await apiPost(url, data); }
  catch(e) { console.error('[BKF] POST 오류', url, e); return { ok: false, msg: '서버 응답 오류' }; }
}

// 저장 잠금 헬퍼
function bkfLock(btn)   {
  bkfSaving = true;
  if (btn) { btn.disabled = true; btn._orig = btn.textContent; btn.textContent = '저장 중...'; }
}
function bkfUnlock(btn) {
  bkfSaving = false;
  if (btn) { btn.disabled = false; btn.textContent = btn._orig || '저장'; }
}

// =====================================================
// 초기화 (DOMContentLoaded)
// =====================================================
document.addEventListener('DOMContentLoaded', function () {
  // slug 입력 시 중복확인 초기화
  const slugInput = document.getElementById('bkf_create_slug');
  if (slugInput) {
    slugInput.addEventListener('input', function () {
      bkfSlugChecked = false;
      document.getElementById('bkf_create_submit_btn').disabled = true;
      document.getElementById('bkf_create_slug_msg').textContent = '';
    });
  }
});

// =====================================================
// 슬러그 중복 확인
// =====================================================
async function bkfCheckSlug() {
  const slug  = document.getElementById('bkf_create_slug').value.trim();
  const msgEl = document.getElementById('bkf_create_slug_msg');
  const btn   = document.getElementById('bkf_create_submit_btn');

  msgEl.textContent = '';
  btn.disabled = true;
  bkfSlugChecked = false;

  if (!slug) {
    msgEl.style.color = '#dc2626';
    msgEl.textContent = '슬러그를 입력해 주세요.';
    return;
  }

  const res = await bkfApiGet('api/bkf_admin.php', { action: 'check_slug', slug });
  if (res.ok) {
    msgEl.style.color = '#16a34a';
    msgEl.textContent = '✓ ' + (res.msg || '사용 가능합니다.');
    btn.disabled  = false;
    bkfSlugChecked = true;
  } else {
    msgEl.style.color = '#dc2626';
    msgEl.textContent = '✗ ' + (res.msg || '사용할 수 없습니다.');
  }
}

// =====================================================
// 폼 생성
// =====================================================
async function bkfCreateForm() {
  if (bkfSaving) return;
  if (!bkfSlugChecked) { showToast('슬러그 중복 확인을 먼저 해주세요.', 'error'); return; }

  const submitBtn = document.getElementById('bkf_create_submit_btn');
  bkfLock(submitBtn);

  const title = document.getElementById('bkf_create_title').value.trim();
  const btn   = document.getElementById('bkf_create_btn').value.trim();
  const slug  = document.getElementById('bkf_create_slug').value.trim();

  if (!title || !slug) {
    showToast('폼 제목과 슬러그를 입력해 주세요.', 'error');
    bkfUnlock(submitBtn);
    return;
  }

  const res = await bkfApiPost('api/bkf_admin.php', {
    action: 'create_form', title, btn_name: btn, slug,
  });

  if (res.ok) {
    showToast('예약 폼이 생성되었습니다.');
    document.getElementById('bkf_create_title').value = '';
    document.getElementById('bkf_create_btn').value   = '예약하기';
    document.getElementById('bkf_create_slug').value  = '';
    document.getElementById('bkf_create_slug_msg').textContent = '';
    document.getElementById('bkf_create_submit_btn').disabled  = true;
    bkfSlugChecked = false;
    await bkfLoadFormList();
  } else {
    showToast(res.msg || '오류가 발생했습니다.', 'error');
  }
  bkfUnlock(submitBtn);
}

// =====================================================
// 폼 목록 로드
// =====================================================
async function bkfLoadFormList() {
  const res   = await bkfApiGet('api/bkf_admin.php', { action: 'list_forms' });
  const tbody = document.getElementById('bkfFormTableBody');
  if (!tbody) return;

  if (!res.ok || !res.data || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8;">등록된 예약 폼이 없습니다.</td></tr>';
    return;
  }

  const quotaModeLabel = { date: '날짜', slot: '시간 슬롯' };

  tbody.innerHTML = res.data.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escHtml(f.title)}</strong></td>
      <td><code style="font-size:.78rem;">${escHtml(f.slug)}</code></td>
      <td style="text-align:center;">
        <span style="font-size:.78rem;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;">
          ${quotaModeLabel[f.quota_mode] || f.quota_mode}
        </span>
      </td>
      <td style="text-align:center;">
        <span class="badge ${f.phone_verify_use == 1 ? 'badge-success' : 'badge-gray'}">
          ${f.phone_verify_use == 1 ? '사용' : '미사용'}
        </span>
      </td>
      <td style="text-align:center;">
        <span class="badge ${f.is_active == 1 ? 'badge-success' : 'badge-gray'}">
          ${f.is_active == 1 ? '사용' : '미사용'}
        </span>
      </td>
      <td style="text-align:center;">${f.record_count || 0}건</td>
      <td>${f.created_at ? f.created_at.slice(0, 16) : '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="bkfOpenDetail(${f.id})">설정</button>
        <button class="btn btn-sm btn-outline" onclick="bkfGoRecords(${f.id}, '${escHtml(f.title.replace(/'/g, "\\'"))}')">예약내역</button>
        <button class="btn btn-sm btn-danger"  onclick="bkfDeleteForm(${f.id}, '${escHtml(f.title.replace(/'/g, "\\'"))}', '${escHtml(f.slug)}')">삭제</button>
      </td>
    </tr>`).join('');

  bkfUpdateSidebar(res.data);
  bkfUpdateCodeSelect(res.data);
}


// =====================================================
// 프론트 적용 코드 UI
// =====================================================
function bkfUpdateCodeSelect(forms) {
  const sel = document.getElementById('bkfCodeSlugSelect');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">-- 폼을 선택하세요 --</option>';
  (forms || []).forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.slug;
    opt.textContent = f.title + ' (' + f.slug + ')';
    sel.appendChild(opt);
  });
  if (prev) sel.value = prev;
  bkfRenderFrontCode();
}

function bkfRenderFrontCode() {
  const sel  = document.getElementById('bkfCodeSlugSelect');
  const area = document.getElementById('bkfFrontCodeArea');
  if (!sel || !area) return;

  const slug = sel.value;
  if (!slug) { area.style.display = 'none'; return; }

  area.style.display = '';

  const phpCode = `<?php $bkf_slug = '${slug}'; include __DIR__ . '/lib/bkf_front.php'; ?>`;
  const cssCode = `<link rel="stylesheet" href="/css/bkf_public.css"/>`;
  const jsCode  = `<script src="/js/bkf_public.js" defer><\/script>`;

  document.getElementById('bkfCodePhp').textContent = phpCode;
  document.getElementById('bkfCodeCss').textContent = cssCode;
  document.getElementById('bkfCodeJs').textContent  = jsCode.replace('\/', '/');
}

function bkfCopyCode(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    showToast('복사되었습니다.', 'success');
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = el.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('복사되었습니다.', 'success');
  });
}

// =====================================================
// 사이드바 동적 폼 메뉴 업데이트
// =====================================================
function bkfUpdateSidebar(forms) {
  const sub = document.getElementById('bkfNavSub');
  if (!sub) return;

  // 기존 동적 항목 제거
  sub.querySelectorAll('.bkf-dynamic-nav').forEach(el => el.remove());

  (forms || []).filter(f => f.is_active == 1).forEach(f => {
    const div = document.createElement('div');
    div.className = 'nav-sub-link bkf-dynamic-nav';
    div.textContent = f.title + ' 내역';
    div.onclick = function() {
      bkfGoRecords(f.id, f.title);
    };
    sub.appendChild(div);
    PAGE_LABELS['bkfRecords_' + f.id] = ['예약 폼', f.title + ' 내역'];
  });
}

// =====================================================
// 예약 폼 삭제
// =====================================================
async function bkfDeleteForm(formId, title, slug) {
  const ok = confirm(
    `⚠️ 예약 폼을 삭제하시겠습니까?\n\n` +
    `폼명: ${title}\n슬러그: ${slug}\n\n` +
    `삭제 시 모든 예약 내역, 필드, 스텝, 수량, 담당자 데이터가\n` +
    `영구 삭제되며 복구할 수 없습니다.\n\n정말 삭제하시겠습니까?`
  );
  if (!ok) return;

  const res = await bkfApiPost('api/bkf_admin.php', { action: 'delete_form', id: formId });
  if (res.ok) {
    showToast('폼이 삭제되었습니다.');
    await bkfLoadFormList();
  } else {
    showToast(res.msg || '삭제 실패', 'error');
  }
}

// 예약내역 탭으로 바로 이동
async function bkfGoRecords(formId, title) {
  bkfCurrentFormId = formId;

  // bkfCurrentFormData가 없거나 다른 폼이면 API로 채우기
  if (!bkfCurrentFormData.id || bkfCurrentFormData.id !== formId) {
    const res = await bkfApiGet('api/bkf_admin.php', { action: 'get_form', id: formId });
    if (res.ok) bkfCurrentFormData = res.data;
  }

  showPage('bkfDetail');
  // 예약내역 탭으로 이동
  const tabs = document.querySelectorAll('#page-bkfDetail .ci-tab');
  const tab  = tabs[tabs.length - 1]; // 마지막 탭 = 예약내역
  bkfSwitchTab('records', tab);
  bkfLoadRecords(1);
}

// =====================================================
// 폼 상세 진입
// =====================================================
// =====================================================
// 기본정보 UI 채우기 (bkfOpenDetail, bkfGoRecords 공용)
// =====================================================
function bkfFillBasicUI(d) {
  if (!d) return;
  document.getElementById('bkfDetailTitle').textContent = escHtml(d.title) + ' 설정';
  document.getElementById('bkfDetailSlug').textContent  = 'slug: ' + d.slug;

  document.getElementById('bkf_title').value        = d.title       || '';
  document.getElementById('bkf_description').value  = d.description || '';
  document.getElementById('bkf_btn').value          = d.btn_name    || '';
  document.getElementById('bkf_slug_display').value = d.slug        || '';

  const activeR = document.querySelector(`input[name="bkf_is_active"][value="${d.is_active}"]`);
  if (activeR) activeR.checked = true;

  document.getElementById('bkf_phone_verify_use').checked = d.phone_verify_use == 1;

  const qmR = document.querySelector(`input[name="bkf_quota_mode"][value="${d.quota_mode || 'date'}"]`);
  if (qmR) qmR.checked = true;
}

async function bkfOpenDetail(formId) {
  bkfCurrentFormId = formId;
  const res = await bkfApiGet('api/bkf_admin.php', { action: 'get_form', id: formId });
  if (!res.ok) { showToast(res.msg || '오류', 'error'); return; }

  bkfCurrentFormData = res.data;
  const d = res.data;

  bkfFillBasicUI(d);

  showPage('bkfDetail');
  // 기본정보 탭 활성화
  bkfSwitchTab('basic', document.querySelector('#page-bkfDetail .ci-tab'));

  // 각 탭 데이터 로드
  bkfLoadFields();
  bkfLoadSteps();
  bkfLoadManagers();
  bkfInitQuotaTab();
  bkfLoadRecords(1);
}

// =====================================================
// 탭 전환
// =====================================================
function bkfSwitchTab(tab, el) {
  document.querySelectorAll('#page-bkfDetail .ci-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#page-bkfDetail .ci-tab-panel').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  const panel = document.getElementById('bkf-panel-' + tab);
  if (panel) panel.classList.add('active');

  // basic 탭 진입 시 항상 UI 최신 데이터로 채우기
  if (tab === 'basic' && bkfCurrentFormData && bkfCurrentFormData.id) {
    bkfFillBasicUI(bkfCurrentFormData);
  }
}

// =====================================================
// 기본정보 저장
// =====================================================
async function bkfSaveBasic() {
  if (bkfSaving) return;
  const btn = event?.target;
  bkfLock(btn);

  const res = await bkfApiPost('api/bkf_admin.php', {
    action:            'save_basic',
    id:                bkfCurrentFormId,
    title:             document.getElementById('bkf_title').value.trim(),
    description:       document.getElementById('bkf_description')?.value.trim() || '',
    btn_name:          document.getElementById('bkf_btn').value.trim(),
    is_active:         (document.querySelector('input[name="bkf_is_active"]:checked') || {}).value || 1,
    phone_verify_use:  document.getElementById('bkf_phone_verify_use').checked ? 1 : 0,
    quota_mode:        (document.querySelector('input[name="bkf_quota_mode"]:checked') || {}).value || 'date',
  });

  if (res.ok) showToast('저장되었습니다.');
  else showToast(res.msg || '오류', 'error');
  bkfUnlock(btn);
}

// =====================================================
// 필드 목록 로드
// =====================================================
async function bkfLoadFields() {
  const res = await bkfApiGet('api/bkf_admin.php', { action: 'list_fields', form_id: bkfCurrentFormId });
  const el  = document.getElementById('bkfFieldList');
  if (!el) return;

  if (!res.ok || !res.data || !res.data.length) {
    el.innerHTML = '<p style="color:#94a3b8;font-size:.85rem;padding:12px 0;">추가된 필드가 없습니다.</p>';
    return;
  }

  const typeLabel = {
    text: '텍스트', date: '날짜', time_slot: '시간슬롯',
    item_select: '항목선택', store_select: '지점선택',
    radio: '라디오', checkbox: '체크박스', dropdown: '드롭다운', date_range: '기간선택',
  };

  el.innerHTML = res.data.map(f => `
    <div class="ci-field-row" data-id="${f.id}" data-deletable="${f.is_deletable}" draggable="true"
      style="display:flex;gap:10px;align-items:center;padding:10px 14px;margin-bottom:6px;
             background:${f.is_deletable == 0 ? '#eff6ff' : '#f8fafc'};
             border-radius:8px;border:1px solid ${f.is_deletable == 0 ? '#bfdbfe' : 'var(--border)'};cursor:default;">
      <span style="cursor:grab;color:#94a3b8;" class="bkf-drag-handle">⠿</span>
      <div style="flex:1;min-width:0;">
        <span style="font-weight:600;">${escHtml(f.label)}</span>
        <span style="margin-left:8px;font-size:.75rem;color:#475569;background:#e2e8f0;padding:2px 7px;border-radius:4px;">
          ${typeLabel[f.type] || f.type}
        </span>
        ${f.is_required == 1 ? '<span style="margin-left:4px;font-size:.72rem;color:#e53e3e;">필수</span>' : ''}
        ${f.is_deletable == 0 ? '<span style="margin-left:4px;font-size:.72rem;color:#3b82f6;">고정</span>' : ''}
        <code style="margin-left:8px;font-size:.72rem;color:#94a3b8;">${escHtml(f.field_key)}</code>
      </div>
      <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;cursor:pointer;">
        <input type="checkbox" ${f.is_visible == 1 ? 'checked' : ''}
          onchange="bkfToggleFieldVisible(${f.id}, this)"/> 노출
      </label>
      <button class="btn btn-sm btn-outline" onclick="bkfOpenFieldModal(${f.id})">수정</button>
      ${f.is_deletable == 1
        ? `<button class="btn btn-sm btn-danger" onclick="bkfDeleteField(${f.id})">삭제</button>`
        : `<button class="btn btn-sm" style="background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0;cursor:not-allowed;" disabled>삭제불가</button>`
      }
    </div>`).join('');

  // 드래그 & 드롭 순서 변경
  el.querySelectorAll('.ci-field-row').forEach(row => {
    row.addEventListener('dragstart', e => { bkfFieldDragSrc = row; row.style.opacity = '.4'; e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragend',   e => { row.style.opacity = ''; });
    row.addEventListener('dragover',  e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    row.addEventListener('drop',      e => {
      e.preventDefault();
      if (bkfFieldDragSrc && bkfFieldDragSrc !== row) {
        const all = [...el.querySelectorAll('.ci-field-row')];
        const si  = all.indexOf(bkfFieldDragSrc);
        const di  = all.indexOf(row);
        if (si < di) row.after(bkfFieldDragSrc);
        else row.before(bkfFieldDragSrc);
        bkfSaveFieldOrder();
      }
    });
  });
}

// 필드 정렬 저장
async function bkfSaveFieldOrder() {
  const rows   = document.querySelectorAll('#bkfFieldList .ci-field-row');
  const orders = [...rows].map((r, i) => ({ id: r.dataset.id, sort: i }));
  await bkfApiPost('api/bkf_admin.php', { action: 'sort_fields', orders: JSON.stringify(orders) });
}

// 필드 노출 토글
async function bkfToggleFieldVisible(id, cb) {
  const res = await bkfApiPost('api/bkf_admin.php', { action: 'toggle_field_visible', id, is_visible: cb.checked ? 1 : 0 });
  if (!res.ok) { cb.checked = !cb.checked; showToast('오류가 발생했습니다.', 'error'); }
}

// 필드 삭제
async function bkfDeleteField(id) {
  if (!confirm('이 필드를 삭제하시겠습니까?\n저장된 예약 데이터의 해당 값도 함께 삭제됩니다.')) return;
  const res = await bkfApiPost('api/bkf_admin.php', { action: 'delete_field', id, form_id: bkfCurrentFormId });
  if (res.ok) { bkfLoadFields(); showToast('삭제되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
}

// =====================================================
// 필드 추가/수정 모달
// =====================================================
async function bkfOpenFieldModal(id = 0) {
  document.getElementById('bkfFieldModalTitle').textContent = id ? '필드 수정' : '필드 추가';
  document.getElementById('bkf_field_id').value    = id;
  document.getElementById('bkf_field_label').value = '';
  document.getElementById('bkf_field_key').value   = '';
  document.getElementById('bkf_field_type').value  = '';
  const phEl = document.getElementById('bkf_field_placeholder');
  if (phEl) phEl.value = '';

  // 모든 조건부 패널 숨김
  ['bkf-field-placeholder-wrap','bkf-field-options-wrap',
   'bkf-field-store-info','bkf-field-daterange-info'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  document.getElementById('bkf-field-options-list').innerHTML = '';

  // 기본값
  const reqEl = document.querySelector('input[name="bkf_field_required"][value="0"]');
  const visEl = document.querySelector('input[name="bkf_field_visible"][value="1"]');
  if (reqEl) reqEl.checked = true;
  if (visEl) visEl.checked = true;

  const keyEl   = document.getElementById('bkf_field_key');
  const labelEl = document.getElementById('bkf_field_label');

  if (id) {
    keyEl.readOnly = true;
    keyEl.style.background = '#f8fafc';
    keyEl.style.color      = '#64748b';

    const res = await bkfApiGet('api/bkf_admin.php', { action: 'list_fields', form_id: bkfCurrentFormId });
    const f   = (res.data || []).find(x => x.id == id);
    if (f) {
      labelEl.value = f.label       || '';
      keyEl.value   = f.field_key   || '';
      document.getElementById('bkf_field_type').value = f.type || '';
      if (phEl) phEl.value = f.placeholder || '';

      bkfOnFieldTypeChange();

      if (f.options && f.options.length) {
        f.options.forEach(o => bkfAddFieldOption(o.label, o.is_visible));
      }

      const r2 = document.querySelector(`input[name="bkf_field_required"][value="${f.is_required}"]`);
      const v2 = document.querySelector(`input[name="bkf_field_visible"][value="${f.is_visible}"]`);
      if (r2) r2.checked = true;
      if (v2) v2.checked = true;
    }
  } else {
    keyEl.readOnly = false;
    keyEl.style.background = '';
    keyEl.style.color      = '';
    // 항목명 입력 시 필드 키 자동 생성
    labelEl.oninput = null;
    labelEl.oninput = function () {
      if (!keyEl.readOnly) keyEl.value = bkfAutoFieldKey(this.value);
    };
  }

  openModal('bkfFieldModal');
}

// 한글 → 영문 필드키 자동 변환
function bkfAutoFieldKey(str) {
  const map = {
    '이름':'name','성명':'name','이메일':'email','연락처':'phone','전화번호':'phone',
    '휴대폰':'phone','제목':'subject','내용':'content','주소':'address',
    '날짜':'date','시간':'time','지점':'store','매장':'store','항목':'item',
    '성별':'gender','나이':'age','메모':'memo','메시지':'message','기간':'period',
    '선택':'selection','유형':'type','구분':'division',
  };
  const trimmed = str.trim();
  if (map[trimmed]) return map[trimmed];
  let key = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  if (/[가-힣]/.test(key)) key = 'field_' + Date.now().toString().slice(-6);
  return key || 'field_' + Date.now().toString().slice(-6);
}

// 타입 변경 시 조건부 UI 처리
function bkfOnFieldTypeChange() {
  const type = document.getElementById('bkf_field_type').value;
  const show = id => { const el = document.getElementById(id); if (el) el.style.display = ''; };
  const hide = id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

  hide('bkf-field-placeholder-wrap');
  hide('bkf-field-options-wrap');
  hide('bkf-field-store-info');
  hide('bkf-field-daterange-info');

  if (type === 'text')                                    show('bkf-field-placeholder-wrap');
  if (['radio','checkbox','dropdown','item_select'].includes(type)) show('bkf-field-options-wrap');
  if (type === 'store_select')                            show('bkf-field-store-info');
  if (type === 'date_range')                              show('bkf-field-daterange-info');
}

// 옵션 행 추가 (드래그 가능)
function bkfAddFieldOption(label = '', isVisible = 1) {
  const list = document.getElementById('bkf-field-options-list');
  const div  = document.createElement('div');
  div.draggable = true;
  div.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px;background:#f8fafc;padding:6px 8px;border-radius:6px;border:1px solid var(--border);';
  div.innerHTML = `
    <span style="cursor:grab;color:#94a3b8;font-size:1rem;padding:0 2px;">⠿</span>
    <input type="text" class="form-control" value="${escHtml(label)}" placeholder="옵션명" style="flex:1;"/>
    <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;cursor:pointer;white-space:nowrap;">
      <input type="checkbox" ${isVisible == 1 ? 'checked' : ''}/> 사용
    </label>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('div').remove()">✕</button>`;

  div.addEventListener('dragstart', e => { bkfOptDragSrc = div; div.style.opacity = '.4'; });
  div.addEventListener('dragend',   e => { div.style.opacity = ''; });
  div.addEventListener('dragover',  e => e.preventDefault());
  div.addEventListener('drop',      e => {
    e.preventDefault();
    if (bkfOptDragSrc && bkfOptDragSrc !== div) {
      const all = [...list.querySelectorAll(':scope > div')];
      if (all.indexOf(bkfOptDragSrc) < all.indexOf(div)) div.after(bkfOptDragSrc);
      else div.before(bkfOptDragSrc);
    }
  });
  list.appendChild(div);
}

// 필드 저장
async function bkfSaveField() {
  if (bkfSaving) return;
  const btn  = document.querySelector('#bkfFieldModal .btn-primary');
  bkfLock(btn);

  const id   = parseInt(document.getElementById('bkf_field_id').value) || 0;
  const type = document.getElementById('bkf_field_type').value;

  const options = [];
  document.querySelectorAll('#bkf-field-options-list > div').forEach(div => {
    const lbl = div.querySelector('input[type="text"]').value.trim();
    const vis = div.querySelector('input[type="checkbox"]').checked ? 1 : 0;
    if (lbl) options.push({ label: lbl, is_visible: vis });
  });

  const data = {
    action:      'save_field',
    id,
    form_id:     bkfCurrentFormId,
    label:       document.getElementById('bkf_field_label').value.trim(),
    field_key:   document.getElementById('bkf_field_key').value.trim(),
    type,
    placeholder: (document.getElementById('bkf_field_placeholder') || {}).value?.trim() || '',
    is_required: (document.querySelector('input[name="bkf_field_required"]:checked') || {}).value || 0,
    is_visible:  (document.querySelector('input[name="bkf_field_visible"]:checked')  || {}).value || 1,
    options:     JSON.stringify(options),
  };

  const res = await bkfApiPost('api/bkf_admin.php', data);
  if (res.ok) {
    closeModal('bkfFieldModal');
    bkfLoadFields();
    showToast('저장되었습니다.');
  } else {
    showToast(res.msg || '오류', 'error');
  }
  bkfUnlock(btn);
}

// =====================================================
// 스텝 관리
// =====================================================
const BKF_STEP_LABELS = {
  store:     '지점 선택',
  date:      '날짜 선택',
  time_slot: '시간 선택',
  item:      '항목 선택',
  info:      '정보입력',
};

// 스텝 목록 로드
async function bkfLoadSteps() {
  const res = await bkfApiGet('api/bkf_admin.php', { action: 'list_steps', form_id: bkfCurrentFormId });
  if (!res.ok) return;
  bkfRenderStepList(res.data || []);
}

// 스텝 목록 렌더
function bkfRenderStepList(steps) {
  const el = document.getElementById('bkfStepList');
  if (!el) return;

  // sort_order 순으로 정렬 (info 포함 전체)
  const allSteps = steps
    .filter(s => s.is_active == 1)
    .sort((a, b) => a.sort_order - b.sort_order);

  // info가 없으면 기본 추가 (DB에 없는 경우 대비)
  const hasInfo = allSteps.some(s => s.step_key === 'info');
  if (!hasInfo) {
    allSteps.push({ id: 0, step_key: 'info', label: '정보입력', sort_order: allSteps.length, is_active: 1 });
  }

  const active = allSteps;

  if (!active.length) {
    el.innerHTML = '<p style="color:#94a3b8;font-size:.85rem;padding:12px 0;">추가된 스텝이 없습니다. 위 팔레트에서 추가하세요.</p>';
    return;
  }

  el.innerHTML = active.map((s, i) => `
    <div class="bkf-step-row" data-id="${s.id}" data-key="${s.step_key}" draggable="true"
      style="display:flex;gap:10px;align-items:center;padding:12px 16px;
             background:#f8fafc;border-radius:8px;border:1px solid var(--border);cursor:default;">
      <span style="cursor:grab;color:#94a3b8;font-size:1.1rem;">⠿</span>
      <span style="display:inline-flex;align-items:center;justify-content:center;
                   width:24px;height:24px;background:#1255a6;color:#fff;
                   border-radius:50%;font-size:.75rem;font-weight:700;flex-shrink:0;">${i + 1}</span>
      <div style="flex:1;">
        <span style="font-weight:600;">${BKF_STEP_LABELS[s.step_key] || s.step_key}</span>
        <code style="margin-left:8px;font-size:.72rem;color:#94a3b8;">${s.step_key}</code>
      </div>
      ${s.step_key !== 'info'
        ? `<button class="btn btn-sm btn-danger" onclick="bkfRemoveStep(${s.id}, this)">제거</button>`
        : `<span style="font-size:.72rem;color:#3b82f6;padding:4px 8px;">필수</span>`}
    </div>`).join('');

  // 드래그 & 드롭
  el.querySelectorAll('.bkf-step-row').forEach(row => {
    row.addEventListener('dragstart', e => { bkfStepDragSrc = row; row.style.opacity = '.4'; e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragend',   e => { row.style.opacity = ''; });
    row.addEventListener('dragover',  e => e.preventDefault());
    row.addEventListener('drop',      e => {
      e.preventDefault();
      if (bkfStepDragSrc && bkfStepDragSrc !== row) {
        const all = [...el.querySelectorAll('.bkf-step-row')];
        if (all.indexOf(bkfStepDragSrc) < all.indexOf(row)) row.after(bkfStepDragSrc);
        else row.before(bkfStepDragSrc);
        // 번호 갱신
        el.querySelectorAll('.bkf-step-row').forEach((r, idx) => {
          const badge = r.querySelector('span[style*="border-radius:50%"]');
          if (badge) badge.textContent = idx + 1;
        });
      }
    });
  });
}

// 팔레트에서 스텝 추가
function bkfAddStep(stepKey, label) {
  const el = document.getElementById('bkfStepList');
  if (!el) return;

  // 이미 추가된 스텝인지 확인
  const existing = [...el.querySelectorAll('.bkf-step-row')].map(r => r.dataset.key);
  if (existing.includes(stepKey)) {
    showToast(`'${label}' 스텝은 이미 추가되어 있습니다.`, 'error');
    return;
  }

  const count = el.querySelectorAll('.bkf-step-row').length;
  const div   = document.createElement('div');
  div.className     = 'bkf-step-row';
  div.dataset.id    = '0'; // 신규 — id 없음
  div.dataset.key   = stepKey;
  div.draggable     = true;
  div.style.cssText = 'display:flex;gap:10px;align-items:center;padding:12px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;cursor:default;';
  div.innerHTML = `
    <span style="cursor:grab;color:#94a3b8;font-size:1.1rem;">⠿</span>
    <span style="display:inline-flex;align-items:center;justify-content:center;
                 width:24px;height:24px;background:#16a34a;color:#fff;
                 border-radius:50%;font-size:.75rem;font-weight:700;flex-shrink:0;">${count + 1}</span>
    <div style="flex:1;">
      <span style="font-weight:600;">${label}</span>
      <code style="margin-left:8px;font-size:.72rem;color:#94a3b8;">${stepKey}</code>
    </div>
    <button class="btn btn-sm btn-danger" onclick="bkfRemoveStep(0, this)">제거</button>`;

  // 드래그 이벤트 등록
  div.addEventListener('dragstart', e => { bkfStepDragSrc = div; div.style.opacity = '.4'; });
  div.addEventListener('dragend',   e => { div.style.opacity = ''; });
  div.addEventListener('dragover',  e => e.preventDefault());
  div.addEventListener('drop',      e => {
    e.preventDefault();
    if (bkfStepDragSrc && bkfStepDragSrc !== div) {
      const all = [...document.querySelectorAll('#bkfStepList .bkf-step-row')];
      if (all.indexOf(bkfStepDragSrc) < all.indexOf(div)) div.after(bkfStepDragSrc);
      else div.before(bkfStepDragSrc);
    }
  });

  // 안내 문구 제거
  const hint = el.querySelector('p');
  if (hint) hint.remove();

  el.appendChild(div);
  showToast(`'${label}' 스텝이 추가되었습니다.`);
}

// 스텝 제거
async function bkfRemoveStep(id, btn) {
  const row = btn.closest('.bkf-step-row');
  if (!row) return;

  if (id > 0) {
    const res = await bkfApiPost('api/bkf_admin.php', { action: 'toggle_step', id, is_active: 0 });
    if (!res.ok) { showToast(res.msg || '오류', 'error'); return; }
  }
  row.remove();

  // 번호 갱신
  document.querySelectorAll('#bkfStepList .bkf-step-row').forEach((r, idx) => {
    const badge = r.querySelector('span[style*="border-radius:50%"]');
    if (badge) badge.textContent = idx + 1;
  });

  if (!document.querySelectorAll('#bkfStepList .bkf-step-row').length) {
    document.getElementById('bkfStepList').innerHTML =
      '<p style="color:#94a3b8;font-size:.85rem;padding:12px 0;">추가된 스텝이 없습니다. 위 팔레트에서 추가하세요.</p>';
  }
}

// 스텝 저장 (일괄)
async function bkfSaveSteps() {
  if (bkfSaving) return;
  const btn = event?.target;
  bkfLock(btn);

  const rows  = document.querySelectorAll('#bkfStepList .bkf-step-row');
  const items = [...rows].map((r, i) => ({
    id:        parseInt(r.dataset.id) || 0,
    step_key:  r.dataset.key,
    label:     BKF_STEP_LABELS[r.dataset.key] || r.dataset.key,
    sort_order: i,
    is_active: 1,
  }));

  // time_slot은 반드시 date 바로 다음에 위치해야 함
  const keys = items.map(i => i.step_key);
  const timeIdx = keys.indexOf('time_slot');
  if (timeIdx !== -1) {
    const prevKey = timeIdx > 0 ? keys[timeIdx - 1] : null;
    if (prevKey !== 'date') {
      showToast('⚠️ 시간 선택 스텝은 날짜 선택 스텝 바로 다음에 위치해야 합니다.', 'error');
      bkfUnlock(btn);
      return;
    }
  }

  // info 스텝은 목록에 이미 포함됨 (강제 마지막 없음)
  const res = await bkfApiPost('api/bkf_admin.php', {
    action:  'save_steps',
    form_id: bkfCurrentFormId,
    items:   JSON.stringify(items),
  });

  if (res.ok) {
    showToast('스텝이 저장되었습니다.');
    bkfLoadSteps();
  } else {
    showToast(res.msg || '오류', 'error');
  }
  bkfUnlock(btn);
}


// =====================================================

// =====================================================
// 수량(Quota) — 탭 초기화
// =====================================================
async function bkfInitQuotaTab() {
  // 연도/월 셀렉트 채우기
  const yearSel  = document.getElementById('bkfQuotaYear');
  const monthSel = document.getElementById('bkfQuotaMonth');
  if (!yearSel || !monthSel) return;

  const now = new Date();
  yearSel.innerHTML  = '';
  monthSel.innerHTML = '';

  for (let y = now.getFullYear() - 1; y <= now.getFullYear() + 2; y++) {
    yearSel.innerHTML += `<option value="${y}" ${y === now.getFullYear() ? 'selected' : ''}>${y}년</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    monthSel.innerHTML += `<option value="${m}" ${m === now.getMonth() + 1 ? 'selected' : ''}>${m}월</option>`;
  }

  // 지점 셀렉트 채우기 (stores 테이블)
  await bkfLoadQuotaStores();
  bkfLoadQuota();
}

async function bkfLoadQuotaStores() {
  const sel = document.getElementById('bkfQuotaStoreFilter');
  if (!sel) return;
  try {
    const res = await bkfApiGet('api_front/bkf_public.php', { action: 'get_stores', slug: bkfCurrentFormData.slug || '' });
    const stores = res.data || [];
    // store_name(지역)별 그룹핑 → optgroup으로 표시
    const groups = {};
    stores.forEach(s => {
      const region = s.store_name || '기타';
      if (!groups[region]) groups[region] = [];
      groups[region].push(s);
    });
    let html = '<option value="">지점 없음 (공통)</option>';
    Object.keys(groups).forEach(region => {
      html += `<optgroup label="${escHtml(region)}">`;
      groups[region].forEach(s => {
        html += `<option value="${s.id}">${escHtml(s.branch_name || s.store_name || '')}</option>`;
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
  } catch (e) {
    sel.innerHTML = '<option value="">지점 없음 (공통)</option>';
  }
}

// =====================================================
// 수량 캘린더 로드
// =====================================================
async function bkfLoadQuota() {
  const year     = parseInt(document.getElementById('bkfQuotaYear').value);
  const month    = parseInt(document.getElementById('bkfQuotaMonth').value);
  const store_id = document.getElementById('bkfQuotaStoreFilter').value;
  const quotaMode = bkfCurrentFormData.quota_mode || 'date';

  const params = { action: 'get_quota', form_id: bkfCurrentFormId, year, month };
  if (store_id) params.store_id = store_id;

  const res = await bkfApiGet('api/bkf_admin.php', params);
  if (!res.ok) { showToast('수량 로드 실패', 'error'); return; }

  bkfRenderQuotaCalendar(year, month, res.data || [], store_id, quotaMode);
}

function bkfRenderQuotaCalendar(year, month, quotaRows, store_id, quotaMode) {
  const el = document.getElementById('bkfQuotaCalendar');
  if (!el) return;

  // quota 데이터를 날짜 키로 맵핑
  const qMap = {};
  quotaRows.forEach(q => {
    const d = q.quota_date;
    if (!qMap[d]) qMap[d] = { date_cap: 0, date_booked: 0, slots: [] };
    if (!q.slot_time) {
      qMap[d].date_cap    = (q.capacity === null || q.capacity === '') ? null : parseInt(q.capacity);
      qMap[d].date_booked = parseInt(q.booked) || 0;
    } else {
      qMap[d].slots.push(q);
    }
  });

  const firstDay  = new Date(year, month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const weekDays = ['일','월','화','수','목','금','토'];
  let html = `
    <table style="width:100%;border-collapse:collapse;min-width:600px;">
      <thead>
        <tr>${weekDays.map(d => `<th style="padding:8px 4px;text-align:center;font-size:.78rem;color:#64748b;font-weight:600;">${d}</th>`).join('')}</tr>
      </thead>
      <tbody><tr>`;

  // 첫 주 빈칸
  for (let i = 0; i < firstDay; i++) {
    html += `<td style="height:80px;background:#f8fafc;border:1px solid var(--border);"></td>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const ds       = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isPast   = ds < today;
    const qd       = qMap[ds] || null;
    const dateCap  = qd ? qd.date_cap    : 0;
    const dateBook = qd ? qd.date_booked : 0;
    const slotCnt  = qd ? qd.slots.length : 0;
    const remaining = Math.max(0, dateCap - dateBook);
    const isFull    = dateCap !== null && dateCap === 0 || (dateCap > 0 && remaining === 0);

    const bg    = isPast ? '#f8fafc' : isFull ? '#fef2f2' : '#ffffff';
    const color = isPast ? '#cbd5e1' : isFull ? '#ef4444' : '#1e293b';

    let inner = `<div style="font-size:.82rem;font-weight:600;margin-bottom:4px;">${day}</div>`;

    if (!isPast) {
      if (quotaMode === 'date') {
        const capTxt = dateCap === null
          ? '<span style="color:#94a3b8;font-size:.7rem;">미설정</span>'
          : dateCap === 0
          ? '<span style="color:#ef4444;font-size:.7rem;font-weight:600;">마감</span>'
          : `<span style="font-size:.72rem;color:${isFull ? '#ef4444' : '#16a34a'};">${dateBook}/${dateCap}</span>`;
        inner += `<div style="margin-bottom:2px;">${capTxt}</div>`;
      }
      if (quotaMode === 'slot' && slotCnt > 0) {
        inner += `<div style="font-size:.68rem;color:#64748b;">${slotCnt}개 슬롯</div>`;
      }
    }

    const clickable = !isPast ? `onclick="bkfOpenQuotaModal('${ds}', '${store_id}', '${quotaMode}')" style="cursor:pointer;"` : '';

    html += `<td ${clickable} style="height:80px;vertical-align:top;padding:6px 8px;background:${bg};color:${color};border:1px solid var(--border);transition:background .15s;"
      onmouseover="${!isPast ? `this.style.background='#eff6ff'` : ''}"
      onmouseout="${!isPast ? `this.style.background='${bg}'` : ''}"
    >${inner}</td>`;

    // 주 마무리
    if ((firstDay + day) % 7 === 0 && day !== daysInMonth) {
      html += `</tr><tr>`;
    }
  }

  // 마지막 주 빈칸
  const lastDayPos = (firstDay + daysInMonth - 1) % 7;
  if (lastDayPos < 6) {
    for (let i = lastDayPos + 1; i <= 6; i++) {
      html += `<td style="height:80px;background:#f8fafc;border:1px solid var(--border);"></td>`;
    }
  }

  html += `</tr></tbody></table>`;
  el.innerHTML = html;
}

// =====================================================
// 수량 단건 모달 열기 (날짜 셀 클릭)
// =====================================================
async function bkfOpenQuotaModal(date, storeId, quotaMode) {
  document.getElementById('bkf_quota_date').value     = date;
  document.getElementById('bkf_quota_store_id').value = storeId;
  document.getElementById('bkfQuotaModalTitle').textContent = date + ' 수량 설정';
  document.getElementById('bkfQuotaDateLabel').textContent  = date;

  // quota_mode 에 따라 UI 표시
  const dateWrap = document.getElementById('bkf-quota-date-wrap');
  const slotWrap = document.getElementById('bkf-quota-slot-wrap');
  dateWrap.style.display = quotaMode === 'date' ? '' : 'none';
  slotWrap.style.display = ''; // date/slot 모두 슬롯 추가 가능

  // quota_mode=date면 슬롯 헤더 안내 변경
  const slotHeader = slotWrap.querySelector('p');
  if (slotHeader) {
    slotHeader.textContent = quotaMode === 'date'
      ? '시간 슬롯 (수량 제한 없음)'
      : '시간 슬롯별 수량';
  }

  // 기존 수량 로드
  const params = { action: 'get_quota', form_id: bkfCurrentFormId, year: date.slice(0,4), month: parseInt(date.slice(5,7)) };
  if (storeId) params.store_id = storeId;
  const res = await bkfApiGet('api/bkf_admin.php', params);
  const rows = (res.data || []).filter(q => q.quota_date === date);

  // 날짜 단위 수량
  const dateRow = rows.find(q => !q.slot_time);
  document.getElementById('bkf_quota_date_capacity').value = dateRow ? (dateRow.capacity === null || dateRow.capacity === undefined ? '' : dateRow.capacity) : '';

  // 슬롯 목록
  const slotList = document.getElementById('bkf-quota-slot-list');
  slotList.innerHTML = '';
  const slotRows = rows.filter(q => q.slot_time);
  // 시간순 정렬 후 슬롯 표시
  slotRows.sort((a,b) => (a.slot_time||'').localeCompare(b.slot_time||''));
  slotRows.forEach(q => bkfAddSlotRow(q.slot_time ? q.slot_time.slice(0,5) : '', q.capacity === null ? '' : q.capacity, q.booked, q.id));

  openModal('bkfQuotaModal');
}

// 슬롯 행 추가
function bkfAddSlotRow(time = '', capacity = 0, booked = 0, quotaId = 0) {
  const list      = document.getElementById('bkf-quota-slot-list');
  const quotaMode = bkfCurrentFormData.quota_mode || 'date';
  const div  = document.createElement('div');
  div.dataset.quotaId = quotaId;
  div.style.cssText = 'display:flex;gap:8px;align-items:center;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid var(--border);';

  // quota_mode=date: 시간만 입력, 수량 입력 숨김
  const capVal = (capacity === null || capacity === '' || capacity === undefined) ? '' : capacity;
  const capInput = quotaMode === 'date'
    ? `<input type="number" class="form-control" value="" min="0" style="display:none;"/>`
    : `<label style="font-size:.8rem;color:#64748b;white-space:nowrap;">수량</label>
       <input type="number" class="form-control" value="${capVal}" min="0" placeholder="제한없음" style="width:90px;"/>
       ${booked > 0 ? `<span style="font-size:.75rem;color:#94a3b8;">예약${booked}건</span>` : ''}`;

  div.innerHTML = `
    <input type="time" class="form-control" value="${time}" style="width:110px;" placeholder="HH:MM"/>
    ${capInput}
    <button type="button" class="btn btn-sm btn-danger" onclick="bkfRemoveSlotRow(this, ${quotaId})">✕</button>`;
  list.appendChild(div);
}

async function bkfRemoveSlotRow(btn, quotaId) {
  if (quotaId > 0) {
    const res = await bkfApiPost('api/bkf_admin.php', { action: 'delete_quota', id: quotaId });
    if (!res.ok) { showToast(res.msg || '삭제 실패', 'error'); return; }
  }
  btn.closest('div').remove();
}

// 수량 단건 저장
async function bkfSaveQuota() {
  if (bkfSaving) return;
  const btn      = document.querySelector('#bkfQuotaModal .btn-primary');
  bkfLock(btn);

  const date     = document.getElementById('bkf_quota_date').value;
  const storeId  = document.getElementById('bkf_quota_store_id').value;
  const quotaMode = bkfCurrentFormData.quota_mode || 'date';
  const items    = [];

  // 날짜 단위
  if (quotaMode === 'date') {
    items.push({
      store_id:   storeId || null,
      quota_date: date,
      slot_time:  null,
      capacity:   document.getElementById('bkf_quota_date_capacity').value === ''
                   ? null
                   : parseInt(document.getElementById('bkf_quota_date_capacity').value),
    });
  }

  // 슬롯 단위
  document.querySelectorAll('#bkf-quota-slot-list > div').forEach(div => {
    const t = div.querySelector('input[type="time"]').value;
    const c = parseInt(div.querySelector('input[type="number"]').value) || 0;
    const c_null = (c === '' || isNaN(c) || div.querySelector('input[type="number"]').value === '') ? null : c;
    if (t) items.push({ store_id: storeId || null, quota_date: date, slot_time: t, capacity: c_null });
  });

  // 공통 저장 시 경고
  const applyAll = !storeId;
  if (applyAll) {
    const hasStores = document.querySelectorAll('#bkfQuotaStoreFilter option').length > 1;
    if (hasStores) {
      if (!confirm('⚠️ 지점 없음(공통)으로 저장하면\n모든 지점에 동일하게 적용됩니다.\n기존 지점별 설정도 덮어씌워집니다.\n\n계속 진행하시겠습니까?')) {
        bkfUnlock(btn);
        return;
      }
    }
  }

  const res = await bkfApiPost('api/bkf_admin.php', {
    action:          'bulk_quota',
    form_id:         bkfCurrentFormId,
    items:           JSON.stringify(items),
    apply_all_stores: applyAll ? '1' : '0',
  });

  if (res.ok) {
    closeModal('bkfQuotaModal');
    bkfLoadQuota();
    showToast('수량이 저장되었습니다.');
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
  bkfUnlock(btn);
}

// =====================================================
// 수량 일괄 설정 모달
// =====================================================
function bkfOpenBulkQuota() {
  const quotaMode = bkfCurrentFormData.quota_mode || 'date';
  const slotWrap  = document.getElementById('bkf-bulk-slot-wrap');
  const dateCap   = document.getElementById('bkf_bulk_capacity');

  document.getElementById('bkf_bulk_capacity').value        = 0;
  document.getElementById('bkf_bulk_use_slot').checked       = false;
  document.getElementById('bkf-bulk-slot-area').style.display = 'none';
  document.getElementById('bkf-bulk-slot-list').innerHTML    = '';

  // quota_mode = date  → 날짜수량만, 슬롯체크박스 숨김
  // quota_mode = slot  → 날짜수량 숨김, 슬롯체크박스 자동 체크+표시
  // quota_mode = both  → 둘 다 표시
  const dateWrap = document.querySelector('#bkfBulkQuotaModal .form-group');
  if (quotaMode === 'date') {
    // 날짜 수량 표시, 슬롯 섹션도 표시 (수량 없이 시간만 추가)
    if (dateWrap) dateWrap.style.display = '';
    if (slotWrap) {
      slotWrap.style.display = '';
      // 체크박스 라벨 변경
      const slotLabel = slotWrap.querySelector('label');
      if (slotLabel) slotLabel.lastChild.textContent = ' 시간 슬롯 추가 (수량 제한 없음)';
    }
  } else { // slot
    if (dateWrap) dateWrap.style.display = 'none';
    if (slotWrap) slotWrap.style.display = '';
    document.getElementById('bkf_bulk_use_slot').checked        = true;
    document.getElementById('bkf-bulk-slot-area').style.display = '';
    const slotLabel = slotWrap?.querySelector('label');
    if (slotLabel) slotLabel.lastChild.textContent = ' 시간 슬롯도 함께 설정';
  }

  openModal('bkfBulkQuotaModal');
}

function bkfToggleBulkSlot() {
  const use = document.getElementById('bkf_bulk_use_slot').checked;
  document.getElementById('bkf-bulk-slot-area').style.display = use ? '' : 'none';
}

function bkfAddBulkSlotRow() {
  const list      = document.getElementById('bkf-bulk-slot-list');
  const quotaMode = bkfCurrentFormData.quota_mode || 'date';
  const div  = document.createElement('div');
  div.style.cssText = 'display:flex;gap:8px;align-items:center;background:#fff;padding:6px 8px;border-radius:6px;border:1px solid var(--border);';

  const capInput = quotaMode === 'date'
    ? `<input type="number" class="form-control" value="" min="0" style="display:none;"/>`
    : `<label style="font-size:.8rem;color:#64748b;white-space:nowrap;">수량</label>
       <input type="number" class="form-control" value="" min="0" placeholder="제한없음" style="width:90px;"/>`;

  div.innerHTML = `
    <input type="time" class="form-control" style="width:110px;"/>
    ${capInput}
    <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('div').remove()">✕</button>`;
  list.appendChild(div);
}

async function bkfSaveBulkQuota() {
  if (bkfSaving) return;
  const btn   = document.querySelector('#bkfBulkQuotaModal .btn-primary');
  bkfLock(btn);

  const year    = parseInt(document.getElementById('bkfQuotaYear').value);
  const month   = parseInt(document.getElementById('bkfQuotaMonth').value);
  const storeId = document.getElementById('bkfQuotaStoreFilter').value;
  const _bulkRaw = document.getElementById('bkf_bulk_capacity').value;
  const dateCap = _bulkRaw === '' ? null : parseInt(_bulkRaw);
  const useSlot = document.getElementById('bkf_bulk_use_slot').checked;
  const quotaMode = bkfCurrentFormData.quota_mode || 'date';

  // 슬롯 목록 수집
  const slots = [];
  if (useSlot) {
    document.querySelectorAll('#bkf-bulk-slot-list > div').forEach(div => {
      const t = div.querySelector('input[type="time"]').value;
      const _rv = div.querySelector('input[type="number"]').value;
      const c = _rv === '' ? null : parseInt(_rv);
      if (t) slots.push({ time: t, capacity: c });
    });
  }

  // 해당 월의 모든 날짜에 적용
  const daysInMonth = new Date(year, month, 0).getDate();
  const items = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const ds = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (quotaMode === 'date') {
      items.push({ store_id: storeId || null, quota_date: ds, slot_time: null, capacity: dateCap });
    }
    if (quotaMode === 'slot' && useSlot) {
      slots.forEach(s => {
        items.push({ store_id: storeId || null, quota_date: ds, slot_time: s.time, capacity: s.capacity });
      });
    }
  }

  if (!items.length) {
    showToast('설정할 항목이 없습니다.', 'error');
    bkfUnlock(btn);
    return;
  }

  // 공통 저장 시 경고
  const applyAll = !storeId;
  if (applyAll) {
    const hasStores = document.querySelectorAll('#bkfQuotaStoreFilter option').length > 1;
    if (hasStores) {
      if (!confirm(`⚠️ 지점 없음(공통)으로 일괄 설정하면\n${month}월 전체 날짜가 모든 지점에 동일하게 적용됩니다.\n기존 지점별 설정도 덮어씌워집니다.\n\n계속 진행하시겠습니까?`)) {
        bkfUnlock(btn);
        return;
      }
    }
  }

  const res = await bkfApiPost('api/bkf_admin.php', {
    action:           'bulk_quota',
    form_id:          bkfCurrentFormId,
    items:            JSON.stringify(items),
    apply_all_stores: applyAll ? '1' : '0',
  });

  if (res.ok) {
    closeModal('bkfBulkQuotaModal');
    bkfLoadQuota();
    showToast(`${month}월 전체 수량이 설정되었습니다.`);
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
  bkfUnlock(btn);
}

// =====================================================
// 담당자 관리
// =====================================================
async function bkfLoadManagers() {
  const res   = await bkfApiGet('api/bkf_admin.php', { action: 'list_managers', form_id: bkfCurrentFormId });
  const tbody = document.getElementById('bkfManagerTableBody');
  if (!tbody) return;

  if (!res.ok || !res.data || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">담당자가 없습니다.</td></tr>';
  } else {
    tbody.innerHTML = res.data.map(m => {
      const notifies = [];
      if (m.notify_email    == 1) notifies.push('이메일');
      if (m.notify_sheet    == 1) notifies.push('구글시트');
      if (m.notify_alimtalk == 1) notifies.push('알림톡');
      if (m.notify_sms      == 1) notifies.push('문자');
      return `<tr>
        <td>${escHtml(m.name)}</td>
        <td>${escHtml(m.department || '-')}</td>
        <td>${escHtml(m.phone      || '-')}</td>
        <td>${escHtml(m.email      || '-')}</td>
        <td style="font-size:.78rem;">${notifies.join(', ') || '-'}</td>
        <td><span class="badge ${m.is_active == 1 ? 'badge-success' : 'badge-gray'}">${m.is_active == 1 ? '사용' : '미사용'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="bkfOpenManagerModal(${m.id})">수정</button>
          <button class="btn btn-sm btn-danger"  onclick="bkfDeleteManager(${m.id})">삭제</button>
        </td>
      </tr>`;
    }).join('');
  }

  // 히스토리 로드
  const hres  = await bkfApiGet('api/bkf_admin.php', { action: 'list_manager_history', form_id: bkfCurrentFormId });
  const hbody = document.getElementById('bkfManagerHistoryBody');
  if (!hbody) return;

  if (!hres.ok || !hres.data || !hres.data.length) {
    hbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">이력이 없습니다.</td></tr>';
  } else {
    const fieldLabels = {
      name: '이름', department: '담당부서', phone: '연락처', email: '이메일',
      notify_email: '이메일알림', notify_sheet: '시트알림',
      notify_alimtalk: '알림톡', notify_sms: '문자', is_active: '사용여부',
      sheet_webhook: '웹훅URL', sheet_name: '시트명'
    };
    const activeLabel = v => v == 1 || v === '1' ? '사용' : '미사용';
    const notifyLabel = v => v == 1 || v === '1' ? 'ON' : 'OFF';
    hbody.innerHTML = hres.data.map(h => {
      let desc = '';
      try {
        const d = JSON.parse(h.change_desc);
        if (d.action === 'created') desc = '담당자 등록';
        else if (d.action === 'deleted') desc = '담당자 삭제';
        else if (d.action === 'updated') desc = '정보 수정';
        else desc = Object.keys(d).map(k => {
          const label = fieldLabels[k] || k;
          let before = d[k].before, after = d[k].after;
          if (k === 'is_active') { before = activeLabel(before); after = activeLabel(after); }
          else if (k.startsWith('notify_')) { before = notifyLabel(before); after = notifyLabel(after); }
          return `${label}: ${before} → ${after}`;
        }).join(', ');
      } catch(e) { desc = h.change_desc || ''; }
      return `<tr>
        <td>${h.changed_at ? h.changed_at.slice(0,16) : '-'}</td>
        <td>${escHtml(h.manager_name || '(삭제됨)')}</td>
        <td style="font-size:.8rem;">${escHtml(desc)}</td>
        <td>${escHtml(h.changed_by || '-')}</td>
      </tr>`;
    }).join('');
  }
}

async function bkfOpenManagerModal(id = 0) {
  document.getElementById('bkfManagerModalTitle').textContent = id ? '담당자 수정' : '담당자 추가';
  document.getElementById('bkf_mgr_id').value = id;

  // 초기화
  ['bkf_mgr_name','bkf_mgr_dept','bkf_mgr_phone','bkf_mgr_email',
   'bkf_mgr_sheet_webhook','bkf_mgr_sheet_name'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  ['bkf_mgr_notify_email','bkf_mgr_notify_sheet',
   'bkf_mgr_notify_alimtalk','bkf_mgr_notify_sms'].forEach(f => {
    const el = document.getElementById(f); if (el) el.checked = false;
  });
  document.getElementById('bkf-mgr-panel-sheet').style.display    = 'none';
  document.getElementById('bkf-mgr-panel-alimtalk').style.display = 'none';
  const activeR = document.querySelector('input[name="bkf_mgr_active"][value="1"]');
  if (activeR) activeR.checked = true;

  if (id) {
    const res = await bkfApiGet('api/bkf_admin.php', { action: 'list_managers', form_id: bkfCurrentFormId });
    const m   = (res.data || []).find(x => x.id == id);
    if (m) {
      document.getElementById('bkf_mgr_name').value         = m.name          || '';
      document.getElementById('bkf_mgr_dept').value         = m.department    || '';
      document.getElementById('bkf_mgr_phone').value        = m.phone         || '';
      document.getElementById('bkf_mgr_email').value        = m.email         || '';
      document.getElementById('bkf_mgr_sheet_webhook').value = m.sheet_webhook || '';
      document.getElementById('bkf_mgr_sheet_name').value   = m.sheet_name    || '';
      document.getElementById('bkf_mgr_notify_email').checked    = m.notify_email    == 1;
      document.getElementById('bkf_mgr_notify_sheet').checked    = m.notify_sheet    == 1;
      document.getElementById('bkf_mgr_notify_alimtalk').checked = m.notify_alimtalk == 1;
      document.getElementById('bkf_mgr_notify_sms').checked      = m.notify_sms      == 1;
      if (m.notify_sheet    == 1) document.getElementById('bkf-mgr-panel-sheet').style.display    = '';
      if (m.notify_alimtalk == 1) document.getElementById('bkf-mgr-panel-alimtalk').style.display = '';
      const r = document.querySelector(`input[name="bkf_mgr_active"][value="${m.is_active}"]`);
      if (r) r.checked = true;
    }
  }
  openModal('bkfManagerModal');
}

function bkfToggleMgrPanel(key) {
  const cb    = document.getElementById('bkf_mgr_notify_' + key);
  const panel = document.getElementById('bkf-mgr-panel-' + key);
  if (panel) panel.style.display = cb.checked ? '' : 'none';
}

async function bkfSaveManager() {
  if (bkfSaving) return;
  const btn = document.querySelector('#bkfManagerModal .btn-primary');
  bkfLock(btn);

  const id       = parseInt(document.getElementById('bkf_mgr_id').value) || 0;
  const isActive = (document.querySelector('input[name="bkf_mgr_active"]:checked') || {}).value || 1;

  const res = await bkfApiPost('api/bkf_admin.php', {
    action:           'save_manager',
    id,
    form_id:          bkfCurrentFormId,
    name:             document.getElementById('bkf_mgr_name').value.trim(),
    department:       document.getElementById('bkf_mgr_dept').value.trim(),
    phone:            document.getElementById('bkf_mgr_phone').value.trim(),
    email:            document.getElementById('bkf_mgr_email').value.trim(),
    notify_email:     document.getElementById('bkf_mgr_notify_email').checked    ? 1 : 0,
    notify_sheet:     document.getElementById('bkf_mgr_notify_sheet').checked    ? 1 : 0,
    notify_alimtalk:  document.getElementById('bkf_mgr_notify_alimtalk').checked ? 1 : 0,
    notify_sms:       document.getElementById('bkf_mgr_notify_sms').checked      ? 1 : 0,
    sheet_webhook:    document.getElementById('bkf_mgr_sheet_webhook').value.trim(),
    sheet_name:       document.getElementById('bkf_mgr_sheet_name').value.trim(),
    is_active:        isActive,
  });

  if (res.ok) { closeModal('bkfManagerModal'); bkfLoadManagers(); showToast('저장되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
  bkfUnlock(btn);
}

async function bkfDeleteManager(id) {
  if (!confirm('담당자를 삭제하시겠습니까?')) return;
  const res = await bkfApiPost('api/bkf_admin.php', { action: 'delete_manager', id, form_id: bkfCurrentFormId });
  if (res.ok) { bkfLoadManagers(); showToast('삭제되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
}

// =====================================================
// 예약 내역 — 목록
// =====================================================
let bkfRecordPage = 1;

async function bkfLoadRecords(page = 1) {
  bkfRecordPage = page;

  const keyword  = (document.getElementById('bkfRecordKeyword')  || {}).value?.trim() || '';
  const status   = (document.getElementById('bkfRecordStatus')   || {}).value || '';
  const store_id = (document.getElementById('bkfRecordStore')    || {}).value || '';
  const from     = (document.getElementById('bkfRecordFrom')     || {}).value || '';
  const to       = (document.getElementById('bkfRecordTo')       || {}).value || '';
  const tbody    = document.getElementById('bkfRecordTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:#94a3b8;">조회 중...</td></tr>';

  const res = await bkfApiGet('api/bkf_admin.php', {
    action: 'list_records',
    form_id: bkfCurrentFormId,
    keyword, status, store_id, from, to, page,
  });

  if (!res.ok) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:#94a3b8;">데이터를 불러오지 못했습니다.</td></tr>';
    return;
  }

  if (!res.data || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:#94a3b8;">예약 내역이 없습니다.</td></tr>';
    document.getElementById('bkfRecordPagination').innerHTML = '';
    return;
  }

  const statusColor = { '접수':'#3b82f6','확인':'#f59e0b','완료':'#22c55e','취소':'#94a3b8' };
  const offset = (page - 1) * res.limit;

  tbody.innerHTML = res.data.map((r, i) => `
    <tr>
      <td><input type="checkbox" class="bkf-row-check" data-id="${r.id}" onchange="bkfUpdateBulkBar()"/></td>
      <td>${res.total - offset - i}</td>
      <td><code style="font-size:.75rem;">${escHtml(r.reservation_no || '-')}</code></td>
      <td>${escHtml(r.name  || '-')}</td>
      <td>${escHtml(r.phone || '-')}</td>
      <td>${r.reservation_date || '-'}</td>
      <td>${r.reservation_time ? r.reservation_time.slice(0,5) : '-'}</td>
      <td>${escHtml(r.store_name || '-')}</td>
      <td>
        <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.76rem;font-weight:600;
                     background:${statusColor[r.status] || '#e2e8f0'}22;color:${statusColor[r.status] || '#64748b'};">
          ${escHtml(r.status)}
        </span>
      </td>
      <td style="font-size:.78rem;color:#64748b;">${r.created_at ? r.created_at.slice(0,16) : '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="bkfOpenRecordModal(${r.id})">상세/수정</button>
      </td>
    </tr>`).join('');

  // 페이지네이션
  const totalPages = Math.ceil(res.total / res.limit);
  let pages = '';
  const from_p = Math.max(1, page - 2);
  const to_p   = Math.min(totalPages, page + 2);
  if (from_p > 1)         pages += `<button class="btn btn-sm btn-outline" onclick="bkfLoadRecords(1)">«</button>`;
  for (let p = from_p; p <= to_p; p++) {
    pages += `<button class="btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}" onclick="bkfLoadRecords(${p})">${p}</button>`;
  }
  if (to_p < totalPages)  pages += `<button class="btn btn-sm btn-outline" onclick="bkfLoadRecords(${totalPages})">»</button>`;
  document.getElementById('bkfRecordPagination').innerHTML = pages;

  // 지점 필터 옵션 갱신 (최초 1회)
  bkfLoadRecordStoreOptions();
}

async function bkfLoadRecordStoreOptions() {
  const sel = document.getElementById('bkfRecordStore');
  if (!sel || sel.options.length > 1) return; // 이미 로드됨
  try {
    const res = await bkfApiGet('api_front/bkf_public.php', { action: 'get_stores', slug: bkfCurrentFormData.slug || '' });
    (res.data || []).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.store_name || s.branch_name || '';
      sel.appendChild(opt);
    });
  } catch (e) {}
}

// 검색 초기화
function bkfResetRecordSearch() {
  ['bkfRecordKeyword','bkfRecordFrom','bkfRecordTo'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['bkfRecordStatus','bkfRecordStore'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  bkfLoadRecords(1);
}

// 전체 체크박스
function bkfToggleAllCheck(cb) {
  document.querySelectorAll('.bkf-row-check').forEach(c => { c.checked = cb.checked; });
  bkfUpdateBulkBar();
}

function bkfUpdateBulkBar() {
  const cnt  = document.querySelectorAll('.bkf-row-check:checked').length;
  const bar  = document.getElementById('bkfRecordBulkBar');
  const cntEl = document.getElementById('bkfRecordBulkCount');
  if (bar)   bar.style.display  = cnt > 0 ? 'flex' : 'none';
  if (cntEl) cntEl.textContent  = cnt;
}

// 선택 삭제
async function bkfDeleteSelectedRecords() {
  const ids = [...document.querySelectorAll('.bkf-row-check:checked')].map(c => c.dataset.id);
  if (!ids.length) { showToast('삭제할 항목을 선택해 주세요.', 'error'); return; }
  if (!confirm(`선택한 ${ids.length}건을 삭제하시겠습니까?\n(취소/완료되지 않은 예약은 수량이 복구됩니다.)`)) return;

  const res = await bkfApiPost('api/bkf_admin.php', {
    action: 'delete_records', form_id: bkfCurrentFormId, ids: ids.join(','),
  });
  if (res.ok) {
    showToast(`${res.deleted}건이 삭제되었습니다.`);
    bkfUpdateBulkBar();
    bkfLoadRecords(bkfRecordPage);
  } else {
    showToast(res.msg || '오류', 'error');
  }
}

// =====================================================
// 예약 상세/수정 모달
// =====================================================
async function bkfOpenRecordModal(id) {
  const res = await bkfApiGet('api/bkf_admin.php', { action: 'get_record', form_id: bkfCurrentFormId, id });
  if (!res.ok) { showToast(res.msg || '오류', 'error'); return; }

  const d      = res.data;
  const fields = res.fields || [];
  const editable = d.status === '접수';

  document.getElementById('bkf_record_id').value = id;
  document.getElementById('bkfRecordModalTitle').textContent = '예약 상세 — ' + (d.reservation_no || '');

  // 상태 뱃지
  const statusColor = { '접수':'#3b82f6','확인':'#f59e0b','완료':'#22c55e','취소':'#94a3b8' };
  const badge = document.getElementById('bkfRecordStatusBadge');
  badge.textContent = d.status;
  badge.style.cssText = `padding:4px 12px;border-radius:20px;font-size:.82rem;font-weight:600;
    background:${statusColor[d.status] || '#e2e8f0'}22;color:${statusColor[d.status] || '#64748b'};
    border:1px solid ${statusColor[d.status] || '#e2e8f0'};`;

  document.getElementById('bkfRecordNo').textContent = d.reservation_no || '';

  
// =====================================================
// 담당자 메모 저장 (단독)
// =====================================================
async function bkfSaveMemo(recordId) {
  const memo = document.getElementById('bkfRecordMemo')?.value || '';
  const res = await bkfApiPost('api/bkf_admin.php', {
    action:    'save_memo',
    form_id:   bkfCurrentFormId,
    record_id: recordId,
    admin_memo: memo,
  });
  if (res.ok) {
    showToast('메모가 저장되었습니다.', 'success');
    const memoDateEl = document.getElementById('bkfRecordMemoDate');
    const now = new Date();
    const fmt = now.getFullYear() + '-'
      + String(now.getMonth()+1).padStart(2,'0') + '-'
      + String(now.getDate()).padStart(2,'0') + ' '
      + String(now.getHours()).padStart(2,'0') + ':'
      + String(now.getMinutes()).padStart(2,'0');
    if (memoDateEl) memoDateEl.textContent = '최종 수정: ' + fmt;
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

// 상태 변경 셀렉트
  const statusSel = document.getElementById('bkfRecordStatusSelect');
  if (statusSel) statusSel.value = d.status;

  // 수정 불가 안내
  const notice = document.getElementById('bkfRecordEditNotice');
  notice.style.display = editable ? 'none' : '';

  // 기본 필드
  document.getElementById('bkf_rec_name').value       = d.name             || '';
  document.getElementById('bkf_rec_phone').value      = d.phone            || '';
  document.getElementById('bkf_rec_date').value       = d.reservation_date || '';
  document.getElementById('bkf_rec_time').value       = d.reservation_time ? d.reservation_time.slice(0,5) : '';
  document.getElementById('bkf_rec_created_at').value = d.created_at ? d.created_at.slice(0,16) : '';

  // 지점 셀렉트
  const storeSel = document.getElementById('bkf_rec_store');
  storeSel.innerHTML = '<option value="">지점 없음</option>';
  try {
    const sRes = await bkfApiGet('api_front/bkf_public.php', { action: 'get_stores', slug: bkfCurrentFormData.slug || '' });
    const storeGroups = {};
    (sRes.data || []).forEach(s => {
      const region = s.store_name || '기타';
      if (!storeGroups[region]) storeGroups[region] = [];
      storeGroups[region].push(s);
    });
    Object.keys(storeGroups).forEach(region => {
      const og = document.createElement('optgroup');
      og.label = region;
      storeGroups[region].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.branch_name || s.store_name || '';
        if (d.store_id == s.id) opt.selected = true;
        og.appendChild(opt);
      });
      storeSel.appendChild(og);
    });
  } catch (e) {}

  // 수정 가능 여부
  const inputs = ['bkf_rec_name','bkf_rec_phone','bkf_rec_date','bkf_rec_time'];
  inputs.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.disabled = !editable;
  });
  storeSel.disabled = false; // 관리자는 항상 지점 변경 가능

  // 동적 필드
  const dynWrap = document.getElementById('bkfRecordDynFields');
  dynWrap.innerHTML = '';
  fields.filter(f => !['name','phone'].includes(f.field_key)).forEach(f => {
    const val = d[f.field_key] || '';
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label style="font-size:.83rem;color:#64748b;">${escHtml(f.label)}</label>
      <input type="text" class="form-control bkf-dyn-field" data-key="${f.field_key}"
        value="${escHtml(val)}" ${!editable ? 'disabled' : ''}/>`;
    dynWrap.appendChild(div);
  });

  // 저장 버튼 표시
  const saveBtn = document.getElementById('bkfRecordSaveBtn');
  if (saveBtn) saveBtn.style.display = editable ? '' : 'none';

  // 수정일시 표시
  const updatedEl = document.getElementById('bkfRecordUpdatedAt');
  if (updatedEl) updatedEl.textContent = d.updated_at ? d.updated_at.slice(0,16) : '-';

  // 담당자 메모
  const memoEl = document.getElementById('bkfRecordMemo');
  if (memoEl) memoEl.value = d.admin_memo || '';
  const memoDateEl = document.getElementById('bkfRecordMemoDate');
  if (memoDateEl) memoDateEl.textContent = d.memo_updated_at ? '최종 수정: ' + d.memo_updated_at.slice(0,16) : '';

  openModal('bkfRecordModal');
}

// 상태 변경
async function bkfUpdateRecordStatus() {
  const id     = parseInt(document.getElementById('bkf_record_id').value) || 0;
  const status = document.getElementById('bkfRecordStatusSelect').value;
  if (!id) return;

  const res = await bkfApiPost('api/bkf_admin.php', {
    action: 'update_status', form_id: bkfCurrentFormId, id, status,
  });
  if (res.ok) {
    showToast('상태가 변경되었습니다.');
    closeModal('bkfRecordModal');
    bkfLoadRecords(bkfRecordPage);
  } else {
    showToast(res.msg || '오류', 'error');
  }
}

// 예약 수정 저장
async function bkfSaveRecord() {
  if (bkfSaving) return;
  const btn = document.getElementById('bkfRecordSaveBtn');
  bkfLock(btn);

  const id = parseInt(document.getElementById('bkf_record_id').value) || 0;

  const storeSel  = document.getElementById('bkf_rec_store');
  const storeId   = storeSel.value || '';
  const storeName = storeId ? storeSel.options[storeSel.selectedIndex].textContent : '';

  const data = {
    action:           'update_record',
    form_id:          bkfCurrentFormId,
    id,
    name:             document.getElementById('bkf_rec_name').value.trim(),
    phone:            document.getElementById('bkf_rec_phone').value.trim(),
    reservation_date: document.getElementById('bkf_rec_date').value || '',
    reservation_time: document.getElementById('bkf_rec_time').value || '',
    store_id:         storeId,
    store_name:       storeName,
    admin_memo:       document.getElementById('bkfRecordMemo')?.value || '',
  };

  // 동적 필드값 추가
  document.querySelectorAll('.bkf-dyn-field').forEach(el => {
    data[el.dataset.key] = el.value;
  });

  const res = await bkfApiPost('api/bkf_admin.php', data);
  if (res.ok) {
    showToast('예약이 수정되었습니다.');
    closeModal('bkfRecordModal');
    bkfLoadRecords(bkfRecordPage);
  } else {
    showToast(res.msg || '수정 실패', 'error');
  }
  bkfUnlock(btn);
}

// =====================================================
// 엑셀(CSV) 다운로드
// =====================================================
function bkfExcelDownload() {
  const params = new URLSearchParams({
    action:   'export_excel',
    form_id:  bkfCurrentFormId,
    keyword:  (document.getElementById('bkfRecordKeyword')  || {}).value?.trim() || '',
    status:   (document.getElementById('bkfRecordStatus')   || {}).value || '',
    store_id: (document.getElementById('bkfRecordStore')    || {}).value || '',
    from:     (document.getElementById('bkfRecordFrom')     || {}).value || '',
    to:       (document.getElementById('bkfRecordTo')       || {}).value || '',
  });
  window.location.href = 'api/bkf_admin.php?' + params.toString();
}
