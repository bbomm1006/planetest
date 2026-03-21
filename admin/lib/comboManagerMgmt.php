<div class="page" id="page-comboManagerMgmt">
  <div class="page-header">
    <div><h2>결합 상담 담당관리자</h2><p>결합 상담 신청 담당자를 관리합니다.</p></div>
    <button class="btn btn-primary" onclick="openComboManagerModal(0)">+ 담당자 추가</button>
  </div>

  <div class="card" style="margin-bottom:16px;"><div class="card-body">
    <strong style="display:block;margin-bottom:14px;">담당관리자 목록</strong>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>⠿</th><th>이름</th><th>담당부서</th><th>연락처</th><th>이메일</th><th>알림설정</th><th>사용</th><th>관리</th></tr></thead>
        <tbody id="comboManagerTableBody"></tbody>
      </table>
    </div>
  </div></div>

  <div class="card"><div class="card-body">
    <strong style="display:block;margin-bottom:14px;">담당자 변경 히스토리</strong>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th style="width:160px;">변경일시</th><th>담당자</th><th>변경내용</th><th style="width:120px;">변경자</th></tr></thead>
        <tbody id="comboManagerHistoryBody"></tbody>
      </table>
    </div>
  </div></div>
</div>
