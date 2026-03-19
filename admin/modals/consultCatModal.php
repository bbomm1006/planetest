<!-- 상담 분류 모달 -->
<div class="modal-overlay" id="consultCatModal">
  <div class="modal modal-sm">
    <div class="modal-header"><h3>분류 추가</h3><button class="modal-close" onclick="closeModal('consultCatModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>분류명 <span class="req">*</span></label><input type="text" class="form-control" id="consultCatName" placeholder="분류명"/></div>
      <div class="form-group" style="margin-top:12px;"><label>사용 여부</label>
        <div class="toggle-wrap"><label class="toggle"><input type="checkbox" id="consultCatActive" checked><span class="toggle-slider"></span></label><span class="toggle-label" id="consultCatActiveLabel">사용</span></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('consultCatModal')">취소</button><button class="btn btn-primary" onclick="saveConsultCatModal()">저장</button></div>
  </div>
</div>

<!-- 문의 분류 모달 -->
<div class="modal-overlay" id="inquiryCatModal">
  <div class="modal modal-sm">
    <div class="modal-header"><h3>분류 추가</h3><button class="modal-close" onclick="closeModal('inquiryCatModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>분류명 <span class="req">*</span></label><input type="text" class="form-control" id="inquiryCatName" placeholder="분류명"/></div>
      <div class="form-group" style="margin-top:12px;"><label>사용 여부</label>
        <div class="toggle-wrap"><label class="toggle"><input type="checkbox" id="inquiryCatActive" checked><span class="toggle-slider"></span></label><span class="toggle-label" id="inquiryCatActiveLabel">사용</span></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('inquiryCatModal')">취소</button><button class="btn btn-primary" onclick="saveInquiryCatModal()">저장</button></div>
  </div>
</div>