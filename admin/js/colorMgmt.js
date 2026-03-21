/* =====================================================
   컬러 설정 – colorMgmt.js
===================================================== */

// input[type="color"]는 반드시 소문자 6자리 hex #rrggbb 필요
// 3자리 hex → 6자리로 확장, 대문자 → 소문자로 정규화
function colorNormalize(v) {
  v = (v || '').trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(v)) {
    v = '#' + v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
  }
  return v;
}

// ── 페이지 진입 시 데이터 로드 ───────────────────────────
function colorLoad() {
  fetch('api/color.php?action=get')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(res => {
      if (!res.ok) throw new Error(res.msg || 'API error');
      const d = res.data;
      colorSetAll('color_base',  d.color_base  || '#1255a6');
      colorSetAll('color_point', d.color_point || '#1e7fe8');
      colorSetAll('color_sub',   d.color_sub   || '#00c6ff');
      colorRefreshPreview();
    })
    .catch(err => {
      console.warn('[colorLoad] 컬러 설정 불러오기 실패:', err);
    });
}

// picker + text + bar 동시 설정
function colorSetAll(key, val) {
  const norm   = colorNormalize(val);
  const picker = document.getElementById(key + '_picker');
  const text   = document.getElementById(key + '_text');
  const bar    = document.getElementById(key + '_bar');
  // picker는 정확히 #rrggbb 형식이어야 반영됨
  if (picker && /^#[0-9a-f]{6}$/.test(norm)) picker.value = norm;
  if (text)  text.value = val;   // text에는 원래 입력값 표시
  if (bar)   bar.style.background = norm || val;
}

// picker 변경 → text 동기화
function colorSyncText(key, val) {
  const text = document.getElementById(key + '_text');
  if (text) text.value = val;
  const bar = document.getElementById(key + '_bar');
  if (bar) bar.style.background = val;
  colorRefreshPreview();
}

// text 직접 입력 → picker 동기화
function colorSyncPicker(key, val) {
  const norm = colorNormalize(val.trim());
  const picker = document.getElementById(key + '_picker');
  if (picker && /^#[0-9a-f]{6}$/.test(norm)) picker.value = norm;
  const bar = document.getElementById(key + '_bar');
  if (bar && /^#[0-9a-fA-F]{3,8}$/.test(val.trim())) bar.style.background = val.trim();
  colorRefreshPreview();
}

// 미리보기 갱신
function colorRefreshPreview() {
  const base  = (document.getElementById('color_base_text')?.value  || '').trim();
  const point = (document.getElementById('color_point_text')?.value || '').trim();
  const sub   = (document.getElementById('color_sub_text')?.value   || '').trim();
  const ok = v => /^#[0-9a-fA-F]{3,8}$/.test(v);

  const solid = document.getElementById('clr_prev_solid');
  if (solid && ok(base)) solid.style.background = base;

  const grad = document.getElementById('clr_prev_grad');
  if (grad && ok(base) && ok(point))
    grad.style.background = `linear-gradient(90deg,${base},${point})`;

  const badge = document.getElementById('clr_prev_badge');
  if (badge && ok(base)) badge.style.background = base;

  const link = document.getElementById('clr_prev_link');
  if (link && ok(base)) link.style.color = base;

  const outline = document.getElementById('clr_prev_outline');
  if (outline && ok(point)) {
    outline.style.borderColor = point;
    outline.style.color = point;
  }

  const dot = document.getElementById('clr_prev_dot');
  if (dot && ok(sub)) dot.style.background = sub;
}

// ── 저장 ────────────────────────────────────────────────
function colorSave() {
  const base  = (document.getElementById('color_base_text')?.value  || '').trim();
  const point = (document.getElementById('color_point_text')?.value || '').trim();
  const sub   = (document.getElementById('color_sub_text')?.value   || '').trim();

  const hexOk = v => /^#[0-9a-fA-F]{3,8}$/.test(v);
  if (!hexOk(base) || !hexOk(point) || !hexOk(sub)) {
    showToast('올바른 HEX 색상 코드를 입력해주세요. (예: #1255a6)', 'error');
    return;
  }

  const fd = new FormData();
  fd.append('action',      'save');
  fd.append('color_base',  base);
  fd.append('color_point', point);
  fd.append('color_sub',   sub);

  fetch('api/color.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(res => {
      if (res.ok) showToast('컬러가 저장되었습니다. 프론트를 새로고침하면 즉시 반영됩니다.', 'success');
      else        showToast(res.msg || '저장 실패', 'error');
    })
    .catch(() => showToast('서버 오류가 발생했습니다.', 'error'));
}
