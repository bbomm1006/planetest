<div class="modal-overlay" id="inquiryDetailModal">
  <div class="modal modal-lg">
    <div class="modal-header"><h3>문의 상세 / 답변</h3><button class="modal-close" onclick="closeModal('inquiryDetailModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><label>분류</label><input type="text" class="form-control" id="inqDetailCat" readonly/></div>
        <div class="form-group"><label>상태</label>
          <select class="form-control" id="inqDetailStatus">
            <option value="pending">접수</option><option value="confirmed">확인</option>
            <option value="cancelled">취소</option><option value="completed">완료</option>
          </select>
        </div>
        <div class="form-group"><label>이름</label><input type="text" class="form-control" id="inqDetailName" readonly/></div>
        <div class="form-group"><label>연락처</label><input type="text" class="form-control" id="inqDetailPhone" readonly/></div>
        <div class="form-group col-span-2"><label>이메일</label><input type="text" class="form-control" id="inqDetailEmail" readonly/></div>
        <div class="form-group col-span-2"><label>공개 여부</label>
          <select class="form-control" id="inqDetailPublic" style="max-width:160px;">
            <option value="1">공개</option><option value="0">비밀</option>
          </select>
        </div>
        <div class="form-group col-span-2"><label>문의 내용</label><textarea class="form-control" id="inqDetailContent" rows="4" readonly></textarea></div>
        <hr class="section-divider col-span-2" style="margin:4px 0;"/>
        <div id="inqAnswerArea" class="form-group col-span-2">
          <label>답변 내용</label>
          <input type="hidden" id="inqAnswerId"/>
          <textarea class="form-control" id="inqAnswerContent" rows="4" placeholder="답변을 입력하세요"></textarea>
        </div>
        <div class="form-group"><label>답변 일시</label><input type="text" class="form-control" id="inqAnswerDate" readonly/></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('inquiryDetailModal')">닫기</button><button class="btn btn-primary" onclick="saveInquiryDetail()">저장</button></div>
  </div>
</div>