<div class="modal-overlay" id="adminModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3 id="adminModalTitle">관리자 추가/수정</h3>
      <button class="modal-close" onclick="closeModal('adminModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="adminModalId"/>
      <div class="form-group">
        <label>아이디 <span class="req">*</span></label>
        <input type="text" class="form-control" id="adminModalUsername" placeholder="아이디"/>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>이메일</label>
        <input type="email" class="form-control" id="adminModalEmail" placeholder="이메일"/>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>비밀번호 <span class="req">*</span></label>
        <input type="password" class="form-control" id="adminModalPassword" placeholder="비밀번호 (수정 시 비워두면 유지)"/>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>이름 <span class="req">*</span></label>
        <input type="text" class="form-control" id="adminModalName" placeholder="이름"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('adminModal')">취소</button>
      <button class="btn btn-primary" onclick="saveAdmin()">저장</button>
    </div>
  </div>
</div>
