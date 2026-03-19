/* ═══════════════════════════════════════
   notices-faq-gallery.js
   — 공지사항 / FAQ / 갤러리
═══════════════════════════════════════ */

/* ── 스크롤 잠금 유틸 (iOS Safari 포함) ── */
function _lockScroll() {
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}
function _unlockScroll() {
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
}

/* ═══════════════════════
   NOTICES (공지사항)
   board table: notice
═══════════════════════ */
var _ntAllPosts = [], _ntPage = 1, _ntLimit = 10;
var _ntKw = '', _ntCat = '', _ntField = 'all';

function ntInit(posts) {
  _ntAllPosts = posts;
  // 분류 셀렉트 채우기
  var cats = {}, sel = document.getElementById('ntCatSel');
  posts.forEach(function(p) {
    var c = p.extra && p.extra['분류'] ? p.extra['분류'] : '';
    if (c && !cats[c]) { cats[c] = true; var o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); }
  });
  ntRender(true);
}

function ntFiltered() {
  return _ntAllPosts.filter(function(p) {
    var catOk  = !_ntCat  || (p.extra && p.extra['분류']) === _ntCat;
    var kwOk   = !_ntKw;
    if (_ntKw) {
      var kl = _ntKw.toLowerCase();
      if (_ntField === 'title')   kwOk = p.title.toLowerCase().includes(kl);
      else if (_ntField === 'content') kwOk = (p.content||'').toLowerCase().includes(kl);
      else kwOk = p.title.toLowerCase().includes(kl) || (p.content||'').toLowerCase().includes(kl);
    }
    return catOk && kwOk;
  });
}

function ntRender(reset) {
  if (reset) _ntPage = 1;
  var filtered = ntFiltered();
  var tbody = document.getElementById('ntTbody');
  var page = filtered.slice(0, _ntPage * _ntLimit);
  if (!page.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="nt-empty">등록된 공지사항이 없습니다.</td></tr>';
  } else {
    tbody.innerHTML = page.map(function(p) {
      var cat = (p.extra && p.extra['분류']) || '일반';
      return '<tr>'
        + '<td class="nt-td-cat"><span class="nt-cat-badge">' + ntEsc(cat) + '</span></td>'
        + '<td class="nt-td-title"><a class="nt-title-link" onclick="ntOpenDetail(' + p.id + ')">' + ntEsc(p.title) + '</a></td>'
        + '<td class="nt-td-date nt-date">' + (p.date||'').slice(0,10) + '</td>'
        + '</tr>';
    }).join('');
  }
  var moreWrap = document.getElementById('ntMoreWrap');
  var remaining = filtered.length - _ntPage * _ntLimit;
  if (remaining > 0) {
    moreWrap.style.display = 'block';
    document.getElementById('ntMoreCount').textContent = '(' + remaining + '개 더 보기)';
  } else {
    moreWrap.style.display = 'none';
  }
}

function ntSearch() {
  _ntKw    = document.getElementById('ntKwInp').value.trim();
  _ntCat   = document.getElementById('ntCatSel').value;
  _ntField = document.getElementById('ntFieldSel').value;
  ntRender(true);
}
function ntLoadMore() { _ntPage++; ntRender(false); }

function ntOpenDetail(id) {
  var p = _ntAllPosts.find(function(x) { return x.id === id; });
  if (!p) return;
  var cat = (p.extra && p.extra['분류']) || '일반';
  document.getElementById('ntDCat').textContent   = cat;
  document.getElementById('ntDTitle').textContent = p.title || '';
  document.getElementById('ntDDate').textContent  = (p.date||'').slice(0,10);
  document.getElementById('ntDContent').textContent = p.content || '';

  // 첨부파일
  var filesWrap = document.getElementById('ntDFiles');
  var files = p.extra && p.extra['첨부파일'] ? (Array.isArray(p.extra['첨부파일']) ? p.extra['첨부파일'] : JSON.parse(p.extra['첨부파일']||'[]')) : [];
  if (files.length) {
    document.getElementById('ntDFileList').innerHTML = files.map(function(f) {
      var url = typeof f === 'string' ? f : (f.url || f.file_url || '');
      var name = typeof f === 'string' ? url.split('/').pop() : (f.name || f.file_name || url.split('/').pop());
      return '<a class="nt-file-item" href="' + url + '" target="_blank" rel="noopener">' + ntEsc(name) + '</a>';
    }).join('');
    filesWrap.style.display = 'block';
  } else {
    filesWrap.style.display = 'none';
  }

  // 링크
  var link = p.extra && p.extra['링크'] ? p.extra['링크'] : '';
  var linkWrap = document.getElementById('ntDLinkWrap');
  if (link) { document.getElementById('ntDLink').href = link; linkWrap.style.display = 'block'; }
  else linkWrap.style.display = 'none';

  document.getElementById('ntDetailOverlay').classList.add('open');
  _lockScroll();
}

function ntCloseDetail() { document.getElementById('ntDetailOverlay').classList.remove('open'); _unlockScroll(); }
function ntEsc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }


/* ═══════════════════════
   FAQ
   board table: faqq
═══════════════════════ */
var _faqAllPosts = [], _faqPage = 1, _faqLimit = 10;
var _faqKw = '', _faqCatId = '', _faqField = 'all';

function faqInit(posts) {
  _faqAllPosts = posts;
  // 분류 탭 채우기
  var cats = [], seen = {};
  posts.forEach(function(p) {
    var c = p.extra && p.extra['분류'] ? p.extra['분류'] : '';
    if (c && !seen[c]) { seen[c] = true; cats.push(c); }
  });
  var tabs = document.getElementById('faqCatTabs');
  if (tabs) {
    tabs.innerHTML = '<button class="faq-cat-btn on" onclick="faqSetCat(\'\',this)">전체</button>'
      + cats.map(function(c) { return '<button class="faq-cat-btn" onclick="faqSetCat(\'' + faqEsc(c) + '\',this)">' + faqEsc(c) + '</button>'; }).join('');
  }
  var info = document.getElementById('faqResultInfo');
  if (info) info.innerHTML = '전체 <strong>' + posts.length + '</strong>건';
  faqRender(true);
}

function faqFiltered() {
  return _faqAllPosts.filter(function(p) {
    var catOk = !_faqCatId || (p.extra && p.extra['분류']) === _faqCatId;
    var kwOk  = !_faqKw;
    if (_faqKw) {
      var kl = _faqKw.toLowerCase();
      if (_faqField === 'title')   kwOk = p.title.toLowerCase().includes(kl);
      else if (_faqField === 'content') kwOk = (p.content||'').toLowerCase().includes(kl);
      else kwOk = p.title.toLowerCase().includes(kl) || (p.content||'').toLowerCase().includes(kl);
    }
    return catOk && kwOk;
  });
}

function faqRender(reset) {
  if (reset) _faqPage = 1;
  var filtered = faqFiltered();
  var info = document.getElementById('faqResultInfo');
  if (info) info.innerHTML = (_faqKw || _faqCatId) ? '검색 결과: <strong>' + filtered.length + '</strong>건' : '전체 <strong>' + filtered.length + '</strong>건';
  var el = document.getElementById('faqList');
  var page = filtered.slice(0, _faqPage * _faqLimit);
  if (!page.length) {
    el.innerHTML = '<div class="faq-empty">' + (_faqKw || _faqCatId ? '검색 결과가 없습니다.' : '등록된 FAQ가 없습니다.') + '</div>';
  } else {
    el.innerHTML = page.map(function(p) {
      var cat = (p.extra && p.extra['분류']) || '';
      var content = p.content || '';
      return '<div class="faq-item">'
        + '<div class="faq-q" onclick="faqToggle(this)">'
        + '<div class="faq-q-row"><div class="faq-q-label">Q</div>'
        + (cat ? '<span class="faq-q-cat">' + faqEsc(cat) + '</span>' : '')
        + '<span class="faq-q-text">' + faqEsc(p.title) + '</span>'
        + '<span class="faq-arrow"><svg viewBox="0 0 24 24" fill="none"><polyline points="6 9 12 15 18 9"/></svg></span></div></div>'
        + '<div class="faq-a"><div class="faq-a-label">A</div><div class="faq-a-body">' + faqEsc(content) + '</div></div>'
        + '</div>';
    }).join('');
  }
  var remaining = filtered.length - _faqPage * _faqLimit;
  var moreWrap = document.getElementById('faqMoreWrap');
  if (remaining > 0) {
    moreWrap.style.display = 'block';
    document.getElementById('faqMoreCount').textContent = '(' + remaining + '개 더 보기)';
  } else {
    moreWrap.style.display = 'none';
  }
}

function faqSetCat(catId, btn) {
  _faqCatId = catId;
  document.querySelectorAll('.faq-cat-btn').forEach(function(b) { b.classList.remove('on'); });
  if (btn) btn.classList.add('on');
  faqRender(true);
}
function faqSearch()  { _faqKw = document.getElementById('faqSearchInp').value.trim(); _faqField = (document.getElementById('faqFieldSel')||{value:'all'}).value; faqRender(true); }
function faqReset()   {
  _faqKw = ''; _faqField = 'all'; _faqCatId = '';
  var inp = document.getElementById('faqSearchInp'), sel = document.getElementById('faqFieldSel');
  if (inp) inp.value = ''; if (sel) sel.value = 'all';
  document.querySelectorAll('.faq-cat-btn').forEach(function(b) { b.classList.remove('on'); });
  var first = document.querySelector('.faq-cat-btn'); if (first) first.classList.add('on');
  faqRender(true);
}
function faqLoadMore() { _faqPage++; faqRender(false); }
function faqToggle(qEl) { qEl.parentElement.classList.toggle('open'); }
function faqEsc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }


/* ═══════════════════════
   GALLERY (갤러리)
   board table: gallery
═══════════════════════ */
(function() {
  var _glAllPosts = [], _glPage = 1, _glCat = '';
  var GL_LIMIT = 6;

  function glEsc(s)  { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function glAttr(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function glParseImages(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    try { var arr = JSON.parse(val); if (Array.isArray(arr)) return arr.filter(Boolean); } catch(e) {}
    return val.split(/[\n,]+/).map(function(s) { return s.trim(); }).filter(Boolean);
  }

  function glInit(posts) {
    _glAllPosts = posts;
    // 분류 탭
    var cats = [], seen = {};
    posts.forEach(function(p) {
      var c = p.extra && p.extra['분류'] ? p.extra['분류'] : '';
      if (c && !seen[c]) { seen[c] = true; cats.push(c); }
    });
    var wrap = document.getElementById('glCatTabs');
    if (wrap && cats.length) {
      wrap.innerHTML = '<button class="gl-ct on" data-cat="">전체</button>'
        + cats.map(function(c) { return '<button class="gl-ct" data-cat="' + glAttr(c) + '">' + glEsc(c) + '</button>'; }).join('');
      wrap.querySelectorAll('.gl-ct').forEach(function(btn) {
        btn.addEventListener('click', function() {
          wrap.querySelectorAll('.gl-ct').forEach(function(b) { b.classList.remove('on'); });
          btn.classList.add('on'); _glCat = btn.getAttribute('data-cat'); _glPage = 1; glRender();
        });
      });
    }
    glRender();
  }

  function glFiltered() {
    return _glAllPosts.filter(function(p) {
      return !_glCat || (p.extra && p.extra['분류']) === _glCat;
    });
  }

  function glRender() {
    var filtered = glFiltered();
    var total    = filtered.length;
    var pages    = Math.ceil(total / GL_LIMIT);
    var items    = filtered.slice((_glPage-1)*GL_LIMIT, _glPage*GL_LIMIT);
    var grid     = document.getElementById('glGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!items.length) {
      grid.innerHTML = '<div class="gl-empty">등록된 갤러리가 없습니다.</div>';
    } else {
      items.forEach(function(p) {
        var images   = glParseImages(p.extra && p.extra['상세이미지'] ? p.extra['상세이미지'] : (p.imageUrl || ''));
        var thumb    = p.imageUrl || images[0] || '';
        var cat      = (p.extra && p.extra['분류']) || '';
        var link     = (p.extra && p.extra['링크']) || '';
        var thumbHtml = thumb
          ? '<img src="' + glAttr(thumb) + '" alt="' + glAttr(p.title) + '" loading="lazy">'
          : '<div class="gl-card-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="38" height="38"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
        var card = document.createElement(link ? 'a' : 'div');
        card.className = 'gl-card';
        if (link) { card.href = link; card.target = '_blank'; card.rel = 'noopener noreferrer'; }
        else { (function(item) { card.addEventListener('click', function() { glOpenModal(item); }); })(p); }
        card.innerHTML = '<div class="gl-card-thumb">' + thumbHtml + (link ? '<div class="gl-link-badge">링크</div>' : '') + '</div>'
          + '<div class="gl-card-body">' + (cat ? '<div class="gl-card-cat">' + glEsc(cat) + '</div>' : '') + '<div class="gl-card-title">' + glEsc(p.title) + '</div></div>';
        grid.appendChild(card);
      });
    }
    // 페이저
    var pager = document.getElementById('glPager');
    if (pager) {
      if (pages <= 1) { pager.innerHTML = ''; return; }
      var ph = '', s2 = Math.max(1, _glPage-2), e2 = Math.min(pages, _glPage+2);
      if (s2 > 1) { ph += '<button class="gl-pg-btn" onclick="glGoPage(1)">1</button>'; if (s2 > 2) ph += '<span class="gl-pg-ellipsis">...</span>'; }
      for (var pi = s2; pi <= e2; pi++) ph += '<button class="gl-pg-btn' + (pi===_glPage?' on':'') + '" onclick="glGoPage(' + pi + ')">' + pi + '</button>';
      if (e2 < pages) { if (e2 < pages-1) ph += '<span class="gl-pg-ellipsis">...</span>'; ph += '<button class="gl-pg-btn" onclick="glGoPage(' + pages + ')">' + pages + '</button>'; }
      pager.innerHTML = ph;
    }
  }

  window.glGoPage = function(p) {
    _glPage = p; glRender();
    var sec = document.getElementById('gallery');
    if (sec) setTimeout(function() { sec.scrollIntoView({ behavior:'smooth', block:'start' }); }, 80);
  };

  window.glOpenModal = function(p) {
    var cat = (p.extra && p.extra['분류']) || '';
    var catEl = document.getElementById('glDCat');
    if (cat) { catEl.textContent = cat; catEl.style.display = 'inline-block'; } else catEl.style.display = 'none';
    document.getElementById('glDTitle').textContent = p.title || '';
    document.getElementById('glDDate').textContent  = (p.date||'').slice(0,10);
    var images = glParseImages(p.extra && p.extra['상세이미지'] ? p.extra['상세이미지'] : (p.imageUrl || ''));
    var imgEl  = document.getElementById('glDImages');
    if (images.length) {
      imgEl.innerHTML = '<img src="' + glAttr(images[0]) + '" alt="" style="width:100%;display:block;border-radius:20px 20px 0 0;object-fit:cover;" loading="lazy">'
        + (images.length > 1 ? '<div style="display:flex;flex-direction:column;gap:8px;padding:8px 0 0">' + images.slice(1).map(function(src) { return '<img src="' + glAttr(src) + '" alt="" style="width:100%;display:block;object-fit:cover;" loading="lazy">'; }).join('') + '</div>' : '');
    } else imgEl.innerHTML = '';
    var contentEl = document.getElementById('glDContent');
    if (p.content) { contentEl.textContent = p.content; contentEl.style.display = 'block'; } else contentEl.style.display = 'none';
    var link = (p.extra && p.extra['링크']) || '';
    var linkWrap = document.getElementById('glDLinkWrap');
    if (link) { document.getElementById('glDLink').href = link; linkWrap.style.display = 'block'; } else linkWrap.style.display = 'none';
    document.getElementById('glModal').classList.add('open');
    _lockScroll();
  };

  window.glCloseModal = function() { document.getElementById('glModal').classList.remove('open'); _unlockScroll(); };
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') glCloseModal(); });

  // IntersectionObserver로 갤러리 섹션 진입 시 로드
  var glSection = document.getElementById('gallery');
  var glLoaded  = false;
  if (glSection) {
    var glObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting && !glLoaded) {
          glLoaded = true; glObs.disconnect();
          fetch('/admin/api_front/board_public.php?table=gallery')
            .then(function(r) { return r.json(); })
            .then(function(data) { if (data.ok) glInit(data.posts); });
        }
      });
    }, { threshold: 0.05 });
    glObs.observe(glSection);
  }
})();