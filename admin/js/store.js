// ===========================
// KAKAO API
// ===========================
let _kakaoSdkLoaded = false;
let _kakaoSdkLoading = false;
let _kakaoSdkCallbacks = [];

// 우편번호 서비스 스크립트 로드 (kakao 지도 SDK와 별개)
let _postcodeLoaded = false;

function loadDaumPostcode() {
  if (_postcodeLoaded && window.daum && window.daum.Postcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => { _postcodeLoaded = true; resolve(); };
    script.onerror = () => reject('postcode load error');
    document.head.appendChild(script);
  });
}

// 카카오 SDK 동적 로드 (js_key는 DB에서)
async function loadKakaoSdk() {
  if (_kakaoSdkLoaded && window.kakao && window.kakao.maps) return Promise.resolve();
  if (_kakaoSdkLoading) {
    return new Promise(resolve => _kakaoSdkCallbacks.push(resolve));
  }
  _kakaoSdkLoading = true;

  // DB에서 키 조회
  const res = await apiGet('api/store.php', { action: 'kakaoGet' });
  const jsKey = res.ok ? (res.data.js_key || '') : '';
  if (!jsKey) {
    showToast('카카오 API 관리에서 JavaScript 키를 먼저 등록해주세요.', 'error');
    _kakaoSdkLoading = false;
    return Promise.reject('no key');
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&libraries=services&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        _kakaoSdkLoaded  = true;
        _kakaoSdkLoading = false;
        _kakaoSdkCallbacks.forEach(cb => cb());
        _kakaoSdkCallbacks = [];
        resolve();
      });
    };
    script.onerror = () => {
      _kakaoSdkLoading = false;
      showToast('카카오 SDK 로드 실패. JavaScript 키를 확인해주세요.', 'error');
      reject('sdk error');
    };
    document.head.appendChild(script);
  });
}

// 주소검색 팝업 → geocoder로 좌표 변환 → 지도 미리보기
async function searchStoreAddress() {
  // 1) 우편번호 스크립트 로드 (daum.Postcode용 — 지도 SDK와 별개)
  try {
    await loadDaumPostcode();
  } catch(e) {
    showToast('주소 검색 서비스 로드에 실패했습니다.', 'error');
    return;
  }

  // 2) 카카오 지도 SDK 로드 (좌표 변환용)
  try {
    await loadKakaoSdk();
  } catch(e) { return; }

  // 3) 우편번호 팝업 열기
  new window.daum.Postcode({
    oncomplete: function(data) {
      const addr = data.roadAddress || data.jibunAddress;
      document.getElementById('storeAddress').value = addr;

      // 좌표 변환
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(addr, function(result, status) {
        if (status !== kakao.maps.services.Status.OK) {
          showToast('좌표 변환에 실패했습니다.', 'error');
          return;
        }
        const lat = result[0].y;
        const lng = result[0].x;
        document.getElementById('storeLat').value = lat;
        document.getElementById('storeLng').value = lng;
        renderStoreMapPreview(parseFloat(lat), parseFloat(lng), addr);
      });
    }
  }).open();
}

// 지도 미리보기 렌더
function renderStoreMapPreview(lat, lng, title) {
  const wrap = document.getElementById('storeMapWrap');
  const container = document.getElementById('storeMapPreview');
  if (!wrap || !container) return;
  wrap.style.display = '';

  const coords = new kakao.maps.LatLng(lat, lng);
  const map = new kakao.maps.Map(container, { center: coords, level: 4 });
  const marker = new kakao.maps.Marker({ position: coords, map });

  if (title) {
    const infowindow = new kakao.maps.InfoWindow({ content: `<div style="padding:5px 8px;font-size:12px;">${title}</div>` });
    infowindow.open(map, marker);
  }
}

async function loadKakaoApi() {
  const res = await apiGet('api/store.php', { action: 'kakaoGet' });
  if (!res.ok) return;
  document.getElementById('kakaoSdkUrl').value  = res.data.sdk_url  || '';
  document.getElementById('kakaoJsKey').value   = res.data.js_key   || '';
  document.getElementById('kakaoRestKey').value = res.data.rest_key || '';
}

async function saveKakaoApi() {
  const data = {
    action:   'kakaoSave',
    sdk_url:  document.getElementById('kakaoSdkUrl').value.trim(),
    js_key:   document.getElementById('kakaoJsKey').value.trim(),
    rest_key: document.getElementById('kakaoRestKey').value.trim(),
  };
  const res = await apiPost('api/store.php', data);
  if (res.ok) showToast('저장되었습니다.', 'success');
  else showToast(res.msg || '저장 실패', 'error');
}

// ===========================
// STORE
// ===========================
let storeData = [];
let storeEditTarget = null;

async function loadStoreList() {
  const res = await apiGet('api/store.php', { action: 'storeList' });
  if (res.ok) { storeData = res.data; renderStoreTable(); }
}

function renderStoreTable() {
  const tbody = document.getElementById('storeTableBody');
  if (!tbody) return;
  if (!storeData.length) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 매장이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = storeData.map((s, i) => {
    // 주소에서 시/도 추출 (필터용)
    const region = (s.address || '').split(' ')[0] || '—';
    return `
    <tr draggable="true" data-id="${s.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('storeBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(s.store_name)}</strong></td>
      <td>${esc(s.branch_name)}</td>
      <td>${esc(region)}</td>
      <td>${esc(s.phone || '—')}</td>
      <td>${esc(s.open_hours || '—')}</td>
      <td>${s.created_at}</td>
      <td>${s.updated_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openStoreModal(${s.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteStore(${s.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
  initTableDrag(tbody, saveStoreOrder);
}

async function saveStoreOrder() {
  const ids = Array.from(document.querySelectorAll('#storeTableBody tr[data-id]')).map(r => r.dataset.id);
  await apiPost('api/store.php', { action: 'storeReorder', ids: JSON.stringify(ids) });
}

function openStoreModal(id) {
  storeEditTarget = id || null;
  const modal = document.getElementById('storeModal');
  modal.querySelector('.modal-header h3').textContent = id ? '매장 수정' : '매장 추가';

  // 초기화
  ['storeStoreName','storeBranchName','storeAddress','storeLat','storeLng',
   'storePhone','storeOpenHours','storeReserveUrl','storeMemo','storeDetailInfo'
  ].forEach(elId => { const el = document.getElementById(elId); if (el) el.value = ''; });
  document.getElementById('storeReserveTarget').value = '_self';
  const visEl = document.getElementById('storeVisible');
  if (visEl) { visEl.checked = true; }
  const visLabel = document.getElementById('storeVisibleLabel');
  if (visLabel) visLabel.textContent = '노출';
  // 이미지 초기화
  document.getElementById('storeImgPreview').innerHTML = '';
  document.getElementById('storeImagesVal').value = '';
  const mapWrap = document.getElementById('storeMapWrap');
  if (mapWrap) mapWrap.style.display = 'none';

  if (id) {
    apiGet('api/store.php', { action: 'storeGet', id }).then(res => {
      if (!res.ok) return;
      const s = res.data;
      document.getElementById('storeStoreName').value    = s.store_name   || '';
      document.getElementById('storeBranchName').value   = s.branch_name  || '';
      document.getElementById('storeAddress').value      = s.address      || '';
      document.getElementById('storeLat').value          = s.lat          || '';
      document.getElementById('storeLng').value          = s.lng          || '';
      // 기존 좌표 있으면 지도 미리보기
      if (s.lat && s.lng) {
        loadKakaoSdk().then(() => {
          renderStoreMapPreview(parseFloat(s.lat), parseFloat(s.lng), s.address);
        }).catch(() => {});
      } else {
        const wrap = document.getElementById('storeMapWrap');
        if (wrap) wrap.style.display = 'none';
      }
      document.getElementById('storePhone').value        = s.phone        || '';
      document.getElementById('storeOpenHours').value    = s.open_hours   || '';
      document.getElementById('storeReserveUrl').value   = s.reserve_url  || '';
      document.getElementById('storeReserveTarget').value= s.reserve_target || '_self';
      document.getElementById('storeMemo').value         = s.memo         || '';
      document.getElementById('storeDetailInfo').value   = s.detail_info  || '';
      document.getElementById('storeImagesVal').value    = s.images       || '';
      // 기존 이미지 미리보기
      if (s.images) {
        renderStoreImagePreviews(JSON.parse(s.images || '[]'));
      }
    });
  }
  openModal('storeModal');
}

function renderStoreImagePreviews(urls) {
  const preview = document.getElementById('storeImgPreview');
  if (!preview) return;
  preview.innerHTML = '';
  urls.forEach(url => {
    const item = document.createElement('div');
    item.className = 'image-preview-item';
    item.setAttribute('draggable', 'true');
    item.dataset.url = url;
    item.innerHTML = `
      <img src="${esc(url)}" alt="매장 이미지"/>
      <span class="img-drag-icon">⠿</span>
      <button class="img-remove" onclick="removeStoreImage(this)">✕</button>`;
    preview.appendChild(item);
  });
  initImgDrag(preview);
}

function removeStoreImage(btn) {
  btn.closest('.image-preview-item').remove();
  syncStoreImages();
}

function syncStoreImages() {
  const urls = Array.from(document.querySelectorAll('#storeImgPreview .image-preview-item'))
    .map(el => el.dataset.url).filter(Boolean);
  document.getElementById('storeImagesVal').value = JSON.stringify(urls);
}

async function saveStoreModal() {
  const store_name  = document.getElementById('storeStoreName').value.trim();
  const branch_name = document.getElementById('storeBranchName').value.trim();
  if (!store_name)  { showToast('매장명을 입력하세요.', 'error'); return; }
  if (!branch_name) { showToast('지점명을 입력하세요.', 'error'); return; }

  // 이미지 순서 동기화
  syncStoreImages();

  const data = {
    action:         storeEditTarget ? 'storeUpdate' : 'storeCreate',
    store_name,
    branch_name,
    address:        document.getElementById('storeAddress').value.trim(),
    lat:            document.getElementById('storeLat').value,
    lng:            document.getElementById('storeLng').value,
    phone:          document.getElementById('storePhone').value.trim(),
    open_hours:     document.getElementById('storeOpenHours').value.trim(),
    reserve_url:    document.getElementById('storeReserveUrl').value.trim(),
    reserve_target: document.getElementById('storeReserveTarget').value,
    memo:           document.getElementById('storeMemo').value.trim(),
    detail_info:    document.getElementById('storeDetailInfo').value.trim(),
    images:         document.getElementById('storeImagesVal').value,
  };
  if (storeEditTarget) data.id = storeEditTarget;

  const res = await apiPost('api/store.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('storeModal');
    loadStoreList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteStore(id) {
  if (!confirm('매장을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/store.php', { action: 'storeDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadStoreList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

function filterStoreTable() {
  const kw      = (document.getElementById('storeSearch')?.value || '').toLowerCase();
  const region  = document.getElementById('storeRegionFilter')?.value || '';
  const visible = document.getElementById('storeVisibleFilter')?.value || '';
  document.querySelectorAll('#storeTableBody tr').forEach(tr => {
    const nameText   = (tr.cells[3]?.textContent || '').toLowerCase();
    const branchText = (tr.cells[4]?.textContent || '').toLowerCase();
    const regionText = (tr.cells[5]?.textContent || '');
    const phoneText  = (tr.cells[6]?.textContent || '').toLowerCase();
    const kwOk       = !kw     || nameText.includes(kw) || branchText.includes(kw) || phoneText.includes(kw);
    const regionOk   = !region || regionText.includes(region);
    tr.style.display = (kwOk && regionOk) ? '' : 'none';
  });
}

// 노출 토글 라벨
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'storeVisible') {
    const label = document.getElementById('storeVisibleLabel');
    if (label) label.textContent = e.target.checked ? '노출' : '숨김';
  }
});

// 매장 다중 이미지 업로드
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('storeImgFiles');
  if (!input) return;
  input.addEventListener('change', async function() {
    const files = Array.from(this.files);
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res  = await fetch('api/upload.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.ok) {
          const preview = document.getElementById('storeImgPreview');
          const item = document.createElement('div');
          item.className = 'image-preview-item';
          item.setAttribute('draggable', 'true');
          item.dataset.url = data.url;
          item.innerHTML = `
            <img src="${esc(data.url)}" alt="매장 이미지"/>
            <span class="img-drag-icon">⠿</span>
            <button class="img-remove" onclick="removeStoreImage(this)">✕</button>`;
          preview.appendChild(item);
          initImgDrag(preview);
          syncStoreImages();
        } else {
          showToast(data.msg || '업로드 실패', 'error');
        }
      } catch(e) {
        showToast('업로드 오류', 'error');
      }
    }
    this.value = ''; // input 초기화 (같은 파일 재선택 가능)
  });
});