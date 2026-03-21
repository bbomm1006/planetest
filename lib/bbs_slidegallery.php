<section class="sw" id="slidegallery">
  <div class="inner">
    <div class="s-tag"><span>SLIDE GALLERY</span></div>
    <h2 class="s-h">슬라이드 갤러리</h2>
    <p class="s-p">다양한 슬라이드를 감상해보세요.</p>

    <div class="sg-cat-tabs" id="sgCatTabs"></div>
    <select class="sg-cat-sel" id="sgCatDropdown"></select>

    <div class="sg-block">
      <div class="sg-slide-stack">
        <div class="sg-slide-meta" id="sgSlideMeta" hidden>
          <p class="sg-meta-cat" id="sgMetaCat"></p>
          <p class="sg-meta-title" id="sgMetaTitle"></p>
        </div>
        <div class="sg-slider-stage">
          <div class="sg-slider-wrap" id="sgSliderWrap">
            <div class="sg-track-outer">
              <div class="sg-track" id="sgTrack">
                <div class="sg-empty">불러오는 중...</div>
              </div>
            </div>
            <div class="sg-dots-ovl" id="sgDots" aria-hidden="true"></div>
            <button type="button" class="sg-arrow sg-arrow-prev" id="sgPrev" onclick="sgMove(-1)" aria-label="이전 이미지">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button type="button" class="sg-arrow sg-arrow-next" id="sgNext" onclick="sgMove(1)" aria-label="다음 이미지">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div class="sg-thumb-bar" id="sgThumbBar" hidden>
        <div class="sg-thumb-viewport" id="sgThumbViewport">
          <div class="sg-thumb-strip" id="sgThumbs"></div>
        </div>
      </div>
    </div>
  </div>
</section>
