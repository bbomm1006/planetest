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
          <th class="cd">등록일</th>
        </tr>
      </thead>
      <tbody id="complexTbody"></tbody>
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
var _mockNotices = [
  { id:'1',  is_pinned:true,  cat_name:'공지', title:'분양 홍보관 오픈 안내',        created_at:'2025-03-10', content:'홍보관이 오픈되었습니다.\n방문 전 사전 예약을 권장합니다.' },
  { id:'2',  is_pinned:false, cat_name:'공지', title:'1차 분양 일정 안내',           created_at:'2025-03-08', content:'1차 분양 일정이 확정되었습니다.\n자세한 내용은 아래를 참고해주세요.' },
  { id:'3',  is_pinned:false, cat_name:'안내', title:'견본주택 관람 시간 변경 안내', created_at:'2025-03-05', content:'견본주택 관람 시간이 변경되었습니다.\n평일 09:00 ~ 18:00 / 주말 10:00 ~ 17:00' },
  { id:'4',  is_pinned:false, cat_name:'',     title:'입주 예정일 안내',              created_at:'2025-02-20', content:'입주 예정일 안내입니다.' },
  { id:'5',  is_pinned:false, cat_name:'',     title:'주차장 이용 안내',              created_at:'2025-02-15', content:'주차장 이용 방법 안내입니다.' },
  { id:'6',  is_pinned:false, cat_name:'안내', title:'커뮤니티 시설 소개',            created_at:'2025-02-10', content:'커뮤니티 시설을 소개합니다.' },
  { id:'7',  is_pinned:false, cat_name:'',     title:'조경 계획 안내',                created_at:'2025-02-01', content:'조경 계획 안내입니다.' },
  { id:'8',  is_pinned:false, cat_name:'공지', title:'계약금 납부 안내',              created_at:'2025-01-25', content:'계약금 납부 안내입니다.' },
  { id:'9',  is_pinned:false, cat_name:'',     title:'발코니 확장 옵션 안내',         created_at:'2025-01-20', content:'발코니 확장 옵션 안내입니다.' },
  { id:'10', is_pinned:false, cat_name:'안내', title:'하자보수 접수 방법',            created_at:'2025-01-10', content:'하자보수 접수 방법 안내입니다.' }
];

var _cxLim = 8, _cxPg = 1, _cxCat = '';

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

(function buildCats() {
  var cats = [];
  _mockNotices.forEach(function(n){ if(n.cat_name && cats.indexOf(n.cat_name)===-1) cats.push(n.cat_name); });
  var el = document.getElementById('cxCats');
  var html = '<button class="cx-cat-btn on" onclick="cxFilter(this,\'\')">전체</button>';
  cats.forEach(function(c){ html += '<button class="cx-cat-btn" onclick="cxFilter(this,\''+escH(c)+'\')">'+escH(c)+'</button>'; });
  el.innerHTML = html;
})();

function cxFilter(btn, cat) {
  document.querySelectorAll('.cx-cat-btn').forEach(function(b){ b.classList.toggle('on', b===btn); });
  _cxCat = cat; cxLoad(1);
}

function cxLoad(page) {
  _cxPg = page;
  var tb  = document.getElementById('complexTbody');
  var pag = document.getElementById('complexPag');
  var src = _cxCat ? _mockNotices.filter(function(n){ return n.cat_name === _cxCat; }) : _mockNotices;
  var total = Math.ceil(src.length / _cxLim);
  var items = src.slice((page-1)*_cxLim, page*_cxLim);
  if (!items.length) {
    tb.innerHTML = '<tr><td colspan="3" class="board-empty">등록된 내용이 없습니다.</td></tr>';
    pag.innerHTML = ''; return;
  }
  tb.innerHTML = items.map(function(n, i) {
    var num = src.length - (page-1)*_cxLim - i;
    var badge = n.is_pinned ? '<span class="pin-badge">NOTICE</span>' : (n.cat_name ? '<span class="cat-badge">'+escH(n.cat_name)+'</span>' : '');
    return '<tr onclick="bdOpen(\''+n.id+'\')">' +
      '<td class="cn">' + (n.is_pinned ? '<span class="pin-badge">NOTICE</span>' : num) + '</td>' +
      '<td><span class="board-link">'+(badge && !n.is_pinned ? badge+' ' : '')+escH(n.title)+'</span></td>' +
      '<td class="cd">'+fmtDt(n.created_at)+'</td></tr>';
  }).join('');
  renderPag(pag, page, total, 'cxLoad');
}

function bdOpen(id) {
  var item = _mockNotices.find(function(n){ return n.id===id; });
  if (!item) return;
  document.getElementById('bdModalTtl').textContent  = item.title;
  document.getElementById('bdModalMeta').textContent = fmtDt(item.created_at)+(item.cat_name?'  ·  '+item.cat_name:'');
  document.getElementById('bdModalBody').innerHTML   = escH(item.content).replace(/\n/g,'<br>');
  document.getElementById('bdModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function bdClose() {
  document.getElementById('bdModal').classList.remove('open');
  document.body.style.overflow = '';
}

cxLoad(1);
</script>
