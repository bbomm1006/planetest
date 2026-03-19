/* ═══════════════════════════════════════
   popup.js — 팝업 배너
═══════════════════════════════════════ */

function renderPopupBanner(data) {
  var popups = (data.popups || [])
    .filter(function (p) { return p.active; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  var existing = document.getElementById('pb-popup-layer');
  if (existing) existing.remove();
  if (!popups.length) return;

  /* dismiss 캐시 */
  var dismissed = {};
  try { var raw = localStorage.getItem('pb_popup_dismiss_v2') || '{}'; dismissed = JSON.parse(raw); } catch (e) {}
  var now = Date.now(), changed = false;
  Object.keys(dismissed).forEach(function (k) { if (dismissed[k] < now) { delete dismissed[k]; changed = true; } });
  if (changed) try { localStorage.setItem('pb_popup_dismiss_v2', JSON.stringify(dismissed)); } catch (e) {}

  var visible = popups.filter(function (p) { return !dismissed[p.id]; });
  if (!visible.length) return;

  /* 스타일 주입 */
  if (!document.getElementById('pb-popup-anim')) {
    var st = document.createElement('style'); st.id = 'pb-popup-anim';
    st.textContent = [
      '@keyframes pbPopIn{from{opacity:0;transform:scale(.94) translateY(10px);}to{opacity:1;transform:none;}}',
      '@keyframes pbSlideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}',
      '@keyframes pbSlideIn{from{opacity:0;transform:translateX(18px);}to{opacity:1;transform:none;}}',
      '.pb-popup-frame{background:#fff;border-radius:16px;box-shadow:0 16px 56px rgba(0,0,0,.26);width:auto;max-width:min(90vw,600px);min-width:260px;overflow:hidden;position:relative;animation:pbPopIn .3s cubic-bezier(.34,1.36,.64,1) both;display:flex;flex-direction:column;}',
      '.pb-popup-body{position:relative;overflow:hidden;}',
      '.pb-popup-slide{display:none;animation:pbSlideIn .25s var(--ease-out,cubic-bezier(.22,1,.36,1)) both;}',
      '.pb-popup-slide.pb-active{display:block;}',
      '.pb-popup-close{position:absolute;top:10px;right:10px;z-index:20;border:none;background:rgba(0,0,0,.32);color:#fff;border-radius:50%;width:30px;height:30px;font-size:.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;transition:background .15s;}',
      '.pb-popup-close:hover{background:rgba(0,0,0,.55);}',
      '.pb-popup-bar{display:flex;align-items:center;justify-content:space-between;padding:9px 14px;border-top:1px solid #f1f5f9;background:#f8fafc;gap:8px;flex-shrink:0;}',
      '.pb-popup-nav{display:flex;align-items:center;gap:5px;flex-shrink:0;}',
      '.pb-nav-btn{border:1.5px solid #e2e8f0;background:#fff;color:#475569;border-radius:7px;width:30px;height:30px;font-size:1.05rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:all .15s;}',
      '.pb-nav-btn:hover:not(:disabled){background:#e2e8f0;}',
      '.pb-nav-btn:disabled{opacity:.35;cursor:default;}',
      '.pb-popup-counter{font-size:.72rem;color:#94a3b8;min-width:32px;text-align:center;}',
      '@media(max-width:599px){#pb-popup-layer{align-items:flex-end!important;padding:0!important;}.pb-popup-frame{border-radius:18px 18px 0 0!important;width:100%!important;max-width:100%!important;animation:pbSlideUp .32s cubic-bezier(.22,1,.36,1) both!important;}}'
    ].join('');
    document.head.appendChild(st);
  }

  var isMobile = window.innerWidth < 600;
  var layer = document.createElement('div');
  layer.id = 'pb-popup-layer';
  layer.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:' + (isMobile ? 'flex-end' : 'center') + ';justify-content:center;background:rgba(0,0,0,.55);padding:' + (isMobile ? '0' : '16px') + ';';

  var frame = document.createElement('div');
  frame.className = 'pb-popup-frame';
  var _fw = visible[0] ? (visible[0].imageWidth || visible[0].image_width || null) : null;
  if (_fw && !isMobile) { frame.style.width = _fw + 'px'; frame.style.maxWidth = 'min(' + _fw + 'px, 90vw)'; }
  if (isMobile) { frame.style.borderRadius = '18px 18px 0 0'; frame.style.maxWidth = '100%'; }

  var body = document.createElement('div');
  body.className = 'pb-popup-body';

  visible.forEach(function (p, idx) {
    var slide = document.createElement('div');
    slide.className = 'pb-popup-slide' + (idx === 0 ? ' pb-active' : '');
    var imgSrc = p.imageUrl || p.image_url || '';
    var linkHref = p.linkUrl || p.link_url || '';
    var imgW = p.imageWidth || p.image_width || null;
    var imgH = p.imageHeight || p.image_height || null;
    var imgStyle = 'display:block;' + (imgW ? 'width:' + imgW + 'px;max-width:100%;' : 'width:100%;') + (imgH ? 'height:' + imgH + 'px;object-fit:cover;' : 'height:auto;');
    var imgHtml = '';
    if (imgSrc) {
      var imgTag = '<img src="' + imgSrc + '" alt="" style="' + imgStyle + '">';
      imgHtml = linkHref ? '<a href="' + linkHref + '" target="_blank" rel="noopener" style="display:block;cursor:pointer">' + imgTag + '</a>' : imgTag;
    }
    var contentHtml = p.content ? '<div style="font-size:.88rem;color:#475569;line-height:1.7;margin-bottom:10px">' + p.content + '</div>' : '';
    var hasTitle = !!(p.title || contentHtml);
    slide.innerHTML = imgHtml + (hasTitle ? '<div style="padding:16px 18px ' + (contentHtml ? '4px' : '16px') + ';">' + (p.title ? '<div style="font-weight:900;font-size:1.02rem;color:#04142b;margin-bottom:' + (contentHtml ? '8' : '0') + 'px">' + p.title + '</div>' : '') + contentHtml + '</div>' : '');
    body.appendChild(slide);
  });

  var closeBtn = document.createElement('button');
  closeBtn.className = 'pb-popup-close'; closeBtn.innerHTML = '✕'; closeBtn.title = '닫기';
  closeBtn.onclick = function () { closePopupLayer(); };
  body.appendChild(closeBtn);
  frame.appendChild(body);

  /* 하단 바 */
  var bar = document.createElement('div'); bar.className = 'pb-popup-bar';
  var curIdx = 0;

  function getCurrentPopup() {
    var activeSlide = body.querySelector('.pb-popup-slide.pb-active');
    var idx = 0;
    body.querySelectorAll('.pb-popup-slide').forEach(function (s, i) { if (s === activeSlide) idx = i; });
    return visible[idx];
  }

  /* 오늘 하루 보지 않기 */
  var todayLabel = document.createElement('label');
  todayLabel.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;min-width:0;';
  var todayCb = document.createElement('input'); todayCb.type = 'checkbox';
  todayCb.style.cssText = 'width:14px;height:14px;flex-shrink:0;cursor:pointer;accent-color:#1e7fe8;';
  var todaySpan = document.createElement('span');
  todaySpan.style.cssText = 'font-size:.73rem;color:#64748b;white-space:nowrap;';
  todaySpan.textContent = '오늘 하루 보지 않기';
  todayLabel.appendChild(todayCb);
  todayLabel.appendChild(todaySpan);

  todayCb.onchange = function () {
    if (!this.checked) return;
    var p = getCurrentPopup();
    if (p) {
      dismissed[p.id] = now + 86400000;
      try { localStorage.setItem('pb_popup_dismiss_v2', JSON.stringify(dismissed)); } catch (e) {}
    }
    closePopupLayer();
  };

  var navArea = document.createElement('div'); navArea.className = 'pb-popup-nav';

  function goTo(idx) {
    if (idx < 0 || idx >= visible.length) return;
    body.querySelectorAll('.pb-popup-slide').forEach(function (s) { s.classList.remove('pb-active'); });
    body.querySelectorAll('.pb-popup-slide')[idx].classList.add('pb-active');
    curIdx = idx;
    todayCb.checked = false;
    updateNav();
  }

  var prevBtn2 = document.createElement('button'); prevBtn2.className = 'pb-nav-btn'; prevBtn2.innerHTML = '&#8249;'; prevBtn2.title = '이전'; prevBtn2.disabled = true;
  prevBtn2.onclick = function () { goTo(curIdx - 1); };
  var counter = document.createElement('span'); counter.className = 'pb-popup-counter';
  var nextBtn2 = document.createElement('button'); nextBtn2.className = 'pb-nav-btn'; nextBtn2.innerHTML = '&#8250;'; nextBtn2.title = '다음';
  nextBtn2.onclick = function () { goTo(curIdx + 1); };

  function updateNav() {
    prevBtn2.disabled = (curIdx === 0); nextBtn2.disabled = (curIdx === visible.length - 1);
    if (visible.length > 1) counter.textContent = (curIdx + 1) + ' / ' + visible.length;
  }

  if (visible.length > 1) { navArea.appendChild(prevBtn2); navArea.appendChild(counter); navArea.appendChild(nextBtn2); }

  var closeBarBtn = document.createElement('button');
  closeBarBtn.style.cssText = 'border:none;background:#1e7fe8;color:#fff;border-radius:7px;padding:5px 14px;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .15s;';
  closeBarBtn.textContent = '닫기'; closeBarBtn.onclick = function () { closePopupLayer(); };

  bar.appendChild(todayLabel); bar.appendChild(navArea); bar.appendChild(closeBarBtn);
  frame.appendChild(bar); layer.appendChild(frame);

  function closePopupLayer() {
    layer.style.opacity = '0'; layer.style.transition = 'opacity .22s';
    setTimeout(function () { if (layer.parentNode) layer.remove(); }, 230);
  }

  layer.onclick = function (e) { if (e.target === layer) closePopupLayer(); };
  document.body.appendChild(layer);
  updateNav();
}