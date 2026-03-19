/* ═══════════════════════════════════════
   recommend.js — 제품 추천 위자드
═══════════════════════════════════════ */

var REC_STEPS = [
  {
    id: 'purpose', q: '어떤 용도로 사용하실 예정인가요?', hint: '사용 환경을 선택해주세요',
    opts: [
      { val: 'home',   ico: '🏠', label: '가정용',   sub: '1~4인 가족' },
      { val: 'office', ico: '🏢', label: '사무실용', sub: '직원 5인 이상' },
      { val: 'store',  ico: '🏪', label: '업소용',   sub: '카페·식당 등' },
      { val: 'any',    ico: '✨', label: '무관',      sub: '모두 가능' }
    ]
  },
  {
    id: 'priority', q: '가장 중요하게 보시는 기준은?', hint: '하나만 선택해주세요',
    opts: [
      { val: 'price',    ico: '💰', label: '가격',    sub: '합리적인 렌탈료' },
      { val: 'hygiene',  ico: '🦠', label: '위생관리', sub: '살균·UV 기능' },
      { val: 'design',   ico: '🎨', label: '디자인',   sub: '인테리어 어울림' },
      { val: 'function', ico: '⚙️', label: '기능성',   sub: '스마트·편의 기능' }
    ]
  },
  {
    id: 'form', q: '선호하시는 설치 형태는?', hint: '공간 환경에 맞게 선택해주세요',
    opts: [
      { val: 'stand', ico: '📏', label: '스탠드형', sub: '바닥 설치' },
      { val: 'desk',  ico: '🪴', label: '데스크형', sub: '싱크대·테이블 위' },
      { val: 'slim',  ico: '📐', label: '슬림형',   sub: '좁은 공간에 딱' },
      { val: 'any',   ico: '✅', label: '무관',      sub: '어디든 가능' }
    ]
  },
  {
    id: 'budget', q: '월 렌탈 예산은 어느 정도인가요?', hint: '월 렌탈료 기준',
    opts: [
      { val: 'low',  ico: '🟢', label: '2만원대',    sub: '~29,900원' },
      { val: 'mid',  ico: '🔵', label: '3만원대',    sub: '30,000~39,900원' },
      { val: 'high', ico: '🟣', label: '4만원 이상', sub: '40,000원~' },
      { val: 'any',  ico: '⚪', label: '무관',        sub: '예산 상관없음' }
    ]
  },
  {
    id: 'feature', q: '원하시는 추가 기능이 있나요?', hint: '가장 원하는 기능 하나를 선택해주세요',
    opts: [
      { val: 'coldHot', ico: '🌡️', label: '냉수/온수', sub: '냉온 즉시 제공' },
      { val: 'ice',     ico: '🧊', label: '얼음 기능', sub: '아이스워터 포함' },
      { val: 'direct',  ico: '💧', label: '직수형',    sub: '탱크 없는 직수' },
      { val: 'any',     ico: '💫', label: '무관',       sub: '기능 무관' }
    ]
  }
];

var recStep = 0;
var recAnswers = {};

function openRecommend() {
  recStep = 0; recAnswers = {};
  buildRecSteps(); updateRecUI();
  document.getElementById('recModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRecommend() {
  var isResult = recStep >= REC_STEPS.length;
  if (recStep > 0 && !isResult) { if (!confirm('추천 진행을 중단하고 나가시겠습니까?')) return; }
  document.getElementById('recModal').classList.remove('open');
  document.body.style.overflow = '';
}

function buildRecSteps() {
  var body = document.getElementById('recBody');
  body.innerHTML = REC_STEPS.map(function (step, i) {
    return '<div class="rec-step" id="recStep' + i + '">'
      + '<div class="rec-step-q">' + step.q + '</div>'
      + '<div class="rec-step-hint">' + step.hint + '</div>'
      + '<div class="rec-options">'
      + step.opts.map(function (o) {
        return '<button class="rec-opt" data-step="' + i + '" data-val="' + o.val + '" onclick="recSelect(' + i + ',\'' + o.val + '\')">'
          + '<div class="rec-opt-ico">' + o.ico + '</div>'
          + '<div><div class="rec-opt-label">' + o.label + '</div><div class="rec-opt-sub">' + o.sub + '</div></div>'
          + '</button>';
      }).join('')
      + '</div></div>';
  }).join('') + '<div class="rec-step" id="recStepResult"></div>';
}

function recSelect(stepIdx, val) {
  recAnswers[REC_STEPS[stepIdx].id] = val;
  document.querySelectorAll('[data-step="' + stepIdx + '"]').forEach(function (btn) {
    btn.classList.toggle('sel', btn.dataset.val === val);
  });
  setTimeout(function () { recNext(); }, 220);
}

function updateRecUI() {
  var total = REC_STEPS.length;
  var isResult = recStep >= total;
  for (var i = 0; i < total; i++) {
    var el = document.getElementById('recStep' + i);
    if (el) el.classList.toggle('active', i === recStep);
  }
  var resEl = document.getElementById('recStepResult');
  if (resEl) resEl.classList.toggle('active', isResult);

  var pct = isResult ? 100 : Math.round((recStep / total) * 100);
  document.getElementById('recProgress').style.width = pct + '%';
  document.getElementById('recProgressLabel').textContent = isResult ? '완료!' : 'Step ' + (recStep + 1) + ' / ' + total;
  document.getElementById('recBtnBack').disabled = recStep === 0;
  document.querySelector('.rec-footer').style.display = isResult ? 'none' : '';
}

function recNext() {
  var total = REC_STEPS.length;
  if (recStep < total - 1) { recStep++; updateRecUI(); }
  else if (recStep === total - 1) { recStep = total; buildRecResult(); updateRecUI(); }
}

function recPrev() {
  if (recStep > 0) {
    recStep--;
    document.querySelector('.rec-footer').style.display = '';
    updateRecUI();
    var stepId = REC_STEPS[recStep].id;
    if (recAnswers[stepId]) {
      document.querySelectorAll('[data-step="' + recStep + '"]').forEach(function (btn) {
        btn.classList.toggle('sel', btn.dataset.val === recAnswers[stepId]);
      });
    }
  }
}

function scoreProduct(p, ans) {
  var score = 0, reasons = [];
  var feats = (p.features || []).map(function (f) { return f.toLowerCase(); });
  var price = p.priceMonthly || 0;

  if (ans.purpose === 'home') { if (p.categoryId !== 'c5') score += 2; }
  else if (ans.purpose === 'office' || ans.purpose === 'store') {
    if (p.categoryId === 'c5' || feats.indexOf('대용량') >= 0) { score += 3; reasons.push('사무·업소 환경에 적합한 용량'); }
  } else { score += 1; }

  if (ans.priority === 'price') {
    if (price <= 29900) { score += 4; reasons.push('합리적인 월 렌탈료 ' + comma(price) + '원'); }
    else if (price <= 39900) score += 2;
  } else if (ans.priority === 'hygiene') {
    if (feats.indexOf('uv살균') >= 0 || feats.indexOf('직수형') >= 0) { score += 4; reasons.push('UV살균·직수 방식으로 위생 우수'); }
    else score += 1;
  } else if (ans.priority === 'design') {
    if (p.categoryId === 'c3' || feats.indexOf('슬림형') >= 0) { score += 4; reasons.push('슬림한 디자인으로 공간 활용 탁월'); }
    else score += 1;
  } else if (ans.priority === 'function') {
    if (feats.indexOf('ai필터') >= 0 || feats.indexOf('무소음') >= 0) { score += 4; reasons.push('AI 수질감지 등 스마트 기능 탑재'); }
    else score += 1;
  }

  if (ans.form === 'slim') { if (p.categoryId === 'c3') { score += 3; reasons.push('슬림형으로 공간 효율 최대화'); } }
  else if (ans.form === 'stand') { if (p.categoryId === 'c4' || p.categoryId === 'c5') score += 2; }
  else { score += 1; }

  if (ans.budget === 'low') { if (price < 30000) { score += 4; reasons.push('월 ' + comma(price) + '원으로 부담 없는 렌탈'); } else score -= 1; }
  else if (ans.budget === 'mid') { if (price >= 30000 && price < 40000) { score += 4; reasons.push('중간 가격대로 가성비 뛰어남'); } }
  else if (ans.budget === 'high') { if (price >= 40000) { score += 3; reasons.push('프리미엄 사양에 걸맞은 구성'); } else score += 1; }
  else { score += 1; }

  if (ans.feature === 'coldHot') { if (feats.indexOf('냉온정수') >= 0) { score += 4; reasons.push('냉수·온수 즉시 제공 가능'); } }
  else if (ans.feature === 'ice') { if (feats.indexOf('아이스워터') >= 0 || p.categoryId === 'c4') { score += 4; reasons.push('아이스워터 기능 내장'); } }
  else if (ans.feature === 'direct') { if (feats.indexOf('직수형') >= 0 || p.categoryId === 'c1') { score += 4; reasons.push('탱크 없는 직수형 — 항상 신선한 물'); } }
  else { score += 1; }

  return { score: score, reasons: reasons };
}

function buildRecResult() {
  var prods = (_pbData.products || []).filter(function (p) { return p.active; });
  var scored = prods.map(function (p) {
    var r = scoreProduct(p, recAnswers);
    return { p: p, score: r.score, reasons: r.reasons };
  }).sort(function (a, b) { return b.score - a.score; });

  var top = scored.slice(0, 3).filter(function (x) { return x.score > 0; });
  var el = document.getElementById('recStepResult');

  if (!top.length) {
    el.innerHTML = '<div class="rec-no-result">'
      + '<div class="rec-no-result-ico">🔍</div>'
      + '<div class="rec-no-result-msg">선택하신 조건에 맞는 제품을 찾지 못했어요.<br>조건을 조금 바꿔서 다시 시도해보세요.</div>'
      + '<button class="rec-retry" onclick="recRetry()">처음부터 다시</button>'
      + '</div>';
    return;
  }

  var medals = ['🥇', '🥈', '🥉'];
  el.innerHTML = '<div class="rec-result-head">'
    + '<div class="rec-result-ico">✨</div>'
    + '<div class="rec-result-title">' + top.length + '개의 추천 제품을 찾았어요!</div>'
    + '<div class="rec-result-sub">선택하신 조건에 가장 잘 맞는 순서입니다</div>'
    + '</div>'
    + '<div class="rec-result-list">'
    + top.map(function (item, idx) {
      var p = item.p;
      var reasonText = item.reasons.length > 0 ? item.reasons.slice(0, 2).join(' · ') : '전반적으로 균형 잡힌 제품';
      var thumbHtml = p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="">' : '<span style="font-size:1.5rem">💧</span>';
      var featTags = (p.features || []).map(function (f) { return '<span class="rec-feat-tag">' + esc(f) + '</span>'; }).join('');
      return '<div class="rec-card">'
        + '<div class="rec-card-top">'
        + '<div class="rec-card-thumb" style="background:' + esc(p.bgColor || '#dbeeff') + '">' + thumbHtml + '</div>'
        + '<div class="rec-card-info">'
        + (p.badge ? '<div class="rec-card-badge" style="background:' + (p.badgeColor || '#1255a6') + '22;color:' + (p.badgeColor || '#1255a6') + '">' + medals[idx] + ' ' + esc(p.badge) + '</div>' : '<div class="rec-card-badge" style="background:#f0f0f0;color:#888">' + medals[idx] + '</div>')
        + '<div class="rec-card-name">' + esc(p.name) + '</div>'
        + '<div class="rec-card-price">' + comma(p.priceMonthly || 0) + '원<span>/월</span></div>'
        + '</div></div>'
        + '<div class="rec-card-reason">💡 ' + esc(reasonText) + '</div>'
        + (featTags ? '<div class="rec-card-feats">' + featTags + '</div>' : '')
        + '<button class="rec-card-apply" onclick="recApply(\'' + p.id + '\')">이 제품으로 신청하기 →</button>'
        + '</div>';
    }).join('')
    + '</div>'
    + '<div style="text-align:center;margin-top:14px;padding-bottom:4px;">'
    + '<button class="rec-retry" onclick="recRetry()">다시 선택하기</button>'
    + '</div>';
}

function recApply(prodId) { closeRecommend(); applyProdToForm(prodId); }

function recRetry() {
  recStep = 0; recAnswers = {};
  buildRecSteps();
  document.querySelector('.rec-footer').style.display = '';
  updateRecUI();
}