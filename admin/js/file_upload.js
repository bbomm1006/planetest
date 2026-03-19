// ===========================
// FILE UPLOAD
// ===========================

// 업로드 영역 초기화
function resetUploadArea(areaId, icon, hint) {
  const area = document.getElementById(areaId);
  if (!area) return;
  area.innerHTML = `<div class="upload-icon">${icon}</div><p><strong>클릭하여 업로드</strong></p><p style="font-size:.75rem;">${hint}</p>`;
}

// 기존 이미지 URL을 미리보기로 표시
function setUploadPreview(areaId, url, hiddenId) {
  const area = document.getElementById(areaId);
  if (!area) return;
  area.innerHTML = `<img src="${esc(url)}" style="max-height:80px;border-radius:4px;">
    <p style="font-size:.75rem;margin-top:4px;">${esc(url.split('/').pop())}</p>`;
  if (hiddenId) document.getElementById(hiddenId).value = url;
}

function triggerUpload(inputId) {
  const input = document.getElementById(inputId);
  if (input) input.click();
}

// 단일 이미지 → 서버 업로드 후 hidden input에 경로 저장, upload-area에 미리보기
async function uploadSingleImage(file, areaId, hiddenId) {
  if (!file) return;

  // 로딩 표시
  const area = document.getElementById(areaId);
  if (area) area.innerHTML = `<div class="upload-icon">⏳</div><p>업로드 중...</p>`;

  const fd = new FormData();
  fd.append('file', file);

  try {
    const res  = await fetch('api/upload.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      if (area) {
        area.innerHTML = `<img src="${esc(data.url)}" style="max-height:80px;border-radius:4px;">
          <p style="font-size:.75rem;margin-top:4px;">${esc(data.name)}</p>`;
      }
      const hidden = document.getElementById(hiddenId);
      if (hidden) hidden.value = data.url;
    } else {
      if (area) area.innerHTML = `<div class="upload-icon">❌</div><p>${esc(data.msg)}</p>`;
      showToast(data.msg || '업로드 실패', 'error');
    }
  } catch (e) {
    if (area) area.innerHTML = `<div class="upload-icon">❌</div><p>업로드 오류</p>`;
    showToast('업로드 오류가 발생했습니다.', 'error');
  }
}

// input[type=file]에 uploadSingleImage 바인딩
function bindSingleUpload(fileInputId, areaId, hiddenId) {
  const input = document.getElementById(fileInputId);
  if (!input) return;
  // 중복 바인딩 방지
  if (input._uploadBound) return;
  input._uploadBound = true;
  input.addEventListener('change', function() {
    if (this.files[0]) uploadSingleImage(this.files[0], areaId, hiddenId);
  });
}

// 다중 이미지 미리보기 (store 등)
function handleMultiImagePreview(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const item = document.createElement('div');
      item.className = 'image-preview-item';
      item.setAttribute('draggable','true');
      item.innerHTML = `
        <img src="${ev.target.result}" alt="preview"/>
        <span class="img-drag-icon">⠿</span>
        <button class="img-remove" onclick="this.closest('.image-preview-item').remove()">✕</button>`;
      preview.appendChild(item);
      initImgDrag(preview);
    };
    reader.readAsDataURL(file);
  });
}

function initImgDrag(container) {
  let dragEl = null;
  container.querySelectorAll('.image-preview-item').forEach(item => {
    item.ondragstart = e => { dragEl = item; item.classList.add('img-dragging'); e.dataTransfer.effectAllowed='move'; };
    item.ondragend   = () => { item.classList.remove('img-dragging'); dragEl = null; };
    item.ondragover  = e => { e.preventDefault(); item.classList.add('img-drag-over'); };
    item.ondragleave = () => item.classList.remove('img-drag-over');
    item.ondrop      = e => { e.preventDefault(); item.classList.remove('img-drag-over'); if(dragEl && dragEl!==item) container.insertBefore(dragEl, item); };
  });
}

// DOMContentLoaded 시 각 업로드 영역 바인딩
document.addEventListener('DOMContentLoaded', function() {
  // 배너
  bindSingleUpload('bannerPcImg', 'bannerPcImgArea', 'bannerModalPcImage');
  bindSingleUpload('bannerMoImg', 'bannerMoImgArea', 'bannerModalMoImage');
  // 팝업
  bindSingleUpload('popupPcImg', 'popupPcImgArea', 'popupPcImageVal');
  bindSingleUpload('popupMoImg', 'popupMoImgArea', 'popupMoImageVal');
  // 제품
  bindSingleUpload('productImg', 'productImgArea', 'productImage');
});