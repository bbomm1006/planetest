<div id="loginPage">
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-logo">
        <div class="logo-icon">⚙️</div>
        <h1>관리자 시스템</h1>
        <p>Admin Management System</p>
      </div>
      <div class="login-error" id="loginError">아이디 또는 비밀번호가 올바르지 않습니다.</div>
      <div class="form-group"><label>아이디</label><input type="text" class="form-control" id="loginId" autocomplete="username"/></div>
      <div class="form-group"><label>비밀번호</label><input type="password" class="form-control" id="loginPw" autocomplete="current-password"/></div>
      <button class="login-btn" onclick="doLogin()">로그인</button>

      <!-- 아이디/비밀번호 찾기 링크 -->
      <div class="login-find-links">
        <button type="button" class="login-find-btn" onclick="openFindModal('id')">아이디 찾기</button>
        <span class="login-find-divider">|</span>
        <button type="button" class="login-find-btn" onclick="openFindModal('pw')">비밀번호 찾기</button>
      </div>
    </div>
  </div>
</div>

<!-- ============================================================
     아이디 / 비밀번호 찾기 모달
     ============================================================ -->
<div id="findAccountModal" class="find-modal-overlay" style="display:none;" onclick="closeFindModal(event)">
  <div class="find-modal-box">

    <!-- 탭 -->
    <div class="find-modal-tabs">
      <button type="button" class="find-tab-btn active" id="findTabId" onclick="switchFindTab('id')">아이디 찾기</button>
      <button type="button" class="find-tab-btn" id="findTabPw" onclick="switchFindTab('pw')">비밀번호 찾기</button>
    </div>

    <!-- 아이디 찾기 -->
    <div id="findIdPanel" class="find-panel">
      <p class="find-desc">가입 시 등록한 이메일 주소를 입력하시면<br>아이디를 이메일로 발송해 드립니다.</p>
      <div class="find-form-group">
        <label>이메일</label>
        <input type="email" class="form-control" id="findIdEmail" placeholder="example@email.com"/>
      </div>
      <div class="find-msg" id="findIdMsg"></div>
      <button type="button" class="login-btn" id="findIdBtn" onclick="doFindId()">이메일 발송</button>
    </div>

    <!-- 비밀번호 찾기 -->
    <div id="findPwPanel" class="find-panel" style="display:none;">
      <p class="find-desc">아이디와 이메일을 입력하시면<br>임시 비밀번호를 이메일로 발송해 드립니다.</p>
      <div class="find-form-group">
        <label>아이디</label>
        <input type="text" class="form-control" id="findPwUsername" placeholder="아이디 입력"/>
      </div>
      <div class="find-form-group">
        <label>이메일</label>
        <input type="email" class="form-control" id="findPwEmail" placeholder="example@email.com"/>
      </div>
      <div class="find-msg" id="findPwMsg"></div>
      <button type="button" class="login-btn" id="findPwBtn" onclick="doFindPw()">임시 비밀번호 발급</button>
    </div>

    <button type="button" class="find-modal-close" onclick="document.getElementById('findAccountModal').style.display='none'">✕</button>
  </div>
</div>
