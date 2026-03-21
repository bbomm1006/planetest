<section class="sw" id="gallery">
  <div class="inner">
    <div class="s-tag"><span>GALLERY</span></div>
    <h2 class="s-h">갤러리</h2>
    <p class="s-p">다양한 이미지와 콘텐츠를 확인해보세요.</p>

    <div class="gl-cat-tabs" id="glCatTabs"></div>
    <select class="gl-cat-sel" id="glCatDropdown"></select>

    <div class="gl-grid" id="glGrid">
      <div class="gl-empty">불러오는 중...</div>
    </div>
    <div class="gl-pager" id="glPager"></div>
  </div>
</section>

<!-- 갤러리 상세 모달 -->
<div class="nt-detail-overlay" id="glModal" onclick="if(event.target===this)glCloseModal()">
  <div class="nt-detail-modal" style="position:relative;">
    <button class="nt-detail-close" onclick="glCloseModal()">
      <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
    </button>
    <div class="nt-detail-head">
      <div class="nt-detail-cat" id="glDCat" style="display:none;"></div>
      <div class="nt-detail-title" id="glDTitle"></div>
      <div class="nt-detail-meta">
        <span id="glDDate"></span>
      </div>
    </div>
    <div class="nt-detail-body">
      <div id="glDImages"></div>
      <div class="nt-detail-content" id="glDContent"></div>
      <div class="nt-detail-link" id="glDLinkWrap" style="display:none;">
        <a class="nt-ext-link" id="glDLink" href="#" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          외부 링크 바로가기
        </a>
      </div>
    </div>
    <div class="nt-detail-foot">
      <button class="nt-back-btn" onclick="glCloseModal()">← 목록으로</button>
    </div>
  </div>
</div>