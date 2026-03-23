<!-- ============================================================
   관심고객 등록 섹션
   ============================================================ -->
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
          <div class="interest-contact-ph"><?php try { $_intPhone = $pdo->query("SELECT phone FROM homepage_info WHERE id=1")->fetchColumn(); echo htmlspecialchars($_intPhone ?: "0000-0000"); } catch(Exception $e) { echo "0000-0000"; } ?></div>
          <div class="interest-contact-info">평일 09:00 — 18:00 &nbsp;|&nbsp; 주말·공휴일 휴무</div>
        </div>
      </div>
      <div>
        <form id="intForm" onsubmit="submitInterest(event)">
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">이름 <span class="req">*</span></label><input class="form-inp dark" type="text" name="name" placeholder="이름" required></div>
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">이메일</label><input class="form-inp dark" type="email" name="email" placeholder="이메일"></div>
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">연락처 <span class="req">*</span></label><input class="form-inp dark" type="tel" name="phone" placeholder="010-0000-0000" required></div>
          <div class="form-row"><label class="form-lbl" style="color:var(--g3);">문의 내용</label><textarea class="form-ta dark" name="message" placeholder="문의하실 내용을 입력해주세요." rows="4"></textarea></div>
          <div class="form-chk"><input type="checkbox" id="intPriv" required><label class="form-chk-lbl light" for="intPriv">개인정보처리방침 및 수집·이용에 동의합니다.</label><button type="button" class="terms-view-btn terms-view-btn-light" onclick="intTermsOpen()">보기</button></div>
          <button type="submit" class="form-sub gold-btn">관심고객 등록</button>
        </form>
        <div id="intRes" class="form-res"></div>
      </div>
    </div>
  </div>
</section>

<!-- 관심고객 약관 모달 -->
<div class="terms-modal-bg" id="intTermsModal" onclick="if(event.target===this)intTermsClose()">
  <div class="terms-modal">
    <div class="terms-modal-hd">
      <div class="terms-modal-ttl" id="intTermsModalTitle">개인정보처리방침 및 수집·이용 동의</div>
      <button class="terms-modal-x" onclick="intTermsClose()">&#10005;</button>
    </div>
    <div class="terms-modal-body" id="intTermsBody"><p style="color:#999;font-size:.85rem;">약관을 불러오는 중...</p></div>
    <div class="terms-modal-ft">
      <button class="terms-modal-close-btn" onclick="intTermsClose()">확인</button>
    </div>
  </div>
</div>

<!-- 관심고객 등록 완료 모달 -->
<div class="terms-modal-bg" id="intSuccessModal" onclick="if(event.target===this)intSuccessClose()">
  <div class="terms-modal" style="max-width:400px;text-align:center;">
    <div class="terms-modal-body" style="padding:24px 32px 8px;display:flex;flex-direction:column;align-items:center;gap:12px;">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:72px;height:72px;">
        <circle cx="40" cy="40" r="38" fill="#fff" stroke="var(--color-point)" stroke-width="2"/>
        <path d="M24 40l12 12 20-24" stroke="var(--color-point)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 style="margin:0 0 4px;font-size:1.15rem;">관심고객으로 등록되었습니다!</h3>
      <p style="margin:0;color:#666;font-size:.88rem;line-height:1.6;">소중한 정보를 남겨주셔서 감사합니다.<br>빠른 시간 내에 연락드리겠습니다.</p>
    </div>
    <div class="terms-modal-ft" style="border-top: 0;display: flex;justify-content: center;">
      <button class="terms-modal-close-btn" onclick="intSuccessClose()">확인</button>
    </div>
  </div>
</div>

<script>
function intTermsOpen() {
  document.getElementById('intTermsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function intTermsClose() {
  document.getElementById('intTermsModal').classList.remove('open');
  document.body.style.overflow = '';
}
function intSuccessOpen() {
  document.getElementById('intSuccessModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function intSuccessClose() {
  document.getElementById('intSuccessModal').classList.remove('open');
  document.body.style.overflow = '';
}
</script>

<script>
/* ── 관심고객 폼 제출 → custom_inquiry_public.php (table: form3) ── */
var _intFormConfig = null;

/* 페이지 로드 시 form3 필드 config 미리 조회 */
(function() {
  fetch('/admin/api_front/custom_inquiry_public.php?action=config&table_name=form3')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.ok) {
        _intFormConfig = data;
        /* 약관 모달 내용 동적 주입 */
        var bodyEl = document.getElementById('intTermsBody');
        if (bodyEl && data.terms && data.terms.length > 0) {
          var html = '';
          data.terms.forEach(function(t) {
            html += '<h4>' + (t.title || t.name || '약관') + '</h4>';
            html += '<div style="white-space:pre-wrap;font-size:.85rem;line-height:1.75;color:#444;">' + (t.content || '') + '</div>';
          });
          bodyEl.innerHTML = html;
          /* 모달 타이틀도 첫 약관명으로 교체 */
          var ttlEl = document.getElementById('intTermsModalTitle');
          if (ttlEl && data.terms[0]) ttlEl.textContent = data.terms[0].title || data.terms[0].name || '개인정보 수집·이용 동의';
        } else if (bodyEl) {
          bodyEl.innerHTML = '<p style="color:#999;font-size:.85rem;">등록된 약관이 없습니다.</p>';
        }
      }
    })
    .catch(function() {});
})();

function submitInterest(e) {
  e.preventDefault();
  var f      = e.target;
  var resEl  = document.getElementById('intRes');
  var btn    = f.querySelector('[type=submit]');

  var name    = f.querySelector('[name=name]')    ? f.querySelector('[name=name]').value.trim()    : '';
  var phone   = f.querySelector('[name=phone]')   ? f.querySelector('[name=phone]').value.trim()   : '';
  var email   = f.querySelector('[name=email]')   ? f.querySelector('[name=email]').value.trim()   : '';
  var message = f.querySelector('[name=message]') ? f.querySelector('[name=message]').value.trim() : '';

  if (!name || !phone) {
    showRes(resEl, '이름과 연락처를 입력해주세요.', true);
    return;
  }

  /* config에서 field_key 매핑, 없으면 기본 키로 fallback */
  var fields = {};
  if (_intFormConfig && _intFormConfig.fields) {
    _intFormConfig.fields.forEach(function(fd) {
      var lbl = fd.label || '';
      var key = fd.field_key || '';
      /* 라벨 또는 키로 매핑 */
      if (/이름|이름|name/i.test(lbl) || /name/i.test(key))    fields[key] = name;
      else if (/연락처|전화|phone|tel/i.test(lbl) || /phone|tel/i.test(key)) fields[key] = phone;
      else if (/이메일|email/i.test(lbl) || /email/i.test(key)) fields[key] = email;
      else if (/내용|문의|message|content/i.test(lbl) || /message|content/i.test(key)) fields[key] = message;
    });
  } else {
    /* config 미로드 시 기본값으로 전송 */
    fields = { name: name, phone: phone, email: email, message: message };
  }

  if (btn) { btn.disabled = true; btn.textContent = '등록 중...'; }

  fetch('/admin/api_front/custom_inquiry_public.php?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      table_name: 'form3',
      fields: fields
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.ok) {
      f.reset();
      intSuccessOpen();
    } else {
      showRes(resEl, data.msg || '등록 중 오류가 발생했습니다.', true);
    }
  })
  .catch(function() {
    showRes(resEl, '네트워크 오류가 발생했습니다. 다시 시도해주세요.', true);
  })
  .finally(function() {
    if (btn) { btn.disabled = false; btn.textContent = '관심고객 등록'; }
  });
}

function showRes(el, msg, isErr) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = isErr ? '#e53e3e' : '#22863a';
  el.style.marginTop = '12px';
  el.style.fontSize = '.88rem';
}
</script>