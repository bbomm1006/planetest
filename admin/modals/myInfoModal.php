<div class="modal-overlay" id="myInfoModal">
  <div class="modal modal-sm">
    <div class="modal-header"><h3>✏️ 내 정보 수정</h3><button class="modal-close" onclick="closeModal('myInfoModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label>아이디</label><input type="text" class="form-control" id="myInfoUsername" readonly/></div>
      <div class="form-group" style="margin-top:12px;"><label>이름</label><input type="text" class="form-control" id="myInfoName"/></div>
      <div class="form-group" style="margin-top:12px;"><label>이메일</label><input type="email" class="form-control" id="myInfoEmail" placeholder="이메일"/></div>
      <div class="form-group" style="margin-top:12px;"><label>현재 비밀번호 <span class="req">*</span></label><input type="password" class="form-control" id="myInfoCurPw" placeholder="현재 비밀번호"/></div>
      <div class="form-group" style="margin-top:12px;"><label>새 비밀번호</label><input type="password" class="form-control" id="myInfoNewPw" placeholder="변경 시에만 입력"/></div>
      <div class="form-group" style="margin-top:12px;"><label>새 비밀번호 확인</label><input type="password" class="form-control" id="myInfoNewPw2" placeholder="새 비밀번호 재입력"/></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('myInfoModal')">취소</button>
      <button class="btn btn-primary" onclick="saveMyInfo()">저장</button>
    </div>
  </div>
</div>