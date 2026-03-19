<div class="modal-overlay" id="consultDetailModal">
  <div class="modal">
    <div class="modal-header"><h3>상담 상세</h3><button class="modal-close" onclick="closeModal('consultDetailModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><label>상태</label>
          <select class="form-control" id="consultDetailStatus">
            <option value="pending">접수</option><option value="confirmed">확인</option>
            <option value="cancelled">취소</option><option value="completed">완료</option>
          </select>
        </div>
        <div class="form-group"><label>신청일시</label><input type="text" class="form-control" id="consultDetailCreatedAt" readonly/></div>
        <div class="form-group"><label>이름</label><input type="text" class="form-control" id="consultDetailName" readonly/></div>
        <div class="form-group"><label>연락처</label><input type="text" class="form-control" id="consultDetailPhone" readonly/></div>
        <div class="form-group"><label>제품 분류</label><input type="text" class="form-control" id="consultDetailCat" readonly/></div>
        <div class="form-group"><label>제품명</label><input type="text" class="form-control" id="consultDetailProduct" readonly/></div>
       
        <!-- 추가필드 -->
        <div class="col-span-2" id="consultDetailExtraFields"></div>
       
        <div class="form-group col-span-2"><label>관리자 메모</label><textarea class="form-control" id="consultDetailMemo" rows="3" placeholder="내부 메모"></textarea></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('consultDetailModal')">닫기</button><button class="btn btn-primary" onclick="saveConsultDetail()">저장</button></div>
  </div>
</div>