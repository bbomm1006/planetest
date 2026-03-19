/* =====================================================
   홈페이지 정보 관리  –  homepageInfo.js
===================================================== */

const HI_SNS_TYPES = [
  { value: 'instagram', label: '인스타그램' },
  { value: 'kakao',     label: '카카오'     },
  { value: 'youtube',   label: '유튜브'     },
  { value: 'facebook',  label: '페이스북'   },
  { value: 'x',         label: 'X (트위터)' },
];

let hiSnsData = [];

// ── 페이지 진입 시 데이터 로드 ──────────────────────────
function hiLoad() {
  fetch('api/homepageInfo.php?action=get')
    .then(r => r.json())
    .then(res => {
      if (!res.ok) return;
      const d = res.data;
      if (!d) return;

      document.getElementById('hi_title').value       = d.title       || '';
      document.getElementById('hi_description').value = d.description || '';
      document.getElementById('hi_footer_copy').value = d.footer_copy || '';
      document.getElementById('hi_copyright').value   = d.copyright   || '';
      document.getElementById('hi_phone').value       = d.phone       || '';
      document.getElementById('hi_hours1').value      = d.hours1      || '';
      document.getElementById('hi_hours2').value      = d.hours2      || '';
      document.getElementById('hi_address').value     = d.address     || '';

      // 저장된 이미지 미리보기
      hiSetSavedPreview('hi_og_preview',          'hi_og_name',          d.og_image);
      hiSetSavedPreview('hi_favicon_preview',     'hi_favicon_name',     d.favicon);   
      hiSetSavedPreview('hi_header_logo_preview', 'hi_header_logo_name', d.header_logo);
      hiSetSavedPreview('hi_footer_logo_preview', 'hi_footer_logo_name', d.footer_logo);

      // SNS
      hiSnsData = Array.isArray(d.sns) ? d.sns : [];
      hiRenderSns();
    });
}

// 서버에 저장된 이미지 미리보기
function hiSetSavedPreview(imgId, nameId, src) {
  const img  = document.getElementById(imgId);
  const name = document.getElementById(nameId);
  if (!img) return;
  if (src) {
    img.src = src;
    img.style.display = '';
    if (name) name.textContent = src.split('/').pop();
  } else {
    img.style.display = 'none';
    if (name) name.textContent = '선택된 파일 없음';
  }
}

// 파일 선택 시 미리보기
function hiPreview(input, previewId, nameId) {
  const file = input.files[0];
  const name = document.getElementById(nameId);
  if (name) name.textContent = file ? file.name : '선택된 파일 없음';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.style.display = ''; }
  };
  reader.readAsDataURL(file);
}

// ── SNS 렌더링 ──────────────────────────────────────────
function hiRenderSns() {
  const wrap = document.getElementById('hiSnsList');
  if (!wrap) return;

  if (!hiSnsData.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text3);font-size:.84rem;">SNS 링크를 추가하세요.</div>';
    return;
  }

  hiSnsData.sort((a, b) => (a.sort || 0) - (b.sort || 0));

  wrap.innerHTML = '<div class="repeat-group">' + hiSnsData.map((item, idx) => `
    <div class="repeat-row" draggable="true" data-idx="${idx}">
      <span class="drag-handle" title="드래그하여 순서 변경">⠿</span>
      <select class="form-control" style="width:130px;flex-shrink:0;"
        onchange="hiSnsChange(${idx},'type',this.value)">
        ${HI_SNS_TYPES.map(t =>
          `<option value="${t.value}"${item.type === t.value ? ' selected' : ''}>${t.label}</option>`
        ).join('')}
      </select>
      <input type="text" class="form-control" placeholder="https://"
        value="${(item.url || '').replace(/"/g, '&quot;')}"
        oninput="hiSnsChange(${idx},'url',this.value)">
      <button type="button" class="btn btn-sm btn-danger" onclick="hiRemoveSns(${idx})">삭제</button>
    </div>
  `).join('') + '</div>';

  hiInitSnsDrag();
}

function hiSnsChange(idx, key, val) {
  if (hiSnsData[idx]) hiSnsData[idx][key] = val;
}

function hiAddSns() {
  const maxSort = hiSnsData.length ? Math.max(...hiSnsData.map(s => s.sort || 0)) : 0;
  hiSnsData.push({ type: 'instagram', url: '', sort: maxSort + 1 });
  hiRenderSns();
  // 마지막 input에 포커스
  const rows = document.querySelectorAll('#hiSnsList .repeat-row');
  if (rows.length) {
    const lastInput = rows[rows.length - 1].querySelector('input[type="text"]');
    if (lastInput) lastInput.focus();
  }
}

function hiRemoveSns(idx) {
  hiSnsData.splice(idx, 1);
  hiSnsData.forEach((s, i) => { s.sort = i + 1; });
  hiRenderSns();
}

// ── 드래그 정렬 ────────────────────────────────────────
function hiInitSnsDrag() {
  const wrap = document.querySelector('#hiSnsList .repeat-group');
  if (!wrap) return;
  let dragging = null;

  wrap.querySelectorAll('.repeat-row').forEach(row => {
    row.addEventListener('dragstart', e => {
      dragging = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      dragging = null;
      row.classList.remove('dragging');
      hiSyncSnsSort();
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragging || dragging === row) return;
      const mid = row.getBoundingClientRect().top + row.offsetHeight / 2;
      wrap.insertBefore(dragging, e.clientY < mid ? row : row.nextSibling);
    });
  });
}

function hiSyncSnsSort() {
  document.querySelectorAll('#hiSnsList .repeat-row').forEach((row, i) => {
    const idx = parseInt(row.dataset.idx);
    if (!isNaN(idx) && hiSnsData[idx]) hiSnsData[idx].sort = i + 1;
  });
}

// ── 저장 ───────────────────────────────────────────────
function hiSave() {
  const fd = new FormData();

  fd.append('action',      'save');
  fd.append('title',       document.getElementById('hi_title')?.value       || '');
  fd.append('description', document.getElementById('hi_description')?.value || '');
  fd.append('footer_copy', document.getElementById('hi_footer_copy')?.value || '');
  fd.append('copyright',   document.getElementById('hi_copyright')?.value   || '');
  fd.append('phone',       document.getElementById('hi_phone')?.value       || '');
  fd.append('hours1',      document.getElementById('hi_hours1')?.value      || '');
  fd.append('hours2',      document.getElementById('hi_hours2')?.value      || '');
  fd.append('address',     document.getElementById('hi_address')?.value     || '');
  fd.append('sns',         JSON.stringify(hiSnsData));

  // 이미지 파일 첨부
  const ogFile      = document.getElementById('hi_og_file');
  const faviconFile = document.getElementById('hi_favicon_file');  
  const headerFile  = document.getElementById('hi_header_logo_file');
  const footerFile  = document.getElementById('hi_footer_logo_file');
  if (ogFile?.files[0])      fd.append('og_image',    ogFile.files[0]);
  if (faviconFile?.files[0]) fd.append('favicon',     faviconFile.files[0]); 
  if (headerFile?.files[0])  fd.append('header_logo', headerFile.files[0]);
  if (footerFile?.files[0])  fd.append('footer_logo', footerFile.files[0]);

  fetch('api/homepageInfo.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(res => {
      if (res.ok) showToast('저장되었습니다.', 'success');
      else        showToast(res.msg || '저장 실패', 'error');
    })
    .catch(() => showToast('서버 오류가 발생했습니다.', 'error'));
}