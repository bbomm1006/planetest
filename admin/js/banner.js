// ===========================
// BANNER
// ===========================
let bannerEditTarget = null;

async function loadBannerList() {
  const res = await apiGet('api/banner.php', { action: 'list' });
  if (res.ok) {
    bannerData = res.data;
    renderBannerTable();
  }
}

function renderBannerTable() {
  const tbody = document.getElementById('bannerTableBody');
  if (!tbody) return;
  if (!bannerData.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 배너가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = bannerData.map((b, i) => `
    <tr draggable="true" data-id="${b.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('bannerBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(b.title)}</strong></td>
      <td><span class="badge badge-secondary">${b.type === 'image' ? '이미지' : '영상'}</span></td>
      <td>
        <span class="status-badge ${b.is_visible == 1 ? 'status-사용' : 'status-미사용'}"
              style="cursor:pointer"
              onclick="toggleBannerVisible(${b.id}, this)">
          ${b.is_visible == 1 ? '노출' : '숨김'}
        </span>
      </td>
      <td>${b.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openBannerModal(${b.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteBanner(${b.id})">삭제</button>
      </div></td>
    </tr>
  `).join('');
  initTableDrag(tbody, saveBannerOrder);
}

async function toggleBannerVisible(id, el) {
  const res = await apiPost('api/banner.php', { action: 'toggleVisible', id });
  if (res.ok) {
    const b = bannerData.find(x => x.id == id);
    if (b) b.is_visible = res.is_visible;
    el.className = `status-badge ${res.is_visible == 1 ? 'status-사용' : 'status-미사용'}`;
    el.textContent = res.is_visible == 1 ? '노출' : '숨김';
  }
}

async function saveBannerOrder() {
  const rows = document.querySelectorAll('#bannerTableBody tr[data-id]');
  const ids = Array.from(rows).map(r => r.dataset.id);
  await apiPost('api/banner.php', { action: 'reorder', ids: JSON.stringify(ids) });
}

function openBannerModal(id) {
  bannerEditTarget = id || null;
  const modal   = document.getElementById('bannerEditModal');
  const titleEl = modal.querySelector('.modal-header h3');

  // ── 기존 필드 초기화 ──
  document.getElementById('bannerModalTitle').value       = '';
  document.getElementById('bannerModalType').value        = 'image';
  document.getElementById('bannerModalVisible').checked   = true;
  document.getElementById('bannerModalLinkUrl').value     = '';
  document.getElementById('bannerModalLinkTarget').value  = '_self';
  document.getElementById('bannerModalPcImage').value     = '';
  document.getElementById('bannerModalMoImage').value     = '';
  document.getElementById('bannerModalVideoUrl').value    = '';
  resetUploadArea('bannerPcImgArea', '🖥️', '권장: 1920×600px');
  resetUploadArea('bannerMoImgArea', '📱', '권장: 768×600px');

  // ── 추가 필드 초기화 ──
  document.getElementById('bannerModalOverlayOn').checked    = true;
  document.getElementById('bannerModalOverlayColor').value   = 'rgba(0,0,0,0.45)';
  document.getElementById('bannerModalSubtitle').value       = '';
  document.getElementById('bannerModalTitleText').value      = '';
  document.getElementById('bannerModalTitleColor').value     = '#ffffff';
  document.getElementById('bannerModalDesc').value           = '';
  document.getElementById('bannerModalDescColor').value      = 'rgba(255,255,255,.72)';
  document.getElementById('bannerModalBtn1On').checked       = false;
  document.getElementById('bannerModalBtn1Text').value       = '';
  document.getElementById('bannerModalBtn1Link').value       = '';
  document.getElementById('bannerModalBtn1Bg').value         = '#00c6ff';
  document.getElementById('bannerModalBtn1TextColor').value  = '#ffffff';
  document.getElementById('bannerModalBtn2On').checked       = false;
  document.getElementById('bannerModalBtn2Text').value       = '';
  document.getElementById('bannerModalBtn2Link').value       = '';
  document.getElementById('bannerModalBtn2TextColor').value  = '#ffffff';

  if (id) {
    const b = bannerData.find(x => x.id == id);
    titleEl.textContent = '배너 수정';
    // 기존 필드
    document.getElementById('bannerModalTitle').value       = b.title;
    document.getElementById('bannerModalType').value        = b.type;
    document.getElementById('bannerModalVisible').checked   = b.is_visible == 1;
    document.getElementById('bannerModalLinkUrl').value     = b.link_url    || '';
    document.getElementById('bannerModalLinkTarget').value  = b.link_target || '_self';
    document.getElementById('bannerModalVideoUrl').value    = b.video_url   || '';
    if (b.pc_image) setUploadPreview('bannerPcImgArea', b.pc_image, 'bannerModalPcImage');
    if (b.mo_image) setUploadPreview('bannerMoImgArea', b.mo_image, 'bannerModalMoImage');
    // 추가 필드
    document.getElementById('bannerModalOverlayOn').checked    = b.overlay_on == 1;
    document.getElementById('bannerModalOverlayColor').value   = b.overlay_color   || 'rgba(0,0,0,0.45)';
    document.getElementById('bannerModalSubtitle').value       = b.subtitle        || '';
    document.getElementById('bannerModalTitleText').value      = b.title_text      || '';
    document.getElementById('bannerModalTitleColor').value     = b.title_color     || '#ffffff';
    document.getElementById('bannerModalDesc').value           = b.description     || '';
    document.getElementById('bannerModalDescColor').value      = b.desc_color      || 'rgba(255,255,255,.72)';
    document.getElementById('bannerModalBtn1On').checked       = b.btn1_on == 1;
    document.getElementById('bannerModalBtn1Text').value       = b.btn1_text       || '';
    document.getElementById('bannerModalBtn1Link').value       = b.btn1_link       || '';
    document.getElementById('bannerModalBtn1Bg').value         = b.btn1_bg         || '#00c6ff';
    document.getElementById('bannerModalBtn1TextColor').value  = b.btn1_text_color || '#ffffff';
    document.getElementById('bannerModalBtn2On').checked       = b.btn2_on == 1;
    document.getElementById('bannerModalBtn2Text').value       = b.btn2_text       || '';
    document.getElementById('bannerModalBtn2Link').value       = b.btn2_link       || '';
    document.getElementById('bannerModalBtn2TextColor').value  = b.btn2_text_color || '#ffffff';
  } else {
    titleEl.textContent = '배너 추가';
  }
  toggleBannerModalType(document.getElementById('bannerModalType').value);
  openModal('bannerEditModal');
}

function toggleBannerModalType(val) {
  const type = val || document.getElementById('bannerModalType').value;
  document.getElementById('bannerModalImgFields').style.display = type === 'image' ? '' : 'none';
  document.getElementById('bannerModalVidFields').style.display = type === 'video' ? '' : 'none';
}

async function saveBannerModal() {
  const title = document.getElementById('bannerModalTitle').value.trim();
  if (!title) { showToast('배너 제목을 입력하세요.', 'error'); return; }

  const data = {
    action:           bannerEditTarget ? 'update' : 'create',
    title,
    type:             document.getElementById('bannerModalType').value,
    is_visible:       document.getElementById('bannerModalVisible').checked ? 1 : 0,
    link_url:         document.getElementById('bannerModalLinkUrl').value.trim(),
    link_target:      document.getElementById('bannerModalLinkTarget').value,
    pc_image:         document.getElementById('bannerModalPcImage').value.trim(),
    mo_image:         document.getElementById('bannerModalMoImage').value.trim(),
    video_url:        document.getElementById('bannerModalVideoUrl').value.trim(),
    overlay_on:       document.getElementById('bannerModalOverlayOn').checked ? 1 : 0,
    overlay_color:    document.getElementById('bannerModalOverlayColor').value.trim(),
    subtitle:         document.getElementById('bannerModalSubtitle').value.trim(),
    title_text:       document.getElementById('bannerModalTitleText').value.trim(),
    title_color:      document.getElementById('bannerModalTitleColor').value.trim(),
    description:      document.getElementById('bannerModalDesc').value.trim(),
    desc_color:       document.getElementById('bannerModalDescColor').value.trim(),
    btn1_on:          document.getElementById('bannerModalBtn1On').checked ? 1 : 0,
    btn1_text:        document.getElementById('bannerModalBtn1Text').value.trim(),
    btn1_link:        document.getElementById('bannerModalBtn1Link').value.trim(),
    btn1_bg:          document.getElementById('bannerModalBtn1Bg').value.trim(),
    btn1_text_color:  document.getElementById('bannerModalBtn1TextColor').value.trim(),
    btn2_on:          document.getElementById('bannerModalBtn2On').checked ? 1 : 0,
    btn2_text:        document.getElementById('bannerModalBtn2Text').value.trim(),
    btn2_link:        document.getElementById('bannerModalBtn2Link').value.trim(),
    btn2_text_color:  document.getElementById('bannerModalBtn2TextColor').value.trim(),
  };
  if (bannerEditTarget) data.id = bannerEditTarget;

  const res = await apiPost('api/banner.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('bannerEditModal');
    loadBannerList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteBanner(id) {
  if (!confirm('배너를 삭제하시겠습니까?')) return;
  const res = await apiPost('api/banner.php', { action: 'delete', id });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    loadBannerList();
  } else {
    showToast(res.msg || '삭제 실패', 'error');
  }
}

function filterBannerTable() {
  const kw      = (document.getElementById('bannerSearch')?.value || '').toLowerCase();
  const type    = document.getElementById('bannerTypeFilter')?.value  || '';
  const visible = document.getElementById('bannerVisibleFilter')?.value || '';
  document.querySelectorAll('#bannerTableBody tr').forEach(tr => {
    const title   = (tr.querySelector('strong')?.textContent || '').toLowerCase();
    const typeTxt = (tr.cells[4]?.textContent || '').trim();
    const visTxt  = (tr.cells[5]?.textContent || '').trim();
    const ok = (!kw || title.includes(kw))
            && (!type    || typeTxt === type)
            && (!visible || visTxt  === visible);
    tr.style.display = ok ? '' : 'none';
  });
}

// resetUploadArea / setUploadPreview → file_upload.js에서 공통 정의
// 업로드 바인딩은 file_upload.js의 DOMContentLoaded에서 일괄 처리

function syncPicker(pickerId, val) {
  if (/^#[0-9a-fA-F]{3,6}$/.test(val.trim())) {
    const el = document.getElementById(pickerId);
    if (el) el.value = val.trim();
  }
}