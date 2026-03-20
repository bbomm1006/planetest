<div class="page" id="page-legalTermsMgmt">
  <div class="page-header">
    <div>
      <h2>법적 약관 관리</h2>
      <p>카테고리별 약관을 버전·시행일·사용 여부로 관리합니다. 풋터에 노출할 카테고리만 켜 주세요.</p>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px;">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <strong>약관 카테고리</strong>
        <button class="btn btn-primary btn-sm" onclick="openLegalCatModal(0)">➕ 카테고리 추가</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>이름</th>
              <th>슬러그(URL)</th>
              <th>풋터 노출</th>
              <th>순서</th>
              <th>버전 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="legalCatTableBody"></tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <strong id="legalVerPanelTitle">버전 목록 — 카테고리를 선택하세요</strong>
        <button class="btn btn-primary btn-sm" id="legalVerAddBtn" style="display:none;" onclick="openLegalVerModal(0)">➕ 버전 추가</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>버전명</th>
              <th>시행일</th>
              <th>사용(대표)</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="legalVerTableBody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>
