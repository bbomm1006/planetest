<div class="page" id="page-cardDiscMgmt">
  <div class="page-header">
    <div><h2>카드사 할인율 관리</h2><p>카드사별 할인율을 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openCardModal(null)">➕ 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="bulk-bar" id="cardBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('cardBulk','cardTableBody')">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>카드사명</th><th>할인율(%)</th><th>사용</th><th>관리</th></tr></thead>
        <tbody id="cardTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>