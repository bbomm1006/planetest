<div class="page" id="page-comboInquiryMgmt">
  <div class="page-header">
    <div><h2>결합 상담 신청 내역</h2><p>결합 상담 신청 내역을 관리합니다.</p></div>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <input type="text" class="form-control" id="comboInqSearch" placeholder="이름 / 연락처 / 제품명"
             onkeydown="if(event.key==='Enter')loadComboInquiryList()"/>
      <select class="form-control" id="comboInqStatusFilter" onchange="loadComboInquiryList()">
        <option value="">전체 상태</option>
        <option value="접수">접수</option>
        <option value="확인">확인</option>
        <option value="완료">완료</option>
        <option value="취소">취소</option>
      </select>
      <button class="btn btn-outline" onclick="loadComboInquiryList()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('comboInqSearch').value='';document.getElementById('comboInqStatusFilter').value='';loadComboInquiryList()">초기화</button>
      <button class="btn btn-outline" onclick="comboInquiryExcelDownload()">⬇ 엑셀 다운로드</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>#</th><th>상태</th><th>이름</th><th>연락처</th><th>신청 제품</th><th>상담 시간</th><th>담당자</th><th>신청일시</th><th>관리</th></tr></thead>
        <tbody id="comboInquiryTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>
