<section class="sw off" id="faq">
  <div class="inner">
    <div class="s-tag"><span>FAQ</span></div>
    <h2 class="s-h">자주묻는 질문</h2>
    <p class="s-p">고객님께서 지주 묻는 질문들을 모았습니다.</p>

    <div class="faq-wrap">
      <!-- 검색 -->
      <div class="nt-search">
        <select class="nt-search-sel" id="faqCatSel">
          <option value="">전체 분류</option>
        </select>
        <select class="nt-search-sel" id="faqFieldSel">
          <option value="all">전체(제목+내용)</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <input class="nt-search-inp" id="faqSearchInp" type="text" placeholder="검색어를 입력하세요" onkeydown="if(event.key==='Enter')faqSearch()">
        <button class="nt-search-btn" onclick="faqSearch()">검색</button>
      </div>

      <!-- 리스트 -->
      <!-- 총건수 -->
      <div class="bbs-total-info" id="faqTotalInfo"></div>

      <div class="faq-list" id="faqList">
        <div class="faq-empty">불러오는 중...</div>
      </div>

      <!-- 더보기 -->
      <div class="faq-more-wrap" id="faqMoreWrap" style="display:none;">
        <button class="faq-more-btn" onclick="faqLoadMore()">더보기 <span id="faqMoreCount"></span></button>
      </div>
    </div>
  </div>
</section>