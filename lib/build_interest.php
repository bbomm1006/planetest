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
        <?php
        try {
          $_intPhone = $pdo->query("SELECT phone FROM homepage_info WHERE id=1")->fetchColumn();
        } catch(Exception $e) {
          $_intPhone = '';
        }
        ?>

        <?php
        try {
          $site = $pdo->query("SELECT phone, hours1, hours2 FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
          $site = [];
        }
        ?>

        <?php if (!empty($site['phone'])): ?>
        <div class="interest-contact">
          <div class="interest-contact-lbl">분양 문의</div>
          <div class="interest-contact-ph">
            <?= htmlspecialchars($site['phone'], ENT_QUOTES, 'UTF-8') ?>
          </div>
          <div class="interest-contact-info">
            <?= htmlspecialchars($site['hours1'] ?? '', ENT_QUOTES, 'UTF-8') ?>
            <?php if (!empty($site['hours1']) && !empty($site['hours2'])): ?>
              &nbsp;|&nbsp;
            <?php endif; ?>
            <?= htmlspecialchars($site['hours2'] ?? '', ENT_QUOTES, 'UTF-8') ?>
          </div>
        </div>
        <?php endif; ?>

      </div>
      <div>
        <form id="intForm" onsubmit="submitInterest(event)">
          <div id="intFieldsWrap"><!-- 필드: JS에서 동적 렌더링 --></div>
          <div id="intTermsWrap"><!-- 약관 체크박스: JS에서 동적 렌더링 --></div>
          <button type="submit" class="form-sub gold-btn" id="intSubmitBtn">관심고객 등록</button>
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
/* ── 관심고객 폼 (form3) – config API 완전 연동 버전 ── */
var _intFormConfig = null;

/* ── 필드 타입 → input HTML 생성 ── */
function _intBuildField(fd) {
  var key  = fd.field_key || '';
  var lbl  = fd.label || '';
  var type = fd.type  || 'text';
  var ph   = fd.placeholder || '';
  var req  = fd.is_required == 1;
  var reqMark = req ? ' <span class="req">*</span>' : '';
  var reqAttr = req ? ' required' : '';

  var inputHtml = '';
  if (type === 'textarea') {
    inputHtml = '<textarea class="form-ta dark" name="' + key + '" placeholder="' + ph + '" rows="4"' + reqAttr + '></textarea>';
  } else if (type === 'select') {
    var opts = '<option value="">선택해주세요</option>';
    (fd.options || []).forEach(function(o) { opts += '<option value="' + o + '">' + o + '</option>'; });
    inputHtml = '<select class="form-inp dark" name="' + key + '"' + reqAttr + '>' + opts + '</select>';
  } else if (type === 'radio' || type === 'checkbox') {
    var items = '';
    (fd.options || []).forEach(function(o, i) {
      items += '<label style="display:inline-flex;align-items:center;gap:6px;margin-right:14px;">'
             + '<input type="' + type + '" name="' + key + '" value="' + o + '"' + (i===0 && req ? ' required' : '') + '> ' + o + '</label>';
    });
    inputHtml = '<div class="form-check-group">' + items + '</div>';
  } else {
    /* text / email / tel / number / date 등 */
    var inputType = (['email','tel','number','date','password'].indexOf(type) >= 0) ? type : 'text';
    inputHtml = '<input class="form-inp dark" type="' + inputType + '" name="' + key + '" placeholder="' + ph + '"' + reqAttr + '>';
  }

  return '<div class="form-row"><label class="form-lbl" style="color:var(--g3);">' + lbl + reqMark + '</label>' + inputHtml + '</div>';
}

/* ── 약관 체크박스 렌더링 ── */
function _intRenderTerms(terms) {
  var wrap = document.getElementById('intTermsWrap');
  if (!wrap) return;
  if (!terms || terms.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  var html = '';
  terms.forEach(function(t, i) {
    var tid  = 'intTerm_' + i;
    var name = t.title || t.name || '약관';
    html += '<div class="form-chk">'
          + '<input type="checkbox" id="' + tid + '" data-term-id="' + (t.id || i) + '" required>'
          + '<label class="form-chk-lbl light" for="' + tid + '">' + name + '</label>'
          + '<button type="button" class="terms-view-btn terms-view-btn-light" onclick="intTermsOpen(' + i + ')">보기</button>'
          + '</div>';
  });
  wrap.innerHTML = html;
}

/* ── 약관 모달 열기 (인덱스 기반) ── */
function intTermsOpen(idx) {
  idx = idx || 0;
  var terms = _intFormConfig && _intFormConfig.terms ? _intFormConfig.terms : [];
  var t = terms[idx] || terms[0];
  if (t) {
    var ttlEl  = document.getElementById('intTermsModalTitle');
    var bodyEl = document.getElementById('intTermsBody');
    if (ttlEl)  ttlEl.textContent  = t.title || t.name || '약관';
    if (bodyEl) bodyEl.innerHTML   = '<div style="white-space:pre-wrap;font-size:.85rem;line-height:1.75;color:#444;">' + (t.content || '') + '</div>';
  }
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

/* ── config 로드 → 필드·약관·버튼 렌더링 ── */
(function() {
  fetch('/admin/api_front/custom_inquiry_public.php?action=config&table_name=form3')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.ok) return;
      _intFormConfig = data;

      /* 필드 렌더링 */
      var fieldsWrap = document.getElementById('intFieldsWrap');
      if (fieldsWrap && data.fields && data.fields.length) {
        fieldsWrap.innerHTML = data.fields.map(_intBuildField).join('');
      }

      /* 약관 체크박스 렌더링 */
      _intRenderTerms(data.terms);

      /* 버튼명 반영 */
      var btn = document.getElementById('intSubmitBtn');
      if (btn && data.form && data.form.btn_name) {
        btn.textContent = data.form.btn_name;
      }
    })
    .catch(function() {});
})();

/* ── 폼 제출 ── */
function submitInterest(e) {
  e.preventDefault();
  var f     = e.target;
  var resEl = document.getElementById('intRes');
  var btn   = document.getElementById('intSubmitBtn');

  /* 필드값 수집 */
  var fields = {};
  if (_intFormConfig && _intFormConfig.fields) {
    _intFormConfig.fields.forEach(function(fd) {
      var key  = fd.field_key;
      var type = fd.type || 'text';
      if (type === 'checkbox') {
        var checked = Array.from(f.querySelectorAll('[name="' + key + '"]:checked')).map(function(el){ return el.value; });
        fields[key] = checked.join(',');
      } else {
        var el = f.querySelector('[name="' + key + '"]');
        fields[key] = el ? el.value.trim() : '';
      }
    });
  } else {
    /* config 미로드 시 fallback */
    f.querySelectorAll('[name]').forEach(function(el) {
      if (el.name) fields[el.name] = el.value.trim();
    });
  }

  if (btn) { btn.disabled = true; btn.textContent = '등록 중...'; }

  fetch('/admin/api_front/custom_inquiry_public.php?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_name: 'form3', fields: fields })
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
    var btnFinal = document.getElementById('intSubmitBtn');
    if (btnFinal) {
      btnFinal.disabled = false;
      btnFinal.textContent = (_intFormConfig && _intFormConfig.form && _intFormConfig.form.btn_name)
        ? _intFormConfig.form.btn_name : '관심고객 등록';
    }
  });
}

function showRes(el, msg, isErr) {
  if (!el) return;
  el.textContent    = msg;
  el.style.color    = isErr ? '#e53e3e' : '#22863a';
  el.style.marginTop = '12px';
  el.style.fontSize  = '.88rem';
}
</script>