<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="s-icon">⚙</div>
        <div><div class="s-name">Admin System</div><div class="s-sub">관리자 시스템</div></div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">🔧</span>시스템 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" onclick="showPage('adminMgmt')">관리자 관리</div>
            <div class="nav-sub-link" onclick="showPage('menuMgmt')">메뉴 관리</div>
            <div class="nav-sub-link" onclick="showPage('sectionMgmt')">섹션 관리</div>
            <div class="nav-sub-link" onclick="showPage('scriptMgmt')">스크립트 관리</div>
            <div class="nav-sub-link" onclick="showPage('socialMgmt')">소셜 관리</div>
            <!-- <div class="nav-sub-link" onclick="showPage('siteMgmt')">사이트 정보 관리</div> -->
            <div class="nav-sub-link" onclick="showPage('homepageInfo')">홈페이지 정보 관리</div>
            <div class="nav-sub-link" onclick="showPage('legalTermsMgmt')">법적 약관 관리</div>
          </div>
        </div>
      </div>
      <div class="nav-section" data-menu-keys="banner popup">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">🖼️</span>콘텐츠 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" data-menu-key="banner" onclick="showPage('bannerMgmt')">상단 메인 배너</div>
            <div class="nav-sub-link" data-menu-key="popup" onclick="showPage('popupMgmt')">팝업 관리</div>
          </div>
        </div>
      </div>
      <div class="nav-section" data-menu-keys="catMgmt product card">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">🛍️</span>상품 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" data-menu-key="catMgmt" onclick="showPage('catMgmt')">분류 관리</div>
            <div class="nav-sub-link" data-menu-key="product" onclick="showPage('productMgmt')">제품 관리</div>
            <div class="nav-sub-link" data-menu-key="card" onclick="showPage('cardDiscMgmt')">카드사 할인율 관리</div>
          </div>
        </div>
      </div>
      <div class="nav-section" data-menu-keys="kakaoApi store">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">🏪</span>매장 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" data-menu-key="kakaoApi" onclick="showPage('kakaoApiMgmt')">카카오 API 관리</div>
            <div class="nav-sub-link" data-menu-key="store" onclick="showPage('storeMgmt')">매장(지점) 관리</div>
          </div>
        </div>
      </div>
      <div class="nav-section">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">📋</span>게시판 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub" id="boardNavSub">
            <div class="nav-sub-link" onclick="showPage('boardCreate')">게시판 추가</div>
            <div class="nav-sub-link" onclick="showPage('boardList')" id="dynamicBoardNav">게시판 목록</div>
          </div>
        </div>
      </div>
      <div class="nav-section">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">📝</span>문의 폼 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub" id="customInquiryNavSub">
            <div class="nav-sub-link" onclick="showPage('customInquiryCreate')">문의 폼 추가</div>
            <div class="nav-sub-link" onclick="showPage('customInquiryList')">문의 폼 목록</div>
          </div>
        </div>
      </div>
      <div class="nav-section" data-menu-keys="consultCat consult">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">💬</span>상담 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">            
            <div class="nav-sub-link" data-menu-key="consultCat" onclick="showPage('consultField')">필드 관리</div>
            <div class="nav-sub-link" onclick="showPage('consultTerms')">약관 관리</div>
            <div class="nav-sub-link" data-menu-key="consult" onclick="showPage('consultList')">상담 내역</div>
          </div>
        </div>
      </div>
      <div class="nav-section" data-menu-keys="inquiryCat inquiry">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">✉️</span>일대일 문의<span class="nav-arrow">›</span></div>
          <div class="nav-sub">            
            <div class="nav-sub-link" data-menu-key="inquiry" onclick="showPage('inquiryList')">문의 내역</div>
          </div>
        </div>
      </div>
      <div class="nav-section" data-menu-keys="rsvTime rsvList">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">📅</span>예약 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" data-menu-key="rsvTime" onclick="showPage('reserveTime')">예약 시간 관리</div>
            <div class="nav-sub-link" data-menu-key="rsvList" onclick="showPage('reserveList')">예약 내역</div>
          </div>
        </div>
      </div>
      <div class="nav-section">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">🤖</span>챗봇 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" onclick="showPage('chatbotKB')">지식베이스 관리</div>
            <div class="nav-sub-link" onclick="showPage('chatbotContext')">컨텍스트 관리</div>
            <div class="nav-sub-link" onclick="showPage('chatbotQuick')">빠른질문 관리</div>
            <div class="nav-sub-link" onclick="showPage('chatbotConfig')">봇 설정</div>
          </div>
        </div>
      </div>
      <div class="nav-section">
        <div class="nav-item">
          <div class="nav-link" onclick="toggleNav(this)"><span class="nav-icon">📋</span>로그 관리<span class="nav-arrow">›</span></div>
          <div class="nav-sub">
            <div class="nav-sub-link" onclick="showPage('logMgmt')">로그 조회</div>
          </div>
        </div>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="u-avatar" id="userAvatar">관</div>
        <div class="u-info">
          <div class="u-name" id="userNameDisplay">관리자</div>
          <div class="u-role">Administrator</div>
        </div>
        <div class="sidebar-user-btns">
          <button class="sidebar-icon-btn" title="내 정보 수정" onclick="openModal('myInfoModal')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="sidebar-icon-btn logout" title="로그아웃" onclick="doLogout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  </aside>
