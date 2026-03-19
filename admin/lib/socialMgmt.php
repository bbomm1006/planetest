<!-- 0-4. 소셜 관리 -->
      <div class="page" id="page-socialMgmt">
        <div class="page-header">
          <div><h2>소셜 관리</h2><p>소셜 로그인 API 키를 관리합니다.</p></div>
          <button class="btn btn-primary" onclick="saveSocialMgmt()">💾 저장</button>
        </div>
        <div class="info-box kakao" style="margin-bottom:12px;">
          <div class="info-title">🟡 카카오 앱 키 발급 방법</div>
          <ol>
            <li><a href="https://developers.kakao.com" target="_blank">developers.kakao.com</a> 로그인 → 내 애플리케이션 → 애플리케이션 추가</li>
            <li>앱 생성 후 <strong>앱 키</strong> 탭에서 <code>JavaScript 키</code> 또는 <code>REST API 키</code> 복사</li>
            <li>카카오 로그인 사용 시: 카카오 로그인 활성화 ON, Redirect URI 등록</li>
          </ol>
        </div>
        <div class="info-box naver" style="margin-bottom:12px;">
          <div class="info-title">🟢 네이버 Client ID/Secret 발급 방법</div>
          <ol>
            <li><a href="https://developers.naver.com" target="_blank">developers.naver.com</a> 로그인 → Application → 애플리케이션 등록</li>
            <li>사용 API에서 <strong>네이버 로그인</strong> 선택 → 서비스 URL·콜백 URL 입력</li>
            <li>등록 후 <strong>Client ID</strong> · <strong>Client Secret</strong> 확인</li>
          </ol>
        </div>
        <div class="info-box google" style="margin-bottom:16px;">
          <div class="info-title">🔴 구글 Client ID 발급 방법</div>
          <ol>
            <li><a href="https://console.cloud.google.com" target="_blank">console.cloud.google.com</a> 접속 → 프로젝트 생성</li>
            <li>API 및 서비스 → OAuth 동의 화면 설정 → 사용자 인증 정보 → OAuth 클라이언트 ID 생성</li>
            <li>승인된 리디렉션 URI 등록 후 <strong>클라이언트 ID</strong> 복사</li>
          </ol>
        </div>
        <div class="card"><div class="card-body">
          <div class="form-grid">
            <div class="form-group"><label>KAKAO_APP_KEY</label><input type="text" class="form-control" id="kakaoKey" placeholder="카카오 앱 키"/></div>
            <div class="form-group"><label>NAVER_CLIENT_ID</label><input type="text" class="form-control" id="naverClientId" placeholder="네이버 Client ID"/></div>
            <div class="form-group"><label>NAVER_CLIENT_SECRET</label><input type="password" class="form-control" id="naverSecret" placeholder="네이버 Client Secret"/></div>
            <div class="form-group"><label>GOOGLE_CLIENT_ID</label><input type="text" class="form-control" id="googleClientId" placeholder="구글 Client ID"/></div>
          </div>
          <p class="last-modified" id="socialLastMod">마지막 수정 : —</p>
        </div></div>
      </div>