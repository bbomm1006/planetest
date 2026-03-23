<style>

  #topSlider{padding:0!important;margin-top:100px;}
  .topSlider-viewport {
  position: relative;
  width: 100%;
  padding-top: 24px;
  background: #fff;
  overflow: hidden;
  }

  .topSlider-track {
  display: flex;
  gap: 16px;
  transition: transform 0.55s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
  }
  .topSlider-track.no-transition { transition: none; }

  .topSlider-slide {
  flex: 0 0 auto;
  height: 460px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 18px;
  }

  /* 이미지 슬라이드 */
  .topSlider-slide-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  transition: transform 0.55s ease;
  }
  .topSlider-slide:not(.topSlider-slide-video):hover .topSlider-slide-bg { transform: scale(1.03); }

  .topSlider-slide-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%);
  }

  .topSlider-slide-content {
  position: absolute; left: 28px; bottom: 44px; right: 28px;
  color: #fff; z-index: 3;
  }
  .topSlider-slide-label {
  display: block; font-size: 11px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.7); margin-bottom: 8px;
  }
  .topSlider-slide-title {
  font-size: clamp(24px,3vw,40px); font-weight: 900;
  line-height: 1.18; letter-spacing: -1px; margin-bottom: 8px; color: #fff;
  }
  .topSlider-slide-desc { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; }

  /* 유튜브 슬라이드 */
  .topSlider-slide-video { cursor: default; }
  .topSlider-yt-wrap { position: absolute; inset: 0; overflow: hidden; background: #000; }
  .topSlider-yt-wrap iframe {
  position: absolute; top: 50%; left: 50%;
  width: 177.78vh; height: 100%;
  min-width: 100%; min-height: 56.25vw;
  transform: translate(-50%,-50%);
  border: none; pointer-events: none;
  }
  .topSlider-yt-overlay {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 45%, transparent 100%);
  }

  /* 하단 컨트롤 */
  .topSlider-controls {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 14px 0 18px;
  }
  .topSlider-pg-arrow {
  width: 28px; height: 28px; border: none; background: none;
  color: #aaa; font-size: 22px; line-height: 1; padding: 0;
  cursor: pointer; display: grid; place-items: center;
  transition: color 0.18s;
  }
  .topSlider-pg-arrow:hover { color: #333; }
  .topSlider-pg-bar-wrap { display: flex; align-items: center; gap: 5px; }
  .topSlider-pg-bar {
  width: 28px; height: 3px; border-radius: 2px;
  background: #ddd; cursor: pointer;
  transition: background 0.25s, width 0.25s;
  }
  .topSlider-pg-bar.active { background: #1a2540; width: 44px; }
  .topSlider-pg-num {
  font-size: 12px; font-weight: 700; color: #999;
  letter-spacing: 1px; min-width: 52px; text-align: center;
  }
  .topSlider-pg-sep { color: #ccc; }

  /* 모바일 */
  @media (max-width: 768px) {
  .topSlider-viewport { padding-top: 0; }
  .topSlider-slide { height: 56vw; min-height: 240px; border-radius: 0; }
  .topSlider-track { gap: 0; }
  .topSlider-slide-title { font-size: 22px; }
  .topSlider-slide-content { left: 18px; bottom: 40px; right: 18px; }
  }
</style>

<section id="topSlider">
  <div class="topSlider-viewport">
    <div class="topSlider-track" id="topSliderTrack">

      <!-- 슬라이드 1 -->
      <div class="topSlider-slide">
        <div class="topSlider-slide-bg" style="background-image:url('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1400&q=80');"></div>
        <div class="topSlider-slide-overlay"></div>
        <div class="topSlider-slide-content">
          <span class="topSlider-slide-label">요금제 안내</span>
          <h2 class="topSlider-slide-title">통신사 요금 절반,<br>품질은 그대로</h2>
          <p class="topSlider-slide-desc">월 9,900원부터 시작하는 합리적인 요금제</p>
        </div>
      </div>

      <!-- 슬라이드 2: 유튜브 — div#topSliderYtPlayer 에 API가 플레이어를 생성 -->
      <div class="topSlider-slide topSlider-slide-video" data-type="video">
        <div class="topSlider-yt-wrap">
          <div id="topSliderYtPlayer"></div>
        </div>
        <div class="topSlider-yt-overlay"></div>
        <div class="topSlider-slide-content">
          <span class="topSlider-slide-label">✦ 핑크모바일 특별 혜택</span>
          <h2 class="topSlider-slide-title">첫 달 무료,<br>유심도 무료</h2>
          <p class="topSlider-slide-desc">지금 바로 온라인 개통 · 5분이면 완료</p>
        </div>
      </div>

      <!-- 슬라이드 3 -->
      <div class="topSlider-slide">
        <div class="topSlider-slide-bg" style="background-image:url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80');"></div>
        <div class="topSlider-slide-overlay"></div>
        <div class="topSlider-slide-content">
          <span class="topSlider-slide-label">5G 네트워크</span>
          <h2 class="topSlider-slide-title">전국 5G 완벽 지원,<br>끊김 없는 연결</h2>
          <p class="topSlider-slide-desc">LTE·5G 전국망으로 어디서나 빠르게</p>
        </div>
      </div>

      <!-- 슬라이드 4 -->
      <div class="topSlider-slide">
        <div class="topSlider-slide-bg" style="background-image:url('https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1400&q=80');"></div>
        <div class="topSlider-slide-overlay"></div>
        <div class="topSlider-slide-content">
          <span class="topSlider-slide-label">데이터 요금제</span>
          <h2 class="topSlider-slide-title">데이터 걱정 없이<br>마음껏 즐기세요</h2>
          <p class="topSlider-slide-desc">무제한 데이터 · 영상·게임·SNS 자유롭게</p>
        </div>
      </div>

      <!-- 슬라이드 5 -->
      <div class="topSlider-slide">
        <div class="topSlider-slide-bg" style="background-image:url('https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1400&q=80');"></div>
        <div class="topSlider-slide-overlay"></div>
        <div class="topSlider-slide-content">
          <span class="topSlider-slide-label">고객 서비스</span>
          <h2 class="topSlider-slide-title">35만 고객이 선택한<br>핑크모바일</h2>
          <p class="topSlider-slide-desc">고객 만족도 4.9점 · 24시간 온라인 상담</p>
        </div>
      </div>

    </div>

    <div class="topSlider-controls">
      <button class="topSlider-pg-arrow" id="topSliderPrev">&#8249;</button>
      <div class="topSlider-pg-bar-wrap" id="topSliderPgBarWrap"></div>
      <span class="topSlider-pg-num">
        <span id="topSliderCurrentNum">01</span>
        <span class="topSlider-pg-sep"> | </span>
        <span id="topSliderTotalNum">05</span>
      </span>
      <button class="topSlider-pg-arrow" id="topSliderNext">&#8250;</button>
    </div>

  </div>
</section>

<!-- YouTube IFrame API -->
<script src="https://www.youtube.com/iframe_api"></script>
<script>
  /* ── YouTube IFrame API 준비 콜백 ── */
  var ytPlayer = null;
  var ytReady  = false;

  function onYouTubeIframeAPIReady(){
    ytPlayer = new YT.Player('topSliderYtPlayer', {
      videoId: 'RuoqgEIxrgk',
      playerVars: {
        autoplay: 1,
        mute:     1,
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: function(e){
          ytReady = true;
          e.target.mute();
          e.target.playVideo();
        },
        onStateChange: function(e){
          /* 영상 종료(0) → 슬라이더에 알림 */
          if(e.data === YT.PlayerState.ENDED){
            topSlider.onVideoEnded();
          }
        }
      }
    });
  }

  /* ── 슬라이더 ── */
  var topSlider = (function(){
  var vp      = document.querySelector('.topSlider-viewport'),
      track   = document.getElementById('topSliderTrack'),
      origins = Array.from(track.querySelectorAll('.topSlider-slide')),
      total   = origins.length,
      GAP     = 16,
      SIDE    = 20,   /* 데스크탑 좌우 여백 */
      cur     = 0,
      jumping = false,
      timer,
      numEl   = document.getElementById('topSliderCurrentNum'),
      totalEl = document.getElementById('topSliderTotalNum'),
      barWrap = document.getElementById('topSliderPgBarWrap');

  /* 영상 슬라이드 인덱스 */
  var videoIdxSet = {};
  origins.forEach(function(s, i){
    if(s.dataset.type === 'video') videoIdxSet[i] = true;
  });
  function isVideoSlide(real){ return !!videoIdxSet[real]; }

  totalEl.textContent = pad(total);

  function pad(n){ return String(n).padStart(2,'0'); }
  function isMo(){ return window.innerWidth <= 768; }

  /* 데스크탑: 양쪽 SIDE 여백, 슬라이드 2개 표시
     모바일  : 풀너비, 슬라이드 1개 */
  function slideW(){
    if(isMo()) return vp.offsetWidth;
    return (vp.offsetWidth - SIDE * 2 - GAP) / 2;
  }
  function stepW(){ return slideW() + (isMo() ? 0 : GAP); }

  function applyW(){
    var w = slideW();
    track.querySelectorAll('.topSlider-slide').forEach(function(s){ s.style.width = w + 'px'; });
  }

  /* 클론: 앞뒤에 v개씩 붙여 무한루프 */
  function buildClones(){
    track.querySelectorAll('.topSlider-slide.clone').forEach(function(c){ c.remove(); });
    var v = isMo() ? 1 : 2;
    /* 뒤 클론 */
    for(var i = 0; i < v; i++){
      var cl = origins[i % total].cloneNode(true);
      cl.classList.add('clone');
      /* 클론 안의 YT div는 빈 div로 교체 (중복 플레이어 방지) */
      var ytDiv = cl.querySelector('#topSliderYtPlayer');
      if(ytDiv){ ytDiv.removeAttribute('id'); ytDiv.innerHTML = ''; }
      track.appendChild(cl);
    }
    /* 앞 클론 */
    for(var j = v - 1; j >= 0; j--){
      var cl2 = origins[(total - v + j) % total].cloneNode(true);
      cl2.classList.add('clone');
      var ytDiv2 = cl2.querySelector('#topSliderYtPlayer');
      if(ytDiv2){ ytDiv2.removeAttribute('id'); ytDiv2.innerHTML = ''; }
      track.insertBefore(cl2, track.firstChild);
    }
  }

  /* 앞 클론 수 × stepW */
  function cloneOff(){ return (isMo() ? 1 : 2) * stepW(); }

  /* translateX 계산:
     cur=0, 데스크탑 → 첫 슬라이드 왼쪽이 SIDE px 에서 시작
     공식: -(cloneOff + cur×stepW) + SIDE */
  function setPos(anim){
    if(total <= 1) return;
    if(!anim) track.classList.add('no-transition');
    var x = -(cloneOff() + cur * stepW()) + (isMo() ? 0 : SIDE);
    track.style.transform = 'translateX(' + x + 'px)';
    if(!anim){ track.offsetHeight; track.classList.remove('no-transition'); }
    var real = ((cur % total) + total) % total;
    numEl.textContent = pad(real + 1);
    updateBars(real);
    /* 영상 슬라이드 진입 시 일반 타이머 중단 + 재생 재시작 */
    if(isVideoSlide(real)){
      clearInterval(timer);
      /* YT 플레이어가 준비됐으면 처음부터 다시 재생 */
      if(ytReady && ytPlayer && typeof ytPlayer.seekTo === 'function'){
        ytPlayer.seekTo(0);
        ytPlayer.playVideo();
      }
    }
  }

  function buildBars(){
    barWrap.innerHTML = '';
    for(var i = 0; i < total; i++){
      var b = document.createElement('div');
      b.className = 'topSlider-pg-bar' + (i === 0 ? ' active' : '');
      (function(idx){
        b.addEventListener('click', function(){ goTo(idx); startAuto(); });
      })(i);
      barWrap.appendChild(b);
    }
  }
  function updateBars(real){
    barWrap.querySelectorAll('.topSlider-pg-bar').forEach(function(b, i){
      b.classList.toggle('active', i === real);
    });
  }

  function goTo(idx){ cur = idx; setPos(true); }

  /* transitionend: 경계 넘으면 순간 점프 */
  track.addEventListener('transitionend', function(e){
    if(e.target !== track || jumping) return;
    if(cur < 0 || cur >= total){
      jumping = true;
      cur = cur < 0 ? total - 1 : 0;
      setPos(false);
      setTimeout(function(){ jumping = false; }, 50);
    }
  });

  function startAuto(){
    clearInterval(timer);
    timer = setInterval(function(){ goTo(cur + 1); }, 5000);
  }

  /* 영상 종료 콜백 (onYouTubeIframeAPIReady 에서 호출) */
  function onVideoEnded(){
    var real = ((cur % total) + total) % total;
    if(isVideoSlide(real)){
      goTo(cur + 1);
      startAuto();
    }
  }

  /* 하단 prev/next */
  document.getElementById('topSliderPrev').addEventListener('click', function(){ goTo(cur - 1); startAuto(); });
  document.getElementById('topSliderNext').addEventListener('click', function(){ goTo(cur + 1); startAuto(); });

  /* 터치 스와이프 */
  var tx = 0;
  track.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend',   function(e){
    var d = tx - e.changedTouches[0].clientX;
    if(Math.abs(d) > 50){ goTo(cur + (d > 0 ? 1 : -1)); startAuto(); }
  }, {passive:true});

  /* 리사이즈 */
  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ buildClones(); applyW(); setPos(false); }, 100);
  });

  /* 초기화 */
  if(total <= 1){
    if(origins[0]) origins[0].style.width = vp.offsetWidth + 'px';
    document.querySelector('.topSlider-controls').style.display = 'none';
  } else {
    buildBars();
    buildClones();
    applyW();
    setPos(false);
    startAuto();
  }

  return { onVideoEnded: onVideoEnded };
})();
</script>