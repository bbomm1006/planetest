<div class="modal-overlay" id="catModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3>분류 추가</h3>
      <button class="modal-close" onclick="closeModal('catModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>분류명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="catName" placeholder="분류명"/>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>사용 여부</label>
        <div class="toggle-wrap">
          <label class="toggle"><input type="checkbox" id="catActive" checked><span class="toggle-slider"></span></label>
          <span class="toggle-label" id="catActiveLabel">사용</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('catModal')">취소</button>
      <button class="btn btn-primary" onclick="saveCatModal()">저장</button>
    </div>
  </div>
</div>