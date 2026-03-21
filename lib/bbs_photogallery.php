<section class="sw" id="photogallery">
  <div class="inner">
    <div class="s-tag"><span>PHOTO GALLERY</span></div>
    <h2 class="s-h">포토 갤러리</h2>
    <p class="s-p">다양한 현장 사진을 감상해보세요.</p>

    <!-- 분류 탭 (PC) / 드롭다운 (모바일) -->
    <div class="pg-cat-tabs" id="pgCatTabs"></div>
    <select class="pg-cat-sel" id="pgCatDropdown"></select>

    <!-- 검색 -->
    <div class="pg-search-bar">
      <input class="pg-search-inp" id="pgSearchInp" type="text" placeholder="검색어를 입력하세요" onkeydown="if(event.key==='Enter')pgSearch()">
      <button class="pg-search-btn" onclick="pgSearch()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
    </div>

    <!-- 결과 정보 -->
    <div class="pg-result-info" id="pgResultInfo"></div>

    <!-- 그리드 -->
    <div class="pg-grid" id="pgGrid">
      <div class="pg-empty">불러오는 중...</div>
    </div>

    <!-- 더보기 -->
    <div class="pg-more-wrap" id="pgMoreWrap" style="display:none;">
      <button class="pg-more-btn" onclick="pgLoadMore()">
        더 보기 <span id="pgMoreCount"></span>
      </button>
    </div>
  </div>
</section>

<!-- 라이트박스 오버레이 -->
<div class="pg-lightbox" id="pgLightbox" onclick="if(event.target===this||event.target.classList.contains('pg-lb-backdrop'))pgLbClose()">
  <div class="pg-lb-backdrop"></div>
  <div class="pg-lb-wrap">
    <!-- 닫기 -->
    <button class="pg-lb-close" onclick="pgLbClose()" aria-label="닫기">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
    </button>

    <!-- 이미지 카운터 -->
    <div class="pg-lb-counter" id="pgLbCounter"></div>

    <!-- 이미지 뷰어 -->
    <div class="pg-lb-stage" id="pgLbStage">
      <!-- 이전 버튼 — stage 기준 미들 정렬 -->
      <button class="pg-lb-arrow pg-lb-prev" id="pgLbPrev" onclick="pgLbMove(-1)" aria-label="이전">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="pg-lb-track" id="pgLbTrack"></div>
      <!-- 다음 버튼 — stage 기준 미들 정렬 -->
      <button class="pg-lb-arrow pg-lb-next" id="pgLbNext" onclick="pgLbMove(1)" aria-label="다음">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- 정보 패널 -->
    <div class="pg-lb-info">
      <div class="pg-lb-cat" id="pgLbCat"></div>
      <div class="pg-lb-title" id="pgLbTitle"></div>
      <div class="pg-lb-date" id="pgLbDate"></div>
      <div class="pg-lb-content" id="pgLbContent"></div>
    </div>

    <!-- 썸네일 스트립 -->
    <div class="pg-lb-thumbs" id="pgLbThumbs"></div>
  </div>
</div>
