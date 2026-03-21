<div class="modal-overlay" id="comboDetailModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3>결합 상담 신청 상세</h3>
      <button class="modal-close" onclick="closeModal('comboDetailModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>상태</label>
          <select class="form-control" id="comboDetailStatus">
            <option value="접수">접수</option>
            <option value="확인">확인</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>
        </div>
        <div class="form-group">
          <label>담당자</label>
          <select class="form-control" id="comboDetailManagerId">
            <option value="">-- 미배정 --</option>
          </select>
        </div>
        <div class="form-group">
          <label>신청일시</label>
          <input type="text" class="form-control" id="comboDetailCreatedAt" readonly/>
        </div>
        <div class="form-group">
          <label>이름</label>
          <input type="text" class="form-control" id="comboDetailName" readonly/>
        </div>
        <div class="form-group">
          <label>연락처</label>
          <input type="text" class="form-control" id="comboDetailPhone" readonly/>
        </div>
        <div class="form-group">
          <label>상담 가능 시간</label>
          <input type="text" class="form-control" id="comboDetailTimeSlot" readonly/>
        </div>
        <div class="form-group col-span-2">
          <label>신청 제품</label>
          <input type="text" class="form-control" id="comboDetailProductName" readonly/>
        </div>
        <div class="form-group">
          <label>카드사 할인</label>
          <input type="text" class="form-control" id="comboDetailCardDiscount" readonly/>
        </div>
        <div class="form-group">
          <label>최종 월 납부액</label>
          <input type="text" class="form-control" id="comboDetailFinalPrice" readonly/>
        </div>
        <div class="form-group col-span-2">
          <label>추가 내용</label>
          <textarea class="form-control" id="comboDetailMessage" rows="3" readonly></textarea>
        </div>
        <div class="form-group col-span-2">
          <label>관리자 메모</label>
          <textarea class="form-control" id="comboDetailMemo" rows="3" placeholder="내부 메모 (저장 시 반영)"></textarea>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('comboDetailModal')">닫기</button>
      <button class="btn btn-primary" onclick="saveComboDetail()">저장</button>
    </div>
  </div>
</div>
