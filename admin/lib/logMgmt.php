<!-- 8. 로그 관리 -->
<div class="page" id="page-logMgmt">
  <div class="page-header">
    <div><h2>로그 관리</h2><p>접속·로그인·작업·에러·이메일·랜딩 로그를 조회합니다.</p></div>
    <button class="btn btn-success" onclick="logExportCsv()">📥 엑셀 다운로드</button>
  </div>

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
