<div class="page" id="page-popupMgmt">
  <div class="page-header">
    <div><h2>팝업 관리</h2><p>팝업 목록을 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openPopupModal(null)">➕ 팝업 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="popupVisibleFilter">
        <option value="">전체 노출</option>
        <option value="노출">노출</option>
        <option value="숨김">숨김</option>
      </select>
      <input type="text" class="form-control" id="popupSearch" placeholder="제목 검색..."/>
      <button class="btn btn-outline" onclick="filterPopupTable()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('popupSearch').value='';document.getElementById('popupVisibleFilter').value='';filterPopupTable()">초기화</button>
    </div>
    <div class="bulk-bar" id="popupBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('popupBulk','popupTableBody')">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>제목</th><th>링크</th><th>PC 이미지</th><th>MO 이미지</th><th>노출</th><th>등록일</th><th>관리</th></tr></thead>
        <tbody id="popupTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>