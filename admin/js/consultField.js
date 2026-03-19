async function loadConsultConfig() {
  const res = await apiGet('api/consult_config.php', { action: 'getConfig' });
  if (!res.ok) return;
  const d = res.data;
  document.getElementById('cfTitle').value    = d.title        || '';
  document.getElementById('cfDesc').value     = d.description  || '';
  document.getElementById('cfDesc2').value    = d.description2 || '';
 
  document.getElementById('cfUseProduct').checked = !!+d.use_product;

  await loadConsultFieldList();
}

async function saveConsultConfig() {
  const fd = new FormData();
  fd.append('action',      'saveConfig');
  fd.append('title',       document.getElementById('cfTitle').value.trim());
  fd.append('description', document.getElementById('cfDesc').value.trim());
  fd.append('description2',document.getElementById('cfDesc2').value.trim());
  
  if (document.getElementById('cfUseProduct').checked) fd.append('use_product',  '1');

  const res = await fetch('api/consult_config.php', { method: 'POST', body: fd });
  const json = await res.json();
  if (json.ok) showToast('저장되었습니다.', 'success');
  else         showToast(json.msg || '저장 실패', 'error');
}

async function loadConsultFieldList() {
  const res = await apiGet('api/consult_config.php', { action: 'fieldList' });
  if (!res.ok) return;
  const tbody = document.getElementById('consultFieldTableBody');
  if (!tbody) return;

  const typeLabel = { input:'Input', textarea:'Textarea', select:'Select', radio:'Radio', check:'Check' };

  tbody.innerHTML = res.data.map((f, i) => {
    const preview = ['input','textarea'].includes(f.field_type)
  ? `<input type="text" class="form-control" value="${esc(f.placeholder)}" placeholder="placeholder"
       style="max-width:220px;" onchange="updateConsultField(${f.id}, this.value, '')">`
  : f.options.split('\n').filter(o=>o.trim()).map(o =>
      `<span class="badge badge-secondary">${esc(o.trim())}</span>`
    ).join(' ') + `<button class="btn btn-sm btn-outline" style="margin-left:8px;" onclick="openConsultFieldOptionModal(${f.id}, \`${esc(f.options)}\`)">수정</button>`;

    return `<tr draggable="true" data-id="${f.id}">
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td>${esc(f.field_name)}</td>
      <td><span class="badge">${typeLabel[f.field_type] || f.field_type}</span></td>
      <td>${preview}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${+f.is_active ? 'checked' : ''} onchange="toggleConsultField(${f.id}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
    </tr>`;
  }).join('');

  // 드래그 순서 저장 콜백 등록
  if (typeof initTableDrag === 'function') {
    initTableDrag(tbody, async (orderedIds) => {
      await apiPost('api/consult_config.php', {
        action: 'fieldReorder', ids: JSON.stringify(orderedIds)
      });
    });
  }

}

async function toggleConsultField(id, checked) {
  await apiPost('api/consult_config.php', { action: 'fieldToggle', id, is_active: checked ? 1 : 0 });
}

function openConsultFieldModal() {
  document.getElementById('cfFieldName').value   = '';
  document.getElementById('cfFieldType').value   = 'input';
  document.getElementById('cfPlaceholder').value = '';
  document.getElementById('cfNewOptionList').innerHTML = '';  
  onConsultFieldTypeChange();
  openModal('consultFieldModal');
}
function onConsultFieldTypeChange() {
  const type = document.getElementById('cfFieldType').value;
  const isText = ['input','textarea'].includes(type);
  document.getElementById('cfPlaceholderWrap').style.display = isText  ? '' : 'none';
  document.getElementById('cfOptionsWrap').style.display     = !isText ? '' : 'none';
  if (!isText) {
    const list = document.getElementById('cfNewOptionList');
    if (!list.children.length) addNewConsultFieldOption();
  }
}

function addNewConsultFieldOption() {
  const list = document.getElementById('cfNewOptionList');
  const row = document.createElement('div');
  row.draggable = true;
  row.style.cssText = 'display:flex;gap:6px;align-items:center;';
  row.innerHTML = `
    <span class="sort-handle" style="cursor:grab;">⠿</span>
    <input type="text" class="form-control" placeholder="항목명" style="flex:1;">
    <button class="btn btn-sm btn-danger" onclick="this.closest('div').remove()">✕</button>
  `;
  list.appendChild(row);
  initOptionDrag(list);
}

async function saveConsultField() {
  const name = document.getElementById('cfFieldName').value.trim();
  const type = document.getElementById('cfFieldType').value;
  if (!name) { showToast('필드명을 입력하세요.', 'error'); return; }

  const isText = ['input','textarea'].includes(type);
  const ph      = isText  ? document.getElementById('cfPlaceholder').value.trim() : '';
  const options = !isText
  ? [...document.querySelectorAll('#cfNewOptionList input')]
      .map(i => i.value.trim()).filter(Boolean).join('\n')
  : '';

  const res = await apiPost('api/consult_config.php', {
    action: 'fieldCreate', field_name: name, field_type: type, placeholder: ph, options
  });
  if (res.ok) {
    showToast('추가되었습니다.', 'success');
    closeModal('consultFieldModal');
    loadConsultFieldList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function updateConsultField(id, placeholder, options) {
  const res = await apiPost('api/consult_config.php', {
    action: 'fieldUpdate', id, placeholder, options
  });
  if (!res.ok) showToast('저장 실패', 'error');
  else showToast('저장되었습니다.', 'success');
}

function openConsultFieldOptionModal(id, options) {
  document.getElementById('cfOptionFieldId').value = id;
  const list = document.getElementById('cfOptionList');
  const items = options ? options.split('\n').filter(o => o.trim()) : [];
  list.innerHTML = '';
  if (items.length === 0) items.push('');
  items.forEach(val => addConsultFieldOption(val));
  openModal('consultFieldOptionModal');
}

function addConsultFieldOption(val = '') {
  const list = document.getElementById('cfOptionList');
  const row = document.createElement('div');
  row.draggable = true;
  row.style.cssText = 'display:flex;gap:6px;align-items:center;';
  row.innerHTML = `
    <span class="sort-handle" style="cursor:grab;">⠿</span>
    <input type="text" class="form-control" value="${esc(val)}" placeholder="항목명" style="flex:1;">
    <button class="btn btn-sm btn-danger" onclick="this.closest('div').remove()">✕</button>
  `;
  list.appendChild(row);
  initOptionDrag(list);
}

async function saveConsultFieldOptions() {
  const id = document.getElementById('cfOptionFieldId').value;
  const options = [...document.querySelectorAll('#cfOptionList input')]
    .map(i => i.value.trim()).filter(Boolean).join('\n');
  const res = await apiPost('api/consult_config.php', {
    action: 'fieldUpdate', id, placeholder: '', options
  });
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('consultFieldOptionModal');
    loadConsultFieldList();
  } else {
    showToast('저장 실패', 'error');
  }
}

function initOptionDrag(list) {
  let dragEl = null;
  list.querySelectorAll('div[draggable]').forEach(row => {
    row.ondragstart = () => { dragEl = row; row.style.opacity = '.4'; };
    row.ondragend   = () => { row.style.opacity = '1'; dragEl = null; };
    row.ondragover  = e => { e.preventDefault(); row.style.borderTop = '2px solid var(--primary)'; };
    row.ondragleave = () => { row.style.borderTop = ''; };
    row.ondrop      = e => {
      e.preventDefault();
      row.style.borderTop = '';
      if (dragEl && dragEl !== row) list.insertBefore(dragEl, row);
    };
  });
}