<div class="mbg" id="capBg" onclick="if(event.target===this)closeCAP()">
    <div class="capmod">
      <div class="mhd"><h2>결합 상담 신청</h2><button class="mclose" onclick="closeCAP()"><svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"/></svg></button></div>
      <div class="cap-inner">
        <div id="capContent">
          <div class="cap-prods-summary" id="capProdSummary"></div>
          <div class="fgrid" style="margin-bottom:0">
            <div class="fg"><label class="fl">이름 <em>*</em></label><input class="fi" id="cap-name" type="text" placeholder="홍길동"></div>
            <div class="fg"><label class="fl">연락처 <em>*</em></label><input class="fi" id="cap-phone" type="tel" placeholder="010-0000-0000"></div>
            <div class="fg s2">
              <label class="fl">상담 가능 시간 <em>*</em></label>
              <div class="time-grid" id="capTimeSlots"></div>
            </div>
            <div class="fg s2"><label class="fl">추가 내용</label><textarea class="fta" id="cap-msg" placeholder="추가로 궁금한 점을 적어주세요."></textarea></div>
          </div>
          <div class="priv-wrap">
            <div class="priv-scroll" id="capPrivScroll">개인정보 수집·이용 동의<br>수집 항목: 이름, 연락처, 상담내용<br>수집 목적: 결합 상담 서비스 제공<br>보유 기간: 상담 완료 후 1년</div>
            <label class="priv-check"><input type="checkbox" id="cap-priv"><span>개인정보 수집 및 이용에 동의합니다 (필수)</span></label>
          </div>
          <button class="combo-apply-btn" onclick="submitComboApply()" style="margin-top:4px">결합 상담 신청 완료 →</button>
        </div>
        <div class="cap-ok" id="capOk">
          <svg viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="34" fill="#d1fae5" stroke="#10b981" stroke-width="2"/><path d="M20 36l11 11 21-21" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3>결합 신청 완료!</h3>
          <p>빠른 시간 내에 전문 상담사가 연락드립니다.<br>결합 할인 혜택이 자동 적용됩니다.</p>
          <button onclick="openFrontEml('combo')" style="margin-top:14px;padding:9px 22px;border-radius:9px;border:1.5px solid #10b981;background:#fff;color:#059669;font-family:inherit;font-weight:700;font-size:.82rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px">📧 신청 내역 이메일로 받기</button>
        </div>
      </div>
    </div>
  </div>
