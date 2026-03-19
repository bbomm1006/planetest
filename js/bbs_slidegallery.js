/* ═══════════════════════════════════════
   bbs_slidegallery.js
   — 슬라이드 갤러리 게시판
   — 메인 슬라이더 + 클릭 라이트박스 + 터치/드래그 + 키보드 네비
═══════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 스크롤 잠금 유틸 ── */
  function _lockScroll() {
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
  function _unlockScroll() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  /* ── 상태 ────────────────────────────── */
  var _allPosts   = [];
  var _filtered   = [];
  var _cat        = '';
  var _current    = 0;   // 현재 슬라이드 인덱스
  var _autoTimer  = null;
  var AUTO_INTERVAL = 4000;

  /* 라이트박스 상태 */
  var _lbImages  = [];
  var _lbIdx     = 0;
  var _lbPostIdx = 0;

  /* 터치/드래그 */
  var _touchStartX = 0;
  var _isDragging  = false;
  var _dragStartX  = 0;
  var _dragOffsetX = 0;

  /* ── 유틸 ────────────────────────────── */
  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function attr(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function parseImages(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    try { var arr = JSON.parse(val); if (Array.isArray(arr)) return arr.filter(Boolean); } catch (e) {}
    return val.split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function getImages(p) {
    var imgs = parseImages(p.extra && p.extra['상세이미지'] ? p.extra['상세이미지'] : '');
    if (!imgs.length) {
      var thumb = (p.extra && p.extra['썸네일이미지']) ? p.extra['썸네일이미지'] : '';
      if (thumb) imgs = parseImages(thumb);
    }
    if (!imgs.length && p.imageUrl) imgs = [p.imageUrl];
    return imgs;
  }

  function getThumb(p) {
    var t = (p.extra && p.extra['썸네일이미지']) ? p.extra['썸네일이미지'] : '';
    if (t) return Array.isArray(t) ? t[0] : t;
    var imgs = getImages(p);
    return imgs[0] || '';
  }

  /* ── 오토 플레이 ──────────────────────── */
  function startAuto() {
    stopAuto();
    if (_filtered.length <= 1) return;
    _autoTimer = setInterval(function () {
      _current = (_current + 1) % _filtered.length;
      renderSlider(true);
    }, AUTO_INTERVAL);
  }
  function stopAuto() {
    if (_autoTimer) { clearInterval(_autoTimer); _autoTimer = null; }
  }

  /* ── 초기화 ───────────────────────────── */
  function init(posts) {
    _allPosts = posts;

    /* 분류 탭 */
    var cats = [], seen = {};
    posts.forEach(function (p) {
      var c = p.extra && p.extra['분류'] ? p.extra['분류'] : '';
      if (c && !seen[c]) { seen[c] = true; cats.push(c); }
    });
    var tabs = document.getElementById('sgCatTabs');
    if (tabs && cats.length) {
      tabs.innerHTML = '<button class="sg-ct on" data-cat="">전체</button>'
        + cats.map(function (c) {
          return '<button class="sg-ct" data-cat="' + attr(c) + '">' + esc(c) + '</button>';
        }).join('');
      tabs.querySelectorAll('.sg-ct').forEach(function (btn) {
        btn.addEventListener('click', function () {
          tabs.querySelectorAll('.sg-ct').forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          _cat = btn.getAttribute('data-cat');
          _current = 0;
          applyFilter();
        });
      });
    }
    applyFilter();
  }

  /* ── 필터 + 렌더 ──────────────────────── */
  function applyFilter() {
    _filtered = _allPosts.filter(function (p) {
      return !_cat || (p.extra && p.extra['분류']) === _cat;
    });
    _current = 0;
    buildSlides();
    renderSlider(false);
    buildDots();
    updateInfo();
    startAuto();
  }

  /* ── 슬라이드 DOM 구성 ───────────────── */
  function buildSlides() {
    var track = document.getElementById('sgTrack');
    if (!track) return;
    track.style.transition = 'none';
    track.style.transform  = 'translateX(0)';

    if (!_filtered.length) {
      track.innerHTML = '<div class="sg-empty">등록된 슬라이드가 없습니다.</div>';
      return;
    }

    track.innerHTML = _filtered.map(function (p, i) {
      var thumb = getThumb(p);
      var imgs  = getImages(p);
      var multi = imgs.length > 1;
      var thumbHtml = thumb
        ? '<img src="' + attr(thumb) + '" alt="' + attr(p.title) + '" loading="lazy">'
        : '<div class="sg-slide-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
      return '<div class="sg-slide" data-idx="' + i + '">'
        + '<div class="sg-slide-img">' + thumbHtml + '</div>'
        + (multi ? '<div class="sg-multi-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>' + imgs.length + '</div>' : '')
        + '<div class="sg-slide-overlay">'
        + '</div>'
        + '</div>';
    }).join('');

    /* 클릭 이벤트 */
    track.querySelectorAll('.sg-slide').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(el.getAttribute('data-idx'));
        lbOpen(idx, 0);
      });
    });
  }

  /* ── 슬라이더 위치 이동 ──────────────── */
  function renderSlider(animate) {
    var track = document.getElementById('sgTrack');
    if (!track || !_filtered.length) return;

    track.style.transition = animate ? 'transform .45s cubic-bezier(.22,1,.36,1)' : 'none';
    track.style.transform  = 'translateX(-' + (_current * 100) + '%)';

    /* 화살표 */
    var prev = document.getElementById('sgPrev');
    var next = document.getElementById('sgNext');
    if (prev) prev.style.opacity = _current === 0 ? '0.3' : '1';
    if (next) next.style.opacity = _current === _filtered.length - 1 ? '0.3' : '1';

    updateDots();
    updateInfo();
  }

  /* ── 도트 인디케이터 ─────────────────── */
  function buildDots() {
    var dots = document.getElementById('sgDots');
    if (!dots) return;
    if (_filtered.length <= 1) { dots.innerHTML = ''; return; }
    dots.innerHTML = _filtered.map(function (_, i) {
      return '<button class="sg-dot' + (i === _current ? ' on' : '') + '" data-i="' + i + '" aria-label="슬라이드 ' + (i + 1) + '"></button>';
    }).join('');
    dots.querySelectorAll('.sg-dot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopAuto();
        _current = parseInt(btn.getAttribute('data-i'));
        renderSlider(true);
        startAuto();
      });
    });
  }

  function updateDots() {
    var dots = document.querySelectorAll('#sgDots .sg-dot');
    dots.forEach(function (d) {
      d.classList.toggle('on', parseInt(d.getAttribute('data-i')) === _current);
    });
  }

  /* ── 슬라이드 정보 ───────────────────── */
  function updateInfo() {
    var p = _filtered[_current];
    var cat   = document.getElementById('sgInfoCat');
    var title = document.getElementById('sgInfoTitle');
    var date  = document.getElementById('sgInfoDate');
    if (!p) {
      if (cat)   cat.textContent   = '';
      if (title) title.textContent = '';
      if (date)  date.textContent  = '';
      return;
    }
    if (cat)   { cat.textContent   = (p.extra && p.extra['분류']) || ''; cat.style.display = (p.extra && p.extra['분류']) ? '' : 'none'; }
    if (title) title.textContent = p.title || '';
    if (date)  date.textContent  = (p.date || '').slice(0, 10);
  }

  /* ── 공개 API ─────────────────────────── */
  window.sgMove = function (dir) {
    stopAuto();
    var n = _filtered.length;
    if (!n) return;
    _current = (_current + dir + n) % n;
    renderSlider(true);
    startAuto();
  };

  /* ═══════════════════════════════════════
     LIGHTBOX
  ═══════════════════════════════════════ */
  function lbOpen(postIdx, imgIdx) {
    _lbPostIdx = postIdx;
    var p = _filtered[postIdx];
    if (!p) return;
    _lbImages = getImages(p);
    _lbIdx    = imgIdx || 0;

    lbBuildTrack();
    lbBuildThumbs();
    lbGoTo(_lbIdx, false);
    lbSetInfo(p);

    document.getElementById('sgLightbox').classList.add('open');
    _lockScroll();
  }

  function lbSetInfo(p) {
    var cat     = document.getElementById('sgLbCat');
    var title   = document.getElementById('sgLbTitle');
    var date    = document.getElementById('sgLbDate');
    var content = document.getElementById('sgLbContent');
    if (cat)     { cat.textContent = (p.extra && p.extra['분류']) || ''; cat.style.display = (p.extra && p.extra['분류']) ? '' : 'none'; }
    if (title)   title.textContent = p.title || '';
    if (date)    date.textContent  = (p.date || '').slice(0, 10);
    if (content) content.innerHTML = (p.content || '').replace(/\n/g, '<br>');
  }

  function lbBuildTrack() {
    var track = document.getElementById('sgLbTrack');
    if (!track) return;
    if (!_lbImages.length) {
      track.innerHTML = '<div class="sg-lb-slide"><div class="sg-lb-noimg">이미지가 없습니다.</div></div>';
      return;
    }
    track.innerHTML = _lbImages.map(function (src) {
      return '<div class="sg-lb-slide"><img src="' + attr(src) + '" alt="" draggable="false"></div>';
    }).join('');
  }

  function lbBuildThumbs() {
    var wrap = document.getElementById('sgLbThumbs');
    if (!wrap) return;
    if (_lbImages.length <= 1) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';
    wrap.innerHTML = _lbImages.map(function (src, i) {
      return '<div class="sg-lb-thumb' + (i === _lbIdx ? ' on' : '') + '" data-i="' + i + '">'
        + '<img src="' + attr(src) + '" alt="" loading="lazy">'
        + '</div>';
    }).join('');
    wrap.querySelectorAll('.sg-lb-thumb').forEach(function (el) {
      el.addEventListener('click', function () { lbGoTo(parseInt(el.getAttribute('data-i')), true); });
    });
  }

  function lbGoTo(idx, animate) {
    var n = _lbImages.length || 1;
    _lbIdx = Math.max(0, Math.min(idx, n - 1));

    var track = document.getElementById('sgLbTrack');
    if (track) {
      track.style.transition = (animate === false) ? 'none' : 'transform .38s cubic-bezier(.22,1,.36,1)';
      track.style.transform  = 'translateX(-' + (_lbIdx * 100) + '%)';
    }

    var cnt = document.getElementById('sgLbCounter');
    if (cnt) cnt.textContent = (_lbImages.length > 1) ? (_lbIdx + 1) + ' / ' + n : '';

    var prev = document.getElementById('sgLbPrev');
    var next = document.getElementById('sgLbNext');
    if (prev) { prev.style.opacity = _lbIdx === 0 ? '0' : '1'; prev.style.pointerEvents = _lbIdx === 0 ? 'none' : 'all'; }
    if (next) { next.style.opacity = _lbIdx === n - 1 ? '0' : '1'; next.style.pointerEvents = _lbIdx === n - 1 ? 'none' : 'all'; }

    var thumbs = document.querySelectorAll('#sgLbThumbs .sg-lb-thumb');
    thumbs.forEach(function (el) {
      el.classList.toggle('on', parseInt(el.getAttribute('data-i')) === _lbIdx);
    });
    var activeTh = document.querySelector('#sgLbThumbs .sg-lb-thumb.on');
    if (activeTh) activeTh.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  window.sgLbMove = function (dir) {
    var newIdx = _lbIdx + dir;
    if (newIdx >= 0 && newIdx < _lbImages.length) {
      lbGoTo(newIdx, true);
    } else {
      var newPost = _lbPostIdx + dir;
      if (newPost >= 0 && newPost < _filtered.length) {
        lbOpen(newPost, dir > 0 ? 0 : (getImages(_filtered[newPost]).length - 1 || 0));
      }
    }
  };

  window.sgLbClose = function () {
    document.getElementById('sgLightbox').classList.remove('open');
    _unlockScroll();
  };

  /* 키보드 */
  document.addEventListener('keydown', function (e) {
    var lb = document.getElementById('sgLightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  sgLbMove(-1);
    if (e.key === 'ArrowRight') sgLbMove(1);
    if (e.key === 'Escape')     sgLbClose();
  });

  /* 슬라이더 터치/드래그 */
  (function () {
    var wrap = document.getElementById('sgTrack');
    if (!wrap) return;

    wrap.addEventListener('touchstart', function (e) {
      _touchStartX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });

    wrap.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - _touchStartX;
      if (Math.abs(dx) > 40) {
        var n = _filtered.length;
        if (n) { _current = (_current + (dx < 0 ? 1 : -1) + n) % n; renderSlider(true); }
      }
      startAuto();
    }, { passive: true });

    wrap.addEventListener('mousedown', function (e) {
      _isDragging  = true;
      _dragStartX  = e.clientX;
      _dragOffsetX = 0;
      wrap.style.cursor = 'grabbing';
      stopAuto();
    });
    document.addEventListener('mousemove', function (e) {
      if (!_isDragging) return;
      _dragOffsetX = e.clientX - _dragStartX;
    });
    document.addEventListener('mouseup', function () {
      if (!_isDragging) return;
      _isDragging = false;
      wrap.style.cursor = '';
      var saved = _dragOffsetX;
      _dragOffsetX = 0;
      if (Math.abs(saved) > 60) {
        var n = _filtered.length;
        if (n) { _current = (_current + (saved < 0 ? 1 : -1) + n) % n; }
      }
      renderSlider(true);
      startAuto();
    });
  })();

  /* 라이트박스 터치/드래그 */
  (function () {
    var stage = document.getElementById('sgLbStage');
    if (!stage) return;
    var tsX = 0, tsY = 0;

    stage.addEventListener('touchstart', function (e) {
      tsX = e.touches[0].clientX;
      tsY = e.touches[0].clientY;
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tsX;
      var dy = e.changedTouches[0].clientY - tsY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        sgLbMove(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  })();

  /* ── 데이터 로드 ──────────────────────── */
  var sec    = document.getElementById('slidegallery');
  var loaded = false;
  if (sec) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !loaded) {
          loaded = true;
          obs.disconnect();
          fetch('/admin/api_front/board_public.php?table=slide')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (data.ok) init(data.posts);
              else {
                var track = document.getElementById('sgTrack');
                if (track) track.innerHTML = '<div class="sg-empty">데이터를 불러올 수 없습니다.</div>';
              }
            })
            .catch(function () {
              var track = document.getElementById('sgTrack');
              if (track) track.innerHTML = '<div class="sg-empty">데이터를 불러올 수 없습니다.</div>';
            });
        }
      });
    }, { threshold: 0.05 });
    obs.observe(sec);
  }

  /* ── 외부에서 직접 초기화 가능 (테스트용) ── */
  window.sgInit = init;

})();
