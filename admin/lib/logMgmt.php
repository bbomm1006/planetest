<!-- 8. 로그 관리 -->
<div class="page" id="page-logMgmt">
  <div class="page-header">
    <div><h2>로그 관리</h2><p>접속·로그인·작업·에러·이메일·랜딩 로그를 조회합니다.</p></div>
    <button class="btn btn-success" onclick="logExportCsv()">📥 엑셀 다운로드</button>
  </div>

  <!-- 로그 용어 설명 -->
  <details style="margin-bottom:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:0;">
    <summary style="cursor:pointer;padding:12px 16px;font-size:.88rem;font-weight:600;color:var(--text-secondary);user-select:none;">
      ❓ 로그 용어 설명 (클릭하여 펼치기)
    </summary>
    <div style="padding:4px 16px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">

      <!-- 접속 로그 -->
      <div style="background:var(--bg-main);border-radius:6px;padding:12px;">
        <div style="font-weight:700;font-size:.82rem;color:var(--primary);margin-bottom:8px;">🌐 접속 로그 컬럼</div>
        <table style="width:100%;font-size:.78rem;border-collapse:collapse;">
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">메서드</td><td style="padding:3px 6px;color:var(--text-secondary);"><b>GET</b>=페이지 조회, <b>POST</b>=데이터 전송(등록·저장), <b>PUT</b>=수정, <b>DELETE</b>=삭제</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">URI</td><td style="padding:3px 6px;color:var(--text-secondary);">접속한 주소 경로. 예: /api/product.php</td></tr>
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">상태코드</td><td style="padding:3px 6px;color:var(--text-secondary);"><b>200</b>=정상, <b>404</b>=주소 없음, <b>500</b>=서버 오류, <b>301</b>=주소 이동됨</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">User-Agent</td><td style="padding:3px 6px;color:var(--text-secondary);">접속에 사용한 브라우저·기기 정보. 예: Chrome/Windows, Safari/iPhone</td></tr>
        </table>
      </div>

      <!-- 작업 로그 -->
      <div style="background:var(--bg-main);border-radius:6px;padding:12px;">
        <div style="font-weight:700;font-size:.82rem;color:var(--primary);margin-bottom:8px;">🛠 작업 로그 컬럼</div>
        <table style="width:100%;font-size:.78rem;border-collapse:collapse;">
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">작업</td><td style="padding:3px 6px;color:var(--text-secondary);"><b>create</b>=등록, <b>update</b>=수정, <b>delete</b>=삭제, <b>login/logout</b>=로그인·로그아웃</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">대상 테이블</td><td style="padding:3px 6px;color:var(--text-secondary);">작업이 이루어진 항목 종류. 예: banners=배너, stores=지점, product_products=상품</td></tr>
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">대상 아이디</td><td style="padding:3px 6px;color:var(--text-secondary);">작업한 항목의 고유 번호(DB ID). 같은 번호끼리 묶으면 동일 항목에 대한 이력을 볼 수 있음</td></tr>
        </table>
      </div>

      <!-- 에러 로그 -->
      <div style="background:var(--bg-main);border-radius:6px;padding:12px;">
        <div style="font-weight:700;font-size:.82rem;color:var(--primary);margin-bottom:8px;">❌ 에러 로그 컬럼</div>
        <table style="width:100%;font-size:.78rem;border-collapse:collapse;">
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">레벨</td><td style="padding:3px 6px;color:var(--text-secondary);"><b>critical</b>=즉시 조치 필요, <b>error</b>=오류, <b>warning</b>=경고, <b>notice</b>=참고 사항</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">파일/라인</td><td style="padding:3px 6px;color:var(--text-secondary);">에러가 발생한 서버 파일 경로와 코드 줄 번호</td></tr>
        </table>
      </div>


      <!-- 이메일 로그 -->
      <div style="background:var(--bg-main);border-radius:6px;padding:12px;">
        <div style="font-weight:700;font-size:.82rem;color:var(--primary);margin-bottom:8px;">📧 이메일 로그 컬럼</div>
        <table style="width:100%;font-size:.78rem;border-collapse:collapse;">
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">수신자</td><td style="padding:3px 6px;color:var(--text-secondary);">이메일을 받은 사람의 주소</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">제목</td><td style="padding:3px 6px;color:var(--text-secondary);">발송된 이메일 제목</td></tr>
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">템플릿</td><td style="padding:3px 6px;color:var(--text-secondary);">이메일 종류. <b>find_id</b>=아이디찾기, <b>find_pw</b>=비밀번호찾기, <b>default</b>=상담·예약 안내</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">상태</td><td style="padding:3px 6px;color:var(--text-secondary);"><b>success</b>=발송 성공, <b>fail</b>=발송 실패</td></tr>
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">오류 메시지</td><td style="padding:3px 6px;color:var(--text-secondary);">발송 실패 시 원인. 정상 발송이면 비어있음</td></tr>
        </table>
      </div>

      <!-- 랜딩 로그 -->
      <div style="background:var(--bg-main);border-radius:6px;padding:12px;">
        <div style="font-weight:700;font-size:.82rem;color:var(--primary);margin-bottom:8px;">📊 랜딩 로그 컬럼</div>
        <table style="width:100%;font-size:.78rem;border-collapse:collapse;">
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">Source</td><td style="padding:3px 6px;color:var(--text-secondary);">방문 출처. 예: google, naver, kakao, instagram</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">Medium</td><td style="padding:3px 6px;color:var(--text-secondary);">광고 유형. 예: cpc=검색광고, social=SNS광고, email=이메일</td></tr>
          <tr><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">Campaign</td><td style="padding:3px 6px;color:var(--text-secondary);">광고 캠페인 이름. 마케팅 담당자가 설정한 값</td></tr>
          <tr style="background:var(--bg-card);"><td style="padding:3px 6px;font-weight:600;white-space:nowrap;">Term</td><td style="padding:3px 6px;color:var(--text-secondary);">검색 키워드. 어떤 검색어로 들어왔는지</td></tr>
        </table>
      </div>

    </div>
  </details>

  <!-- 탭 네비게이션 -->
  <div style="display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:18px;overflow-x:auto;">
    <button class="log-tab-btn active" data-tab="access"       onclick="switchLogTab('access')">🌐 접속 로그</button>
    <button class="log-tab-btn"        data-tab="login"        onclick="switchLogTab('login')">🔑 로그인 로그</button>
    <button class="log-tab-btn"        data-tab="admin_action" onclick="switchLogTab('admin_action')">🛠 작업 로그</button>
    <button class="log-tab-btn"        data-tab="error"        onclick="switchLogTab('error')">❌ 에러 로그</button>
    <button class="log-tab-btn"        data-tab="email"        onclick="switchLogTab('email')">📧 이메일 로그</button>
    <button class="log-tab-btn"        data-tab="landing"      onclick="switchLogTab('landing')">📊 랜딩 로그</button>
  </div>

  <div class="card"><div class="card-body">

    <!-- 검색 필터 -->
    <div class="table-filters" style="flex-wrap:wrap;gap:8px;margin-bottom:14px;">
      <input type="date" class="form-control" id="logDateFrom" style="width:145px;"/>
      <span style="line-height:36px;color:var(--text-muted);font-size:.85rem;">~</span>
      <input type="date" class="form-control" id="logDateTo"   style="width:145px;"/>
      <select class="form-control" id="logSubType" style="width:150px;">
        <option value="">전체 유형</option>
      </select>
      <input type="text" class="form-control" id="logKeyword" placeholder="키워드 검색" style="width:180px;"
             onkeydown="if(event.key==='Enter')loadLogList(1)"/>
      <button class="btn btn-outline" onclick="loadLogList(1)">🔍 검색</button>
      <button class="btn btn-ghost"   onclick="resetLogFilter()">초기화</button>
    </div>

    <!-- 요약 배지 -->
    <div id="logSummaryBar" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;"></div>

    <!-- 테이블 -->
    <div class="table-wrap">
      <table class="admin-table" id="logTable">
        <thead id="logThead"></thead>
        <tbody id="logBody">
          <tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">검색 버튼을 눌러 조회하세요.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div id="logPagination" style="display:flex;justify-content:center;gap:6px;margin-top:16px;flex-wrap:wrap;"></div>

  </div></div>
</div>
