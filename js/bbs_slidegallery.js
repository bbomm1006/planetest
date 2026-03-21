/* ═══════════════════════════════════════
   bbs_slidegallery.js
   — 메인 슬라이드 + #sgSlideMeta(데스크톱 오버레이 / 모바일 이미지 아래)
   — 하단 썸네일: PC 8·MO 5칸 고정 폭(개수와 무관), 가로 스와이프·드래그·휠
═══════════════════════════════════════ */
(function () {
  'use strict';

  var _allPosts = [];
  var _filtered = [];
  var _cat = '';
  /** @type {{ src: string, post: object }[]} */
  var _flat = [];
  var _current = 0;
  var _autoTimer = null;
  var AUTO_INTERVAL = 4500;

  var _touchStartX = 0;
  var _isDragging = false;
  var _dragStartX = 0;
  var _dragOffsetX = 0;
  /** 무한루프용: 클론 포함 트랙에서의 시각 인덱스(2장 이상일 때만 사용) */
  var _sgVisual = null;

  function sgUseInfiniteTrack() {
    return _flat.length > 1;
  }
  /** 메타·도트·썸네일 활성에 쓰는 논리 인덱스 */
  function sgActiveLogicalIndex() {
    var n = _flat.length;
    if (n < 1) return 0;
    if (!sgUseInfiniteTrack()) {
      return Math.max(0, Math.min(_current, n - 1));
    }
    if (_sgVisual === 0) return n - 1;
    if (_sgVisual === n + 1) return 0;
    return Math.max(0, Math.min((_sgVisual != null ? _sgVisual : 1) - 1, n - 1));
  }

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

  function rebuildFlat() {
    _flat = [];
    _filtered.forEach(function (p) {
      var imgs = getImages(p);
      if (!imgs.length) return;
      imgs.forEach(function (src) {
        _flat.push({ src: src, post: p });
      });
    });
  }

  function startAuto() {
    stopAuto();
    if (_flat.length <= 1) return;
    _autoTimer = setInterval(function () {
      sgAdvance(1, true);
    }, AUTO_INTERVAL);
  }
  function stopAuto() {
    if (_autoTimer) { clearInterval(_autoTimer); _autoTimer = null; }
  }

  /** 1장: 이동 없음. 2장↑: 클론 트랙 무한 이동(transitionend로 스냅). */
  function sgAdvance(dir, animate) {
    var n = _flat.length;
    if (!n || !dir) return;
    if (animate !== true && animate !== false) animate = true;
    if (n <= 1) return;

    if (dir > 0) {
      if (_current < n - 1) {
        _current++;
        _sgVisual = _current + 1;
        renderSlider(!!animate);
      } else {
        _sgVisual = n + 1;
        renderSlider(!!animate);
      }
      return;
    }
    if (dir < 0) {
      if (_current > 0) {
        _current--;
        _sgVisual = _current + 1;
        renderSlider(!!animate);
      } else {
        _sgVisual = 0;
        renderSlider(!!animate);
      }
    }
  }

  function bindSgInfiniteTransition() {
    var sec = document.getElementById('slidegallery');
    if (!sec || sec.dataset.sgTransBound === '1') return;
    sec.dataset.sgTransBound = '1';
    sec.addEventListener('transitionend', function (e) {
      if (!e.target || e.target.id !== 'sgTrack' || e.propertyName !== 'transform') return;
      if (!sgUseInfiniteTrack()) return;
      var n = _flat.length;
      if (n <= 1) return;
      var track = document.getElementById('sgTrack');
      if (!track) return;

      if (_sgVisual === n + 1) {
        _current = 0;
        track.style.transition = 'none';
        _sgVisual = 1;
        applyStageMetrics(false);
        void track.offsetHeight;
        track.style.transition = '';
        updateDots();
        updateThumbsActive();
        scrollActiveThumbIntoView();
        updateSlideMeta();
      } else if (_sgVisual === 0) {
        _current = n - 1;
        track.style.transition = 'none';
        _sgVisual = n;
        applyStageMetrics(false);
        void track.offsetHeight;
        track.style.transition = '';
        updateDots();
        updateThumbsActive();
        scrollActiveThumbIntoView();
        updateSlideMeta();
      }
    });
  }

  function init(posts) {
    _allPosts = posts;

    var cats = [], seen = {};
    posts.forEach(function (p) {
      var c = p.extra && p.extra['분류'] ? p.extra['분류'] : '';
      if (c && !seen[c]) { seen[c] = true; cats.push(c); }
    });
    var tabs = document.getElementById('sgCatTabs');
    if (tabs && cats.length) {
      tabs.innerHTML = '<button type="button" class="sg-ct on" data-cat="">전체</button>'
        + cats.map(function (c) {
          return '<button type="button" class="sg-ct" data-cat="' + attr(c) + '">' + esc(c) + '</button>';
        }).join('');
      tabs.querySelectorAll('.sg-ct').forEach(function (btn) {
        btn.addEventListener('click', function () {
          tabs.querySelectorAll('.sg-ct').forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          _cat = btn.getAttribute('data-cat');
          _current = 0;
          var sgDrop = document.getElementById('sgCatDropdown');
          if (sgDrop) sgDrop.value = _cat;
          applyFilter();
        });
      });
      // 모바일 드롭다운 채우기 및 이벤트 연결
      var sgDrop = document.getElementById('sgCatDropdown');
      if (sgDrop) {
        sgDrop.innerHTML = '<option value="">전체</option>'
          + cats.map(function (c) { return '<option value="' + attr(c) + '">' + esc(c) + '</option>'; }).join('');
        sgDrop.addEventListener('change', function () {
          _cat = sgDrop.value; _current = 0;
          tabs.querySelectorAll('.sg-ct').forEach(function (b) { b.classList.toggle('on', b.dataset.cat === _cat); });
          applyFilter();
        });
      }
    }
    applyFilter();
  }

  function applyFilter() {
    _filtered = _allPosts.filter(function (p) {
      return !_cat || (p.extra && p.extra['분류']) === _cat;
    });
    _current = 0;
    _sgVisual = null;
    rebuildFlat();
    buildSlides();
    buildDots();
    buildThumbs();
    renderSlider(false);
    bindSgResizeObserver();
    bindSgInfiniteTransition();
    startAuto();
  }

  /** 1장: 일반 트랙. 2장↑: _sgVisual 로 클론 트랙 위치(끝 빈칸 방지는 maxTx 클램프). */
  function applyStageMetrics(animate) {
    var track = document.getElementById('sgTrack');
    if (!track) return;
    var outer = track.closest('.sg-track-outer');
    if (!outer) return;
    var w = outer.clientWidth || outer.offsetWidth;
    if (w < 1) return;

    var n = _flat.length;
    var useInf = sgUseInfiniteTrack();

    track.style.transition = animate ? 'transform .45s cubic-bezier(.22,1,.36,1)' : 'none';

    if (!n) {
      track.style.width = '';
      track.style.transform = 'translateX(0)';
      _sgVisual = null;
      return;
    }

    var slides = track.querySelectorAll('.sg-slide');
    if (!slides.length) return;

    var sc = slides.length;

    if (!useInf) {
      _current = Math.max(0, Math.min(_current, n - 1));
      _sgVisual = null;
    } else {
      if (_sgVisual == null) _sgVisual = _current + 1;
      _sgVisual = Math.max(0, Math.min(_sgVisual, n + 1));
    }

    var visualI = useInf ? _sgVisual : _current;

    track.style.width = (sc * w) + 'px';
    slides.forEach(function (el) {
      el.style.flex = '0 0 ' + w + 'px';
      el.style.width = w + 'px';
      el.style.minWidth = w + 'px';
      el.style.maxWidth = w + 'px';
      el.style.boxSizing = 'border-box';
    });

    var tx = visualI * w;
    var maxTx = Math.max(0, (sc * w) - w);
    if (tx > maxTx) tx = maxTx;
    track.style.transform = 'translateX(' + (-tx) + 'px)';
  }

  var _sgResizeObs = null;
  function bindSgResizeObserver() {
    var outer = document.querySelector('#slidegallery .sg-track-outer');
    if (!outer || typeof ResizeObserver === 'undefined') return;
    if (_sgResizeObs) _sgResizeObs.disconnect();
    _sgResizeObs = new ResizeObserver(function () {
      applyStageMetrics(false);
    });
    _sgResizeObs.observe(outer);
  }

  function sgSlideHtml(item, i, eager) {
    var p = item.post;
    return '<div class="sg-slide" data-idx="' + i + '">'
      + '<div class="sg-slide-img">'
      + '<img src="' + attr(item.src) + '" alt="' + attr(p.title || '') + '" loading="' + (eager ? 'eager' : 'lazy') + '">'
      + '</div></div>';
  }

  function buildSlides() {
    var track = document.getElementById('sgTrack');
    if (!track) return;
    track.style.width = '';
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    if (!_flat.length) {
      track.innerHTML = '<div class="sg-empty">등록된 슬라이드가 없습니다.</div>';
      _sgVisual = null;
      return;
    }

    var n = _flat.length;
    if (sgUseInfiniteTrack()) {
      var last = _flat[n - 1];
      var first = _flat[0];
      track.innerHTML = sgSlideHtml(last, n - 1, true).replace(
        'class="sg-slide"',
        'class="sg-slide sg-slide-clone" data-clone="prev"'
      )
        + _flat.map(function (item, i) { return sgSlideHtml(item, i, i < 2); }).join('')
        + sgSlideHtml(first, 0, false).replace(
          'class="sg-slide"',
          'class="sg-slide sg-slide-clone" data-clone="next"'
        );
      _sgVisual = 1;
    } else {
      track.innerHTML = _flat.map(function (item, i) { return sgSlideHtml(item, i, i < 2); }).join('');
      _sgVisual = null;
    }

    applyStageMetrics(false);
    requestAnimationFrame(function () { applyStageMetrics(false); });
  }

  function updateSlideMeta() {
    var meta = document.getElementById('sgSlideMeta');
    var catEl = document.getElementById('sgMetaCat');
    var titleEl = document.getElementById('sgMetaTitle');
    if (!meta || !catEl || !titleEl) return;
    if (!_flat.length) {
      meta.hidden = true;
      catEl.textContent = '';
      titleEl.textContent = '';
      catEl.hidden = true;
      return;
    }
    var idx = sgActiveLogicalIndex();
    var p = _flat[idx].post;
    var cat = (p.extra && p.extra['분류']) || '';
    var title = (p.title || '').trim();
    catEl.textContent = cat;
    catEl.hidden = !cat;
    titleEl.textContent = title;
    meta.hidden = !cat && !title;
  }

  function renderSlider(animate) {
    var track = document.getElementById('sgTrack');
    if (!track) {
      updateSlideMeta();
      return;
    }
    if (!_flat.length) {
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      applyStageMetrics(false);
      updateDots();
      updateThumbsActive();
      updateSlideMeta();
      return;
    }

    applyStageMetrics(animate);

    var prev = document.getElementById('sgPrev');
    var next = document.getElementById('sgNext');
    var n = _flat.length;
    if (n > 1) {
      if (prev) { prev.style.opacity = '1'; prev.style.pointerEvents = ''; }
      if (next) { next.style.opacity = '1'; next.style.pointerEvents = ''; }
    } else {
      if (prev) { prev.style.opacity = '0.3'; prev.style.pointerEvents = 'none'; }
      if (next) { next.style.opacity = '0.3'; next.style.pointerEvents = 'none'; }
    }

    updateDots();
    updateThumbsActive();
    scrollActiveThumbIntoView();
    updateSlideMeta();
  }

  function buildDots() {
    var dots = document.getElementById('sgDots');
    if (!dots) return;
    if (_flat.length <= 1) {
      dots.innerHTML = '';
      dots.style.display = 'none';
      return;
    }
    dots.style.display = 'flex';
    dots.innerHTML = _flat.map(function (_, i) {
      return '<button type="button" class="sg-dot' + (i === _current ? ' on' : '') + '" data-i="' + i + '" aria-label="이미지 ' + (i + 1) + '"></button>';
    }).join('');
    dots.querySelectorAll('.sg-dot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopAuto();
        _current = parseInt(btn.getAttribute('data-i'), 10);
        if (sgUseInfiniteTrack()) _sgVisual = _current + 1;
        renderSlider(true);
        startAuto();
      });
    });
  }

  function updateDots() {
    var idx = sgActiveLogicalIndex();
    var dots = document.querySelectorAll('#sgDots .sg-dot');
    dots.forEach(function (d) {
      d.classList.toggle('on', parseInt(d.getAttribute('data-i'), 10) === idx);
    });
  }

  function buildThumbs() {
    var bar = document.getElementById('sgThumbBar');
    var grid = document.getElementById('sgThumbs');
    if (!grid || !bar) return;

    if (_flat.length <= 1) {
      grid.innerHTML = '';
      bar.hidden = true;
      return;
    }

    bar.hidden = false;

    var vp = document.getElementById('sgThumbViewport');
    if (vp) vp.scrollLeft = 0;

    grid.innerHTML = _flat.map(function (item, i) {
      return '<button type="button" class="sg-thumb' + (i === _current ? ' on' : '') + '" data-i="' + i + '" aria-label="썸네일 ' + (i + 1) + '">'
        + '<span class="sg-thumb-inner"><img src="' + attr(item.src) + '" alt="" loading="lazy" draggable="false"></span>'
        + '</button>';
    }).join('');

    grid.querySelectorAll('.sg-thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopAuto();
        _current = parseInt(btn.getAttribute('data-i'), 10);
        if (sgUseInfiniteTrack()) _sgVisual = _current + 1;
        renderSlider(true);
        startAuto();
      });
    });
  }

  function updateThumbsActive() {
    var idx = sgActiveLogicalIndex();
    document.querySelectorAll('#sgThumbs .sg-thumb').forEach(function (btn) {
      btn.classList.toggle('on', parseInt(btn.getAttribute('data-i'), 10) === idx);
    });
  }

  function scrollActiveThumbIntoView() {
    var active = document.querySelector('#sgThumbs .sg-thumb.on');
    if (!active) return;
    var vp = active.closest('.sg-thumbs-vp') || active.parentElement;
    if (vp) vp.scrollLeft = active.offsetLeft - (vp.clientWidth / 2) + (active.offsetWidth / 2);
  }

  window.sgMove = function (dir) {
    stopAuto();
    if (!_flat.length) { startAuto(); return; }
    sgAdvance(dir, true);
    startAuto();
  };

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var sec = document.getElementById('slidegallery');
    if (!sec) return;
    var r = sec.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    if (r.bottom < 80 || r.top > vh - 40) return;
    if (!_flat.length) return;
    e.preventDefault();
    if (e.key === 'ArrowLeft') sgMove(-1);
    else sgMove(1);
  });

  (function bindTrackSwipe() {
    var wrap = document.getElementById('sgTrack');
    if (!wrap) return;

    wrap.addEventListener('touchstart', function (e) {
      _touchStartX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });

    wrap.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - _touchStartX;
      if (Math.abs(dx) > 40 && _flat.length > 1) {
        sgAdvance(dx < 0 ? 1 : -1, true);
      }
      startAuto();
    }, { passive: true });

    wrap.addEventListener('mousedown', function (e) {
      if (e.target.closest('.sg-dot')) return;
      _isDragging = true;
      _dragStartX = e.clientX;
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
      if (Math.abs(saved) > 60 && _flat.length > 1) {
        sgAdvance(saved < 0 ? 1 : -1, true);
      } else {
        renderSlider(false);
      }
      startAuto();
    });
  })();

  /* 썸네일 바: PC·MO 동일 가로 스와이프(터치 스크롤 + 마우스 드래그 + 휠) */
  (function bindThumbStripSwipe() {
    var vp = document.getElementById('sgThumbViewport');
    if (!vp) return;

    var down = false;
    var startX = 0;
    var scrollLeft0 = 0;
    var thumbStripMoved = false;

    vp.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      down = true;
      thumbStripMoved = false;
      startX = e.clientX;
      scrollLeft0 = vp.scrollLeft;
      vp.classList.add('is-grabbing');
    });

    document.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) thumbStripMoved = true;
      vp.scrollLeft = scrollLeft0 - dx;
    });

    document.addEventListener('mouseup', function () {
      if (!down) return;
      down = false;
      vp.classList.remove('is-grabbing');
    });

    vp.addEventListener('click', function (e) {
      if (thumbStripMoved) {
        e.preventDefault();
        e.stopPropagation();
        thumbStripMoved = false;
      }
    }, true);

    vp.addEventListener('wheel', function (e) {
      if (vp.scrollWidth <= vp.clientWidth + 2) return;
      var dy = e.deltaY;
      var dx = e.deltaX;
      if (Math.abs(dx) > Math.abs(dy)) {
        vp.scrollLeft += dx;
      } else {
        vp.scrollLeft += dy;
      }
      e.preventDefault();
    }, { passive: false });
  })();

  /* ResizeObserver 미지원 브라우저용 */
  var _sgWinResizeT = null;
  window.addEventListener('resize', function () {
    if (!document.getElementById('sgTrack')) return;
    clearTimeout(_sgWinResizeT);
    _sgWinResizeT = setTimeout(function () {
      applyStageMetrics(false);
    }, 100);
  });

  var sec = document.getElementById('slidegallery');
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

  window.sgInit = init;
})();
