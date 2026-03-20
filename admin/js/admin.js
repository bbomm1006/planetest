// ===========================
// DATA
// ===========================
const MENU_LIST_BASE = [
  { key:'banner',    label:'상단 메인 배너' },
  { key:'popup',     label:'팝업 관리' },
  { key:'catMgmt',   label:'상품 분류 관리' },
  { key:'product',   label:'제품 관리' },
  { key:'card',      label:'카드사 할인율 관리' },
  { key:'kakaoApi',  label:'카카오 API 관리' },
  { key:'store',     label:'매장(지점) 관리' },
  
  { key:'consult',   label:'상담 내역' },
  { key:'inquiryCat',label:'문의 분류 관리' },
  { key:'inquiry',   label:'일대일 문의 내역' },
  { key:'rsvTime',   label:'예약 시간 관리' },
  { key:'rsvList',   label:'예약 내역' },
];

// 프론트(홈) 섹션 노출 설정
// - is_active=0 이면 해당 lib 단락을 display:none 처리합니다.
const FRONT_SECTION_LIST = [
  { key:'front_service_switch', label:'프론트 서비스 전환 바' },
  { key:'front_user_menu',      label:'프론트 사용자 메뉴(상단 NAV)' },
  { key:'front_hero_banner',    label:'프론트 HERO(상단 배너)' },
  { key:'front_products',      label:'프론트 제품 섹션' },
  { key:'front_benefits',       label:'프론트 혜택 섹션' },
  { key:'front_videos',         label:'프론트 영상 섹션' },
  { key:'front_reviews',        label:'프론트 후기 섹션' },
  { key:'front_event',          label:'프론트 이벤트 섹션' },
  { key:'front_stores',         label:'프론트 매장찾기 섹션' },
  { key:'front_reservation',    label:'프론트 예약하기 섹션' },
  { key:'front_reservation_lookup', label:'프론트 예약 조회(변경)' },
  { key:'front_notices',       label:'프론트 공지사항 섹션' },
  { key:'front_faq',            label:'프론트 FAQ 섹션' },
  { key:'front_gallery',       label:'프론트 갤러리 섹션' },
  { key:'front_photo_gallery', label:'프론트 포토 갤러리' },
  { key:'front_slide_gallery', label:'프론트 슬라이드 갤러리' },
  { key:'front_board',         label:'프론트 문의게시판(BOARD)' },
  { key:'front_consult',       label:'프론트 상담신청(상담폼)' },
  { key:'front_footer',        label:'프론트 풋터' },
];

let menuState = {};
let createdBoards = [];

// 샘플 제품 목록 (제품 관리에서 등록된 제품들)
let productList = [
  { id: 1, name: '프리미엄 인버터 에어컨', model: 'AC-2024-PRO' },
  { id: 2, name: '스탠드형 에어컨', model: 'AC-2024-STD' },
  { id: 3, name: '양문형 냉장고', model: 'RF-2024-XXL' },
];

// 배너 데이터 (목록용) — bannerEditTarget은 banner.js에서 선언
let bannerData = [];

// ===========================
// 선택 필드 정의
// ===========================
const BOARD_FIELDS_OPTIONAL = [
  { key: '분류',        label: '분류',              type: 'category' },
  { key: '별점',        label: '별점',              type: 'rating' },
  { key: '유튜브링크',  label: '유튜브 링크',       type: 'text' },
  { key: '첨부파일',    label: '첨부파일',          type: 'files' },
  { key: '썸네일이미지',label: '썸네일 이미지',     type: 'image' },
  { key: '상세이미지',  label: '상세 이미지',       type: 'images' },
  { key: '제품',        label: '제품',              type: 'product' },
  { key: '기간',        label: '기간 (시작일~종료일)', type: 'period' },
  { key: '링크',        label: '링크',              type: 'text' },
  { key: '소셜',        label: '소셜 (자동)',        type: 'auto' },
  { key: '댓글',        label: '댓글',              type: 'comment' },
];

const BOARD_FIELDS_REQUIRED = ['제목','내용','작성일시','수정일시','작성자','조회수'];

// 자동 입력 필드 (글쓰기 폼에서 숨기는 것들)
const AUTO_FIELDS = ['소셜'];
// 댓글 관련 (상세보기 전용)
const COMMENT_FIELDS = ['댓글'];

const PAGE_LABELS = {
  adminMgmt:   ['시스템','관리자 관리'],
  menuMgmt:    ['시스템','메뉴 관리'],
  sectionMgmt: ['시스템','섹션 관리'],
  scriptMgmt:  ['시스템','스크립트 관리'],
  socialMgmt:  ['시스템','소셜 관리'],
  bannerMgmt:  ['콘텐츠','상단 메인 배너'],
  popupMgmt:   ['콘텐츠','팝업 관리'],
  catMgmt:     ['상품','분류 관리'],
  productMgmt: ['상품','제품 관리'],
  cardDiscMgmt:['상품','카드사 할인율 관리'],
  kakaoApiMgmt:['매장','카카오 API 관리'],
  storeMgmt:   ['매장','매장(지점) 관리'],
  boardCreate: ['게시판','게시판 추가'],
  boardList:   ['게시판','게시판 목록'],
 
  consultList: ['상담','상담 내역'],
  inquiryCat:  ['문의','분류 관리'],
  inquiryList: ['문의','문의 내역'],
  reserveTime: ['예약','예약 시간 관리'],
  reserveList: ['예약','예약 내역'],
  siteMgmt: ['시스템','사이트 정보 관리'],
  consultField: ['상담','필드 관리'],
  consultTerms: ['상담','약관 관리'],

  homepageInfo: ['시스템','홈페이지 정보 관리'],
};

// ===========================
// INIT
// ===========================
window.addEventListener('load', function() {
  updateClock();
  setInterval(updateClock, 1000);

  // 세션 확인 → 이미 로그인 상태면 바로 진입
  apiPost('api/auth.php', { action: 'check' }).then(res => {
    if (res.ok) enterAdmin(res.name, res.username, res.email || '');  // ← email 추가
  });

  MENU_LIST_BASE.forEach(m => { menuState[m.key] = true; });
  FRONT_SECTION_LIST.forEach(m => { menuState[m.key] = true; });
  if (typeof renderMenuChecks  === 'function') renderMenuChecks();
  if (typeof renderBoardFields === 'function') renderBoardFields();
  if (typeof fillTimeSelects   === 'function') fillTimeSelects();

  document.querySelectorAll('tbody[id]').forEach(tbody => {
    if (typeof initTableDrag === 'function') initTableDrag(tbody);
  });

  // storeImgFiles 업로드는 store.js에서 처리

  const loginPwEl = document.getElementById('loginPw');
  if (loginPwEl) {
    loginPwEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  }

  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
  });

  document.addEventListener('input', e => {
    if (e.target.type === 'color') {
      const s = e.target.nextElementSibling;
      if (s && s.type === 'text') s.value = e.target.value;
    }
    if (e.target.type === 'text' && e.target.closest('.color-group')) {
      const s = e.target.previousElementSibling;
      if (s && s.type === 'color' && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) s.value = e.target.value;
    }
  });

  // 별점 CSS 동적 삽입
  injectStarRatingStyles();
  injectBoardTabStyles();
});

// ===========================
// 공통 fetch helper
// ===========================
async function apiPost(url, data) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  const res = await fetch(url, { method: 'POST', body: fd });
  return res.json();
}
async function apiGet(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(url + (qs ? '?' + qs : ''));
  return res.json();
}
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ===========================
// 동적 CSS 삽입
// ===========================
function injectStarRatingStyles() {
  if (document.getElementById('starRatingStyle')) return;
  const style = document.createElement('style');
  style.id = 'starRatingStyle';
  style.textContent = `
    .star-rating-wrap { display:flex; align-items:center; gap:2px; flex-wrap:wrap; }
    .star-btn {
      background: none; border: none; cursor: pointer;
      font-size: 1.5rem; color: #e2e8f0; padding: 0 1px;
      transition: color .15s, transform .1s;
      line-height: 1;
    }
    .star-btn:hover { transform: scale(1.15); }
    .star-btn.active { color: #f59e0b; }
    .star-btn.reset-active { color: var(--text-muted); }
  `;
  document.head.appendChild(style);
}

function injectBoardTabStyles() {
  if (document.getElementById('boardTabStyle')) return;
  const style = document.createElement('style');
  style.id = 'boardTabStyle';
  style.textContent = `
    .board-tab-btn {
      background: none; border: none; border-bottom: 3px solid transparent;
      padding: 8px 20px; font-size: .88rem; font-weight: 500;
      color: var(--text-secondary); cursor: pointer;
      transition: color .15s, border-color .15s;
      margin-bottom: -2px;
    }
    .board-tab-btn:hover { color: var(--primary); }
    .board-tab-btn.active {
      color: var(--primary); border-bottom-color: var(--primary);
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);
}

// ===========================
// CLOCK
// ===========================
function updateClock() {
  const el = document.getElementById('headerTime');
  if (el) el.textContent = new Date().toLocaleString('ko-KR');
}

// ===========================
// LOGIN / LOGOUT
// ===========================
async function doLogin() {
  const username = document.getElementById('loginId').value.trim();
  const password = document.getElementById('loginPw').value.trim();
  const err      = document.getElementById('loginError');
  if (!username || !password) { err.classList.add('show'); return; }

  const res = await apiPost('api/auth.php', { action: 'login', username, password });
  if (res.ok) {
    err.classList.remove('show');
    document.getElementById('loginPw').value = '';
    enterAdmin(res.name, res.username, res.email || '');
  } else {
    err.textContent = res.msg || '아이디 또는 비밀번호가 올바르지 않습니다.';
    err.classList.add('show');
  }
}

function enterAdmin(name, username, email = '') {
  window.currentAdminName = name;
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminWrap').classList.remove('hidden');

  const nameEl   = document.getElementById('userNameDisplay');
  const avatarEl = document.getElementById('userAvatar');
  if (nameEl)   nameEl.textContent   = name;
  if (avatarEl) avatarEl.textContent = name.charAt(0);

  const unEl = document.getElementById('myInfoUsername');
  const nmEl = document.getElementById('myInfoName');
  if (unEl) unEl.value = username;
  if (nmEl) nmEl.value = name;

  const emEl = document.getElementById('myInfoEmail');
  if (emEl) emEl.value = email;

  // DB에서 메뉴 상태 로드 후 사이드바 반영
  apiGet('api/system.php', { action: 'menuList' }).then(res => {
    if (res.ok && res.data.length > 0) {
      res.data.forEach(m => { menuState[m.key] = !!m.is_active; });
    }
    renderSidebar();
  });

  const savedPage = localStorage.getItem('adminPage') || 'adminMgmt';
  showPage(savedPage);
  loadAdminList();
  if (typeof loadBoardList === 'function') loadBoardList();
}

async function doLogout() {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  await apiPost('api/auth.php', { action: 'logout' });
  document.getElementById('adminWrap').classList.add('hidden');
  document.getElementById('loginPage').style.display = '';
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('loginId').value = '';
  document.getElementById('loginPw').value = '';
}

// ===========================
// NAVIGATION
// ===========================
function showPage(pageId) {

  localStorage.setItem('adminPage', pageId);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('page-' + pageId);
  if (t) t.classList.add('active');

  document.querySelectorAll('.nav-sub-link').forEach(l => {
    l.classList.remove('active');
    const oc = l.getAttribute('onclick') || '';
    if (oc.includes(`'${pageId}'`) || l._pageId === pageId) {
      l.classList.add('active');
      const sub = l.closest('.nav-sub');
      if (sub) { sub.classList.add('open'); sub.previousElementSibling?.classList.add('open'); }
    }
  });

  const lb = PAGE_LABELS[pageId] || ['관리자', pageId];
  document.getElementById('breadcrumb1').textContent = lb[0];
  document.getElementById('breadcrumb2').textContent = lb[1];

  // 페이지 진입 시 데이터 로드
  if (pageId === 'adminMgmt')    loadAdminList();
  if (pageId === 'menuMgmt')     loadMenuList();
  if (pageId === 'sectionMgmt')  loadSectionMgmt();
  if (pageId === 'scriptMgmt')   loadScript();
  if (pageId === 'socialMgmt')   loadSocial();
  if (pageId === 'bannerMgmt')   loadBannerList();
  if (pageId === 'popupMgmt')    loadPopupList();
  if (pageId === 'catMgmt')      loadCatList();
  if (pageId === 'cardDiscMgmt') loadCardList();
  if (pageId === 'productMgmt')  { loadProductCatOptions(); loadProductList(); }
  if (pageId === 'kakaoApiMgmt') loadKakaoApi();
  if (pageId === 'storeMgmt')    loadStoreList();
  if (pageId === 'boardCreate')  renderBoardFields();
  if (pageId === 'boardList')    loadBoardList();

  if (pageId === 'consultList')  loadConsultList();
  if (pageId === 'inquiryCat')   loadInquiryCatList();
  if (pageId === 'inquiryList')  loadInquiryList();
  if (pageId === 'reserveTime')  loadReserveTimeList();
  if (pageId === 'reserveList')  loadReserveList();

  if (pageId === 'siteMgmt') loadSiteInfo();
  if (pageId === 'consultField') loadConsultConfig();
  if (pageId === 'consultTerms') loadConsultTermsList();

  if (pageId === 'homepageInfo') hiLoad();
}

function toggleNav(el) {
  el.classList.toggle('open');
  el.nextElementSibling?.classList.toggle('open');
}

// ===========================
// MODAL
// ===========================
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ===========================
// TOAST
// ===========================
function showToast(msg, type = 'default') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  const icons = { success:'✅', error:'❌', warning:'⚠️', default:'ℹ️' };
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// 공통 테이블 행 필터 (colIndexes: 검색 대상 td 인덱스 배열)
function filterTableRows(tbodyId, q, colIndexes) {
  const kw = q.toLowerCase();
  document.querySelectorAll(`#${tbodyId} tr`).forEach(tr => {
    const text = colIndexes.map(i => tr.cells[i]?.textContent || '').join(' ').toLowerCase();
    tr.style.display = (!kw || text.includes(kw)) ? '' : 'none';
  });
}

// ===========================
// ADMIN MANAGEMENT
// ===========================
async function loadAdminList() {
  const res = await apiGet('api/admin_mgmt.php', { action: 'list' });
  if (!res.ok) return;
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  tbody.innerHTML = res.data.map((a, i) => `
    <tr draggable="true" data-id="${a.id}">
      <td><input type="checkbox" class="row-check" onchange="updateBulkBar('adminBulk')"></td>
      <td><span class="sort-handle">⠿</span></td>
      <td class="row-num">${i + 1}</td>
      <td>${esc(a.username)}</td>
      <td>${esc(a.name)}</td>
      <td>${esc(a.email || '')}</td>
      <td>${a.created_at ? a.created_at.slice(0,10) : ''}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openAdminModal(${a.id},'${esc(a.username)}','${esc(a.name)}','${esc(a.email||'')}')">수정</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAdmin(${a.id})">삭제</button>
      </div></td>
    </tr>`).join('');
  if (typeof initTableDrag === 'function') initTableDrag(tbody);
}

function openAdminModal(id, username = '', name = '', email = '') {
  document.getElementById('adminModalId').value        = id || '';
  document.getElementById('adminModalUsername').value  = username;
  document.getElementById('adminModalUsername').readOnly = !!id;
  document.getElementById('adminModalName').value      = name;
  document.getElementById('adminModalEmail').value     = email; 
  document.getElementById('adminModalPassword').value  = '';
  document.getElementById('adminModalTitle').textContent = id ? '관리자 수정' : '관리자 추가';
  openModal('adminModal');
}

async function saveAdmin() {
  const id       = document.getElementById('adminModalId').value;
  const username = document.getElementById('adminModalUsername').value.trim();
  const password = document.getElementById('adminModalPassword').value.trim();
  const name     = document.getElementById('adminModalName').value.trim();

  if (!username || !name)   { showToast('아이디와 이름을 입력하세요.', 'error'); return; }
  if (!id && !password)     { showToast('비밀번호를 입력하세요.', 'error'); return; }

  const email = document.getElementById('adminModalEmail').value.trim();
  
  const res = await apiPost('api/admin_mgmt.php', { action: id ? 'update' : 'create', id, username, password, name, email });
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('adminModal');
    loadAdminList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function deleteAdmin(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await apiPost('api/admin_mgmt.php', { action: 'delete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadAdminList(); }
  else        { showToast(res.msg || '삭제 실패', 'error'); }
}

async function bulkDelete(bulkBarId, tbodyId) {
  const ids = [...document.querySelectorAll(`#${tbodyId} .row-check:checked`)]
    .map(cb => cb.closest('tr')?.dataset.id).filter(Boolean);
  if (!ids.length) { showToast('항목을 선택하세요.', 'warning'); return; }
  if (!confirm(`${ids.length}건을 삭제하시겠습니까?`)) return;

  // 관리자 테이블인 경우
  if (tbodyId === 'adminTableBody') {
    for (const id of ids) await apiPost('api/admin_mgmt.php', { action: 'delete', id });
    showToast('삭제되었습니다.', 'success');
    loadAdminList();
  }
}

// ===========================
// MY INFO
// ===========================
async function saveMyInfo() {
  const name    = document.getElementById('myInfoName').value.trim();
  const email   = document.getElementById('myInfoEmail').value.trim();
  const cur_pw  = document.getElementById('myInfoCurPw').value.trim();
  const new_pw  = document.getElementById('myInfoNewPw').value.trim();
  const new_pw2 = document.getElementById('myInfoNewPw2').value.trim();

  const res = await apiPost('api/admin_mgmt.php', {
    action: 'updateMyInfo', name, email,
    current_pw: cur_pw, new_pw, new_pw2
  });
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    closeModal('myInfoModal');
    const nameEl   = document.getElementById('userNameDisplay');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl)   nameEl.textContent   = res.name;
    if (avatarEl) avatarEl.textContent = res.name.charAt(0);
    document.getElementById('myInfoCurPw').value  = '';
    document.getElementById('myInfoNewPw').value  = '';
    document.getElementById('myInfoNewPw2').value = '';
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

// ===========================
// MENU MANAGEMENT
// ===========================
async function loadMenuList() {
  const res = await apiGet('api/system.php', { action: 'menuList' });
  if (res.ok && res.data.length > 0) {
    res.data.forEach(m => { menuState[m.key] = !!m.is_active; });
  }
  renderMenuChecks();
}

async function loadSectionMgmt() {
  const res = await apiGet('api/system.php', { action: 'menuList' });
  if (res.ok && res.data.length > 0) {
    res.data.forEach(m => { menuState[m.key] = !!m.is_active; });
  }
  renderSectionChecks();
}

function renderSectionChecks() {
  const container = document.getElementById('sectionCheckList');
  if (!container) return;
  let html = '<p style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">프론트 노출 설정</p>';
  html += '<div class="checkbox-group" style="margin-bottom:0;">';
  FRONT_SECTION_LIST.forEach(m => {
    const chk = menuState[m.key] !== false ? 'checked' : '';
    html += `<div class="checkbox-item"><input type="checkbox" id="section_${m.key}" ${chk} onchange="menuState['${m.key}']=this.checked"><span>${m.label}</span></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderMenuChecks() {
  const container = document.getElementById('menuCheckList');
  if (!container) return;

  let html = '<p style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">관리자 메뉴</p>';
  html += '<div class="checkbox-group" style="margin-bottom:20px;">';
  MENU_LIST_BASE.forEach(m => {
    const chk = menuState[m.key] !== false ? 'checked' : '';
    html += `<div class="checkbox-item"><input type="checkbox" id="menu_${m.key}" ${chk} onchange="menuState['${m.key}']=this.checked"><span>${m.label}</span></div>`;
  });
  html += '</div>';

  html += '<p style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;margin-top:18px;">프론트 노출 설정</p>';
  html += '<div class="checkbox-group" style="margin-bottom:0;">';
  FRONT_SECTION_LIST.forEach(m => {
    const chk = menuState[m.key] !== false ? 'checked' : '';
    html += `<div class="checkbox-item"><input type="checkbox" id="menu_${m.key}" ${chk} onchange="menuState['${m.key}']=this.checked"><span>${m.label}</span></div>`;
  });
  html += '</div>';

  if (createdBoards.length > 0) {
    html += '<p style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">게시판 메뉴</p>';
    html += '<div class="checkbox-group">';
    createdBoards.forEach(b => {
      const chk = menuState['board_'+b.table] !== false ? 'checked' : '';
      html += `<div class="checkbox-item"><input type="checkbox" id="menu_board_${b.table}" ${chk} onchange="menuState['board_${b.table}']=this.checked"><span>${b.name} (${b.table})</span></div>`;
    });
    html += '</div>';
  }
  container.innerHTML = html;
}

async function saveMenuMgmt() {
  document.querySelectorAll('#menuCheckList input[type="checkbox"]').forEach(cb => {
    const key = cb.id.replace('menu_','');
    menuState[key] = cb.checked;
  });
  const boardItems = createdBoards.map(b => ({ key: 'board_'+b.table, label: b.name, is_active: menuState['board_'+b.table] ? 1 : 0 }));
  const items = [
    ...MENU_LIST_BASE.map(m => ({ key: m.key, label: m.label, is_active: menuState[m.key] ? 1 : 0 })),
    ...FRONT_SECTION_LIST.map(m => ({ key: m.key, label: m.label, is_active: menuState[m.key] ? 1 : 0 })),
    ...boardItems,
  ];
  const res = await apiPost('api/system.php', { action: 'menuSave', items: JSON.stringify(items) });
  if (res.ok) {
    showToast('메뉴 설정이 저장되었습니다.', 'success');
    renderSidebar();
  } else {
    showToast('저장 실패', 'error');
  }
}

async function saveSectionMgmt() {
  document.querySelectorAll('#sectionCheckList input[type="checkbox"]').forEach(cb => {
    const key = cb.id.replace('section_', '');
    menuState[key] = cb.checked;
  });
  const items = FRONT_SECTION_LIST.map(m => ({
    key: m.key,
    label: m.label,
    is_active: menuState[m.key] ? 1 : 0,
  }));
  const res = await apiPost('api/system.php', { action: 'menuSave', items: JSON.stringify(items) });
  if (res.ok) {
    showToast('섹션 설정이 저장되었습니다.', 'success');
    renderSidebar();
  } else {
    showToast('저장 실패', 'error');
  }
}

// 메뉴 상태에 따라 사이드바 항목 show/hide
function renderSidebar() {
  // 개별 서브링크 처리
  document.querySelectorAll('.nav-sub-link[data-menu-key]').forEach(el => {
    const key = el.dataset.menuKey;
    el.style.display = menuState[key] === false ? 'none' : '';
  });

  // 섹션 단위: 섹션 내 키가 모두 비활성이면 섹션 자체 숨김
  document.querySelectorAll('.nav-section[data-menu-keys]').forEach(section => {
    const keys = section.dataset.menuKeys.split(' ');
    const anyVisible = keys.some(k => menuState[k] !== false);
    section.style.display = anyVisible ? '' : 'none';
  });
}

// ===========================
// SCRIPT MANAGEMENT
// ===========================
async function loadScript() {
  const res = await apiGet('api/system.php', { action: 'scriptGet' });
  if (!res.ok) return;
  const head = document.getElementById('scriptHead');
  const body = document.getElementById('scriptBody');
  if (head) head.value = res.data.head_code || '';
  if (body) body.value = res.data.body_code || '';
}

async function saveScript() {
  const res = await apiPost('api/system.php', {
    action:    'scriptSave',
    head_code: document.getElementById('scriptHead')?.value || '',
    body_code: document.getElementById('scriptBody')?.value || '',
  });
  if (res.ok) showToast('저장되었습니다.', 'success');
  else        showToast('저장 실패', 'error');
}