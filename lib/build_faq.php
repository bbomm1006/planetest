<section class="sec sec-dark" id="sec-buildFaq">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">FAQ</span></div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-light">자주하는 <span style="color:var(--gold)">질문</span></h2>
        <div class="cx-cats" id="buildFaqCats"></div>
      </div>
    </div>
    <div class="buildFaq-wrap">
      <div class="buildFaq-list" id="buildFaqList"><div class="buildFaq-empty">불러오는 중...</div></div>
    </div>
  </div>
</section>

<style>
#sec-buildFaq .cx-cats .cx-cat-btn { color:rgba(255,255,255,.5); border-color:rgba(255,255,255,.15); background:none; }
#sec-buildFaq .cx-cats .cx-cat-btn.on { background:var(--gold); color:var(--bk); border-color:var(--gold); }
#sec-buildFaq .cx-cats .cx-cat-btn:hover:not(.on) { border-color:var(--gold); color:var(--gold); }
.buildFaq-empty { text-align:center; padding:40px 20px; color:rgba(255,255,255,.5); }
</style>

<script>
(function() {
  var data = [];

  function escF(s) { if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function groupByCategory(posts) {
    var groups = {};
    var order = [];
    posts.forEach(function(p) {
      var cat = (p.extra && p.extra['분류']) ? p.extra['분류'] : '기타';
      if (!groups[cat]) {
        groups[cat] = [];
        order.push(cat);
      }
      groups[cat].push({ q: p.title, a: p.content });
    });
    return order.map(function(cat) {
      return { cat: cat, items: groups[cat] };
    });
  }

  function renderCats() {
    var catEl = document.getElementById('buildFaqCats');
    var html = '<button class="cx-cat-btn on" onclick="buildFaqFilter(this,\'\')">전체</button>';
    data.forEach(function(g){ html += '<button class="cx-cat-btn" onclick="buildFaqFilter(this,\''+escF(g.cat)+'\')">'+escF(g.cat)+'</button>'; });
    catEl.innerHTML = html;
  }

  function renderFaq(filter) {
    var list = document.getElementById('buildFaqList');
    var src = filter ? data.filter(function(g){ return g.cat===filter; }) : data;
    if (!src.length) {
      list.innerHTML = '<div class="buildFaq-empty">등록된 FAQ가 없습니다.</div>';
      return;
    }
    list.innerHTML = src.map(function(grp) {
      return '<div class="buildFaq-grp">' +
        '<div class="buildFaq-grp-lbl">'+escF(grp.cat)+'</div>' +
        grp.items.map(function(f){
          return '<div class="buildFaq-itm">' +
            '<button class="buildFaq-q" onclick="buildFaqToggle(this)">' +
              '<span class="buildFaq-qmark">Q</span>' +
              '<span class="buildFaq-qt">'+escF(f.q)+'</span>' +
              '<span class="buildFaq-qa">&#8964;</span>' +
            '</button>' +
            '<div class="buildFaq-a"><span class="buildFaq-amark">A</span><span class="buildFaq-at">'+f.a+'</span></div>' +
          '</div>';
        }).join('') +
      '</div>';
    }).join('');
  }

  window.buildFaqFilter = function(btn, cat) {
    document.querySelectorAll('#buildFaqCats .cx-cat-btn').forEach(function(b){ b.classList.toggle('on', b===btn); });
    renderFaq(cat);
  };

  window._buildFaqData = data;

  fetch('/admin/api_front/board_public.php?table=faq')
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (json.ok && json.posts && json.posts.length) {
        data = groupByCategory(json.posts);
        window._buildFaqData = data;
        renderCats();
        renderFaq('');
      } else {
        document.getElementById('buildFaqList').innerHTML = '<div class="buildFaq-empty">등록된 FAQ가 없습니다.</div>';
      }
    })
    .catch(function() {
      document.getElementById('buildFaqList').innerHTML = '<div class="buildFaq-empty">FAQ를 불러오는 데 실패했습니다.</div>';
    });
})();

function buildFaqToggle(btn) { btn.closest('.buildFaq-itm').classList.toggle('open'); }
</script>