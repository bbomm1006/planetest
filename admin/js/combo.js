// ===========================
// 신청 내역
// ===========================
// 구글시트 패널 토글
function comboToggleSheetPanel(cb) {
  const panel = document.getElementById('combo_mgr_sheet_panel');
  if (panel) panel.style.display = cb.checked ? '' : 'none';
}


let comboInquiryData = [];
let comboDetailTarget = null;
let _comboMgrCache = [];

async function loadComboInquiryList() {
  const kw     = document.getElementById('comboInqSearch')?.value || '';
  const status = document.getElementById('comboInqStatusFilter')?.value || '';
  const res = await apiGet('api/combo.php', { action: 'inquiryList', kw, status });
  if (!res.ok) return;
  comboInquiryData = res.data;
  renderComboInquiryTable();
}

function renderComboInquiryTable() {
  const tbody = document.getElementById('comboInquiryTableBody');
  if (!tbody) return;
  const sc = { '접수': '#3b82f6', '확인': '#f59e0b', '완료': '#10b981', '취소': '#94a3b8' };
  if (!comboInquiryData.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:32px;">신청 내역이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = comboInquiryData.map((r, i) => {
    const c = sc[r.status] || '#94a3b8';
    return `<tr>
      <td>${comboInquiryData.length - i}</td>
      <td><span class="status-badge" style="background:${c}20;color:${c};border:1px solid ${c}40">${esc(r.status)}</span></td>
      <td>${esc(r.name)}</td>
      <td>${esc(r.phone)}</td>
      <td>${esc(r.product_name)}</td>
      <td>${esc(r.time_slot)}</td>
      <td>${r.manager_name ? esc(r.manager_name) : '<span style="color:var(--text-muted)">미배정</span>'}</td>
      <td>${(r.created_at || '').slice(0, 16)}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openComboDetail(${r.id})">상세</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteComboInquiry(${r.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

async function openComboDetail(id) {
  const res = await apiGet('api/combo.php', { action: 'inquiryGet', id });
  if (!res.ok) return;
  const r = res.data;
  comboDetailTarget = id;

  document.getElementById('comboDetailStatus').value       = r.status        || '접수';
  document.getElementById('comboDetailCreatedAt').value    = (r.created_at   || '').slice(0, 16);
  document.getElementById('comboDetailName').value         = r.name          || '';
  document.getElementById('comboDetailPhone').value        = r.phone         || '';
  document.getElementById('comboDetailTimeSlot').value     = r.time_slot     || '';
  document.getElementById('comboDetailProductName').value  = r.product_name  || '';
  document.getElementById('comboDetailCardDiscount').value = r.card_discount_name || '없음';
  document.getElementById('comboDetailFinalPrice').value   = r.final_price
    ? (+r.final_price).toLocaleString('ko-KR') + '원/월' : '';
  document.getElementById('comboDetailMessage').value      = r.message       || '';
  document.getElementById('comboDetailMemo').value         = r.manager_memo  || '';

  // 담당자 셀렉트 채우기
  await _loadComboMgrSelect('comboDetailManagerId', r.manager_id);
  openModal('comboDetailModal');
}

async function _loadComboMgrSelect(selectId, selectedId) {
  if (!_comboMgrCache.length) {
    const res = await apiGet('api/combo.php', { action: 'managerList' });
    if (res.ok) _comboMgrCache = res.data.filter(m => +m.is_active === 1);
  }
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">-- 미배정 --</option>'
    + _comboMgrCache.map(m =>
        `<option value="${m.id}" ${m.id == selectedId ? 'selected' : ''}>${esc(m.name)}</option>`
      ).join('');
}

async function saveComboDetail() {
  if (!comboDetailTarget) return;
  const data = {
    action:       'inquirySave',
    id:           comboDetailTarget,
    status:       document.getElementById('comboDetailStatus').value,
    manager_id:   document.getElementById('comboDetailManagerId').value,
    manager_memo: document.getElementById('comboDetailMemo').value.trim(),
  };
  const res = await apiPost('api/combo.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('comboDetailModal');
    loadComboInquiryList();
  } else showToast(res.msg || '저장 실패', 'error');
}

async function deleteComboInquiry(id) {
  if (!confirm('신청 내역을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/combo.php', { action: 'inquiryDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadComboInquiryList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}


function comboInquiryExcelDownload() {
  const kw     = document.getElementById('comboInqSearch')?.value     || '';
  const status = document.getElementById('comboInqStatusFilter')?.value || '';
  const params = new URLSearchParams({ action: 'inquiryExcel', kw, status });
  window.location.href = 'api/combo.php?' + params.toString();
}

// ===========================
// 담당관리자
// ===========================
let comboManagerData = [];

async function loadComboManagerList() {
  _comboMgrCache = []; // 캐시 초기화
  const res = await apiGet('api/combo.php', { action: 'managerList' });
  if (res.ok) { comboManagerData = res.data; renderComboManagerTable(); }
  loadComboManagerHistory();
}

function renderComboManagerTable() {
  const tbody = document.getElementById('comboManagerTableBody');
  if (!tbody) return;
  if (!comboManagerData.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px;">담당자가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = comboManagerData.map(m => {
    const notifies = [];
    if (+m.notify_email)    notifies.push('이메일');
    if (+m.notify_sheet)    notifies.push('구글시트');
    if (+m.notify_alimtalk) notifies.push('알림톡');
    if (+m.notify_sms)      notifies.push('문자');
    return `<tr draggable="true" data-id="${m.id}">
      <td><span class="sort-handle">⠿</span></td>
      <td>${esc(m.name)}</td>
      <td>${esc(m.department || '-')}</td>
      <td>${esc(m.phone || '-')}</td>
      <td>${esc(m.email || '-')}</td>
      <td style="font-size:.78rem;">${notifies.join(', ') || '-'}</td>
      <td><span class="status-badge ${+m.is_active ? 'status-사용' : 'status-미사용'}">${+m.is_active ? '사용' : '미사용'}</span></td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openComboManagerModal(${m.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteComboManager(${m.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
  initTableDrag(document.getElementById('comboManagerTableBody'), saveComboManagerOrder);
}

async function loadComboManagerHistory() {
  const res = await apiGet('api/combo.php', { action: 'managerHistoryList' });
  const tbody = document.getElementById('comboManagerHistoryBody');
  if (!tbody) return;
  if (!res.ok || !res.data.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">이력이 없습니다.</td></tr>`;
    return;
  }
  const fieldLabels = {
    name: '이름', department: '담당부서', phone: '연락처', email: '이메일',
    notify_email: '이메일알림', notify_sheet: '구글시트알림', notify_alimtalk: '알림톡', notify_sms: '문자알림', is_active: '사용여부'
  };
  tbody.innerHTML = res.data.map(h => {
    let desc = '';
    try {
      const d = JSON.parse(h.change_desc);
      if (d.action === 'created') desc = '담당자 등록';
      else if (d.action === 'deleted') desc = '담당자 삭제';
      else desc = Object.keys(d).map(k => {
        const label = fieldLabels[k] || k;
        return `${label}: ${d[k].before} → ${d[k].after}`;
      }).join(', ');
    } catch(e) { desc = h.change_desc || ''; }
    return `<tr>
      <td>${(h.changed_at || '').slice(0, 16)}</td>
      <td>${esc(h.manager_name || '(삭제됨)')}</td>
      <td style="font-size:.8rem;">${esc(desc)}</td>
      <td>${esc(h.changed_by || '')}</td>
    </tr>`;
  }).join('');
}

async function saveComboManagerOrder() {
  const ids = Array.from(document.querySelectorAll('#comboManagerTableBody tr[data-id]')).map(r => r.dataset.id);
  await apiPost('api/combo.php', { action: 'managerReorder', ids: JSON.stringify(ids) });
}

function openComboManagerModal(id) {
  document.getElementById('comboManagerModalTitle').textContent = id ? '담당자 수정' : '담당자 추가';
  document.getElementById('combo_mgr_id').value = id || '';
  ['combo_mgr_name','combo_mgr_dept','combo_mgr_phone','combo_mgr_email'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  ['combo_mgr_notify_email','combo_mgr_notify_sheet','combo_mgr_notify_alimtalk','combo_mgr_notify_sms'].forEach(f => {
    const el = document.getElementById(f); if (el) el.checked = false;
  });
  ['combo_mgr_sheet_id','combo_mgr_sheet_name'].forEach(f => {
    const el = document.getElementById(f); if (el) el.value = '';
  });
  const sheetPanel = document.getElementById('combo_mgr_sheet_panel');
  if (sheetPanel) sheetPanel.style.display = 'none';
  const activeEl = document.querySelector('input[name="combo_mgr_active"][value="1"]');
  if (activeEl) activeEl.checked = true;

  if (id) {
    const m = comboManagerData.find(x => x.id == id);
    if (m) {
      document.getElementById('combo_mgr_name').value               = m.name        || '';
      document.getElementById('combo_mgr_dept').value               = m.department  || '';
      document.getElementById('combo_mgr_phone').value              = m.phone       || '';
      document.getElementById('combo_mgr_email').value              = m.email       || '';
      document.getElementById('combo_mgr_notify_email').checked     = +m.notify_email    === 1;
      document.getElementById('combo_mgr_notify_sheet').checked     = +m.notify_sheet    === 1;
      document.getElementById('combo_mgr_notify_alimtalk').checked  = +m.notify_alimtalk === 1;
      document.getElementById('combo_mgr_notify_sms').checked       = +m.notify_sms      === 1;
      document.getElementById('combo_mgr_sheet_id').value           = m.sheet_id   || '';
      document.getElementById('combo_mgr_sheet_name').value         = m.sheet_name || '';
      if (+m.notify_sheet === 1) {
        const p = document.getElementById('combo_mgr_sheet_panel');
        if (p) p.style.display = '';
      }
      const el = document.querySelector(`input[name="combo_mgr_active"][value="${+m.is_active}"]`);
      if (el) el.checked = true;
    }
  }
  openModal('comboManagerModal');
}

async function saveComboManager() {
  const id        = parseInt(document.getElementById('combo_mgr_id').value) || 0;
  const name      = document.getElementById('combo_mgr_name').value.trim();
  const is_active = (document.querySelector('input[name="combo_mgr_active"]:checked') || {}).value || 1;
  if (!name) { showToast('이름을 입력하세요.', 'error'); return; }

  const data = {
    action:          'managerSave',
    id,
    name,
    department:      document.getElementById('combo_mgr_dept').value.trim(),
    phone:           document.getElementById('combo_mgr_phone').value.trim(),
    email:           document.getElementById('combo_mgr_email').value.trim(),
    notify_email:    document.getElementById('combo_mgr_notify_email').checked    ? 1 : 0,
    notify_sheet:    document.getElementById('combo_mgr_notify_sheet').checked    ? 1 : 0,
    notify_alimtalk: document.getElementById('combo_mgr_notify_alimtalk').checked ? 1 : 0,
    notify_sms:      document.getElementById('combo_mgr_notify_sms').checked      ? 1 : 0,
    sheet_id:        document.getElementById('combo_mgr_sheet_id')?.value.trim()   || '',
    sheet_name:      document.getElementById('combo_mgr_sheet_name')?.value.trim() || '',
    is_active,
  };
  const res = await apiPost('api/combo.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('comboManagerModal');
    loadComboManagerList();
  } else showToast(res.msg || '저장 실패', 'error');
}

async function deleteComboManager(id) {
  if (!confirm('담당자를 삭제하시겠습니까?')) return;
  const res = await apiPost('api/combo.php', { action: 'managerDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadComboManagerList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

// ===========================
// 타임슬롯
// ===========================
let comboSlotData = [];
let comboSlotEditTarget = null;

async function loadComboTimeslotList() {
  const res = await apiGet('api/combo.php', { action: 'slotList' });
  if (res.ok) { comboSlotData = res.data; renderComboTimeslotTable(); }
}

function renderComboTimeslotTable() {
  const tbody = document.getElementById('comboTimeslotTableBody');
  if (!tbody) return;
  if (!comboSlotData.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 시간이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = comboSlotData.map((s, i) => `
    <tr draggable="true" data-id="${s.id}">
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(s.label)}</strong></td>
      <td><span class="status-badge ${+s.is_active ? 'status-사용' : 'status-미사용'}">${+s.is_active ? '사용' : '미사용'}</span></td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openComboSlotModal(${s.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteComboSlot(${s.id})">삭제</button>
      </div></td>
    </tr>
  `).join('');
  initTableDrag(tbody, saveComboSlotOrder);
}

async function saveComboSlotOrder() {
  const ids = Array.from(document.querySelectorAll('#comboTimeslotTableBody tr[data-id]')).map(r => r.dataset.id);
  await apiPost('api/combo.php', { action: 'slotReorder', ids: JSON.stringify(ids) });
}

function openComboSlotModal(id) {
  comboSlotEditTarget = id || null;
  document.getElementById('comboSlotModalTitle').textContent = id ? '시간 수정' : '시간 추가';
  document.getElementById('comboSlotLabel').value    = '';
  document.getElementById('comboSlotActive').checked = true;
  document.getElementById('comboSlotActiveLabel').textContent = '사용';
  if (id) {
    const s = comboSlotData.find(x => x.id == id);
    if (s) {
      document.getElementById('comboSlotLabel').value    = s.label;
      document.getElementById('comboSlotActive').checked = !!+s.is_active;
      document.getElementById('comboSlotActiveLabel').textContent = +s.is_active ? '사용' : '미사용';
    }
  }
  openModal('comboSlotModal');
}

async function saveComboSlot() {
  const label     = document.getElementById('comboSlotLabel').value.trim();
  const is_active = document.getElementById('comboSlotActive').checked ? 1 : 0;
  if (!label) { showToast('시간 레이블을 입력하세요.', 'error'); return; }
  const data = { action: comboSlotEditTarget ? 'slotUpdate' : 'slotCreate', label, is_active };
  if (comboSlotEditTarget) data.id = comboSlotEditTarget;
  const res = await apiPost('api/combo.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('comboSlotModal');
    loadComboTimeslotList();
  } else showToast(res.msg || '저장 실패', 'error');
}

async function deleteComboSlot(id) {
  if (!confirm('시간을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/combo.php', { action: 'slotDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadComboTimeslotList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

// ===========================
// 약관
// ===========================
async function loadComboTerms() {
  const res = await apiGet('api/combo.php', { action: 'termsGet' });
  if (!res.ok) return;
  document.getElementById('comboTermsBody').value      = res.data.term_body  || '';
  document.getElementById('comboTermsUpdatedAt').value = res.data.updated_at || '저장 내역 없음';
}

async function saveComboTerms() {
  const term_body = document.getElementById('comboTermsBody').value.trim();
  const res = await apiPost('api/combo.php', { action: 'termsSave', term_body });
  if (res.ok) { showToast('저장되었습니다.', 'success'); loadComboTerms(); }
  else showToast(res.msg || '저장 실패', 'error');
}
