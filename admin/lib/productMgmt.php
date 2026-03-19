<div class="page" id="page-productMgmt">
  <div class="page-header">
    <div><h2>제품 관리</h2><p>제품 목록을 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openProductModal(null)">➕ 제품 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="productCatFilter" onchange="loadProductList()">
        <option value="">전체 분류</option>
      </select>
      <input type="text" class="form-control" id="productSearch" placeholder="모델명 / 제품명 검색" onkeydown="if(event.key==='Enter')loadProductList()"/>
      <button class="btn btn-outline" onclick="loadProductList()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('productCatFilter').value='';document.getElementById('productSearch').value='';loadProductList()">초기화</button>
    </div>
    <div class="bulk-bar" id="productBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('productBulk','productTableBody')">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>분류</th><th>모델명</th><th>제품명</th><th>정가</th><th>할인금액</th><th>배지</th><th>등록일</th><th>관리</th></tr></thead>
        <tbody id="productTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>