// ===========================
// INQUIRY CATEGORY
// ===========================
let inquiryCatData = [];
let inquiryCatEditTarget = null;

async function loadInquiryCatList() {
  const res = await apiGet('api/inquiry.php', { action:'catList' });
  if (res.ok) { inquiryCatData = res.data; renderInquiryCatTable(); }
}

function renderInquiryCatTable() {
  const tbody = document.getElementById('inquiryCatBody');
  if (!tbody) return;
  if (!inquiryCatData.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">등록된 분류가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = inquiryCatData.map((c, i) => `
    <tr draggable="true" data-id="${c.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('inquiryCatBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i+1}</td>
      <td><strong>${esc(c.name)}</strong></td>
      <td><span class="status-badge ${c.is_active?'status-사용':'status-미사용'}" style="cursor:pointer"
            onclick="toggleInquiryCat(${c.id},this)">${c.is_active?'사용':'미사용'}</span></td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openInquiryCatModal(${c.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteInquiryCat(${c.id})">삭제</button>
      </div></td>
    </tr>`).join('');
  initTableDrag(tbody, () => {
    const ids = Array.from(tbody.querySelectorAll('tr[data-id]')).map(r=>r.dataset.id);
    apiPost('api/inquiry.php', { action:'catReorder', ids:JSON.stringify(ids) });
  });
}

async function toggleInquiryCat(id, el) {
  const res = await apiPost('api/inquiry.php', { action:'catToggle', id });
  if (res.ok) {
    const c = inquiryCatData.find(x=>x.id==id);
    if (c) c.is_active = res.is_active;
    el.className = `status-badge ${res.is_active?'status-사용':'status-미사용'}`;
    el.textContent = res.is_active ? '사용' : '미사용';
  }
}

function openInquiryCatModal(id) {
  inquiryCatEditTarget = id || null;
  document.getElementById('inquiryCatModal').querySelector('.modal-header h3').textContent = id ? '분류 수정' : '분류 추가';
  document.getElementById('inquiryCatName').value = '';
  document.getElementById('inquiryCatActive').checked = true;
  document.getElementById('inquiryCatActiveLabel').textContent = '사용';
  if (id) {
    const c = inquiryCatData.find(x=>x.id==id);
    if (c) {
      document.getElementById('inquiryCatName').value = c.name;
      document.getElementById('inquiryCatActive').checked = !!c.is_active;
      document.getElementById('inquiryCatActiveLabel').textContent = c.is_active ? '사용' : '미사용';
    }
  }
  openModal('inquiryCatModal');
}

async function saveInquiryCatModal() {
  const name = document.getElementById('inquiryCatName').value.trim();
  if (!name) { showToast('분류명을 입력하세요.', 'error'); return; }
  const data = { action: inquiryCatEditTarget ? 'catUpdate' : 'catCreate', name };
  if (inquiryCatEditTarget) data.id = inquiryCatEditTarget;
  const res = await apiPost('api/inquiry.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('inquiryCatModal');
    loadInquiryCatList();
    loadInquiryCatOptions();
  } else showToast(res.msg||'저장 실패','error');
}

async function deleteInquiryCat(id) {
  if (!confirm('분류를 삭제하시겠습니까?')) return;
  const res = await apiPost('api/inquiry.php', { action:'catDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadInquiryCatList(); }
}

// ===========================
// INQUIRY LIST
// ===========================
let inquiryListData = [];
let inquiryDetailId = null;

async function loadInquiryCatOptions() {
  const res = await apiGet('api/inquiry.php', { action:'catList' });
  if (!res.ok) return;
  const sel = document.getElementById('inquiryCatFilter');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">전체 분류</option>' +
    res.data.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  sel.value = cur;
}

async function loadInquiryList() {
  await loadInquiryCatOptions();
  const cat_id    = document.getElementById('inquiryCatFilter')?.value || '';
  const status    = document.getElementById('inquiryStatusFilter')?.value || '';
  const is_public = document.getElementById('inquiryPublicFilter')?.value ?? '';
  const kw        = document.getElementById('inquirySearch')?.value || '';
  const res = await apiGet('api/inquiry.php', { action:'list', cat_id, status, is_public, kw });
  if (res.ok) { inquiryListData = res.data; renderInquiryTable(); }
}

function renderInquiryTable() {
  const tbody = document.getElementById('inquiryBody');
  if (!tbody) return;
  if (!inquiryListData.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:32px;">문의 내역이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = inquiryListData.map((q, i) => `
    <tr>
      <td><input type="checkbox" class="row-check" data-id="${q.id}" onchange="updateBulkBar('inquiryBulk')"></td>
      <td class="row-num">${i+1}</td>
      <td>${q.cat_name?`<span class="badge badge-secondary">${esc(q.cat_name)}</span>`:'—'}</td>
      <td>${esc(q.name)}</td>
      <td>${esc(q.phone||'—')}</td>
      <td>${esc(q.email||'—')}</td>
      <td><span class="status-badge status-${q.status==='pending'?'접수':q.status==='confirmed'?'확인':q.status==='cancelled'?'취소':'완료'}"
        >${q.status==='pending'?'접수':q.status==='confirmed'?'확인':q.status==='cancelled'?'취소':'완료'}</span></td>
      <td>${q.is_public?'<span class="badge badge-secondary">공개</span>':'<span class="badge">비밀</span>'}</td>
      <td>${q.answer_cnt>0?'<span class="badge badge-success">답변완료</span>':'<span class="badge badge-secondary">미답변</span>'}</td>
      <td>${q.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openInquiryDetail(${q.id})">상세/답변</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteInquiry(${q.id})">삭제</button>
      </div></td>
    </tr>`).join('');
}

async function openInquiryDetail(id) {
  const res = await apiGet('api/inquiry.php', { action:'get', id });
  if (!res.ok) { showToast(res.msg||'로드 실패','error'); return; }
  const q = res.data;
  inquiryDetailId = id;
  document.getElementById('inqDetailCat').value     = q.cat_name || '—';
  document.getElementById('inqDetailStatus').value  = q.status;
  document.getElementById('inqDetailName').value    = q.name;
  document.getElementById('inqDetailPhone').value   = q.phone || '';
  document.getElementById('inqDetailEmail').value   = q.email || '';
  document.getElementById('inqDetailContent').value = q.content;
  document.getElementById('inqDetailPublic').value  = q.is_public;
  // 답변
  const answers = q.answers || [];
  const answerArea = document.getElementById('inqAnswerArea');
  if (answerArea) {
    if (answers.length > 0) {
      const a = answers[0];
      document.getElementById('inqAnswerId').value      = a.id;
      document.getElementById('inqAnswerContent').value = a.content;
      document.getElementById('inqAnswerDate').value    = a.created_at;
    } else {
      document.getElementById('inqAnswerId').value      = '';
      document.getElementById('inqAnswerContent').value = '';
      document.getElementById('inqAnswerDate').value    = '';
    }
  }
  openModal('inquiryDetailModal');
}

async function saveInquiryDetail() {
  if (!inquiryDetailId) return;
  const status    = document.getElementById('inqDetailStatus').value;
  const is_public = document.getElementById('inqDetailPublic').value;
  const content   = document.getElementById('inqAnswerContent').value.trim();
  const answer_id = document.getElementById('inqAnswerId').value;

  // 상태/공개 저장
  await apiPost('api/inquiry.php', { action:'update', id:inquiryDetailId, status, is_public });

  // 답변 저장 (내용 있을 때만)
  if (content) {
    const res = await apiPost('api/inquiry.php', {
      action:'answerSave', inquiry_id:inquiryDetailId,
      answer_id: answer_id||0, content
    });
    if (!res.ok) { showToast(res.msg||'답변 저장 실패','error'); return; }
  }
  showToast('저장되었습니다.', 'success');
  closeModal('inquiryDetailModal');
  loadInquiryList();
}

async function deleteInquiry(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await apiPost('api/inquiry.php', { action:'delete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadInquiryList(); }
}

async function bulkDeleteInquiry() {
  const ids = Array.from(document.querySelectorAll('#inquiryBody .row-check:checked')).map(cb=>cb.dataset.id);
  if (!ids.length) return;
  if (!confirm(`선택한 ${ids.length}건을 삭제하시겠습니까?`)) return;
  const res = await apiPost('api/inquiry.php', { action:'bulkDelete', ids:JSON.stringify(ids) });
  if (res.ok) { showToast(`${ids.length}건 삭제되었습니다.`, 'success'); loadInquiryList(); }
}

document.addEventListener('change', function(e) {
  if (e.target?.id === 'inquiryCatActive') {
    const l = document.getElementById('inquiryCatActiveLabel');
    if (l) l.textContent = e.target.checked ? '사용' : '미사용';
  }
});