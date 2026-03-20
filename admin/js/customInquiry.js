// =====================================================
// CUSTOM INQUIRY - 전역 변수
// =====================================================
let ciCurrentFormId   = 0;
let ciCurrentFormData = {};
let ciCurrentDataPage = 1;
let ciTableChecked    = false; // 테이블명 중복확인 여부
let ciFieldDragSrc    = null;
let ciSaving          = false; // 중복 저장 방지

function ciLock(btn)   { ciSaving = true;  if (btn) { btn.disabled = true; btn.dataset.origText = btn.textContent; btn.textContent = '저장 중...'; } }
function ciUnlock(btn) { ciSaving = false; if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origText || '저장'; } }

// =====================================================
// 폼 추가 - 테이블명 중복확인
// =====================================================
async function ciCheckTable() {
  const name  = document.getElementById('ci_create_table').value.trim();
  const msgEl = document.getElementById('ci_create_table_msg');
  const btn   = document.getElementById('ci_create_submit_btn');
  msgEl.textContent = '';
  btn.disabled = true;
  ciTableChecked = false;

  if (!name) { msgEl.style.color = '#dc2626'; msgEl.textContent = '테이블명을 입력해 주세요.'; return; }

  const res = await apiGet('api/custom_inquiry.php', { action: 'check_table', table_name: name });
  if (res.ok) {
    msgEl.style.color = '#16a34a';
    msgEl.textContent = '✓ ' + res.msg;
    btn.disabled = false;
    ciTableChecked = true;
  } else {
    msgEl.style.color = '#dc2626';
    msgEl.textContent = '✗ ' + res.msg;
  }
}

// 테이블명 변경 시 확인 초기화
document.addEventListener('DOMContentLoaded', function () {
  const tableInput = document.getElementById('ci_create_table');
  if (tableInput) {
    tableInput.addEventListener('input', function () {
      ciTableChecked = false;
      document.getElementById('ci_create_submit_btn').disabled = true;
      document.getElementById('ci_create_table_msg').textContent = '';
    });
  }
});

// =====================================================
// 폼 생성
// =====================================================
async function ciCreateForm() {
  if (ciSaving) return;
  if (!ciTableChecked) { showToast('테이블명 중복 확인을 먼저 해주세요.', 'error'); return; }
  const submitBtn = document.getElementById('ci_create_submit_btn');
  ciLock(submitBtn);
  const title = document.getElementById('ci_create_title').value.trim();
  const desc  = document.getElementById('ci_create_desc').value.trim();
  const btn   = document.getElementById('ci_create_btn').value.trim();
  const tbl   = document.getElementById('ci_create_table').value.trim();

  if (!title || !tbl) { showToast('필수 항목을 입력해 주세요.', 'error'); return; }

  const res = await apiPost('api/custom_inquiry.php', { action: 'create_form', title, description: desc, btn_name: btn, table_name: tbl });
  if (res.ok) {
    showToast('폼이 생성되었습니다.');
    document.getElementById('ci_create_title').value = '';
    document.getElementById('ci_create_desc').value  = '';
    document.getElementById('ci_create_btn').value   = '문의하기';
    document.getElementById('ci_create_table').value = '';
    document.getElementById('ci_create_table_msg').textContent = '';
    document.getElementById('ci_create_submit_btn').disabled = true;
    ciTableChecked = false;
    await ciLoadFormList();
    ciLoadCustomInquirySidebar();
  } else {
    showToast(res.msg || '오류가 발생했습니다.', 'error');
  }
  ciUnlock(submitBtn);
}

// =====================================================
// 폼 목록 로드
// =====================================================
async function ciLoadFormList() {
  const res = await apiGet('api/custom_inquiry.php', { action: 'list_forms' });
  const tbody = document.getElementById('ciFormTableBody');
  if (!res.ok || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">등록된 폼이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = res.data.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(f.title)}</td>
      <td><code style="font-size:.78rem;">${escHtml(f.table_name)}</code></td>
      <td><span class="badge ${f.is_active == 1 ? 'badge-success' : 'badge-gray'}">${f.is_active == 1 ? '사용' : '미사용'}</span></td>
      <td>${f.created_at ? f.created_at.slice(0,16) : '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="ciOpenDetail(${f.id})">설정</button>
        <button class="btn btn-sm btn-outline" onclick="ciCurrentFormId=${f.id};document.getElementById('ciDataTitle').textContent=escHtml('${f.title.replace(/'/g,"\\'")}') + ' 문의내역';showPage('customInquiryData');ciLoadData(${f.id})">내역</button>
        <button class="btn btn-sm" style="background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;" onclick="ciShowPlacementCode('${escHtml(f.table_name)}', '${escHtml(f.title)}')">📋 적용코드</button>
      </td>
    </tr>`).join('');
}

// =====================================================
// 폼 상세 진입
// =====================================================
async function ciOpenDetail(formId) {
  ciCurrentFormId = formId;
  const res = await apiGet('api/custom_inquiry.php', { action: 'get_form', id: formId });
  if (!res.ok) { showToast(res.msg || '오류', 'error'); return; }
  ciCurrentFormData = res.data;

  document.getElementById('ciDetailTitle').textContent = res.data.title + ' 설정';
  document.getElementById('ciDetailTableName').textContent = '테이블: ' + res.data.table_name;

  // 기본정보 채우기
  document.getElementById('ci_title').value            = res.data.title || '';
  document.getElementById('ci_desc').value             = res.data.description || '';
  document.getElementById('ci_btn').value              = res.data.btn_name || '';
  document.getElementById('ci_table_name_display').value = res.data.table_name || '';

  const activeRadios = document.querySelectorAll('input[name="ci_is_active"]');
  activeRadios.forEach(r => { r.checked = (r.value == res.data.is_active); });

  // 토글 초기화
  const features = ['period','login','visibility','comment','product'];
  features.forEach(f => {
    const cb = document.getElementById('ci_' + f + '_use');
    if (cb) { cb.checked = false; }
    const panel = document.getElementById('ci-feature-' + f);
    if (panel) panel.style.display = 'none';
  });

  if (res.data.period_use == 1) {
    document.getElementById('ci_period_use').checked = true;
    document.getElementById('ci-feature-period').style.display = '';
    document.getElementById('ci_period_start').value = res.data.period_start || '';
    document.getElementById('ci_period_end').value   = res.data.period_end || '';
  }
  if (res.data.login_use == 1) {
    document.getElementById('ci_login_use').checked = true;
    document.getElementById('ci-feature-login').style.display = '';
    const types = (res.data.login_types || '').split(',');
    document.querySelectorAll('input[name="ci_login_type"]').forEach(cb => {
      cb.checked = types.includes(cb.value);
    });
  }
  if (res.data.visibility_type) {
    document.getElementById('ci_visibility_use').checked = true;
    document.getElementById('ci-feature-visibility').style.display = '';
    const r = document.querySelector(`input[name="ci_visibility_type"][value="${res.data.visibility_type}"]`);
    if (r) r.checked = true;
  }
  if (res.data.comment_use == 1) {
    document.getElementById('ci_comment_use').checked = true;
    document.getElementById('ci-feature-comment').style.display = '';
  }
  if (res.data.product_use == 1) {
    document.getElementById('ci_product_use').checked = true;
    document.getElementById('ci-feature-product').style.display = '';
    document.getElementById('ci_product_required').checked = res.data.product_required == 1;
  }

  // 답변설정
  document.querySelectorAll('input[name="ci_reply_use"]').forEach(r => { r.checked = (r.value == res.data.reply_use); });
  document.getElementById('ci-reply-method-wrap').style.display = res.data.reply_use == 1 ? '' : 'none';
  if (res.data.reply_method) {
    const r = document.querySelector(`input[name="ci_reply_method"][value="${res.data.reply_method}"]`);
    if (r) r.checked = true;
  }

  showPage('customInquiryDetail');
  ciSwitchTab('basic', document.querySelector('.ci-tab'));
  ciLoadManagers();
  ciLoadStatuses();
  ciLoadFields();
  ciLoadTerms();

  // 적용 안내 배너 갱신
  const tbl   = res.data.table_name;
  const code  = `<?php include 'lib/custom_inquiry_front.php'; ?>\n<!-- 위 코드를 index.php 원하는 위치에 붙여넣으세요 -->\n<!-- table_name: ${tbl} | 폼명: ${res.data.title} -->`;
  let banner = document.getElementById('ci-placement-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'ci-placement-banner';
    const header = document.getElementById('page-customInquiryDetail')?.querySelector('.page-header');
    if (header) header.insertAdjacentElement('afterend', banner);
  }
  const placementCode = `<?php\n$ci_table = '${tbl}';   // 이 폼의 table_name\ninclude __DIR__ . '/lib/custom_inquiry_front.php';\n?>`;
  banner.innerHTML = `
    <div style="margin:0 0 18px;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;display:flex;align-items:flex-start;gap:14px;">
      <div style="font-size:1.3rem;line-height:1;margin-top:2px;">📋</div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:.8rem;font-weight:700;color:#15803d;margin-bottom:8px;">프론트 적용 방법 — index.php 원하는 위치에 아래 코드를 붙여넣으세요</p>
        <div style="position:relative;">
          <pre id="ci-place-code-${tbl}" style="background:#fff;border:1px solid #d1fae5;border-radius:8px;padding:12px 14px;font-size:.78rem;color:#166534;line-height:1.7;overflow-x:auto;margin:0;white-space:pre-wrap;word-break:break-all;">${escHtml(placementCode)}</pre>
          <button onclick="ciCopyPlacementCode('${tbl}')" style="position:absolute;top:8px;right:8px;padding:4px 12px;font-size:.72rem;font-weight:700;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;" id="ci-copy-btn-${tbl}">복사</button>
        </div>
        <p style="font-size:.73rem;color:#4ade80;margin-top:8px;">※ 이 폼이 <strong>미사용</strong> 상태이면 include해도 아무것도 출력되지 않습니다.</p>
      </div>
    </div>`;
}

// =====================================================
// 탭 전환
// =====================================================
function ciSwitchTab(tab, el) {
  document.querySelectorAll('.ci-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ci-tab-panel').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  const panel = document.getElementById('ci-panel-' + tab);
  if (panel) panel.classList.add('active');
}

// =====================================================
// 기능 토글
// =====================================================
function ciToggleFeature(key) {
  const cb    = document.getElementById('ci_' + key + '_use');
  const panel = document.getElementById('ci-feature-' + key);
  if (panel) panel.style.display = cb.checked ? '' : 'none';
}

// =====================================================
// 기본정보 저장
// =====================================================
async function ciSaveBasic() {
  if (ciSaving) return;
  const btn = event?.target || document.querySelector('#ci-panel-basic .btn-primary');
  ciLock(btn);
  const loginTypes = [...document.querySelectorAll('input[name="ci_login_type"]:checked')].map(c => c.value).join(',');
  const commentVis = '';
  const isActive   = (document.querySelector('input[name="ci_is_active"]:checked') || {}).value || 1;
  const loginUse   = document.getElementById('ci_login_use').checked;
  const visUse     = document.getElementById('ci_visibility_use').checked;
  const visType    = visUse ? ((document.querySelector('input[name="ci_visibility_type"]:checked') || {}).value || '') : '';

  // 유효성 검사: 로그인off + 공개글여부(비공개 or 비공개/공개선택) 조합 불가
  if (!loginUse && visUse && (visType === 'private' || visType === 'both')) {
    showToast('로그인 연동을 ON하시거나 공개글 여부를 "공개"로 설정하세요.', 'error');
    ciUnlock(btn);
    return;
  }

  const data = {
    action:           'save_basic',
    id:               ciCurrentFormId,
    title:            document.getElementById('ci_title').value.trim(),
    description:      document.getElementById('ci_desc').value.trim(),
    btn_name:         document.getElementById('ci_btn').value.trim(),
    is_active:        isActive,
    period_use:       document.getElementById('ci_period_use').checked ? 1 : 0,
    period_start:     document.getElementById('ci_period_start').value,
    period_end:       document.getElementById('ci_period_end').value,
    login_use:        document.getElementById('ci_login_use').checked ? 1 : 0,
    login_types:      loginTypes,
    visibility_type:  visType,
    comment_use:      document.getElementById('ci_comment_use').checked ? 1 : 0,
    comment_visibility: commentVis,
    product_use:      document.getElementById('ci_product_use').checked ? 1 : 0,
    product_required: document.getElementById('ci_product_required').checked ? 1 : 0,
  };

  const res = await apiPost('api/custom_inquiry.php', data);
  if (res.ok) {
    showToast('저장되었습니다.');
    ciLoadCustomInquirySidebar();
  } else {
    showToast(res.msg || '오류', 'error');
  }
  ciUnlock(btn);
}

// =====================================================
// 답변설정 저장
// =====================================================
async function ciSaveReply() {
  if (ciSaving) return;
  const btn = event?.target;
  ciLock(btn);
  const reply_use    = (document.querySelector('input[name="ci_reply_use"]:checked') || {}).value || 0;
  const reply_method = (document.querySelector('input[name="ci_reply_method"]:checked') || {}).value || '';
  const res = await apiPost('api/custom_inquiry.php', { action: 'save_reply', id: ciCurrentFormId, reply_use, reply_method });
  if (res.ok) showToast('저장되었습니다.');
  else showToast(res.msg || '오류', 'error');
  ciUnlock(btn);
}

function ciToggleReply() {
  const val = (document.querySelector('input[name="ci_reply_use"]:checked') || {}).value;
  document.getElementById('ci-reply-method-wrap').style.display = val == 1 ? '' : 'none';
}

// =====================================================
// 담당자
// =====================================================
async function ciLoadManagers() {
  const res  = await apiGet('api/custom_inquiry.php', { action: 'list_managers', form_id: ciCurrentFormId });
  const tbody = document.getElementById('ciManagerTableBody');
  if (!res.ok || !res.data.length) {
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
        <td>${escHtml(m.phone || '-')}</td>
        <td>${escHtml(m.email || '-')}</td>
        <td style="font-size:.78rem;">${notifies.join(', ') || '-'}</td>
        <td><span class="badge ${m.is_active == 1 ? 'badge-success' : 'badge-gray'}">${m.is_active == 1 ? '사용' : '미사용'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="ciOpenManagerModal(${m.id})">수정</button>
          <button class="btn btn-sm btn-danger" onclick="ciDeleteManager(${m.id})">삭제</button>
        </td>
      </tr>`;
    }).join('');
  }
  // 히스토리 로드
  const hres = await apiGet('api/custom_inquiry.php', { action: 'list_manager_history', form_id: ciCurrentFormId });
  const hbody = document.getElementById('ciManagerHistoryBody');
  if (!hres.ok || !hres.data.length) {
    hbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">이력이 없습니다.</td></tr>';
  } else {
    hbody.innerHTML = hres.data.map(h => {
      let desc = '';
      try {
        const d = JSON.parse(h.change_desc);
        if (d.action === 'created') desc = '담당자 등록';
        else if (d.action === 'deleted') desc = '담당자 삭제';
        else desc = Object.keys(d).map(k => `${k}: ${d[k].before} → ${d[k].after}`).join(', ');
      } catch (e) { desc = h.change_desc || ''; }
      return `<tr>
        <td>${h.changed_at ? h.changed_at.slice(0,16) : '-'}</td>
        <td>${escHtml(h.manager_name || '(삭제됨)')}</td>
        <td style="font-size:.8rem;">${escHtml(desc)}</td>
        <td>${escHtml(h.changed_by)}</td>
      </tr>`;
    }).join('');
  }
}

async function ciOpenManagerModal(id = 0) {
  document.getElementById('ciManagerModalTitle').textContent = id ? '담당자 수정' : '담당자 추가';
  document.getElementById('ci_mgr_id').value = id;
  // 초기화
  ['ci_mgr_name','ci_mgr_dept','ci_mgr_phone','ci_mgr_email','ci_mgr_sheet_id','ci_mgr_sheet_name','ci_mgr_alimtalk_key','ci_mgr_alimtalk_secret','ci_mgr_alimtalk_sender'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  ['ci_mgr_notify_email','ci_mgr_notify_sheet','ci_mgr_notify_alimtalk','ci_mgr_notify_sms'].forEach(f => {
    const el = document.getElementById(f); if (el) el.checked = false;
  });
  document.getElementById('ci-mgr-panel-sheet').style.display    = 'none';
  document.getElementById('ci-mgr-panel-alimtalk').style.display = 'none';
  const _qel331 = document.querySelector('input[name="ci_mgr_active"][value="1"]');
  if (_qel331) _qel331.checked = true;

  if (id) {
    const res = await apiGet('api/custom_inquiry.php', { action: 'list_managers', form_id: ciCurrentFormId });
    const m = (res.data || []).find(x => x.id == id);
    if (m) {
      document.getElementById('ci_mgr_name').value          = m.name || '';
      document.getElementById('ci_mgr_dept').value          = m.department || '';
      document.getElementById('ci_mgr_phone').value         = m.phone || '';
      document.getElementById('ci_mgr_email').value         = m.email || '';
      document.getElementById('ci_mgr_sheet_id').value      = m.sheet_id || '';
      document.getElementById('ci_mgr_sheet_name').value    = m.sheet_name || '';
      document.getElementById('ci_mgr_alimtalk_key').value  = m.alimtalk_key || '';
      document.getElementById('ci_mgr_alimtalk_secret').value = m.alimtalk_secret || '';
      document.getElementById('ci_mgr_alimtalk_sender').value = m.alimtalk_sender || '';
      document.getElementById('ci_mgr_notify_email').checked    = m.notify_email == 1;
      document.getElementById('ci_mgr_notify_sheet').checked    = m.notify_sheet == 1;
      document.getElementById('ci_mgr_notify_alimtalk').checked = m.notify_alimtalk == 1;
      document.getElementById('ci_mgr_notify_sms').checked      = m.notify_sms == 1;
      if (m.notify_sheet    == 1) document.getElementById('ci-mgr-panel-sheet').style.display    = '';
      if (m.notify_alimtalk == 1) document.getElementById('ci-mgr-panel-alimtalk').style.display = '';
      const _qel351 = document.querySelector(`input[name="ci_mgr_active"][value="${m.is_active}"]`);
      if (_qel351) _qel351.checked = true;
    }
  }
  openModal('ciManagerModal');
}

function ciToggleMgrPanel(key) {
  const cb    = document.getElementById('ci_mgr_notify_' + key);
  const panel = document.getElementById('ci-mgr-panel-' + key);
  if (panel) panel.style.display = cb.checked ? '' : 'none';
}

async function ciSaveManager() {
  if (ciSaving) return;
  const btn = document.querySelector('#ciManagerModal .btn-primary');
  ciLock(btn);
  const id      = intval(document.getElementById('ci_mgr_id').value);
  const isActive = (document.querySelector('input[name="ci_mgr_active"]:checked') || {}).value || 1;
  const data = {
    action:           'save_manager',
    id:               id,
    form_id:          ciCurrentFormId,
    name:             document.getElementById('ci_mgr_name').value.trim(),
    department:       document.getElementById('ci_mgr_dept').value.trim(),
    phone:            document.getElementById('ci_mgr_phone').value.trim(),
    email:            document.getElementById('ci_mgr_email').value.trim(),
    notify_email:     document.getElementById('ci_mgr_notify_email').checked    ? 1 : 0,
    notify_sheet:     document.getElementById('ci_mgr_notify_sheet').checked    ? 1 : 0,
    notify_alimtalk:  document.getElementById('ci_mgr_notify_alimtalk').checked ? 1 : 0,
    notify_sms:       document.getElementById('ci_mgr_notify_sms').checked      ? 1 : 0,
    sheet_id:         document.getElementById('ci_mgr_sheet_id').value.trim(),
    sheet_name:       document.getElementById('ci_mgr_sheet_name').value.trim(),
    alimtalk_key:     document.getElementById('ci_mgr_alimtalk_key').value.trim(),
    alimtalk_secret:  document.getElementById('ci_mgr_alimtalk_secret').value.trim(),
    alimtalk_sender:  document.getElementById('ci_mgr_alimtalk_sender').value.trim(),
    is_active:        isActive,
  };
  const res = await apiPost('api/custom_inquiry.php', data);
  if (res.ok) { closeModal('ciManagerModal'); ciLoadManagers(); showToast('저장되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
  ciUnlock(btn);
}

async function ciDeleteManager(id) {
  if (!confirm('담당자를 삭제하시겠습니까?')) return;
  const res = await apiPost('api/custom_inquiry.php', { action: 'delete_manager', id, form_id: ciCurrentFormId });
  if (res.ok) { ciLoadManagers(); showToast('삭제되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
}

// =====================================================
// 상태 관리
// =====================================================
async function ciLoadStatuses() {
  const res = await apiGet('api/custom_inquiry.php', { action: 'list_statuses', form_id: ciCurrentFormId });
  ciRenderStatusList(res.data || []);
}

function ciRenderStatusList(items) {
  const el = document.getElementById('ciStatusList');
  el.innerHTML = items.map((s, i) => `
    <div class="ci-status-row" data-id="${s.id}" style="display:flex;gap:10px;align-items:center;margin-bottom:8px;padding:8px 12px;background:#f8fafc;border-radius:8px;">
      <span style="cursor:grab;color:#94a3b8;">⠿</span>
      <input type="text" class="form-control" value="${escHtml(s.label)}" data-field="label" style="flex:1;"/>
      <input type="color" value="${s.color || '#64748b'}" data-field="color" style="width:40px;height:36px;border:1px solid var(--border);border-radius:6px;padding:2px;cursor:pointer;"/>
      <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;white-space:nowrap;">
        <input type="checkbox" ${s.is_default == 1 ? 'checked' : ''} data-field="is_default" onchange="ciSetDefaultStatus(this)"/> 기본
      </label>
      <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;">
        <input type="checkbox" ${s.is_active == 1 ? 'checked' : ''} data-field="is_active"/> 사용
      </label>
      <button class="btn btn-sm btn-danger" onclick="ciDeleteStatus(${s.id}, this)">삭제</button>
    </div>`).join('');
}

function ciAddStatusRow() {
  const el   = document.getElementById('ciStatusList');
  const div  = document.createElement('div');
  div.className = 'ci-status-row';
  div.dataset.id = '0';
  div.style = 'display:flex;gap:10px;align-items:center;margin-bottom:8px;padding:8px 12px;background:#f8fafc;border-radius:8px;';
  div.innerHTML = `
    <span style="cursor:grab;color:#94a3b8;">⠿</span>
    <input type="text" class="form-control" value="" data-field="label" placeholder="상태명" style="flex:1;"/>
    <input type="color" value="#64748b" data-field="color" style="width:40px;height:36px;border:1px solid var(--border);border-radius:6px;padding:2px;cursor:pointer;"/>
    <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;white-space:nowrap;">
      <input type="checkbox" data-field="is_default" onchange="ciSetDefaultStatus(this)"/> 기본
    </label>
    <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;">
      <input type="checkbox" checked data-field="is_active"/> 사용
    </label>
    <button class="btn btn-sm btn-danger" onclick="this.closest('.ci-status-row').remove()">삭제</button>`;
  el.appendChild(div);
}

function ciSetDefaultStatus(cb) {
  if (cb.checked) {
    document.querySelectorAll('#ciStatusList input[data-field="is_default"]').forEach(c => {
      if (c !== cb) c.checked = false;
    });
  }
}

async function ciDeleteStatus(id, btn) {
  if (!confirm('이 상태를 삭제하시겠습니까?')) return;
  const res = await apiPost('api/custom_inquiry.php', { action: 'delete_status', id });
  if (res.ok) { btn.closest('.ci-status-row').remove(); showToast('삭제되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
}

async function ciSaveStatuses() {
  if (ciSaving) return;
  const btn = event?.target;
  ciLock(btn);
  const rows  = document.querySelectorAll('#ciStatusList .ci-status-row');
  const items = [];
  rows.forEach((row, i) => {
    items.push({
      id:         row.dataset.id,
      label:      row.querySelector('input[data-field="label"]').value.trim(),
      color:      row.querySelector('input[data-field="color"]').value,
      sort_order: i,
      is_default: row.querySelector('input[data-field="is_default"]').checked ? 1 : 0,
      is_active:  row.querySelector('input[data-field="is_active"]').checked  ? 1 : 0,
    });
  });
  const res = await apiPost('api/custom_inquiry.php', { action: 'save_statuses', form_id: ciCurrentFormId, items: JSON.stringify(items) });
  if (res.ok) showToast('저장되었습니다.');
  else showToast(res.msg || '오류', 'error');
  ciUnlock(btn);
}

// =====================================================
// 필드 관리
// =====================================================
async function ciLoadFields() {
  const res = await apiGet('api/custom_inquiry.php', { action: 'list_fields', form_id: ciCurrentFormId });
  const el  = document.getElementById('ciFieldList');
  if (!res.ok || !res.data.length) {
    el.innerHTML = '<p style="color:#94a3b8;font-size:.85rem;">등록된 필드가 없습니다.</p>';
    return;
  }
  el.innerHTML = res.data.map(f => `
    <div class="ci-field-row" data-id="${f.id}" draggable="true"
      style="display:flex;gap:10px;align-items:center;padding:10px 14px;margin-bottom:6px;background:#f8fafc;border-radius:8px;border:1px solid var(--border);">
      <span style="cursor:grab;color:#94a3b8;" class="ci-drag-handle">⠿</span>
      <div style="flex:1;">
        <span style="font-weight:600;">${escHtml(f.label)}</span>
        <span style="margin-left:8px;font-size:.75rem;color:#64748b;background:#e2e8f0;padding:2px 7px;border-radius:4px;">${f.type}</span>
        ${f.is_required == 1 ? '<span style="margin-left:4px;font-size:.72rem;color:#e53e3e;">필수</span>' : ''}
        <code style="margin-left:8px;font-size:.72rem;color:#94a3b8;">${f.field_key}</code>
      </div>
      <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;cursor:pointer;">
        <input type="checkbox" ${f.is_visible == 1 ? 'checked' : ''} onchange="ciToggleFieldVisible(${f.id}, this)"/> 노출
      </label>
      <button class="btn btn-outline" onclick="ciOpenFieldModal(${f.id})">수정</button>
      <button class="btn btn-danger" style="padding:6px 10px;font-size:.78rem;" onclick="ciDeleteField(${f.id})">삭제</button>
    </div>`).join('');

  el.querySelectorAll('.ci-field-row').forEach(row => {
    row.addEventListener('dragstart', e => { ciFieldDragSrc = row; row.style.opacity = '.4'; });
    row.addEventListener('dragend',   e => { row.style.opacity = ''; });
    row.addEventListener('dragover',  e => { e.preventDefault(); });
    row.addEventListener('drop',      e => {
      e.preventDefault();
      if (ciFieldDragSrc && ciFieldDragSrc !== row) {
        const allRows = [...el.querySelectorAll('.ci-field-row')];
        const srcIdx  = allRows.indexOf(ciFieldDragSrc);
        const dstIdx  = allRows.indexOf(row);
        if (srcIdx < dstIdx) row.after(ciFieldDragSrc);
        else row.before(ciFieldDragSrc);
        ciSaveFieldOrder();
      }
    });
  });
}

async function ciDeleteField(id) {
  if (!confirm('이 필드를 삭제하시겠습니까?\n관련 데이터도 함께 삭제될 수 있습니다.')) return;
  const res = await apiPost('api/custom_inquiry.php', { action: 'delete_field', id, form_id: ciCurrentFormId });
  if (res.ok) { ciLoadFields(); showToast('삭제되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
}

async function ciSaveFieldOrder() {
  const rows   = document.querySelectorAll('#ciFieldList .ci-field-row');
  const orders = [...rows].map((r, i) => ({ id: r.dataset.id, sort: i }));
  await apiPost('api/custom_inquiry.php', { action: 'sort_fields', orders: JSON.stringify(orders) });
}

async function ciToggleFieldVisible(id, cb) {
  const res = await apiPost('api/custom_inquiry.php', { action: 'toggle_field_visible', id, is_visible: cb.checked ? 1 : 0 });
  if (!res.ok) { cb.checked = !cb.checked; showToast('오류가 발생했습니다.', 'error'); }
}

async function ciOpenFieldModal(id = 0) {
  document.getElementById('ciFieldModalTitle').textContent = id ? '필드 수정' : '필드 추가';
  document.getElementById('ci_field_id').value = id;
  ['ci_field_label','ci_field_placeholder'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  document.getElementById('ci_field_key').value = '';
  document.getElementById('ci_field_type').value = '';
  document.querySelectorAll('input[name="ci_field_ext"]').forEach(c => { c.checked = false; });
  document.getElementById('ci-field-placeholder-wrap').style.display = 'none';
  document.getElementById('ci-field-ext-wrap').style.display          = 'none';
  document.getElementById('ci-field-options-wrap').style.display       = 'none';
  document.getElementById('ci-field-options-list').innerHTML            = '';
  const reqEl = document.querySelector('input[name="ci_field_required"][value="0"]');
  const visEl = document.querySelector('input[name="ci_field_visible"][value="1"]');
  if (reqEl) reqEl.checked = true;
  if (visEl) visEl.checked = true;

  const keyEl = document.getElementById('ci_field_key');

  if (id) {
    const res = await apiGet('api/custom_inquiry.php', { action: 'list_fields', form_id: ciCurrentFormId });
    const f   = (res.data || []).find(x => x.id == id);
    if (f) {
      document.getElementById('ci_field_label').value       = f.label || '';
      document.getElementById('ci_field_key').value         = f.field_key || '';
      document.getElementById('ci_field_type').value        = f.type || '';
      document.getElementById('ci_field_placeholder').value = f.placeholder || '';
      keyEl.disabled = true; // 수정 시 키 변경 불가
      ciOnFieldTypeChange();
      if (f.file_exts) {
        const exts = f.file_exts.split(',');
        document.querySelectorAll('input[name="ci_field_ext"]').forEach(c => {
          c.checked = exts.some(e => c.value.includes(e.trim()));
        });
      }
      if (f.options && f.options.length) {
        f.options.forEach(o => ciAddFieldOption(o.label, o.is_visible));
      }
      const reqEl2 = document.querySelector(`input[name="ci_field_required"][value="${f.is_required}"]`);
      const visEl2 = document.querySelector(`input[name="ci_field_visible"][value="${f.is_visible}"]`);
      if (reqEl2) reqEl2.checked = true;
      if (visEl2) visEl2.checked = true;
    }
  } else {
    keyEl.disabled = false;
    // 항목명 입력 시 필드 키 자동 생성 (이전 핸들러 초기화 후 재등록)
    const labelEl = document.getElementById('ci_field_label');
    labelEl.oninput = null;
    labelEl.oninput = function() {
      if (!keyEl.disabled) {
        keyEl.value = ciAutoFieldKey(this.value);
      }
    };
  }
  openModal('ciFieldModal');
}

// 한글 → 영문 필드키 자동변환
function ciAutoFieldKey(str) {
  const map = {
    '이름':'name','성명':'name','이메일':'email','연락처':'phone','전화번호':'phone','핸드폰':'phone',
    '제목':'subject','내용':'content','문의내용':'content','주소':'address','날짜':'date',
    '성별':'gender','나이':'age','직업':'job','회사':'company','부서':'department',
    '파일':'file','첨부':'attachment','선택':'selection','유형':'type','종류':'type',
    '지역':'region','구분':'division','방법':'method','시간':'time','날':'date',
  };
  const trimmed = str.trim();
  if (map[trimmed]) return map[trimmed];
  // 영문/숫자 포함된 경우 그대로 변환
  let key = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  // 한글만 남은 경우 field_ + 타임스탬프
  if (/[가-힣]/.test(key)) {
    key = 'field_' + Date.now().toString().slice(-6);
  }
  return key || 'field_' + Date.now().toString().slice(-6);
}

function ciOnFieldTypeChange() {
  const type = document.getElementById('ci_field_type').value;
  document.getElementById('ci-field-placeholder-wrap').style.display = ['input','textarea'].includes(type) ? '' : 'none';
  document.getElementById('ci-field-ext-wrap').style.display          = type === 'file' ? '' : 'none';
  document.getElementById('ci-field-options-wrap').style.display       = ['select','radio','checkbox'].includes(type) ? '' : 'none';
}

let ciOptDragSrc = null;

function ciAddFieldOption(label = '', isVisible = 1) {
  const list = document.getElementById('ci-field-options-list');
  const div  = document.createElement('div');
  div.draggable = true;
  div.style  = 'display:flex;gap:8px;align-items:center;margin-bottom:6px;background:#f8fafc;padding:6px 8px;border-radius:6px;border:1px solid var(--border);';
  div.innerHTML = `
    <span style="cursor:grab;color:#94a3b8;font-size:1rem;padding:0 2px;">⠿</span>
    <input type="text" class="form-control" value="${escHtml(label)}" placeholder="항목명" style="flex:1;"/>
    <label style="display:flex;align-items:center;gap:4px;font-size:.8rem;font-weight:400;cursor:pointer;white-space:nowrap;">
      <input type="checkbox" ${isVisible == 1 ? 'checked' : ''}/> 사용
    </label>
    <button type="button" class="btn btn-danger" style="padding:4px 8px;font-size:.78rem;" onclick="this.closest('div').remove()">✕</button>`;

  // 드래그 이벤트
  div.addEventListener('dragstart', e => { ciOptDragSrc = div; div.style.opacity = '.4'; });
  div.addEventListener('dragend',   e => { div.style.opacity = ''; });
  div.addEventListener('dragover',  e => { e.preventDefault(); });
  div.addEventListener('drop',      e => {
    e.preventDefault();
    if (ciOptDragSrc && ciOptDragSrc !== div) {
      const all = [...list.querySelectorAll(':scope > div')];
      const si  = all.indexOf(ciOptDragSrc);
      const di  = all.indexOf(div);
      if (si < di) div.after(ciOptDragSrc);
      else div.before(ciOptDragSrc);
    }
  });

  list.appendChild(div);
}

async function ciSaveField() {
  if (ciSaving) return;
  const btn = document.querySelector('#ciFieldModal .btn-primary');
  ciLock(btn);
  const id   = intval(document.getElementById('ci_field_id').value);
  const type = document.getElementById('ci_field_type').value;
  const exts = [...document.querySelectorAll('input[name="ci_field_ext"]:checked')].map(c => c.value).join(',');

  const options = [];
  document.querySelectorAll('#ci-field-options-list > div').forEach(div => {
    const lbl = div.querySelector('input[type="text"]').value.trim();
    const vis = div.querySelector('input[type="checkbox"]').checked ? 1 : 0;
    if (lbl) options.push({ label: lbl, is_visible: vis });
  });

  const data = {
    action:      'save_field',
    id,
    form_id:     ciCurrentFormId,
    label:       document.getElementById('ci_field_label').value.trim(),
    field_key:   document.getElementById('ci_field_key').value.trim(),
    type,
    placeholder: document.getElementById('ci_field_placeholder').value.trim(),
    file_exts:   exts,
    is_required: (document.querySelector('input[name="ci_field_required"]:checked') || {}).value || 0,
    is_visible:  (document.querySelector('input[name="ci_field_visible"]:checked') || {}).value  || 1,
    options:     JSON.stringify(options),
  };
  const res = await apiPost('api/custom_inquiry.php', data);
  if (res.ok) { closeModal('ciFieldModal'); ciLoadFields(); showToast('저장되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
  ciUnlock(btn);
}

// =====================================================
// 약관 관리
// =====================================================
async function ciLoadTerms() {
  const res   = await apiGet('api/custom_inquiry.php', { action: 'list_terms', form_id: ciCurrentFormId });
  const tbody = document.getElementById('ciTermsTableBody');
  if (!res.ok || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">등록된 약관이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = res.data.map((t, i) => `
    <tr draggable="true" data-id="${t.id}">
      <td style="cursor:grab;color:#94a3b8;">⠿</td>
      <td>${escHtml(t.title)}</td>
      <td><span class="badge ${t.is_required == 1 ? 'badge-danger' : 'badge-gray'}">${t.is_required == 1 ? '필수' : '선택'}</span></td>
      <td><span class="badge ${t.is_active  == 1 ? 'badge-success' : 'badge-gray'}">${t.is_active  == 1 ? '사용' : '미사용'}</span></td>
      <td style="font-size:.78rem;">${escHtml(t.updated_by || '-')}<br>${t.updated_at ? t.updated_at.slice(0,16) : ''}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="ciOpenTermModal(${t.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="ciDeleteTerm(${t.id})">삭제</button>
      </td>
    </tr>`).join('');
}

async function ciOpenTermModal(id = 0) {
  document.getElementById('ciTermModalTitle').textContent = id ? '약관 수정' : '약관 추가';
  document.getElementById('ci_term_id').value      = id;
  document.getElementById('ci_term_title').value   = '';
  document.getElementById('ci_term_content').value = '';
  const _qel722 = document.querySelector('input[name="ci_term_required"][value="1"]');
  if (_qel722) _qel722.checked = true;
  const _qel723 = document.querySelector('input[name="ci_term_active"][value="1"]');
  if (_qel723) _qel723.checked = true;

  if (id) {
    const res = await apiGet('api/custom_inquiry.php', { action: 'list_terms', form_id: ciCurrentFormId });
    const t   = (res.data || []).find(x => x.id == id);
    if (t) {
      document.getElementById('ci_term_title').value   = t.title   || '';
      document.getElementById('ci_term_content').value = t.content || '';
      const _qel731 = document.querySelector(`input[name="ci_term_required"][value="${t.is_required}"]`);
      if (_qel731) _qel731.checked = true;
      const _qel732 = document.querySelector(`input[name="ci_term_active"][value="${t.is_active}"]`);
      if (_qel732) _qel732.checked = true;
    }
  }
  openModal('ciTermModal');
}

async function ciSaveTerm() {
  if (ciSaving) return;
  const btn = document.querySelector('#ciTermModal .btn-primary');
  ciLock(btn);
  const data = {
    action:      'save_term',
    id:          intval(document.getElementById('ci_term_id').value),
    form_id:     ciCurrentFormId,
    title:       document.getElementById('ci_term_title').value.trim(),
    content:     document.getElementById('ci_term_content').value.trim(),
    is_required: (document.querySelector('input[name="ci_term_required"]:checked') || {}).value || 1,
    is_active:   (document.querySelector('input[name="ci_term_active"]:checked')   || {}).value || 1,
  };
  const res = await apiPost('api/custom_inquiry.php', data);
  if (res.ok) { closeModal('ciTermModal'); ciLoadTerms(); showToast('저장되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
  ciUnlock(btn);
}

async function ciDeleteTerm(id) {
  if (!confirm('약관을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/custom_inquiry.php', { action: 'delete_term', id, form_id: ciCurrentFormId });
  if (res.ok) { ciLoadTerms(); showToast('삭제되었습니다.'); }
  else showToast(res.msg || '오류', 'error');
}

// =====================================================
// 문의 내역
// =====================================================
async function ciLoadData(formId) {
  if (formId) ciCurrentFormId = formId;
  ciCurrentDataPage = 1;
  // 삭제 버튼 표시
  await ciRenderSearchFilters();
  await ciFetchData();
}

async function ciDeleteSelected() {
  const ids = [...document.querySelectorAll('#ciDataTableBody .row-check:checked')].map(c => c.dataset.id);
  if (!ids.length) { showToast('삭제할 항목을 선택해 주세요.', 'error'); return; }
  if (!confirm(`선택한 ${ids.length}건을 삭제하시겠습니까?`)) return;
  const res = await apiPost('api/custom_inquiry_data.php', { action: 'delete_rows', form_id: ciCurrentFormId, ids: ids.join(',') });
  if (res.ok) {
    showToast(`${res.deleted}건이 삭제되었습니다.`);
    updateBulkBar('ciDataBulk');
    ciFetchData();
  } else showToast(res.msg || '오류', 'error');
}

// 검색 필터 전체 렌더 (상태 + select/radio/checkbox 필드)
async function ciRenderSearchFilters() {
  const [statusRes, fieldRes] = await Promise.all([
    apiGet('api/custom_inquiry.php', { action: 'list_statuses', form_id: ciCurrentFormId }),
    apiGet('api/custom_inquiry.php', { action: 'list_fields',   form_id: ciCurrentFormId }),
  ]);

  const filterWrap  = document.getElementById('ciDynamicFilters');
  const statusWrap  = document.getElementById('ciDynamicStatusFilter');
  if (!filterWrap) return;
  filterWrap.innerHTML = '';

  // 노출 필드(input/textarea/select/radio/checkbox) 헤더 전체 재구성
  const visibleFields = (fieldRes.data || []).filter(f =>
    f.is_visible == 1 && ['input','textarea','select','radio','checkbox'].includes(f.type)
  );
  const thead = document.getElementById('ciDataTableHead');
  if (thead) {
    const fieldThs = visibleFields.map(f =>
      `<th class="ci-field-th" data-field-key="${f.field_key}">${escHtml(f.label)}</th>`
    ).join('');
    thead.innerHTML = `
      <th class="ci-chk-th" style="width:36px;">☑</th>
      <th class="ci-no-th" style="width:50px;">#</th>
      ${fieldThs}
      <th style="width:160px;">신청일시</th>
      <th style="width:80px;">조회수</th>
      <th style="width:100px;">상태</th>
      <th style="width:80px;">상세</th>`;
  }

  // 1행: 상태 셀렉트 → ciDynamicStatusFilter
  if (statusWrap) {
    statusWrap.innerHTML = '';
    const activeStatuses = (statusRes.data || []).filter(s => s.is_active == 1);
    if (activeStatuses.length) {
      const sel = document.createElement('select');
      sel.className = 'form-control';
      sel.id = 'ciFilterStatus';
      sel.innerHTML = '<option value="">전체 상태</option>' +
        activeStatuses.map(s => `<option value="${s.id}">${escHtml(s.label)}</option>`).join('');
      statusWrap.appendChild(sel);
    }
  }

  // 2행: select/radio/checkbox 필드 → ciDynamicFilters
  const choiceFields = (fieldRes.data || []).filter(f =>
    f.is_visible == 1 && ['select','radio','checkbox'].includes(f.type)
  );
  choiceFields.forEach(f => {
    const sel = document.createElement('select');
    sel.className = 'form-control';
    sel.dataset.fieldKey = f.field_key;
    sel.innerHTML = `<option value="">${escHtml(f.label)} 전체</option>` +
      (f.options || [])
        .filter(o => o.is_visible == 1)
        .map(o => `<option value="${escHtml(o.label)}">${escHtml(o.label)}</option>`)
        .join('');
    filterWrap.appendChild(sel);
  });
}

async function ciFetchData() {
  // 동적 필터값 수집
  const statusEl = document.getElementById('ciFilterStatus');
  const fieldFilters = {};
  document.querySelectorAll('#ciDynamicFilters select[data-field-key]').forEach(sel => {
    if (sel.value) fieldFilters[sel.dataset.fieldKey] = sel.value;
  });

  const tbody = document.getElementById('ciDataTableBody');
  // 현재 thead 컬럼 수 기준으로 colspan 동적 계산
  const thead = document.getElementById('ciDataTableHead');
  const colCount = thead ? thead.querySelectorAll('th').length : 7;

  // 로딩 표시
  tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center;padding:40px;color:#94a3b8;">조회 중...</td></tr>`;

  const res = await apiGet('api/custom_inquiry_data.php', {
    action:       'list',
    form_id:      ciCurrentFormId,
    keyword:      document.getElementById('ciDataSearchKeyword').value.trim(),
    keyword_text_only: '1',
    status:       statusEl ? statusEl.value : '',
    from:         document.getElementById('ciDataSearchFrom').value,
    to:           document.getElementById('ciDataSearchTo').value,
    field_filters: JSON.stringify(fieldFilters),
    page:          ciCurrentDataPage,
  });

  // 검색어 있는 경우와 없는 경우 메시지 구분
  const hasFilter = document.getElementById('ciDataSearchKeyword').value.trim() ||
    (statusEl && statusEl.value) ||
    document.getElementById('ciDataSearchFrom').value ||
    document.getElementById('ciDataSearchTo').value ||
    [...document.querySelectorAll('#ciDynamicFilters select')].some(s => s.value);

  if (!res.ok) {
    tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center;padding:40px;color:#94a3b8;">데이터를 불러오지 못했습니다.</td></tr>`;
    document.getElementById('ciDataPagination').innerHTML = '';
    return;
  }
  if (!res.data || !res.data.length) {
    const msg = hasFilter ? '검색 결과가 없습니다.' : '등록된 문의 내역이 없습니다.';
    tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center;padding:40px;color:#94a3b8;">${msg}</td></tr>`;
    document.getElementById('ciDataPagination').innerHTML = '';
    return;
  }

  const offset = (ciCurrentDataPage - 1) * res.limit;
  // 폼 설정 확인 (login_use, comment_use)
  const formRes = await apiGet('api/custom_inquiry.php', { action: 'get_form', id: ciCurrentFormId });
  const formCfg = formRes.data || {};

  tbody.innerHTML = res.data.map((d, i) => {
    const loginInfo = formCfg.login_use == 1 && d.login_id
      ? `<span style="font-size:.75rem;color:#64748b;margin-left:6px;">${escHtml(d.login_name || d.login_id)} (${escHtml(d.login_type||'')})</span>` : '';
    const commentBadge = formCfg.comment_use == 1
      ? `<span style="font-size:.75rem;color:#64748b;margin-left:4px;">💬${d.comment_count||0}</span>` : '';
    const fieldKeys = res.field_keys || [];
    const fieldValues = fieldKeys.map((key, idx) => {
      const val = d[key] != null ? String(d[key]) : '-';
      return `<td>${escHtml(val)}${idx === 0 ? loginInfo : ''}</td>`;
    }).join('');
    return `<tr>
      <td><input type="checkbox" class="row-check" data-id="${d.id}" onchange="updateBulkBar('ciDataBulk')"></td>
      <td>${res.total - offset - i}</td>
      ${fieldValues || `<td>-${loginInfo}</td>`}
      <td>${d.created_at ? d.created_at.slice(0,16) : '-'}</td>
      <td>${d.view_count || 0}${commentBadge}</td>
      <td><span class="badge" style="background:${d.status_color || '#e2e8f0'};color:#fff;">${escHtml(d.status_label || '-')}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="ciOpenDataDetail(${d.id})">상세</button></td>
    </tr>`;
  }).join('');

  // 페이지네이션
  const totalPage = Math.ceil(res.total / res.limit);
  let pages = '';
  for (let p = 1; p <= totalPage; p++) {
    pages += `<button class="btn btn-sm ${p === ciCurrentDataPage ? 'btn-primary' : 'btn-outline'}" onclick="ciGoPage(${p})">${p}</button>`;
  }
  document.getElementById('ciDataPagination').innerHTML = pages;
}

function ciGoPage(p) { ciCurrentDataPage = p; ciFetchData(); }

function ciResetSearch() {
  document.getElementById('ciDataSearchKeyword').value = '';
  document.getElementById('ciDataSearchFrom').value    = '';
  document.getElementById('ciDataSearchTo').value      = '';
  document.querySelectorAll('#ciDynamicFilters select').forEach(sel => { sel.value = ''; });
  const statusEl = document.getElementById('ciFilterStatus');
  if (statusEl) statusEl.value = '';
  ciCurrentDataPage = 1;
  ciFetchData();
}

async function ciOpenDataDetail(id) {
  const res = await apiGet('api/custom_inquiry_data.php', { action: 'detail', form_id: ciCurrentFormId, id });
  if (!res.ok) { showToast(res.msg || '오류', 'error'); return; }

  const d        = res.data;
  const fields   = res.fields   || [];
  const statuses = res.statuses || [];
  const form     = res.form     || {};
  console.log('[CI Detail] form:', form, 'reply_use:', form.reply_use, 'comment_use:', form.comment_use);

  // 상태 변경 select
  const statusOpts = statuses.map(s =>
    `<option value="${s.id}" ${d.status_id == s.id ? 'selected' : ''}>${escHtml(s.label)}</option>`
  ).join('');

  let html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div><label style="font-size:.78rem;color:#94a3b8;">신청일시</label><p style="margin:2px 0;">${d.created_at ? d.created_at.slice(0,16) : '-'}</p></div>
      <div><label style="font-size:.78rem;color:#94a3b8;">수정일시</label><p style="margin:2px 0;">${d.updated_at ? d.updated_at.slice(0,16) : '-'}</p></div>
      <div><label style="font-size:.78rem;color:#94a3b8;">조회수</label><p style="margin:2px 0;">${d.view_count || 0}</p></div>
      <div><label style="font-size:.78rem;color:#94a3b8;">상태</label>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <select class="form-control" id="ciDetailStatusSel" style="width:auto;" onchange="ciSaveDetailStatus(${d.id}, this.value)">
            ${statusOpts}
          </select>
        </div>
      </div>
    </div>`;

  // 로그인 정보
  if (form.login_use == 1 && d.login_id) {
    html += `<div style="margin-bottom:12px;padding:10px 14px;background:#f8fafc;border-radius:8px;">
      <label style="font-size:.78rem;color:#94a3b8;">로그인 정보</label>
      <p style="margin:4px 0;">${escHtml(d.login_name || d.login_id)} · <span style="color:#64748b;font-size:.82rem;">${escHtml(d.login_type||'')}</span></p>
    </div>`;
  }

  html += `<hr style="border:none;border-top:1px solid var(--border);margin:12px 0;">`;

  // 필드값
  fields.forEach(f => {
    if (f.field_key === 'category_id') {
      html += `<div style="margin-top:12px;"><label style="font-size:.78rem;color:#94a3b8;">제품 분류</label><p style="margin:4px 0;">${escHtml(d.category_name || '-')}</p></div>`;
    } else if (f.field_key === 'product_id') {
      html += `<div style="margin-top:12px;"><label style="font-size:.78rem;color:#94a3b8;">제품명</label><p style="margin:4px 0;">${escHtml(d.product_name || '-')}</p></div>`;
    } else {
      const val = d[f.field_key] || '-';
      html += `<div style="margin-top:12px;"><label style="font-size:.78rem;color:#94a3b8;">${escHtml(f.label)}</label><p style="margin:4px 0;white-space:pre-wrap;">${escHtml(val)}</p></div>`;
    }
  });

  // 답변 영역
  if (parseInt(form.reply_use) === 1) {
    html += `<hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
    <div>
      <label style="font-size:.85rem;font-weight:600;color:#475569;">답변</label>
      ${d.reply_at ? `<span style="font-size:.75rem;color:#94a3b8;margin-left:8px;">최종 답변: ${d.reply_at.slice(0,16)}</span>` : ''}
      <textarea id="ciDetailReply" class="form-control" rows="4" style="margin-top:8px;resize:vertical;" placeholder="답변 내용을 입력하세요">${escHtml(d.reply_content || '')}</textarea>
      <button class="btn btn-primary" style="margin-top:8px;" onclick="ciSaveDetailReply(${d.id})">답변 저장</button>
    </div>`;
  }

  // 댓글 영역
  if (parseInt(form.comment_use) === 1) {
    html += `<hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
    <div>
      <label style="font-size:.85rem;font-weight:600;color:#475569;">댓글</label>
      <div id="ciDetailComments" style="margin-top:10px;">로딩 중...</div>
    </div>`;
  }

  document.getElementById('ciDataDetailBody').innerHTML = html;

  // 현재 상세 row id 저장
  window._ciDetailRowId = d.id;

  openModal('ciDataDetailModal');

  // 댓글 로드
  if (parseInt(form.comment_use) === 1) {
    ciLoadComments(d.id);
  }
}

async function ciSaveDetailStatus(rowId, statusId) {
  const res = await apiPost('api/custom_inquiry_data.php', { action: 'update_status', form_id: ciCurrentFormId, id: rowId, status_id: statusId });
  if (res.ok) { showToast('상태가 변경되었습니다.'); ciFetchData(); }
  else showToast(res.msg || '오류', 'error');
}

async function ciSaveDetailReply(rowId) {
  const replyEl = document.getElementById('ciDetailReply');
  if (!replyEl) { showToast('답변 입력란을 찾을 수 없습니다.', 'error'); return; }
  const content = replyEl.value.trim();
  const res = await apiPost('api/custom_inquiry_data.php', { action: 'save_reply', form_id: ciCurrentFormId, id: rowId, reply_content: content });
  if (res.ok) {
    if (res.mail_sent) showToast('답변이 저장되었으며 이메일이 발송되었습니다.');
    else if (res.mail_error) showToast('답변은 저장되었으나 이메일 발송 실패: ' + res.mail_error, 'error');
    else showToast('답변이 저장되었습니다.');
  } else showToast(res.msg || '오류', 'error');
}

async function ciLoadComments(rowId) {
  const el  = document.getElementById('ciDetailComments');
  if (!el) return;
  const res = await apiGet('api/custom_inquiry.php', { action: 'list_comments', form_id: ciCurrentFormId, row_id: rowId });
  if (!res.ok || !res.data.length) {
    el.innerHTML = '<p style="color:#94a3b8;font-size:.85rem;">댓글이 없습니다.</p>';
    return;
  }
  el.innerHTML = res.data.map(c => `
    <div style="padding:10px 14px;margin-bottom:8px;background:${c.visibility==1?'#f8fafc':'#fef9c3'};border-radius:8px;border:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="font-size:.8rem;color:#475569;">
          <strong>${escHtml(c.author||'익명')}</strong>
          ${c.login_type ? `<span style="color:#94a3b8;"> (${escHtml(c.login_type)})</span>` : ''}
          <span style="color:#94a3b8;margin-left:8px;">${c.created_at ? c.created_at.slice(0,16) : ''}</span>
          ${c.updated_at !== c.created_at ? `<span style="color:#94a3b8;"> · 수정: ${c.updated_at.slice(0,16)}</span>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <span style="font-size:.75rem;color:${c.visibility==1?'#16a34a':'#94a3b8'};">${c.visibility==1?'공개':'비공개'}</span>
          <button class="btn btn-outline" style="padding:3px 8px;font-size:.75rem;"
            onclick="ciToggleCommentVisibility(${c.id}, ${c.visibility==1?0:1})">
            ${c.visibility==1?'비공개 처리':'공개 처리'}
          </button>
        </div>
      </div>
      <p style="margin:0;font-size:.88rem;white-space:pre-wrap;">${escHtml(c.content)}</p>
    </div>`).join('');
}

async function ciToggleCommentVisibility(commentId, visibility) {
  const res = await apiPost('api/custom_inquiry.php', { action: 'toggle_comment_visibility', form_id: ciCurrentFormId, comment_id: commentId, visibility });
  if (res.ok) { showToast('처리되었습니다.'); ciLoadComments(window._ciDetailRowId); }
  else showToast(res.msg || '오류', 'error');
}


function ciExcelDownload() {
  const statusEl  = document.getElementById('ciFilterStatus');
  const keywordEl = document.getElementById('ciDataSearchKeyword');
  const fromEl    = document.getElementById('ciDataSearchFrom');
  const toEl      = document.getElementById('ciDataSearchTo');
  const params = new URLSearchParams({
    action:  'excel',
    form_id: ciCurrentFormId,
    keyword: keywordEl ? keywordEl.value.trim() : '',
    status:  statusEl  ? statusEl.value : '',
    from:    fromEl    ? fromEl.value   : '',
    to:      toEl      ? toEl.value     : '',
  });
  window.location.href = 'api/custom_inquiry_data.php?' + params.toString();
}

// =====================================================
// 사이드바 동적 메뉴 (문의폼별 내역)
// =====================================================
async function ciLoadCustomInquirySidebar() {
  const res  = await apiGet('api/custom_inquiry.php', { action: 'list_forms' });
  const sub  = document.getElementById('customInquiryNavSub');
  if (!sub) return;

  // 기본 메뉴 유지 (추가/목록)
  const dynamicItems = sub.querySelectorAll('.ci-dynamic-nav');
  dynamicItems.forEach(el => el.remove());

  (res.data || []).forEach(f => {
    const pageId = `customInquiryData_${f.id}`;
    const div    = document.createElement('div');
    div.className = 'nav-sub-link ci-dynamic-nav';
    div.textContent = f.title + ' 내역';
    div.onclick     = function() {
      ciCurrentFormId = f.id;
      document.getElementById('ciDataTitle').textContent = f.title + ' 문의내역';
      showPage('customInquiryData');
      ciLoadData(f.id);
    };
    div._pageId = pageId;
    sub.appendChild(div);

    // PAGE_LABELS 동적 등록
    PAGE_LABELS[pageId] = ['문의 폼', f.title + ' 내역'];
  });
}

// =====================================================
// 유틸
// =====================================================
function intval(v) { return parseInt(v, 10) || 0; }
function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// =====================================================
// 적용코드 안내 모달 (목록에서 바로 보기)
// =====================================================
function ciShowPlacementCode(tableName, formTitle) {
  const code = `<?php\n$ci_table = '${tableName}';   // 이 폼의 table_name\ninclude __DIR__ . '/lib/custom_inquiry_front.php';\n?>`;

  // 기존 모달 제거
  const old = document.getElementById('ci-placement-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'ci-placement-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(8,14,26,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:560px;box-shadow:0 24px 64px rgba(0,0,0,.22);overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #e2e8f0;">
        <div>
          <p style="font-size:.72rem;color:#94a3b8;margin-bottom:2px;">프론트 적용 코드</p>
          <strong style="font-size:.96rem;color:#1a2540;">${escHtml(formTitle)}</strong>
        </div>
        <button onclick="document.getElementById('ci-placement-modal').remove()" style="width:32px;height:32px;border-radius:50%;border:none;background:#f1f5f9;cursor:pointer;font-size:1.1rem;color:#64748b;display:grid;place-items:center;">✕</button>
      </div>
      <div style="padding:20px 22px;">
        <p style="font-size:.82rem;color:#334155;margin-bottom:12px;line-height:1.6;">
          <strong>index.php</strong> 원하는 위치에 아래 코드를 붙여넣으세요.<br>
          <span style="color:#94a3b8;font-size:.76rem;">폼이 <strong>미사용</strong> 상태이면 include해도 아무것도 출력되지 않습니다.</span>
        </p>
        <div style="position:relative;">
          <pre id="ci-modal-code-${tableName}" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;font-size:.8rem;color:#1e3a5f;line-height:1.75;overflow-x:auto;margin:0;white-space:pre-wrap;word-break:break-all;">${escHtml(code)}</pre>
          <button id="ci-modal-copy-btn-${tableName}" onclick="ciCopyPlacementCode('${tableName}', true)" style="position:absolute;top:10px;right:10px;padding:5px 14px;font-size:.74rem;font-weight:700;background:#1255a6;color:#fff;border:none;border-radius:7px;cursor:pointer;">복사</button>
        </div>
        <div style="margin-top:16px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:9px;font-size:.76rem;color:#92400e;line-height:1.65;">
          💡 <strong>예시:</strong> 예약 섹션 다음에 배치하고 싶다면 index.php에서 <code style="background:#fef3c7;padding:1px 5px;border-radius:4px;">front_reservation</code> div 바로 아래에 붙여넣으세요.
        </div>
      </div>
    </div>`;

  // 배경 클릭 시 닫기
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function ciCopyPlacementCode(tableName, isModal = false) {
  const code = `<?php\n$ci_table = '${tableName}';\ninclude __DIR__ . '/lib/custom_inquiry_front.php';\n?>`;
  navigator.clipboard.writeText(code).then(() => {
    const btnId = isModal ? `ci-modal-copy-btn-${tableName}` : `ci-copy-btn-${tableName}`;
    const btn = document.getElementById(btnId);
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ 복사됨';
      btn.style.background = '#16a34a';
      setTimeout(() => { btn.textContent = orig; btn.style.background = isModal ? '#1255a6' : '#16a34a'; }, 2000);
    }
  }).catch(() => {
    // clipboard API 실패 시 폴백
    const el = document.createElement('textarea');
    el.value = code;
    el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('복사되었습니다.');
  });
}