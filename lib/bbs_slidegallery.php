<section class="sw" id="slidegallery">
  <div class="inner">
    <div class="s-tag"><span>SLIDE GALLERY</span></div>
    <h2 class="s-h">슬라이드 갤러리</h2>
    <p class="s-p">다양한 슬라이드를 감상해보세요.</p>

    <!-- 분류 탭 -->
    <div class="sg-cat-tabs" id="sgCatTabs"></div>

    <!-- 슬라이더 래퍼 -->
    <div class="sg-slider-wrap" id="sgSliderWrap">
      <div class="sg-track-outer">
        <div class="sg-track" id="sgTrack">
          <div class="sg-empty">불러오는 중...</div>
        </div>
      </div>
      <!-- 좌우 화살표 -->
      <button class="sg-arrow sg-arrow-prev" id="sgPrev" onclick="sgMove(-1)" aria-label="이전">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="sg-arrow sg-arrow-next" id="sgNext" onclick="sgMove(1)" aria-label="다음">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- 도트 인디케이터 -->
    <div class="sg-dots" id="sgDots"></div>

    <!-- 슬라이드 정보 -->
    <div class="sg-info" id="sgInfo">
      <div class="sg-info-cat" id="sgInfoCat"></div>
      <div class="sg-info-title" id="sgInfoTitle"></div>
      <div class="sg-info-date" id="sgInfoDate"></div>
    </div>
  </div>
</section>

<!-- 슬라이드 라이트박스 -->
<div class="sg-lightbox" id="sgLightbox" onclick="if(event.target===this||event.target.classList.contains('sg-lb-backdrop'))sgLbClose()">
  <div class="sg-lb-backdrop"></div>
  <div class="sg-lb-wrap">
    <button class="sg-lb-close" onclick="sgLbClose()" aria-label="닫기">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
    </button>
    <div class="sg-lb-counter" id="sgLbCounter"></div>
    <div class="sg-lb-stage" id="sgLbStage">
      <button class="sg-lb-arrow sg-lb-prev" id="sgLbPrev" onclick="sgLbMove(-1)" aria-label="이전">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="sg-lb-track" id="sgLbTrack"></div>
      <button class="sg-lb-arrow sg-lb-next" id="sgLbNext" onclick="sgLbMove(1)" aria-label="다음">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
    <div class="sg-lb-info">
      <div class="sg-lb-cat" id="sgLbCat"></div>
      <div class="sg-lb-title" id="sgLbTitle"></div>
      <div class="sg-lb-date" id="sgLbDate"></div>
      <div class="sg-lb-content" id="sgLbContent"></div>
    </div>
    <div class="sg-lb-thumbs" id="sgLbThumbs"></div>
  </div>
</div>
