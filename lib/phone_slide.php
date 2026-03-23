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

      <!-- 배너 데이터는 JS에서 API로 동적 렌더링 -->

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
(function(){

  /* ── YouTube 플레이어 상태 ── */
  var ytPlayer   = null;
  var ytReady    = false;
  var ytVideoIdx = -1;   /* 비디오 슬라이드가 몇 번째 인덱스인지 */

  /* ── 유튜브 URL → videoId 추출 ── */
  function extractYtId(url){
    if(!url) return '';
    var m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_\-]{11})/);
    return m ? m[1] : url;
  }

  /* ── 슬라이드 HTML 빌더 ── */
  function buildSlideHTML(b, idx){
    var isVideo = (b.bgType === 'video');
    var overlay = b.overlayEnabled !== false
      ? '<div class="topSlider-slide-' + (isVideo ? 'yt-overlay' : 'overlay') + '"></div>'
      : '';

    var content = '';
    if(b.subtitle || b.title || b.desc){
      var label = b.subtitle ? '<span class="topSlider-slide-label">' + b.subtitle + '</span>' : '';
      var title = b.title    ? '<h2 class="topSlider-slide-title">' + b.title + '</h2>'         : '';
      var desc  = b.desc     ? '<p class="topSlider-slide-desc">'  + b.desc  + '</p>'           : '';
      content = '<div class="topSlider-slide-content">' + label + title + desc + '</div>';
    }

    if(isVideo){
      var vidId = extractYtId(b.bgSrc);
      return '<div class="topSlider-slide topSlider-slide-video" data-type="video" data-ytid="' + vidId + '">'
           + '<div class="topSlider-yt-wrap"><div id="topSliderYtPlayer"></div></div>'
           + overlay + content + '</div>';
    } else {
      var bgImg = b.bgSrc || '';
      var link  = (b.btn1Enabled && b.btn1Link) ? b.btn1Link : '';
      var tag   = link ? 'a' : 'div';
      var href  = link ? ' href="' + link + '"' : '';
      return '<' + tag + href + ' class="topSlider-slide">'
           + '<div class="topSlider-slide-bg" style="background-image:url(\'' + bgImg + '\');"></div>'
           + overlay + content
           + '</' + tag + '>';
    }
  }

  /* ── 슬라이더 초기화 (배너 데이터 받은 뒤 호출) ── */
  function initSlider(banners, intervalMs){
    var track   = document.getElementById('topSliderTrack');
    var numEl   = document.getElementById('topSliderCurrentNum');
    var totalEl = document.getElementById('topSliderTotalNum');
    var barWrap = document.getElementById('topSliderPgBarWrap');
    var vp      = document.querySelector('.topSlider-viewport');

    /* 슬라이드 DOM 생성 */
    track.innerHTML = banners.map(buildSlideHTML).join('');

    var origins = Array.from(track.querySelectorAll('.topSlider-slide'));
    var total   = origins.length;
    var GAP     = 16, SIDE = 20;
    var cur     = 0, jumping = false, timer;

    /* 비디오 슬라이드 인덱스 수집 */
    var videoIdxSet = {};
    origins.forEach(function(s, i){
      if(s.dataset.type === 'video') videoIdxSet[i] = true;
    });
    function isVideoSlide(real){ return !!videoIdxSet[real]; }

    totalEl.textContent = pad(total);
    function pad(n){ return String(n).padStart(2,'0'); }
    function isMo(){ return window.innerWidth <= 768; }
    function slideW(){
      if(isMo()) return vp.offsetWidth;
      return (vp.offsetWidth - SIDE * 2 - GAP) / 2;
    }
    function stepW(){ return slideW() + (isMo() ? 0 : GAP); }

    function applyW(){
      var w = slideW();
      track.querySelectorAll('.topSlider-slide').forEach(function(s){ s.style.width = w + 'px'; });
    }

    function buildClones(){
      track.querySelectorAll('.topSlider-slide.clone').forEach(function(c){ c.remove(); });
      var v = isMo() ? 1 : 2;
      for(var i = 0; i < v; i++){
        var cl = origins[i % total].cloneNode(true);
        cl.classList.add('clone');
        var ytDiv = cl.querySelector('#topSliderYtPlayer');
        if(ytDiv){ ytDiv.removeAttribute('id'); ytDiv.innerHTML = ''; }
        track.appendChild(cl);
      }
      for(var j = v - 1; j >= 0; j--){
        var cl2 = origins[(total - v + j) % total].cloneNode(true);
        cl2.classList.add('clone');
        var ytDiv2 = cl2.querySelector('#topSliderYtPlayer');
        if(ytDiv2){ ytDiv2.removeAttribute('id'); ytDiv2.innerHTML = ''; }
        track.insertBefore(cl2, track.firstChild);
      }
    }

    function cloneOff(){ return (isMo() ? 1 : 2) * stepW(); }

    function setPos(anim){
      if(total <= 1) return;
      if(!anim) track.classList.add('no-transition');
      var x = -(cloneOff() + cur * stepW()) + (isMo() ? 0 : SIDE);
      track.style.transform = 'translateX(' + x + 'px)';
      if(!anim){ track.offsetHeight; track.classList.remove('no-transition'); }
      var real = ((cur % total) + total) % total;
      numEl.textContent = pad(real + 1);
      updateBars(real);
      if(isVideoSlide(real)){
        clearInterval(timer);
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
        (function(idx){ b.addEventListener('click', function(){ goTo(idx); startAuto(); }); })(i);
        barWrap.appendChild(b);
      }
    }
    function updateBars(real){
      barWrap.querySelectorAll('.topSlider-pg-bar').forEach(function(b, i){
        b.classList.toggle('active', i === real);
      });
    }

    function goTo(idx){ cur = idx; setPos(true); }

    track.addEventListener('transitionend', function(e){
      if(e.target !== track || jumping) return;
      if(cur < 0 || cur >= total){
        jumping = true;
        cur = cur < 0 ? total - 1 : 0;
        setPos(false);
        setTimeout(function(){ jumping = false; }, 50);
      }
    });

    var autoInterval = intervalMs > 0 ? intervalMs : 5000;
    function startAuto(){
      clearInterval(timer);
      var real = ((cur % total) + total) % total;
      if(!isVideoSlide(real)){
        timer = setInterval(function(){ goTo(cur + 1); }, autoInterval);
      }
    }

    /* 영상 종료 → 다음 슬라이드 */
    window._topSliderOnVideoEnded = function(){
      var real = ((cur % total) + total) % total;
      if(isVideoSlide(real)){ goTo(cur + 1); startAuto(); }
    };

    document.getElementById('topSliderPrev').addEventListener('click', function(){ goTo(cur - 1); startAuto(); });
    document.getElementById('topSliderNext').addEventListener('click', function(){ goTo(cur + 1); startAuto(); });

    var tx = 0;
    track.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend',   function(e){
      var d = tx - e.changedTouches[0].clientX;
      if(Math.abs(d) > 50){ goTo(cur + (d > 0 ? 1 : -1)); startAuto(); }
    }, {passive:true});

    var rt;
    window.addEventListener('resize', function(){
      clearTimeout(rt);
      rt = setTimeout(function(){ buildClones(); applyW(); setPos(false); }, 100);
    });

    /* YT 플레이어 생성 (비디오 슬라이드가 있을 때만) */
    var videoSlide = track.querySelector('.topSlider-slide-video[data-ytid]');
    if(videoSlide){
      var vidId = videoSlide.dataset.ytid;
      window._topSliderInitYT = function(){
        ytPlayer = new YT.Player('topSliderYtPlayer', {
          videoId: vidId,
          playerVars: { autoplay:1, mute:1, controls:0, modestbranding:1, playsinline:1, rel:0 },
          events: {
            onReady: function(e){ ytReady = true; e.target.mute(); e.target.playVideo(); },
            onStateChange: function(e){
              if(e.data === YT.PlayerState.ENDED && window._topSliderOnVideoEnded){
                window._topSliderOnVideoEnded();
              }
            }
          }
        });
      };
      /* YT API가 이미 로드됐으면 바로 실행 */
      if(window.YT && window.YT.Player){ window._topSliderInitYT(); }
    }

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
  }

  /* ── YouTube IFrame API 준비 콜백 ── */
  window.onYouTubeIframeAPIReady = function(){
    if(typeof window._topSliderInitYT === 'function') window._topSliderInitYT();
  };

  /* ── API 호출 → 슬라이더 초기화 ── */
  /* index.php 의 Promise.all 에서 이미 fetch 했을 수도 있으므로
     window._pbData 에 banners 가 있으면 재사용, 없으면 직접 fetch */
  function run(){
    var cached = window._pbData;
    if(cached && Array.isArray(cached.banners) && cached.banners.length){
      var interval = (cached.bannerConfig && cached.bannerConfig.interval) || 5000;
      initSlider(cached.banners, interval);
    } else {
      fetch('/admin/api_front/banner_public.php')
        .then(function(r){ return r.json(); })
        .then(function(data){
          var banners  = data.banners  || [];
          var interval = (data.bannerConfig && data.bannerConfig.interval) || 5000;
          if(banners.length) initSlider(banners, interval);
        })
        .catch(function(){});
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
</script>