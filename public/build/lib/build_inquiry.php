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
          <div class="form-chk"><input type="checkbox" id="inqPriv" required><label class="form-chk-lbl" for="inqPriv">개인정보 수집 및 이용에 동의합니다. (이름·연락처 수집 / 상담 회신 목적)</label></div>
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

<script>
function submitInq(e) {
  e.preventDefault();
  var f = e.target;
  var res = document.getElementById('inqRes');
  if (!f.querySelector('[name=name]').value.trim() || !f.querySelector('[name=phone]').value.trim()) {
    showRes(res, '이름과 연락처를 입력해주세요.', true); return;
  }
  showRes(res, '문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.', false);
  f.reset();
}

</script>
