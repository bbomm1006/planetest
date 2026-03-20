<div class="modal-overlay" id="legalTermCatModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3 id="legalTermCatModalTitle">카테고리</h3>
      <button class="modal-close" onclick="closeModal('legalTermCatModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="legalCatId" value="">
      <div class="form-group">
        <label>표시 이름 <span class="req">*</span></label>
        <input type="text" class="form-control" id="legalCatName" placeholder="예: 이용약관">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>슬러그(URL) <span class="req">*</span></label>
        <input type="text" class="form-control" id="legalCatSlug" placeholder="예: terms (영문·숫자·-_)">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>정렬 순서</label>
        <input type="number" class="form-control" id="legalCatSort" value="0" step="1">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>풋터에 노출</label>
        <div class="toggle-wrap">
          <label class="toggle"><input type="checkbox" id="legalCatFooter" checked><span class="toggle-slider"></span></label>
          <span class="toggle-label">노출 시 풋터에 링크가 표시됩니다.</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('legalTermCatModal')">취소</button>
      <button class="btn btn-primary" onclick="saveLegalCatModal()">저장</button>
    </div>
  </div>
</div>
