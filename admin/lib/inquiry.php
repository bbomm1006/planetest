<!-- 6-1. 문의 분류 관리 -->
<div class="page" id="page-inquiryCat">
  <div class="page-header">
    <div><h2>문의 분류 관리</h2><p>일대일 문의 분류를 관리합니다.</p></div>
    <button class="btn btn-primary" onclick="openInquiryCatModal(null)">➕ 분류 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="bulk-bar" id="inquiryCatBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('inquiryCatBulk','inquiryCatBody')">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>분류명</th><th>사용</th><th>관리</th></tr></thead>
      <tbody id="inquiryCatBody"></tbody>
    </table></div>
  </div></div>
</div>

<!-- 6-2. 문의 내역 -->
<div class="page" id="page-inquiryList">
  <div class="page-header">
    <div><h2>일대일 문의 내역</h2></div>
    <button class="btn btn-success" onclick="downloadCsv('inquiry')">📥 엑셀 다운로드</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="inquiryCatFilter" onchange="loadInquiryList()"><option value="">전체 분류</option></select>
      <select class="form-control" id="inquiryStatusFilter" onchange="loadInquiryList()">
        <option value="">전체 상태</option><option value="pending">접수</option>
        <option value="confirmed">확인</option><option value="cancelled">취소</option><option value="completed">완료</option>
      </select>
      <select class="form-control" id="inquiryPublicFilter" onchange="loadInquiryList()">
        <option value="">전체</option><option value="1">공개글</option><option value="0">비밀글</option>
      </select>
      <input type="text" class="form-control" id="inquirySearch" placeholder="이름/이메일 검색" onkeydown="if(event.key==='Enter')loadInquiryList()"/>
      <button class="btn btn-outline" onclick="loadInquiryList()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="['inquiryCatFilter','inquiryStatusFilter','inquiryPublicFilter','inquirySearch'].forEach(id=>{document.getElementById(id).value=''});loadInquiryList()">초기화</button>
    </div>
    <div class="bulk-bar" id="inquiryBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDeleteInquiry()">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>#</th><th>분류</th><th>이름</th><th>연락처</th><th>이메일</th><th>상태</th><th>공개</th><th>답변</th><th>신청일시</th><th>관리</th></tr></thead>
      <tbody id="inquiryBody"></tbody>
    </table></div>
  </div></div>
</div>