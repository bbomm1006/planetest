<div id="cmpBar">
    <div class="cbar-in">
      <button class="cbar-tog" id="cbarTog" onclick="toggleCmpSlots()">
        <span id="cbarTogLabel">선택 상품</span>
        <svg class="cbar-tog-ic" viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="cslots" id="cslots"></div>
      <div class="cbar-info" id="cbarInfo"></div>
      <div class="cbar-acts">
        <button class="cbtn cbtn-cl" onclick="clearCmp()">선택 취소</button>
        <button class="cbtn cbtn-p" id="cmpBtn" onclick="openCmpModal()" disabled>비교하기</button>
        <button class="cbtn cbtn-combo" id="comboBtn" onclick="openCombo()" disabled>🔗 결합 할인 계산</button>
      </div>
    </div>
  </div>