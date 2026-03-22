<section class="sw off" id="reviews">
  <div class="inner">
    <div class="s-tag"><span>REVIEWS</span></div>
    <h2 class="s-h">실제 고객 후기</h2>
    <p class="s-p">24만 명의 고객이 경험한 퓨어블루의 차이</p>
    <div class="nt-search" style="max-width:var(--content-max);margin:0 auto 32px;">
      <select class="nt-search-sel" id="rvCatSel">
        <option value="">전체 분류</option>
      </select>
      <select class="nt-search-sel" id="rvFieldSel">
        <option value="all">전체(제목+내용)</option>
        <option value="title">제목</option>
        <option value="content">내용</option>
      </select>
      <input class="nt-search-inp" id="rvKwInp" type="text" placeholder="검색어를 입력하세요" onkeydown="if(event.key==='Enter')rvSearch()">
      <button class="nt-search-btn" onclick="rvSearch()">검색</button>
    </div>
    <!-- 총건수 -->
    <div class="bbs-total-info" id="rvTotalInfo" style="max-width:var(--content-max);margin:0 auto 12px;"></div>
    <div class="rvwrap" id="rvwrap"></div>
    <div class="rvnav">
      <button type="button" class="rvnarr" onclick="rvNav(-1)" aria-label="이전 후기"><svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg></button>
      <div class="rvdots" id="rvdots"></div>
      <button type="button" class="rvnarr" onclick="rvNav(1)" aria-label="다음 후기"><svg viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
  </div>
</section>