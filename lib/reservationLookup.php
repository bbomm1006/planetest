<section class="sw" id="reservation-lookup" style="background:var(--off);">
  <div class="inner">
    <div class="s-tag"><span>MY RESERVATION</span></div>
    <h2 class="s-h">예약 조회 · 변경</h2>
    <p class="s-p">예약하신 정보를 조회하고 날짜 변경 또는 취소하실 수 있습니다.</p>

    <div class="lkp-wrap">
      <!-- 조회 탭 -->
      <div class="lkp-tabs">
        <button class="lkp-tab on" id="lkpTab1" onclick="lkpSwitchTab(1)">이름 + 연락처로 조회</button>
        <button class="lkp-tab" id="lkpTab2" onclick="lkpSwitchTab(2)">예약번호로 조회</button>
      </div>

      <!-- 이름+연락처 탭 -->
      <div id="lkpFormA">
        <div class="lkp-form-row">
          <div class="lkp-fg">
            <label class="lkp-fl">이름 <em style="color:var(--red)">*</em></label>
            <input class="lkp-fi" id="lkpName" type="text" placeholder="홍길동">
          </div>
          <div class="lkp-fg">
            <label class="lkp-fl">연락처 <em style="color:var(--red)">*</em></label>
            <input class="lkp-fi" id="lkpPhone" type="tel" placeholder="010-0000-0000" oninput="lkpFmtPhone(this)" onkeydown="if(event.key==='Enter') lkpSearch()">
          </div>
        </div>
        <button class="lkp-btn-search" onclick="lkpSearch()">예약 조회하기</button>
      </div>

      <!-- 예약번호 탭 -->
      <div id="lkpFormB" style="display:none;">
        <div class="lkp-fg" style="margin-bottom:16px;">
          <label class="lkp-fl">예약번호 <em style="color:var(--red)">*</em></label>
          <input class="lkp-fi" id="lkpResId" type="text" placeholder="예) PB-20260317-A1B2" onkeydown="if(event.key==='Enter') lkpSearch()">
        </div>
        <button class="lkp-btn-search" onclick="lkpSearch()">예약 조회하기</button>
      </div>

      <!-- 결과 영역 -->
      <div class="lkp-result" id="lkpResult"></div>
    </div>
  </div>
</section>