// ===========================
// POPUP
// ===========================
let popupData = [];
let popupEditTarget = null;

async function loadPopupList() {
  const res = await apiGet('api/popup.php', { action: 'list' });
  if (res.ok) {
    popupData = res.data;
    renderPopupTable();
  }
}

function renderPopupTable() {
  const tbody = document.getElementById('popupTableBody');
  if (!tbody) return;
  if (!popupData.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 팝업이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = popupData.map((p, i) => `
    <tr draggable="true" data-id="${p.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('popupBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(p.title)}</strong></td>
      <td>${p.link_url
        ? `${esc(p.link_url)} <span class="badge badge-secondary">${p.link_target === '_blank' ? '새창' : '현재창'}</span>`
        : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${p.pc_image ? '<span class="badge badge-success">등록됨</span>' : '<span class="badge badge-secondary">없음</span>'}</td>
      <td>${p.mo_image ? '<span class="badge badge-success">등록됨</span>' : '<span class="badge badge-secondary">없음</span>'}</td>
      <td>
        <span class="status-badge ${p.is_visible ? 'status-사용' : 'status-미사용'}"
              style="cursor:pointer"
              onclick="togglePopupVisible(${p.id}, this)">
          ${p.is_visible ? '노출' : '숨김'}
        </span>
        ${(p.start_dt || p.end_dt) ? `<div style="font-size:.7rem;color:var(--text-muted);margin-top:3px;line-height:1.5;">
          ${p.start_dt ? `<span>시작: ${p.start_dt.replace('T',' ')}</span><br>` : ''}
          ${p.end_dt   ? `<span>종료: ${p.end_dt.replace('T',' ')}</span>` : ''}
        </div>` : ''}
      </td>
      <td>${p.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openPopupModal(${p.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deletePopup(${p.id})">삭제</button>
      </div></td>
    </tr>
  `).join('');
  initTableDrag(tbody, savePopupOrder);
}

async function togglePopupVisible(id, el) {
  const res = await apiPost('api/popup.php', { action: 'toggleVisible', id });
  if (res.ok) {
    const p = popupData.find(x => x.id == id);
    if (p) p.is_visible = res.is_visible;
    el.className = `status-badge ${res.is_visible ? 'status-사용' : 'status-미사용'}`;
    el.textContent = res.is_visible ? '노출' : '숨김';
  }
}

async function savePopupOrder() {
  const rows = document.querySelectorAll('#popupTableBody tr[data-id]');
  const ids = Array.from(rows).map(r => r.dataset.id);
  await apiPost('api/popup.php', { action: 'reorder', ids: JSON.stringify(ids) });
}

function openPopupModal(id) {
  popupEditTarget = id || null;
  const modal = document.getElementById('popupModal');
  const titleEl = modal.querySelector('.modal-header h3');

  // 초기화
  document.getElementById('popupTitle').value         = '';
  document.getElementById('popupVisible').checked     = true;
  document.getElementById('popupVisibleLabel').textContent = '노출';
  document.getElementById('popupLinkUrl').value       = '';
  document.getElementById('popupLinkTarget').value    = '_self';
  document.getElementById('popupStartDt').value       = '';
  document.getElementById('popupEndDt').value         = '';
  document.getElementById('popupPcImageVal').value    = '';
  document.getElementById('popupMoImageVal').value    = '';
  resetUploadArea('popupPcImgArea', '🖥️', '권장: 800×600px');
  resetUploadArea('popupMoImgArea', '📱', '권장: 400×600px');

  if (id) {
    const p = popupData.find(x => x.id == id);
    titleEl.textContent = '팝업 수정';
    document.getElementById('popupTitle').value      = p.title;
    document.getElementById('popupVisible').checked  = !!p.is_visible;
    document.getElementById('popupVisibleLabel').textContent = p.is_visible ? '노출' : '숨김';
    document.getElementById('popupLinkUrl').value    = p.link_url    || '';
    document.getElementById('popupLinkTarget').value = p.link_target || '_self';
    document.getElementById('popupStartDt').value    = p.start_dt    || '';
    document.getElementById('popupEndDt').value      = p.end_dt      || '';
    if (p.pc_image) setUploadPreview('popupPcImgArea', p.pc_image, 'popupPcImageVal');
    if (p.mo_image) setUploadPreview('popupMoImgArea', p.mo_image, 'popupMoImageVal');
  } else {
    titleEl.textContent = '팝업 추가';
  }
  openModal('popupModal');
}

async function savePopupModal() {
  const title = document.getElementById('popupTitle').value.trim();
  if (!title) { showToast('팝업 제목을 입력하세요.', 'error'); return; }

  const data = {
    action:      popupEditTarget ? 'update' : 'create',
    title,
    is_visible:  document.getElementById('popupVisible').checked ? 1 : 0,
    link_url:    document.getElementById('popupLinkUrl').value.trim(),
    link_target: document.getElementById('popupLinkTarget').value,
    start_dt:    document.getElementById('popupStartDt').value || '',
    end_dt:      document.getElementById('popupEndDt').value   || '',
    pc_image:    document.getElementById('popupPcImageVal').value.trim(),
    mo_image:    document.getElementById('popupMoImageVal').value.trim(),
  };
  if (popupEditTarget) data.id = popupEditTarget;

  const res = await apiPost('api/popup.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('popupModal');
    loadPopupList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deletePopup(id) {
  if (!confirm('팝업을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/popup.php', { action: 'delete', id });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    loadPopupList();
  } else {
    showToast(res.msg || '삭제 실패', 'error');
  }
}

function filterPopupTable() {
  const kw      = (document.getElementById('popupSearch')?.value || '').toLowerCase();
  const visible = document.getElementById('popupVisibleFilter')?.value || '';
  document.querySelectorAll('#popupTableBody tr').forEach(tr => {
    const title   = (tr.querySelector('strong')?.textContent || '').toLowerCase();
    const visTxt  = (tr.cells[7]?.textContent || '').trim();
    const ok = (!kw || title.includes(kw)) && (!visible || visTxt === visible);
    tr.style.display = ok ? '' : 'none';
  });
}

// 노출 토글 라벨 동기화
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'popupVisible') {
    const label = document.getElementById('popupVisibleLabel');
    if (label) label.textContent = e.target.checked ? '노출' : '숨김';
  }
});

// 업로드 바인딩은 file_upload.js의 DOMContentLoaded에서 일괄 처리