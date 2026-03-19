/* ═══════════════════════════════════════
   hero.js — 히어로 배너 슬라이더
═══════════════════════════════════════ */

var hSlides = [], hCur = 0, hTimer = null, hTrans = 'fade';

function renderHero(data) {
  var cfg = data.bannerConfig || {};
  hTrans = cfg.transition || 'fade';
  hSlides = (data.banners || [])
    .filter(function (b) { return b.active; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  var hero = document.getElementById('hero');
  var sl = document.getElementById('hSlides');
  hero.classList.toggle('slide-mode', hTrans === 'slide');

  if (!hSlides.length) {
    sl.innerHTML = '<div class="h-slide active"><div class="h-bg"><div class="h-bg-fb"></div></div><div class="h-grain"></div></div>';
    return;
  }

  hCur = Math.min(hCur, hSlides.length - 1);
  sl.innerHTML = hSlides.map(function (b) {
    var bg = '';
    if (b.bgSrc) {
      var ytId = getYtId(b.bgSrc);
      if (b.bgType === 'video') {
        bg = ytId
          ? '<div class="h-bg"><iframe src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&loop=1&playlist=' + ytId + '&controls=0&disablekb=1&fs=0&playsinline=1" allow="autoplay;encrypted-media"></iframe></div>'
          : '<div class="h-bg"><video src="' + esc(b.bgSrc) + '" autoplay muted loop playsinline></video></div>';
      } else {
        var _mo = window.innerWidth < 768;
        var _src = (_mo && (b.bgSrcMo || b.bg_src_mo)) ? esc(b.bgSrcMo || b.bg_src_mo) : esc(b.bgSrc);
        bg = '<div class="h-bg"><img src="' + _src + '" alt=""></div>';
      }
    } else {
      bg = '<div class="h-bg"><div class="h-bg-fb"></div></div>';
    }

    var ov = b.overlayEnabled
      ? '<div class="h-ov" style="background:' + esc(b.overlayColor || 'rgba(0,0,0,0.45)') + '"></div>'
      : '';
    var eye = b.subtitle
      ? '<div class="h-pill"><div class="h-pill-dot"></div><span class="h-pill-txt" style="color:' + esc(b.subtitleColor || 'rgba(255,255,255,.9)') + '">' + esc(b.subtitle) + '</span></div>'
      : '';
    var ttl = b.title
      ? '<div class="h-ttl" style="color:' + esc(b.titleColor || '#fff') + '">' + esc(b.title) + '</div>'
      : '';
    var dsc = b.desc
      ? '<div class="h-dsc" style="color:' + esc(b.descColor || 'rgba(255,255,255,.72)') + '">' + esc(b.desc) + '</div>'
      : '';

    var btns = '<div class="h-btns">';
    if (b.btn1Enabled && b.btn1Text) {
      var ext1 = (b.btn1Link || '').startsWith('http');
      btns += '<button class="hb1" style="background:' + esc(b.btn1Bg || '#00c6ff') + ';color:' + esc(b.btn1TextColor || '#fff') + '" onclick="goto(\'' + esc(b.btn1Link || '') + '\')">'
        + esc(b.btn1Text)
        + '<span class="hb1-arr"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">'
        + (ext1 ? '<path d="M2 10L10 2M4 2h6v6"/>' : '<path d="M2 6h8M6 2l4 4-4 4"/>')
        + '</svg></span></button>';
    }
    if (b.btn2Enabled && b.btn2Text) {
      btns += '<button class="hb2" style="color:' + esc(b.btn2TextColor || '#fff') + '" onclick="goto(\'' + esc(b.btn2Link || '') + '\')">' + esc(b.btn2Text) + '</button>';
    }
    btns += '</div>';

    return '<div class="h-slide">' + bg + '<div class="h-grain"></div>' + ov
      + '<div class="h-cnt"><div class="h-inner">' + eye + ttl + dsc + btns + '</div></div></div>';
  }).join('');

  var multi = hSlides.length > 1;
  document.getElementById('hCtrl').style.display = multi ? 'flex' : 'none';
  document.getElementById('hCount').style.display = multi ? 'block' : 'none';
  document.getElementById('hProg').style.display = (multi && (cfg.interval || 0) > 0) ? 'block' : 'none';

  document.querySelectorAll('#hSlides .h-slide video').forEach(function (v) { v.currentTime = 0; });
  hGoTo(hCur, true);
  startHA(cfg.interval || 0);
}

function hGoTo(idx, instant) {
  var slides = document.querySelectorAll('#hSlides .h-slide');
  if (!slides.length) return;

  if (hTrans === 'slide' && !instant) {
    slides[hCur].classList.remove('active');
    slides[hCur].classList.add('slide-out');
    var p = hCur;
    setTimeout(function () { slides[p].classList.remove('slide-out'); }, 750);
  } else {
    slides[hCur].classList.remove('active');
  }

  hCur = ((idx % hSlides.length) + hSlides.length) % hSlides.length;
  slides[hCur].classList.add('active');

  (function () {
    var _v = slides[hCur].querySelector('video');
    if (_v) { _v.currentTime = 0; _v.play().catch(function () {}); }
    var _f = slides[hCur].querySelector('iframe');
    if (_f && _f.src) { var _s = _f.src; _f.src = ''; _f.src = _s; }
  })();

  var ct = document.getElementById('hCount');
  if (ct) ct.textContent = String(hCur + 1).padStart(2, '0') + ' / ' + String(hSlides.length).padStart(2, '0');
}

function startHA(ivl) {
  clearInterval(hTimer);
  var bar = document.getElementById('hProgBar');
  if (!bar || ivl <= 0 || hSlides.length < 2) return;
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      bar.style.transition = 'width ' + ivl + 'ms linear';
      bar.style.width = '100%';
    });
  });
  hTimer = setInterval(function () {
    hGoTo(hCur + 1);
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.style.transition = 'width ' + ivl + 'ms linear';
        bar.style.width = '100%';
      });
    });
  }, ivl);
}

function heroNav(dir) {
  clearInterval(hTimer);
  var bar = document.getElementById('hProgBar');
  if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
  hGoTo(hCur + dir);
  startHA((_pbData.bannerConfig || {}).interval || 0);
}

/* 터치 스와이프 */
(function () {
  var el = document.getElementById('hSlides');
  if (!el) return;
  var sx = 0, sy = 0, moved = false;
  el.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = false; }, { passive: true });
  el.addEventListener('touchmove',  function ()  { moved = true; }, { passive: true });
  el.addEventListener('touchend',   function (e) {
    if (!moved) return;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) heroNav(dx < 0 ? 1 : -1);
  }, { passive: true });
}());