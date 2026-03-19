
<!-- 5-2. 상담 내역 -->
<div class="page" id="page-consultList">
  <div class="page-header">
    <div><h2>상담 내역</h2></div>
    <button class="btn btn-success" onclick="downloadCsv('consult')">📥 엑셀 다운로드</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="consultCatFilter" onchange="loadConsultList()"><option value="">전체 분류</option></select>
      <select class="form-control" id="consultStatusFilter" onchange="loadConsultList()">
        <option value="">전체 상태</option><option value="pending">접수</option>
        <option value="confirmed">확인</option><option value="cancelled">취소</option><option value="completed">완료</option>
      </select>
      <input type="text" class="form-control" id="consultSearch" placeholder="이름/연락처 검색" onkeydown="if(event.key==='Enter')loadConsultList()"/>
      <button class="btn btn-outline" onclick="loadConsultList()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('consultCatFilter').value='';document.getElementById('consultStatusFilter').value='';document.getElementById('consultSearch').value='';loadConsultList()">초기화</button>
    </div>
    <div class="bulk-bar" id="consultBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDeleteConsult()">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>#</th><th>이름</th><th>연락처</th><th>상태</th><th>신청일시</th><th>관리</th></tr></thead>
      <tbody id="consultBody"></tbody>
    </table></div>
  </div></div>
</div>