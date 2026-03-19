/* ═══════════════════════════════════════
   products.js — 제품 목록 / 필터 / 제품 모달 /
                 비교 / 콤보 할인 계산기
═══════════════════════════════════════ */

/* ── 스크롤 잠금 유틸 (iOS Safari 포함) ─────────────── */
function _lockScroll() {
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}
function _unlockScroll() {
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
}
var allProds = [], curCat = 'all', cmpIds = [];
var cardDisc = 0, cardDiscName = '없음';

/* ─── 분류 ─── */
function renderProducts(data) {
  var cats = (data.categories || [])
    .filter(function (c) { return c.active; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  allProds = (data.products || []).filter(function (p) { return p.active; });

  var te = document.getElementById('catTabs');
  te.innerHTML = '<button class="ct' + (curCat === 'all' ? ' on' : '') + '" onclick="filterCat(\'all\')">전체</button>'
    + cats.map(function (c) {
      return '<button class="ct' + (curCat === c.id ? ' on' : '') + '" onclick="filterCat(\'' + c.id + '\')">' + esc(c.name) + '</button>';
    }).join('');

  var sel = document.getElementById('catSelect');
  if (sel) {
    sel.innerHTML = '<option value="all">전체</option>'
      + cats.map(function (c) { return '<option value="' + esc(c.id) + '"' + (curCat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('');
  }

  renderPG();
  syncInqSelects(data);
}

function renderPG() {
  var filtered = curCat === 'all' ? allProds : allProds.filter(function (p) { return p.categoryId === curCat; });
  var ge = document.getElementById('pg');

  if (!filtered.length) {
    ge.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px;color:var(--g4)">해당 분류 제품이 없습니다.</p>';
    return;
  }

  ge.innerHTML = filtered.map(function (p) {
    var img = p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="' + esc(p.name) + '">' : '<div class="pc-no-img">💧</div>';
    var tags = (p.features || []).slice(0, 4).map(function (f) { return '<span class="pc-tag">' + esc(f) + '</span>'; }).join('');
    var checked = cmpIds.indexOf(p.id) > -1;
    var disc = calcDisc(p.priceMonthly, p.priceOriginal);
    var discBadge = disc > 0 ? '<span class="pc-disc-badge">' + disc + '% 할인</span>' : '';
    var pid = p.id;

    return '<div class="pc fu" onclick="openPM(\'' + pid + '\')">'
      + '<div class="pc-img" style="background:' + esc(p.bgColor || '#dbeeff') + '">'
      + (p.badge ? '<span class="pc-bdg" style="background:' + esc(p.badgeColor || '#1255a6') + '">' + esc(p.badge) + '</span>' : '')
      + img
      + '<div class="pc-cmp-wrap" onclick="event.stopPropagation()"><label><input type="checkbox" id="chk-' + pid + '" ' + (checked ? 'checked' : '') + ' onchange="toggleCmp(\'' + pid + '\')"> 비교</label></div>'
      + '</div>'
      + '<div class="pc-body">'
      + '<div class="pc-mod">' + esc(p.model || '') + '</div>'
      + '<div class="pc-name">' + esc(p.name) + '</div>'
      + '<div class="pc-tags">' + tags + '</div>'
      + '<div class="pc-foot">'
      + '<div>'
      + '<div class="pc-price"><div class="pc-num">' + comma(p.priceMonthly || 0) + '</div><div class="pc-unit">원/월</div></div>'
      + (disc > 0 ? '<div class="pc-disc-wrap" style="margin-top:4px">' + discBadge + (p.priceOriginal ? '<span class="pc-disc-orig">' + comma(p.priceOriginal) + '원</span>' : '') + '</div>' : '')
      + '</div>'
      + '<div class="pc-btns"><button class="pc-btn" onclick="event.stopPropagation();applyProdToForm(\'' + pid + '\')">렌탈 신청</button><button class="pc-btn pc-btn-buy" onclick="event.stopPropagation();openPayment(\'' + pid + '\')">구매하기</button></div>'
      + '</div></div></div>';
  }).join('');

  document.querySelectorAll('.pc.fu').forEach(function (el) { fObs.observe(el); });
  updateCmpBar();
}

function filterCat(id) {
  curCat = id;
  document.querySelectorAll('#catTabs .ct').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('onclick').indexOf("'" + id + "'") > -1);
  });
  var sel = document.getElementById('catSelect');
  if (sel) sel.value = id;
  renderPG();
}

/* ─── 제품 상세 모달 ─── */
function openPM(id) {
  var p = allProds.find(function (x) { return x.id === id; });
  if (!p) return;
  var pid = p.id;

  document.getElementById('pmTitle').textContent = p.name;
  var img = p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="' + esc(p.name) + '">' : '<span style="font-size:5rem">💧</span>';
  var specs = (p.specs || []).map(function (s) { return '<tr><td>' + esc(s[0]) + '</td><td>' + esc(s[1] || '') + '</td></tr>'; }).join('');
  var disc = calcDisc(p.priceMonthly, p.priceOriginal);
  var discBadge = disc > 0 ? '<span class="pm-disc-badge">' + disc + '% 할인</span>' : '';

  document.getElementById('pmBody').innerHTML =
    '<div class="pmimg" style="background:' + esc(p.bgColor || '#dbeeff') + '">'
    + (p.badge ? '<span class="pm-bdg" style="background:' + esc(p.badgeColor || '#1255a6') + '">' + esc(p.badge) + '</span>' : '')
    + img + '</div>'
    + '<div class="pminf"><div class="pm-mod">' + esc(p.model || '') + '</div><div class="pm-name">' + esc(p.name) + '</div>'
    + (disc > 0 ? '<div class="pm-disc-wrap">' + discBadge + (p.priceOriginal ? '<span class="pm-disc-orig-label">정가 ' + comma(p.priceOriginal) + '원</span>' : '') + '</div>' : '')
    + '<div class="pm-pr"><div class="pm-num">' + comma(p.priceMonthly || 0) + '</div><div class="pm-unit">원/월</div></div>'
    + '<div class="pm-tags">' + ((p.features || []).map(function (f) { return '<span class="pm-tag">' + esc(f) + '</span>'; }).join('')) + '</div>'
    + '<div class="pm-desc">' + esc(p.descLong || p.description || '') + '</div>'
    + (specs ? '<table class="pm-specs">' + specs + '</table>' : '')
    + '</div>';

  var pmFoot = document.getElementById('pmFoot');
  pmFoot.innerHTML = '';

  var cmpBtn2 = document.createElement('button');
  cmpBtn2.className = 'mbt mbt-g';
  cmpBtn2.textContent = '비교에 추가';
  (function (pid2) { cmpBtn2.onclick = function () { closePM(); toggleCmp(pid2); }; })(pid);
  pmFoot.appendChild(cmpBtn2);

  var applyBtn = document.createElement('button');
  applyBtn.className = 'mbt mbt-p';
  applyBtn.textContent = '렌탈 신청하기';
  applyBtn.onclick = function () { closePM(); applyProdToForm(pid); };
  pmFoot.appendChild(applyBtn);

  var buyBtn = document.createElement('button');
  buyBtn.className = 'mbt mbt-p';
  buyBtn.style.cssText = 'background:linear-gradient(90deg,#059669,#10b981)';
  buyBtn.textContent = '바로 구매하기';
  (function (pid2) { buyBtn.onclick = function () { closePM(); openPayment(pid2); }; })(pid);
  pmFoot.appendChild(buyBtn);

  document.getElementById('pmBg').classList.add('open');
  _lockScroll();
}

function closePM() {
  document.getElementById('pmBg').classList.remove('open');
  _unlockScroll();
}

/* ─── 비교 ─── */
function toggleCmp(id) {
  var idx = cmpIds.indexOf(id);
  if (idx > -1) {
    cmpIds.splice(idx, 1);
  } else {
    if (cmpIds.length >= 3) {
      alert('최대 3개까지 선택 가능합니다.');
      var cb = document.getElementById('chk-' + id);
      if (cb) cb.checked = false;
      return;
    }
    cmpIds.push(id);
  }
  updateCmpBar();
  allProds.forEach(function (p) {
    var cb = document.getElementById('chk-' + p.id);
    if (cb) cb.checked = cmpIds.indexOf(p.id) > -1;
  });
}

function updateCmpBar() {
  var bar = document.getElementById('cmpBar');
  var float = document.querySelector('.float');
  if (!cmpIds.length) {
    bar.classList.remove('show');
    if (float) float.style.bottom = '26px';
    return;
  }
  bar.classList.add('show');
  if (float) {
    requestAnimationFrame(function () {
      var barH = bar.offsetHeight || 72;
      float.style.bottom = (barH + 12) + 'px';
    });
  }

  var sel = cmpIds.map(function (id) { return allProds.find(function (p) { return p.id === id; }); }).filter(Boolean);
  var slots = '';
  for (var i = 0; i < 3; i++) {
    var p = sel[i];
    slots += p
      ? '<div class="cslot filled">' + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="">' : '') + '<div class="cslot-n">' + esc(p.name) + '</div><button class="cslot-x" onclick="toggleCmp(\'' + p.id + '\')"><svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5"/></svg></button></div>'
      : '<div class="cslot"></div>';
  }
  document.getElementById('cslots').innerHTML = slots;
  document.getElementById('cbarInfo').innerHTML = '<strong style="color:#fff">' + cmpIds.length + '개</strong> 선택';
  document.getElementById('cmpBtn').disabled = cmpIds.length < 2;

  var comboBtn = document.getElementById('comboBtn');
  comboBtn.disabled = cmpIds.length !== 2;
  comboBtn.title = cmpIds.length !== 2 ? '2개 제품 선택 시 결합 할인 계산 가능' : '';
}

function clearCmp() {
  cmpIds = [];
  updateCmpBar();
  allProds.forEach(function (p) {
    var cb = document.getElementById('chk-' + p.id);
    if (cb) cb.checked = false;
  });
}

/* ─── 비교 모달 ─── */
function openCmpModal() {
  if (cmpIds.length < 2) return;
  window._cmpProds = cmpIds.map(function (id) { return allProds.find(function (p) { return p.id === id; }); }).filter(Boolean);
  var dEl = document.getElementById('diffOnly');
  if (dEl) dEl.checked = false;
  renderCmpTable();

  document.getElementById('cmpCta').innerHTML = window._cmpProds.map(function (p) {
    return '<button onclick="closeCMP();applyProdToForm(\'' + p.id + '\')" style="padding:10px 22px;border-radius:9px;border:none;cursor:pointer;background:linear-gradient(90deg,var(--blue),var(--sky));color:#fff;font-family:inherit;font-weight:700;font-size:.81rem">' + esc(p.name) + ' 신청</button>';
  }).join('')
    + '<button onclick="openFrontEml(\'cmp\')" style="padding:10px 18px;border-radius:9px;border:1.5px solid var(--g2);background:#fff;color:var(--ink2);font-family:inherit;font-weight:700;font-size:.81rem;cursor:pointer">📧 비교 내역 이메일</button>';

  document.getElementById('cmpBg').classList.add('open');
  _lockScroll();
}

function renderCmpTable() {
  var prods = window._cmpProds;
  if (!prods || !prods.length) return;
  var diffOnly = !!(document.getElementById('diffOnly') || { checked: false }).checked;
  var keys = [];
  prods.forEach(function (p) {
    (p.specs || []).forEach(function (s) { if (keys.indexOf(s[0]) < 0) keys.push(s[0]); });
  });
  if (diffOnly) {
    keys = keys.filter(function (k) {
      var vals = prods.map(function (p) { var s = (p.specs || []).find(function (x) { return x[0] === k; }); return s ? s[1] : '-'; });
      return vals.some(function (v) { return v !== vals[0]; });
    });
  }

  var th = '<thead><tr><th style="text-align:left;width:100px;font-size:.73rem;color:var(--g4);padding-bottom:18px">항목</th>'
    + prods.map(function (p) {
      return '<th><div class="cth-img" style="background:' + esc(p.bgColor || '#dbeeff') + '">' + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="">' : '💧') + '</div><div class="cth-name">' + esc(p.name) + '</div><div class="cth-price">' + comma(p.priceMonthly || 0) + '<span>원/월</span></div></th>';
    }).join('') + '</tr></thead>';

  var featRow = (!diffOnly)
    ? '<tr><td>특징</td>' + prods.map(function (p) { return '<td><div class="cf-row">' + ((p.features || []).map(function (f) { return '<span class="cf">' + esc(f) + '</span>'; }).join('') || '-') + '</div></td>'; }).join('') + '</tr>'
    : '';

  var specRows = keys.length
    ? keys.map(function (k) { return '<tr><td>' + esc(k) + '</td>' + prods.map(function (p) { var s = (p.specs || []).find(function (x) { return x[0] === k; }); return '<td>' + (s ? esc(s[1]) : '-') + '</td>'; }).join('') + '</tr>'; }).join('')
    : '<tr><td colspan="' + (prods.length + 1) + '" style="text-align:center;padding:20px;color:var(--g4)">모든 스펙이 동일합니다.</td></tr>';

  document.getElementById('cmpt').innerHTML = th + '<tbody>' + featRow + specRows + '</tbody>';
}

function closeCMP() {
  document.getElementById('cmpBg').classList.remove('open');
  _unlockScroll();
}

/* ─── 콤보 계산기 ─── */
function openCombo() {
  if (cmpIds.length !== 2) return;
  cardDisc = 0; cardDiscName = '없음';
  renderCardButtons();
  renderCombProds();
  renderDiscBox();
  document.getElementById('comboBg').classList.add('open');
  _lockScroll();
}

function closeCombo() {
  document.getElementById('comboBg').classList.remove('open');
  _unlockScroll();
}

function renderCardButtons() {
  var cards = (_pbData.cardDiscounts || []).filter(function (c) { return c.active; });
  var row = document.getElementById('cardDiscRow');
  if (!row) return;
  if (!cards.length) cards = [{ id: 'cd0', name: '없음', discountPct: 0 }];
  row.innerHTML = cards.map(function (c, i) {
    return '<button class="card-btn' + (i === 0 ? ' on' : '') + '" onclick="setCardDiscObj(' + c.discountPct + ',\'' + esc(c.name) + '\',this)">' + esc(c.name) + '</button>';
  }).join('');
}

function renderCombProds() {
  var prods = cmpIds.map(function (id) { return allProds.find(function (p) { return p.id === id; }); }).filter(Boolean);
  document.getElementById('combProds').innerHTML = prods.map(function (p) {
    return '<div class="comb-prod sel">'
      + '<div class="comb-prod-img" style="background:' + esc(p.bgColor || '#dbeeff') + '">' + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="">' : '💧') + '</div>'
      + '<div class="comb-prod-name">' + esc(p.name) + '</div>'
      + '<div class="comb-prod-pr">' + comma(p.priceMonthly || 0) + '<span>원/월</span></div>'
      + '</div>';
  }).join('');
}

function setCardDiscObj(pct, name, btn) {
  cardDisc = pct; cardDiscName = name;
  document.querySelectorAll('.card-btn').forEach(function (b) { b.classList.remove('on'); });
  btn.classList.add('on');
  renderDiscBox();
}

function renderDiscBox() {
  var prods = cmpIds.map(function (id) { return allProds.find(function (p) { return p.id === id; }); }).filter(Boolean);
  if (prods.length < 2) return;
  var p1 = prods[0], p2 = prods[1];
  var orig = (p1.priceMonthly || 0) + (p2.priceMonthly || 0);
  var comboD = orig * 0.10;
  var afterCombo = orig - comboD;
  var cardD = afterCombo * (cardDisc / 100);
  var total = afterCombo - cardD;
  var totalSave = orig - total;
  var html = '';
  html += '<div class="disc-row orig"><span>' + esc(p1.name) + ' 월 요금</span><span>' + comma(p1.priceMonthly || 0) + '원</span></div>';
  html += '<div class="disc-row orig"><span>' + esc(p2.name) + ' 월 요금</span><span>' + comma(p2.priceMonthly || 0) + '원</span></div>';
  html += '<div class="disc-row orig" style="font-weight:700"><span>합산 월 요금</span><span>' + comma(orig) + '원</span></div>';
  html += '<div class="disc-row combo-d"><span>🔗 결합 할인 (10%)</span><span>-' + comma(comboD) + '원</span></div>';
  if (cardDisc > 0) html += '<div class="disc-row card-d"><span>💳 ' + (cardDiscName || cardDisc + '% 할인') + '</span><span>-' + comma(cardD) + '원</span></div>';
  html += '<div class="disc-row total"><span>최종 월 납부액</span><span class="disc-val">' + comma(total) + '원</span></div>';
  html += '<div class="disc-save"><div class="disc-save-txt">💰 매월 절약 금액</div><div class="disc-save-val">' + comma(totalSave) + '원 절약!</div></div>';
  document.getElementById('discBox').innerHTML = html;
}

/* ─── 콤보 신청 폼 ─── */
function openComboApply() {
  closeCombo();
  var prods = cmpIds.map(function (id) { return allProds.find(function (p) { return p.id === id; }); }).filter(Boolean);
  var orig = (prods[0].priceMonthly || 0) + (prods[1].priceMonthly || 0);
  var comboD = orig * 0.10;
  var cardD = (orig - comboD) * (cardDisc / 100);
  var total = orig - comboD - cardD;
  var saveStr = comma(orig - total);

  document.getElementById('capProdSummary').innerHTML =
    prods.map(function (p) { return '<div class="cap-prod-pill"><div class="cap-prod-dot"></div><div class="cap-prod-nm">' + esc(p.name) + '</div></div>'; }).join('<div class="cap-plus">+</div>')
    + '<div class="cap-disc-badge">월 ' + saveStr + '원 절약!</div>';

  buildCapTimeSlots();
  document.getElementById('capContent').style.display = 'block';
  document.getElementById('capOk').style.display = 'none';
  document.getElementById('cap-name').value = '';
  document.getElementById('cap-phone').value = '';
  document.getElementById('cap-msg').value = '';
  document.getElementById('cap-priv').checked = false;
  document.getElementById('frontEmlBody').style.display = 'block';
  document.getElementById('frontEmlDone').style.display = 'none';
  document.getElementById('frontEmlAddr').value = '';
  document.getElementById('capBg').classList.add('open');
  _lockScroll();
}

function closeCAP() {
  document.getElementById('capBg').classList.remove('open');
  _unlockScroll();
}

function submitComboApply() {
  var n = document.getElementById('cap-name').value.trim();
  var ph = document.getElementById('cap-phone').value.trim();
  var ts = getSelectedTS('cap');
  var priv = document.getElementById('cap-priv').checked;
  if (!n || !ph) { alert('이름과 연락처를 입력해주세요.'); return; }
  if (!ts) { alert('상담 가능 시간을 선택해주세요.'); return; }
  if (!priv) { alert('개인정보 수집·이용에 동의해주세요.'); return; }

  var prods = cmpIds.map(function (id) { return allProds.find(function (p) { return p.id === id; }); }).filter(Boolean);
  var orig = (prods[0].priceMonthly || 0) + (prods[1].priceMonthly || 0);
  var comboD = orig * 0.10;
  var cardD = (orig - comboD) * (cardDisc / 100);
  var total = orig - comboD - cardD;

  var _comboPayload = {
    name: n, phone: ph, region: '',
    categoryId: 'combo', categoryName: '결합 신청',
    brandId: '', brandName: '',
    productId: cmpIds.join(','),
    productName: prods.map(function (p) { return p.name; }).join(' + '),
    timeSlot: ts,
    comboDiscount: 10, cardDiscount: cardDisc, cardDiscountName: cardDiscName,
    originalPrice: orig, finalPrice: total,
    message: document.getElementById('cap-msg').value.trim(),
    status: '접수', type: 'combo'
  };

  fetch('/api/combo_inquiries.php', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(_comboPayload)
  }).then(function (r) { return r.json(); }).then(function (res) {
    if (res.ok) {
      window._lastComboData = _comboPayload;
      document.getElementById('frontEmlBody').style.display = 'block';
      document.getElementById('frontEmlDone').style.display = 'none';
      document.getElementById('frontEmlAddr').value = '';
      document.getElementById('capContent').style.display = 'none';
      document.getElementById('capOk').style.display = 'block';
    } else { alert('신청 중 오류가 발생했습니다. 다시 시도해 주세요.'); }
  }).catch(function () { alert('네트워크 오류가 발생했습니다. 다시 시도해 주세요.'); });
}

/* 콤보 신청 폼 전화 포맷 */
document.addEventListener('DOMContentLoaded', function () {
  var capPhone = document.getElementById('cap-phone');
  if (capPhone) capPhone.addEventListener('input', function () { fmtPhone(this); });
});