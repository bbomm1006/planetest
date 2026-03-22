/* ═══════════════════════════════════════
   video-reviews.js — 영상 & 리뷰 슬라이더
   · 무한 루프 (양방향)
   · PC: 카드 2개씩 → dots = ceil(n/2)
   · 모바일(≤768px): 카드 1개씩 → dots = n개
═══════════════════════════════════════ */

/* ─── 유튜브 헬퍼 ─── */
function getYtId(url) {
  if (!url) return null;
  var m = url.match(/youtu\.be\/([A-Za-z0-9_\-]{11})/);
  if (m) return m[1];
  m = url.match(/[?&]v=([A-Za-z0-9_\-]{11})/);
  if (m) return m[1];
  m = url.match(/embed\/([A-Za-z0-9_\-]{11})/);
  if (m) return m[1];
  return null;
}
function ytThumb(id) {
  return 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
}
function ytThumbFallback(img, id) {
  img.onerror = function() { this.style.display = 'none'; };
  img.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
}

/** flex row gap → px (영상/후기 트랙 공통) */
function vrTrackGapPx(track) {
  if (!track) return 22;
  var g = getComputedStyle(track).gap || '22px';
  var n = parseFloat(String(g).split(/\s+/)[0], 10);
  return isNaN(n) ? 22 : n;
}
/**
 * 트랙 실제 콘텐츠 너비(카드+gap 합). 모바일 WebKit은 flex 트랙의 scrollWidth가 틀리는 경우가 많아 수동 합산.
 */
function vrTotalContentWidth(track) {
  if (!track || !track.children.length) return 0;
  var gap = vrTrackGapPx(track);
  var sum = 0;
  for (var i = 0; i < track.children.length; i++) {
    var el = track.children[i];
    var w = el.offsetWidth;
    if (w < 1) w = el.getBoundingClientRect().width;
    sum += w;
    if (i < track.children.length - 1) sum += gap;
  }
  return sum;
}
function vrIsMobileLayout() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(max-width:768px)').matches;
}
/** PC: 2개씩 / 모바일: 1개씩 — 한 페이지에 표시되는 카드 수 */
function vrCardsPerPage() {
  return vrIsMobileLayout() ? 1 : 2;
}
/** 총 페이지 수 */
function vrPageCount(n) {
  return Math.max(1, Math.ceil(n / vrCardsPerPage()));
}
/** 카드 인덱스 → 페이지 인덱스 */
function vrCardToPage(cardIdx) {
  return Math.floor(cardIdx / vrCardsPerPage());
}
/** 페이지 인덱스 → 카드 인덱스(첫 번째 카드) */
function vrPageToCard(pageIdx) {
  return pageIdx * vrCardsPerPage();
}
/** 모바일에서 트랙에 명시 px 너비(또는 해제) — PC는 % 카드 레이아웃 유지 */
function vrEnsureTrackInlineWidth(track, wrap) {
  if (!track || !wrap) return;
  if (vrIsMobileLayout()) {
    var tw = vrTotalContentWidth(track);
    if (tw > wrap.clientWidth + 0.5) {
      track.style.width = Math.ceil(tw) + 'px';
    } else {
      track.style.width = '';
    }
  } else {
    track.style.width = '';
  }
}
function vrMaxScrollAmount(track, wrap) {
  if (!track || !wrap) return 0;
  var w = wrap.clientWidth;
  var sum = vrTotalContentWidth(track);
  var sw = track.scrollWidth || 0;
  var ow = track.offsetWidth || 0;
  var contentW = Math.max(sum, sw, ow);
  return Math.max(0, contentW - w);
}
/** 카드 idx번째가 뷰포트 왼쪽에 오도록 이동할 px (카드0 = 0) */
function vrOffsetToIndex(track, idx) {
  if (!track || idx <= 0) return 0;
  var gap = vrTrackGapPx(track);
  var x = 0;
  for (var i = 0; i < idx && i < track.children.length; i++) {
    x += track.children[i].offsetWidth + gap;
  }
  return x;
}
function vrMaxScrollIndex(track, wrap, n) {
  if (!track || !wrap || n < 1) return 0;
  var maxTx = vrMaxScrollAmount(track, wrap);
  if (maxTx <= 1) return 0;
  var maxI = 0;
  for (var i = 0; i < n; i++) {
    if (vrOffsetToIndex(track, i) <= maxTx + 1) maxI = i;
  }
  return maxI;
}
/** 트랙이 래퍼보다 넓을 때만 좌우 롤링(화살표+도트) 표시 — PC/모바일 동일 */
function vrCanRoll(track, wrap) {
  return vrMaxScrollAmount(track, wrap) > 1;
}
function vrUpdateRollingNav(wrap, track, cur, maxI) {
  if (!wrap || !track) return;
  var nav = wrap.parentElement && wrap.parentElement.querySelector('.vnav, .rvnav');
  if (!nav) return;
  if (!vrCanRoll(track, wrap)) {
    nav.style.display = 'none';
    nav.setAttribute('aria-hidden', 'true');
    return;
  }
  nav.style.display = '';
  nav.removeAttribute('aria-hidden');
  var btns = nav.querySelectorAll('.vnarr, .rvnarr');
  if (btns.length < 2) return;
  /* 롤링 가능(maxI≥1)이면 무한 루프 — 양쪽 화살표 항상 활성 */
  var atStart = false;
  var atEnd = false;
  btns[0].style.opacity = atStart ? '0.35' : '';
  btns[0].style.pointerEvents = atStart ? 'none' : '';
  btns[1].style.opacity = atEnd ? '0.35' : '';
  btns[1].style.pointerEvents = atEnd ? 'none' : '';
}

/* ─── 영상 ─── */
var vidCur = 0, vidItems = [];
function renderVideos(data) {
  vidItems = (data.videos || [])
    .filter(function (v) { return v.active && v.youtubeUrl; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  var wrap = document.getElementById('vwrap');
  var vidTotalEl = document.getElementById('vidTotalInfo');
  if (vidTotalEl) vidTotalEl.innerHTML = '전체 <strong>' + vidItems.length + '</strong>건';
  if (!vidItems.length) {
    wrap.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.3);padding:50px 0">등록된 영상이 없습니다.</p>';
    document.getElementById('vdots').innerHTML = '';
    var vnavEmpty = wrap.parentElement && wrap.parentElement.querySelector('.vnav');
    if (vnavEmpty) { vnavEmpty.style.display = 'none'; vnavEmpty.setAttribute('aria-hidden', 'true'); }
    return;
  }
  wrap.innerHTML = '<div class="vtrack" id="vtrack">'
    + vidItems.map(function (v, i) {
      var ytId = getYtId(v.youtubeUrl);
      var thumb = ytId ? ytThumb(ytId) : '';
      return '<div class="vcard">'
        + '<div class="vthumb" onclick="playVid(' + i + ')" id="vt-' + i + '">'
        + (thumb ? '<img class="vtimg" id="vthumb-' + i + '" src="' + thumb + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<div class="vt-ov"><div class="vplay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>'
        + '</div>'
        + '<div class="vinf"><div class="vtitle">' + esc(v.title || '') + '</div>'
        + (v.desc ? '<div class="vdesc">' + esc(v.desc) + '</div>' : '')
        + '</div></div>';
    }).join('')
    + '</div>';
  document.getElementById('vdots').innerHTML = (function() {
    var pages = vrPageCount(vidItems.length);
    var html = '';
    for (var p = 0; p < pages; p++) {
      html += '<div class="vdot' + (p === 0 ? ' on' : '') + '" onclick="vidGoToPage(' + p + ')"></div>';
    }
    return html;
  })();
  vidCur = 0;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      vidGoTo(0, true);
      setTimeout(function () { vidGoTo(vidCur, true); }, 0);
      var tr = document.getElementById('vtrack');
      if (tr) {
        tr.querySelectorAll('img').forEach(function (img) {
          img.addEventListener('load', function () { vidGoTo(vidCur, true); }, { once: true });
        });
      }
      vrBindSwipe(document.getElementById('vwrap'), true);
    });
  });
}
function playVid(i) {
  if (typeof window.__vrBlockVidClickUntil === 'number' && Date.now() < window.__vrBlockVidClickUntil) return;
  var ytId = getYtId(vidItems[i].youtubeUrl);
  if (!ytId) return;
  document.getElementById('vmodTitle').textContent = vidItems[i].title || '';
  document.getElementById('vmodIframe').src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
  document.getElementById('vidModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVidModal() {
  document.getElementById('vidModal').classList.remove('open');
  document.getElementById('vmodIframe').src = '';
  document.body.style.overflow = '';
}
function vidGoToPage(pageIdx) {
  vidGoTo(vrPageToCard(pageIdx), false);
}
function vidGoTo(idx, instant) {
  var track = document.getElementById('vtrack');
  var wrap = document.getElementById('vwrap');
  if (!track || !wrap || !vidItems.length) return;
  vrEnsureTrackInlineWidth(track, wrap);
  var n = vidItems.length;
  var maxTx = vrMaxScrollAmount(track, wrap);
  vidCur = Math.max(0, Math.min(parseInt(idx, 10) || 0, n - 1));
  var tx = Math.min(vrOffsetToIndex(track, vidCur), maxTx);
  track.style.transition = instant ? 'none' : '';
  track.style.transform = 'translateX(' + (-tx) + 'px)';
  /* dots: 현재 카드가 속한 페이지 기준 */
  var curPage = vrCardToPage(vidCur);
  document.querySelectorAll('.vdot').forEach(function (d, i) { d.classList.toggle('on', i === curPage); });
  vrUpdateRollingNav(wrap, track, vidCur, n - 1);
}
function vidNav(dir) {
  var track = document.getElementById('vtrack');
  var wrap = document.getElementById('vwrap');
  if (!vrCanRoll(track, wrap)) return;
  var n = vidItems.length;
  var pages = vrPageCount(n);
  var curPage = vrCardToPage(vidCur);
  var nextPage = curPage + dir;
  /* 무한 루프 */
  if (nextPage >= pages) nextPage = 0;
  if (nextPage < 0) nextPage = pages - 1;
  vidGoTo(vrPageToCard(nextPage), false);
}

/* ─── 리뷰 ─── */
var rvCur = 0, rvItems = [], _rvAllItems = [];
var _rvKw = '', _rvCat = '', _rvField = 'all';

function rvFilteredItems() {
  return _rvAllItems.filter(function(r) {
    var catOk = !_rvCat || (r.category || '') === _rvCat;
    var kwOk  = !_rvKw;
    if (_rvKw) {
      var kl = _rvKw.toLowerCase();
      if (_rvField === 'title')   kwOk = (r.title||r.name||'').toLowerCase().includes(kl);
      else if (_rvField === 'content') kwOk = (r.text||'').toLowerCase().includes(kl);
      else kwOk = (r.title||r.name||'').toLowerCase().includes(kl) || (r.text||'').toLowerCase().includes(kl);
    }
    return catOk && kwOk;
  });
}

function rvSearch() {
  _rvKw    = (document.getElementById('rvKwInp')||{value:''}).value.trim();
  _rvCat   = (document.getElementById('rvCatSel')||{value:''}).value;
  _rvField = (document.getElementById('rvFieldSel')||{value:'all'}).value;
  rvItems  = rvFilteredItems();
  rvCur    = 0;
  _rebuildRvSlider();
}

function _rebuildRvSlider() {
  var totalEl = document.getElementById('rvTotalInfo');
  if (totalEl) totalEl.innerHTML = (_rvKw || _rvCat) ? '검색 결과 <strong>' + rvItems.length + '</strong>건' : '전체 <strong>' + _rvAllItems.length + '</strong>건';
  var wrap = document.getElementById('rvwrap');
  if (!wrap) return;
  if (!rvItems.length) {
    wrap.innerHTML = '<p style="text-align:center;color:var(--g4);padding:40px">검색 결과가 없습니다.</p>';
    document.getElementById('rvdots').innerHTML = '';
    var rvnav = wrap.parentElement && wrap.parentElement.querySelector('.rvnav');
    if (rvnav) { rvnav.style.display = 'none'; rvnav.setAttribute('aria-hidden','true'); }
    return;
  }
  wrap.innerHTML = '<div class="rvtrack" id="rvtrack">'
    + rvItems.map(function(r) {
      var stars = '★'.repeat(r.rating || 5) + '☆'.repeat(Math.max(0, 5 - (r.rating || 5)));
      var thumbHtml = r.imageUrl ? '<div class="rv-thumb"><img src="' + esc(r.imageUrl) + '" alt=""></div>' : '';
      return '<div class="rvc">' + thumbHtml
        + '<div class="rv-body">'
        + '<div class="rv-top"><div class="rv-mt">'
        + '<div class="rv-nm">' + esc(maskName(r.name || '')) + '</div>'
        + '<div class="rv-stars">' + stars + '</div>'
        + '<div class="rv-dt">' + esc(r.date || '') + '</div>'
        + '</div></div>'
        + '<div class="rv-txt">' + esc(r.text || '') + '</div>'
        + '<div class="rv-ok"><svg viewBox="0 0 16 16" fill="#10b981"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6L7 10.5 4.5 8l1-1L7 8.5l4-4 1 1.5z"/></svg>실제 구매 고객</div>'
        + '</div></div>';
    }).join('')
    + '</div>';
  document.getElementById('rvdots').innerHTML = (function() {
    var pages = vrPageCount(rvItems.length);
    var html = '';
    for (var p = 0; p < pages; p++) {
      html += '<div class="rvdot' + (p === 0 ? ' on' : '') + '" onclick="rvGoToPage(' + p + ')"></div>';
    }
    return html;
  })();
  rvCur = 0;
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      rvGoTo(0, true);
      setTimeout(function() { rvGoTo(rvCur, true); }, 0);
      var tr = document.getElementById('rvtrack');
      if (tr) {
        tr.querySelectorAll('img').forEach(function(img) {
          img.addEventListener('load', function() { rvGoTo(rvCur, true); }, { once: true });
        });
      }
      vrBindSwipe(document.getElementById('rvwrap'), false);
    });
  });
}

function renderReviews(data) {
  _rvAllItems = (data.reviews || [])
    .filter(function (r) { return r.active; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  // 분류 셀렉트 채우기
  var catSel = document.getElementById('rvCatSel');
  if (catSel) {
    var cats = {}, catArr = [];
    _rvAllItems.forEach(function(r) { var c = r.category || ''; if (c && !cats[c]) { cats[c] = true; catArr.push(c); } });
    catArr.forEach(function(c) { var o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });
  }

  rvItems = _rvAllItems.slice();
  var totalEl = document.getElementById('rvTotalInfo');
  if (totalEl) totalEl.innerHTML = '전체 <strong>' + _rvAllItems.length + '</strong>건';
  var wrap = document.getElementById('rvwrap');
  if (!rvItems.length) {
    wrap.innerHTML = '<p style="text-align:center;color:var(--g4);padding:40px">등록된 후기가 없습니다.</p>';
    document.getElementById('rvdots').innerHTML = '';
    var rvnavEmpty = wrap.parentElement && wrap.parentElement.querySelector('.rvnav');
    if (rvnavEmpty) { rvnavEmpty.style.display = 'none'; rvnavEmpty.setAttribute('aria-hidden', 'true'); }
    return;
  }

  wrap.innerHTML = '<div class="rvtrack" id="rvtrack">'
    + rvItems.map(function (r) {
      var stars = '★'.repeat(r.rating || 5) + '☆'.repeat(Math.max(0, 5 - (r.rating || 5)));
      var thumbHtml = r.imageUrl ? '<div class="rv-thumb"><img src="' + esc(r.imageUrl) + '" alt=""></div>' : '';
      return '<div class="rvc">' + thumbHtml
        + '<div class="rv-body">'
        + '<div class="rv-top"><div class="rv-mt">'
        + '<div class="rv-nm">' + esc(maskName(r.name || '')) + '</div>'
        + '<div class="rv-stars">' + stars + '</div>'
        + '<div class="rv-dt">' + esc(r.date || '') + '</div>'
        + '</div></div>'
        + '<div class="rv-txt">' + esc(r.text || '') + '</div>'
        + '<div class="rv-ok"><svg viewBox="0 0 16 16" fill="#10b981"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6L7 10.5 4.5 8l1-1L7 8.5l4-4 1 1.5z"/></svg>실제 구매 고객</div>'
        + '</div></div>';
    }).join('')
    + '</div>';

  document.getElementById('rvdots').innerHTML = (function() {
    var pages = vrPageCount(rvItems.length);
    var html = '';
    for (var p = 0; p < pages; p++) {
      html += '<div class="rvdot' + (p === 0 ? ' on' : '') + '" onclick="rvGoToPage(' + p + ')"></div>';
    }
    return html;
  })();

  rvCur = 0;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      rvGoTo(0, true);
      setTimeout(function () { rvGoTo(rvCur, true); }, 0);
      var tr = document.getElementById('rvtrack');
      if (tr) {
        tr.querySelectorAll('img').forEach(function (img) {
          img.addEventListener('load', function () { rvGoTo(rvCur, true); }, { once: true });
        });
      }
      vrBindSwipe(document.getElementById('rvwrap'), false);
    });
  });
}

function rvGoToPage(pageIdx) {
  rvGoTo(vrPageToCard(pageIdx), false);
}
function rvGoTo(idx, instant) {
  var track = document.getElementById('rvtrack');
  var wrap = document.getElementById('rvwrap');
  if (!track || !wrap || !rvItems.length) return;
  vrEnsureTrackInlineWidth(track, wrap);
  var n = rvItems.length;
  var maxTx = vrMaxScrollAmount(track, wrap);
  rvCur = Math.max(0, Math.min(parseInt(idx, 10) || 0, n - 1));
  var tx = Math.min(vrOffsetToIndex(track, rvCur), maxTx);
  track.style.transition = instant ? 'none' : '';
  track.style.transform = 'translateX(' + (-tx) + 'px)';
  /* dots: 현재 카드가 속한 페이지 기준 */
  var curPage = vrCardToPage(rvCur);
  document.querySelectorAll('.rvdot').forEach(function (d, i) { d.classList.toggle('on', i === curPage); });
  vrUpdateRollingNav(wrap, track, rvCur, n - 1);
}

function rvNav(dir) {
  var track = document.getElementById('rvtrack');
  var wrap = document.getElementById('rvwrap');
  if (!vrCanRoll(track, wrap)) return;
  var n = rvItems.length;
  var pages = vrPageCount(n);
  var curPage = vrCardToPage(rvCur);
  var nextPage = curPage + dir;
  /* 무한 루프 */
  if (nextPage >= pages) nextPage = 0;
  if (nextPage < 0) nextPage = pages - 1;
  rvGoTo(vrPageToCard(nextPage), false);
}

/** 모바일 스와이프(영상/후기 공통) — vwrap·rvwrap에 1회만 바인딩 */
function vrBindSwipe(wrap, isVideo) {
  if (!wrap || wrap.dataset.vrSwipeBound === '1') return;
  wrap.dataset.vrSwipeBound = '1';
  var startX = 0;
  var baseTx = 0;
  var active = false;
  var moved = false;

  function getTrack() {
    return document.getElementById(isVideo ? 'vtrack' : 'rvtrack');
  }
  function goSnap(instant) {
    if (isVideo) vidGoTo(vidCur, instant);
    else rvGoTo(rvCur, instant);
  }
  function goStep(delta) {
    if (isVideo) {
      var vtr = document.getElementById('vtrack');
      var vwp = document.getElementById('vwrap');
      if (vidItems.length > 1 && vrCanRoll(vtr, vwp)) {
        var vpages = vrPageCount(vidItems.length);
        var vcurPage = vrCardToPage(vidCur);
        var vnextPage = vcurPage + delta;
        if (vnextPage >= vpages) vnextPage = 0;
        if (vnextPage < 0) vnextPage = vpages - 1;
        vidGoTo(vrPageToCard(vnextPage), false);
        return;
      }
      vidGoTo(vidCur + delta, false);
    } else {
      var rtr = document.getElementById('rvtrack');
      var rwp = document.getElementById('rvwrap');
      if (rvItems.length > 1 && vrCanRoll(rtr, rwp)) {
        var rpages = vrPageCount(rvItems.length);
        var rcurPage = vrCardToPage(rvCur);
        var rnextPage = rcurPage + delta;
        if (rnextPage >= rpages) rnextPage = 0;
        if (rnextPage < 0) rnextPage = rpages - 1;
        rvGoTo(vrPageToCard(rnextPage), false);
        return;
      }
      rvGoTo(rvCur + delta, false);
    }
  }
  function currentTx(track, w) {
    var cur = isVideo ? vidCur : rvCur;
    var maxTx = vrMaxScrollAmount(track, w);
    return Math.min(vrOffsetToIndex(track, cur), maxTx);
  }

  wrap.addEventListener('touchstart', function (e) {
    if (!vrIsMobileLayout()) return;
    if (e.touches.length !== 1) return;
    var track = getTrack();
    if (!track) return;
    vrEnsureTrackInlineWidth(track, wrap);
    if (!vrCanRoll(track, wrap)) return;
    active = true;
    moved = false;
    startX = e.touches[0].clientX;
    baseTx = currentTx(track, wrap);
  }, { passive: true });

  wrap.addEventListener('touchmove', function (e) {
    if (!vrIsMobileLayout()) return;
    if (!active || e.touches.length !== 1) return;
    var track = getTrack();
    if (!track) return;
    var dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 10) {
      moved = true;
      e.preventDefault();
    }
    var maxTx = vrMaxScrollAmount(track, wrap);
    var raw = baseTx - dx;
    raw = Math.max(0, Math.min(raw, maxTx));
    track.style.transition = 'none';
    track.style.transform = 'translateX(' + (-raw) + 'px)';
  }, { passive: false });

  function endSwipe(clientX) {
    if (!active) return;
    active = false;
    var track = getTrack();
    if (!track) return;
    var dx = clientX - startX;
    if (moved && Math.abs(dx) > 40) {
      if (isVideo) window.__vrBlockVidClickUntil = Date.now() + 450;
      goStep(dx < 0 ? 1 : -1);
    } else {
      goSnap(true);
    }
    moved = false;
  }

  wrap.addEventListener('touchend', function (e) {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    endSwipe(e.changedTouches[0].clientX);
  }, { passive: true });

  wrap.addEventListener('touchcancel', function () {
    if (!active) return;
    active = false;
    moved = false;
    goSnap(true);
  }, { passive: true });
}

(function () {
  var t = null;
  var _lastMobile = null;

  function vrRebuildDots(items, dotSel, goToPageFn) {
    var pages = vrPageCount(items.length);
    var container = document.getElementById(dotSel);
    if (!container) return;
    /* 현재 on 인덱스 보존 */
    var curOnIdx = 0;
    container.querySelectorAll('.' + dotSel.replace('s','') ).forEach(function(d, i) {
      if (d.classList.contains('on')) curOnIdx = i;
    });
    var isRv = dotSel === 'rvdots';
    var dotClass = isRv ? 'rvdot' : 'vdot';
    var fnName = isRv ? 'rvGoToPage' : 'vidGoToPage';
    var html = '';
    for (var p = 0; p < pages; p++) {
      html += '<div class="' + dotClass + (p === curOnIdx ? ' on' : '') + '" onclick="' + fnName + '(' + p + ')"></div>';
    }
    container.innerHTML = html;
  }

  function vrRelayout() {
    var isMobile = vrIsMobileLayout();
    var layoutChanged = (_lastMobile !== null && _lastMobile !== isMobile);
    _lastMobile = isMobile;

    if (document.getElementById('vtrack') && vidItems.length) {
      vrBindSwipe(document.getElementById('vwrap'), true);
      if (layoutChanged) vrRebuildDots(vidItems, 'vdots', vidGoToPage);
      vidGoTo(vidCur, true);
    }
    if (document.getElementById('rvtrack') && rvItems.length) {
      vrBindSwipe(document.getElementById('rvwrap'), false);
      if (layoutChanged) vrRebuildDots(rvItems, 'rvdots', rvGoToPage);
      rvGoTo(rvCur, true);
    }
  }
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(vrRelayout, 120);
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(vrRelayout, 280);
  });
})();