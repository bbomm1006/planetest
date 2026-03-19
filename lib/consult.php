<!-- INQUIRY -->
<style>
.fts.fts-check.checked .fts-dot::after {
  content: '';
  width: 8px;
  height: 5px;
  border-radius: 0;
  background: transparent;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translate(1px, -1px);
  display: block;
}
</style>
<section class="sw" id="inquiry" style="background:#fff">
  <div class="inner">
    <div class="inq-center">
      <div class="s-tag" style="margin-bottom:16px;"><span id="inqDesc"></span></div>
      <h2 class="s-h" style="margin-bottom:10px;" id="inqTitle"></h2>
      <p class="s-p" style="margin-bottom:40px;" id="inqDesc2"></p>
      <div class="fc-clean">
        <div id="fContent">
          <div class="fgrid">
            <!-- 이름 -->
            <div class="fg"><label class="fl">이름 <em>*</em></label><input class="fi" id="f-name" type="text" placeholder="홍길동"></div>
            <!-- 연락처 -->
            <div class="fg"><label class="fl">연락처 <em>*</em></label><input class="fi" id="f-phone" type="tel" placeholder="010-0000-0000"></div>
            <!-- 제품분류/제품명 (use_product on일 때만) -->
            <div class="fg s2" id="fBrandWrap" style="display:none"><label class="fl">제품 분류</label><select class="fs" id="f-brand" onchange="onBrandChange()"><option value="">분류 선택</option></select></div>
            <div class="fg s2" id="fProductWrap" style="display:none"><label class="fl">제품명</label><select class="fs" id="f-product" onchange="onProdChange()"><option value="">제품 선택</option></select></div>
            <div id="fProdInfo" style="display:none;grid-column:1/-1;background:linear-gradient(135deg,#eef3fb,#dbeeff);border-radius:11px;padding:11px 14px;border:1.5px solid var(--pale)"></div>
            <!-- 추가 필드 -->
            <div id="fExtraFields" style="display:contents"></div>
          </div>
          <!-- 약관 -->
          <div class="f-priv" id="fTermsWrap" style="display:none">
            <div class="f-priv-scroll" id="fTermsBody"></div>
            <label class="f-priv-chk"><input type="checkbox" id="f-priv"><span id="fTermsName">개인정보 수집 및 이용에 동의합니다 (필수)</span></label>
          </div>
          <button class="f-sub" onclick="submitForm()">무료 상담 신청하기 →</button>
        </div>
        <div class="f-ok" id="fOk" style="display:none">
          <svg viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="34" fill="#eef3fb" stroke="#1e7fe8" stroke-width="2"/><path d="M20 36l11 11 21-21" stroke="#1e7fe8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3>상담 신청 완료!</h3>
          <p>빠른 시간 내에 전문 상담사가 연락드립니다.<br>평균 응답: <strong>30분 이내</strong></p>
          <button onclick="openFrontEml('inq')" style="margin-top:14px;padding:9px 22px;border-radius:9px;border:1.5px solid #1e7fe8;background:#fff;color:#1e7fe8;font-family:inherit;font-weight:700;font-size:.82rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px">📧 신청 내역 이메일로 받기</button>
        </div>
      </div>
    </div>
  </div>
</section>