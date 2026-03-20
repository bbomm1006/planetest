<div class="page" id="page-legalTermsMgmt">
  <div class="page-header">
    <div>
      <h2>법적 약관 관리</h2>
      <p>카테고리·버전별 <strong>노출</strong>은 목록에서 체크한 뒤 각각 <strong>저장</strong> 버튼으로 반영합니다. 풋터 노출은 카테고리, 약관 페이지·버전 선택은 버전 노출로 제어합니다.</p>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px;">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <strong>약관 카테고리</strong>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <button type="button" class="btn btn-outline btn-sm" onclick="saveLegalCatVisibility()">카테고리 노출 저장</button>
          <button class="btn btn-primary btn-sm" onclick="openLegalCatModal(0)">➕ 카테고리 추가</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>이름</th>
              <th>슬러그(URL)</th>
              <th>풋터 노출<br><span style="font-weight:400;font-size:.72rem;color:var(--text-muted,#64748b);">체크 후 저장</span></th>
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
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <button type="button" class="btn btn-outline btn-sm" id="legalVerVisSaveBtn" style="display:none;" onclick="saveLegalVerVisibility()">버전 노출 저장</button>
          <button class="btn btn-primary btn-sm" id="legalVerAddBtn" style="display:none;" onclick="openLegalVerModal(0)">➕ 버전 추가</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>버전명</th>
              <th>시행일</th>
              <th>사용(대표)</th>
              <th>프론트 노출<br><span style="font-weight:400;font-size:.72rem;color:var(--text-muted,#64748b);">체크 후 저장</span></th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="legalVerTableBody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>
