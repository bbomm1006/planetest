<!-- 예약 시간 모달 -->
<div class="modal-overlay" id="reserveTimeModal">
  <div class="modal modal-lg">
    <div class="modal-header"><h3>예약 시간 추가</h3><button class="modal-close" onclick="closeModal('reserveTimeModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group col-span-2"><label>사용 여부</label>
          <div class="toggle-wrap"><label class="toggle"><input type="checkbox" id="rtIsActive" checked><span class="toggle-slider"></span></label><span class="toggle-label" id="rtIsActiveLabel">사용</span></div>
        </div>
        <div class="form-group col-span-2"><label>매장 <span class="req">*</span></label>
          <select class="form-control" id="rtStoreId"><option value="">-- 매장 선택 --</option></select>
        </div>
        <div class="form-group col-span-2"><label>예약 설명</label><input type="text" class="form-control" id="rtDescription" placeholder="예약 안내 문구"/></div>
        <div class="form-group"><label>시작 시간 <span class="req">*</span></label><input type="time" class="form-control" id="rtStartTime"/></div>
        <div class="form-group"><label>종료 시간 <span class="req">*</span></label><input type="time" class="form-control" id="rtEndTime"/></div>
        <div class="form-group col-span-2"><label>예약 항목</label>
          <div class="repeat-group" id="reserveItemGroup"></div>
          <button class="btn-add-row" onclick="addReserveItem()">＋ 항목 추가</button>
        </div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('reserveTimeModal')">취소</button><button class="btn btn-primary" onclick="saveReserveTimeModal()">저장</button></div>
  </div>
</div>

<!-- 예약 상세 모달 -->
<div class="modal-overlay" id="reserveDetailModal">
  <div class="modal">
    <div class="modal-header"><h3>예약 상세</h3><button class="modal-close" onclick="closeModal('reserveDetailModal')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><label>예약번호</label><input type="text" class="form-control" id="rsvDetailNo" readonly/></div>
        <div class="form-group"><label>상태</label>
          <select class="form-control" id="rsvDetailStatus">
            <option value="pending">접수</option><option value="confirmed">확인</option>
            <option value="cancelled">취소</option><option value="completed">완료</option>
          </select>
        </div>
        <div class="form-group"><label>예약일</label><input type="text" class="form-control" id="rsvDetailDate" readonly/></div>
        <div class="form-group"><label>시간</label><input type="text" class="form-control" id="rsvDetailTime" readonly/></div>
        <div class="form-group"><label>매장</label><input type="text" class="form-control" id="rsvDetailStore" readonly/></div>
        <div class="form-group"><label>예약 항목</label><input type="text" class="form-control" id="rsvDetailItem" readonly/></div>
        <div class="form-group"><label>예약자명</label><input type="text" class="form-control" id="rsvDetailName" readonly/></div>
        <div class="form-group"><label>연락처</label><input type="text" class="form-control" id="rsvDetailPhone" readonly/></div>
        <div class="form-group col-span-2"><label>이메일</label><input type="text" class="form-control" id="rsvDetailEmail" readonly/></div>
        <div class="form-group col-span-2"><label>추가 메모</label><textarea class="form-control" id="rsvDetailMemo" rows="2" readonly></textarea></div>
        <div class="form-group col-span-2"><label>관리자 메모</label><textarea class="form-control" id="rsvDetailAdminMemo" rows="2" placeholder="관리자 내부 메모"></textarea></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('reserveDetailModal')">닫기</button><button class="btn btn-primary" onclick="saveReserveDetail()">저장</button></div>
  </div>
</div>