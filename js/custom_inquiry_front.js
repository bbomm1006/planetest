/**
 * custom_inquiry_front.js
 * 사용자 문의폼 프론트 JS
 * 의존: main.css 토큰 / custom_inquiry_front.css
 * API: /admin/api_front/custom_inquiry_public.php
 *      /admin/api_front/user_auth.php
 *      /admin/api_front/social_public.php
 */

'use strict';

/* ════════════════════════════════════════════════
   전역 상태 — 테이블명별로 독립 관리
════════════════════════════════════════════════ */
const _CI = {};   // _CI[tableName] = { config, user, listPage, ... }

function ciState(t) {
  if (!_CI[t]) _CI[t] = {
    config: null,     // API config 응답
    user:   null,     // 로그인 유저
    listPage: 1,
    detailId: null,
  };
  return _CI[t];
}

/* ════════════════════════════════════════════════
   진입점 — DOMContentLoaded 후 ci-section 발견 시 init
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[id^="ci-section-"]').forEach(el => {
    const t = el.id.replace('ci-section-', '');
    if (t) ciInit(t);
  });
});

async function ciInit(t) {
  ciShowLoading(t, true);

  // 콜백 복귀 후 에러 파라미터 처리
  const urlParams = new URLSearchParams(location.search);
  const loginErr  = urlParams.get('ci_login_error');
  const loginTbl  = urlParams.get('ci_table');
  if (loginErr && loginTbl === t) {
    // URL 파라미터 정리
    const cleanUrl = location.pathname + location.hash;
    history.replaceState(null, '', cleanUrl);
    ciShowLoading(t, false);
    const errEl = document.getElementById('ci-form-err-' + t);
    ciShowError(errEl, decodeURIComponent(loginErr));
    return;
  }

  // 2) 폼 config 먼저 조회 (가장 중요)
  const res = await ciFetch(`/admin/api_front/custom_inquiry_public.php?action=config&table_name=${t}`);

  if (!res.ok) {
    ciShowLoading(t, false);
    const sec = document.getElementById('ci-section-' + t);
    if (sec) sec.style.display = 'none';
    return;
  }

  ciState(t).config = res;

  // 1) 소셜 키 & 세션 조회 (실패해도 폼 렌더링에 영향 없음)
  try {
    const [keysRes, authRes] = await Promise.all([
      ciFetch('/admin/api_front/social_public.php').catch(() => ({ ok: false })),
      ciFetch('/admin/api_front/user_auth.php?action=status').catch(() => ({ ok: false })),
    ]);
    if (keysRes && keysRes.ok) ciState(t)._socialKeys = keysRes;
    if (authRes && authRes.ok && authRes.loggedIn) ciState(t).user = authRes.user;
  } catch (e) {
    // 소셜/세션 조회 실패 무시
  }

  ciShowLoading(t, false);
  ciRenderConfig(t, res);
}

/* ════════════════════════════════════════════════
   config 기반 UI 세팅
════════════════════════════════════════════════ */
function ciRenderConfig(t, res) {
  const form = res.form;

  // 기간 체크
  if (form.period_use) {
    const today = new Date().toISOString().slice(0, 10);
    if (form.period_start && today < form.period_start) {
      ciShowPeriodNotice(t, '아직 접수 기간이 아닙니다',
        `접수 시작일: ${form.period_start}`); return;
    }
    if (form.period_end && today > form.period_end) {
      ciShowPeriodNotice(t, '접수 기간이 종료되었습니다',
        `접수 기간: ${form.period_start || ''} ~ ${form.period_end}`); return;
    }
  }

  // 로그인 유저바 표시 (로그인 된 경우만)
  if (form.login_use && ciState(t).user) {
    ciShowUserBar(t);
  }

  // 폼 뷰 로그인 유도 버튼 표시 (login_use + 비로그인 + 폼 타입일 때)
  const formLoginNudge = document.getElementById('ci-form-login-nudge-' + t);
  if (formLoginNudge) {
    const isFormType  = !form.visibility_type; // 목록 없는 순수 폼 타입
    const needsLogin  = form.login_use && !ciState(t).user;
    formLoginNudge.style.display = (isFormType && needsLogin) ? '' : 'none';
  }

  // 폼 헤더
  const tagWrap = document.getElementById('ci-tag-wrap-' + t);
  const tag     = document.getElementById('ci-tag-' + t);
  if (tagWrap && tag && form.description) {
    tagWrap.style.display = '';
    tag.textContent = 'INQUIRY';
  }
  ciSetText('ci-title-' + t, form.title);
  const descEl = document.getElementById('ci-desc-' + t);
  if (descEl) {
    descEl.textContent = form.description || '';
    descEl.style.display = form.description ? '' : 'none';
  }

  // 제출 버튼명
  const submitBtn = document.getElementById('ci-submit-btn-' + t);
  if (submitBtn) submitBtn.textContent = form.btn_name || '문의하기';

  // 제품 선택
  if (form.product_use) ciRenderProductSelect(t, res);

  // 동적 필드
  ciRenderFields(t, res.fields || []);

  // 공개/비공개 선택
  ciRenderVisibility(t, form);

  // 약관
  ciRenderTerms(t, res.terms || []);

  // visibility OFF → 목록 없음, ON → 목록 뷰로 시작
  const hasListView = !!form.visibility_type;

  // 목록 타이틀 세팅
  const listTitleEl = document.getElementById('ci-list-title-' + t);
  if (listTitleEl) listTitleEl.textContent = form.title || '문의 내역';

  // 목록 타입이면 폼 뷰의 "목록으로" 버튼 표시
  const formBackBtn = document.getElementById('ci-form-back-btn-' + t);
  if (formBackBtn) formBackBtn.style.display = hasListView ? '' : 'none';

  // 뷰 전환 — 공개글여부 on이면 목록 뷰로 시작, off면 폼 뷰로 시작
  if (hasListView) {
    ciShowView(t, 'list');
  } else {
    ciShowView(t, 'form');
  }

  // visibility 있으면 완료 후 "내역 보기" 버튼 표시
  const okListBtn = document.getElementById('ci-ok-list-btn-' + t);
  if (okListBtn) okListBtn.style.display = hasListView ? '' : 'none';
}

/* ════════════════════════════════════════════════
   기간 외 안내
════════════════════════════════════════════════ */
function ciShowPeriodNotice(t, title, desc) {
  ciShowLoading(t, false);
  const el = document.getElementById('ci-period-notice-' + t);
  if (el) {
    el.style.display = '';
    ciSetText('ci-period-notice-title-' + t, title);
    ciSetText('ci-period-notice-desc-' + t, desc);
  }
}

/* ════════════════════════════════════════════════
   소셜 로그인 게이트
════════════════════════════════════════════════ */
function ciShowLoginGate(t, form) {
  // 모달 오버레이 + 모달 표시
  const overlay = document.getElementById('ci-login-modal-overlay-' + t);
  const gate    = document.getElementById('ci-login-gate-' + t);
  if (!gate) return;
  if (overlay) overlay.style.display = '';
  gate.style.display = '';

  const desc = document.getElementById('ci-login-gate-desc-' + t);
  if (desc) desc.textContent = '문의를 작성하려면 로그인이 필요합니다.';

  const container = document.getElementById('ci-social-btns-' + t);
  if (!container) return;
  container.innerHTML = '';

  const keys    = ciState(t)._socialKeys || {};
  const types   = (form.login_types || '').split(',').filter(Boolean);
  const btnDefs = {
    kakao:    { label: '카카오로 로그인',  cls: 'ci-social-kakao',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#3A1D1D" d="M12 3C6.477 3 2 6.477 2 10.5c0 2.583 1.574 4.85 3.938 6.18L5 21l4.563-2.438A11.6 11.6 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3Z"/></svg>' },
    naver:    { label: '네이버로 로그인',  cls: 'ci-social-naver',
      icon: '<span style="font-weight:900;font-size:1rem;color:#fff;">N</span>' },
    google:   { label: 'Google로 로그인', cls: 'ci-social-google',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"/></svg>' },
    email:    { label: '이메일 인증번호', cls: 'ci-social-google',
      icon: '📧' },
  };

  types.forEach(type => {
    const def = btnDefs[type];
    if (!def) return;
    const btn = document.createElement('button');
    btn.className = 'ci-social-btn ' + def.cls;
    btn.innerHTML = def.icon + ' <span>' + def.label + '</span>';
    btn.onclick = () => ciDoSocialLogin(t, type, form, keys);
    container.appendChild(btn);
  });
}

async function ciDoSocialLogin(t, type, form, keys) {
  if (type === 'email') {
    // 이메일 인증번호 폼 토글
    const el = document.getElementById('ci-email-otp-' + t);
    if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
    return;
  }
  if (type === 'kakao') await ciKakaoLogin(t, form, keys);
  else if (type === 'naver') await ciNaverLogin(t, form, keys);
  else if (type === 'google') await ciGoogleLogin(t, form, keys);
}

/* ── 카카오 ── */
async function ciKakaoLogin(t, form, keys) {
  if (!keys.kakao) return;
  // JS SDK 초기화 (authorize용)
  if (!window.Kakao) { ciToast('카카오 SDK 로드 실패', 'error'); return; }
  if (!Kakao.isInitialized()) Kakao.init(keys.kakao);
  Kakao.Auth.authorize({
    redirectUri: 'https://' + location.host + '/sns/kakao_callback.php',
    state: t,  // 콜백에서 table_name으로 사용
  });
}

/* ── 네이버 ── */
function ciNaverLogin(t, form, keys) {
  if (!keys.naver) return;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     keys.naver,
    redirect_uri:  'https://' + location.host + '/sns/naver_callback.php',
    state:         t,  // 콜백에서 table_name으로 사용
  });
  location.href = 'https://nid.naver.com/oauth2.0/authorize?' + params.toString();
}

/* ── 구글 ── */
function ciGoogleLogin(t, form, keys) {
  if (!keys.google || !window.google) return;
  google.accounts.id.initialize({
    client_id: keys.google,
    callback: async resp => {
      const res = await ciFetch('/admin/api_front/user_auth.php', {
        method: 'POST',
        body: JSON.stringify({ provider: 'google', token: resp.credential }),
      });
      if (res.ok) { ciState(t).user = res.user; ciAfterLogin(t, form); }
    },
  });
  google.accounts.id.prompt();
}

/* ── 이메일+비밀번호 ── */
async function ciEmailLogin(t) {
  const email = document.getElementById('ci-email-inp-' + t)?.value.trim();
  const pw    = document.getElementById('ci-pw-inp-' + t)?.value.trim();
  const errEl = document.getElementById('ci-email-login-err-' + t);
  if (!email || !pw) { ciShowError(errEl, '이메일과 비밀번호를 입력하세요.'); return; }

  const res = await ciFetch('/admin/api_front/user_auth.php', {
    method: 'POST',
    body: JSON.stringify({ provider: 'email_pw', email, password: pw }),
  });
  if (res.ok) {
    ciState(t).user = res.user;
    const form = ciState(t).config?.form;
    if (form) ciAfterLogin(t, form);
  } else {
    ciShowError(errEl, res.error || '로그인 실패');
  }
}

/* ── 이메일 인증번호 발송 ── */
let _ciOtpTimers = {};
async function ciSendOtp(t) {
  const email  = document.getElementById('ci-otp-email-' + t)?.value.trim();
  const errEl  = document.getElementById('ci-otp-err-' + t);
  const btnEl  = document.getElementById('ci-otp-send-btn-' + t);
  if (!email) { ciShowError(errEl, '이메일을 입력하세요.'); return; }

  if (btnEl) { btnEl.disabled = true; btnEl.textContent = '발송 중...'; }
  const res = await ciFetch('/admin/api_front/user_auth.php', {
    method: 'POST',
    body: JSON.stringify({ provider: 'email', subaction: 'send', email }),
  });
  if (btnEl) { btnEl.disabled = false; btnEl.textContent = '재발송'; }

  if (!res.ok) { ciShowError(errEl, res.error || '발송 실패'); return; }
  ciShowError(errEl, '');
  const wrap = document.getElementById('ci-otp-code-wrap-' + t);
  if (wrap) wrap.style.display = '';

  // 10분 타이머
  if (_ciOtpTimers[t]) clearInterval(_ciOtpTimers[t]);
  let remain = 600;
  const timerEl = document.getElementById('ci-otp-timer-' + t);
  const tick = () => {
    if (!timerEl) return;
    const m = String(Math.floor(remain / 60)).padStart(2, '0');
    const s = String(remain % 60).padStart(2, '0');
    timerEl.textContent = `유효시간 ${m}:${s}`;
    if (remain-- <= 0) {
      clearInterval(_ciOtpTimers[t]);
      timerEl.textContent = '인증번호가 만료되었습니다. 재발송해 주세요.';
    }
  };
  tick();
  _ciOtpTimers[t] = setInterval(tick, 1000);
}

/* ── 이메일 인증번호 검증 ── */
async function ciVerifyOtp(t) {
  const email  = document.getElementById('ci-otp-email-' + t)?.value.trim();
  const code   = document.getElementById('ci-otp-code-' + t)?.value.trim();
  const errEl  = document.getElementById('ci-otp-err-' + t);
  if (!code) { ciShowError(errEl, '인증번호를 입력하세요.'); return; }

  const res = await ciFetch('/admin/api_front/user_auth.php', {
    method: 'POST',
    body: JSON.stringify({ provider: 'email', subaction: 'verify', email, code }),
  });

  if (!res.ok) { ciShowError(errEl, res.error || '인증 실패'); return; }

  if (_ciOtpTimers[t]) clearInterval(_ciOtpTimers[t]);
  ciState(t).user = res.user;
  const form = ciState(t).config?.form;
  if (form) ciAfterLogin(t, form);
}

/* 로그인 후 처리 */
function ciAfterLogin(t, form) {
  ciCloseLoginModal(t);
  ciShowUserBar(t);

  const pending = ciState(t)._pendingView;
  ciState(t)._pendingView = null;

  if (pending === 'submit') {
    ciSubmit(t);
    return;
  }

  if (pending === 'form') {
    ['form', 'list', 'detail'].forEach(v => {
      const el = document.getElementById(`ci-view-${v}-${t}`);
      if (el) el.classList.toggle('ci-active', v === 'form');
    });
    return;
  }

  if (pending === 'list') {
    ciShowView(t, 'list');
    return;
  }

  if (pending === 'detail') {
    // 현재 detailId로 상세 재로드 (댓글 로그인 후 복귀)
    const detailId = ciState(t).detailId;
    if (detailId) {
      ciLoadDetail(t, detailId);
    } else {
      ciShowView(t, 'detail');
    }
    return;
  }

  ciRenderConfig(t, ciState(t).config);
}

/* 로그인 모달 닫기 */
function ciCloseLoginModal(t) {
  const overlay = document.getElementById('ci-login-modal-overlay-' + t);
  const gate    = document.getElementById('ci-login-gate-' + t);
  if (overlay) overlay.style.display = 'none';
  if (gate)    gate.style.display    = 'none';
}

/* 로그아웃 */
async function ciLogout(t) {
  await ciFetch('/admin/api_front/user_auth.php?action=logout', { method: 'POST', body: '{}' });
  ciState(t).user = null;
  // OTP UI 초기화
  const otpWrap = document.getElementById('ci-email-otp-' + t);
  if (otpWrap) {
    otpWrap.style.display = 'none';
    const emailInp = document.getElementById('ci-otp-email-' + t);
    const codeInp  = document.getElementById('ci-otp-code-' + t);
    const codeWrap = document.getElementById('ci-otp-code-wrap-' + t);
    const timerEl  = document.getElementById('ci-otp-timer-' + t);
    const errEl    = document.getElementById('ci-otp-err-' + t);
    const sendBtn  = document.getElementById('ci-otp-send-btn-' + t);
    if (emailInp) emailInp.value = '';
    if (codeInp)  codeInp.value  = '';
    if (codeWrap) codeWrap.style.display = 'none';
    if (timerEl)  timerEl.textContent = '';
    if (errEl)    errEl.style.display = 'none';
    if (sendBtn)  { sendBtn.disabled = false; sendBtn.textContent = '인증번호 발송'; }
    if (_ciOtpTimers[t]) { clearInterval(_ciOtpTimers[t]); delete _ciOtpTimers[t]; }
  }
  const bar = document.getElementById('ci-user-bar-' + t);
  if (bar) bar.style.display = 'none';

  const config = ciState(t).config;
  const form   = config?.form;
  if (!form) return;

  // 로그아웃 후 화면 재렌더링 (로그인 게이트 팝업 없이)
  ciRenderConfig(t, config);
}

/* 계정 변경 — 현재 세션 로그아웃 후 로그인 게이트 재표시 (화면 이동 없음) */
async function ciSwitchAccount(t) {
  await ciFetch('/admin/api_front/user_auth.php?action=logout', { method: 'POST', body: '{}' });
  ciState(t).user = null;

  // 유저바 숨김
  const bar = document.getElementById('ci-user-bar-' + t);
  if (bar) bar.style.display = 'none';

  // OTP UI 초기화
  const otpWrap = document.getElementById('ci-email-otp-' + t);
  if (otpWrap) {
    otpWrap.style.display = 'none';
    const emailInp = document.getElementById('ci-otp-email-' + t);
    const codeInp  = document.getElementById('ci-otp-code-' + t);
    const codeWrap = document.getElementById('ci-otp-code-wrap-' + t);
    const timerEl  = document.getElementById('ci-otp-timer-' + t);
    if (emailInp) emailInp.value = '';
    if (codeInp)  codeInp.value  = '';
    if (codeWrap) codeWrap.style.display = 'none';
    if (timerEl)  timerEl.textContent = '';
    if (_ciOtpTimers[t]) { clearInterval(_ciOtpTimers[t]); delete _ciOtpTimers[t]; }
  }

  // 현재 뷰 유지한 채로 로그인 게이트만 띄움
  const config = ciState(t).config;
  if (config?.form) ciShowLoginGate(t, config.form);
}

function ciShowUserBar(t) {
  const user = ciState(t).user;
  if (!user) return;
  const bar = document.getElementById('ci-user-bar-' + t);
  if (bar) bar.style.display = '';
  ciSetText('ci-user-name-' + t, user.name || user.id);
}

/* ════════════════════════════════════════════════
   제품 선택 렌더링
════════════════════════════════════════════════ */
function ciRenderProductSelect(t, res) {
  const wrap = document.getElementById('ci-product-wrap-' + t);
  if (!wrap) return;
  wrap.style.display = '';

  const reqMark = document.getElementById('ci-product-req-mark-' + t);
  if (reqMark) reqMark.textContent = res.form.product_required ? '*' : '';

  const catSel  = document.getElementById('ci-cat-select-' + t);
  const prodSel = document.getElementById('ci-prod-select-' + t);
  if (!catSel || !prodSel) return;

  const cats = res.categories || [];
  const prods = res.products || [];

  catSel.innerHTML = '<option value="">카테고리 선택</option>' +
    cats.map(c => `<option value="${c.id}">${ciEsc(c.name)}</option>`).join('');

  // 데이터 저장
  catSel.dataset.prods = JSON.stringify(prods);
  prodSel.innerHTML = '<option value="">제품 선택</option>';
}

function ciOnCatChange(t) {
  const catSel  = document.getElementById('ci-cat-select-' + t);
  const prodSel = document.getElementById('ci-prod-select-' + t);
  if (!catSel || !prodSel) return;
  const catId = catSel.value;
  const all   = JSON.parse(catSel.dataset.prods || '[]');
  const filtered = catId ? all.filter(p => String(p.category_id) === catId) : [];
  prodSel.innerHTML = '<option value="">제품 선택</option>' +
    filtered.map(p => `<option value="${p.id}" data-name="${ciEsc(p.name)}" data-model="${ciEsc(p.model_no||'')}">${ciEsc(p.name)}${p.model_no ? ' (' + p.model_no + ')' : ''}</option>`).join('');
}

/* ════════════════════════════════════════════════
   동적 필드 렌더링
════════════════════════════════════════════════ */
function ciRenderFields(t, fields) {
  const container = document.getElementById('ci-fields-' + t);
  if (!container) return;
  container.innerHTML = '';

  fields.forEach(f => {
    // product_use UI가 상단에 별도 렌더링되므로 중복 방지
    if (f.field_key === 'category_id' || f.field_key === 'product_id') return;

    const wrap = document.createElement('div');
    wrap.className = 'fg';
    wrap.style.marginBottom = '14px';

    const label = document.createElement('label');
    label.className = 'fl';
    label.innerHTML = ciEsc(f.label) + (f.is_required ? ' <em>*</em>' : '');
    wrap.appendChild(label);

    let input;
    switch (f.type) {
      case 'input':
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'fi';
        input.placeholder = f.placeholder || '';
        input.dataset.key = f.field_key;
        input.dataset.required = f.is_required;
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.className = 'fta';
        input.placeholder = f.placeholder || '';
        input.rows = 4;
        input.dataset.key = f.field_key;
        input.dataset.required = f.is_required;
        break;

      case 'select':
        input = document.createElement('select');
        input.className = 'fi';
        input.dataset.key = f.field_key;
        input.dataset.required = f.is_required;
        input.innerHTML = `<option value="">선택하세요</option>` +
          (f.options || []).map(o => `<option value="${ciEsc(o)}">${ciEsc(o)}</option>`).join('');
        break;

      case 'radio': {
        const radioWrap = document.createElement('div');
        radioWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin-top:4px;';
        radioWrap.dataset.key = f.field_key;
        radioWrap.dataset.required = f.is_required;
        radioWrap.dataset.type = 'radio-group';
        (f.options || []).forEach(o => {
          const lbl = document.createElement('label');
          lbl.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;font-size:.88rem;';
          lbl.innerHTML = `<input type="radio" name="ci_radio_${t}_${f.field_key}" value="${ciEsc(o)}" style="accent-color:var(--sky);"> ${ciEsc(o)}`;
          radioWrap.appendChild(lbl);
        });
        wrap.appendChild(radioWrap);
        container.appendChild(wrap);
        return;
      }

      case 'checkbox': {
        const cbWrap = document.createElement('div');
        cbWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin-top:4px;';
        cbWrap.dataset.key = f.field_key;
        cbWrap.dataset.required = f.is_required;
        cbWrap.dataset.type = 'checkbox-group';
        (f.options || []).forEach(o => {
          const lbl = document.createElement('label');
          lbl.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;font-size:.88rem;';
          lbl.innerHTML = `<input type="checkbox" value="${ciEsc(o)}" style="accent-color:var(--sky);"> ${ciEsc(o)}`;
          cbWrap.appendChild(lbl);
        });
        wrap.appendChild(cbWrap);
        container.appendChild(wrap);
        return;
      }

      case 'file':
        input = document.createElement('input');
        input.type = 'file';
        input.className = 'fi';
        input.dataset.key = f.field_key;
        input.dataset.required = f.is_required;
        if (f.file_exts) {
          input.accept = f.file_exts.split(',').map(e => '.' + e.trim()).join(',');
        }
        input.style.cssText = 'padding:8px;cursor:pointer;';
        break;

      default:
        return;
    }

    if (input) wrap.appendChild(input);
    container.appendChild(wrap);
  });
}

/* ════════════════════════════════════════════════
   공개/비공개 렌더링
════════════════════════════════════════════════ */
function ciRenderVisibility(t, form) {
  const wrap = document.getElementById('ci-visibility-wrap-' + t);
  if (!wrap) return;

  const visType  = form.visibility_type || '';
  const loginUse = !!form.login_use;

  // 선택 UI 표시 조건: 로그인on + both 조합만
  if (visType === 'both' && loginUse) {
    wrap.style.display = '';
    wrap.querySelectorAll('.ci-visibility-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        wrap.querySelectorAll('.ci-visibility-opt').forEach(o => o.classList.remove('ci-selected'));
        opt.classList.add('ci-selected');
      });
    });
    return;
  }

  // 그 외 모든 조합 → 선택 UI 숨기고 값 자동 고정
  wrap.style.display = 'none';
  // private이면 비공개(0), 그 외(public, both+loginoff 등)는 공개(1) 고정
  const fixedVal = visType === 'private' ? '0' : '1';
  const radio = wrap.querySelector(`input[value="${fixedVal}"]`);
  if (radio) radio.checked = true;
}

/* ════════════════════════════════════════════════
   약관 렌더링
════════════════════════════════════════════════ */
function ciRenderTerms(t, terms) {
  const container = document.getElementById('ci-terms-wrap-' + t);
  if (!container) return;
  container.innerHTML = '';
  terms.forEach(term => {
    const item = document.createElement('div');
    item.className = 'ci-term-item';
    item.innerHTML = `
      <div class="ci-term-scroll">${ciEsc(term.content || term.title || '')}</div>
      <label class="ci-term-check">
        <input type="checkbox" data-term-id="${term.id}">
        <span>${ciEsc(term.title || '약관에 동의합니다')} <em style="color:var(--red);font-style:normal;">(필수)</em></span>
      </label>`;
    container.appendChild(item);
  });
}

/* ════════════════════════════════════════════════
   폼 제출
════════════════════════════════════════════════ */
async function ciSubmit(t) {
  const state  = ciState(t);
  const config = state.config;
  if (!config) return;
  const form = config.form;

  const btn = document.getElementById('ci-submit-btn-' + t);
  const errEl = document.getElementById('ci-form-err-' + t);
  ciShowError(errEl, '');

  // 필드값 수집
  const fieldValues = {};
  let emailField = null;
  let valid = true;
  let firstErr = '';

  const container = document.getElementById('ci-fields-' + t);
  if (container) {
    // input / textarea / select
    container.querySelectorAll('[data-key]:not([data-type])').forEach(el => {
      const key = el.dataset.key;
      const req = el.dataset.required == 1 || el.dataset.required === 'true' || el.dataset.required === '1';
      let val = el.value?.trim() || '';
      if (req && !val) { if (!firstErr) firstErr = el.closest('.fg')?.querySelector('.fl')?.textContent?.replace('*','').trim() + ' 항목은 필수입니다.'; valid = false; }
      fieldValues[key] = val;
      // 이메일 필드 감지
      if (key.includes('email') && !emailField && val) emailField = val;
    });

    // radio
    container.querySelectorAll('[data-type="radio-group"]').forEach(grp => {
      const key = grp.dataset.key;
      const req = grp.dataset.required == 1;
      const checked = grp.querySelector('input[type="radio"]:checked');
      const val = checked ? checked.value : '';
      if (req && !val) { if (!firstErr) firstErr = key + ' 항목은 필수입니다.'; valid = false; }
      fieldValues[key] = val;
    });

    // checkbox
    container.querySelectorAll('[data-type="checkbox-group"]').forEach(grp => {
      const key = grp.dataset.key;
      const req = grp.dataset.required == 1;
      const vals = [...grp.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.value);
      if (req && !vals.length) { if (!firstErr) firstErr = key + ' 항목은 필수입니다.'; valid = false; }
      fieldValues[key] = vals.join(',');
    });
  }

  if (!valid) { ciShowError(errEl, firstErr || '필수 항목을 입력해 주세요.'); return; }

  // 로그인 연동 사용 & 비로그인 → 로그인 모달 표시 후 자동 접수
  if (form.login_use && !state.user) {
    ciState(t)._pendingView = 'submit';
    ciShowLoginGate(t, form);
    return;
  }

  // 제품 선택
  if (form.product_use) {
    const catSel  = document.getElementById('ci-cat-select-' + t);
    const prodSel = document.getElementById('ci-prod-select-' + t);
    const catId   = catSel?.value;
    const prodId  = prodSel?.value;
    if (form.product_required && (!catId || !prodId)) {
      ciShowError(errEl, '제품을 선택해 주세요.'); return;
    }
    if (catId) {
      fieldValues.category_id   = catId;
      fieldValues.category_name = catSel.options[catSel.selectedIndex]?.text || '';
    }
    if (prodId) {
      fieldValues.product_id   = prodId;
      const selOpt = prodSel.options[prodSel.selectedIndex];
      fieldValues.product_name = selOpt?.dataset.name || selOpt?.text || '';
    }
  }

  // 공개/비공개
  let visibility = 1;
  if (form.visibility_type === 'private') visibility = 0;
  else if (form.visibility_type === 'both') {
    const checked = document.querySelector(`input[name="ci_visibility_${t}"]:checked`);
    visibility = checked ? parseInt(checked.value) : 0;
  }

  // 약관 동의 체크
  const termIds = [];
  const termContainer = document.getElementById('ci-terms-wrap-' + t);
  if (termContainer) {
    const checkboxes = termContainer.querySelectorAll('input[type="checkbox"][data-term-id]');
    let allChecked = true;
    checkboxes.forEach(cb => {
      if (!cb.checked) allChecked = false;
      else termIds.push(parseInt(cb.dataset.termId));
    });
    if (checkboxes.length && !allChecked) {
      ciShowError(errEl, '필수 약관에 모두 동의해 주세요.'); return;
    }
  }

  // 로그인 정보
  const user = state.user;
  const loginType = user ? user.provider : '';
  const loginId   = user ? user.id       : '';

  // 버튼 비활성화
  if (btn) { btn.disabled = true; btn.textContent = '제출 중...'; }

  const body = { table_name: t, fields: fieldValues, terms: termIds, login_type: loginType, login_id: loginId, visibility };
  const res  = await ciFetch('/admin/api_front/custom_inquiry_public.php?action=create', {
    method: 'POST', body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (btn) { btn.disabled = false; btn.textContent = form.btn_name || '문의하기'; }
    ciShowError(errEl, res.msg || '오류가 발생했습니다.');
    return;
  }

  // 완료 모달 즉시 표시 (버튼 복구 전)
  ciShowFormOk(t, emailField);
  if (btn) { btn.disabled = false; btn.textContent = form.btn_name || '문의하기'; }
}

function ciShowFormOk(t, emailField) {
  // 폼 영역 즉시 숨기기 (모달 뜨기 전에 폼이 보이는 현상 방지)
  const fcEl = document.querySelector(`#ci-view-form-${t} .fc`);
  if (fcEl) fcEl.style.visibility = 'hidden';

  // 완료 모달 표시
  const overlay = document.getElementById('ci-ok-modal-overlay-' + t);
  const modal   = document.getElementById('ci-ok-modal-' + t);
  if (overlay) overlay.style.display = '';
  if (modal)   modal.style.display   = '';

  // 이메일 발송 노트
  const noteEl = document.getElementById('ci-ok-modal-email-note-' + t);
  if (noteEl) noteEl.style.display = emailField ? '' : 'none';
}

function ciCloseOkModal(t) {
  const overlay = document.getElementById('ci-ok-modal-overlay-' + t);
  const modal   = document.getElementById('ci-ok-modal-' + t);
  if (overlay) overlay.style.display = 'none';
  if (modal)   modal.style.display   = 'none';

  // 폼 초기화 (fc visibility 복구 포함)
  const fcEl = document.querySelector(`#ci-view-form-${t} .fc`);
  if (fcEl) { fcEl.style.visibility = ''; fcEl.style.display = ''; }

  // 필드값 초기화
  const container = document.getElementById('ci-fields-' + t);
  if (container) {
    container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]),textarea,select')
      .forEach(el => { el.value = ''; });
    container.querySelectorAll('input[type="radio"],input[type="checkbox"]')
      .forEach(el => { el.checked = false; });
  }
  // 약관 체크 초기화
  const termContainer = document.getElementById('ci-terms-wrap-' + t);
  if (termContainer) termContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });

  // 제품 선택 초기화
  const catSel  = document.getElementById('ci-cat-select-' + t);
  const prodSel = document.getElementById('ci-prod-select-' + t);
  if (catSel)  catSel.selectedIndex  = 0;
  if (prodSel) prodSel.selectedIndex = 0;

  // 에러 메시지 초기화
  const errEl = document.getElementById('ci-form-err-' + t);
  if (errEl) errEl.style.display = 'none';
}

function ciResetForm(t) {
  const okEl = document.getElementById('ci-form-ok-' + t);
  const fcEl = document.querySelector(`#ci-view-form-${t} .fc`);
  if (okEl) okEl.style.display = 'none';
  if (fcEl) fcEl.style.display = '';
  // 필드 초기화
  const container = document.getElementById('ci-fields-' + t);
  if (container) container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]),textarea,select').forEach(el => { el.value = ''; });
  document.getElementById('ci-form-err-' + t)?.style && (document.getElementById('ci-form-err-' + t).style.display = 'none');
}

/* ════════════════════════════════════════════════
   목록
════════════════════════════════════════════════ */
async function ciLoadList(t, page) {
  const state = ciState(t);
  state.listPage = page || 1;
  const kw  = document.getElementById('ci-kw-' + t)?.value.trim() || '';
  const url = `/admin/api_front/custom_inquiry_public.php?action=list&table_name=${t}&page=${state.listPage}&limit=10&kw=${encodeURIComponent(kw)}`;

  const listEl  = document.getElementById('ci-list-' + t);
  const pagerEl = document.getElementById('ci-pager-' + t);
  if (listEl) listEl.innerHTML = '<div class="ci-loading"><div class="ci-spinner"></div><span>불러오는 중...</span></div>';

  const res = await ciFetch(url);

  // 로그인 유도 영역 기본 숨김
  const nudgeEl = document.getElementById('ci-list-login-nudge-' + t);
  if (nudgeEl) nudgeEl.style.display = 'none';

  if (!res.ok || !listEl) {
    if (res.msg === '로그인이 필요합니다.') {
      listEl.innerHTML = '<div class="board-list-empty">로그인 후 문의 내역을 확인할 수 있습니다.</div>';
      if (pagerEl) pagerEl.innerHTML = '';
      // 로그인 유도 버튼 표시
      if (nudgeEl) nudgeEl.style.display = '';
      return;
    }
    if (listEl) listEl.innerHTML = '';
    return;
  }

  const items = res.items || [];
  if (!items.length) {
    listEl.innerHTML = '<div class="board-list-empty">등록된 문의가 없습니다.</div>';
    if (pagerEl) pagerEl.innerHTML = '';
    return;
  }

  listEl.innerHTML = items.map((item, i) => `
    <div class="board-list-item" onclick="ciLoadDetail('${t}', ${item.id})">
      <div class="board-list-num">${(state.listPage - 1) * 10 + i + 1}</div>
      <div class="board-list-body">
        <div class="board-list-title">${ciEsc(item.title || '(제목 없음)')}
          ${item.is_mine ? '<span class="ci-list-mine-badge" style="margin-left:6px;">내 글</span>' : ''}
        </div>
        <div class="board-list-meta">
          <span>${ciEsc(item.author_name || '익명')}</span>
          <span>${item.created_at ? item.created_at.slice(0, 10) : ''}</span>
          <span class="ci-status ci-status-default">${ciEsc(item.status || '접수')}</span>
        </div>
      </div>
      <div class="board-list-arrow">›</div>
    </div>`).join('');

  // 페이지네이션
  if (pagerEl) {
    let pagerHtml = '';
    for (let p = 1; p <= res.pages; p++) {
      pagerHtml += `<button class="board-page-btn ${p === state.listPage ? 'on' : ''}" onclick="ciLoadList('${t}', ${p})">${p}</button>`;
    }
    pagerEl.innerHTML = pagerHtml;
  }
}

/* ════════════════════════════════════════════════
   상세
════════════════════════════════════════════════ */
async function ciLoadDetail(t, id) {
  ciState(t).detailId = id;
  ciShowView(t, 'detail');

  const box = document.getElementById('ci-detail-box-' + t);
  if (box) box.innerHTML = '<div class="ci-loading"><div class="ci-spinner"></div><span>불러오는 중...</span></div>';

  const res = await ciFetch(`/admin/api_front/custom_inquiry_public.php?action=detail&table_name=${t}&id=${id}`);
  if (!res.ok || !box) {
    if (res.msg === '로그인이 필요합니다.' || res.msg === '본인 글만 확인할 수 있습니다.') {
      ciShowView(t, 'list');
      const form = ciState(t).config?.form;
      if (form) {
        ciState(t)._pendingView = 'list';
        ciShowLoginGate(t, form);
      }
      return;
    }
    if (box) box.innerHTML = `<div class="ci-error" style="margin:16px;">${ciEsc(res.msg || '오류')}</div>`;
    return;
  }

  const item    = res.item;
  const fields  = item.fields  || [];
  const answers = item.answers || [];
  const comments= item.comments|| [];
  const config  = ciState(t).config;
  const form    = config?.form || {};

  // 필드값 표시
  const fieldRows = fields.map(f => {
    const val = item[f.field_key] || '';
    return `<div class="ci-detail-field">
      <div class="ci-detail-field-label">${ciEsc(f.label)}</div>
      <div class="ci-detail-field-value">${f.type === 'file' && val ? `<a class="ci-file-link" href="${ciEsc(val)}" target="_blank">📎 첨부파일</a>` : ciEsc(val)}</div>
    </div>`;
  }).join('');

  // 답변 영역 — reply_use가 1이거나 answers가 있으면 표시
  let answerHtml = '';
  if (form.reply_use == 1 || answers.length > 0) {
    const ansItems = answers.map(a => `
      <div class="ci-answer-item">
        <div class="ci-answer-meta">
          <span class="ci-answer-admin-badge">관리자 답변</span>
          <span class="ci-answer-date">${a.created_at ? a.created_at.slice(0,16) : ''}</span>
        </div>
        <div class="ci-answer-content">${ciEsc(a.content || '')}</div>
      </div>`).join('');
    answerHtml = `
      <div class="ci-answer-wrap">
        <div class="ci-answer-head">답변 <span>${answers.length}</span></div>
        ${answers.length ? ansItems : '<div class="ci-answer-empty">아직 답변이 없습니다.</div>'}
      </div>`;
  }

  // 댓글 영역 — 무조건 로그인 필수
  let commentHtml = '';
  if (form.comment_use == 1) {
    const user = ciState(t).user;
    const commentItems = comments.map(c => {
      const isAdmin = parseInt(c.is_admin) === 1;
      return `
      <div class="board-comment-item ${isAdmin ? 'admin-comment' : ''}">
        <div class="board-comment-author-row">
          ${isAdmin ? '<span class="board-comment-admin-badge">관리자</span>' : ''}
          <span class="board-comment-name">${ciEsc(c.author_name || c.author || '익명')}</span>
          <span class="board-comment-date">${c.created_at ? c.created_at.slice(0,16) : ''}</span>
          ${user && c.author_id === user.id ? `<div class="board-comment-actions"><button class="board-btn board-btn-sm board-btn-red" onclick="ciDeleteComment('${t}', ${c.id}, ${id})">삭제</button></div>` : ''}
        </div>
        <div class="board-comment-content">${ciEsc(c.content || '')}</div>
      </div>`;
    }).join('');

    const writeForm = user
      ? `<div class="board-comment-form-wrap">
           <textarea id="ci-comment-inp-${t}" placeholder="댓글을 입력하세요" rows="3"></textarea>
           <div class="board-comment-submit-row">
             <button class="board-btn board-btn-blue" onclick="ciWriteComment('${t}', ${id})">댓글 등록</button>
           </div>
         </div>`
      : `<div style="padding:14px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;">
           <span style="font-size:.82rem;color:var(--g4,#888);">댓글을 작성하려면 로그인이 필요합니다.</span>
           <button class="ci-login-nudge-btn" style="padding:6px 20px;font-size:.8rem;" onclick="ciState('${t}')._pendingView='detail';ciShowLoginGate('${t}',ciState('${t}').config?.form)">로그인</button>
         </div>`;

    commentHtml = `
      <div class="board-comments-wrap">
        <div class="board-comments-head">댓글 <span>${comments.length}</span></div>
        ${commentItems}
        ${writeForm}
      </div>`;
  }

  box.innerHTML = `
    <div class="board-detail-head">
      <div class="board-detail-title">${ciEsc(item.title || '(제목 없음)')}</div>
      <div class="board-detail-meta">
        <span>${ciEsc(item.login_id ? ciMaskId(item.login_id) : '익명')}</span>
        <span>${item.created_at ? item.created_at.slice(0,16) : ''}</span>
        <span class="ci-status ci-status-default">${ciEsc(item.status_label || '접수')}</span>
      </div>
    </div>
    <div class="ci-detail-fields">${fieldRows}</div>
    ${answerHtml}
    ${commentHtml}
    <div class="board-detail-footer">
      <button class="board-btn board-btn-ghost" onclick="ciShowView('${t}', 'list')">← 목록으로</button>
    </div>`;
}

/* ── 댓글 등록 ── */
async function ciWriteComment(t, rowId) {
  const inp = document.getElementById('ci-comment-inp-' + t);
  const content = inp?.value.trim();
  if (!content) return;
  const res = await ciFetch('/admin/api_front/custom_inquiry_public.php?action=comment_write', {
    method: 'POST', body: JSON.stringify({ table_name: t, row_id: rowId, content }),
  });
  if (res.ok) { if (inp) inp.value = ''; ciLoadDetail(t, rowId); }
  else ciToast(res.msg || '댓글 등록 실패', 'error');
}

/* ── 댓글 삭제 ── */
async function ciDeleteComment(t, commentId, rowId) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return;
  const res = await ciFetch('/admin/api_front/custom_inquiry_public.php?action=comment_delete', {
    method: 'POST', body: JSON.stringify({ table_name: t, comment_id: commentId }),
  });
  if (res.ok) ciLoadDetail(t, rowId);
  else ciToast(res.msg || '삭제 실패', 'error');
}

/* ════════════════════════════════════════════════
   뷰 전환
════════════════════════════════════════════════ */
function ciShowView(t, viewName) {
  ['form', 'list', 'detail'].forEach(v => {
    const el = document.getElementById(`ci-view-${v}-${t}`);
    if (el) el.classList.toggle('ci-active', v === viewName);
  });
  if (viewName === 'list') ciLoadList(t, ciState(t).listPage || 1);
}

/* 사용자가 "새 문의" 버튼 클릭 시 — 로그인 체크 포함 */
function ciGoToForm(t) {
  const config = ciState(t).config;
  const form   = config?.form;
  if (form?.login_use && !ciState(t).user) {
    ciState(t)._pendingView = 'form';
    ciShowLoginGate(t, form);
    return;
  }
  ciShowView(t, 'form');
}

/* ════════════════════════════════════════════════
   유틸
════════════════════════════════════════════════ */
function ciShowLoading(t, show) {
  const el = document.getElementById('ci-loading-' + t);
  if (el) el.style.display = show ? '' : 'none';
}

function ciSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function ciShowError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? '' : 'none';
}

function ciEsc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ciMaskId(loginId) {
  const provMap = { kakao: '카카오', naver: '네이버', google: '구글', email: '이메일' };
  const sep = loginId.indexOf('_');
  if (sep === -1) return loginId;
  const prov = loginId.slice(0, sep);
  const uid  = loginId.slice(sep + 1);
  const masked = uid.length > 1 ? uid[0] + '*'.repeat(uid.length - 1) : uid;
  return (provMap[prov] || prov) + ' ' + masked;
}

function ciToast(msg, type) {
  if (typeof showToast === 'function') { showToast(msg, type); return; }
  // fallback
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(8,14,26,.88);color:#fff;padding:10px 22px;border-radius:100px;font-size:.82rem;font-weight:700;z-index:9999;';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

async function ciFetch(url, options = {}) {
  try {
    const defaults = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };
    const res = await fetch(url, { ...defaults, ...options, headers: { ...defaults.headers, ...(options.headers || {}) } });
    const text = await res.text();
    if (!text) return { ok: false, msg: '빈 응답' };
    try {
      return JSON.parse(text);
    } catch (e) {
      return { ok: false, msg: '응답 파싱 오류 (' + res.status + ')' };
    }
  } catch (e) {
    return { ok: false, msg: '네트워크 오류' };
  }
}

/* ════════════════════════════════════════════════
   모달 공통 CSS 자동 주입
════════════════════════════════════════════════ */
(function ciInjectModalCSS() {
  if (document.getElementById('ci-modal-style')) return;
  const style = document.createElement('style');
  style.id = 'ci-modal-style';
  style.textContent = `
    .ci-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.45);
      z-index: 9000;
    }
    .ci-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      padding: 36px 32px 28px;
      z-index: 9001;
      width: min(420px, 92vw);
      max-height: 85vh;
      overflow-y: auto;
    }
    .ci-modal-close {
      position: absolute;
      top: 14px;
      right: 16px;
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      color: #888;
      padding: 4px 8px;
    }
    .ci-modal-close:hover { color: #333; }
    .ci-login-nudge-btn {
      display: inline-block;
      margin-top: 4px;
      padding: 8px 20px;
      font-size: .82rem;
      font-weight: 600;
      color: var(--sky, #2563eb);
      background: none;
      border: 1.5px solid var(--sky, #2563eb);
      border-radius: 100px;
      cursor: pointer;
      transition: background .15s;
    }
    .ci-login-nudge-btn:hover {
      background: rgba(37,99,235,.06);
    }
    .ci-ok-modal {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `;
  document.head.appendChild(style);
})();
