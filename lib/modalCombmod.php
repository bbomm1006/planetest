<div class="mbg" id="comboBg" onclick="if(event.target===this)closeCombo()">
    <div class="combmod">
      <div class="mhd"><h2>🔗 결합 할인 계산기</h2><button class="mclose" onclick="closeCombo()"><svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"/></svg></button></div>
      <!-- 스크롤 영역 시작 -->
      <div class="combo-scroll-area">
        <div class="combo-head">
          <div class="combo-tag">COMBO DISCOUNT</div>
          <h2>결합 신청 할인</h2>
          <p>2개 제품을 함께 신청하시면 <strong>결합 할인 10%</strong>가 자동 적용됩니다. 카드사 추가 할인도 더해서 최종 월 요금을 확인해보세요.</p>
        </div>
        <div class="combo-body">
          <!-- selected products -->
          <div class="comb-prods" id="combProds"></div>
          <!-- card discount selector -->
          <div style="margin-bottom:14px">
            <div style="font-size:.74rem;font-weight:700;color:var(--ink2);margin-bottom:8px">카드사 추가 할인 선택</div>
            <div class="card-disc-row" id="cardDiscRow"></div>
          </div>
          <!-- discount breakdown -->
          <div class="disc-box" id="discBox"></div>
        </div>
      </div>
      <!-- 스크롤 영역 끝 / CTA 고정 하단 -->
      <div class="combo-footer">
        <div class="combo-cta">
          <button class="combo-close-btn" onclick="closeCombo()">닫기</button>
          <button class="combo-apply-btn" onclick="openComboApply()">결합 신청하기 →</button>
        </div>
      </div>
    </div>
  </div>