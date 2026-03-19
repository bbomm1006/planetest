// ===========================
// CATEGORY
// ===========================
let catData = [];
let catEditTarget = null;

async function loadCatList() {
  const res = await apiGet('api/product.php', { action: 'catList' });
  if (res.ok) { catData = res.data; renderCatTable(); }
}

function renderCatTable() {
  const tbody = document.getElementById('catTableBody');
  if (!tbody) return;
  if (!catData.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 분류가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = catData.map((c, i) => `
    <tr draggable="true" data-id="${c.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('catBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(c.name)}</strong></td>
      <td>
        <span class="status-badge ${c.is_active ? 'status-사용' : 'status-미사용'}"
              style="cursor:pointer" onclick="toggleCat(${c.id}, this)">
          ${c.is_active ? '사용' : '미사용'}
        </span>
      </td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openCatModal(${c.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteCat(${c.id})">삭제</button>
      </div></td>
    </tr>
  `).join('');
  initTableDrag(tbody, saveCatOrder);
}

async function toggleCat(id, el) {
  const res = await apiPost('api/product.php', { action: 'catToggle', id });
  if (res.ok) {
    const c = catData.find(x => x.id == id);
    if (c) c.is_active = res.is_active;
    el.className = `status-badge ${res.is_active ? 'status-사용' : 'status-미사용'}`;
    el.textContent = res.is_active ? '사용' : '미사용';
  }
}

async function saveCatOrder() {
  const ids = Array.from(document.querySelectorAll('#catTableBody tr[data-id]')).map(r => r.dataset.id);
  await apiPost('api/product.php', { action: 'catReorder', ids: JSON.stringify(ids) });
}

function openCatModal(id) {
  catEditTarget = id || null;
  const modal = document.getElementById('catModal');
  modal.querySelector('.modal-header h3').textContent = id ? '분류 수정' : '분류 추가';
  document.getElementById('catName').value     = '';
  document.getElementById('catActive').checked = true;
  document.getElementById('catActiveLabel').textContent = '사용';
  if (id) {
    const c = catData.find(x => x.id == id);
    document.getElementById('catName').value     = c.name;
    document.getElementById('catActive').checked = !!c.is_active;
    document.getElementById('catActiveLabel').textContent = c.is_active ? '사용' : '미사용';
  }
  openModal('catModal');
}

async function saveCatModal() {
  const name      = document.getElementById('catName').value.trim();
  const is_active = document.getElementById('catActive').checked ? 1 : 0;
  if (!name) { showToast('분류명을 입력하세요.', 'error'); return; }
  const data = { action: catEditTarget ? 'catUpdate' : 'catCreate', name, is_active };
  if (catEditTarget) data.id = catEditTarget;
  const res = await apiPost('api/product.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('catModal');
    loadCatList();
    loadProductCatOptions(); // 제품 모달 분류 select 갱신
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteCat(id) {
  if (!confirm('분류를 삭제하시겠습니까?')) return;
  const res = await apiPost('api/product.php', { action: 'catDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCatList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

// ===========================
// CARD DISCOUNT
// ===========================
let cardData = [];
let cardEditTarget = null;

async function loadCardList() {
  const res = await apiGet('api/product.php', { action: 'cardList' });
  if (res.ok) { cardData = res.data; renderCardTable(); }
}

function renderCardTable() {
  const tbody = document.getElementById('cardTableBody');
  if (!tbody) return;
  if (!cardData.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 카드사가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = cardData.map((c, i) => `
    <tr draggable="true" data-id="${c.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('cardBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(c.card_name)}</strong></td>
      <td>${parseFloat(c.rate)}%</td>
      <td>
        <span class="status-badge ${c.is_active ? 'status-사용' : 'status-미사용'}"
              style="cursor:pointer" onclick="toggleCard(${c.id}, this)">
          ${c.is_active ? '사용' : '미사용'}
        </span>
      </td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openCardModal(${c.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteCard(${c.id})">삭제</button>
      </div></td>
    </tr>
  `).join('');
  initTableDrag(tbody, saveCardOrder);
}

async function toggleCard(id, el) {
  const res = await apiPost('api/product.php', { action: 'cardToggle', id });
  if (res.ok) {
    const c = cardData.find(x => x.id == id);
    if (c) c.is_active = res.is_active;
    el.className = `status-badge ${res.is_active ? 'status-사용' : 'status-미사용'}`;
    el.textContent = res.is_active ? '사용' : '미사용';
  }
}

async function saveCardOrder() {
  const ids = Array.from(document.querySelectorAll('#cardTableBody tr[data-id]')).map(r => r.dataset.id);
  await apiPost('api/product.php', { action: 'cardReorder', ids: JSON.stringify(ids) });
}

function openCardModal(id) {
  cardEditTarget = id || null;
  document.getElementById('cardModal').querySelector('.modal-header h3').textContent = id ? '카드사 할인율 수정' : '카드사 할인율 추가';
  document.getElementById('cardName').value    = '';
  document.getElementById('cardRate').value    = '';
  document.getElementById('cardActive').checked = true;
  document.getElementById('cardActiveLabel').textContent = '사용';
  if (id) {
    const c = cardData.find(x => x.id == id);
    document.getElementById('cardName').value     = c.card_name;
    document.getElementById('cardRate').value     = c.rate;
    document.getElementById('cardActive').checked = !!c.is_active;
    document.getElementById('cardActiveLabel').textContent = c.is_active ? '사용' : '미사용';
  }
  openModal('cardModal');
}

async function saveCardModal() {
  const card_name = document.getElementById('cardName').value.trim();
  const rate      = document.getElementById('cardRate').value;
  const is_active = document.getElementById('cardActive').checked ? 1 : 0;
  if (!card_name) { showToast('카드사명을 입력하세요.', 'error'); return; }
  if (rate === '' || isNaN(rate)) { showToast('할인율을 입력하세요.', 'error'); return; }
  const data = { action: cardEditTarget ? 'cardUpdate' : 'cardCreate', card_name, rate, is_active };
  if (cardEditTarget) data.id = cardEditTarget;
  const res = await apiPost('api/product.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('cardModal');
    loadCardList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteCard(id) {
  if (!confirm('카드사 할인율을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/product.php', { action: 'cardDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCardList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

// ===========================
// PRODUCT
// ===========================
let productData = [];
let productEditTarget = null;

async function loadProductList() {
  const catId = document.getElementById('productCatFilter')?.value || '';
  const kw    = document.getElementById('productSearch')?.value    || '';
  const params = { action: 'productList' };
  if (catId) params.cat_id = catId;
  if (kw)    params.kw     = kw;
  const res = await apiGet('api/product.php', params);
  if (res.ok) { productData = res.data; renderProductTable(); }
}

function renderProductTable() {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;
  if (!productData.length) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 제품이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = productData.map((p, i) => {
    const price    = parseInt(p.price    || 0).toLocaleString();
    const discount = parseInt(p.discount || 0).toLocaleString();
    const badge    = p.badge_text
      ? `<span class="badge" style="background:${esc(p.badge_color||'#555')};color:#fff;">${esc(p.badge_text)}</span>`
      : '—';
    return `
    <tr draggable="true" data-id="${p.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('productBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td>${esc(p.cat_name || '—')}</td>
      <td>${esc(p.model_no)}</td>
      <td><strong>${esc(p.name)}</strong></td>
      <td>${price}</td>
      <td>${discount}</td>
      <td>${badge}</td>
      <td>${p.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openProductModal(${p.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteProduct(${p.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
  initTableDrag(tbody, saveProductOrder);
}

async function saveProductOrder() {
  const ids = Array.from(document.querySelectorAll('#productTableBody tr[data-id]')).map(r => r.dataset.id);
  await apiPost('api/product.php', { action: 'productReorder', ids: JSON.stringify(ids) });
}

// 분류 select 옵션 동적 채우기 (모달 + 필터)
async function loadProductCatOptions() {
  const res = await apiGet('api/product.php', { action: 'catList' });
  if (!res.ok) return;
  const cats = res.data.filter(c => c.is_active);

  // 제품 모달 분류 select
  const sel = document.getElementById('productCategoryId');
  if (sel) {
    sel.innerHTML = '<option value="">-- 분류 선택 --</option>' +
      cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  }
  // 필터 select
  const flt = document.getElementById('productCatFilter');
  if (flt) {
    const cur = flt.value;
    flt.innerHTML = '<option value="">전체 분류</option>' +
      cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    flt.value = cur;
  }
}

function openProductModal(id) {
  productEditTarget = id || null;
  document.getElementById('productModal').querySelector('.modal-header h3').textContent = id ? '제품 수정' : '제품 추가';

  // 초기화
  ['productCategoryId','productModelNo','productName','productBadgeText',
   'productPrice','productDiscount','productShortDesc','productDetailDesc',
   'productImage','productTags'].forEach(elId => {
    const el = document.getElementById(elId);
    if (el) el.value = '';
  });
  document.getElementById('productBadgeColor').value = '#dc2626';
  document.getElementById('productBadgeColorText').value = '#dc2626';
  // 태그 초기화
  const tagsArea = document.getElementById('productTagsArea');
  if (tagsArea) {
    tagsArea.querySelectorAll('.tag').forEach(t => t.remove());
  }
  // 이미지 미리보기 초기화
  resetUploadArea('productImgArea', '📸', '클릭하여 업로드');

  loadProductCatOptions().then(() => {
    if (id) {
      apiGet('api/product.php', { action: 'productGet', id }).then(res => {
        if (!res.ok) return;
        const p = res.data;
        document.getElementById('productCategoryId').value  = p.category_id;
        document.getElementById('productModelNo').value     = p.model_no;
        document.getElementById('productName').value        = p.name;
        document.getElementById('productBadgeText').value   = p.badge_text  || '';
        document.getElementById('productBadgeColor').value  = p.badge_color || '#dc2626';
        document.getElementById('productBadgeColorText').value = p.badge_color || '#dc2626';
        document.getElementById('productPrice').value       = p.price;
        document.getElementById('productDiscount').value    = p.discount;
        document.getElementById('productShortDesc').value   = p.short_desc  || '';
        document.getElementById('productDetailDesc').value  = p.detail_desc || '';
        document.getElementById('productImage').value       = p.image       || '';
        document.getElementById('productTags').value        = p.tags        || '';
        if (p.image) setUploadPreview('productImgArea', p.image, 'productImage');
        // 태그 렌더
        if (p.tags) {
          p.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
            appendTagToArea('productTagsArea', t);
          });
        }
      });
    }
    openModal('productModal');
  });
}

async function saveProductModal() {
  const cat_id = document.getElementById('productCategoryId').value;
  const model  = document.getElementById('productModelNo').value.trim();
  const name   = document.getElementById('productName').value.trim();
  if (!cat_id) { showToast('분류를 선택하세요.', 'error'); return; }
  if (!model)  { showToast('모델명을 입력하세요.', 'error'); return; }
  if (!name)   { showToast('제품명을 입력하세요.', 'error'); return; }

  // 태그 수집
  const tagEls = document.querySelectorAll('#productTagsArea .tag');
  const tags   = Array.from(tagEls).map(t => t.childNodes[0].textContent.trim()).join(',');

  const data = {
    action:      productEditTarget ? 'productUpdate' : 'productCreate',
    category_id: cat_id,
    model_no:    model,
    name,
    badge_text:  document.getElementById('productBadgeText').value.trim(),
    badge_color: document.getElementById('productBadgeColor').value,
    price:       document.getElementById('productPrice').value   || 0,
    discount:    document.getElementById('productDiscount').value || 0,
    short_desc:  document.getElementById('productShortDesc').value.trim(),
    detail_desc: document.getElementById('productDetailDesc').value.trim(),
    image:       document.getElementById('productImage').value.trim(),
    tags,
  };
  if (productEditTarget) data.id = productEditTarget;

  const res = await apiPost('api/product.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('productModal');
    loadProductList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('제품을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/product.php', { action: 'productDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadProductList(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

// 배지 색상 picker ↔ text 동기화
document.addEventListener('input', function(e) {
  if (e.target.id === 'productBadgeColor')
    document.getElementById('productBadgeColorText').value = e.target.value;
  if (e.target.id === 'productBadgeColorText')
    document.getElementById('productBadgeColor').value = e.target.value;
});

// 태그 헬퍼
function appendTagToArea(areaId, text) {
  const area  = document.getElementById(areaId);
  const input = area.querySelector('input');
  const tag   = document.createElement('span');
  tag.className = 'tag';
  tag.innerHTML = `${esc(text)} <button class="tag-remove" onclick="removeTag(this)">×</button>`;
  area.insertBefore(tag, input);
}

// 업로드 바인딩은 file_upload.js의 DOMContentLoaded에서 일괄 처리