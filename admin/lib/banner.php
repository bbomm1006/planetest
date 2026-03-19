<div class="page" id="page-bannerMgmt">
  <div class="page-header">
    <div><h2>상단 메인 배너</h2><p>배너 목록을 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openBannerModal(null)">➕ 배너 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="bannerTypeFilter">
        <option value="">전체 유형</option>
        <option value="이미지">이미지</option>
        <option value="영상">영상</option>
      </select>
      <select class="form-control" id="bannerVisibleFilter">
        <option value="">전체 노출</option>
        <option value="노출">노출</option>
        <option value="숨김">숨김</option>
      </select>
      <input type="text" class="form-control" id="bannerSearch" placeholder="배너 제목 검색..."/>
      <button class="btn btn-outline" onclick="filterBannerTable(document.getElementById('bannerSearch').value)">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('bannerSearch').value='';document.getElementById('bannerTypeFilter').value='';document.getElementById('bannerVisibleFilter').value='';filterBannerTable('')">초기화</button>
    </div>
    <div class="bulk-bar" id="bannerBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('bannerBulk','bannerTableBody')">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>배너 제목</th><th>유형</th><th>노출</th><th>등록일</th><th>관리</th></tr></thead>
        <tbody id="bannerTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>