<div class="modal-overlay" id="comboSlotModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="comboSlotModalTitle">시간 추가</h3>
      <button class="modal-close" onclick="closeModal('comboSlotModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>시간 레이블 <span class="req">*</span></label>
        <input type="text" class="form-control" id="comboSlotLabel" placeholder="예: 오전 10~12시"/>
      </div>
      <div class="form-group">
        <label>사용 여부</label>
        <label class="toggle">
          <input type="checkbox" id="comboSlotActive" checked
                 onchange="document.getElementById('comboSlotActiveLabel').textContent=this.checked?'사용':'미사용'">
          <span class="toggle-slider"></span>
        </label>
        <span id="comboSlotActiveLabel" style="margin-left:8px;font-size:.85rem;">사용</span>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('comboSlotModal')">취소</button>
      <button class="btn btn-primary" onclick="saveComboSlot()">저장</button>
    </div>
  </div>
</div>
