<!-- 7-1. 예약 시간 관리 -->
<div class="page" id="page-reserveTime">
  <div class="page-header">
    <div><h2>예약 시간 관리</h2><p>매장별 예약 가능 시간과 항목을 설정합니다.</p></div>
    <button class="btn btn-primary" onclick="openReserveTimeModal(null)">➕ 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="reserveTimeStoreFilter" onchange="loadReserveTimeList()"><option value="">전체 매장</option></select>
      <button class="btn btn-outline" onclick="loadReserveTimeList()">🔍 검색</button>
    </div>
    <div class="bulk-bar" id="reserveTimeBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('reserveTimeBulk','reserveTimeBody')">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>#</th><th>매장</th><th>예약 설명</th><th>시작</th><th>종료</th><th>항목수</th><th>총 수량</th><th>사용</th><th>관리</th></tr></thead>
      <tbody id="reserveTimeBody"></tbody>
    </table></div>
  </div></div>
</div>

<!-- 7-2. 예약 내역 -->
<div class="page" id="page-reserveList">
  <div class="page-header">
    <div><h2>예약 내역</h2></div>
    <button class="btn btn-success" onclick="downloadCsv('reserve')">📥 엑셀 다운로드</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <input type="date" class="form-control" id="reserveDateFrom"/>
      <span style="color:var(--text-muted);">~</span>
      <input type="date" class="form-control" id="reserveDateTo"/>
      <select class="form-control" id="reserveStoreFilter"><option value="">전체 매장</option></select>
      <select class="form-control" id="reserveStatusFilter">
        <option value="">전체 상태</option><option value="pending">접수</option>
        <option value="confirmed">확인</option><option value="cancelled">취소</option><option value="completed">완료</option>
      </select>
      <input type="text" class="form-control" id="reserveSearch" placeholder="예약자명/연락처" onkeydown="if(event.key==='Enter')loadReserveList()"/>
      <button class="btn btn-outline" onclick="loadReserveList()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="['reserveDateFrom','reserveDateTo','reserveStoreFilter','reserveStatusFilter','reserveSearch'].forEach(id=>{document.getElementById(id).value=''});loadReserveList()">초기화</button>
    </div>
    <div class="bulk-bar" id="reserveBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDeleteReserve()">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>#</th><th>예약번호</th><th>예약일</th><th>시간</th><th>매장</th><th>항목</th><th>예약자</th><th>연락처</th><th>상태</th><th>등록일</th><th>관리</th></tr></thead>
      <tbody id="reserveBody"></tbody>
    </table></div>
  </div></div>
</div>

<!-- [추가] 예약(신규 rv2) — 기존 예약 시간/내역 페이지와 별도 API·DB -->
<div class="page" id="page-rv2Reserve">
  <div class="page-header">
    <div><h2>예약 관리 (신규)</h2><p><code>rv2_*</code> 테이블 기반. 기존 「예약 시간 관리 / 예약 내역」과 독립입니다.</p></div>
  </div>
  <div id="rv2a-gate" style="display:block;padding:24px;text-align:center;background:var(--bg2);border-radius:var(--radius);">
    <p>예약(신규) 관리 화면을 불러오는 중입니다…</p>
  </div>
  <div id="rv2a-app" style="display:none;">
    <div class="rv2a-layout" style="min-height:60vh;">
      <nav class="rv2a-nav" id="rv2a-nav" aria-label="예약(신규) 메뉴"></nav>
      <div class="rv2a-main" id="rv2a-main" role="region" aria-label="예약(신규) 내용"></div>
    </div>
  </div>
  <div class="rv2a-modal-bg" id="rv2a-modal-bg">
    <div class="rv2a-modal" id="rv2a-modal"></div>
  </div>
</div>