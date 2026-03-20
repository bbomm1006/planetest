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
      _current = (_current + 1) % _flat.length;
      renderSlider(true);
    }, AUTO_INTERVAL);
  }
  function stopAuto() {
    if (_autoTimer) { clearInterval(_autoTimer); _autoTimer = null; }
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
          applyFilter();
        });
      });
    }
    applyFilter();
  }

  function applyFilter() {
    _filtered = _allPosts.filter(function (p) {
      return !_cat || (p.extra && p.extra['분류']) === _cat;
    });
    _current = 0;
    rebuildFlat();
    buildSlides();
    buildDots();
    buildThumbs();
    renderSlider(false);
    startAuto();
  }

  function buildSlides() {
    var track = document.getElementById('sgTrack');
    if (!track) return;
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    if (!_flat.length) {
      track.innerHTML = '<div class="sg-empty">등록된 슬라이드가 없습니다.</div>';
      return;
    }

    track.innerHTML = _flat.map(function (item, i) {
      var p = item.post;
      return '<div class="sg-slide" data-idx="' + i + '">'
        + '<div class="sg-slide-img">'
        + '<img src="' + attr(item.src) + '" alt="' + attr(p.title || '') + '" loading="' + (i < 2 ? 'eager' : 'lazy') + '">'
        + '</div></div>';
    }).join('');
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
    var p = _flat[_current].post;
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
      updateDots();
      updateThumbsActive();
      updateSlideMeta();
      return;
    }

    track.style.transition = animate ? 'transform .45s cubic-bezier(.22,1,.36,1)' : 'none';
    track.style.transform = 'translateX(-' + (_current * 100) + '%)';

    var prev = document.getElementById('sgPrev');
    var next = document.getElementById('sgNext');
    if (prev) { prev.style.opacity = '1'; prev.style.pointerEvents = ''; }
    if (next) { next.style.opacity = '1'; next.style.pointerEvents = ''; }

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
        renderSlider(true);
        startAuto();
      });
    });
  }

  function updateDots() {
    var dots = document.querySelectorAll('#sgDots .sg-dot');
    dots.forEach(function (d) {
      d.classList.toggle('on', parseInt(d.getAttribute('data-i'), 10) === _current);
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
        renderSlider(true);
        startAuto();
      });
    });
  }

  function updateThumbsActive() {
    document.querySelectorAll('#sgThumbs .sg-thumb').forEach(function (btn) {
      btn.classList.toggle('on', parseInt(btn.getAttribute('data-i'), 10) === _current);
    });
  }

  function scrollActiveThumbIntoView() {
    var active = document.querySelector('#sgThumbs .sg-thumb.on');
    if (!active || typeof active.scrollIntoView !== 'function') return;
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  window.sgMove = function (dir) {
    stopAuto();
    var n = _flat.length;
    if (!n) return;
    _current = (_current + dir + n) % n;
    renderSlider(true);
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
      if (Math.abs(dx) > 40 && _flat.length) {
        _current = (_current + (dx < 0 ? 1 : -1) + _flat.length) % _flat.length;
        renderSlider(true);
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
      if (Math.abs(saved) > 60 && _flat.length) {
        _current = (_current + (saved < 0 ? 1 : -1) + _flat.length) % _flat.length;
      }
      renderSlider(true);
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
