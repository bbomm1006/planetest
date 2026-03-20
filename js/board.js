/* ═══════════════════════════════════════
   board.js — 문의 게시판 + 소셜 로그인
═══════════════════════════════════════ */

var _boardUser = { loggedIn: false, id: '', name: '', provider: '' };
var _boardPage = 1, _boardKw = '', _boardPostId = null, _boardPwPostId = null;
var _socialKeys = { kakao: '', naver: '', google: '' };
var _boardCategories = []; // 문의 분류 목록

async function loadSocialKeys() {
  try {
    var res = await fetch('/admin/api_front/social_public.php', { credentials: 'include' });
    var data = await res.json();
    if (data.ok) _socialKeys = { kakao: data.kakao || '', naver: data.naver || '', google: data.google || '' };
  } catch (e) {}
}

/* ── 문의 분류 로드 ── */
async function loadBoardCategories() {
  try {
    var res = await fetch('/admin/api_front/inquiry_categories_public.php');
    var data = await res.json();
    if (data.ok) {
      _boardCategories = data.data || [];
      var sel = document.getElementById('bwCategory');
      if (sel) {
        sel.innerHTML = '<option value="">분류 선택</option>'
          + _boardCategories.map(function(c) {
              return '<option value="' + c.id + '">' + bEsc(c.name) + '</option>';
            }).join('');
      }
    }
  } catch (e) {}
}

function bMaskSocialId(authorId, isAdmin, authorName) {
  if (isAdmin) return authorName || '관리자';
  if (!authorId) return authorName || '';
  var provMap = { kakao: '카카오', naver: '네이버', google: '구글' };
  var sep = authorId.indexOf('_');
  if (sep === -1) return authorId;
  var prov = authorId.substring(0, sep);
  var uid  = authorId.substring(sep + 1);
  var masked = uid.length > 1 ? uid.charAt(0) + '*'.repeat(uid.length - 1) : uid;
  return (provMap[prov] || prov) + ' ' + masked;
}

function bEsc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function bDate(s) {
  if (!s) return '';
  var d = new Date(s);
  return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
}
function bDateTime(s) {
  if (!s) return '';
  var d = new Date(s);
  return bDate(s) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

async function boardInit() {
  await loadSocialKeys();
  await loadBoardCategories();
  try {
    var res = await fetch('/admin/api_front/user_auth.php?action=status', { credentials: 'include' });
    var data = await res.json();
    if (data.loggedIn) _boardUser = { loggedIn: true, id: data.user.id, name: data.user.name, provider: data.user.provider };
  } catch (e) {}
  boardUpdateLoginUI();
  boardLoad(1);
}

function boardUpdateLoginUI() {
  var statusEl = document.getElementById('boardLoginStatus');
  var loginBtn  = document.getElementById('boardLoginBtn');
  var logoutBtn = document.getElementById('boardLogoutBtn');
  var writeBtn  = document.getElementById('boardWriteBtn');
  if (!statusEl) return;
  if (_boardUser.loggedIn) {
    var provMap = { kakao: '카카오', naver: '네이버', google: '구글' };
    statusEl.innerHTML = '<strong>' + bEsc(_boardUser.name) + '</strong>님 (' + (provMap[_boardUser.provider] || _boardUser.provider) + ')';
    loginBtn.style.display = 'none'; logoutBtn.style.display = ''; writeBtn.style.display = '';
  } else {
    statusEl.textContent = '로그인이 필요합니다.';
    loginBtn.style.display = ''; logoutBtn.style.display = 'none'; writeBtn.style.display = 'none';
  }
}

async function boardLoad(page) {
  _boardPage = page || 1;
  var tbody = document.getElementById('boardTbody');
  if (tbody) tbody.innerHTML = '<div class="board-list-empty">불러오는 중...</div>';

  var url = '/admin/api_front/board_posts.php?page=' + _boardPage + '&limit=10';
  if (_boardKw) url += '&kw=' + encodeURIComponent(_boardKw);

  try {
    var res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    if (!data.ok) throw new Error(data.error || '서버 오류');
    boardRenderList(data);
  } catch (e) {
    if (tbody) tbody.innerHTML =
      '<div class="board-list-empty" style="color:#ef4444">'
      + '목록을 불러오지 못했습니다.<br>'
      + '<small style="color:#999;font-size:.75rem">' + bEsc(e.message) + '</small><br>'
      + '<button class="board-btn board-btn-ghost board-btn-sm" style="margin-top:10px" onclick="boardLoad(' + _boardPage + ')">다시 시도</button>'
      + '</div>';
  }
}

function boardRenderList(data) {
  var listEl = document.getElementById('boardTbody');
  var items = data.items || [];
  if (!items.length) {
    listEl.innerHTML = '<div class="board-list-empty">게시글이 없습니다.</div>';
  } else {
    var total = data.total || 0;
    listEl.innerHTML = items.map(function (item, idx) {
      var num = total - ((_boardPage - 1) * 10) - idx;
      var catBadge = item.cat_name
        ? '<span style="color:var(--primary,#1e7fe8);font-weight:700;margin-right:4px;">[' + bEsc(item.cat_name) + ']</span>'
        : '';

      /* ── 비로그인이거나 남의 글이면 자물쇠 아이콘 표시 ── */
      var isLocked = !item.is_mine;
      var lockIcon = isLocked ? ' <span style="font-size:.7rem;color:var(--g4)">🔒</span>' : '';

      return '<div class="board-list-item' + (isLocked ? ' board-list-locked' : '') + '" onclick="boardOpenPost(\'' + item.id + '\',' + (item.is_mine ? 1 : 0) + ')">'
        + '<span class="board-list-num">' + num + '</span>'
        + '<div class="board-list-body">'
        + '<div class="board-list-title">' + catBadge + bEsc(item.title) + lockIcon + '</div>'
        + '<div class="board-list-meta"><span>' + bEsc(item.author_name) + '</span><span>' + bDate(item.created_at) + '</span>'
        + '<span class="board-status-badge board-status-' + bEsc(item.status || '접수') + '">' + bEsc(item.status || '접수') + '</span></div>'
        + '</div>'
        + '<svg class="board-list-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
        + '</div>';
    }).join('');
  }
  var pager = document.getElementById('boardPager');
  var pages = data.pages || 1;
  if (pages <= 1) { pager.innerHTML = ''; return; }
  var html = '';
  for (var i = 1; i <= pages; i++) html += '<button class="board-page-btn' + (i === _boardPage ? ' on' : '') + '" onclick="boardLoad(' + i + ')">' + i + '</button>';
  pager.innerHTML = html;
}

/* ── 글 클릭: 비로그인이면 로그인 모달, 남의 글이면 안내 ── */
function boardOpenPost(id, isMine) {
  if (!_boardUser.loggedIn) {
    openBoardLogin();
    return;
  }
  if (!isMine) {
    alert('본인이 작성한 글만 확인할 수 있습니다.');
    return;
  }
  boardFetchPost(id);
}

async function boardFetchPost(id) {
  var url = '/admin/api_front/board_posts.php?id=' + encodeURIComponent(id);
  try {
    var res = await fetch(url, { credentials: 'include' });
    var data = await res.json();
    if (!data.ok) { alert(data.error || '오류 발생'); return; }
    boardRenderDetail(data.item);
  } catch (e) { alert('오류 발생'); }
}

function boardRenderDetail(item) {
  _boardPostId = item.id;

  var catPrefix = item.cat_name ? '[' + item.cat_name + '] ' : '';
  document.getElementById('bdTitle').textContent   = catPrefix + item.title;
  document.getElementById('bdAuthor').textContent  = bMaskSocialId(_boardUser.id, false, item.author_name);
  document.getElementById('bdDate').textContent    = bDateTime(item.created_at);
  var st = item.status || '접수';
  var stEl = document.getElementById('bdStatus');
  if (stEl) stEl.innerHTML = '<span class="board-status-badge board-status-' + bEsc(st) + '">' + bEsc(st) + '</span>';
  document.getElementById('bdContent').textContent = item.content;

  var comments = item.comments || [];
  var answers  = item.answers  || [];
  document.getElementById('bdCommentCount').textContent = comments.length;
  var listEl = document.getElementById('bdCommentList');
  var html = '';

  if (answers.length) {
    html += '<div class="board-answers-wrap">';
    html += answers.map(function(a) {
      return '<div class="board-comment-item admin-comment">'
        + '<div class="board-comment-author-row">'
        + '<span class="board-comment-admin-badge">관리자 답변</span>'
        + '<span class="board-comment-date">' + bDateTime(a.created_at) + '</span>'
        + '</div>'
        + '<div class="board-comment-content">' + bEsc(a.content) + '</div>'
        + '</div>';
    }).join('');
    html += '</div>';
  }

  if (!comments.length && !answers.length) {
    html += '<div style="font-size:.82rem;color:var(--g4);padding:6px 24px 16px;">아직 댓글이 없습니다.</div>';
  } else if (comments.length) {
    html += comments.map(function (c) {
      var isAdmin = c.is_admin == 1;
      var isMine  = _boardUser.loggedIn && (_boardUser.id === c.author_id);
      var editedBadge = c.updated_at ? '<span class="board-comment-edited">(수정됨)</span>' : '';
      var actionBtns = isMine
        ? '<div class="board-comment-actions">'
          + '<button class="board-btn board-btn-ghost board-btn-sm" onclick="openCommentEdit(\'' + c.id + '\')">수정</button>'
          + '<button class="board-btn board-btn-red board-btn-sm" onclick="deleteComment(\'' + c.id + '\')">삭제</button>'
          + '</div>' : '';
      var displayId = bMaskSocialId(c.author_id, isAdmin, c.author_name);
      return '<div class="board-comment-item' + (isAdmin ? ' admin-comment' : '') + '" id="bc-' + c.id + '">'
        + '<div class="board-comment-author-row">'
        + (isAdmin ? '<span class="board-comment-admin-badge">관리자</span>' : '')
        + '<span class="board-comment-name">' + bEsc(displayId) + '</span>'
        + '<span class="board-comment-date">' + bDateTime(c.created_at) + '</span>'
        + editedBadge + actionBtns + '</div>'
        + '<div class="board-comment-content" id="bcc-' + c.id + '">' + bEsc(c.content) + '</div>'
        + '<div class="board-comment-edit-wrap" id="bcef-' + c.id + '" style="display:none;">'
        + '<textarea id="bceta-' + c.id + '">' + bEsc(c.content) + '</textarea>'
        + '<div class="board-comment-edit-actions">'
        + '<button class="board-btn board-btn-blue board-btn-sm" onclick="submitCommentEdit(\'' + c.id + '\')">저장</button>'
        + '<button class="board-btn board-btn-ghost board-btn-sm" onclick="closeCommentEdit(\'' + c.id + '\')">취소</button>'
        + '</div></div></div>';
    }).join('');
  }

  listEl.innerHTML = html;

  var formEl  = document.getElementById('bdCommentForm');
  var loginEl = document.getElementById('bdCommentLoginMsg');
  if (_boardUser.loggedIn) { formEl.style.display = ''; loginEl.style.display = 'none'; }
  else { formEl.style.display = 'none'; loginEl.style.display = ''; }

  var delBtn = document.getElementById('bdDeleteBtn');
  if (_boardUser.loggedIn && item.is_mine) delBtn.style.display = '';
  else delBtn.style.display = 'none';

  document.getElementById('boardListView').style.display   = 'none';
  document.getElementById('boardWriteView').style.display  = 'none';
  document.getElementById('boardDetailView').style.display = '';
}

function boardBackToList() {
  _boardPostId = null;
  document.getElementById('boardDetailView').style.display = 'none';
  document.getElementById('boardWriteView').style.display  = 'none';
  document.getElementById('boardListView').style.display   = '';
  boardLoad(_boardPage);
}

function boardSearch() { _boardKw = (document.getElementById('boardKw').value || '').trim(); boardLoad(1); }
function boardReset() { _boardKw = ''; document.getElementById('boardKw').value = ''; boardLoad(1); }

function openBoardWrite() {
  if (!_boardUser.loggedIn) { openBoardLogin(); return; }
  document.getElementById('boardListView').style.display   = 'none';
  document.getElementById('boardDetailView').style.display = 'none';
  document.getElementById('boardWriteView').style.display  = '';
  ['bwPhone', 'bwTitle', 'bwContent'].forEach(function (id) { document.getElementById(id).value = ''; });
  var sel = document.getElementById('bwCategory'); if (sel) sel.value = '';
}
function boardCancelWrite() { document.getElementById('boardWriteView').style.display = 'none'; document.getElementById('boardListView').style.display = ''; }
function toggleSecretPw() { document.getElementById('bwSecretPw').style.display = document.getElementById('bwSecret').checked ? '' : 'none'; }

async function submitBoardPost() {
  if (!_boardUser.loggedIn) { openBoardLogin(); return; }
  var phone      = (document.getElementById('bwPhone').value   || '').trim();
  var categoryId = (document.getElementById('bwCategory').value || '').trim();
  var title      = (document.getElementById('bwTitle').value   || '').trim();
  var content    = (document.getElementById('bwContent').value || '').trim();
  if (!phone)      { alert('핸드폰 번호를 입력하세요.'); return; }
  if (!categoryId) { alert('분류를 선택하세요.'); return; }
  if (!title)      { alert('제목을 입력하세요.'); return; }
  if (!content)    { alert('내용을 입력하세요.'); return; }
  try {
    var res = await fetch('/admin/api_front/board_posts.php', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, category_id: categoryId, title: title, content: content })
    });
    var data = await res.json();
    if (data.ok) { boardCancelWrite(); boardLoad(1); }
    else alert(data.error || '등록 실패');
  } catch (e) { alert('오류 발생'); }
}

async function submitBoardComment() {
  if (!_boardUser.loggedIn || !_boardPostId) return;
  var content = (document.getElementById('bdCommentTa').value || '').trim();
  if (!content) { alert('댓글 내용을 입력하세요.'); return; }
  try {
    var res = await fetch('/admin/api_front/board_comments.php', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: _boardPostId, content: content })
    });
    var data = await res.json();
    if (data.ok) { document.getElementById('bdCommentTa').value = ''; boardFetchPost(_boardPostId); }
    else alert(data.error || '댓글 등록 실패');
  } catch (e) { alert('오류 발생'); }
}

function openCommentEdit(id) {
  document.getElementById('bcc-' + id).style.display  = 'none';
  document.getElementById('bcef-' + id).style.display = '';
  var ta = document.getElementById('bceta-' + id);
  if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
}
function closeCommentEdit(id) {
  document.getElementById('bcef-' + id).style.display = 'none';
  document.getElementById('bcc-' + id).style.display  = '';
}
async function submitCommentEdit(id) {
  var ta = document.getElementById('bceta-' + id);
  var content = (ta ? ta.value : '').trim();
  if (!content) { alert('내용을 입력하세요.'); return; }
  try {
    var res = await fetch('/admin/api_front/board_comments.php?id=' + encodeURIComponent(id), {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: content })
    });
    var data = await res.json();
    if (data.ok) boardFetchPost(_boardPostId);
    else alert(data.error || '수정 실패');
  } catch (e) { alert('오류 발생'); }
}
async function deleteComment(id) {
  if (!confirm('이 댓글을 삭제합니까?')) return;
  try {
    var res = await fetch('/admin/api_front/board_comments.php?id=' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' });
    var data = await res.json();
    if (data.ok) boardFetchPost(_boardPostId);
    else alert(data.error || '삭제 실패');
  } catch (e) { alert('오류 발생'); }
}
async function deleteBoardPost() {
  if (!_boardPostId || !_boardUser.loggedIn) return;
  if (!confirm('이 게시글을 삭제합니까?')) return;
  try {
    var res = await fetch('/admin/api_front/board_posts.php?id=' + encodeURIComponent(_boardPostId), { method: 'DELETE', credentials: 'include' });
    var data = await res.json();
    if (data.ok) boardBackToList();
    else alert(data.error || '삭제 실패');
  } catch (e) { alert('오류 발생'); }
}

function openBoardLogin()  { document.getElementById('boardLoginModal').style.display = 'flex'; }
function closeBoardLogin() { document.getElementById('boardLoginModal').style.display = 'none'; }

function boardSocialLogin(provider) {
  if (provider === 'kakao')  { boardKakaoLoginInit(); return; }
  if (provider === 'naver')  { boardNaverLogin();     return; }
  if (provider === 'google') { boardGoogleLogin();    return; }
}

function boardKakaoLoginInit() {
  var _tries = 0;
  function _tryKakao() {
    _tries++;
    if (typeof Kakao !== 'undefined') {
      var key = _socialKeys.kakao;
      if (!key) { alert('카카오 앱 키가 설정되지 않았습니다. 관리자에게 문의하세요.'); return; }
      if (!Kakao.isInitialized()) Kakao.init(key);
      boardKakaoLogin();
    } else if (_tries < 20) {
      setTimeout(_tryKakao, 300);
    } else {
      alert('카카오 로그인을 불러오지 못했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
    }
  }
  _tryKakao();
}
function boardKakaoLogin() {
  if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) { alert('카카오 SDK 초기화 실패. 페이지를 새로고침 해주세요.'); return; }
  Kakao.Auth.login({
    success: function (authObj) { boardSendToken('kakao', authObj.access_token); },
    fail: function (err) { alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.'); }
  });
}

var _naverLoginObj = null, _naverReady = false;
function _naverPreInit() {
  if (typeof naver === 'undefined' || !naver.LoginWithNaverId) return;
  if (_naverLoginObj) return;
  var key = _socialKeys.naver;
  if (!key) return;
  _naverLoginObj = new naver.LoginWithNaverId({
    clientId: key,
    callbackUrl: location.protocol + '//' + location.host + location.pathname + '?naver_callback=1',
    isPopup: true,
    loginButton: { color: 'green', type: 3, height: 48 }
  });
  _naverLoginObj.init();
  var _checkCount = 0;
  var _checkTimer = setInterval(function () {
    _checkCount++;
    if (document.querySelector('#naver_id_login a')) { _naverReady = true; clearInterval(_checkTimer); }
    if (_checkCount > 20) clearInterval(_checkTimer);
  }, 100);
}
function boardNaverLogin() {
  if (typeof naver === 'undefined' || !naver.LoginWithNaverId) { alert('네이버 로그인 SDK 로드 중입니다. 잠시 후 다시 시도해주세요.'); return; }
  if (!_socialKeys.naver) { alert('네이버 Client ID가 설정되지 않았습니다. 관리자에게 문의하세요.'); return; }
  if (!_naverLoginObj) _naverPreInit();
  var _tries = 0;
  var _wait = setInterval(function () {
    _tries++;
    var anchor = document.querySelector('#naver_id_login a');
    if (anchor) { clearInterval(_wait); anchor.click(); }
    else if (_tries > 15) { clearInterval(_wait); alert('네이버 로그인 버튼 준비에 실패했습니다. 새로고침 후 다시 시도해주세요.'); }
  }, 100);
}
(function naverCallbackCheck() {
  var hash = window.location.hash;
  if (hash && hash.indexOf('access_token') > -1) {
    var params = {};
    hash.replace(/^#/, '').split('&').forEach(function (kv) { var p = kv.split('='); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
    if (params.access_token) { history.replaceState(null, '', window.location.pathname); boardSendToken('naver', params.access_token); }
  }
})();

var _googleInitialized = false;
function boardGoogleLogin() {
  if (typeof google === 'undefined' || !google.accounts) { alert('구글 로그인 SDK 로드 중입니다. 잠시 후 다시 시도해주세요.'); return; }
  var key = _socialKeys.google;
  if (!key) { alert('구글 Client ID가 설정되지 않았습니다. 관리자에게 문의하세요.'); return; }
  _googleInitialized = false; google.accounts.id.cancel(); google.accounts.id.disableAutoSelect();
  google.accounts.id.initialize({
    client_id: key,
    callback: function (resp) { boardSendToken('google', resp.credential); },
    auto_select: false, cancel_on_tap_outside: true
  });
  google.accounts.id.prompt(function (notification) {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      var parent = document.createElement('div');
      parent.id = '_g_btn_wrap';
      parent.style.cssText = 'position:fixed;z-index:9999;top:50%;left:50%;transform:translate(-50%,-50%)';
      document.body.appendChild(parent);
      google.accounts.id.renderButton(parent, { type: 'standard', shape: 'rectangular', theme: 'outline', text: 'signin_with', size: 'large', locale: 'ko' });
      setTimeout(function () {
        var btn = parent.querySelector('div[role="button"]');
        if (btn) btn.click();
        setTimeout(function () { if (parent.parentNode) parent.parentNode.removeChild(parent); }, 5000);
      }, 150);
    }
  });
}

async function boardSendToken(provider, token) {
  try {
    var res = await fetch('/admin/api_front/user_auth.php', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: provider, token: token })
    });
    var data = await res.json();
    if (data.ok) {
      _boardUser = { loggedIn: true, id: data.user.id, name: data.user.name, provider: data.user.provider };
      boardUpdateLoginUI(); closeBoardLogin(); boardLoad(_boardPage);
    } else alert(data.error || '로그인 실패');
  } catch (e) { alert('로그인 처리 중 오류'); }
}

async function boardLogout() {
  var prevProvider = _boardUser.provider;
  try { await fetch('/admin/api_front/user_auth.php?action=logout', { method: 'POST', credentials: 'include' }); } catch (e) {}
  if (prevProvider === 'google' && typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect(); google.accounts.id.cancel();
    try { google.accounts.id.revoke('', function () {}); } catch (e) {}
    _googleInitialized = false;
  }
  _boardUser = { loggedIn: false, id: '', name: '', provider: '' };
  boardUpdateLoginUI(); boardBackToList();
}

(function () {
  var boardSec = document.getElementById('board');
  if (!boardSec) return;
  var _boardInitDone = false;
  function _runBoardInit() { if (_boardInitDone) return; _boardInitDone = true; boardInit(); }
  var rect = boardSec.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) { _runBoardInit(); return; }
  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { _runBoardInit(); obs.disconnect(); }
  }, { threshold: 0.02 });
  obs.observe(boardSec);
  if (window.location.hash && window.location.hash.indexOf('board') > -1) setTimeout(_runBoardInit, 200);
})();

window.addEventListener('load', function () { setTimeout(function() { if (_socialKeys.naver) _naverPreInit(); }, 500); });