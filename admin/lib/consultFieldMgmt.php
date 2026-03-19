<div class="page" id="page-consultField">
  <div class="page-header">
    <div><h2>상담 필드 관리</h2><p>상담 폼의 기본 설정 및 추가 필드를 관리합니다.</p></div>
  </div>

  <!-- 기본 설정 -->
  <div class="card" style="margin-bottom:20px;"><div class="card-body">
    <h4 style="margin-bottom:16px;font-size:.95rem;font-weight:700;">기본 설정</h4>
    <div class="form-group">
      <label>타이틀</label>
      <input type="text" class="form-control" id="cfTitle" placeholder="상담 폼 타이틀">
    </div>
    <div class="form-group" style="margin-top:12px;">
      <label>작은 설명</label>
      <input type="text" class="form-control" id="cfDesc" placeholder="작은 설명">
    </div>
    <div class="form-group" style="margin-top:12px;">
      <label>작은 설명2</label>
      <input type="text" class="form-control" id="cfDesc2" placeholder="작은 설명2">
    </div>
    <div style="display:flex;gap:24px;margin-top:16px;">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
        <input type="checkbox" id="cfUseProduct"> 제품분류 &amp; 제품명 사용
      </label>
    </div>
    <div style="margin-top:20px;text-align:right;">
      <button class="btn btn-primary" onclick="saveConsultConfig()">설정 저장</button>
    </div>
  </div></div>

  <!-- 추가 필드 목록 -->
  <div class="card"><div class="card-body">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h4 style="font-size:.95rem;font-weight:700;">추가 필드</h4>
      <button class="btn btn-primary btn-sm" onclick="openConsultFieldModal()">➕ 필드 추가</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>#</th><th></th><th>필드명</th><th>종류</th><th>Placeholder / 항목</th><th>사용여부</th></tr></thead>
        <tbody id="consultFieldTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>

<!-- 필드 추가 모달 -->
<div class="modal-overlay" id="consultFieldModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3>필드 추가</h3>
      <button class="modal-close" onclick="closeModal('consultFieldModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>필드명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="cfFieldName" placeholder="필드명">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>필드 종류 <span class="req">*</span></label>
        <select class="form-control" id="cfFieldType" onchange="onConsultFieldTypeChange()">
          <option value="input">input</option>
          <option value="textarea">textarea</option>
          <option value="select">select</option>
          <option value="radio">radio</option>
          <option value="check">check</option>
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;" id="cfPlaceholderWrap">
        <label>Placeholder</label>
        <input type="text" class="form-control" id="cfPlaceholder" placeholder="placeholder 텍스트">
      </div>
      <div class="form-group" style="margin-top:12px;display:none;" id="cfOptionsWrap">
        <label>항목</label>
        <div id="cfNewOptionList" style="display:flex;flex-direction:column;gap:8px;"></div>
        <button class="btn-add-row" style="margin-top:8px;" onclick="addNewConsultFieldOption()">+ 항목 추가</button>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('consultFieldModal')">취소</button>
      <button class="btn btn-primary" onclick="saveConsultField()">추가</button>
    </div>
  </div>
</div>

<!-- 항목 수정 모달 -->
<div class="modal-overlay" id="consultFieldOptionModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3>항목 수정</h3>
      <button class="modal-close" onclick="closeModal('consultFieldOptionModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="cfOptionFieldId">
      <div id="cfOptionList" style="display:flex;flex-direction:column;gap:8px;"></div>
      <button class="btn-add-row" style="margin-top:10px;" onclick="addConsultFieldOption()">+ 항목 추가</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('consultFieldOptionModal')">취소</button>
      <button class="btn btn-primary" onclick="saveConsultFieldOptions()">저장</button>
    </div>
  </div>
</div>