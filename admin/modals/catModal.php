<div class="modal-overlay" id="cardModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3>카드사 할인율 추가</h3>
      <button class="modal-close" onclick="closeModal('cardModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>카드사명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="cardName" placeholder="예: 신한카드"/>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>할인율(%) <span class="req">*</span></label>
        <input type="number" class="form-control" id="cardRate" placeholder="예: 5" min="0" max="100" step="0.01"/>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>사용 여부</label>
        <div class="toggle-wrap">
          <label class="toggle"><input type="checkbox" id="cardActive" checked><span class="toggle-slider"></span></label>
          <span class="toggle-label" id="cardActiveLabel">사용</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('cardModal')">취소</button>
      <button class="btn btn-primary" onclick="saveCardModal()">저장</button>
    </div>
  </div>
</div>