<?php
/* ── 홈페이지 정보 조회 ── */
$buildSite = [];
try {
    $buildSite = $pdo->query(
        "SELECT phone, hours1 FROM homepage_info WHERE id=1 LIMIT 1"
    )->fetch(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {}
?>

<style>
  #sec-build { position: relative; width: 100%; height: calc(100vh - var(--sw)); min-height: 560px; max-height: 900px; overflow: hidden; }

  /* hero.js 슬라이드 구조 그대로 활용 */
  #sec-build #hSlides { position: absolute; inset: 0; }
  #sec-build .h-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s ease; z-index: 0; }
  #sec-build .h-slide.active { opacity: 1; z-index: 1; }

  /* slide-mode */
  #sec-build.slide-mode .h-slide { transform: translateX(100%); opacity: 1; transition: transform .75s cubic-bezier(.4,0,.2,1); }
  #sec-build.slide-mode .h-slide.active { transform: translateX(0); }
  #sec-build.slide-mode .h-slide.slide-out { transform: translateX(-100%); }

  #sec-build .h-bg { position: absolute; inset: 0; overflow: hidden; }
  #sec-build .h-bg img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  #sec-build .h-bg video,
  #sec-build .h-bg iframe { position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%,-50%); border: none; }
  #sec-build .h-bg-fb { position: absolute; inset: 0; background: linear-gradient(150deg,#0d0804 0%,#2a1a0e 45%,#3d2214 100%); }
  #sec-build .h-grain { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: .03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; }
  #sec-build .h-ov { position: absolute; inset: 0; z-index: 2; }

  /* 콘텐츠 */
  #sec-build .h-cnt { position: absolute; inset: 0; z-index: 3; display: flex; align-items: center; padding: 0 8vw 80px; }
  #sec-build .h-inner { max-width: 680px; }
  #sec-build .h-pill { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  #sec-build .h-pill-dot { width: 36px; height: 1px; background: var(--gold, #c9a96e); }
  #sec-build .h-pill-txt { font-size: .7rem; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; }
  #sec-build .h-ttl { font-size: clamp(2.8rem,6.5vw,5.2rem); font-weight: 900; line-height: 1.08; letter-spacing: -.04em; margin-bottom: 20px; }
  #sec-build .h-dsc { font-size: clamp(.88rem,1.4vw,1rem); line-height: 1.85; margin-bottom: 40px; max-width: 480px; font-weight: 300; }
  #sec-build .h-btns { display: flex; gap: 14px; flex-wrap: wrap; }
  #sec-build .hb1 { display: inline-flex; align-items: center; gap: 10px; padding: 15px 36px; font-size: .84rem; font-weight: 700; letter-spacing: .08em; border: none; cursor: pointer; font-family: inherit; transition: all .25s; }
  #sec-build .hb1:hover { filter: brightness(1.12); transform: translateY(-2px); }
  #sec-build .hb1-arr svg { width: 12px; height: 12px; stroke: currentColor; }
  #sec-build .hb2 { display: inline-flex; align-items: center; padding: 15px 28px; font-size: .84rem; font-weight: 700; letter-spacing: .08em; border: 1px solid rgba(255,255,255,.4); background: transparent; cursor: pointer; font-family: inherit; transition: all .25s; }
  #sec-build .hb2:hover { border-color: var(--gold,#c9a96e); color: var(--gold,#c9a96e) !important; transform: translateY(-2px); }

  /* 컨트롤 */
  #sec-build .h-ctrl { position: absolute; bottom: 36px; right: clamp(220px,21vw,290px); z-index: 10; display: none; gap: 8px; }
  #sec-build .h-arr { width: 40px; height: 40px; background: rgba(255,255,255,.15); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; }
  #sec-build .h-arr:hover { background: rgba(255,255,255,.3); }
  #sec-build .h-arr svg { width: 18px; height: 18px; stroke: #fff; stroke-width: 2.5; fill: none; }
  #sec-build .h-dots { position: absolute; bottom: 36px; left: 8vw; z-index: 10; display: flex; gap: 7px; }
  #sec-build .h-prog { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,.15); z-index: 10; display: none; }
  #sec-build .h-prog-bar { height: 100%; background: var(--gold,#c9a96e); width: 0; }
  #sec-build .h-count { position: absolute; bottom: 40px; right: clamp(220px,21vw,290px); z-index: 10; display: none; font-size: .72rem; font-weight: 700; letter-spacing: .1em; color: rgba(255,255,255,.6); }

  /* 인포 패널 */
  .build-info-panel { position: absolute; right: 0; bottom: 0; z-index: 5; width: clamp(200px,20vw,280px); background: rgba(63,42,21,.75); backdrop-filter: blur(8px); display: flex; flex-direction: column; justify-content: center; padding: 40px 28px; border-left: 1px solid rgba(255,255,255,.07); }
  .build-info-item { margin-bottom: 28px; }
  .build-info-item:last-child { margin-bottom: 0; }
  .build-info-lbl { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: var(--gold,#c9a96e); text-transform: uppercase; margin-bottom: 6px; }
  .build-info-val { font-size: .9rem; font-weight: 600; color: #fff; line-height: 1.5; }

  /* 스크롤 힌트 */
  .build-scroll-hint { position: absolute; right: clamp(220px,21vw,290px); bottom: 36px; z-index: 4; display: flex; align-items: center; gap: 10px; opacity: .4; margin-right: 60px; }
  .build-scroll-hint span { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: #fff; text-transform: uppercase; }
  .build-scroll-line { width: 44px; height: 1px; background: #fff; position: relative; overflow: hidden; }
  .build-scroll-line::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: var(--gold,#c9a96e); animation: buildScrollMove 1.8s ease-in-out infinite; }

  @keyframes buildScrollMove { 0%{left:-100%} 50%{left:0} 100%{left:100%} }

  @media (max-width: 680px) {
    #sec-build { max-height: 640px; min-height: 460px; }
    .build-info-panel { display: none; }
    .build-scroll-hint { display: none; }
    #sec-build .h-cnt { padding: 0 6vw 60px; }
    #sec-build .h-ctrl { right: 16px; bottom: 16px; }
    #sec-build .h-count { display: none !important; }
  }
</style>

<section id="sec-build">
  <div id="hSlides"></div>
  <div class="h-prog" id="hProg" style="display:none"><div class="h-prog-bar" id="hProgBar"></div></div>
  <div class="h-dots" id="hDots"></div>
  <div class="h-ctrl" id="hCtrl" style="display:none">
    <button class="h-arr" onclick="heroNav(-1)"><svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg></button>
    <button class="h-arr" onclick="heroNav(1)"><svg viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6"/></svg></button>
  </div>
  <div class="h-count" id="hCount" style="display:none">01 / 01</div>

  <div class="build-info-panel">
    <div class="build-info-item">
      <div class="build-info-lbl">분양 문의</div>
      <div class="build-info-val"><?= htmlspecialchars($buildSite['phone'] ?? '0000-0000') ?></div>
    </div>
    <div class="build-info-item">
      <div class="build-info-lbl">상담 시간</div>
      <div class="build-info-val"><?= htmlspecialchars($buildSite['hours1'] ?? '') ?></div>
    </div>
  </div>

  <div class="build-scroll-hint">
    <span>Scroll</span>
    <div class="build-scroll-line"></div>
  </div>
</section>

<script>
/* ── esc 함수 (hero.js에 없으면 정의) ── */
if (typeof esc !== 'function') {
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
}
if (typeof getYtId !== 'function') {
  function getYtId(url) {
    if (!url) return null;
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w\-]{11})/);
    return m ? m[1] : null;
  }
}
if (typeof goto !== 'function') {
  function goto(url) {
    if (!url) return;
    if (url.startsWith('http')) { window.open(url, '_blank'); }
    else {
      var el = document.getElementById(url.replace('#',''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else location.href = url;
    }
  }
}

/* ── 배너 API 호출 → hero.js의 renderHero() 사용 ── */
var _pbData = { bannerConfig: {}, banners: [] };

fetch('/admin/api/banner_public.php')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    _pbData = data;
    if (typeof renderHero === 'function') {
      renderHero(data);
    }
  })
  .catch(function() {
    if (typeof renderHero === 'function') {
      renderHero({ bannerConfig: {}, banners: [] });
    }
  });
</script>

<!-- YouTube IFrame API -->
<script src="https://www.youtube.com/iframe_api"></script>