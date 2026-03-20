let legalSelectedCategoryId = 0;
let legalCatList = [];

async function loadLegalTermsAdmin() {
  const res = await apiGet('api/legal_terms.php', { action: 'cat_list' });
  if (!res.ok) {
    showToast(res.msg || '목록을 불러오지 못했습니다.', 'error');
    return;
  }
  legalCatList = res.data || [];
  renderLegalCatTable();
  if (legalSelectedCategoryId) {
    const exists = legalCatList.some(c => String(c.id) === String(legalSelectedCategoryId));
    if (!exists) legalSelectedCategoryId = 0;
  }
  if (!legalSelectedCategoryId && legalCatList.length) {
    legalSelectedCategoryId = legalCatList[0].id;
  }
  await loadLegalVerList();
}

function renderLegalCatTable() {
  const tbody = document.getElementById('legalCatTableBody');
  if (!tbody) return;
  tbody.innerHTML = legalCatList.map((c, i) => {
    const active = String(c.id) === String(legalSelectedCategoryId);
    const footChecked = Number(c.is_active) === 1 ? 'checked' : '';
    return `<tr data-id="${c.id}" class="${active ? 'is-selected' : ''}" style="cursor:pointer" onclick="legalSelectCategory(${c.id})">
      <td>${i + 1}</td>
      <td>${esc(c.name)}</td>
      <td><code>${esc(c.slug)}</code></td>
      <td class="legal-table-toggle-cell" onclick="event.stopPropagation()">
        <div class="toggle-wrap">
          <label class="toggle" title="풋터·약관 페이지 노출">
            <input type="checkbox" class="legal-cat-vis-input" data-id="${c.id}" ${footChecked} aria-label="카테고리 노출">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </td>
      <td>${c.sort_order}</td>
      <td>${c.ver_count}</td>
      <td><div class="table-actions">
        <button type="button" class="btn btn-sm btn-outline" onclick="event.stopPropagation();openLegalCatModal(${c.id})">수정</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteLegalCat(${c.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

async function saveLegalCatVisibility() {
  const inputs = document.querySelectorAll('.legal-cat-vis-input');
  const items = [];
  inputs.forEach((el) => {
    const id = parseInt(el.getAttribute('data-id'), 10);
    if (id > 0) items.push({ id, is_active: el.checked ? 1 : 0 });
  });
  if (!items.length) {
    showToast('저장할 카테고리가 없습니다.', 'warning');
    return;
  }
  const res = await apiPost('api/legal_terms.php', {
    action: 'cat_visibility_save',
    items: JSON.stringify(items),
  });
  if (res.ok) {
    showToast('카테고리 노출이 저장되었습니다.', 'success');
    await loadLegalTermsAdmin();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

function legalSelectCategory(id) {
  legalSelectedCategoryId = id;
  renderLegalCatTable();
  loadLegalVerList();
}

async function loadLegalVerList() {
  const title = document.getElementById('legalVerPanelTitle');
  const addBtn = document.getElementById('legalVerAddBtn');
  const visSaveBtn = document.getElementById('legalVerVisSaveBtn');
  const tbody = document.getElementById('legalVerTableBody');
  if (!tbody) return;

  if (!legalSelectedCategoryId) {
    if (title) title.textContent = '버전 목록 — 카테고리를 선택하세요';
    if (addBtn) addBtn.style.display = 'none';
    if (visSaveBtn) visSaveBtn.style.display = 'none';
    tbody.innerHTML = '';
    return;
  }

  const cat = legalCatList.find(c => String(c.id) === String(legalSelectedCategoryId));
  if (title) title.textContent = '버전 목록 — ' + (cat ? cat.name : '');

  if (addBtn) {
    addBtn.style.display = '';
    addBtn.setAttribute('onclick', 'openLegalVerModal(0)');
  }
  if (visSaveBtn) visSaveBtn.style.display = '';

  const res = await apiGet('api/legal_terms.php', { action: 'ver_list', category_id: legalSelectedCategoryId });
  if (!res.ok) {
    tbody.innerHTML = '<tr><td colspan="6">불러오기 실패</td></tr>';
    return;
  }
  const rows = res.data || [];
  tbody.innerHTML = rows.map((v, i) => {
    const eff = v.effective_date || '—';
    const use = Number(v.is_active) === 1 ? '예' : '아니오';
    const visChecked = Number(v.is_visible) !== 0 ? 'checked' : '';
    return `<tr>
      <td>${i + 1}</td>
      <td>${esc(v.version_label)}</td>
      <td>${esc(eff)}</td>
      <td>${use}</td>
      <td class="legal-table-toggle-cell" onclick="event.stopPropagation()">
        <div class="toggle-wrap">
          <label class="toggle" title="약관 페이지·API 목록 노출">
            <input type="checkbox" class="legal-ver-vis-input" data-id="${v.id}" ${visChecked} aria-label="버전 프론트 노출">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </td>
      <td><div class="table-actions">
        <button type="button" class="btn btn-sm btn-outline" onclick="openLegalVerModal(${v.id})">수정</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="deleteLegalVer(${v.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

async function saveLegalVerVisibility() {
  if (!legalSelectedCategoryId) {
    showToast('카테고리를 선택하세요.', 'warning');
    return;
  }
  const inputs = document.querySelectorAll('.legal-ver-vis-input');
  const items = [];
  inputs.forEach((el) => {
    const id = parseInt(el.getAttribute('data-id'), 10);
    if (id > 0) items.push({ id, is_visible: el.checked ? 1 : 0 });
  });
  if (!items.length) {
    showToast('저장할 버전이 없습니다.', 'warning');
    return;
  }
  const res = await apiPost('api/legal_terms.php', {
    action: 'ver_visibility_save',
    category_id: String(legalSelectedCategoryId),
    items: JSON.stringify(items),
  });
  if (res.ok) {
    showToast('버전 노출이 저장되었습니다.', 'success');
    await loadLegalVerList();
    await loadLegalTermsAdmin();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

function openLegalCatModal(id) {
  document.getElementById('legalCatId').value = id || '';
  document.getElementById('legalTermCatModalTitle').textContent = id ? '카테고리 수정' : '카테고리 추가';
  if (id) {
    const c = legalCatList.find(x => String(x.id) === String(id));
    if (c) {
      document.getElementById('legalCatName').value = c.name || '';
      document.getElementById('legalCatSlug').value = c.slug || '';
      document.getElementById('legalCatSort').value = c.sort_order ?? 0;
      document.getElementById('legalCatFooter').checked = Number(c.is_active) === 1;
    }
  } else {
    document.getElementById('legalCatName').value = '';
    document.getElementById('legalCatSlug').value = '';
    document.getElementById('legalCatSort').value = '0';
    document.getElementById('legalCatFooter').checked = true;
  }
  openModal('legalTermCatModal');
}

async function saveLegalCatModal() {
  const id = document.getElementById('legalCatId').value;
  const fd = {
    action: 'cat_save',
    id: id || '0',
    name: document.getElementById('legalCatName').value.trim(),
    slug: document.getElementById('legalCatSlug').value.trim(),
    sort_order: document.getElementById('legalCatSort').value || '0',
    is_active: document.getElementById('legalCatFooter').checked ? '1' : '0',
  };
  const res = await apiPost('api/legal_terms.php', fd);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('legalTermCatModal');
    await loadLegalTermsAdmin();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteLegalCat(id) {
  if (!confirm('카테고리와 모든 버전이 삭제됩니다. 계속할까요?')) return;
  const res = await apiPost('api/legal_terms.php', { action: 'cat_delete', id: String(id) });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    if (String(legalSelectedCategoryId) === String(id)) legalSelectedCategoryId = 0;
    await loadLegalTermsAdmin();
  } else {
    showToast(res.msg || '삭제 실패', 'error');
  }
}

async function openLegalVerModal(versionId) {
  if (!legalSelectedCategoryId) {
    showToast('먼저 카테고리를 선택하세요.', 'warning');
    return;
  }
  document.getElementById('legalVerCategoryId').value = legalSelectedCategoryId;
  document.getElementById('legalVerId').value = versionId || '';
  document.getElementById('legalTermVerModalTitle').textContent = versionId ? '버전 수정' : '버전 추가';

  if (versionId) {
    const res = await apiGet('api/legal_terms.php', { action: 'ver_list', category_id: legalSelectedCategoryId });
    if (!res.ok) return;
    const v = (res.data || []).find(x => String(x.id) === String(versionId));
    if (v) {
      document.getElementById('legalVerLabel').value = v.version_label || '';
      document.getElementById('legalVerBody').value = v.body || '';
      document.getElementById('legalVerEffective').value = (v.effective_date && v.effective_date !== '0000-00-00')
        ? String(v.effective_date).slice(0, 10)
        : '';
      document.getElementById('legalVerActive').checked = Number(v.is_active) === 1;
      document.getElementById('legalVerVisible').checked = Number(v.is_visible) !== 0;
    }
  } else {
    document.getElementById('legalVerLabel').value = '';
    document.getElementById('legalVerBody').value = '';
    document.getElementById('legalVerEffective').value = '';
    document.getElementById('legalVerActive').checked = false;
    document.getElementById('legalVerVisible').checked = true;
  }
  openModal('legalTermVerModal');
}

async function saveLegalVerModal() {
  const fd = {
    action: 'ver_save',
    id: document.getElementById('legalVerId').value || '0',
    category_id: document.getElementById('legalVerCategoryId').value,
    version_label: document.getElementById('legalVerLabel').value.trim(),
    body: document.getElementById('legalVerBody').value,
    effective_date: document.getElementById('legalVerEffective').value || '',
    is_active: document.getElementById('legalVerActive').checked ? '1' : '0',
    is_visible: document.getElementById('legalVerVisible').checked ? '1' : '0',
    sort_order: '0',
  };
  if (!fd.version_label) {
    showToast('버전명을 입력하세요.', 'error');
    return;
  }
  const res = await apiPost('api/legal_terms.php', fd);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('legalTermVerModal');
    await loadLegalTermsAdmin();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteLegalVer(id) {
  if (!confirm('이 버전을 삭제할까요?')) return;
  const res = await apiPost('api/legal_terms.php', { action: 'ver_delete', id: String(id) });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    await loadLegalVerList();
    await loadLegalTermsAdmin();
  } else {
    showToast(res.msg || '삭제 실패', 'error');
  }
}
