<section class="sw off" id="board" style="background:var(--off)">
  <div class="inner">
    <div class="s-tag"><span>BOARD</span></div>
    <h2 class="s-h">문의게시판</h2>
    <p class="s-p">궁금한 점을 자유롭게 문의해 주세요. 빠르게 답변드립니다.</p>

    <!-- 로그인 상태 바 -->
    <div class="board-login-bar">
      <div class="board-user-info" id="boardUserInfo">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        <span id="boardLoginStatus">로그인이 필요합니다.</span>
      </div>
      <div class="board-login-actions">
        <button class="board-btn board-btn-blue" id="boardLoginBtn" onclick="openBoardLogin()">로그인</button>
        <button class="board-btn board-btn-ghost" id="boardLogoutBtn" onclick="boardLogout()" style="display:none">로그아웃</button>
        <button class="board-btn board-btn-blue" id="boardWriteBtn" onclick="openBoardWrite()" style="display:none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>글쓰기
        </button>
      </div>
    </div>

    <!-- 목록 뷰 -->
    <div id="boardListView">
      <div class="board-toolbar">
        <div class="board-search-row">
          <input id="boardKw" placeholder="제목 / 작성자 검색" onkeydown="if(event.key==='Enter')boardSearch()">
          <button class="board-btn board-btn-blue board-btn-sm" onclick="boardSearch()">검색</button>
          <button class="board-btn board-btn-ghost board-btn-sm" onclick="boardReset()">초기화</button>
        </div>
      </div>
      <div class="board-list" id="boardTbody">
        <div class="board-list-empty">불러오는 중...</div>
      </div>
      <div class="board-pager" id="boardPager"></div>
    </div>

    <!-- 상세 뷰 -->
    <div id="boardDetailView" style="display:none;">
      <div class="board-detail-wrap">
        <div class="board-detail-head">
          <div class="board-detail-title" id="bdTitle"></div>
          <div class="board-detail-meta">
            <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><strong id="bdAuthor"></strong></span>
            <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span id="bdDate"></span></span>
            <span><span id="bdStatus"></span></span>
          </div>
        </div>
        <div class="board-detail-body" id="bdContent"></div>
        <!-- 댓글 -->
        <div class="board-comments-wrap">
          <div class="board-comments-head">
            댓글 <span id="bdCommentCount">0</span>
          </div>
          <div id="bdCommentList"></div>
          <div class="board-comment-form-wrap" id="bdCommentForm" style="display:none;">
            <textarea id="bdCommentTa" placeholder="댓글을 입력하세요..."></textarea>
            <div class="board-comment-submit-row">
              <button class="board-btn board-btn-blue" onclick="submitBoardComment()">댓글 등록</button>
            </div>
          </div>
          <div id="bdCommentLoginMsg" style="display:none;padding:14px 24px 20px;font-size:.8rem;color:var(--g4);">댓글을 작성하려면 로그인하세요.</div>
        </div>
        <div class="board-detail-footer">
          <button class="board-btn board-btn-ghost" onclick="boardBackToList()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>목록
          </button>
          <button class="board-btn board-btn-red" id="bdDeleteBtn" onclick="deleteBoardPost()" style="display:none;">삭제</button>
        </div>
      </div>
    </div>

    <!-- 글쓰기 뷰 -->
    <div id="boardWriteView" style="display:none;">
      <div class="board-write-wrap">
        <div class="board-write-head">글쓰기</div>
        <div class="board-write-body">
          <div>
            <label class="board-write-label">핸드폰 번호<em>*</em></label>
            <input class="board-write-input half" id="bwPhone" type="tel" placeholder="010-0000-0000">
          </div>
          <div>
            <label class="board-write-label">분류<em>*</em></label>
            <select class="board-write-input" id="bwCategory">
              <option value="">분류 선택</option>
            </select>
          </div>
          <div>
            <label class="board-write-label">제목<em>*</em></label>
            <input class="board-write-input" id="bwTitle" placeholder="제목을 입력하세요">
          </div>
          <div>
            <label class="board-write-label">내용<em>*</em></label>
            <textarea class="board-write-ta" id="bwContent" placeholder="내용을 입력하세요"></textarea>
          </div>
          <div class="board-secret-row" style="display:none;">
            <label class="board-secret-chk">
              <input type="checkbox" id="bwSecret" onchange="toggleSecretPw()"> 비밀글
            </label>
            <input class="board-write-input half" id="bwSecretPw" type="password" placeholder="비밀번호 (4자 이상)" style="display:none;">
          </div>
        </div>
        <div class="board-write-footer">
          <button class="board-btn board-btn-blue" onclick="submitBoardPost()">등록하기</button>
          <button class="board-btn board-btn-ghost" onclick="boardCancelWrite()">취소</button>
        </div>
      </div>
    </div>

    <!-- 비밀글 비밀번호 모달 (비활성화) -->
    <div id="boardPwModal" style="display:none !important;position:fixed;inset:0;background:rgba(8,14,26,.5);z-index:8000;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:18px;padding:28px 26px;width:340px;max-width:92vw;box-shadow:0 16px 56px rgba(8,14,26,.22);">
        <div style="font-weight:800;font-size:1rem;color:var(--ink);margin-bottom:6px;">🔒 비밀글</div>
        <p style="font-size:.82rem;color:var(--g5);margin-bottom:16px;line-height:1.6;">비밀번호를 입력하면 내용을 확인할 수 있습니다.</p>
        <input class="board-write-input" id="boardPwInput" type="password" placeholder="비밀번호 입력" onkeydown="if(event.key==='Enter')confirmBoardPw()">
        <div style="display:flex;gap:8px;margin-top:14px;">
          <button class="board-btn board-btn-blue" style="flex:1" onclick="confirmBoardPw()">확인</button>
          <button class="board-btn board-btn-ghost" onclick="closeBoardPwModal()">취소</button>
        </div>
        <div id="boardPwErr" style="color:var(--red);font-size:.76rem;margin-top:8px;display:none;"></div>
      </div>
    </div>
  </div>
</section>

<!-- 로그인 모달 -->
<div id="boardLoginModal" style="display:none;position:fixed;inset:0;background:rgba(8,14,26,.5);z-index:8000;align-items:center;justify-content:center;">
  <div style="background:#fff;border-radius:22px;padding:34px 28px;width:380px;max-width:92vw;box-shadow:0 20px 60px rgba(8,14,26,.22);text-align:center;">
    <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--sky),var(--aqua));display:grid;place-items:center;margin:0 auto 14px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    </div>
    <div style="font-weight:900;font-size:1.12rem;color:var(--ink);margin-bottom:6px;">문의게시판 로그인</div>
    <p style="font-size:.82rem;color:var(--g5);margin-bottom:24px;line-height:1.6;">SNS 계정으로 간편하게 로그인하세요.</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <button class="board-social-btn board-kakao" onclick="boardSocialLogin('kakao')">
        <svg viewBox="0 0 24 24" width="18" height="18" style="flex-shrink:0"><path d="M12 3C6.48 3 2 6.477 2 10.8c0 2.694 1.655 5.071 4.17 6.467L5.1 21l4.373-2.937C10.256 18.342 11.118 18.6 12 18.6c5.52 0 10-3.477 10-7.8S17.52 3 12 3z" fill="currentColor"/></svg>
        카카오 로그인
      </button>
      <button class="board-social-btn board-naver" onclick="boardSocialLogin('naver')">
        <span style="font-weight:900;font-size:1rem;flex-shrink:0">N</span>
        네이버 로그인
      </button>
      <button class="board-social-btn board-google" onclick="boardSocialLogin('google')">
        <svg viewBox="0 0 24 24" width="18" height="18" style="flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        구글 로그인
      </button>
    </div>
    <button onclick="closeBoardLogin()" style="margin-top:18px;border:none;background:none;font-size:.8rem;color:var(--g4);cursor:pointer;font-family:inherit;">닫기</button>
  </div>
</div>
