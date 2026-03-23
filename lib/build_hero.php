<section id="sec-build">
  <div class="build-slides" id="buildSlides">

    <div class="build-sl on">
      <div class="build-bg" style="background-image:url('https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg')"></div>
      <div class="build-ov" style="background:rgba(20,11,4,.52)"></div>
      <div class="build-cnt">
        <div class="build-badge">
          <span class="build-badge-bar"></span>
          <span class="build-badge-txt">Premium Living</span>
        </div>
        <h1 class="build-ttl">건설을 넘어<strong>더 나은 문화 공간을</strong></h1>
        <p class="build-desc">
          단순한 주거공간을 넘어 새로운 라이프스타일을 창조하는<br>
          라이프스타일 리더로 거듭나고자 합니다.
        </p>
        <div class="build-acts">
          <button class="build-btn build-btn-fill" onclick="navTo('sec-interest')">관심고객 등록</button>
          <button class="build-btn build-btn-out"  onclick="navTo('sec-inquiry')">문의하기</button>
        </div>
      </div>
    </div>

    <div class="build-sl">
      <div class="build-bg" style="background-image:url('https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg')"></div>
      <div class="build-ov" style="background:rgba(20,11,4,.48)"></div>
      <div class="build-cnt">
        <div class="build-badge">
          <span class="build-badge-bar"></span>
          <span class="build-badge-txt">Premium Living</span>
        </div>
        <h1 class="build-ttl">새로운 시작<strong>프리미엄 라이프스타일</strong></h1>
        <p class="build-desc">
          탁월한 입지와 풍부한 인프라로<br>
          내일의 가치를 오늘 만나보세요.
        </p>
        <div class="build-acts">
          <button class="build-btn build-btn-fill" onclick="navTo('sec-property')">매물정보 보기</button>
          <button class="build-btn build-btn-out"  onclick="navTo('sec-interest')">관심고객 등록</button>
        </div>
      </div>
    </div>

    <div class="build-sl">
      <div class="build-bg" style="background-image:url('https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg')"></div>
      <div class="build-ov" style="background:rgba(20,11,4,.5)"></div>
      <div class="build-cnt">
        <div class="build-badge">
          <span class="build-badge-bar"></span>
          <span class="build-badge-txt">Premium Living</span>
        </div>
        <h1 class="build-ttl">품격 있는 공간<strong>차별화된 커뮤니티</strong></h1>
        <p class="build-desc">
          피트니스, 독서실, 게스트룸 등<br>
          일상의 질을 높이는 커뮤니티 시설.
        </p>
        <div class="build-acts">
          <button class="build-btn build-btn-fill" onclick="navTo('sec-complex')">단지안내 보기</button>
          <button class="build-btn build-btn-out"  onclick="navTo('sec-inquiry')">문의하기</button>
        </div>
      </div>
    </div>

  </div>

  <button class="build-arrow build-arrow-prev" onclick="buildNav(-1)">&#8249;</button>
  <button class="build-arrow build-arrow-next" onclick="buildNav(1)">&#8250;</button>

  <div class="build-ctrl">
    <div class="build-dots" id="buildDots">
      <button class="build-dot on"  onclick="buildGo(0)"></button>
      <button class="build-dot"     onclick="buildGo(1)"></button>
      <button class="build-dot"     onclick="buildGo(2)"></button>
    </div>
  </div>

  <div class="build-info-panel">
    <div class="build-info-item">
      <div class="build-info-lbl">분양 문의</div>
      <div class="build-info-val">0000-0000</div>
    </div>
    <div class="build-info-item">
      <div class="build-info-lbl">홍보관</div>
      <div class="build-info-val"></div>
    </div>
    <div class="build-info-item">
      <div class="build-info-lbl">상담 시간</div>
      <div class="build-info-val">평일 09:00 — 18:00</div>
    </div>
  </div>

  <div class="build-scroll-hint">
    <span>Scroll</span>
    <div class="build-scroll-line"></div>
  </div>
</section>

<div class="quick-bar">
  <div class="container">
    <div class="quick-grid">
      <div class="quick-itm"     onclick="navTo('sec-property')"><span class="quick-lbl">매물정보</span><span class="quick-arr">&#8594;</span></div>
      <div class="quick-itm"     onclick="navTo('sec-complex')"><span class="quick-lbl">단지안내</span><span class="quick-arr">&#8594;</span></div>
      <div class="quick-itm"     onclick="navTo('sec-faq')"><span class="quick-lbl">자주하는 질문</span><span class="quick-arr">&#8594;</span></div>
      <div class="quick-itm acc" onclick="navTo('sec-interest')"><span class="quick-lbl">관심고객 등록</span><span class="quick-arr">&#8594;</span></div>
    </div>
  </div>
</div>

<style>
.build-arrow { position:absolute; top:50%; transform:translateY(-50%); z-index:10; background:rgba(0,0,0,.3); color:#fff; border:none; font-size:2.4rem; line-height:1; padding:12px 18px; cursor:pointer; transition:background .2s; }
.build-arrow:hover { background:rgba(0,0,0,.6); }
.build-arrow-prev { left:0; }
.build-arrow-next { right:0; }
@media(max-width:680px) {
  .build-arrow { font-size:1.8rem; padding:8px 12px; }
}
</style>

<script>
(function() {
  var sl  = document.querySelectorAll('.build-sl');
  var dt  = document.querySelectorAll('.build-dot');
  var cur = 0, timer = null;

  function go(n) {
    sl[cur].classList.remove('on'); if(dt[cur]) dt[cur].classList.remove('on');
    cur = (n + sl.length) % sl.length;
    sl[cur].classList.add('on'); if(dt[cur]) dt[cur].classList.add('on');
  }
  function startTimer() {
    if(timer) clearInterval(timer);
    timer = setInterval(function(){ go(cur+1); }, 5000);
  }

  window.buildGo  = function(n) { go(n); startTimer(); };
  window.buildNav = function(d) { go(cur+d); startTimer(); };

  var sx = 0, slides = document.getElementById('buildSlides');
  slides.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  slides.addEventListener('touchend',   function(e){ var dx = sx - e.changedTouches[0].clientX; if(Math.abs(dx)>50) { go(cur+(dx>0?1:-1)); startTimer(); } });

  startTimer();
})();
</script>
