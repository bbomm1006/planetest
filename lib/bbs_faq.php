<section class="sw off" id="faq">
  <div class="inner">
    <div class="s-tag"><span>FAQ</span></div>
    <h2 class="s-h">자주묻는 질문</h2>
    <p class="s-p">고객님께서 지주 묻는 질문들을 모았습니다.</p>

    <div class="faq-wrap">
      <!-- 검색 -->
      <div class="faq-search">
        <select class="faq-search-sel" id="faqFieldSel">
          <option value="all">전체(제목+내용)</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="category">분류</option>
        </select>
        <input class="faq-search-inp" id="faqSearchInp" type="text" placeholder="궁금한 점을 검색하세요" onkeydown="if(event.key==='Enter')faqSearch()">
        <button class="faq-search-btn" onclick="faqSearch()">검색</button>
        <button class="faq-reset-btn" onclick="faqReset()">초기화</button>
      </div>

      <!-- 분류 탭 (검색바 아래) -->
      <div class="faq-cats" id="faqCatTabs"></div>

      <!-- 결과 정보 -->
      <div class="faq-result-info" id="faqResultInfo"></div>

      <!-- 리스트 -->
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