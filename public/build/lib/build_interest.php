<section class="sec sec-dark" id="sec-interest">
  <div class="container">
    <div class="interest-layout">
      <div class="interest-copy">
        <div class="sec-eyebrow" style="margin-bottom:20px;">
          <span class="sec-eyebrow-line"></span>
          <span class="sec-eyebrow-txt">Contact</span>
        </div>
        <h2 class="interest-copy-ttl">경험하는 모든 순간이<strong>자부심이 될</strong></h2>
        <p class="interest-copy-dsc">귀하의 소중한 정보를 남겨주시면 친절한 안내와 정확한 정보제공으로 보답하겠습니다.</p>
        <div class="interest-contact">
          <div class="interest-contact-lbl">분양 문의</div>
          <div class="interest-contact-ph">0000-0000</div>
          <div class="interest-contact-info">평일 09:00 — 18:00 &nbsp;|&nbsp; 주말·공휴일 휴무</div>
        </div>
      </div>
      <div>
        <form id="intForm" onsubmit="submitInterest(event)">
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">이름 <span class="req">*</span></label><input class="form-inp dark" type="text" name="name" placeholder="성함" required></div>
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">이메일</label><input class="form-inp dark" type="email" name="email" placeholder="이메일"></div>
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">연락처 <span class="req">*</span></label><input class="form-inp dark" type="tel" name="phone" placeholder="010-0000-0000" required></div>
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">문의 내용</label><textarea class="form-ta dark" name="message" placeholder="문의하실 내용을 입력해주세요." rows="4"></textarea></div>
          <div class="form-chk"><input type="checkbox" id="intPriv" required><label class="form-chk-lbl light" for="intPriv">개인정보처리방침 및 수집·이용에 동의합니다.</label></div>
          <button type="submit" class="form-sub gold-btn">관심고객 등록</button>
        </form>
        <div id="intRes" class="form-res"></div>
      </div>
    </div>
  </div>
</section>

<script>
function submitInterest(e) {
  e.preventDefault();
  var f = e.target;
  var res = document.getElementById('intRes');
  if (!f.querySelector('[name=name]').value.trim() || !f.querySelector('[name=phone]').value.trim()) {
    showRes(res, '이름과 연락처를 입력해주세요.', true); return;
  }
  showRes(res, '관심고객으로 등록되었습니다. 감사합니다.', false);
  f.reset();
}
</script>
