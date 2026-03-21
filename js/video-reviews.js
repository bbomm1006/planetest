/* ═══════════════════════════════════════
   video-reviews.js — 영상 & 리뷰 슬라이더
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
  return typeof window.matchMedia === 'function' && window.matchMedia('(max-width:960px)').matches;
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
  document.getElementById('vdots').innerHTML = vidItems.map(function (_, i) {
    return '<div class="vdot' + (i === 0 ? ' on' : '') + '" onclick="vidGoTo(' + i + ')"></div>';
  }).join('');
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
  document.querySelectorAll('.vdot').forEach(function (d, i) { d.classList.toggle('on', i === vidCur); });
  vrUpdateRollingNav(wrap, track, vidCur, n - 1);
}
function vidNav(dir) {
  var track = document.getElementById('vtrack');
  var wrap = document.getElementById('vwrap');
  if (!vrCanRoll(track, wrap)) return;
  var n = vidItems.length;
  if (n > 1) {
    if (dir > 0 && vidCur >= n - 1) { vidGoTo(0, false); return; }
    if (dir < 0 && vidCur <= 0)     { vidGoTo(n - 1, false); return; }
  }
  vidGoTo(vidCur + dir, false);
}

/* ─── 리뷰 ─── */
var rvCur = 0, rvItems = [];

function renderReviews(data) {
  rvItems = (data.reviews || [])
    .filter(function (r) { return r.active; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

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

  document.getElementById('rvdots').innerHTML = rvItems.map(function (_, i) {
    return '<div class="rvdot' + (i === 0 ? ' on' : '') + '" onclick="rvGoTo(' + i + ')"></div>';
  }).join('');

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
  document.querySelectorAll('.rvdot').forEach(function (d, i) { d.classList.toggle('on', i === rvCur); });
  vrUpdateRollingNav(wrap, track, rvCur, n - 1);
}

function rvNav(dir) {
  var track = document.getElementById('rvtrack');
  var wrap = document.getElementById('rvwrap');
  if (!vrCanRoll(track, wrap)) return;
  var n = rvItems.length;
  if (n > 1) {
    if (dir > 0 && rvCur >= n - 1) { rvGoTo(0, false); return; }
    if (dir < 0 && rvCur <= 0)     { rvGoTo(n - 1, false); return; }
  }
  rvGoTo(rvCur + dir, false);
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
        if (delta > 0 && vidCur >= vidItems.length - 1) { vidGoTo(0, false); return; }
        if (delta < 0 && vidCur <= 0) { vidGoTo(vidItems.length - 1, false); return; }
      }
      vidGoTo(vidCur + delta, false);
    } else {
      var rtr = document.getElementById('rvtrack');
      var rwp = document.getElementById('rvwrap');
      if (rvItems.length > 1 && vrCanRoll(rtr, rwp)) {
        if (delta > 0 && rvCur >= rvItems.length - 1) { rvGoTo(0, false); return; }
        if (delta < 0 && rvCur <= 0) { rvGoTo(rvItems.length - 1, false); return; }
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
  function vrRelayout() {
    if (document.getElementById('vtrack') && vidItems.length) {
      vrBindSwipe(document.getElementById('vwrap'), true);
      vidGoTo(vidCur, true);
    }
    if (document.getElementById('rvtrack') && rvItems.length) {
      vrBindSwipe(document.getElementById('rvwrap'), false);
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