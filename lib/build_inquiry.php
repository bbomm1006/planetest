<section class="sec sec-white" id="sec-inquiry">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">Inquiry</span></div>
      <h2 class="sec-ttl sec-ttl-dark">문의하기</h2>
    </div>
    <div class="inq-layout">
      <div>
        <form id="inqForm" onsubmit="submitInq(event)">
          <div id="inqFieldsWrap"><!-- 필드: JS에서 동적 렌더링 --></div>
          <div id="inqTermsWrap"><!-- 약관 체크박스: JS에서 동적 렌더링 --></div>
          <button type="submit" class="form-sub" id="inqSubmitBtn">문의 접수</button>
        </form>
        <div id="inqRes" class="form-res"></div>
      </div>
      <div>

        <?php
        try {
          $site = $pdo->query("SELECT phone, hours1, hours2 FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
          $site = [];
        }
        ?>

        <?php if (!empty($site['phone'])): ?>

        <div class="inq-side-card" style="background:var(--br6);border-color:var(--ln);">
          <div class="inq-side-lbl" style="color:var(--br);">Contact</div>
          <div class="inq-side-ph" style="color:var(--bk);"> <?= htmlspecialchars($site['phone'], ENT_QUOTES, 'UTF-8') ?></div>
          <div class="inq-side-txt" style="color:var(--g5);">
            <?= htmlspecialchars($site['hours1'] ?? '', ENT_QUOTES, 'UTF-8') ?>
            <?php if (!empty($site['hours1']) && !empty($site['hours2'])): ?>
              <br>
            <?php endif; ?>
            <?= htmlspecialchars($site['hours2'] ?? '', ENT_QUOTES, 'UTF-8') ?>
          </div>
        </div>
        <?php endif; ?>

        <div class="inq-quick" style="background:var(--bk);padding:20px 24px;">
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
      <div class="terms-modal-ttl" id="inqTermsModalTitle">개인정보 수집 및 이용 동의</div>
      <button class="terms-modal-x" onclick="inqTermsClose()">&#10005;</button>
    </div>
    <div class="terms-modal-body" id="inqTermsBody"><p style="color:#999;font-size:.85rem;">약관을 불러오는 중...</p></div>
    <div class="terms-modal-ft">
      <button class="terms-modal-close-btn" onclick="inqTermsClose()">확인</button>
    </div>
  </div>
</div>

<!-- 문의 접수 완료 모달 -->
<div class="terms-modal-bg" id="inqSuccessModal" onclick="if(event.target===this)inqSuccessClose()">
  <div class="terms-modal" style="max-width:400px;text-align:center;">
    <div class="terms-modal-body" style="padding:24px 32px 8px;display:flex;flex-direction:column;align-items:center;gap:12px;">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:72px;height:72px;">
        <circle cx="40" cy="40" r="38" fill="#fff" stroke="var(--color-point)" stroke-width="2"/>
        <path d="M24 40l12 12 20-24" stroke="var(--color-point)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 style="margin:0 0 4px;font-size:1.15rem;">문의가 접수되었습니다!</h3>
      <p style="margin:0;color:#666;font-size:.88rem;line-height:1.6;">담당자가 확인 후 빠른 시간 내에 연락드리겠습니다.</p>
    </div>
    <div class="terms-modal-ft" style="border-top:0;display:flex;justify-content:center;">
      <button class="terms-modal-close-btn" onclick="inqSuccessClose()">확인</button>
    </div>
  </div>
</div>

<script>
/* ── 문의하기 폼 (form2) – config API 완전 연동 ── */
var _inqFormConfig = null;

/* ── 필드 타입 → input HTML 생성 ── */
function _inqBuildField(fd) {
  var key  = fd.field_key || '';
  var lbl  = fd.label     || '';
  var type = fd.type      || 'text';
  var ph   = fd.placeholder || '';
  var req  = fd.is_required == 1;
  var reqMark = req ? ' <span class="req">*</span>' : '';
  var reqAttr = req ? ' required' : '';

  var inputHtml = '';
  if (type === 'textarea') {
    inputHtml = '<textarea class="form-ta" name="' + key + '" placeholder="' + ph + '" rows="5"' + reqAttr + '></textarea>';
  } else if (type === 'select') {
    var opts = '<option value="">선택해주세요</option>';
    (fd.options || []).forEach(function(o) { opts += '<option value="' + o + '">' + o + '</option>'; });
    inputHtml = '<select class="form-inp" name="' + key + '"' + reqAttr + '>' + opts + '</select>';
  } else if (type === 'radio' || type === 'checkbox') {
    var items = '';
    (fd.options || []).forEach(function(o, i) {
      items += '<label style="display:inline-flex;align-items:center;gap:6px;margin-right:14px;">'
             + '<input type="' + type + '" name="' + key + '" value="' + o + '"' + (i === 0 && req ? ' required' : '') + '> ' + o + '</label>';
    });
    inputHtml = '<div class="form-check-group">' + items + '</div>';
  } else {
    var inputType = (['email','tel','number','date','password'].indexOf(type) >= 0) ? type : 'text';
    inputHtml = '<input class="form-inp" type="' + inputType + '" name="' + key + '" placeholder="' + ph + '"' + reqAttr + '>';
  }

  return '<div class="form-row"><label class="form-lbl">' + lbl + reqMark + '</label>' + inputHtml + '</div>';
}

/* ── 약관 체크박스 렌더링 ── */
function _inqRenderTerms(terms) {
  var wrap = document.getElementById('inqTermsWrap');
  if (!wrap) return;
  if (!terms || terms.length === 0) { wrap.innerHTML = ''; return; }
  var html = '';
  terms.forEach(function(t, i) {
    var tid  = 'inqTerm_' + i;
    var name = t.title || t.name || '약관';
    html += '<div class="form-chk">'
          + '<input type="checkbox" id="' + tid + '" data-term-id="' + (t.id || i) + '" required>'
          + '<label class="form-chk-lbl" for="' + tid + '">' + name + '</label>'
          + '<button type="button" class="terms-view-btn" onclick="inqTermsOpen(' + i + ')">보기</button>'
          + '</div>';
  });
  wrap.innerHTML = html;
}

/* ── 약관 모달 ── */
function inqTermsOpen(idx) {
  idx = idx || 0;
  var terms = _inqFormConfig && _inqFormConfig.terms ? _inqFormConfig.terms : [];
  var t = terms[idx] || terms[0];
  if (t) {
    var ttlEl  = document.getElementById('inqTermsModalTitle');
    var bodyEl = document.getElementById('inqTermsBody');
    if (ttlEl)  ttlEl.textContent = t.title || t.name || '약관';
    if (bodyEl) bodyEl.innerHTML  = '<div style="white-space:pre-wrap;font-size:.85rem;line-height:1.75;color:#444;">' + (t.content || '') + '</div>';
  }
  document.getElementById('inqTermsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function inqTermsClose() {
  document.getElementById('inqTermsModal').classList.remove('open');
  document.body.style.overflow = '';
}
function inqSuccessOpen() {
  document.getElementById('inqSuccessModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function inqSuccessClose() {
  document.getElementById('inqSuccessModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── config 로드 → 필드·약관·버튼 렌더링 ── */
(function () {
  fetch('/admin/api_front/custom_inquiry_public.php?action=config&table_name=form2')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.ok) return;
      _inqFormConfig = data;

      /* 필드 렌더링 */
      var fieldsWrap = document.getElementById('inqFieldsWrap');
      if (fieldsWrap && data.fields && data.fields.length) {
        fieldsWrap.innerHTML = data.fields.map(_inqBuildField).join('');
      }

      /* 약관 렌더링 */
      _inqRenderTerms(data.terms);

      /* 버튼명 */
      var btn = document.getElementById('inqSubmitBtn');
      if (btn && data.form && data.form.btn_name) {
        btn.textContent = data.form.btn_name;
      }
    })
    .catch(function() {});
})();

/* ── 폼 제출 ── */
function submitInq(e) {
  e.preventDefault();
  var f     = e.target;
  var resEl = document.getElementById('inqRes');
  var btn   = document.getElementById('inqSubmitBtn');

  /* 필드값 수집 */
  var fields = {};
  if (_inqFormConfig && _inqFormConfig.fields) {
    _inqFormConfig.fields.forEach(function(fd) {
      var key  = fd.field_key;
      var type = fd.type || 'text';
      if (type === 'checkbox') {
        var checked = Array.from(f.querySelectorAll('[name="' + key + '"]:checked')).map(function(el) { return el.value; });
        fields[key] = checked.join(',');
      } else {
        var el = f.querySelector('[name="' + key + '"]');
        fields[key] = el ? el.value.trim() : '';
      }
    });
  } else {
    f.querySelectorAll('[name]').forEach(function(el) {
      if (el.name) fields[el.name] = el.value.trim();
    });
  }

  if (btn) { btn.disabled = true; btn.textContent = '접수 중...'; }

  fetch('/admin/api_front/custom_inquiry_public.php?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_name: 'form2', fields: fields })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.ok) {
      f.reset();
      inqSuccessOpen();
    } else {
      _inqShowRes(resEl, data.msg || '접수 중 오류가 발생했습니다.', true);
    }
  })
  .catch(function() {
    _inqShowRes(resEl, '네트워크 오류가 발생했습니다. 다시 시도해주세요.', true);
  })
  .finally(function() {
    var btnFinal = document.getElementById('inqSubmitBtn');
    if (btnFinal) {
      btnFinal.disabled    = false;
      btnFinal.textContent = (_inqFormConfig && _inqFormConfig.form && _inqFormConfig.form.btn_name)
        ? _inqFormConfig.form.btn_name : '문의 접수';
    }
  });
}

function _inqShowRes(el, msg, isErr) {
  if (!el) return;
  el.textContent     = msg;
  el.style.color     = isErr ? '#e53e3e' : '#22863a';
  el.style.marginTop = '12px';
  el.style.fontSize  = '.88rem';
}
</script>