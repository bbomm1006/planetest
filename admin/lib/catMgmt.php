<div class="page" id="page-catMgmt">
  <div class="page-header">
    <div><h2>상품 분류 관리</h2><p>상품 분류를 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openCatModal(null)">➕ 분류 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="bulk-bar" id="catBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('catBulk','catTableBody')">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>분류명</th><th>사용</th><th>관리</th></tr></thead>
        <tbody id="catTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>