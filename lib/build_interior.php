
<section class="sec sec-beige" id="sec-interior">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">Interior</span></div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-dark">인테리어</h2>
        <div class="cx-cats" id="intCats"></div>
      </div>
    </div>
    <div class="int-grid" id="intGrid"></div>
    <div class="pag" id="intPag"></div>
  </div>
</section>

<script>
var _mockInterior = [
  { id:'i1',  cat:'거실',    title:'거실 — Living Room',     created_at:'2025-03-01', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'넓고 개방감 있는 거실 공간입니다.' },
  { id:'i2',  cat:'주방',    title:'주방 — Kitchen',         created_at:'2025-03-01', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'현대적인 시스템 키친이 적용되었습니다.' },
  { id:'i3',  cat:'침실',    title:'안방 — Master Bedroom',  created_at:'2025-03-01', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'여유로운 안방 공간입니다.' },
  { id:'i4',  cat:'욕실',    title:'욕실 — Bathroom',        created_at:'2025-02-20', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'고급 욕실 자재가 사용되었습니다.' },
  { id:'i5',  cat:'침실',    title:'자녀방 — Kids Room',     created_at:'2025-02-20', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'밝고 아늑한 자녀방입니다.' },
  { id:'i6',  cat:'발코니',  title:'발코니 — Balcony',       created_at:'2025-02-15', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'확장형 발코니 옵션이 제공됩니다.' },
  { id:'i7',  cat:'거실',    title:'서재 — Study Room',      created_at:'2025-02-10', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'독립된 서재 공간입니다.' },
  { id:'i8',  cat:'현관',    title:'현관 — Entrance',        created_at:'2025-02-05', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'깔끔한 현관 마감입니다.' },
  { id:'i9',  cat:'침실',    title:'드레스룸 — Dressroom',   created_at:'2025-01-30', imgs:['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'], content:'넉넉한 드레스룸이 제공됩니다.' }
];

var _intLim = 6, _intPg = 1, _intCat = '';

function fmtDtInt(s) { return s ? String(s).slice(0,10).replace(/-/g,'.') : ''; }
function escI(s) { if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

(function buildIntCats() {
  var cats = [];
  _mockInterior.forEach(function(n){ if(n.cat && cats.indexOf(n.cat)===-1) cats.push(n.cat); });
  var el = document.getElementById('intCats');
  var html = '<button class="cx-cat-btn on" onclick="intFilter(this,\'\')">전체</button>';
  cats.forEach(function(c){ html += '<button class="cx-cat-btn" onclick="intFilter(this,\''+escI(c)+'\')">'+escI(c)+'</button>'; });
  el.innerHTML = html;
})();

function intFilter(btn, cat) {
  document.querySelectorAll('#intCats .cx-cat-btn').forEach(function(b){ b.classList.toggle('on', b===btn); });
  _intCat = cat; intLoad(1);
}


function renderPag(el, cur, total, cb) {
  if (total <= 1) { el.innerHTML = ''; return; }
  var s = Math.max(1, cur-2), e = Math.min(total, cur+2);
  var html = '<button class="pag-btn'+(cur===1?' off':'')+' " onclick="'+cb+'('+(cur-1)+')">&#8592;</button>';
  for (var i=s; i<=e; i++) html += '<button class="pag-btn'+(i===cur?' on':'')+' " onclick="'+cb+'('+i+')">'+i+'</button>';
  html += '<button class="pag-btn'+(cur===total?' off':'')+' " onclick="'+cb+'('+(cur+1)+')">&#8594;</button>';
  el.innerHTML = html;
}

function intLoad(page) {
  _intPg = page;
  var grid = document.getElementById('intGrid');
  var pag  = document.getElementById('intPag');
  var src  = _intCat ? _mockInterior.filter(function(n){ return n.cat===_intCat; }) : _mockInterior;
  var total = Math.ceil(src.length / _intLim);
  var items = src.slice((page-1)*_intLim, page*_intLim);
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:60px;text-align:center;color:var(--g4);font-size:.88rem;">등록된 항목이 없습니다.</div>';
    pag.innerHTML = ''; return;
  }
  items.forEach(function(item) {
    var div = document.createElement('div'); div.className = 'int-card';
    var thumb = item.imgs && item.imgs[0] ? item.imgs[0] : '';
    div.onclick = function(){ glOpen(item.id, item.title, item.imgs, item.content||'', false,'','','',''); };
    div.innerHTML =
      '<div class="int-img">' +
        (thumb ? '<img src="'+escI(thumb)+'" alt="'+escI(item.title)+'" loading="lazy">' : '<div class="int-img-ph">'+escI(item.title)+'</div>') +
        '<div class="int-ov"><div class="int-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div></div>' +
      '</div>' +
      '<div class="int-info"><div class="ttl">'+escI(item.title)+'</div><div class="dt">'+fmtDtInt(item.created_at)+'</div></div>';
    grid.appendChild(div);
  });
  renderPag(pag, page, total, 'intLoad');
}

intLoad(1);
</script>
