<section class="sec sec-white" id="sec-complex">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">Complex</span></div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-dark">단지안내</h2>
        <div class="cx-cats" id="cxCats"></div>
      </div>
    </div>
    <table class="board-tbl">
      <thead>
        <tr>
          <th class="cn">번호</th>
          <th>제목</th>
          <th class="date">등록일</th>
        </tr>
      </thead>
      <tbody id="complexTbody">
        <tr><td colspan="3" class="board-empty">불러오는 중...</td></tr>
      </tbody>
    </table>
    <div class="pag" id="complexPag"></div>
  </div>
</section>

<div class="bd-modal-bg" id="bdModal" onclick="if(event.target===this)bdClose()">
  <div class="bd-modal">
    <div class="bd-modal-hd">
      <div class="bd-modal-ttl" id="bdModalTtl"></div>
      <button class="bd-modal-x" onclick="bdClose()">&#10005;</button>
    </div>
    <div class="bd-modal-meta" id="bdModalMeta"></div>
    <div class="bd-modal-body" id="bdModalBody"></div>
  </div>
</div>

<style>
.cx-cats { display:flex; gap:6px; flex-wrap:wrap; }
.cx-cat-btn { padding:6px 14px; font-size:.72rem; font-weight:700; letter-spacing:.04em; color:var(--g5); border:1px solid var(--ln); background:var(--w); cursor:pointer; transition:all .18s; font-family:var(--ff); }
.cx-cat-btn.on { background:var(--br); color:var(--w); border-color:var(--br); }
.cx-cat-btn:hover:not(.on) { border-color:var(--br3); color:var(--br); }
</style>

<script>
var _cxAll  = [];   /* 전체 게시글 */
var _cxLim  = 8;
var _cxPg   = 1;
var _cxCat  = '';

function fmtDt(s) { return s ? String(s).slice(0,10).replace(/-/g,'.') : ''; }
function escH(s)  { if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function renderPag(el, cur, total, cb) {
  if (total <= 1) { el.innerHTML = ''; return; }
  var s = Math.max(1, cur-2), e = Math.min(total, cur+2);
  var html = '<button class="pag-btn'+(cur===1?' off':'')+'" onclick="'+cb+'('+(cur-1)+')">&#8592;</button>';
  for (var i=s; i<=e; i++) html += '<button class="pag-btn'+(i===cur?' on':'')+'\" onclick="'+cb+'('+i+')">'+i+'</button>';
  html += '<button class="pag-btn'+(cur===total?' off':'')+'" onclick="'+cb+'('+(cur+1)+')">&#8594;</button>';
  el.innerHTML = html;
}

/* ── API fetch ── */
fetch('/admin/api_front/board_public.php?table=notice')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (!data.ok || !data.posts) {
      document.getElementById('complexTbody').innerHTML =
        '<tr><td colspan="3" class="board-empty">등록된 내용이 없습니다.</td></tr>';
      return;
    }
    _cxAll = data.posts;

    /* 분류 버튼 동적 생성 */
    var cats = [];
    _cxAll.forEach(function(p) {
      var cat = (p.extra && p.extra['분류']) ? p.extra['분류'] : '';
      if (cat && cats.indexOf(cat) === -1) cats.push(cat);
    });
    var catsEl = document.getElementById('cxCats');
    if (cats.length) {
      var html = '<button class="cx-cat-btn on" onclick="cxFilter(this,\'\')">전체</button>';
      cats.forEach(function(c) {
        html += '<button class="cx-cat-btn" onclick="cxFilter(this,\''+escH(c)+'\')">'+escH(c)+'</button>';
      });
      catsEl.innerHTML = html;
    }

    cxLoad(1);
  })
  .catch(function() {
    document.getElementById('complexTbody').innerHTML =
      '<tr><td colspan="3" class="board-empty">데이터를 불러올 수 없습니다.</td></tr>';
  });

/* ── 분류 필터 ── */
function cxFilter(btn, cat) {
  document.querySelectorAll('#cxCats .cx-cat-btn').forEach(function(b) { b.classList.toggle('on', b===btn); });
  _cxCat = cat;
  cxLoad(1);
}

/* ── 목록 렌더링 ── */
function cxLoad(page) {
  _cxPg = page;
  var tb  = document.getElementById('complexTbody');
  var pag = document.getElementById('complexPag');

  var src = _cxCat
    ? _cxAll.filter(function(p) { return ((p.extra && p.extra['분류']) || '') === _cxCat; })
    : _cxAll;

  var total = Math.ceil(src.length / _cxLim);
  var items = src.slice((page-1)*_cxLim, page*_cxLim);

  if (!items.length) {
    tb.innerHTML = '<tr><td colspan="3" class="board-empty">등록된 내용이 없습니다.</td></tr>';
    pag.innerHTML = '';
    return;
  }

  tb.innerHTML = items.map(function(p, i) {
    var num    = src.length - (page-1)*_cxLim - i;
    var cat    = (p.extra && p.extra['분류']) ? p.extra['분류'] : '';
    var badge  = cat ? '<span class="cat-badge">'+escH(cat)+'</span> ' : '';
    return '<tr onclick="bdOpen('+p.id+')">' +
      '<td class="cn">'+num+'</td>' +
      '<td><span class="board-link">'+badge+escH(p.title)+'</span></td>' +
      '<td class="date">'+escH(p.date)+'</td>' +
    '</tr>';
  }).join('');

  renderPag(pag, page, total, 'cxLoad');
}

/* ── 모달 ── */
function bdOpen(id) {
  var item = _cxAll.find(function(p) { return p.id === id; });
  if (!item) return;
  var cat = (item.extra && item.extra['분류']) ? item.extra['분류'] : '';
  document.getElementById('bdModalTtl').textContent  = item.title;
  document.getElementById('bdModalMeta').textContent = escH(item.date) + (cat ? '  ·  ' + cat : '');
  document.getElementById('bdModalBody').innerHTML   = escH(item.content).replace(/\n/g,'<br>');
  document.getElementById('bdModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function bdClose() {
  document.getElementById('bdModal').classList.remove('open');
  document.body.style.overflow = '';
}
</script>