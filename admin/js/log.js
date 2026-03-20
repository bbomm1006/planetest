// ===========================
// LOG MANAGEMENT  (log.js)
// ===========================

let currentLogTab  = 'access';
let currentLogPage = 1;
let logTotalPages  = 1;

// ── 탭별 설정 ──────────────────────────────────────────────
const LOG_CONFIG = {
  access: {
    label: '접속 로그',
    subTypes: [
      { value: '',    label: '전체 상태' },
      { value: '200', label: '200 OK' },
      { value: '301', label: '301 Redirect' },
      { value: '404', label: '404 Not Found' },
      { value: '500', label: '500 Error' },
    ],
    heads: ['시간', 'IP', '메서드', 'URI', '상태코드', 'User-Agent', '상세'],
    row: r => [
      fmtDt(r.created_at),
      esc(r.ip),
      `<span class="log-badge log-badge-method-${(r.method||'').toLowerCase()}">${esc(r.method)}</span>`,
      `<span title="${esc(r.uri)}" style="max-width:220px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;">${esc(r.uri)}</span>`,
      statusBadge(r.status_code),
      `<span style="max-width:180px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;font-size:.78rem;color:var(--text-muted);" title="${esc(r.user_agent)}">${esc(r.user_agent)}</span>`,
    ],
  },

  login: {
    label: '로그인 로그',
    subTypes: [
      { value: '',       label: '전체 유형' },
      { value: 'admin',  label: '관리자' },
      { value: 'google', label: 'Google' },
      { value: 'kakao',  label: 'Kakao' },
      { value: 'naver',  label: 'Naver' },
      { value: 'normal', label: '일반' },
    ],
    heads: ['시간', '유형', '아이디', 'IP', '결과', '실패 사유', '상세'],
    row: r => [
      fmtDt(r.created_at),
      userTypeBadge(r.user_type),
      esc(r.username  || '-'),
      esc(r.ip),
      resultBadge(r.result),
      esc(r.fail_reason || '-'),
    ],
  },

  admin_action: {
    label: '관리자 작업 로그',
    subTypes: [
      { value: '',       label: '전체 작업' },
      { value: 'create', label: '등록' },
      { value: 'update', label: '수정' },
      { value: 'delete', label: '삭제' },
      { value: 'login',  label: '로그인' },
      { value: 'logout', label: '로그아웃' },
    ],
    heads: ['시간', '관리자', '작업', '대상 테이블', '대상 아이디', 'IP', '상세'],
    row: r => [
      fmtDt(r.created_at),
      esc(r.admin_name || '-'),
      actionBadge(r.action),
      esc(r.target_table || '-'),
      adminActionTarget(r),
      esc(r.ip),
    ],
  },

  error: {
    label: '에러 로그',
    subTypes: [
      { value: '',         label: '전체 레벨' },
      { value: 'critical', label: 'Critical' },
      { value: 'error',    label: 'Error' },
      { value: 'warning',  label: 'Warning' },
      { value: 'notice',   label: 'Notice' },
    ],
    heads: ['시간', '레벨', '코드', '메시지', '파일', '라인', 'IP', '상세'],
    row: r => [
      fmtDt(r.created_at),
      levelBadge(r.level),
      esc(r.code    || '-'),
      `<span title="${esc(r.message)}" style="max-width:240px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;">${esc(r.message)}</span>`,
      `<span title="${esc(r.file)}" style="max-width:160px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;font-size:.78rem;">${esc(r.file)}</span>`,
      esc(r.line    || '-'),
      esc(r.ip      || '-'),
    ],
  },

  email: {
    label: '이메일 발송 로그',
    subTypes: [
      { value: '',        label: '전체 상태' },
      { value: 'success', label: '성공' },
      { value: 'fail',    label: '실패' },
    ],
    heads: ['발송 시간', '수신자', '제목', '템플릿', '상태', '오류 메시지', '상세'],
    row: r => [
      fmtDt(r.sent_at),
      esc(r.to_email),
      `<span title="${esc(r.subject)}" style="max-width:200px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;">${esc(r.subject)}</span>`,
      esc(r.template    || '-'),
      resultBadge(r.status),
      esc(r.error_msg   || '-'),
    ],
  },

  landing: {
    label: '랜딩 로그',
    subTypes: [
      { value: '',         label: '전체 소스' },
      { value: 'google',   label: 'Google' },
      { value: 'naver',    label: 'Naver' },
      { value: 'kakao',    label: 'Kakao' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'instagram',label: 'Instagram' },
      { value: 'direct',   label: 'Direct' },
    ],
    heads: ['시간', 'Source', 'Medium', 'Campaign', 'Term', '랜딩 페이지', 'IP', '상세'],
    row: r => [
      fmtDt(r.created_at),
      esc(r.utm_source   || '-'),
      esc(r.utm_medium   || '-'),
      esc(r.utm_campaign || '-'),
      esc(r.utm_term     || '-'),
      `<span title="${esc(r.landing_page)}" style="max-width:180px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;font-size:.78rem;">${esc(r.landing_page)}</span>`,
      esc(r.ip),
    ],
  },
};

// ── 탭 전환 ──────────────────────────────────────────────────
function switchLogTab(tab) {
  currentLogTab  = tab;
  currentLogPage = 1;

  document.querySelectorAll('.log-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // subType 드롭다운 재구성
  const cfg = LOG_CONFIG[tab];
  const sel = document.getElementById('logSubType');
  sel.innerHTML = cfg.subTypes.map(s =>
    `<option value="${esc(s.value)}">${esc(s.label)}</option>`
  ).join('');

  // thead 재구성
  const thead = document.getElementById('logThead');
  thead.innerHTML = '<tr>' + cfg.heads.map(h => `<th>${h}</th>`).join('') + '</tr>';

  // 본문 초기화
  const tbody = document.getElementById('logBody');
  tbody.innerHTML = '<tr><td colspan="' + cfg.heads.length + '" style="text-align:center;padding:40px;color:var(--text-muted);">검색 버튼을 눌러 조회하세요.</td></tr>';
  document.getElementById('logPagination').innerHTML = '';
  document.getElementById('logSummaryBar').innerHTML  = '';

  loadLogList(1);
}

// ── 필터 초기화 ───────────────────────────────────────────────
function resetLogFilter() {
  const today  = new Date().toISOString().slice(0, 10);
  const week   = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  document.getElementById('logDateFrom').value = week;
  document.getElementById('logDateTo').value   = today;
  document.getElementById('logSubType').value  = '';
  document.getElementById('logKeyword').value  = '';
  loadLogList(1);
}

// ── 목록 조회 ─────────────────────────────────────────────────
async function loadLogList(page) {
  page = page || currentLogPage;
  currentLogPage = page;

  const cfg      = LOG_CONFIG[currentLogTab];
  const dateFrom = document.getElementById('logDateFrom').value;
  const dateTo   = document.getElementById('logDateTo').value;
  const subType  = document.getElementById('logSubType').value;
  const keyword  = document.getElementById('logKeyword').value.trim();

  const tbody = document.getElementById('logBody');
  tbody.innerHTML = `<tr><td colspan="${cfg.heads.length}" style="text-align:center;padding:40px;color:var(--text-muted);">로딩 중...</td></tr>`;

  const params = new URLSearchParams({
    action:    'list',
    log_type:  currentLogTab,
    page,
    limit:     50,
    date_from: dateFrom,
    date_to:   dateTo,
    sub_type:  subType,
    keyword,
  });

  try {
    const res = await fetch('api/log.php?' + params);
    const data = await res.json();

    if (!data.ok) {
      tbody.innerHTML = `<tr><td colspan="${cfg.heads.length}" style="text-align:center;padding:24px;color:var(--danger);">오류: ${esc(data.msg)}</td></tr>`;
      return;
    }

    logTotalPages = data.pages || 1;
    renderLogSummary(data.total, data.date_from, data.date_to);
    renderLogTable(data.data, cfg);
    renderLogPagination(data.total, data.page, data.pages, data.limit);

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="${cfg.heads.length}" style="text-align:center;padding:24px;color:var(--danger);">요청 실패</td></tr>`;
  }
}

// ── 요약 배지 렌더링 ──────────────────────────────────────────
function renderLogSummary(total, dateFrom, dateTo) {
  const bar = document.getElementById('logSummaryBar');
  bar.innerHTML = `
    <span style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:4px 12px;font-size:.8rem;color:var(--text-secondary);">
      📅 ${esc(dateFrom)} ~ ${esc(dateTo)}
    </span>
    <span style="background:var(--primary-light,#e8f0fe);border-radius:6px;padding:4px 12px;font-size:.8rem;color:var(--primary);font-weight:600;">
      총 ${total.toLocaleString()}건
    </span>`;
}

// ── 테이블 렌더링 ─────────────────────────────────────────────
function renderLogTable(rows, cfg) {
  const tbody = document.getElementById('logBody');
  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${cfg.heads.length}" style="text-align:center;padding:40px;color:var(--text-muted);">조회 결과가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => {
    const cells = cfg.row(r);
    const detailBtn = `<button class="btn btn-sm btn-outline" onclick="openLogDetail('${currentLogTab}',${r.id})">상세</button>`;
    return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + `<td>${detailBtn}</td>` + '</tr>';
  }).join('');
}

// ── 페이지네이션 렌더링 ────────────────────────────────────────
function renderLogPagination(total, page, pages, limit) {
  const pg = document.getElementById('logPagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }

  const maxBtn = 7;
  let start = Math.max(1, page - Math.floor(maxBtn / 2));
  let end   = Math.min(pages, start + maxBtn - 1);
  if (end - start < maxBtn - 1) start = Math.max(1, end - maxBtn + 1);

  let html = '';
  if (page > 1)  html += `<button class="btn btn-sm btn-ghost" onclick="loadLogList(${page - 1})">‹ 이전</button>`;
  for (let i = start; i <= end; i++) {
    html += `<button class="btn btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}" onclick="loadLogList(${i})">${i}</button>`;
  }
  if (page < pages) html += `<button class="btn btn-sm btn-ghost" onclick="loadLogList(${page + 1})">다음 ›</button>`;
  pg.innerHTML = html;
}

// ── 상세 모달 ─────────────────────────────────────────────────
async function openLogDetail(logType, id) {
  const labelMap = {
    access: '접속 로그', login: '로그인 로그',
    admin_action: '관리자 작업 로그', error: '에러 로그',
    email: '이메일 발송 로그', landing: '랜딩 로그',
  };
  document.getElementById('logDetailModalTitle').textContent = (labelMap[logType] || '로그') + ' 상세';
  document.getElementById('logDetailBody').innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-muted);">로딩 중...</p>';
  openModal('logDetailModal');

  const res  = await fetch(`api/log.php?action=detail&log_type=${logType}&id=${id}`);
  const data = await res.json();

  if (!data.ok) {
    document.getElementById('logDetailBody').innerHTML = `<p style="color:var(--danger);">오류: ${esc(data.msg)}</p>`;
    return;
  }

  const row = data.data;
  const rows = Object.entries(row).map(([k, v]) => {
    let val = v;
    // JSON 필드 pretty print
    if ((k === 'before_data' || k === 'after_data' || k === 'stack_trace') && v) {
      try {
        const parsed = JSON.parse(v);
        val = `<pre style="background:var(--bg-main);border:1px solid var(--border);border-radius:6px;padding:10px;font-size:.78rem;max-height:160px;overflow:auto;white-space:pre-wrap;word-break:break-all;margin:0;">${esc(JSON.stringify(parsed, null, 2))}</pre>`;
      } catch {
        val = `<pre style="background:var(--bg-main);border:1px solid var(--border);border-radius:6px;padding:10px;font-size:.78rem;max-height:160px;overflow:auto;white-space:pre-wrap;word-break:break-all;margin:0;">${esc(v)}</pre>`;
      }
    } else {
      val = `<span style="word-break:break-all;">${esc(String(v ?? '-'))}</span>`;
    }
    return `<tr>
      <td style="width:160px;font-weight:600;color:var(--text-secondary);font-size:.82rem;padding:8px 10px;white-space:nowrap;background:var(--bg-main);border-bottom:1px solid var(--border);">${esc(k)}</td>
      <td style="padding:8px 10px;font-size:.85rem;border-bottom:1px solid var(--border);">${val}</td>
    </tr>`;
  }).join('');

  document.getElementById('logDetailBody').innerHTML =
    `<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden;">${rows}</table>`;
}

// ── CSV 다운로드 ──────────────────────────────────────────────
function logExportCsv() {
  const dateFrom = document.getElementById('logDateFrom').value;
  const dateTo   = document.getElementById('logDateTo').value;
  const subType  = document.getElementById('logSubType').value;
  const keyword  = document.getElementById('logKeyword').value.trim();

  const params = new URLSearchParams({
    action:    'export',
    log_type:  currentLogTab,
    date_from: dateFrom,
    date_to:   dateTo,
    sub_type:  subType,
    keyword,
  });

  const link = document.createElement('a');
  link.href  = 'api/log.php?' + params;
  link.click();
  showToast('엑셀 다운로드가 시작됩니다.', 'success');
}

// ── 배지 헬퍼 ─────────────────────────────────────────────────
function adminActionTarget(r) {
  // after_data 또는 before_data에서 이름/제목 추출
  let label = '';
  const src = r.after_data || r.before_data || '';
  if (src) {
    try {
      const d = typeof src === 'object' ? src : JSON.parse(src);
      label = d.username || d.name || d.title || d.store_name || d.term_name ||
              d.field_name || d.model_no || d.subject || d.branch_name || '';
    } catch(e) {}
  }
  if (label) return `<span title="${esc(String(r.target_id||''))}">${esc(String(label))}</span>`;
  return esc(String(r.target_id || '-'));
}

function statusBadge(code) {
  const c = parseInt(code);
  const color = c >= 500 ? 'var(--danger)' : c >= 400 ? 'var(--warning,#f59e0b)' : c >= 300 ? 'var(--text-secondary)' : 'var(--success,#22c55e)';
  return `<span style="background:${color}22;color:${color};border-radius:4px;padding:2px 7px;font-size:.78rem;font-weight:600;">${esc(String(code||'-'))}</span>`;
}

function resultBadge(result) {
  const ok = result === 'success';
  return `<span style="background:${ok?'var(--success,#22c55e)22':'var(--danger)22'};color:${ok?'var(--success,#22c55e)':'var(--danger)'};border-radius:4px;padding:2px 7px;font-size:.78rem;font-weight:600;">${ok?'성공':'실패'}</span>`;
}

function userTypeBadge(type) {
  const map = { admin:'관리자', google:'Google', kakao:'Kakao', naver:'Naver', normal:'일반' };
  const colors = { admin:'var(--primary)', google:'#ea4335', kakao:'#fee500', naver:'#03c75a', normal:'var(--text-secondary)' };
  const txtColors = { kakao:'#3c1e1e' };
  const bg  = (colors[type] || 'var(--text-muted)') + '22';
  const fg  = txtColors[type] || colors[type] || 'var(--text-muted)';
  return `<span style="background:${bg};color:${fg};border-radius:4px;padding:2px 8px;font-size:.78rem;font-weight:600;">${esc(map[type]||type)}</span>`;
}

function levelBadge(level) {
  const map = { critical:'#dc2626', error:'var(--danger)', warning:'var(--warning,#f59e0b)', notice:'var(--text-secondary)' };
  const c = map[level] || 'var(--text-muted)';
  return `<span style="background:${c}22;color:${c};border-radius:4px;padding:2px 7px;font-size:.78rem;font-weight:600;">${esc(level||'-')}</span>`;
}

function actionBadge(action) {
  const map = { create:'var(--success,#22c55e)', update:'var(--primary)', delete:'var(--danger)', login:'#8b5cf6', logout:'var(--text-secondary)' };
  const c = map[action] || 'var(--text-muted)';
  return `<span style="background:${c}22;color:${c};border-radius:4px;padding:2px 7px;font-size:.78rem;font-weight:600;">${esc(action||'-')}</span>`;
}

function fmtDt(dt) {
  if (!dt) return '-';
  return String(dt).replace('T', ' ').slice(0, 19);
}

// ── 스타일 주입 ───────────────────────────────────────────────
function injectLogTabStyles() {
  if (document.getElementById('logTabStyle')) return;
  const style = document.createElement('style');
  style.id = 'logTabStyle';
  style.textContent = `
    .log-tab-btn {
      background: none; border: none; border-bottom: 3px solid transparent;
      padding: 10px 18px; font-size: .87rem; font-weight: 500;
      color: var(--text-secondary); cursor: pointer;
      transition: color .15s, border-color .15s;
      white-space: nowrap;
    }
    .log-tab-btn:hover { color: var(--primary); }
    .log-tab-btn.active {
      color: var(--primary); border-bottom-color: var(--primary); font-weight: 700;
    }
    .log-badge-method-get  { background:#dcfce7;color:#16a34a;border-radius:3px;padding:1px 6px;font-size:.75rem;font-weight:700; }
    .log-badge-method-post { background:#dbeafe;color:#2563eb;border-radius:3px;padding:1px 6px;font-size:.75rem;font-weight:700; }
    .log-badge-method-put  { background:#fef3c7;color:#d97706;border-radius:3px;padding:1px 6px;font-size:.75rem;font-weight:700; }
    .log-badge-method-delete { background:#fee2e2;color:#dc2626;border-radius:3px;padding:1px 6px;font-size:.75rem;font-weight:700; }
  `;
  document.head.appendChild(style);
}

// ── 페이지 진입 시 초기화 ─────────────────────────────────────
function initLogMgmt() {
  injectLogTabStyles();

  // 기본 날짜 세팅
  const today = new Date().toISOString().slice(0, 10);
  const week  = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const fromEl = document.getElementById('logDateFrom');
  const toEl   = document.getElementById('logDateTo');
  if (fromEl && !fromEl.value) fromEl.value = week;
  if (toEl   && !toEl.value)   toEl.value   = today;

  // 첫 탭 초기화
  switchLogTab(currentLogTab);
}
