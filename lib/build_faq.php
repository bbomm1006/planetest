<section class="sec sec-dark" id="sec-faq">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">FAQ</span></div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-light">자주하는 <span style="color:var(--gold)">질문</span></h2>
        <div class="cx-cats" id="faqCats"></div>
      </div>
    </div>
    <div class="faq-wrap">
      <div class="faq-list" id="faqList"></div>
    </div>
  </div>
</section>

<style>
.cx-cats .cx-cat-btn { color:rgba(255,255,255,.5); border-color:rgba(255,255,255,.15); background:none; }
.cx-cats .cx-cat-btn.on { background:var(--gold); color:var(--bk); border-color:var(--gold); }
.cx-cats .cx-cat-btn:hover:not(.on) { border-color:var(--gold); color:var(--gold); }
</style>

<script>
(function() {
  var data = [
    { cat:'분양 일정', items:[
      { q:'분양 신청은 어떻게 하나요?',       a:'홍보관 방문 또는 유선 상담 후 청약 일정에 맞춰 신청 가능합니다. 자세한 내용은 문의 게시판을 이용해주세요.' },
      { q:'계약금은 얼마인가요?',             a:'분양가의 10%이며, 계약 당일 납부하시면 됩니다. 정확한 금액은 상담을 통해 안내드립니다.' },
      { q:'입주 예정일은 언제인가요?',         a:'2027년 하반기 입주 예정입니다. 공사 진행에 따라 변경될 수 있습니다.' }
    ]},
    { cat:'입지 & 시설', items:[
      { q:'주변 교통 환경은 어떻게 되나요?',   a:'인근 지하철역과 주요 간선도로를 이용할 수 있어 교통이 편리합니다.' },
      { q:'주차 공간은 충분한가요?',           a:'세대당 1.3대 이상의 주차 공간이 확보되어 있습니다.' },
      { q:'커뮤니티 시설은 어떤 것이 있나요?', a:'피트니스센터, 독서실, 게스트룸, 어린이놀이터 등 다양한 커뮤니티 시설이 제공됩니다.' }
    ]},
    { cat:'계약 & 옵션', items:[
      { q:'발코니 확장이 가능한가요?',         a:'네, 발코니 확장 옵션이 제공됩니다. 계약 시 선택 가능합니다.' },
      { q:'중도금 대출이 가능한가요?',         a:'중도금 집단대출이 가능하며, 자세한 내용은 상담을 통해 안내드립니다.' }
    ]}
  ];

  function escF(s) { if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var catEl = document.getElementById('faqCats');
  var html = '<button class="cx-cat-btn on" onclick="faqFilter(this,\'\')">전체</button>';
  data.forEach(function(g){ html += '<button class="cx-cat-btn" onclick="faqFilter(this,\''+escF(g.cat)+'\')">'+escF(g.cat)+'</button>'; });
  catEl.innerHTML = html;

  window._faqData = data;

  function renderFaq(filter) {
    var list = document.getElementById('faqList');
    var src = filter ? data.filter(function(g){ return g.cat===filter; }) : data;
    list.innerHTML = src.map(function(grp) {
      return '<div class="faq-grp">' +
        '<div class="faq-grp-lbl">'+escF(grp.cat)+'</div>' +
        grp.items.map(function(f){
          return '<div class="faq-itm">' +
            '<button class="faq-q" onclick="faqToggle(this)">' +
              '<span class="faq-qmark">Q</span>' +
              '<span class="faq-qt">'+escF(f.q)+'</span>' +
              '<span class="faq-qa">&#8964;</span>' +
            '</button>' +
            '<div class="faq-a"><span class="faq-amark">A</span><span class="faq-at">'+escF(f.a)+'</span></div>' +
          '</div>';
        }).join('') +
      '</div>';
    }).join('');
  }

  window.faqFilter = function(btn, cat) {
    document.querySelectorAll('#faqCats .cx-cat-btn').forEach(function(b){ b.classList.toggle('on', b===btn); });
    renderFaq(cat);
  };

  renderFaq('');
})();

function faqToggle(btn) { btn.closest('.faq-itm').classList.toggle('open'); }
</script>
