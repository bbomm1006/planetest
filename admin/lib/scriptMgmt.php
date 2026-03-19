<!-- 0-3. 스크립트 관리 -->
<div class="page" id="page-scriptMgmt">
        <div class="page-header">
          <div><h2>스크립트 관리</h2><p>HEAD / BODY 영역 삽입 HTML 코드를 관리합니다.</p></div>
          <button class="btn btn-primary" onclick="saveScript()">💾 저장</button>
        </div>
        <div class="info-box" style="margin-bottom:16px;">
          <div class="info-title">ℹ️ 스크립트 삽입 안내 — 주요 분석·마케팅 도구 발급 경로</div>
          <ol>
            <li><strong>Google Analytics (GA4)</strong> — <a href="https://analytics.google.com" target="_blank">analytics.google.com</a> → 관리 → 데이터 스트림 → 측정 ID 확인 후 G태그 복사</li>
            <li><strong>Google Tag Manager</strong> — <a href="https://tagmanager.google.com" target="_blank">tagmanager.google.com</a> → 컨테이너 생성 → HEAD / BODY 스니펫 복사</li>
            <li><strong>네이버 애널리틱스</strong> — <a href="https://analytics.naver.com" target="_blank">analytics.naver.com</a> → 사이트 등록 → 스크립트 복사</li>
            <li><strong>카카오 픽셀</strong> — <a href="https://moment.kakao.com" target="_blank">moment.kakao.com</a> → 픽셀&SDK → 픽셀 코드 복사</li>
            <li><strong>Meta 픽셀</strong> — <a href="https://business.facebook.com" target="_blank">business.facebook.com</a> → Events Manager → 픽셀 생성 → 기본 코드 복사</li>
            <li><strong>채널톡</strong> — <a href="https://developers.channel.io" target="_blank">developers.channel.io</a> → 설치 → BODY 스크립트 복사</li>
          </ol>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card"><div class="card-header"><h3>HEAD 스크립트</h3></div>
            <div class="card-body"><div class="form-group"><label>&lt;head&gt; 영역에 삽입할 HTML 코드</label>
              <textarea class="form-control code-area" id="scriptHead" rows="8" placeholder="예: Google Analytics, Meta Pixel 등"></textarea>
            </div></div>
          </div>
          <div class="card"><div class="card-header"><h3>BODY 스크립트</h3></div>
            <div class="card-body"><div class="form-group"><label>&lt;body&gt; 영역에 삽입할 HTML 코드</label>
              <textarea class="form-control code-area" id="scriptBody" rows="8" placeholder="예: Google Tag Manager noscript, 채널톡 등"></textarea>
            </div></div>
          </div>
        </div>
      </div>