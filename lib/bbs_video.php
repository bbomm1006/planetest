<section class="sw dark" id="videos">
  <div class="inner">
    <div class="s-tag"><span>VIDEOS</span></div>
    <h2 class="s-h">퓨어블루 영상</h2>
    <p class="s-p">제품과 서비스를 영상으로 만나보세요.</p>
    <div class="vwrap" id="vwrap"></div>
    <div class="vnav">
      <button class="vnarr" onclick="vidNav(-1)"><svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg></button>
      <div class="vdots" id="vdots"></div>
      <button class="vnarr" onclick="vidNav(1)"><svg viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
  </div>
</section>


<!-- VIDEO MODAL -->
<div id="vidModal" onclick="if(event.target===this)closeVidModal()">
  <div class="vmod-box">
    <div class="vmod-head">
      <div class="vmod-title" id="vmodTitle"></div>
      <button class="vmod-close" onclick="closeVidModal()">✕</button>
    </div>
    <div class="vmod-iframe-wrap">
      <iframe id="vmodIframe" allowfullscreen allow="autoplay;encrypted-media"></iframe>
    </div>
  </div>
</div>