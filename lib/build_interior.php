<section class="sec sec-beige" id="sec-interior">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow">
        <span class="sec-eyebrow-line"></span>
        <span class="sec-eyebrow-txt">Interior</span>
      </div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-dark">인테리어</h2>
        <div class="cx-cats" id="intCats"></div>
      </div>
    </div>
    <div class="int-grid" id="intGrid">
      <div style="grid-column:1/-1;padding:60px;text-align:center;color:var(--g4);font-size:.88rem;">불러오는 중...</div>
    </div>
    <div class="pag" id="intPag"></div>
  </div>
</section>

<!-- 인테리어 모달 -->
<div class="int-modal-bg" id="intModal" onclick="if(event.target===this)intModalClose()">
  <div class="int-modal">
    <button class="int-modal-x" onclick="intModalClose()" aria-label="닫기"></button>
    <div class="int-modal-slider" id="intModalSlider">
      <div class="int-modal-track" id="intModalTrack"></div>
      <button class="int-modal-prev" id="intModalPrev" onclick="intSlide(-1)" aria-label="이전">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="int-modal-next" id="intModalNext" onclick="intSlide(1)" aria-label="다음">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="int-modal-dots" id="intModalDots"></div>
      <div class="int-modal-counter" id="intModalCounter"></div>
    </div>
    <div class="int-modal-info">
      <div class="int-modal-cat" id="intModalCat"></div>
      <div class="int-modal-ttl" id="intModalTtl"></div>
      <div class="int-modal-desc" id="intModalDesc"></div>
    </div>
  </div>
</div>

<style>
/* ── 모달 배경 ── */
.int-modal-bg {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.82);
  z-index: 9000;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.int-modal-bg.open { display: flex; }

/* ── 모달 본체 ── */
.int-modal {
  position: relative;
  background: #fff;
  border-radius: 0;
  overflow: hidden;
  width: 100%;
  max-width: 860px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

/* ── 닫기 버튼 ── */
.int-modal-x {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(0,0,0,.5);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 0;
  font-size: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s;
}
.int-modal-x:hover { background: rgba(0,0,0,.8); }
.int-modal-x::before,
.int-modal-x::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 2px;
  background: #fff;
}
.int-modal-x::before { transform: rotate(45deg); }
.int-modal-x::after  { transform: rotate(-45deg); }

/* ── 슬라이더 영역 ── */
.int-modal-slider {
  position: relative;
  background: #111;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
}
.int-modal-track {
  display: flex;
  transition: transform .35s ease;
  will-change: transform;
}
.int-modal-track img {
  min-width: 100%;
  width: 100%;
  max-height: 62vh;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
  pointer-events: none;
  -webkit-user-drag: none;
}

/* ── 이전/다음 버튼 ── */
.int-modal-prev,
.int-modal-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,.38);
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 0;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s;
  padding: 0;
}
.int-modal-prev { left: 0; }
.int-modal-next { right: 0; }
.int-modal-prev:hover,
.int-modal-next:hover { background: rgba(0,0,0,.68); }
.int-modal-prev svg,
.int-modal-next svg { width: 22px; height: 22px; display: block; }

/* ── 도트 ── */
.int-modal-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}
.int-modal-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,.35);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background .2s;
}
.int-modal-dot.on { background: #fff; }

/* ── 카운터 ── */
.int-modal-counter {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0,0,0,.45);
  color: #fff;
  font-size: .72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 0;
  letter-spacing: .05em;
}

/* ── 텍스트 정보 ── */
.int-modal-info {
  padding: 20px 24px 24px;
  overflow-y: auto;
}
.int-modal-cat {
  display: inline-block;
  font-size: .7rem;
  font-weight: 700;
  color: var(--br, #1255a6);
  border: 1px solid var(--br, #1255a6);
  border-radius: 0;
  padding: 2px 10px;
  margin-bottom: 10px;
  letter-spacing: .04em;
}
.int-modal-ttl {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--g8, #111);
  margin-bottom: 8px;
  line-height: 1.4;
}
.int-modal-desc {
  font-size: .84rem;
  color: var(--g5, #666);
  line-height: 1.8;
}

/* ── 반응형 ── */
@media (max-width: 600px) {
  .int-modal-bg { padding: 0; align-items: flex-end; }
  .int-modal { max-height: 96vh; }
  .int-modal-track img { max-height: 56vw; }
  .int-modal-prev,
  .int-modal-next { width: 36px; height: 36px; }
  .int-modal-prev svg,
  .int-modal-next svg { width: 18px; height: 18px; }
  .int-modal-info { padding: 16px 16px 22px; }
}
</style>

<script>
var _intAll  = [];
var _intLim  = 6;
var _intPg   = 1;
var _intCat  = '';
var _intImgs = [];
var _intIdx  = 0;

function fmtDtInt(s) { return s ? String(s).slice(0,10).replace(/-/g,'.') : ''; }
function escI(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ── API fetch ── */
fetch('/admin/api_front/board_public.php?table=photo')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (!data.ok || !data.posts || !data.posts.length) {
      document.getElementById('intGrid').innerHTML =
        '<div style="grid-column:1/-1;padding:60px;text-align:center;color:var(--g4);font-size:.88rem;">등록된 항목이 없습니다.</div>';
      return;
    }
    _intAll = data.posts;

    /* 분류 버튼 동적 생성 */
    var cats = [];
    _intAll.forEach(function(p) {
      var cat = (p.extra && p.extra['분류']) ? p.extra['분류'] : '';
      if (cat && cats.indexOf(cat) === -1) cats.push(cat);
    });
    var catsEl = document.getElementById('intCats');
    if (cats.length) {
      var html = '<button class="cx-cat-btn on" onclick="intFilter(this,\'\')">전체</button>';
      cats.forEach(function(c) {
        html += '<button class="cx-cat-btn" onclick="intFilter(this,\''+escI(c)+'\')">'+escI(c)+'</button>';
      });
      catsEl.innerHTML = html;
    }

    intLoad(1);
  })
  .catch(function() {
    document.getElementById('intGrid').innerHTML =
      '<div style="grid-column:1/-1;padding:60px;text-align:center;color:var(--g4);font-size:.88rem;">데이터를 불러올 수 없습니다.</div>';
  });

/* ── 분류 필터 ── */
function intFilter(btn, cat) {
  document.querySelectorAll('#intCats .cx-cat-btn').forEach(function(b) {
    b.classList.toggle('on', b === btn);
  });
  _intCat = cat;
  intLoad(1);
}

/* ── 페이지네이션 ── */
function renderPagInt(el, cur, total, cb) {
  if (total <= 1) { el.innerHTML = ''; return; }
  var s = Math.max(1, cur-2), e = Math.min(total, cur+2);
  var html = '<button class="pag-btn'+(cur===1?' off':'')+'" onclick="'+cb+'('+(cur-1)+')">&#8592;</button>';
  for (var i=s; i<=e; i++) {
    html += '<button class="pag-btn'+(i===cur?' on':'')+'" onclick="'+cb+'('+i+')">'+i+'</button>';
  }
  html += '<button class="pag-btn'+(cur===total?' off':'')+'" onclick="'+cb+'('+(cur+1)+')">&#8594;</button>';
  el.innerHTML = html;
}

/* ── 그리드 렌더링 ── */
function intLoad(page) {
  _intPg = page;

  var grid = document.getElementById('intGrid');
  var pag  = document.getElementById('intPag');

  var src = _intCat
    ? _intAll.filter(function(p) { return ((p.extra && p.extra['분류']) || '') === _intCat; })
    : _intAll;

  var total = Math.ceil(src.length / _intLim);
  var items = src.slice((page-1)*_intLim, page*_intLim);

  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:60px;text-align:center;color:var(--g4);font-size:.88rem;">등록된 항목이 없습니다.</div>';
    pag.innerHTML = '';
    return;
  }

  items.forEach(function(item) {
    var div = document.createElement('div');
    div.className = 'int-card';
    div.style.cursor = 'pointer';
    div.onclick = function() { intModalOpen(item); };

    var thumb = intFixPath(item.imageUrl || (item.extra && item.extra['썸네일이미지']) || '');

    div.innerHTML =
      '<div class="int-img">' +
        (thumb
          ? '<img src="'+escI(thumb)+'" alt="'+escI(item.title)+'" loading="lazy">'
          : '<div class="int-img-ph">'+escI(item.title)+'</div>'
        ) +
        '<div class="int-ov">' +
          '<div class="int-icon">' +
            '<svg viewBox="0 0 24 24">' +
              '<circle cx="11" cy="11" r="8"/>' +
              '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
            '</svg>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="int-info">' +
        '<div class="ttl">'+escI(item.title)+'</div>' +
        '<div class="dt">'+fmtDtInt(item.date)+'</div>' +
      '</div>';

    grid.appendChild(div);
  });

  renderPagInt(pag, page, total, 'intLoad');
}

/* ── 상대경로 → 절대경로 변환 ── */
function intFixPath(p) {
  if (!p) return '';
  /* ../uploads/... → /uploads/... */
  return String(p).replace(/^\.\.\//, '/');
}

/* ── 모달 열기 ── */
function intModalOpen(item) {
  /* 상세이미지 수집: extra['상세이미지'] → 썸네일 fallback */
  var imgs = [];
  if (item.extra && item.extra['상세이미지']) {
    var raw = item.extra['상세이미지'];
    if (Array.isArray(raw)) {
      imgs = raw.filter(Boolean);
    } else if (typeof raw === 'string') {
      /* JSON 문자열 형태: "[\"path1\",\"path2\"]" */
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          imgs = parsed.filter(Boolean);
        } else {
          imgs = [String(parsed)].filter(Boolean);
        }
      } catch(e) {
        /* JSON 파싱 실패 시 줄바꿈/쉼표 구분 처리 */
        imgs = raw.split(/[\n,]+/).map(function(s){ return s.trim(); }).filter(Boolean);
      }
    }
  }
  /* 경로 보정 */
  imgs = imgs.map(intFixPath);

  if (!imgs.length) {
    var thumb = intFixPath(item.imageUrl || (item.extra && item.extra['썸네일이미지']) || '');
    if (thumb) imgs = [thumb];
  }

  _intImgs = imgs;
  _intIdx  = 0;

  var track   = document.getElementById('intModalTrack');
  var dots    = document.getElementById('intModalDots');
  var prev    = document.getElementById('intModalPrev');
  var next    = document.getElementById('intModalNext');
  var slider  = document.getElementById('intModalSlider');
  var counter = document.getElementById('intModalCounter');

  if (!imgs.length) {
    slider.style.display = 'none';
  } else {
    slider.style.display = 'block';
    track.innerHTML = imgs.map(function(u) {
      return '<img src="'+escI(u)+'" alt="" loading="lazy">';
    }).join('');
    track.style.transform = 'translateX(0)';

    var single = imgs.length <= 1;
    prev.style.display    = single ? 'none' : '';
    next.style.display    = single ? 'none' : '';
    counter.style.display = single ? 'none' : '';
    dots.innerHTML = single ? '' : imgs.map(function(_, i) {
      return '<button class="int-modal-dot'+(i===0?' on':'')+'" onclick="intGoTo('+i+')"></button>';
    }).join('');
    if (!single) counter.textContent = '1 / ' + imgs.length;
  }

  /* 텍스트 정보 */
  var cat = (item.extra && item.extra['분류']) ? item.extra['분류'] : '';
  document.getElementById('intModalTtl').textContent   = item.title || '';
  var catEl = document.getElementById('intModalCat');
  catEl.textContent   = cat;
  catEl.style.display = cat ? '' : 'none';
  document.getElementById('intModalDesc').innerHTML = escI(item.content || '').replace(/\n/g,'<br>');

  document.getElementById('intModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── 슬라이드 이동 ── */
function intGoTo(n) {
  _intIdx = (n + _intImgs.length) % _intImgs.length;
  document.getElementById('intModalTrack').style.transform = 'translateX(-'+(_intIdx * 100)+'%)';
  document.querySelectorAll('.int-modal-dot').forEach(function(d, i) {
    d.classList.toggle('on', i === _intIdx);
  });
  document.getElementById('intModalCounter').textContent = (_intIdx+1) + ' / ' + _intImgs.length;
}
function intSlide(d) { intGoTo(_intIdx + d); }

/* ── 모달 닫기 ── */
function intModalClose() {
  document.getElementById('intModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── ESC 키 닫기 ── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') intModalClose();
});

/* ── 터치 스와이프 ── */
(function() {
  var slider = document.getElementById('intModalSlider');
  var _tx = 0, _dragging = false;

  slider.addEventListener('touchstart', function(e) {
    if (_intImgs.length <= 1) return;
    _tx = e.touches[0].clientX;
    _dragging = true;
  }, { passive: true });

  slider.addEventListener('touchend', function(e) {
    if (!_dragging) return;
    _dragging = false;
    var dx = e.changedTouches[0].clientX - _tx;
    if (Math.abs(dx) > 40) intSlide(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
</script>