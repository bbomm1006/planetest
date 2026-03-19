// ===========================
// RESERVE TIME
// ===========================
let reserveTimeData = [];
let reserveTimeEditTarget = null;

async function loadReserveTimeList() {
  const store_id = document.getElementById('reserveTimeStoreFilter')?.value || '';
  const res = await apiGet('api/reserve.php', { action:'timeList', store_id });
  if (res.ok) { reserveTimeData = res.data; renderReserveTimeTable(); }
  // 매장 선택박스 채우기
  loadReserveStoreOptions('reserveTimeStoreFilter');
}

function renderReserveTimeTable() {
  const tbody = document.getElementById('reserveTimeBody');
  if (!tbody) return;
  if (!reserveTimeData.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 예약 시간이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = reserveTimeData.map((t, i) => `
    <tr>
      <td><input type="checkbox" class="row-check" data-id="${t.id}" onchange="updateBulkBar('reserveTimeBulk')"></td>
      <td class="row-num">${i+1}</td>
      <td>${esc(t.store_name||'')} ${esc(t.branch_name||'')}</td>
      <td>${esc(t.description||'—')}</td>
      <td>${t.start_time}</td>
      <td>${t.end_time}</td>
      <td>${(t.items||[]).length}개</td>
      <td><span class="status-badge ${t.is_active?'status-사용':'status-미사용'}" style="cursor:pointer"
            onclick="toggleReserveTime(${t.id},this)">${t.is_active?'사용':'미사용'}</span></td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openReserveTimeModal(${t.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteReserveTime(${t.id})">삭제</button>
      </div></td>
    </tr>`).join('');
}

async function toggleReserveTime(id, el) {
  const res = await apiPost('api/reserve.php', { action:'timeToggle', id });
  if (res.ok) {
    const t = reserveTimeData.find(x=>x.id==id);
    if (t) t.is_active = res.is_active;
    el.className = `status-badge ${res.is_active?'status-사용':'status-미사용'}`;
    el.textContent = res.is_active ? '사용' : '미사용';
  }
}

async function loadReserveStoreOptions(targetId) {
  if (!storeData || !storeData.length) {
    const res = await apiGet('api/store.php', { action:'storeList' });
    if (res.ok) storeData = res.data;
  }
  const sel = document.getElementById(targetId);
  if (!sel) return;
  const cur = sel.value;
  const prefix = targetId === 'reserveTimeStoreFilter' ? '<option value="">전체 매장</option>' : '<option value="">-- 매장 선택 --</option>';
  sel.innerHTML = prefix + (storeData||[]).map(s=>`<option value="${s.id}">${esc(s.store_name)} ${esc(s.branch_name)}</option>`).join('');
  if (cur) sel.value = cur;
}

function openReserveTimeModal(id) {
  reserveTimeEditTarget = id || null;
  document.getElementById('reserveTimeModal').querySelector('.modal-header h3').textContent = id ? '예약 시간 수정' : '예약 시간 추가';
  document.getElementById('rtDescription').value = '';
  document.getElementById('rtIsActive').checked  = true;
  document.getElementById('rtIsActiveLabel').textContent = '사용';
  document.getElementById('reserveItemGroup').innerHTML = '';
  addReserveItem(); // 기본 1행
  loadReserveStoreOptions('rtStoreId');

  if (id) {
    const t = reserveTimeData.find(x=>x.id==id);
    if (t) {
      document.getElementById('rtStoreId').value      = t.store_id;
      document.getElementById('rtDescription').value  = t.description || '';
      document.getElementById('rtStartTime').value    = t.start_time;
      document.getElementById('rtEndTime').value      = t.end_time;
      document.getElementById('rtIsActive').checked   = !!t.is_active;
      document.getElementById('rtIsActiveLabel').textContent = t.is_active ? '사용' : '미사용';
      // 항목 복원
      const group = document.getElementById('reserveItemGroup');
      group.innerHTML = '';
      const items = t.items || [];
      if (items.length > 0) {
        items.forEach(item => addReserveItem(item.name||'', item.desc||'', item.active!==false));
      } else {
        addReserveItem();
      }
    }
  }
  openModal('reserveTimeModal');
}

async function saveReserveTimeModal() {
  const store_id   = document.getElementById('rtStoreId')?.value || '';
  const desc       = document.getElementById('rtDescription').value.trim();
  const start_time = document.getElementById('rtStartTime').value;
  const end_time   = document.getElementById('rtEndTime').value;
  const is_active  = document.getElementById('rtIsActive').checked ? 1 : 0;
  if (!store_id)   { showToast('매장을 선택하세요.', 'error'); return; }
  if (!start_time || !end_time) { showToast('시작·종료 시간을 입력하세요.', 'error'); return; }

  // 항목 수집
  const items = [];
  document.querySelectorAll('#reserveItemGroup .repeat-row').forEach(row => {
    const name   = row.querySelector('input[placeholder="항목명"]')?.value.trim() || '';
    const desc2  = row.querySelector('input[placeholder="설명"]')?.value.trim()   || '';
    const active = row.querySelector('input[type="checkbox"]')?.checked !== false;
    if (name) items.push({ name, desc: desc2, active });
  });

  const data = {
    action: reserveTimeEditTarget ? 'timeUpdate' : 'timeCreate',
    store_id, description:desc, start_time, end_time, is_active,
    items: JSON.stringify(items)
  };
  if (reserveTimeEditTarget) data.id = reserveTimeEditTarget;

  const res = await apiPost('api/reserve.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('reserveTimeModal');
    loadReserveTimeList();
  } else showToast(res.msg||'저장 실패','error');
}

async function deleteReserveTime(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await apiPost('api/reserve.php', { action:'timeDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadReserveTimeList(); }
}

// ===========================
// RESERVE LIST
// ===========================
let reserveListData = [];
let reserveDetailId = null;

async function loadReserveList() {
  loadReserveStoreOptions('reserveStoreFilter');
  const store_id  = document.getElementById('reserveStoreFilter')?.value   || '';
  const status    = document.getElementById('reserveStatusFilter')?.value  || '';
  const date_from = document.getElementById('reserveDateFrom')?.value      || '';
  const date_to   = document.getElementById('reserveDateTo')?.value        || '';
  const kw        = document.getElementById('reserveSearch')?.value        || '';
  const res = await apiGet('api/reserve.php', { action:'list', store_id, status, date_from, date_to, kw });
  if (res.ok) { reserveListData = res.data; renderReserveTable(); }
}

function renderReserveTable() {
  const tbody = document.getElementById('reserveBody');
  if (!tbody) return;
  if (!reserveListData.length) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;color:var(--text-muted);padding:32px;">예약 내역이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = reserveListData.map((r, i) => {
    const statusMap = {pending:'접수',confirmed:'확인',cancelled:'취소',completed:'완료'};
    const st = statusMap[r.status] || r.status;
    const storeLabel = `${esc(r.store_name||'')} ${esc(r.branch_name||'')}`.trim();
    return `
    <tr>
      <td><input type="checkbox" class="row-check" data-id="${r.id}" onchange="updateBulkBar('reserveBulk')"></td>
      <td class="row-num">${i+1}</td>
      <td>RES-${String(r.id).padStart(6,'0')}</td>
      <td>${r.reserve_date}</td>
      <td>${r.start_time ? r.start_time.slice(0,5) : '—'}</td>
      <td>${storeLabel||'—'}</td>
      <td>${esc(r.reserve_item||r.time_desc||'—')}</td>
      <td>${esc(r.name)}</td>
      <td>${esc(r.phone)}</td>
      <td><span class="status-badge status-${st}">${st}</span></td>
      <td>${r.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openReserveDetail(${r.id})">상세</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteReserve(${r.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openReserveDetail(id) {
  reserveDetailId = id;
  const r = reserveListData.find(x=>x.id==id);
  if (!r) return;
  const storeLabel = `${r.store_name||''} ${r.branch_name||''}`.trim();
  document.getElementById('rsvDetailNo').value      = `RES-${String(r.id).padStart(6,'0')}`;
  document.getElementById('rsvDetailStatus').value  = r.status;
  document.getElementById('rsvDetailDate').value    = r.reserve_date;
  document.getElementById('rsvDetailTime').value    = r.start_time ? r.start_time.slice(0,5) : '—';
  document.getElementById('rsvDetailStore').value   = storeLabel;
  document.getElementById('rsvDetailItem').value    = r.reserve_item || r.time_desc || '';
  document.getElementById('rsvDetailName').value    = r.name;
  document.getElementById('rsvDetailPhone').value   = r.phone;
  document.getElementById('rsvDetailEmail').value   = r.email || '';
  document.getElementById('rsvDetailMemo').value    = r.memo || '';
  document.getElementById('rsvDetailAdminMemo').value = r.admin_memo || '';
  openModal('reserveDetailModal');
}

async function saveReserveDetail() {
  if (!reserveDetailId) return;
  const status     = document.getElementById('rsvDetailStatus').value;
  const admin_memo = document.getElementById('rsvDetailAdminMemo').value.trim();
  const res = await apiPost('api/reserve.php', { action:'update', id:reserveDetailId, status, admin_memo });
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('reserveDetailModal');
    loadReserveList();
  } else showToast(res.msg||'저장 실패','error');
}

async function deleteReserve(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await apiPost('api/reserve.php', { action:'delete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadReserveList(); }
}

async function bulkDeleteReserve() {
  const ids = Array.from(document.querySelectorAll('#reserveBody .row-check:checked')).map(cb=>cb.dataset.id);
  if (!ids.length) return;
  if (!confirm(`선택한 ${ids.length}건을 삭제하시겠습니까?`)) return;
  const res = await apiPost('api/reserve.php', { action:'bulkDelete', ids:JSON.stringify(ids) });
  if (res.ok) { showToast(`${ids.length}건 삭제되었습니다.`, 'success'); loadReserveList(); }
}

// addReserveItem은 repeat.js에 있으나 name/desc/active 파라미터 지원을 위해 오버라이드
function addReserveItem(name='', desc='', active=true) {
  const group = document.getElementById('reserveItemGroup');
  if (!group) return;
  const row = document.createElement('div');
  row.className = 'repeat-row';
  row.innerHTML = `
    <span class="drag-handle" draggable="true">⠿</span>
    <input type="text" class="form-control" placeholder="항목명" value="${esc(name)}" style="flex:.3"/>
    <input type="text" class="form-control" placeholder="설명"   value="${esc(desc)}" style="flex:.5"/>
    <div class="toggle-wrap" style="flex-shrink:0;gap:4px;">
      <label class="toggle"><input type="checkbox" ${active?'checked':''}><span class="toggle-slider"></span></label>
      <span style="font-size:.75rem">사용</span>
    </div>
    <button class="btn btn-sm btn-ghost" onclick="removeRepeatRow(this)">🗑</button>`;
  group.appendChild(row);
}

document.addEventListener('change', function(e) {
  if (e.target?.id === 'rtIsActive') {
    const l = document.getElementById('rtIsActiveLabel');
    if (l) l.textContent = e.target.checked ? '사용' : '미사용';
  }
});