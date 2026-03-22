<div class="mbg" id="cmpBg" onclick="if(event.target===this)closeCMP()">
    <div class="cmod">
      <div class="mhd"><h2>🔍 제품 비교</h2><label style="display:flex;align-items:center;gap:6px;font-size:.77rem;font-weight:700;cursor:pointer;margin-left:auto;margin-right:10px;color:var(--g5)"><input type="checkbox" id="diffOnly" onchange="renderCmpTable()"> 차이점만 보기</label><button class="mclose" onclick="closeCMP()"><svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"/></svg></button></div>
      <div style="overflow-x:auto;overflow-y:auto;padding:22px 26px 28px;flex:1;min-height:0;" class="cmod-table-wrap">
        <table class="cmpt" id="cmpt"></table>
        <div style="display:flex;gap:8px;justify-content:center;padding-top:16px;" id="cmpCta"></div>
      </div>
      <div class="cmod-cards-wrap" style="overflow-y:auto;flex:1;min-height:0;">
        <div id="cmpCards"></div>
        <div style="padding:12px 16px 16px;display:flex;gap:8px;justify-content:center;" id="cmpCtaMobile"></div>
      </div>
    </div>
  </div>