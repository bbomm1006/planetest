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
        <button class="btn btn-sm btn-outline" onclick="showPage('customInquiryData_${f.id}')">내역</button>
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
    const r = document.querySelector(`input[name="ci_comment_visibility"][value="${res.data.comment_visibility}"]`);
    if (r) r.checked = true;
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
  const visType    = (document.querySelector('input[name="ci_visibility_type"]:checked') || {}).value || '';
  const commentVis = (document.querySelector('input[name="ci_comment_visibility"]:checked') || {}).value || '';
  const isActive   = (document.querySelector('input[name="ci_is_active"]:checked') || {}).value || 1;

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
  ['ci_mgr_name','ci_mgr_dept','ci_mgr_phone','ci_mgr_email','ci_mgr_sheet_id','ci_mgr_sheet_name','ci_mgr_alimtalk_key','ci_mgr_alimtalk_sender'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  ['ci_mgr_notify_email','ci_mgr_notify_sheet','ci_mgr_notify_alimtalk','ci_mgr_notify_sms'].forEach(f => {
    const el = document.getElementById(f); if (el) el.checked = false;
  });
  document.getElementById('ci-mgr-panel-sheet').style.display    = 'none';
  document.getElementById('ci-mgr-panel-alimtalk').style.display = 'none';
  document.querySelector('input[name="ci_mgr_active"][value="1"]').checked = true;

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
      document.getElementById('ci_mgr_alimtalk_sender').value = m.alimtalk_sender || '';
      document.getElementById('ci_mgr_notify_email').checked    = m.notify_email == 1;
      document.getElementById('ci_mgr_notify_sheet').checked    = m.notify_sheet == 1;
      document.getElementById('ci_mgr_notify_alimtalk').checked = m.notify_alimtalk == 1;
      document.getElementById('ci_mgr_notify_sms').checked      = m.notify_sms == 1;
      if (m.notify_sheet    == 1) document.getElementById('ci-mgr-panel-sheet').style.display    = '';
      if (m.notify_alimtalk == 1) document.getElementById('ci-mgr-panel-alimtalk').style.display = '';
      document.querySelector(`input[name="ci_mgr_active"][value="${m.is_active}"]`).checked = true;
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
      <button class="btn btn-sm btn-outline" onclick="ciOpenFieldModal(${f.id})">수정</button>
    </div>`).join('');

  // 드래그 이벤트
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
    // 항목명 입력 시 필드 키 자동 생성
    const labelEl = document.getElementById('ci_field_label');
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
  document.querySelector('input[name="ci_term_required"][value="1"]').checked = true;
  document.querySelector('input[name="ci_term_active"][value="1"]').checked   = true;

  if (id) {
    const res = await apiGet('api/custom_inquiry.php', { action: 'list_terms', form_id: ciCurrentFormId });
    const t   = (res.data || []).find(x => x.id == id);
    if (t) {
      document.getElementById('ci_term_title').value   = t.title   || '';
      document.getElementById('ci_term_content').value = t.content || '';
      document.querySelector(`input[name="ci_term_required"][value="${t.is_required}"]`).checked = true;
      document.querySelector(`input[name="ci_term_active"][value="${t.is_active}"]`).checked     = true;
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
  await ciRenderSearchFilters();
  await ciFetchData();
}

// 검색 필터 전체 렌더 (상태 + select/radio/checkbox 필드)
async function ciRenderSearchFilters() {
  const [statusRes, fieldRes] = await Promise.all([
    apiGet('api/custom_inquiry.php', { action: 'list_statuses', form_id: ciCurrentFormId }),
    apiGet('api/custom_inquiry.php', { action: 'list_fields',   form_id: ciCurrentFormId }),
  ]);

  const filterWrap = document.getElementById('ciDynamicFilters');
  if (!filterWrap) return;
  filterWrap.innerHTML = '';

  // 상태 셀렉트 (사용중인 것만)
  const activeStatuses = (statusRes.data || []).filter(s => s.is_active == 1);
  if (activeStatuses.length) {
    const sel = document.createElement('select');
    sel.className = 'form-control';
    sel.id = 'ciFilterStatus';
    sel.innerHTML = '<option value="">전체 상태</option>' +
      activeStatuses.map(s => `<option value="${s.id}">${escHtml(s.label)}</option>`).join('');
    filterWrap.appendChild(sel);
  }

  // select/radio/checkbox 필드 셀렉트 (노출 중인 것만)
  const choiceFields = (fieldRes.data || []).filter(f =>
    f.is_visible == 1 && ['select','radio','checkbox'].includes(f.type)
  );
  choiceFields.forEach(f => {
    const sel = document.createElement('select');
    sel.className = 'form-control';
    sel.dataset.fieldKey = f.field_key;
    sel.dataset.fieldId  = f.id;
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
  // 로딩 표시 (검색 중 피드백)
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">조회 중...</td></tr>';

  const res = await apiGet('api/custom_inquiry_data.php', {
    action:       'list',
    form_id:      ciCurrentFormId,
    keyword:      document.getElementById('ciDataSearchKeyword').value.trim(),
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
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">데이터를 불러오지 못했습니다.</td></tr>';
    document.getElementById('ciDataPagination').innerHTML = '';
    return;
  }
  if (!res.data || !res.data.length) {
    const msg = hasFilter ? '검색 결과가 없습니다.' : '등록된 문의 내역이 없습니다.';
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">${msg}</td></tr>`;
    document.getElementById('ciDataPagination').innerHTML = '';
    return;
  }

  const offset = (ciCurrentDataPage - 1) * res.limit;
  tbody.innerHTML = res.data.map((d, i) => `
    <tr>
      <td>${res.total - offset - i}</td>
      <td>${escHtml(d.title || '-')}</td>
      <td>${d.created_at ? d.created_at.slice(0,16) : '-'}</td>
      <td>${d.view_count || 0}</td>
      <td><span class="badge" style="background:${d.status_color || '#e2e8f0'};color:#fff;">${escHtml(d.status_label || '-')}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="ciOpenDataDetail(${d.id})">상세</button></td>
    </tr>`).join('');

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
  ciCurrentDataPage = 1;
  ciFetchData();
}

async function ciOpenDataDetail(id) {
  const res = await apiGet('api/custom_inquiry_data.php', { action: 'detail', form_id: ciCurrentFormId, id });
  if (!res.ok) { showToast(res.msg || '오류', 'error'); return; }

  const d      = res.data;
  const fields = res.fields || [];

  let html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div><label style="font-size:.78rem;color:#94a3b8;">신청일시</label><p style="margin:2px 0;">${d.created_at ? d.created_at.slice(0,16) : '-'}</p></div>
      <div><label style="font-size:.78rem;color:#94a3b8;">수정일시</label><p style="margin:2px 0;">${d.updated_at ? d.updated_at.slice(0,16) : '-'}</p></div>
      <div><label style="font-size:.78rem;color:#94a3b8;">조회수</label><p style="margin:2px 0;">${d.view_count || 0}</p></div>
      <div><label style="font-size:.78rem;color:#94a3b8;">상태</label>
        <p style="margin:2px 0;"><span class="badge" style="background:${d.status_color||'#e2e8f0'};color:#fff;">${escHtml(d.status_label||'-')}</span></p>
      </div>
    </div>
    <hr style="border:none;border-top:1px solid var(--border);margin:12px 0;">
    <div><label style="font-size:.78rem;color:#94a3b8;">제목</label><p style="margin:4px 0;">${escHtml(d.title || '-')}</p></div>`;

  fields.forEach(f => {
    const val = d[f.field_key] || '-';
    html += `<div style="margin-top:12px;">
      <label style="font-size:.78rem;color:#94a3b8;">${escHtml(f.label)}</label>
      <p style="margin:4px 0;white-space:pre-wrap;">${escHtml(val)}</p>
    </div>`;
  });

  if (d.login_type) {
    html += `<div style="margin-top:12px;"><label style="font-size:.78rem;color:#94a3b8;">로그인 방법</label><p style="margin:4px 0;">${escHtml(d.login_type)}</p></div>`;
  }

  document.getElementById('ciDataDetailBody').innerHTML = html;
  openModal('ciDataDetailModal');
}

function ciExcelDownload() {
  const params = new URLSearchParams({
    action:  'excel',
    form_id: ciCurrentFormId,
    keyword: document.getElementById('ciDataSearchKeyword').value.trim(),
    status:  document.getElementById('ciDataSearchStatus').value,
    from:    document.getElementById('ciDataSearchFrom').value,
    to:      document.getElementById('ciDataSearchTo').value,
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
