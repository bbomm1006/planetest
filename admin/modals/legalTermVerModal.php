<div class="modal-overlay" id="legalTermVerModal">
  <div class="modal" style="max-width:640px;">
    <div class="modal-header">
      <h3 id="legalTermVerModalTitle">약관 버전</h3>
      <button class="modal-close" onclick="closeModal('legalTermVerModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="legalVerId" value="">
      <input type="hidden" id="legalVerCategoryId" value="">
      <div class="form-group">
        <label>버전명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="legalVerLabel" placeholder="예: v1.0, 2025-03-01 개정">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>시행일</label>
        <input type="date" class="form-control" id="legalVerEffective">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>이 버전을 사용(대표)으로 설정</label>
        <div class="toggle-wrap">
          <label class="toggle"><input type="checkbox" id="legalVerActive"><span class="toggle-slider"></span></label>
          <span class="toggle-label">카테고리당 하나만 사용 중일 수 있습니다.</span>
        </div>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>프론트에 노출</label>
        <div class="toggle-wrap">
          <label class="toggle"><input type="checkbox" id="legalVerVisible" checked><span class="toggle-slider"></span></label>
          <span class="toggle-label">끄면 약관 페이지·API에서 이 버전이 목록에 나오지 않습니다.</span>
        </div>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>약관 본문</label>
        <textarea class="form-control" id="legalVerBody" rows="14" placeholder="약관 전문을 입력하세요."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('legalTermVerModal')">취소</button>
      <button class="btn btn-primary" onclick="saveLegalVerModal()">저장</button>
    </div>
  </div>
</div>
