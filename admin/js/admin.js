// ===========================
// DATA
// ===========================
const MENU_LIST_BASE = [
  // 시스템 관리
  { key:'adminMgmt',     label:'관리자 관리',           group:'시스템 관리' },
  { key:'menuMgmt',      label:'관리자 기능 관리',       group:'시스템 관리' },
  { key:'sectionMgmt',   label:'섹션 관리',             group:'시스템 관리' },
  { key:'scriptMgmt',    label:'스크립트 관리',          group:'시스템 관리' },
  { key:'socialMgmt',    label:'소셜 관리',             group:'시스템 관리' },
  { key:'homepageInfo',  label:'홈페이지 정보 관리',     group:'시스템 관리' },
  { key:'colorMgmt',     label:'컬러 설정',             group:'시스템 관리' },
  { key:'legalTermsMgmt',label:'법적 약관 관리',         group:'시스템 관리' },
  // 콘텐츠 관리
  { key:'banner',        label:'상단 메인 배너',         group:'콘텐츠 관리' },
  { key:'popup',         label:'팝업 관리',             group:'콘텐츠 관리' },
  // 상품 관리
  { key:'catMgmt',       label:'분류 관리',             group:'상품 관리' },
  { key:'product',       label:'제품 관리',             group:'상품 관리' },
  { key:'card',          label:'카드사 할인율 관리',      group:'상품 관리' },
  { key:'comboInquiry',  label:'결합 상담 신청 내역',    group:'상품 관리' },
  { key:'comboManager',  label:'결합 상담 담당관리자',   group:'상품 관리' },
  { key:'comboTimeslot', label:'결합 상담 가능 시간',    group:'상품 관리' },
  { key:'comboTerms',    label:'결합 상담 약관',         group:'상품 관리' },
  // 매장 관리
  { key:'kakaoApi',      label:'카카오 API 관리',        group:'매장 관리' },
  { key:'store',         label:'매장(지점) 관리',        group:'매장 관리' },
  // 게시판 관리
  { key:'boardCreate',   label:'게시판 추가',           group:'게시판 관리' },
  { key:'boardList',     label:'게시판 목록',           group:'게시판 관리' },
  // 알림톡 관리
  { key:'alimtalk',      label:'알림톡 설정',           group:'알림톡 관리' },
  // 문의 폼 관리
  { key:'customInquiryCreate', label:'문의 폼 추가',    group:'문의 폼 관리' },
  { key:'customInquiry', label:'문의 폼 목록',          group:'문의 폼 관리' },
  // 예약 폼 관리
  { key:'bkfCreate',     label:'예약 폼 추가',          group:'예약 폼 관리' },
  { key:'bkfList',       label:'예약 폼 목록',          group:'예약 폼 관리' },
  // 예약 관리
  { key:'rsvTime',       label:'예약 시간 관리',         group:'예약 관리' },
  { key:'rsvList',       label:'예약 내역',             group:'예약 관리' },
  // 챗봇 관리 (섹션 통째로 하나의 토글)
  { key:'chatbot',       label:'챗봇 관리',             group:'챗봇 관리' },
  // 로그 관리
  { key:'logMgmt',       label:'로그 조회',             group:'로그 관리' },
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
  menuMgmt:    ['시스템','관리자 기능 관리'],
  sectionMgmt: ['시스템','섹션 관리'],
  scriptMgmt:  ['시스템','스크립트 관리'],
  socialMgmt:  ['시스템','소셜 관리'],
  bannerMgmt:  ['콘텐츠','상단 메인 배너'],
  popupMgmt:   ['콘텐츠','팝업 관리'],
  catMgmt:     ['상품','분류 관리'],
  productMgmt: ['상품','제품 관리'],
  cardDiscMgmt:      ['상품','카드사 할인율 관리'],
  comboInquiryMgmt:  ['상품','결합 상담 신청 내역'],
  comboManagerMgmt:  ['상품','결합 상담 담당관리자'],
  comboTimeslotMgmt: ['상품','결합 상담 가능 시간'],
  comboTermsMgmt:    ['상품','결합 상담 약관'],
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
  legalTermsMgmt: ['시스템','법적 약관 관리'],

  homepageInfo: ['시스템','홈페이지 정보 관리'],
  colorMgmt:    ['시스템','컬러 설정'],
  logMgmt:      ['로그 관리','로그 관리'],

  customInquiryCreate: ['문의 폼','문의 폼 추가'],
  customInquiryList:   ['문의 폼','문의 폼 목록'],
  customInquiryDetail: ['문의 폼','폼 설정'],
  customInquiryData:   ['문의 폼','문의 내역'],

  bkfCreate: ['예약 폼','예약 폼 추가'],
  bkfList:   ['예약 폼','예약 폼 목록'],
  bkfDetail: ['예약 폼','폼 설정'],
  bkfRecords:['예약 폼','예약 내역'],

  alimtalkMgmt:        ['알림톡 관리','알림톡 설정'],
};

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', function() {
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
      res.data.forEach(m => { menuState[m.key] = +m.is_active !== 0; });
    }
    renderSidebar();
  });

  const _saved = localStorage.getItem('adminPage') || 'adminMgmt';
  const _savedEl = document.getElementById('page-' + _saved);
  showPage(_savedEl ? _saved : 'adminMgmt');
  loadAdminList();
  if (typeof loadBoardList === 'function') loadBoardList();
  if (typeof bkfLoadFormList === 'function') bkfLoadFormList();
  if (typeof ciLoadCustomInquirySidebar === 'function') ciLoadCustomInquirySidebar();
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

  if (!pageId.startsWith('board_')) localStorage.setItem('adminPage', pageId);

  const t = document.getElementById('page-' + pageId);
  if (t && t.classList.contains('active')) return; // 이미 활성 페이지는 리트리거 안함

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
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
  if (pageId === 'comboInquiryMgmt')  { loadComboProductFilter(); loadComboInquiryList(); }
  if (pageId === 'comboManagerMgmt')  loadComboManagerList();
  if (pageId === 'comboTimeslotMgmt') loadComboTimeslotList();
  if (pageId === 'comboTermsMgmt')    loadComboTerms();
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
  if (pageId === 'legalTermsMgmt') loadLegalTermsAdmin();

  if (pageId === 'homepageInfo') hiLoad();
  if (pageId === 'colorMgmt')   colorLoad();
  if (pageId === 'logMgmt')     initLogMgmt();

  if (pageId === 'customInquiryCreate') { /* 별도 로드 없음 */ }
  if (pageId === 'customInquiryList')   ciLoadFormList();
  if (pageId === 'alimtalkMgmt')        loadAlimtalkSettings();

  if (pageId === 'bkfCreate') { /* 별도 로드 없음 */ }
  if (pageId === 'bkfList' && typeof bkfLoadFormList === 'function') bkfLoadFormList();
  if (pageId === 'bkfDetail') { /* bkfOpenDetail()에서 직접 진입 — 여기선 skip */ }

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
    res.data.forEach(m => { menuState[m.key] = +m.is_active !== 0; });
  }
  renderMenuChecks();
}

async function loadSectionMgmt() {
  // 고정 섹션 토글 패널 제거됨 — 모든 섹션이 동적 섹션으로 통합 관리
  loadDynSectionList();
}

// ===========================
// DYNAMIC SECTIONS
// ===========================
let dynSectionList = [];

async function loadDynSectionList() {
  const res = await apiGet('api/system.php', { action: 'dynSectionList' });
  if (res.ok) {
    dynSectionList = res.data || [];
  } else {
    dynSectionList = [];
  }
  renderDynSectionList();
}

function renderDynSectionList() {
  const tbody = document.getElementById('dynSectionTbody');
  if (!tbody) return;
  if (dynSectionList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px;">등록된 섹션이 없습니다. [기본값 초기화] 버튼을 눌러 기존 섹션을 불러오세요.</td></tr>';
    return;
  }
  tbody.innerHTML = dynSectionList.map((s, idx) => {
    const isOn      = +s.is_active !== 0;
    const isMissing = !!s.file_missing;
    const sid       = String(s.id);
    const navLabel  = s.nav_label || '';
    const anchorId  = s.anchor_id || '';
    const navText   = navLabel
      ? `${escapeHtmlMgmt(navLabel)}<br><span style="color:var(--text3);font-size:.73rem;">#${escapeHtmlMgmt(anchorId)}</span>`
      : '<span style="color:var(--text3);">—</span>';
    const isFirst   = idx === 0;
    const isLast    = idx === dynSectionList.length - 1;
    const svgUp     = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,8 5.5,3.5 9,8"/></svg>`;
    const svgDown   = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,3.5 5.5,8 9,3.5"/></svg>`;
    const upBtn     = `<button class="btn btn-sm btn-ghost" style="padding:4px 8px;line-height:1;" ${isFirst ? 'disabled' : ''} onclick="reorderDynSection('${sid}','up')" title="위로 이동">${svgUp}</button>`;
    const dnBtn     = `<button class="btn btn-sm btn-ghost" style="padding:4px 8px;line-height:1;" ${isLast  ? 'disabled' : ''} onclick="reorderDynSection('${sid}','down')" title="아래로 이동">${svgDown}</button>`;

    // 노출 배지: 파일 없음 > 일반 미노출 > 노출 순으로 우선순위 구분
    const badge = isMissing
      ? `<span class="badge badge-warning" title="lib/${escapeHtmlMgmt(s.file_name)}.php 파일이 없어 프론트에 출력되지 않습니다.">파일 없음</span>`
      : (isOn
          ? '<span class="badge badge-success">노출</span>'
          : '<span class="badge badge-secondary">미노출</span>');

    // 파일 없음 시 파일명에 경고 표시
    const fileCell = isMissing
      ? `<code style="white-space:nowrap;color:var(--danger);">lib/${escapeHtmlMgmt(s.file_name)}.php</code>`
      : `<code style="white-space:nowrap;">lib/${escapeHtmlMgmt(s.file_name)}.php</code>`;

    // 파일 없음 행 배경 연하게 하이라이트
    const rowStyle = isMissing ? ' style="background:rgba(245,158,11,.06);"' : '';

    return `<tr${rowStyle}>
      <td><div class="table-actions" style="justify-content:center;gap:2px;">${upBtn}${dnBtn}</div></td>
      <td>${escapeHtmlMgmt(s.name)}</td>
      <td>${fileCell}</td>
      <td style="font-size:.82rem;">${navText}</td>
      <td style="text-align:center;">${badge}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openDynSectionModal('${sid}')">수정</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDynSection('${sid}', '${escapeAttrMgmt(s.name)}')">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openDynSectionModal(id) {
  const sec = (id !== null && id !== undefined && id !== '')
    ? dynSectionList.find(s => String(s.id) === String(id))
    : null;
  document.getElementById('dynSecModalTitle').textContent = sec ? '섹션 수정' : '섹션 추가';
  document.getElementById('dynSecId').value         = sec ? sec.id : '';
  document.getElementById('dynSecName').value       = sec ? sec.name : '';
  const fileVal = (sec ? (sec.file_name || '') : '').replace(/\.php$/i, '');
  document.getElementById('dynSecFile').value       = fileVal;
  document.getElementById('dynSecTitle').value      = sec ? (sec.title || '') : '';
  document.getElementById('dynSecSubtitle').value   = sec ? (sec.subtitle || '') : '';
  document.getElementById('dynSecNavLabel').value   = sec ? (sec.nav_label || '') : '';
  document.getElementById('dynSecAnchorId').value   = sec ? (sec.anchor_id || '') : '';
  document.getElementById('dynSecParams').value     = sec ? (sec.params || '') : '';
  document.getElementById('dynSecOrder').value      = sec ? (sec.sort_order ?? 0) : 0;
  const isActive = sec ? +sec.is_active !== 0 : true;
  document.getElementById('dynSecActive').checked   = isActive;
  document.getElementById('dynSecActiveLabel').textContent = isActive ? '노출' : '미노출';

  // 드롭다운 동기화
  const sel = document.getElementById('dynSecFileSelect');
  if (sel) {
    const opt = Array.from(sel.options).find(o => o.value === fileVal);
    sel.value = opt ? fileVal : (fileVal ? '__custom__' : '');
    _showDynSecFileGuide(fileVal);
  }

  document.getElementById('dynSectionModal').style.display = 'flex';
  document.getElementById('dynSecActive').onchange = function() {
    document.getElementById('dynSecActiveLabel').textContent = this.checked ? '노출' : '미노출';
  };
}

function closeDynSectionModal() {
  document.getElementById('dynSectionModal').style.display = 'none';
}

// 파일 드롭다운 선택 시 파일명 입력란 자동 채우기 + 가이드 표시
function onDynSecFileSelect(val) {
  if (!val || val === '__custom__') {
    if (val === '__custom__') document.getElementById('dynSecFile').value = '';
    _showDynSecFileGuide('');
    return;
  }
  document.getElementById('dynSecFile').value = val;
  _showDynSecFileGuide(val);
}

function _showDynSecFileGuide(fn) {
  const box = document.getElementById('dynSecFileGuide');
  if (!box) return;
  const guides = {
    'custom_inquiry_front': '⚠️ <strong>문의폼</strong>: 아래 <b>폼 파라미터</b>에 문의폼 테이블명을 반드시 입력하세요. (예: <code>form1</code>)<br>테이블명은 관리자 → 문의폼 관리에서 확인할 수 있습니다.<br>같은 파일을 여러 번 추가해 문의폼을 여러 개 표시할 수 있습니다.',
    'bkf_front':            '⚠️ <strong>예약폼</strong>: 아래 <b>폼 파라미터</b>에 예약폼 슬러그를 반드시 입력하세요. (예: <code>booking_00</code>)<br>슬러그는 관리자 → 예약 설정에서 확인할 수 있습니다.',
    'products':      '💡 제품 목록 섹션. 제품 데이터는 관리자 → 제품 관리에서 등록합니다.',
    'benefits':      '💡 혜택/특징 섹션.',
    'bbs_video':     '💡 유튜브 영상 섹션. 관리자 → 게시판(영상)에서 등록합니다.',
    'bbs_review':    '💡 후기 섹션. 관리자 → 게시판(후기)에서 등록합니다.',
    'bbs_event':     '💡 이벤트 섹션. 관리자 → 게시판(이벤트)에서 등록합니다.',
    'stores':        '💡 매장찾기 섹션. 관리자 → 매장 관리에서 등록합니다.',
    'bbs_notice':    '💡 공지사항 섹션.',
    'bbs_faq':       '💡 FAQ 섹션.',
    'bbs_gallery':   '💡 갤러리 섹션.',
    'bbs_photogallery':  '💡 포토갤러리 섹션.',
    'bbs_slidegallery':  '💡 슬라이드갤러리 섹션.',
  };
  const msg = guides[fn] || '';
  if (msg) {
    box.innerHTML = msg;
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}

async function saveDynSection() {
  const id       = document.getElementById('dynSecId').value;
  const name     = document.getElementById('dynSecName').value.trim();
  const fileName = document.getElementById('dynSecFile').value.trim();
  const title    = document.getElementById('dynSecTitle').value.trim();
  const subtitle = document.getElementById('dynSecSubtitle').value.trim();
  const isActive = document.getElementById('dynSecActive').checked ? 1 : 0;
  const sortOrder= parseInt(document.getElementById('dynSecOrder').value) || 0;

  if (!name)     { showToast('섹션명을 입력하세요.', 'error'); return; }
  if (!fileName) { showToast('파일명을 입력하세요.', 'error'); return; }
  // .php 확장자 포함 여부 모두 허용, 기본 이름 부분만 검사
  const fileBase = fileName.replace(/\.php$/i, '');
  if (!/^[a-zA-Z0-9_\-]+$/.test(fileBase)) {
    showToast('파일명은 영문, 숫자, _, - 만 사용 가능합니다.', 'error');
    return;
  }

  const navLabel  = document.getElementById('dynSecNavLabel').value.trim();
  const anchorId  = document.getElementById('dynSecAnchorId').value.trim();
  const params    = document.getElementById('dynSecParams').value.trim();

  const res = await apiPost('api/system.php', {
    action: 'dynSectionSave',
    id, name, file_name: fileBase, title, subtitle,
    nav_label: navLabel, anchor_id: anchorId, params,
    is_active: isActive, sort_order: sortOrder
  });
  if (res.ok) {
    showToast(id ? '수정되었습니다.' : '추가되었습니다.', 'success');
    closeDynSectionModal();
    loadDynSectionList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

async function initDynSections() {
  if (!confirm('기본 섹션(서비스 전환바·NAV·히어로배너·풋터)을 삽입합니다.\n이미 등록된 섹션(key 동일)은 변경되지 않습니다.\n계속하시겠습니까?')) return;
  const res = await apiPost('api/system.php', { action: 'dynSectionInit' });
  if (res.ok) {
    showToast('기본 섹션이 초기화되었습니다.', 'success');
    loadDynSectionList();
  } else {
    showToast(res.msg || '초기화 실패', 'error');
  }
}

async function migrateDynSections() {
  if (!confirm('DB 정리를 실행합니다.\n\n· 서비스 전환바·NAV·히어로배너·풋터 외 모든 섹션 비활성화\n· 풋터 중복 행 제거\n· 코어 섹션 순서 고정\n\n기존에 추가한 섹션이 비활성화됩니다.\n계속하시겠습니까?')) return;
  const res = await apiPost('api/system.php', { action: 'dynSectionMigrate' });
  if (res.ok) {
    showToast(res.msg || 'DB 정리 완료', 'success');
    loadDynSectionList();
  } else {
    showToast(res.msg || 'DB 정리 실패', 'error');
  }
}

async function reorderDynSection(id, direction) {
  const res = await apiPost('api/system.php', { action: 'dynSectionReorder', id, direction });
  if (res.ok) {
    loadDynSectionList();
  } else {
    showToast(res.msg || '순서 변경 실패', 'error');
  }
}

async function deleteDynSection(id, name) {
  if (!confirm(`"${name}" 섹션을 삭제하시겠습니까?`)) return;
  const res = await apiPost('api/system.php', { action: 'dynSectionDelete', id });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    loadDynSectionList();
  } else {
    showToast(res.msg || '삭제 실패', 'error');
  }
}

function escapeHtmlMgmt(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttrMgmt(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function refreshMgmtToggleRow(input) {
  const row = input.closest('.mgmt-toggle-row');
  if (!row) return;
  const on = input.checked;
  row.classList.toggle('is-on', on);
  row.classList.toggle('is-off', !on);
  const pill = row.querySelector('.mgmt-visibility-pill');
  if (pill) pill.textContent = on ? '노출' : '미노출';
}

function wireMgmtToggleInputs(container) {
  if (!container) return;
  container.querySelectorAll('input[type="checkbox"][data-state-key]').forEach(el => {
    el.addEventListener('change', function () {
      menuState[this.dataset.stateKey] = this.checked;
      refreshMgmtToggleRow(this);
    });
  });
}

function renderMgmtToggleRow(id, stateKey, label, note) {
  const checked = menuState[stateKey] !== false;
  const chk = checked ? 'checked' : '';
  const rowCls = checked ? 'is-on' : 'is-off';
  const pill = checked ? '노출' : '미노출';
  const noteHtml = note
    ? `<span class="mgmt-toggle-row__note">${escapeHtmlMgmt(note)}</span>`
    : '';
  return `<div class="mgmt-toggle-row ${rowCls}">
    <div class="mgmt-toggle-row__info">
      <span class="mgmt-toggle-row__title">${escapeHtmlMgmt(label)}</span>
      ${noteHtml}
    </div>
    <div class="mgmt-toggle-row__actions">
      <span class="mgmt-visibility-pill">${pill}</span>
      <label class="toggle">
        <input type="checkbox" id="${escapeHtmlMgmt(id)}" data-state-key="${escapeAttrMgmt(stateKey)}" ${chk}>
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>`;
}

function renderMgmtPanel(title, desc, rowsHtml) {
  const descHtml = desc
    ? `<p class="mgmt-panel__desc">${escapeHtmlMgmt(desc)}</p>`
    : '';
  return `<section class="mgmt-panel">
    <header class="mgmt-panel__head">
      <h3 class="mgmt-panel__title">${escapeHtmlMgmt(title)}</h3>
      ${descHtml}
    </header>
    <div class="mgmt-toggle-list">${rowsHtml}</div>
  </section>`;
}

function renderSectionChecks() {
  const container = document.getElementById('sectionCheckList');
  if (!container) return;
  const frontRows = FRONT_SECTION_LIST.map(m =>
    renderMgmtToggleRow(`section_${m.key}`, m.key, m.label, m.key)
  ).join('');
  container.innerHTML =
    '<div class="mgmt-stack">' +
    renderMgmtPanel(
      '메인 화면 섹션',
      '홈에 표시할 단락을 켜거나 끕니다. 키 이름은 시스템 식별용으로만 표시됩니다.',
      frontRows
    ) +
    '</div>';
  wireMgmtToggleInputs(container);
}

function renderMenuChecks() {
  const container = document.getElementById('menuCheckList');
  if (!container) return;

  // 그룹별 안내 문구
  const GROUP_DESC = {
    '시스템 관리':  '핵심 관리 기능입니다. 필요한 항목만 노출하세요.',
    '콘텐츠 관리':  '배너·팝업 등 콘텐츠 관련 메뉴입니다.',
    '상품 관리':    '제품·카테고리·결합상담 관련 메뉴입니다.',
    '매장 관리':    '매장 지점 및 카카오 API 관련 메뉴입니다.',
    '게시판 관리':  '게시판 추가·목록 메뉴입니다. 게시판별 사용 여부는 각 게시판 설정 페이지에서 별도로 관리합니다.',
    '알림톡 관리':  '알림톡 발송 설정 메뉴입니다.',
    '문의 폼 관리': '문의 폼 메뉴입니다. 개별 폼의 사용 여부는 문의 폼 목록의 각 폼 설정에서 별도로 관리합니다.',
    '예약 폼 관리': '예약 폼 메뉴입니다. 개별 폼의 사용 여부는 예약 폼 목록의 각 폼 설정에서 별도로 관리합니다.',
    '예약 관리':    '예약 시간 및 예약 내역 관리 메뉴입니다.',
    '챗봇 관리':    '챗봇 전체 기능(지식베이스·컨텍스트·빠른질문·봇 설정)을 한번에 노출하거나 숨깁니다.',
    '로그 관리':    '관리자 활동 로그 조회 메뉴입니다.',
  };

  // 그룹별로 묶기
  const groups = {};
  MENU_LIST_BASE.forEach(m => {
    const g = m.group || '기타';
    if (!groups[g]) groups[g] = [];
    groups[g].push(m);
  });

  let html = '<div class="mgmt-stack">';
  Object.entries(groups).forEach(([groupName, items]) => {
    const rows = items.map(m =>
      renderMgmtToggleRow(`menu_${m.key}`, m.key, m.label, null)
    ).join('');
    html += renderMgmtPanel(groupName, GROUP_DESC[groupName] || null, rows);
  });
  html += '</div>';
  container.innerHTML = html;
  wireMgmtToggleInputs(container);
}

async function saveMenuMgmt() {
  document.querySelectorAll('#menuCheckList input[type="checkbox"]').forEach(cb => {
    const key = cb.id.replace('menu_','');
    menuState[key] = cb.checked;
  });
  const items = MENU_LIST_BASE.map(m => ({ key: m.key, label: m.label, is_active: menuState[m.key] ? 1 : 0 }));
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