<section class="sw" id="notices" style="background:#fff;">
  <div class="inner">
    <div class="s-tag"><span>NOTICE</span></div>
    <h2 class="s-h">공지사항</h2>
    <p class="s-p">퓨어블루의 새로운 소식과 공지사항을 확인하세요.</p>

    <div class="nt-wrap">
      <!-- 검색 -->
      <div class="nt-search">
        <select class="nt-search-sel" id="ntCatSel">
          <option value="">전체 분류</option>
        </select>
        <select class="nt-search-sel" id="ntFieldSel">
          <option value="all">전체(제목+내용)</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <input class="nt-search-inp" id="ntKwInp" type="text" placeholder="검색어를 입력하세요" onkeydown="if(event.key==='Enter')ntSearch()">
        <button class="nt-search-btn" onclick="ntSearch()">검색</button>
      </div>

      <!-- 리스트 -->
      <table class="nt-table">
        <thead>
          <tr>
            <th class="tc" style="width:120px">분류</th>
            <th>제목</th>
            <th class="tc" style="width:110px">작성일</th>
          </tr>
        </thead>
        <tbody id="ntTbody">
          <tr><td colspan="3" class="nt-empty">불러오는 중...</td></tr>
        </tbody>
      </table>

      <!-- 더보기 -->
      <div class="nt-more-wrap" id="ntMoreWrap" style="display:none;">
        <button class="nt-more-btn" id="ntMoreBtn" onclick="ntLoadMore()">더보기 <span id="ntMoreCount"></span></button>
      </div>
    </div>
  </div>
</section>

<!-- 공지사항 상세 모달 -->
<div class="nt-detail-overlay" id="ntDetailOverlay" onclick="if(event.target===this)ntCloseDetail()">
  <div class="nt-detail-modal" style="position:relative;">
    <button class="nt-detail-close" onclick="ntCloseDetail()">
      <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
    </button>
    <div class="nt-detail-head">
      <div class="nt-detail-cat" id="ntDCat">분류</div>
      <div class="nt-detail-title" id="ntDTitle">제목</div>
      <div class="nt-detail-meta">
        <span id="ntDDate"></span>
      </div>
    </div>
    <div class="nt-detail-body">
      <div class="nt-detail-content" id="ntDContent"></div>
      <div class="nt-detail-files" id="ntDFiles" style="display:none;">
        <div class="nt-detail-files-ttl">첨부파일</div>
        <div id="ntDFileList"></div>
      </div>
      <div class="nt-detail-link" id="ntDLinkWrap" style="display:none;">
        <a class="nt-ext-link" id="ntDLink" href="#" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          외부 링크 바로가기
        </a>
      </div>
    </div>
    <div class="nt-detail-foot">
      <button class="nt-back-btn" onclick="ntCloseDetail()">← 목록으로</button>
    </div>
  </div>
</div>