<section class="sec sec-cream" id="sec-property">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">Unit Plan</span></div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-dark">매물정보</h2>
        <div class="cx-cats" id="propCats"></div>
      </div>
      <p class="sec-sub" style="margin-top:12px;">단순한 주거공간을 넘어 새로운 라이프스타일을 창조합니다.</p>
    </div>

    <div class="unit-grid" id="propGrid"></div>
  </div>
</section>

<!-- 갤러리 슬라이더 모달 -->
<div class="gl-modal-bg" id="glModal" onclick="if(event.target===this)glClose()">
  <div class="gl-modal">
    <div class="gl-modal-hd">
      <div class="gl-modal-ttl" id="glModalTtl"></div>
      <button class="gl-modal-x" onclick="glClose()">&#10005;</button>
    </div>
    <div class="gl-modal-body">
      <div class="gl-modal-specs" id="glModalSpecs" style="display:none;"></div>
      <div class="gl-slider" id="glSlider">
        <div class="gl-slider-track" id="glSliderTrack"></div>
        <button class="gl-slider-prev" id="glSliderPrev" onclick="glSlide(-1)">&#8249;</button>
        <button class="gl-slider-next" id="glSliderNext" onclick="glSlide(1)">&#8250;</button>
        <div class="gl-slider-dots" id="glSliderDots"></div>
      </div>
      <div class="gl-modal-cnt" id="glModalCnt"></div>
    </div>
  </div>
</div>

<style>
.gl-slider { position:relative; overflow:hidden; background:#000; }
.gl-slider-track { display:flex; transition:transform .35s ease; }
.gl-slider-track img { min-width:100%; width:100%; max-height:68vh; object-fit:contain; flex-shrink:0; display:block; }
.gl-slider-prev,
.gl-slider-next { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,.45); color:#fff; border:none; font-size:2rem; line-height:1; padding:10px 16px; cursor:pointer; z-index:2; transition:background .2s; }
.gl-slider-prev { left:0; }
.gl-slider-next { right:0; }
.gl-slider-prev:hover,
.gl-slider-next:hover { background:rgba(0,0,0,.75); }
.gl-slider-dots { position:absolute; bottom:12px; left:50%; transform:translateX(-50%); display:flex; gap:6px; }
.gl-slider-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.35); border:none; cursor:pointer; padding:0; transition:background .2s; }
.gl-slider-dot.on { background:#fff; }
</style>

<script>
var _glImgs = [], _glIdx = 0;

function esc(s) { if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

/* ── 제품 데이터 저장소 ── */
var _propData = [];

/* ── fetch ── */
(function() {
  fetch('/admin/api_front/product_public.php')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.ok || !data.products || !data.products.length) return;
      _propData = data.products;

      /* 분류 버튼 생성 */
      var catsEl = document.getElementById('propCats');
      var catsHtml = '<button class="cx-cat-btn on" onclick="propFilter(this,\'\')">전체</button>';
      (data.categories || []).forEach(function(c) {
        catsHtml += '<button class="cx-cat-btn" onclick="propFilter(this,\'' + esc(c.id) + '\')">' + esc(c.name) + '</button>';
      });
      catsEl.innerHTML = catsHtml;

      /* 카드 렌더링 */
      var grid = document.getElementById('propGrid');
      var html = '';
      data.products.forEach(function(p, idx) {
        var imgUrl = p.imageUrl || '';
        var name   = p.name || '';
        var specs  = Array.isArray(p.specs) ? p.specs : [];

        var specRowsHtml = '';
        specs.slice(0, 3).forEach(function(s) {
          specRowsHtml +=
            '<div class="unit-spec-row">' +
              '<span class="unit-spec-lbl">' + esc(s[0]) + '</span>' +
              '<span class="unit-spec-val">' + esc(s[1]) + '</span>' +
            '</div>';
        });

        html +=
          '<div class="unit-card" data-cat="' + esc(p.categoryId) + '" onclick="propGlOpen(' + idx + ')">' +
            '<div class="unit-img">' +
              (imgUrl ? '<img src="' + esc(imgUrl) + '" alt="' + esc(name) + '" loading="lazy">' : '') +
            '</div>' +
            '<div class="unit-card-body">' +
              '<div class="unit-card-ttl">' + esc(name) + '</div>' +
              '<div class="unit-specs">' + specRowsHtml + '</div>' +
            '</div>' +
          '</div>';
      });
      grid.innerHTML = html;
    })
    .catch(function() {});
})();

/* ── 분류 필터 ── */
function propFilter(btn, catId) {
  document.querySelectorAll('#propCats .cx-cat-btn').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  document.querySelectorAll('#propGrid .unit-card').forEach(function(card) {
    card.style.display = (!catId || card.dataset.cat === catId) ? '' : 'none';
  });
}

/* ── 모달 열기 (제품용) ── */
function propGlOpen(idx) {
  var p = _propData[idx];
  if (!p) return;

  var specs   = Array.isArray(p.specs) ? p.specs : [];
  var imgUrl  = p.imageUrl || '';
  var content = p.description || '';

  document.getElementById('glModalTtl').textContent = p.name || '';

  var specsEl = document.getElementById('glModalSpecs');
  if (specs.length) {
    specsEl.style.display = 'grid';
    specsEl.innerHTML = specs.map(function(s) {
      return '<div class="gl-modal-spec">' +
               '<div class="gl-modal-spec-lbl">' + esc(s[0]) + '</div>' +
               '<div class="gl-modal-spec-val">' + esc(s[1]) + '</div>' +
             '</div>';
    }).join('');
  } else {
    specsEl.style.display = 'none';
  }

  _glImgs = imgUrl ? [imgUrl] : [];
  _glIdx  = 0;
  glRenderSlider();

  document.getElementById('glModalCnt').innerHTML = content.replace(/\n/g, '<br>');
  document.getElementById('glModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── 슬라이더 ── */
function glRenderSlider() {
  var track  = document.getElementById('glSliderTrack');
  var dots   = document.getElementById('glSliderDots');
  var prev   = document.getElementById('glSliderPrev');
  var next   = document.getElementById('glSliderNext');
  var slider = document.getElementById('glSlider');

  if (!_glImgs.length) { slider.style.display = 'none'; return; }
  slider.style.display = 'block';

  track.innerHTML = _glImgs.map(function(u){ return '<img src="'+esc(u)+'" alt="" loading="lazy">'; }).join('');
  track.style.transform = 'translateX(0)';

  var single = _glImgs.length <= 1;
  prev.style.display = single ? 'none' : '';
  next.style.display = single ? 'none' : '';
  dots.innerHTML = single ? '' : _glImgs.map(function(_,i){
    return '<button class="gl-slider-dot'+(i===0?' on':'')+'" onclick="glGoTo('+i+')"></button>';
  }).join('');
}

function glGoTo(n) {
  _glIdx = (n + _glImgs.length) % _glImgs.length;
  document.getElementById('glSliderTrack').style.transform = 'translateX(-'+(_glIdx * 100)+'%)';
  document.querySelectorAll('.gl-slider-dot').forEach(function(d,i){ d.classList.toggle('on', i===_glIdx); });
}

function glSlide(d) { glGoTo(_glIdx + d); }

function glClose() {
  document.getElementById('glModal').classList.remove('open');
  document.body.style.overflow = '';
}
</script>