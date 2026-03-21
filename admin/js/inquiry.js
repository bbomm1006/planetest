/* ═══════════════════════════════════════
   inquiry.js — 상담 신청 폼 & 이메일 모달
═══════════════════════════════════════ */

var _consultConfig = {};
var _consultFields = [];

/* ─── 폼 설정 로드 ─── */
function loadConsultForm() {
  fetch('/admin/api_front/consult_public.php?action=config')
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (!res.ok) return;
      _consultConfig = res.config || {};
      _consultFields = res.fields || [];
      var terms = res.terms || {};

      // 타이틀/설명
      var t  = document.getElementById('inqTitle');
      var d  = document.getElementById('inqDesc');
      var d2 = document.getElementById('inqDesc2');
      if (t)  t.textContent  = _consultConfig.title        || '';
      if (d)  d.textContent  = _consultConfig.description  || '';
      if (d2) d2.textContent = _consultConfig.description2 || '';

      // 제품분류/제품명 표시여부
      var useProduct = +(_consultConfig.use_product || 0);
      var bw = document.getElementById('fBrandWrap');
      var pw = document.getElementById('fProductWrap');
      if (bw) bw.style.display = useProduct ? '' : 'none';
      if (pw) pw.style.display = useProduct ? '' : 'none';

      // 추가 필드 렌더링
      renderExtraFields(_consultFields);

      // 약관
      var tw = document.getElementById('fTermsWrap');
      if (tw) tw.style.display = (terms.term_name || terms.term_body) ? '' : 'none';
      var tb = document.getElementById('fTermsBody');
      var tn = document.getElementById('fTermsName');
      if (tb) tb.textContent = terms.term_body  || '';
      if (tn) tn.textContent = (terms.term_name || '개인정보 수집 및 이용에 동의합니다') + ' (필수)';
    }).catch(function() {});
}

/* ─── 추가 필드 렌더링 ─── */
function renderExtraFields(fields) {
  var wrap = document.getElementById('fExtraFields');
  if (!wrap) return;
  wrap.innerHTML = fields.map(function(f) {
    var id = 'f-extra-' + f.id;
    var label = '<label class="fl">' + esc(f.field_name) + '</label>';
    var input = '';
    if (f.field_type === 'input') {
      input = '<input class="fi" type="text" id="' + id + '" placeholder="' + esc(f.placeholder || '') + '">';
    } else if (f.field_type === 'textarea') {
      input = '<textarea class="fta" id="' + id + '" placeholder="' + esc(f.placeholder || '') + '"></textarea>';
    } else if (f.field_type === 'select') {
      var opts = (f.options || '').split('\n').filter(function(o) { return o.trim(); });
      input = '<select class="fs" id="' + id + '"><option value="">선택하세요</option>'
        + opts.map(function(o) { return '<option value="' + esc(o.trim()) + '">' + esc(o.trim()) + '</option>'; }).join('')
        + '</select>';
    } else if (f.field_type === 'radio') {
      var opts = (f.options || '').split('\n').filter(function(o) { return o.trim(); });
      input = '<div class="time-slots">'
        + opts.map(function(o, idx) {
            var oid = id + '-' + idx;
            return '<div class="fts" id="' + oid + '" onclick="selectExtraRadio(\'' + id + '\',' + idx + ',\'' + esc(o.trim()) + '\')">'
              + '<div class="fts-dot"></div>'
              + '<span class="fts-lbl">' + esc(o.trim()) + '</span>'
              + '</div>';
          }).join('') + '</div>'
        + '<input type="hidden" id="' + id + '" value="">';
    } else if (f.field_type === 'check') {
      var opts = (f.options || '').split('\n').filter(function(o) { return o.trim(); });
      input = '<div class="time-slots">'
        + opts.map(function(o, idx) {
            var oid = id + '-' + idx;
            return '<div class="fts fts-check" id="' + oid + '" onclick="toggleExtraCheck(\'' + id + '\',' + idx + ',\'' + esc(o.trim()) + '\')">'
              + '<div class="fts-dot"></div>'
              + '<span class="fts-lbl">' + esc(o.trim()) + '</span>'
              + '</div>';
          }).join('') + '</div>';
    }
    return '<div class="fg s2">' + label + input + '</div>';
  }).join('');
}

/* ─── 추가 필드 값 수집 ─── */
function getExtraFieldValues() {
  var result = [];
  _consultFields.forEach(function(f) {
    var id = 'f-extra-' + f.id;
    var val = '';
    if (f.field_type === 'radio') {
      var hidden = document.getElementById(id);
      val = hidden ? hidden.value : '';
    } else if (f.field_type === 'check') {
      var checked = document.querySelectorAll('[id^="' + id + '-"].checked');
      val = Array.from(checked).map(function(el) {
        return el.querySelector('.fts-lbl').textContent;
      }).join(', ');
    } else {
      var el = document.getElementById(id);
      val = el ? el.value.trim() : '';
    }
    result.push({ field_name: f.field_name, field_type: f.field_type, value: val });
  });
  return result;
}

/* ─── 셀렉트 동기화 (products.js에서 호출) ─── */
function syncInqSelects(data) {
  syncBrandSelect(data);
}

function syncBrandSelect(data) {
  var cats = (data.categories || []).filter(function(c) { return c.active; });
  var brandSel = document.getElementById('f-brand');
  if (brandSel) brandSel.innerHTML = '<option value="">분류 선택</option>'
    + cats.map(function(c) {
        return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
      }).join('');
  var prodSel = document.getElementById('f-product');
  if (prodSel) prodSel.innerHTML = '<option value="">제품 선택 (분류 먼저 선택)</option>';
}

function onBrandChange() {
  var catId = document.getElementById('f-brand').value;
  var prods = (_pbData.products || []).filter(function(p) {
    return p.active && (!catId || p.categoryId === catId);
  });
  var sel = document.getElementById('f-product');
  if (sel) sel.innerHTML = '<option value="">제품 선택</option>'
    + prods.map(function(p) {
        return '<option value="' + p.id + '">' + esc(p.name) + '</option>';
      }).join('');
  showProdInfo(null);
}

function onProdChange() {
  var pid = document.getElementById('f-product').value;
  var p = pid ? (allProds || []).find(function(x) { return x.id === pid; }) : null;
  showProdInfo(p || null);
}

function showProdInfo(p) {
  var box = document.getElementById('fProdInfo');
  if (!box) return;
  if (!p) { box.style.display = 'none'; return; }
  box.style.display = 'flex';
  box.innerHTML = '<div style="display:flex;align-items:center;gap:11px;width:100%">'
    + '<div style="width:40px;height:40px;border-radius:9px;background:' + esc(p.bgColor || '#dbeeff') + ';display:grid;place-items:center;flex-shrink:0;overflow:hidden">'
    + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" style="width:100%;height:100%;object-fit:cover">' : '<span style="font-size:1.1rem">💧</span>')
    + '</div>'
    + '<div style="flex:1;min-width:0"><div style="font-size:.68rem;color:var(--g5)">선택 제품</div>'
    + '<div style="font-weight:700;font-size:.87rem">' + esc(p.name) + '</div></div>'
    + '<div style="text-align:right;flex-shrink:0">'
    + '<div style="font-size:1rem;font-weight:900;color:var(--blue)">' + comma(p.priceMonthly || 0)
    + '<span style="font-size:.66rem;font-weight:500">원/월</span></div>'
    + (p.priceOriginal ? '<div style="font-size:.68rem;color:var(--g4);text-decoration:line-through">' + comma(p.priceOriginal) + '원</div>' : '')
    + '</div></div>';
}

function applyProdToForm(prodId) {
  var p = (allProds || []).find(function(x) { return x.id === prodId; });
  goto('#inquiry');
  setTimeout(function() {
    if (!p) return;
    var bSel = document.getElementById('f-brand');
    if (bSel) { bSel.value = p.categoryId || ''; onBrandChange(); }
    setTimeout(function() {
      var pSel = document.getElementById('f-product');
      if (pSel) { pSel.value = prodId; showProdInfo(p); }
    }, 100);
  }, 400);
}

/* ─── 상담 신청 제출 ─── */
function submitForm() {
  var n  = document.getElementById('f-name').value.trim();
  var ph = document.getElementById('f-phone').value.trim();

  if (!n || !ph) {
    alert('필수 항목(이름·연락처)을 모두 입력해주세요.');
    return;
  }
  if (!document.getElementById('f-priv').checked) {
    alert('개인정보 수집·이용에 동의해주세요.');
    return;
  }

  var bSel = document.getElementById('f-brand');
  var pSel = document.getElementById('f-product');
  var brandName = bSel ? (bSel.selectedOptions[0] || {}).text || '' : '';
  var prodName  = pSel ? (pSel.selectedOptions[0] || {}).text || '' : '';

  var _inqPayload = {
    name:        n,
    phone:       ph,
    brandId:     bSel ? bSel.value : '',
    brandName:   brandName,
    productId:   pSel ? pSel.value : '',
    productName: prodName,
    extraFields: getExtraFieldValues(),
    status:      '접수'
  };

  fetch('/admin/api_front/consult_public.php?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(_inqPayload)
  }).then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.ok) {
        window._lastInqData = _inqPayload;
        document.getElementById('frontEmlBody').style.display = 'block';
        document.getElementById('frontEmlDone').style.display = 'none';
        document.getElementById('frontEmlAddr').value = '';
        document.getElementById('fContent').style.display = 'none';
        document.getElementById('fOk').style.display = 'block';
      } else {
        alert('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }).catch(function() { alert('네트워크 오류가 발생했습니다. 다시 시도해 주세요.'); });
}

/* ─── DOMContentLoaded ─── */
document.addEventListener('DOMContentLoaded', function() {
  var fPhone = document.getElementById('f-phone');
  if (fPhone) fPhone.addEventListener('input', function() { fmtPhone(this); });
});

/* ─── 이메일 모달 ─── */
var _frontEmlType = null;

function openFrontEml(type) {
  _frontEmlType = type;
  var bg = document.getElementById('frontEmlBg');
  var summaryEl = document.getElementById('frontEmlSummary');
  document.getElementById('frontEmlAddr').value = '';
  document.getElementById('frontEmlBody').style.display = 'block';
  document.getElementById('frontEmlDone').style.display = 'none';

  if (type === 'inq') {
    var last = window._lastInqData || {};
    summaryEl.innerHTML = '<b>' + esc(last.name || '') + '</b>님 상담 신청'
      + (last.productName ? '<br>제품: ' + esc(last.productName) : '');
  } else if (type === 'combo') {
    var last = window._lastComboData || {};
    summaryEl.innerHTML = '<b>' + esc(last.name || '') + '</b>님 결합 신청<br>제품: ' + esc(last.productName || '')
      + '<br>최종 납부: <b>' + (last.finalPrice ? (+last.finalPrice).toLocaleString('ko-KR') : '0') + '원/월</b>';
  } else if (type === 'cmp') {
    var prods = window._cmpProds || [];
    summaryEl.innerHTML = '비교 제품: ' + prods.map(function(p) { return '<b>' + esc(p.name) + '</b>'; }).join(' vs ');
  }

  bg.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFrontEml() {
  document.getElementById('frontEmlBg').style.display = 'none';
  document.body.style.overflow = '';
  _frontEmlType = null;
}

function sendFrontEml() {
  var addr = (document.getElementById('frontEmlAddr').value || '').trim();
  if (!addr || addr.indexOf('@') < 0) { alert('이메일 주소를 올바르게 입력하세요.'); return; }

  var subj, body;
  } else if (_frontEmlType === 'inq') {
    var last = window._lastInqData || {};
    var sn = (window._pbData && window._pbData.siteTitle) ? window._pbData.siteTitle : 'PureBlue';
    subj = '[' + sn + '] ' + (last.name || '') + '님 상담 신청 완료 안내';
    body = '안녕하세요, ' + (last.name || '') + '님.\n\n' + sn + ' 상담 신청이 정상적으로 접수되었습니다.\n\n'
      + (last.brandName && last.brandName !== '분류 선택' ? '■ 분류: ' + last.brandName + '\n' : '')
      + (last.productName && last.productName !== '제품 선택' ? '■ 관심 제품: ' + last.productName + '\n' : '')
      + (last.extraFields && last.extraFields.length
          ? last.extraFields.filter(function(f) { return f.value; })
              .map(function(f) { return '■ ' + f.field_name + ': ' + f.value; }).join('\n') + '\n'
          : '')
      + '\n빠른 시간 내에 전문 상담사가 연락드립니다 (평균 30분 이내).\n감사합니다.\n\n' + sn + ' 고객센터';
  } else if (_frontEmlType === 'combo') {
    var last = window._lastComboData || {};
    var sn = (window._pbData && window._pbData.siteTitle) ? window._pbData.siteTitle : 'PureBlue';
    subj = '[' + sn + '] ' + (last.name || '') + '님 결합 신청 완료 안내';
    body = '안녕하세요, ' + (last.name || '') + '님.\n\n' + sn + ' 결합 할인 신청이 정상적으로 접수되었습니다.\n\n'
      + '■ 신청 제품: ' + (last.productName || '') + '\n■ 결합 할인: 10%\n'
      + ((last.cardDiscount || 0) > 0 ? '■ 카드사 할인: ' + (last.cardDiscountName || '') + '\n' : '')
      + '■ 최종 월 납부액: ' + ((+last.finalPrice || 0).toLocaleString('ko-KR')) + '원/월\n'
      + '\n빠른 시간 내에 전문 상담사가 연락드립니다.\n감사합니다.\n\n' + sn + ' 고객센터';
  } else if (_frontEmlType === 'cmp') {
    var prods = window._cmpProds || [];
    var sn = (window._pbData && window._pbData.siteTitle) ? window._pbData.siteTitle : 'PureBlue';
    subj = '[' + sn + '] 제품 비교 내역 안내';
    body = '안녕하세요.\n\n' + sn + ' 제품 비교 내역을 안내드립니다.\n\n'
      + prods.map(function(p) {
          var specLines = (p.specs || []).map(function(s) {
            return '    · ' + s[0] + ': ' + (s[1] || '—');
          }).join('\n');
          return '■ ' + p.name + ' (' + (p.model || '') + ')\n'
            + '  월 렌탈: ' + (+p.priceMonthly || 0).toLocaleString('ko-KR') + '원/월\n'
            + (specLines ? '  [스팩]\n' + specLines + '\n' : '')
            + ((p.features || []).length ? '  특징: ' + p.features.join(', ') : '');
        }).join('\n\n')
      + '\n\n감사합니다.\n\n' + sn + ' 고객센터';
  }
}

function _doSendEml(addr, subj, body) {
  var btn = document.querySelector('#frontEmlBg button[onclick="sendFrontEml()"]');
  if (btn) { btn.disabled = true; btn.textContent = '전송 중...'; }
  fetch('/admin/api_front/send_email.php', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: addr, subject: subj, body: body })
  }).then(function(r) { return r.json(); })
    .then(function(res) {
      document.getElementById('frontEmlBody').style.display = 'none';
      document.getElementById('frontEmlDone').style.display = 'block';
      document.getElementById('frontEmlDoneAddr').textContent = res.ok
        ? addr + '으로 발송되었습니다.'
        : '발송 실패: ' + (res.error || '다시 시도해주세요');
    }).catch(function() {
      document.getElementById('frontEmlBody').style.display = 'none';
      document.getElementById('frontEmlDone').style.display = 'block';
      document.getElementById('frontEmlDoneAddr').textContent = '네트워크 오류. 다시 시도해주세요.';
    }).finally(function() {
      if (btn) { btn.disabled = false; btn.textContent = '이메일 전송'; }
    });
}

function selectExtraRadio(fieldId, idx, val) {
  document.querySelectorAll('[id^="' + fieldId + '-"]').forEach(function(el) {
    el.classList.remove('checked');
  });
  var el = document.getElementById(fieldId + '-' + idx);
  if (el) el.classList.add('checked');
  var hidden = document.getElementById(fieldId);
  if (hidden) hidden.value = val;
}

function toggleExtraCheck(fieldId, idx, val) {
  var el = document.getElementById(fieldId + '-' + idx);
  if (el) el.classList.toggle('checked');
}