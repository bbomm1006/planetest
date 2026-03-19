

// ===========================
// CONSULT LIST
// ===========================
let consultListData = [];
let consultDetailId = null;

async function loadConsultCatOptions() {
  const res = await apiGet('api/consult.php', { action:'catList' });
  if (!res.ok) return;
  const sel = document.getElementById('consultCatFilter');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">전체 분류</option>' +
    res.data.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  sel.value = cur;
}

async function loadConsultList() {
  await loadConsultCatOptions();
  const cat_id = document.getElementById('consultCatFilter')?.value || '';
  const status = document.getElementById('consultStatusFilter')?.value || '';
  const kw     = document.getElementById('consultSearch')?.value || '';
  const res = await apiGet('api/consult.php', { action:'list', cat_id, status, kw });
  if (res.ok) { consultListData = res.data; renderConsultTable(); }
}

function renderConsultTable() {
  const tbody = document.getElementById('consultBody');
  if (!tbody) return;
  if (!consultListData.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">상담 내역이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = consultListData.map((c, i) => {
    const statusLabel = c.status==='pending'?'접수':c.status==='confirmed'?'확인':c.status==='cancelled'?'취소':'완료';
    return `
    <tr>
      <td><input type="checkbox" class="row-check" data-id="${c.id}" onchange="updateBulkBar('consultBulk')"></td>
      <td class="row-num">${i+1}</td>
      <td>${esc(c.name)}</td>
      <td>${esc(c.phone)}</td>
      <td><span class="status-badge status-${statusLabel}">${statusLabel}</span></td>
      <td>${c.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openConsultDetail(${c.id})">상세</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteConsult(${c.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openConsultDetail(id) {
  consultDetailId = id;
  const c = consultListData.find(x=>x.id==id);
  if (!c) return;
  document.getElementById('consultDetailStatus').value    = c.status;
  document.getElementById('consultDetailCreatedAt').value = c.created_at || '';
  document.getElementById('consultDetailName').value      = c.name;
  document.getElementById('consultDetailPhone').value     = c.phone;
  document.getElementById('consultDetailCat').value       = c.cat_name || '—';
  document.getElementById('consultDetailProduct').value   = c.product || '';


  document.getElementById('consultDetailMemo').value      = c.admin_memo || '';

  // 추가필드
  const extraWrap = document.getElementById('consultDetailExtraFields');
  if (extraWrap) {
    try {
      const extras = JSON.parse(c.extra_fields || '[]');
      const filtered = extras.filter(function(f){ return f.value; });
      extraWrap.innerHTML = filtered.length ? filtered.map(function(f) {
        return `<div class="form-group" style="margin-bottom:12px;">
          <label>${esc(f.field_name)}</label>
          <input type="text" class="form-control" value="${esc(f.value)}" readonly>
        </div>`;
      }).join('') : '';
    } catch(e) { extraWrap.innerHTML = ''; }
  }

  openModal('consultDetailModal');
}

async function saveConsultDetail() {
  if (!consultDetailId) return;
  const status = document.getElementById('consultDetailStatus').value;
  const memo   = document.getElementById('consultDetailMemo').value.trim();
  const res = await apiPost('api/consult.php', { action:'update', id:consultDetailId, status, admin_memo:memo });
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('consultDetailModal');
    loadConsultList();
  } else showToast(res.msg||'저장 실패','error');
}

async function deleteConsult(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await apiPost('api/consult.php', { action:'delete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadConsultList(); }
}

async function bulkDeleteConsult() {
  const ids = Array.from(document.querySelectorAll('#consultBody .row-check:checked')).map(cb=>cb.dataset.id);
  if (!ids.length) return;
  if (!confirm(`선택한 ${ids.length}건을 삭제하시겠습니까?`)) return;
  const res = await apiPost('api/consult.php', { action:'bulkDelete', ids:JSON.stringify(ids) });
  if (res.ok) { showToast(`${ids.length}건 삭제되었습니다.`, 'success'); loadConsultList(); }
}

// toggle label
document.addEventListener('change', function(e) {
  if (e.target?.id === 'consultCatActive') {
    const l = document.getElementById('consultCatActiveLabel');
    if (l) l.textContent = e.target.checked ? '사용' : '미사용';
  }
});