<section class="sec sec-white" id="sec-inquiry">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">Inquiry</span></div>
      <h2 class="sec-ttl sec-ttl-dark">문의하기</h2>
    </div>
    <div class="inq-layout">
      <div>
        <form id="inqForm" onsubmit="submitInq(event)">
          <div class="form-row r2">
            <div><label class="form-lbl">이름 <span class="req">*</span></label><input class="form-inp" type="text" name="name" placeholder="성함" required></div>
            <div><label class="form-lbl">연락처 <span class="req">*</span></label><input class="form-inp" type="tel" name="phone" placeholder="010-0000-0000" required></div>
          </div>
          <div class="form-row"><label class="form-lbl">문의 내용</label><textarea class="form-ta" name="message" placeholder="궁금하신 사항을 자유롭게 입력해주세요." rows="5"></textarea></div>
          <div class="form-chk"><input type="checkbox" id="inqPriv" required><label class="form-chk-lbl" for="inqPriv">개인정보 수집 및 이용에 동의합니다. (이름·연락처 수집 / 상담 회신 목적)</label><button type="button" class="terms-view-btn" onclick="inqTermsOpen()">보기</button></div>
          <button type="submit" class="form-sub">문의 접수</button>
        </form>
        <div id="inqRes" class="form-res"></div>
      </div>
      <div>
        <div class="inq-side-card" style="background:var(--br6);border-color:var(--ln);">
          <div class="inq-side-lbl" style="color:var(--br);">Contact</div>
          <div class="inq-side-ph" style="color:var(--bk);">0000-0000</div>
          <div class="inq-side-txt" style="color:var(--g5);">평일 09:00 — 18:00<br>주말·공휴일 휴무</div>
        </div>
        <div style="background:var(--bk);padding:20px 24px;">
          <div class="inq-side-lbl">빠른 신청</div>
          <button class="btn-solid" style="display:block;width:100%;justify-content:center;margin-bottom:8px;" onclick="navTo('sec-interest')">관심고객 등록</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 문의하기 약관 모달 -->
<div class="terms-modal-bg" id="inqTermsModal" onclick="if(event.target===this)inqTermsClose()">
  <div class="terms-modal">
    <div class="terms-modal-hd">
      <div class="terms-modal-ttl">개인정보 수집 및 이용 동의</div>
      <button class="terms-modal-x" onclick="inqTermsClose()">&#10005;</button>
    </div>
    <div class="terms-modal-body">
      <h4>1. 수집하는 개인정보 항목</h4>
      <p>이름, 연락처(전화번호)</p>
      <h4>2. 개인정보 수집 및 이용 목적</h4>
      <p>분양 문의에 대한 상담 회신 및 안내</p>
      <h4>3. 보유 및 이용 기간</h4>
      <p>상담 완료 후 즉시 파기 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</p>
      <h4>4. 동의 거부 권리 및 불이익</h4>
      <p>개인정보 수집·이용에 대한 동의를 거부하실 수 있습니다. 단, 동의 거부 시 문의 접수 및 상담 서비스 이용이 제한될 수 있습니다.</p>
      <table>
        <thead><tr><th>항목</th><th>목적</th><th>보유 기간</th></tr></thead>
        <tbody><tr><td>이름, 연락처</td><td>상담 회신</td><td>상담 완료 즉시 파기</td></tr></tbody>
      </table>
    </div>
    <div class="terms-modal-ft">
      <button class="terms-modal-close-btn" onclick="inqTermsClose()">확인</button>
    </div>
  </div>
</div>

<script>
function inqTermsOpen() {
  document.getElementById('inqTermsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function inqTermsClose() {
  document.getElementById('inqTermsModal').classList.remove('open');
  document.body.style.overflow = '';
}
</script>

<script>
function submitInq(e) {
  e.preventDefault();
  var f   = e.target;
  var res = document.getElementById('inqRes');
  if (!f.querySelector('[name=name]').value.trim() || !f.querySelector('[name=phone]').value.trim()) {
    showRes(res, '이름과 연락처를 입력해주세요.', true); return;
  }
  showRes(res, '문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.', false);
  f.reset();
}
</script>