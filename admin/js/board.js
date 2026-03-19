/* ===========================
   board.js  — DB 연동 버전
   ※ BOARD_FIELDS_OPTIONAL, BOARD_FIELDS_REQUIRED,
     AUTO_FIELDS, COMMENT_FIELDS 는 admin.js에서 선언
   =========================== */

// ===========================
// 게시판 생성 — 필드 체크박스 렌더
// ===========================
function renderBoardFields() {
  const c = document.getElementById('boardFieldCheck');
  if (!c) return;
  c.innerHTML = BOARD_FIELDS_OPTIONAL.map((f, i) => {
    let badge = '';
    if (f.type === 'auto')    badge = `<span style="font-size:.7rem;color:var(--text-muted);margin-left:4px;">(자동 입력)</span>`;
    if (f.type === 'comment') badge = `<span style="font-size:.7rem;color:var(--text-muted);margin-left:4px;">(상세 화면 전용)</span>`;
    return `<div class="checkbox-item">
      <input type="checkbox" id="bf_${i}" data-field-key="${f.key}">
      <span>${f.label}${badge}</span>
    </div>`;
  }).join('');
}

// ===========================
// 게시판 생성 → DB 저장
// ===========================
async function createBoard() {
  const name  = document.getElementById('newBoardName').value.trim();
  const table = document.getElementById('newBoardTable').value.trim();
  if (!name || !table) { showToast('게시판 이름과 테이블명을 입력하세요.', 'error'); return; }
  if (!/^[a-z0-9_]+$/.test(table)) { showToast('테이블명은 영문 소문자·숫자·언더스코어만 가능합니다.', 'error'); return; }

  const selectedKeys = [...document.querySelectorAll('#boardFieldCheck input:checked')]
    .map(cb => cb.dataset.fieldKey);

  const res = await apiPost('api/board.php', {
    action: 'boardCreate', name, table_name: table,
    fields: JSON.stringify(buildBoardFieldDefs(selectedKeys)),
    selected_keys: JSON.stringify(selectedKeys)
  });
  if (!res.ok) { showToast(res.msg || '생성 실패', 'error'); return; }

  document.getElementById('newBoardName').value  = '';
  document.getElementById('newBoardTable').value = '';
  document.querySelectorAll('#boardFieldCheck input').forEach(cb => cb.checked = false);

  showToast(`"${name}" 게시판이 생성되었습니다.`, 'success');
  await loadBoardList();
}

function buildBoardFieldDefs(selectedKeys) {
  const required = BOARD_FIELDS_REQUIRED.map(label => ({
    key: label, label, type: label === '내용' ? 'textarea' : 'text', required: true, enabled: true
  }));
  const optional = selectedKeys.map(key => {
    const def = BOARD_FIELDS_OPTIONAL.find(f => f.key === key);
    return def ? { key: def.key, label: def.label, type: def.type, required: false, enabled: true } : null;
  }).filter(Boolean);
  return [...required, ...optional];
}

// ===========================
// 게시판 목록 로드 + 렌더
// ===========================
// use_* 컬럼 → 선택 필드 키 배열로 변환
function useColsToSelectedKeys(row) {
  const map = {
    use_category:  '분류',
    use_comment:   '댓글',
    use_file:      '첨부파일',
    use_thumbnail: '썸네일이미지',
    use_tags:      '태그',
    use_social:    '소셜',
  };
  return Object.entries(map)
    .filter(([col]) => parseInt(row[col]) === 1)
    .map(([, key]) => key);
}

async function loadBoardList() {
  const res = await apiGet('api/board.php', { action: 'boardList' });
  if (!res.ok) {
    showToast('게시판 목록 오류: ' + (res.msg || '알 수 없는 오류'), 'error');
    return;
  }

  res.data.forEach(row => {
    const existing = createdBoards.find(b => b.table === row.table_name);
    // fields_json이 있으면 그걸로, 없으면 use_* 컬럼으로 복원
    let fields;
    if (row.fields_json) {
      try { fields = JSON.parse(row.fields_json); } catch(e) { fields = null; }
    }
    if (!fields || !fields.length) {
      fields = buildBoardFieldDefs(useColsToSelectedKeys(row));
    }
    if (!existing) {
      createdBoards.push({
        id: row.id, name: row.name, table: row.table_name,
        fields, categories: [], posts: [], createdAt: row.created_at
      });
    } else {
      existing.id     = row.id;
      existing.name   = row.name;
      existing.fields = fields;
    }
  });
  const dbTables = res.data.map(r => r.table_name);
  createdBoards.splice(0, createdBoards.length, ...createdBoards.filter(b => dbTables.includes(b.table)));

  renderBoardList();
  createdBoards.forEach(b => { addBoardToNav(b); addBoardToMenuMgmt(b); });
}

function renderBoardList() {
  const area = document.getElementById('boardListArea');
  if (!area) return;
  if (!createdBoards.length) {
    area.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>생성된 게시판이 없습니다.</p></div>';
    return;
  }
  area.innerHTML = `
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>#</th><th>게시판 이름</th><th>테이블명</th><th>생성일</th><th>관리</th></tr></thead>
      <tbody>${createdBoards.map((b, i) => `
        <tr>
          <td class="row-num">${i + 1}</td>
          <td><strong>${b.name}</strong></td>
          <td><code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:.78rem;">${b.table}</code></td>
          <td>${b.createdAt || ''}</td>
          <td><div class="table-actions">
            <button class="btn btn-sm btn-outline" onclick="showBoardPage(getBoardByTable('${b.table}'))">게시물 관리</button>
            <button class="btn btn-sm btn-danger"  onclick="deleteBoard('${b.table}')">삭제</button>
          </div></td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function addBoardToNav(board) {
  const sub = document.getElementById('boardNavSub');
  if (!sub || sub.querySelector(`[data-board="${board.table}"]`)) return;
  const link = document.createElement('div');
  link.className = 'nav-sub-link';
  link.dataset.board = board.table;
  link._pageId = 'board_' + board.table;
  link.textContent = board.name;
  link.onclick = () => showBoardPage(board);
  sub.appendChild(link);
}

function addBoardToMenuMgmt(board) {
  menuState['board_' + board.table] = true;
  if (typeof renderMenuChecks === 'function') renderMenuChecks();
}

// ===========================
// 게시판 페이지 (탭: 게시물 / 분류 / 필드)
// ===========================
function getBoardByTable(tableKey) {
  return createdBoards.find(b => b.table === tableKey);
}

async function showBoardPage(board) {
  const pid = 'board_' + board.table;

  // page div가 없으면 생성
  if (!document.getElementById('page-' + pid)) {
    const mc = document.querySelector('.main-content') || document.querySelector('main');
    if (!mc) { showToast('레이아웃 오류: main-content를 찾을 수 없습니다.', 'error'); return; }
    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-' + pid;
    mc.appendChild(page);
    PAGE_LABELS[pid] = ['게시판', board.name];
  }

  // 데이터 로드 + 렌더
  await loadBoardPostsAndRender(board, 'posts');

  // showPage 직접 처리 (active 클래스 + 브레드크럼)
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pid);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-sub-link').forEach(l => {
    l.classList.remove('active');
    if (l._pageId === pid || l.dataset.board === board.table) {
      l.classList.add('active');
      const sub = l.closest('.nav-sub');
      if (sub) { sub.classList.add('open'); sub.previousElementSibling?.classList.add('open'); }
    }
  });

  const lb = PAGE_LABELS[pid] || ['게시판', board.name];
  const bc1 = document.getElementById('breadcrumb1');
  const bc2 = document.getElementById('breadcrumb2');
  if (bc1) bc1.textContent = lb[0];
  if (bc2) bc2.textContent = lb[1];
}

async function loadBoardPostsAndRender(board, activeTab) {
  if (activeTab === 'posts') {
    const res = await apiGet('api/board.php', { action: 'postList', table: board.table });
    if (res.ok) board.posts = res.data;
    else showToast('게시물 로드 오류: ' + (res.msg || '알 수 없는 오류'), 'error');
  }
  if (activeTab === 'cats') {
    if (board.id) {
      const res = await apiGet('api/board.php', { action: 'catList', board_id: board.id });
      if (res.ok) board.categories = res.data;
      else showToast('분류 로드 오류: ' + (res.msg || '알 수 없는 오류'), 'error');
    }
  }
  renderBoardPageContent(board, activeTab);
}

function renderBoardPageContent(board, activeTab) {
  activeTab = activeTab || 'posts';
  const pid  = 'board_' + board.table;
  const page = document.getElementById('page-' + pid);
  if (!page) return;
  board.posts      = board.posts      || [];
  board.categories = board.categories || [];

  const tabBar = `
    <div style="display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:20px;">
      ${[['posts','📋 게시물 목록'],['cats','🏷️ 분류 관리'],['fields','⚙️ 필드 관리']].map(([key, label]) => `
        <button class="board-tab-btn ${activeTab===key?'active':''}"
          onclick="loadBoardPostsAndRender(getBoardByTable('${board.table}'),'${key}')">
          ${label}
        </button>`).join('')}
    </div>`;

  let content = '';
  if      (activeTab === 'posts')  content = renderBoardPostsTab(board);
  else if (activeTab === 'cats')   content = renderBoardCatsTab(board);
  else if (activeTab === 'fields') content = renderBoardFieldsTab(board);

  page.innerHTML = `
    <div class="page-header">
      <div><h2>${board.name}</h2><p>테이블: ${board.table} · 총 ${board.posts.length}개 게시물</p></div>
      ${activeTab === 'posts' ? `<button class="btn btn-primary" onclick="openBoardWriteModal('${board.table}')">➕ 글 작성</button>` : ''}
    </div>
    ${tabBar}${content}`;
}

// ===========================
// 탭 1 — 게시물 목록
// ===========================
function boardHasField(board, key) {
  return board.fields.some(f => f.key === key && f.enabled !== false);
}

function getPeriodStatus(periodVal) {
  if (!periodVal || !periodVal.includes('~')) return null;
  const [s, e] = periodVal.split('~').map(v => v.trim());
  const now   = new Date(); now.setHours(0,0,0,0);
  const start = s ? new Date(s) : null;
  const end   = e ? new Date(e) : null;
  if (start && now < start) return { label:'진행예정', style:'background:#e0f2fe;color:#0369a1;' };
  if (end   && now > end)   return { label:'종료',    style:'background:#f1f5f9;color:#64748b;' };
  return                           { label:'진행중',   style:'background:#dcfce7;color:#15803d;' };
}

function renderBoardPostsTab(board) {
  const hasCat    = boardHasField(board, '분류');
  const hasPeriod = boardHasField(board, '기간');
  const catOpts   = hasCat
    ? (board.categories||[]).filter(c => c.is_active !== 0)
        .map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('')
    : '';

  const filterHtml = `
    <div class="table-filters" style="margin-bottom:16px;">
      ${hasCat ? `<select class="form-control" id="boardCatFilter_${board.table}">
        <option value="">전체 분류</option>${catOpts}
      </select>` : ''}
      <select class="form-control" id="boardSearchField_${board.table}" style="width:130px;">
        <option value="">전체</option>
        <option value="title">제목</option>
        <option value="author">작성자</option>
      </select>
      <input type="text" class="form-control" id="boardSearchKw_${board.table}" placeholder="검색어 입력"
        onkeydown="if(event.key==='Enter')boardSearch('${board.table}')"/>
      <button class="btn btn-outline" onclick="boardSearch('${board.table}')">🔍 검색</button>
      <button class="btn btn-ghost"   onclick="boardSearchReset('${board.table}')">초기화</button>
    </div>`;

  const thCat    = hasCat    ? '<th>분류</th>'   : '';
  const thPeriod = hasPeriod ? '<th>기간</th><th>상태</th>' : '';

  return `
    <div class="card"><div class="card-body">
      ${filterHtml}
      <div class="bulk-bar" id="boardBulk_${board.table}">
        <span>선택 <span class="bulk-count">0</span>건</span>
        <button class="btn btn-sm btn-danger" onclick="boardBulkDelete('${board.table}')">선택 삭제</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>☑</th><th>#</th><th>제목</th>${thCat}<th>작성자</th><th>조회수</th>${thPeriod}<th>작성일시</th><th>관리</th></tr></thead>
          <tbody id="boardBody_${board.table}">${renderBoardRows(board, board.posts)}</tbody>
        </table>
      </div>
    </div></div>`;
}

function renderBoardRows(board, posts) {
  const hasCat    = boardHasField(board, '분류');
  const hasPeriod = boardHasField(board, '기간');
  const colspan   = 7 + (hasCat ? 1 : 0) + (hasPeriod ? 2 : 0);

  if (!posts || !posts.length) {
    return `<tr><td colspan="${colspan}" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 게시물이 없습니다.</td></tr>`;
  }
  return posts.map((p, i) => {
    const extra = p.extra || {};
    const catCell = hasCat
      ? `<td>${p.cat_name ? `<span class="badge badge-secondary">${escHtml(p.cat_name)}</span>` : '—'}</td>`
      : '';
    let periodCell = '';
    if (hasPeriod) {
      const pv = extra['기간'] || '';
      const st = getPeriodStatus(pv);
      periodCell = `<td style="white-space:nowrap;font-size:.82rem;">${escHtml(pv)||'—'}</td>
        <td>${st ? `<span class="status-badge" style="${st.style}">${st.label}</span>` : '—'}</td>`;
    }
    return `
    <tr>
      <td><input type="checkbox" class="row-check" data-post-id="${p.id}" onchange="updateBulkBar('boardBulk_${board.table}')"></td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${escHtml(p.title)}</strong>${p.is_notice ? ' <span class="badge badge-danger" style="font-size:.7rem;">공지</span>' : ''}</td>
      ${catCell}
      <td>${escHtml(p.author)}</td>
      <td>${p.views}</td>
      ${periodCell}
      <td>${p.created_at}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openBoardDetailModal('${board.table}',${p.id})">상세</button>
        <button class="btn btn-sm btn-outline" onclick="openBoardWriteModal('${board.table}',${p.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteBoardPost('${board.table}',${p.id})">삭제</button>
      </div></td>
    </tr>`;
  }).join('');
}

async function boardSearch(tableKey) {
  const board   = getBoardByTable(tableKey);
  if (!board) return;
  const field   = document.getElementById('boardSearchField_' + tableKey)?.value || '';
  const kw      = document.getElementById('boardSearchKw_'    + tableKey)?.value || '';
  const cat_id  = document.getElementById('boardCatFilter_'   + tableKey)?.value || '';
  const params  = { action: 'postList', table: tableKey };
  if (field)  params.field  = field;
  if (kw)     params.kw     = kw;
  if (cat_id) params.cat_id = cat_id;
  const res = await apiGet('api/board.php', params);
  if (res.ok) {
    board.posts = res.data;
    const tbody = document.getElementById('boardBody_' + tableKey);
    if (tbody) tbody.innerHTML = renderBoardRows(board, board.posts);
  }
}

function boardSearchReset(tableKey) {
  ['boardSearchKw_','boardCatFilter_'].forEach(prefix => {
    const el = document.getElementById(prefix + tableKey);
    if (el) el.value = '';
  });
  const fieldEl = document.getElementById('boardSearchField_' + tableKey);
  if (fieldEl) fieldEl.value = '';
  boardSearch(tableKey);
}

// ===========================
// 탭 2 — 분류 관리
// ===========================
function renderBoardCatsTab(board) {
  const rows = (board.categories||[]).length
    ? board.categories.map((cat) => `
        <tr>
          <td>${escHtml(cat.name)}</td>
          <td><span class="status-badge ${cat.is_active!==0?'status-사용':'status-미사용'}">${cat.is_active!==0?'사용':'미사용'}</span></td>
          <td><div class="table-actions">
            <button class="btn btn-sm btn-outline" onclick="editBoardCat('${board.table}',${cat.id})">수정</button>
            <button class="btn btn-sm btn-outline" onclick="toggleBoardCat('${board.table}',${cat.id})">${cat.is_active!==0?'미사용으로':'사용으로'}</button>
            <button class="btn btn-sm btn-danger"  onclick="deleteBoardCat('${board.table}',${cat.id})">삭제</button>
          </div></td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:24px;">등록된 분류가 없습니다.</td></tr>`;
  return `
    <div class="card"><div class="card-body">
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <input type="text" class="form-control" id="boardCatInput_${board.table}" placeholder="분류명 입력" style="max-width:240px;"
          onkeydown="if(event.key==='Enter')addBoardCat('${board.table}')"/>
        <button class="btn btn-primary" onclick="addBoardCat('${board.table}')">➕ 분류 추가</button>
      </div>
      <div class="table-wrap"><table class="admin-table">
        <thead><tr><th>분류명</th><th>상태</th><th>관리</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div></div>`;
}

async function addBoardCat(tableKey) {
  const board = getBoardByTable(tableKey);
  if (!board || !board.id) return;
  const input = document.getElementById('boardCatInput_' + tableKey);
  const name  = input ? input.value.trim() : '';
  if (!name) { showToast('분류명을 입력하세요.', 'error'); return; }
  const res = await apiPost('api/board.php', { action: 'catCreate', board_id: board.id, name });
  if (res.ok) {
    if (input) input.value = '';
    showToast('분류가 추가되었습니다.', 'success');
    await loadBoardPostsAndRender(board, 'cats');
  } else showToast(res.msg || '추가 실패', 'error');
}

async function editBoardCat(tableKey, catId) {
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const cat = board.categories.find(c => c.id == catId);
  if (!cat) return;
  const newName = prompt('분류명 수정:', cat.name);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) { showToast('분류명을 입력하세요.', 'error'); return; }
  const res = await apiPost('api/board.php', { action: 'catUpdate', id: catId, name: trimmed });
  if (res.ok) {
    showToast('수정되었습니다.', 'success');
    await loadBoardPostsAndRender(board, 'cats');
  } else showToast(res.msg || '수정 실패', 'error');
}

async function toggleBoardCat(tableKey, catId) {
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const res = await apiPost('api/board.php', { action: 'catToggle', id: catId });
  if (res.ok) {
    showToast('변경되었습니다.', 'success');
    await loadBoardPostsAndRender(board, 'cats');
  }
}

async function deleteBoardCat(tableKey, catId) {
  if (!confirm('분류를 삭제하시겠습니까?')) return;
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const res = await apiPost('api/board.php', { action: 'catDelete', id: catId });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    await loadBoardPostsAndRender(board, 'cats');
  }
}

// ===========================
// 탭 3 — 필드 관리
// ===========================
function renderBoardFieldsTab(board) {
  const existingKeys  = board.fields.map(f => f.key);
  const addableFields = BOARD_FIELDS_OPTIONAL.filter(f => !existingKeys.includes(f.key));
  const rows = board.fields.map((f, i) => `
    <tr>
      <td class="row-num">${i+1}</td>
      <td>${escHtml(f.label)}${f.required?'<span class="badge badge-secondary" style="margin-left:4px;font-size:.7rem;">필수</span>':''}</td>
      <td><code style="font-size:.75rem;background:var(--bg);padding:2px 6px;border-radius:3px;">${f.type}</code></td>
      <td><span class="status-badge ${f.enabled!==false?'status-사용':'status-미사용'}">${f.enabled!==false?'사용':'미사용'}</span></td>
      <td>${!f.required
        ? `<button class="btn btn-sm btn-outline" onclick="toggleBoardField('${board.table}',${i})">${f.enabled!==false?'미사용으로':'사용으로'}</button>`
        : `<span style="font-size:.75rem;color:var(--text-muted);">변경 불가</span>`}</td>
    </tr>`).join('');
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="card"><div class="card-body">
        <p style="font-weight:700;font-size:.9rem;margin-bottom:8px;">필드 추가</p>
        <p style="font-size:.82rem;color:#f59e0b;margin-bottom:12px;">⚠️ 한 번 추가된 필드는 <strong>삭제할 수 없으며</strong>, 미사용으로만 변경 가능합니다.</p>
        ${addableFields.length > 0
          ? `<div style="display:flex;gap:8px;align-items:center;">
               <select class="form-control" id="boardFieldAdd_${board.table}" style="max-width:260px;">
                 ${addableFields.map(f => `<option value="${f.key}">${f.label}</option>`).join('')}
               </select>
               <button class="btn btn-primary" onclick="addBoardField('${board.table}')">➕ 필드 추가</button>
             </div>`
          : `<p style="color:var(--text-muted);font-size:.85rem;">추가 가능한 필드가 없습니다.</p>`}
      </div></div>
      <div class="card"><div class="card-body">
        <div class="table-wrap"><table class="admin-table">
          <thead><tr><th>⠿</th><th>#</th><th>필드명</th><th>종류</th><th>Placeholder / 항목</th><th>사용여부</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div></div>
    </div>`;
}

function toggleBoardField(tableKey, idx) {
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const field = board.fields[idx];
  if (!field || field.required) return;
  field.enabled = (field.enabled === false) ? true : false;
  saveBoardFields(board);
  renderBoardPageContent(board, 'fields');
  showToast(`"${field.label}" 필드가 ${field.enabled?'사용':'미사용'}으로 변경되었습니다.`, 'success');
}

function addBoardField(tableKey) {
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const sel = document.getElementById('boardFieldAdd_' + tableKey);
  if (!sel || !sel.value) return;
  const key = sel.value;
  if (board.fields.find(f => f.key === key)) { showToast('이미 추가된 필드입니다.', 'error'); return; }
  const def = BOARD_FIELDS_OPTIONAL.find(f => f.key === key);
  if (!def) return;
  board.fields.push({ key: def.key, label: def.label, type: def.type, required: false, enabled: true });
  saveBoardFields(board);
  renderBoardPageContent(board, 'fields');
  showToast(`"${def.label}" 필드가 추가되었습니다.`, 'success');
}

// 필드 정보를 DB에 저장
async function saveBoardFields(board) {
  if (!board.id) return;
  const selectedKeys = board.fields
    .filter(f => !f.required && f.enabled !== false)
    .map(f => f.key);
  await apiPost('api/board.php', {
    action:        'boardFieldsUpdate',
    id:            board.id,
    fields:        JSON.stringify(board.fields),
    selected_keys: JSON.stringify(selectedKeys),
  });
}

// ===========================
// 글 작성 / 수정 모달
// ===========================
async function openBoardWriteModal(tableKey, postId) {
  const board = getBoardByTable(tableKey);
  if (!board) return;

  // 분류 필드가 있으면 항상 최신 분류 로드
  if (boardHasField(board, '분류') && board.id) {
    const res = await apiGet('api/board.php', { action: 'catList', board_id: board.id });
    if (res.ok) board.categories = res.data;
  }

  const old = document.getElementById('boardWriteModal_' + tableKey);
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'boardWriteModal_' + tableKey;
  modal.innerHTML = buildBoardWriteModalHTML(board);
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  const isEdit = postId != null;
  modal.querySelector('.modal-header h3').textContent = isEdit ? `${board.name} - 수정` : `${board.name} - 글 작성`;
  modal.dataset.postId = isEdit ? postId : '';

  if (isEdit) {
    // 항상 API에서 최신 데이터 로드
    const res = await apiGet('api/board.php', { action: 'postGet', table: tableKey, id: postId });
    if (res.ok) {
      populateBoardWriteModal(modal, board, res.data);
    } else {
      showToast(res.msg || '게시물 로드 실패', 'error');
    }
  }
  modal.classList.add('open');
}

function buildBoardWriteModalHTML(board) {
  const writeFields = board.fields.filter(f =>
    f.enabled !== false
    && !AUTO_FIELDS.includes(f.key)
    && !COMMENT_FIELDS.includes(f.key)
    && !['제목','내용','작성자','분류','작성일시','수정일시','조회수'].includes(f.key)
  );

  const hasCat = boardHasField(board, '분류');
  const catOpts = hasCat
    ? (board.categories||[]).filter(c => c.is_active !== 0)
        .map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('')
    : '';
  const catField = hasCat ? `
    <div class="form-group" style="margin-bottom:14px;">
      <label>분류</label>
      <select class="form-control" data-field="분류">
        <option value="">-- 분류 선택 --</option>${catOpts}
      </select>
      ${(board.categories||[]).filter(c=>c.is_active!==0).length===0
        ? `<p style="font-size:.78rem;color:#f59e0b;margin-top:4px;">⚠️ 분류 탭에서 분류를 먼저 등록하세요.</p>`
        : ''}
    </div>` : '';

  // 오늘 날짜/시각 기본값
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const todayDt = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return `
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>${board.name} - 글 작성</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('open')">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
          <label style="font-size:.83rem;font-weight:600;">공지 여부</label>
          <label class="toggle"><input type="checkbox" id="boardIsNotice_${board.table}"><span class="toggle-slider"></span></label>
          <span style="font-size:.83rem;color:var(--text-muted);">체크 시 목록 상단 고정</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <!-- 제목 (필수, 전체 너비) -->
          <div class="form-group" style="margin-bottom:14px;grid-column:span 2;">
            <label>제목 <span class="req">*</span></label>
            <input type="text" class="form-control" data-field="제목" placeholder="제목 입력"/>
          </div>
          <!-- 분류 (있을 때만) -->
          ${catField}
          <!-- 작성자 -->
          <div class="form-group" style="margin-bottom:14px;">
            <label>작성자</label>
            <input type="text" class="form-control" data-field="작성자" value="${escHtml(typeof currentAdminName !== 'undefined' ? currentAdminName : '관리자')}"/>
          </div>
          <!-- 작성일시 -->
          <div class="form-group" style="margin-bottom:14px;">
            <label>작성일시</label>
            <input type="datetime-local" class="form-control" data-field="작성일시" value="${todayDt}"/>
          </div>
          <!-- 내용 (필수, 전체 너비) -->
          <div class="form-group" style="margin-bottom:14px;grid-column:span 2;">
            <label>내용 <span class="req">*</span></label>
            <textarea class="form-control" data-field="내용" rows="8" placeholder="내용 입력"></textarea>
          </div>
          <!-- 선택 필드들 -->
          ${writeFields.map(f => buildFieldFormGroup(f, board, '')).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').classList.remove('open')">취소</button>
        <button class="btn btn-primary" onclick="saveBoardPost('${board.table}')">저장</button>
      </div>
    </div>`;
}

function buildFieldFormGroup(field, board, postValue) {
  const WIDE = new Set(['textarea','period','files','images','youtube']);
  const isWide = WIDE.has(field.type) || field.key === '내용';
  const span   = isWide ? 'grid-column:span 2;' : '';
  const req    = field.required ? '<span class="req">*</span>' : '';
  const val    = postValue || '';
  let   html   = '';

  switch (field.type) {
    case 'textarea':
      html = `<textarea class="form-control" data-field="${field.key}" rows="8" placeholder="${escHtml(field.label)} 입력">${escHtml(val)}</textarea>`;
      break;
    case 'category': {
      const cats = (board.categories||[]).filter(c => c.is_active !== 0);
      const opts = cats.map(c => `<option value="${c.id}" ${val==c.id?'selected':''}>${escHtml(c.name)}</option>`).join('');
      html = `<select class="form-control" data-field="${field.key}">
        <option value="">-- 분류 선택 --</option>${opts}
      </select>${cats.length===0?`<p style="font-size:.78rem;color:#f59e0b;margin-top:4px;">⚠️ 분류 탭에서 분류를 먼저 등록하세요.</p>`:''}`;
      break;
    }
    case 'rating': {
      const rv = parseInt(val)||0;
      html = `<div class="star-rating-wrap" data-field="${field.key}" style="display:flex;align-items:center;gap:4px;">
        ${[1,2,3,4,5].map(n=>`<button type="button" onclick="setRating(this,'${field.key}',${n})" data-val="${n}"
          style="font-size:1.6rem;background:none;border:none;cursor:pointer;padding:0 2px;color:${n<=rv?'#f59e0b':'#d1d5db'};">★</button>`).join('')}
        <span class="star-label" style="margin-left:8px;font-size:.85rem;color:var(--text-secondary);">${rv}점</span>
        <button type="button" onclick="setRating(this,'${field.key}',0)" style="font-size:.75rem;color:var(--text-muted);background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:2px 8px;cursor:pointer;margin-left:6px;">초기화</button>
      </div>
      <input type="hidden" data-field="${field.key}_hidden" value="${rv}"/>`;
      break;
    }
    case 'period': {
      let sv='', ev='';
      if (val && val.includes('~')) { [sv,ev] = val.split('~').map(s=>s.trim()); }
      html = `<div style="display:flex;align-items:center;gap:10px;">
        <input type="date" class="form-control" data-field="${field.key}_start" value="${sv}" style="flex:1;"/>
        <span style="color:var(--text-muted);font-weight:700;">~</span>
        <input type="date" class="form-control" data-field="${field.key}_end" value="${ev}" style="flex:1;"/>
      </div>
      <input type="hidden" data-field="${field.key}" value="${escHtml(val)}"/>`;
      break;
    }
    case 'image': {
      const uid = `fi_${field.key}_${board.table}`;
      html = `<div class="upload-area" style="cursor:pointer;" onclick="document.getElementById('${uid}').click()">
        <div class="upload-icon">🖼️</div><p><strong>클릭하여 이미지 업로드</strong></p>
      </div>
      <input type="file" id="${uid}" data-field="${field.key}" accept="image/*" style="display:none"
        onchange="previewSingleImage(this,'prev_${uid}')"/>
      <div id="prev_${uid}" style="margin-top:6px;"></div>`;
      break;
    }
    case 'images': {
      const uid = `fi_${field.key}_${board.table}`;
      html = `<div class="upload-area" style="cursor:pointer;" onclick="document.getElementById('${uid}').click()">
        <div class="upload-icon">📸</div><p><strong>여러 이미지 업로드</strong></p>
      </div>
      <input type="file" id="${uid}" data-field="${field.key}" accept="image/*" multiple style="display:none"
        onchange="handleMultiImagePreview(this,'multi_${uid}')"/>
      <div class="image-preview-grid" id="multi_${uid}" style="margin-top:6px;"></div>`;
      break;
    }
    case 'files': {
      const uid = `fi_${field.key}_${board.table}`;
      html = `<div class="upload-area" style="cursor:pointer;" onclick="document.getElementById('${uid}').click()">
        <div class="upload-icon">📎</div><p><strong>파일 첨부</strong></p>
      </div>
      <input type="file" id="${uid}" data-field="${field.key}" multiple style="display:none"
        onchange="previewFileList(this,'flist_${uid}')"/>
      <div id="flist_${uid}" style="margin-top:6px;"></div>`;
      break;
    }
    default:
      html = `<input type="text" class="form-control" data-field="${field.key}"
        placeholder="${escHtml(field.label)} 입력" value="${escHtml(val)}"/>`;
  }
  return `<div class="form-group" style="margin-bottom:14px;${span}"><label>${escHtml(field.label)} ${req}</label>${html}</div>`;
}

function populateBoardWriteModal(modal, board, post) {
  const set = (sel, v) => { const el = modal.querySelector(sel); if (el) el.value = v||''; };
  set('[data-field="제목"]',   post.title);
  set('[data-field="내용"]',   post.content);
  set('[data-field="작성자"]', post.author);

  // 분류: category_id를 문자열로 변환해서 select value 매칭
  const catSel = modal.querySelector('[data-field="분류"]');
  if (catSel && post.category_id) catSel.value = String(post.category_id);

  if (post.created_at) {
    set('[data-field="작성일시"]', post.created_at.replace(' ', 'T').substring(0, 16));
  }
  const noticeEl = modal.querySelector(`#boardIsNotice_${board.table}`);
  if (noticeEl) noticeEl.checked = !!post.is_notice;

  const extra = post.extra || {};
  board.fields.forEach(f => {
    if (['제목','내용','작성자','분류','작성일시','수정일시','조회수'].includes(f.key)) return;
    if (AUTO_FIELDS.includes(f.key) || COMMENT_FIELDS.includes(f.key) || f.enabled === false) return;
    const val = extra[f.key] || '';
    if (f.type === 'rating') {
      setRatingByValue(modal, f.key, parseInt(val)||0);
    } else if (f.type === 'period') {
      if (val && val.includes('~')) {
        const [s,e] = val.split('~').map(x=>x.trim());
        set(`[data-field="${f.key}_start"]`, s);
        set(`[data-field="${f.key}_end"]`,   e);
      }
    } else if (f.type === 'image') {
      // 기존 이미지 경로 미리보기
      if (val) {
        const uid     = `fi_${f.key}_${board.table}`;
        const prevEl  = modal.querySelector(`#prev_${uid}`);
        const hidden  = modal.querySelector(`input[type="hidden"][data-field="${f.key}"]`) ||
                        modal.querySelector(`#${uid}_val`);
        if (prevEl) {
          prevEl.innerHTML = `<div style="position:relative;display:inline-block;margin-top:4px;">
            <img src="${esc(val)}" alt="preview" style="max-width:100%;max-height:160px;border-radius:var(--radius);border:1px solid var(--border);"/>
          </div>`;
        }
        // file input에 hidden으로 경로 저장
        const fileInput = modal.querySelector(`#${uid}`);
        if (fileInput) fileInput.dataset.existingUrl = val;
      }
    } else if (f.type === 'images') {
      // 기존 이미지 목록 미리보기
      if (val) {
        const uid      = `fi_${f.key}_${board.table}`;
        const multiEl  = modal.querySelector(`#multi_${uid}`);
        if (multiEl) {
          let urls = [];
          try { urls = JSON.parse(val); } catch(e) { if (val) urls = [val]; }
          multiEl.innerHTML = urls.map(u => `
            <div class="image-preview-item" data-url="${esc(u)}">
              <img src="${esc(u)}" alt="preview"/>
              <button class="img-remove" onclick="this.closest('.image-preview-item').remove()">✕</button>
            </div>`).join('');
        }
      }
    } else {
      set(`[data-field="${f.key}"]`, val);
    }
  });
}

// ===========================
// 게시물 저장 → DB
// ===========================
async function saveBoardPost(tableKey) {
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const modal = document.getElementById('boardWriteModal_' + tableKey);
  if (!modal) return;
  const g = sel => { const el = modal.querySelector(sel); return el ? el.value.trim() : ''; };
  const title   = g('[data-field="제목"]');
  const content = g('[data-field="내용"]');
  const author  = g('[data-field="작성자"]') || '관리자';
  const cat_id  = g('[data-field="분류"]') || '';
  const is_notice = modal.querySelector(`#boardIsNotice_${tableKey}`)?.checked ? 1 : 0;
  if (!title) { showToast('제목을 입력하세요.', 'error'); return; }

  const SKIP = new Set([...AUTO_FIELDS, ...COMMENT_FIELDS, '제목','내용','작성자','분류','작성일시','수정일시','조회수']);
  const extra = {};
  for (const f of board.fields) {
    if (SKIP.has(f.key) || f.enabled === false) continue;
    if (f.type === 'period') {
      const s = g(`[data-field="${f.key}_start"]`), e = g(`[data-field="${f.key}_end"]`);
      extra[f.key] = (s||e) ? `${s} ~ ${e}` : '';
    } else if (f.type === 'rating') {
      const h = modal.querySelector(`input[data-field="${f.key}_hidden"]`);
      extra[f.key] = h ? h.value : '0';
    } else if (f.type === 'image') {
      const uid       = `fi_${f.key}_${board.table}`;
      const fileInput = modal.querySelector(`#${uid}`);
      // 새 파일 선택됐으면 업로드, 아니면 기존 URL 유지
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        // 업로드는 file_upload.js의 bindSingleUpload가 처리하지 않으므로 여기서 직접
        const fd = new FormData();
        fd.append('file', fileInput.files[0]);
        try {
          const up = await fetch('api/upload.php', { method: 'POST', body: fd });
          const ud = await up.json();
          extra[f.key] = ud.ok ? ud.url : (fileInput.dataset.existingUrl || '');
        } catch(e) { extra[f.key] = fileInput.dataset.existingUrl || ''; }
      } else {
        extra[f.key] = fileInput ? (fileInput.dataset.existingUrl || '') : '';
      }
    } else if (f.type === 'images') {
      const uid     = `fi_${f.key}_${board.table}`;
      const multiEl = modal.querySelector(`#multi_${uid}`);
      // 기존 미리보기 아이템의 url 수집
      const existingUrls = multiEl
        ? Array.from(multiEl.querySelectorAll('.image-preview-item[data-url]')).map(el => el.dataset.url)
        : [];
      // 새로 선택된 파일 업로드
      const fileInput = modal.querySelector(`#${uid}`);
      const newUrls   = [];
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (const file of Array.from(fileInput.files)) {
          const fd = new FormData();
          fd.append('file', file);
          try {
            const up = await fetch('api/upload.php', { method: 'POST', body: fd });
            const ud = await up.json();
            if (ud.ok) newUrls.push(ud.url);
          } catch(e) {}
        }
      }
      extra[f.key] = JSON.stringify([...existingUrls, ...newUrls]);
    } else if (!['files'].includes(f.type)) {
      const el = modal.querySelector(`[data-field="${f.key}"]`);
      if (el) extra[f.key] = el.value || '';
    }
  }

  const postId    = modal.dataset.postId;
  const created_at = g('[data-field="작성일시"]') || '';
  const data = {
    action:      postId ? 'postUpdate' : 'postCreate',
    table:       tableKey,
    title, content, author,
    category_id: cat_id,
    is_notice,
    extra:       JSON.stringify(extra),
  };
  if (created_at) data.created_at = created_at.replace('T', ' ');
  if (postId) data.id = postId;

  const res = await apiPost('api/board.php', data);
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    modal.classList.remove('open');
    await loadBoardPostsAndRender(board, 'posts');
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}

// ===========================
// 게시물 삭제
// ===========================
async function deleteBoardPost(tableKey, postId) {
  if (!confirm('게시물을 삭제하시겠습니까?')) return;
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const res = await apiPost('api/board.php', { action: 'postDelete', table: tableKey, id: postId });
  if (res.ok) {
    showToast('삭제되었습니다.', 'success');
    await loadBoardPostsAndRender(board, 'posts');
  } else showToast(res.msg || '삭제 실패', 'error');
}

async function boardBulkDelete(tableKey) {
  const tbody = document.getElementById('boardBody_' + tableKey);
  if (!tbody) return;
  const checked = tbody.querySelectorAll('.row-check:checked');
  if (!checked.length) return;
  if (!confirm(`선택한 ${checked.length}건을 삭제하시겠습니까?`)) return;
  const ids = Array.from(checked).map(cb => cb.dataset.postId).filter(Boolean);
  const res = await apiPost('api/board.php', { action: 'postBulkDelete', table: tableKey, ids: JSON.stringify(ids) });
  if (res.ok) {
    showToast(`${ids.length}건이 삭제되었습니다.`, 'success');
    const board = getBoardByTable(tableKey);
    if (board) await loadBoardPostsAndRender(board, 'posts');
  }
}

async function deleteBoard(tableKey) {
  if (!confirm('게시판을 삭제하시겠습니까?\n게시물도 모두 삭제됩니다.')) return;
  const b = getBoardByTable(tableKey);
  if (!b || !b.id) return;
  const res = await apiPost('api/board.php', { action: 'boardDelete', id: b.id });
  if (res.ok) {
    document.querySelector(`[data-board="${b.table}"]`)?.remove();
    document.getElementById('page-board_' + b.table)?.remove();
    delete menuState['board_' + b.table];
    showToast('게시판이 삭제되었습니다.', 'success');
    await loadBoardList();
  } else showToast(res.msg || '삭제 실패', 'error');
}

// ===========================
// 상세 + 댓글
// ===========================
function openBoardDetailModal(tableKey, postId) {
  const board = getBoardByTable(tableKey);
  if (!board) return;
  const post = (board.posts||[]).find(p => p.id === postId);
  if (!post) return;

  const mid = `boardDetailModal_${tableKey}_${postId}`;
  const old = document.getElementById(mid);
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = mid;

  // 댓글 DB 로드 후 렌더
  apiGet('api/board.php', { action: 'commentList', post_id: postId }).then(res => {
    post.comments = res.ok ? res.data : [];
    modal.innerHTML = buildDetailModalHTML(board, post, mid);
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    modal.classList.add('open');
  });
}

function buildDetailModalHTML(board, post, modalId) {
  const extra = post.extra || {};
  let rows = `
    <div class="form-group"><label>제목</label><input type="text" class="form-control" value="${escHtml(post.title)}" readonly/></div>
    <div class="form-group"><label>작성자</label><input type="text" class="form-control" value="${escHtml(post.author)}" readonly/></div>
    <div class="form-group" style="grid-column:span 2;"><label>내용</label>
      <textarea class="form-control" rows="5" readonly>${escHtml(post.content||'')}</textarea></div>`;

  board.fields
    .filter(f => f.enabled!==false && !['제목','내용','작성자','작성일시','수정일시','조회수'].includes(f.key) && !COMMENT_FIELDS.includes(f.key))
    .forEach(f => {
      const val = extra[f.key] || '';
      if (f.type === 'rating') {
        const rv = parseInt(val)||0;
        rows += `<div class="form-group"><label>${escHtml(f.label)}</label>
          <div style="display:flex;align-items:center;gap:2px;">
            ${[1,2,3,4,5].map(n=>`<span style="font-size:1.4rem;color:${n<=rv?'#f59e0b':'#e2e8f0'};">★</span>`).join('')}
            <span style="margin-left:8px;font-size:.85rem;">${rv}점</span>
          </div></div>`;
      } else {
        rows += `<div class="form-group"><label>${escHtml(f.label)}</label>
          <input type="text" class="form-control" value="${escHtml(val)}" readonly/></div>`;
      }
    });

  rows += `
    <div class="form-group"><label>작성일시</label><input type="text" class="form-control" value="${post.created_at}" readonly/></div>
    <div class="form-group"><label>조회수</label><input type="text" class="form-control" value="${post.views}" readonly/></div>`;

  const hasComments = board.fields.some(f => f.key === '댓글' && f.enabled !== false);
  const commentSection = hasComments ? `
    <div style="grid-column:span 2;">
      <hr style="margin:16px 0;border:none;border-top:1px solid var(--border);"/>
      <p style="font-weight:700;font-size:.9rem;margin-bottom:12px;">💬 댓글 (${(post.comments||[]).length})</p>
      <div id="commentList_${board.table}_${post.id}">${renderCommentList(board.table, post)}</div>
      <div style="display:grid;grid-template-columns:160px 1fr auto;gap:8px;align-items:start;background:var(--bg);border-radius:var(--radius);padding:12px;margin-top:12px;">
        <input type="text" class="form-control" id="commentAuthor_${board.table}_${post.id}" placeholder="작성자" value="관리자"/>
        <textarea class="form-control" id="commentContent_${board.table}_${post.id}" rows="2" placeholder="댓글 내용을 입력하세요." style="resize:vertical;"></textarea>
        <button class="btn btn-primary" style="align-self:flex-start;" onclick="addComment('${board.table}',${post.id})">등록</button>
      </div>
    </div>` : '';

  return `
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>📄 ${escHtml(board.name)} — 상세</h3>
        <button class="modal-close" onclick="document.getElementById('${modalId}').classList.remove('open')">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">${rows}${commentSection}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="document.getElementById('${modalId}').classList.remove('open')">닫기</button>
        <button class="btn btn-primary" onclick="openBoardWriteModal('${board.table}',${post.id});document.getElementById('${modalId}').classList.remove('open')">수정</button>
      </div>
    </div>`;
}

function renderCommentList(tableKey, post) {
  const comments = post.comments || [];
  if (!comments.length) return `<p style="color:var(--text-muted);font-size:.85rem;padding:12px 0;text-align:center;">댓글이 없습니다.</p>`;
  return comments.map(c => `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <strong style="font-size:.85rem;">${escHtml(c.author)}</strong>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:.75rem;color:var(--text-muted);">${c.created_at}</span>
          <button class="btn btn-sm btn-danger" style="padding:2px 8px;font-size:.75rem;" onclick="deleteComment('${tableKey}',${post.id},${c.id})">삭제</button>
        </div>
      </div>
      <p style="margin:0;font-size:.85rem;white-space:pre-wrap;">${escHtml(c.content)}</p>
    </div>`).join('');
}

async function addComment(tableKey, postId) {
  const aEl = document.getElementById(`commentAuthor_${tableKey}_${postId}`);
  const cEl = document.getElementById(`commentContent_${tableKey}_${postId}`);
  const author  = aEl ? aEl.value.trim() : '';
  const content = cEl ? cEl.value.trim() : '';
  if (!author)  { showToast('작성자를 입력하세요.', 'error');    return; }
  if (!content) { showToast('댓글 내용을 입력하세요.', 'error'); return; }
  const res = await apiPost('api/board.php', { action: 'commentCreate', post_id: postId, author, content });
  if (res.ok) {
    if (cEl) cEl.value = '';
    // 댓글 목록 갱신
    const listRes = await apiGet('api/board.php', { action: 'commentList', post_id: postId });
    const board   = getBoardByTable(tableKey);
    const post    = (board?.posts||[]).find(p => p.id === postId);
    if (post && listRes.ok) {
      post.comments = listRes.data;
      const listEl  = document.getElementById(`commentList_${tableKey}_${postId}`);
      if (listEl) listEl.innerHTML = renderCommentList(tableKey, post);
    }
    showToast('댓글이 등록되었습니다.', 'success');
  } else showToast(res.msg || '등록 실패', 'error');
}

async function deleteComment(tableKey, postId, commentId) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return;
  const res = await apiPost('api/board.php', { action: 'commentDelete', id: commentId });
  if (res.ok) {
    const listRes = await apiGet('api/board.php', { action: 'commentList', post_id: postId });
    const board   = getBoardByTable(tableKey);
    const post    = (board?.posts||[]).find(p => p.id === postId);
    if (post && listRes.ok) {
      post.comments = listRes.data;
      const listEl  = document.getElementById(`commentList_${tableKey}_${postId}`);
      if (listEl) listEl.innerHTML = renderCommentList(tableKey, post);
    }
    showToast('삭제되었습니다.', 'success');
  }
}

// ===========================
// 파일 미리보기 헬퍼
// ===========================
function previewSingleImage(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview || !input.files.length) return;
  preview.innerHTML = '';
  const reader = new FileReader();
  reader.onload = ev => {
    preview.innerHTML = `<div style="position:relative;display:inline-block;margin-top:4px;">
      <img src="${ev.target.result}" alt="preview" style="max-width:100%;max-height:160px;border-radius:var(--radius);border:1px solid var(--border);"/>
      <button onclick="this.parentElement.remove();document.getElementById('${input.id}').value='';"
        style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#ef4444;color:#fff;border:none;cursor:pointer;font-size:11px;">✕</button>
    </div>`;
  };
  reader.readAsDataURL(input.files[0]);
}

function previewFileList(input, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  Array.from(input.files).forEach(file => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--bg);border:1px solid var(--border);border-radius:4px;margin-top:4px;font-size:.82rem;';
    item.innerHTML = `<span>📎</span>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(file.name)}</span>
      <span style="color:var(--text-muted);flex-shrink:0;">${formatFileSize(file.size)}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:0 2px;">✕</button>`;
    container.appendChild(item);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024)    return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

// ===========================
// 별점
// ===========================
function setRating(btn, fieldKey, val) {
  val = parseInt(val);
  const wrap = btn.closest('.star-rating-wrap');
  if (!wrap) return;
  wrap.querySelectorAll('button[data-val]:not([data-val="0"])').forEach(b => {
    b.style.color = parseInt(b.dataset.val) <= val ? '#f59e0b' : '#d1d5db';
  });
  const label = wrap.querySelector('.star-label');
  if (label) label.textContent = val + '점';
  const modal = btn.closest('.modal-overlay');
  if (modal) { const h = modal.querySelector(`input[data-field="${fieldKey}_hidden"]`); if (h) h.value = val; }
}

function setRatingByValue(modal, fieldKey, val) {
  const wrap = modal.querySelector(`.star-rating-wrap[data-field="${fieldKey}"]`);
  if (!wrap) return;
  wrap.querySelectorAll('button[data-val]:not([data-val="0"])').forEach(b => {
    b.style.color = parseInt(b.dataset.val) <= val ? '#f59e0b' : '#d1d5db';
  });
  const label = wrap.querySelector('.star-label');
  if (label) label.textContent = val + '점';
  const h = modal.querySelector(`input[data-field="${fieldKey}_hidden"]`);
  if (h) h.value = val;
}

// ===========================
// HTML 이스케이프
// ===========================
function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}