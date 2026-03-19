/* ═══════════════════════════════════════
   bbs_photogallery.js
   — 포토 갤러리 게시판
   — 클릭 라이트박스 + 좌우 스와이프 + 키보드 네비
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
  var _allPosts  = [];
  var _filtered  = [];
  var _page      = 1;
  var _cat       = '';
  var _kw        = '';
  var PER_PAGE   = 12;

  /* 라이트박스 상태 */
  var _lbImages  = [];   // 현재 열려있는 포스트의 이미지 배열
  var _lbIdx     = 0;    // 현재 이미지 인덱스
  var _lbPostIdx = 0;    // 전체 filtered 포스트 인덱스 (← → 포스트 이동용)

  /* 스와이프 */
  var _touchStartX = 0;
  var _touchStartY = 0;
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

  /* ── 초기화 ───────────────────────────── */
  function init(posts) {
    _allPosts = posts;

    /* 분류 탭 */
    var cats = [], seen = {};
    posts.forEach(function (p) {
      var c = p.extra && p.extra['분류'] ? p.extra['분류'] : '';
      if (c && !seen[c]) { seen[c] = true; cats.push(c); }
    });
    var tabs = document.getElementById('pgCatTabs');
    if (tabs && cats.length) {
      tabs.innerHTML = '<button class="pg-ct on" data-cat="">전체</button>'
        + cats.map(function (c) {
          return '<button class="pg-ct" data-cat="' + attr(c) + '">' + esc(c) + '</button>';
        }).join('');
      tabs.querySelectorAll('.pg-ct').forEach(function (btn) {
        btn.addEventListener('click', function () {
          tabs.querySelectorAll('.pg-ct').forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          _cat = btn.getAttribute('data-cat');
          _page = 1;
          render();
        });
      });
    }
    render();
  }

  /* ── 필터 ────────────────────────────── */
  function filter() {
    return _allPosts.filter(function (p) {
      var catOk = !_cat || (p.extra && p.extra['분류']) === _cat;
      var kwOk  = !_kw;
      if (_kw) {
        var kl = _kw.toLowerCase();
        kwOk = p.title.toLowerCase().includes(kl) || (p.content || '').toLowerCase().includes(kl);
      }
      return catOk && kwOk;
    });
  }

  /* ── 렌더링 ───────────────────────────── */
  function render() {
    _filtered = filter();
    var total = _filtered.length;

    /* 결과 정보 */
    var info = document.getElementById('pgResultInfo');
    if (info) {
      info.innerHTML = (_kw || _cat)
        ? '검색 결과: <strong>' + total + '</strong>건'
        : '전체 <strong>' + total + '</strong>건';
    }

    var grid = document.getElementById('pgGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var items = _filtered.slice(0, _page * PER_PAGE);

    if (!items.length) {
      grid.innerHTML = '<div class="pg-empty">'
        + (_kw || _cat ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.')
        + '</div>';
    } else {
      items.forEach(function (p, i) {
        var images  = getImages(p);
        var thumb   = getThumb(p);
        var cat     = (p.extra && p.extra['분류']) || '';
        var date    = (p.date || '').slice(0, 10);
        var multi   = images.length > 1;

        var thumbHtml = thumb
          ? '<img src="' + attr(thumb) + '" alt="' + attr(p.title) + '" loading="lazy">'
          : '<div class="pg-card-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';

        var card = document.createElement('div');
        card.className = 'pg-card';
        card.innerHTML =
          '<div class="pg-card-thumb">'
          + thumbHtml
          + (multi ? '<div class="pg-multi-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>' + images.length + '</div>' : '')
          + '<div class="pg-card-overlay">'
          + (cat ? '<div class="pg-card-overlay-cat">' + esc(cat) + '</div>' : '')
          + '<div class="pg-card-overlay-title">' + esc(p.title) + '</div>'
          + '</div>'
          + '</div>';

        /* 클릭 이벤트 — 전체 filtered 에서의 인덱스 기록 */
        (function (post, postIdx) {
          card.addEventListener('click', function () { lbOpen(postIdx, 0); });
        })(p, i);

        grid.appendChild(card);
      });
    }

    /* 더보기 버튼 */
    var remaining = total - _page * PER_PAGE;
    var moreWrap  = document.getElementById('pgMoreWrap');
    if (moreWrap) {
      if (remaining > 0) {
        moreWrap.style.display = 'block';
        var cnt = document.getElementById('pgMoreCount');
        if (cnt) cnt.textContent = '(' + remaining + '개 더 보기)';
      } else {
        moreWrap.style.display = 'none';
      }
    }
  }

  /* ── 공개 API ─────────────────────────── */
  window.pgSearch = function () {
    var inp = document.getElementById('pgSearchInp');
    _kw = inp ? inp.value.trim() : '';
    _page = 1;
    render();
  };

  window.pgLoadMore = function () {
    _page++;
    render();
  };


  /* ─ 하단 바(카운터+썸네일) DOM 초기화 ─ */
  (function () {
    var lb = document.getElementById('pgLightbox');
    if (!lb) return;
    var wrap = lb.querySelector('.pg-lb-wrap');
    if (!wrap) return;

    // 기존 counter / thumbs 엘리먼트 이동
    var counter = document.getElementById('pgLbCounter');
    var thumbs  = document.getElementById('pgLbThumbs');

    // bottom 컨테이너 생성
    var bottom = document.createElement('div');
    bottom.className = 'pg-lb-bottom';
    bottom.id = 'pgLbBottom';

    if (counter) bottom.appendChild(counter);
    if (thumbs)  bottom.appendChild(thumbs);

    wrap.appendChild(bottom);
  })();

  /* ═══════════════════════════════════════
     LIGHTBOX  (모던 리디자인)
     - 이미지 풀스크린
     - 좌우 화살표 오버레이
     - 텍스트 정보 제거
     - 하단 썸네일 스트립
  ═══════════════════════════════════════ */

  /* 열기 */
  function lbOpen(postIdx, imgIdx) {
    _lbPostIdx = postIdx;
    var p = _filtered[postIdx];
    if (!p) return;
    _lbImages = getImages(p);
    _lbIdx    = imgIdx || 0;

    /* 정보 패널 숨김 (글 불필요) */
    var infoEl = document.getElementById('pgLbInfo');
    if (infoEl) infoEl.style.display = 'none';

    lbBuildTrack();
    lbBuildThumbs();
    lbGoTo(_lbIdx, false);

    document.getElementById('pgLightbox').classList.add('open');
    _lockScroll();
  }

  /* 슬라이드 트랙 구성 */
  function lbBuildTrack() {
    var track = document.getElementById('pgLbTrack');
    if (!track) return;
    if (!_lbImages.length) {
      track.innerHTML = '<div class="pg-lb-slide"><div class="pg-lb-noimg">이미지가 없습니다.</div></div>';
      return;
    }
    track.innerHTML = _lbImages.map(function (src) {
      return '<div class="pg-lb-slide"><img src="' + attr(src) + '" alt="" draggable="false"></div>';
    }).join('');
  }

  /* 썸네일 스트립 구성 */
  function lbBuildThumbs() {
    var wrap = document.getElementById('pgLbThumbs');
    if (!wrap) return;
    if (_lbImages.length <= 1) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';
    wrap.innerHTML = _lbImages.map(function (src, i) {
      return '<div class="pg-lb-thumb' + (i === _lbIdx ? ' on' : '') + '" data-i="' + i + '">'
        + '<img src="' + attr(src) + '" alt="" loading="lazy">'
        + '</div>';
    }).join('');
    wrap.querySelectorAll('.pg-lb-thumb').forEach(function (el) {
      el.addEventListener('click', function () { lbGoTo(parseInt(el.getAttribute('data-i')), true); });
    });
  }

  /* 이동 */
  function lbGoTo(idx, animate) {
    var n = _lbImages.length || 1;
    _lbIdx = Math.max(0, Math.min(idx, n - 1));

    var track = document.getElementById('pgLbTrack');
    if (track) {
      track.style.transition = (animate === false) ? 'none' : 'transform .38s cubic-bezier(.22,1,.36,1)';
      track.style.transform  = 'translateX(-' + (_lbIdx * 100) + '%)';
    }

    /* 카운터 */
    var cnt = document.getElementById('pgLbCounter');
    if (cnt) cnt.textContent = (_lbImages.length > 1) ? (_lbIdx + 1) + ' / ' + n : '';

    /* 화살표 가시성 */
    var prev = document.getElementById('pgLbPrev');
    var next = document.getElementById('pgLbNext');
    if (prev) prev.style.opacity = _lbIdx === 0 ? '0' : '1';
    if (prev) prev.style.pointerEvents = _lbIdx === 0 ? 'none' : 'all';
    if (next) next.style.opacity = _lbIdx === n - 1 ? '0' : '1';
    if (next) next.style.pointerEvents = _lbIdx === n - 1 ? 'none' : 'all';

    /* 썸네일 활성 */
    var thumbs = document.querySelectorAll('#pgLbThumbs .pg-lb-thumb');
    thumbs.forEach(function (el) {
      el.classList.toggle('on', parseInt(el.getAttribute('data-i')) === _lbIdx);
    });
    var activeTh = document.querySelector('#pgLbThumbs .pg-lb-thumb.on');
    if (activeTh) activeTh.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  /* 좌우 이동 */
  window.pgLbMove = function (dir) {
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

  /* 닫기 */
  window.pgLbClose = function () {
    document.getElementById('pgLightbox').classList.remove('open');
    _unlockScroll();
  };

  /* 키보드 */
  document.addEventListener('keydown', function (e) {
    var lb = document.getElementById('pgLightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  pgLbMove(-1);
    if (e.key === 'ArrowRight') pgLbMove(1);
    if (e.key === 'Escape')     pgLbClose();
  });

  /* 터치 / 마우스 드래그 */
  (function () {
    var stage = document.getElementById('pgLbStage');
    if (!stage) return;

    stage.addEventListener('touchstart', function (e) {
      _touchStartX = e.touches[0].clientX;
      _touchStartY = e.touches[0].clientY;
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - _touchStartX;
      var dy = e.changedTouches[0].clientY - _touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        pgLbMove(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    stage.addEventListener('mousedown', function (e) {
      _isDragging  = true;
      _dragStartX  = e.clientX;
      _dragOffsetX = 0;
      stage.style.cursor = 'grabbing';
      var track = document.getElementById('pgLbTrack');
      if (track) track.style.transition = 'none';
    });
    document.addEventListener('mousemove', function (e) {
      if (!_isDragging) return;
      _dragOffsetX = e.clientX - _dragStartX;
      var track = document.getElementById('pgLbTrack');
      if (track) track.style.transform = 'translateX(calc(-' + (_lbIdx * 100) + '% + ' + _dragOffsetX + 'px))';
    });
    document.addEventListener('mouseup', function () {
      if (!_isDragging) return;
      _isDragging = false;
      stage.style.cursor = '';
      var savedOffset = _dragOffsetX;
      _dragOffsetX = 0;
      /* offset 먼저 초기화 후 이동 결정 */
      if (Math.abs(savedOffset) > 60) {
        pgLbMove(savedOffset < 0 ? 1 : -1);
      } else {
        lbGoTo(_lbIdx, true);
      }
    });
  })();

  /* ── 데이터 로드 ──────────────────────── */
  var sec    = document.getElementById('photogallery');
  var loaded = false;
  if (sec) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !loaded) {
          loaded = true;
          obs.disconnect();
          fetch('/admin/api_front/board_public.php?table=photo')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (data.ok) init(data.posts);
              else {
                var grid = document.getElementById('pgGrid');
                if (grid) grid.innerHTML = '<div class="pg-empty">데이터를 불러올 수 없습니다.</div>';
              }
            })
            .catch(function () {
              var grid = document.getElementById('pgGrid');
              if (grid) grid.innerHTML = '<div class="pg-empty">데이터를 불러올 수 없습니다.</div>';
            });
        }
      });
    }, { threshold: 0.05 });
    obs.observe(sec);
  }

  /* ── 외부에서 직접 초기화 가능 (테스트용) ── */
  window.pgInit = init;

})();
