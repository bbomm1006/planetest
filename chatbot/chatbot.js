(function () {

  let KB           = [];
  let CONTEXT_MAP  = {};
  let QUICK_LIST   = [];
  let DEFAULT_ANSWERS = [];
  let CONFIG       = {};  // ← 추가

  const state = { open: false, typing: false, msgId: 0, waitingFor: null, resetting: false };

  function getApiUrl() {
    return '/chatbot/api.php';
  }

  /* ══════════════════════════════════════════
     DB에서 챗봇 데이터 로드
  ══════════════════════════════════════════ */
  async function loadChatbotData() {
    try {
      const res  = await fetch(getApiUrl());
      const data = await res.json();

      CONFIG = data.config || {};  // ← 추가

      KB = (data.kb || []).map(row => ({
        keys: row.keywords.split(',').map(k => k.trim()).filter(Boolean),
        answers: [row.answer],
        follow: (row.follow_text && row.follow_context)
          ? { text: row.follow_text, context: row.follow_context }
          : null,
      }));

      const ctxMap = {};
      (data.context || []).forEach(row => {
        const key = row.context_key;
        if (!ctxMap[key]) ctxMap[key] = { branches: [], fallback: row.fallback || '' };
        ctxMap[key].branches.push({
          keys:   row.keywords.split(',').map(k => k.trim()).filter(Boolean),
          answer: row.answer,
        });
        if (row.fallback) ctxMap[key].fallback = row.fallback;
      });
      CONTEXT_MAP = ctxMap;

      QUICK_LIST = (data.quick || []).map(row => ({
        label:    row.label,
        question: row.question_text,
        context:  row.context_key || null,
      }));

      DEFAULT_ANSWERS = (data.defaults || []).map(r => r.answer);
      if (!DEFAULT_ANSWERS.length) {
        DEFAULT_ANSWERS = [CONFIG.default_fallback || '죄송해요, 이해하지 못했어요. 전화 상담(' + (CONFIG.phone_number || '1588-0000') + ')을 이용해보세요!'];
      }

    } catch (e) {
      console.error('[ChatBot] 데이터 로드 실패:', e);
      DEFAULT_ANSWERS = [CONFIG.error_message || '잠시 오류가 발생했어요. 전화 상담으로 문의해 주세요.'];
    }
  }

  /* ══════════════════════════════════════════
     응답 매칭
  ══════════════════════════════════════════ */
  function findAnswer(input) {
    const text = input.replace(/\s/g, '').toLowerCase();

    if (state.waitingFor && CONTEXT_MAP[state.waitingFor]) {
      const ctx = CONTEXT_MAP[state.waitingFor];
      state.waitingFor = null;

      for (const branch of ctx.branches) {
        for (const key of branch.keys) {
          if (text.includes(key.replace(/\s/g, '').toLowerCase())) {
            return { text: branch.answer, follow: null };
          }
        }
      }
      return { text: ctx.fallback || DEFAULT_ANSWERS[0], follow: null };
    }

    let best = null, bestScore = 0;
    for (const rule of KB) {
      let score = 0;
      for (const key of rule.keys) {
        if (text.includes(key.replace(/\s/g, '').toLowerCase())) score++;
      }
      if (score > bestScore) { bestScore = score; best = rule; }
    }

    if (!best || bestScore === 0) {
      return { text: DEFAULT_ANSWERS[Math.floor(Math.random() * DEFAULT_ANSWERS.length)], follow: null };
    }
    return {
      text:   best.answers[Math.floor(Math.random() * best.answers.length)],
      follow: best.follow || null,
    };
  }

  /* ══════════════════════════════════════════
     HTML 삽입
  ══════════════════════════════════════════ */
  function buildQuickButtons() {
    return QUICK_LIST.map(q =>
      `<button onclick="cbQ(this)" data-q="${esc(q.question)}"${q.context ? ` data-context="${esc(q.context)}"` : ''}>${esc(q.label)}</button>`
    ).join('');
  }

  /* ══════════════════════════════════════════
     CSS 로드 — 완료 콜백 지원
  ══════════════════════════════════════════ */
  function injectCSS(onLoaded) {
    const s = [...document.querySelectorAll('script')].find(s => s.src.includes('chatbot'));
    const base = s ? s.src.replace(/chatbot\.js(\?.*)?$/, '') : '';
    // 이미 로드됐으면 바로 콜백
    if (document.querySelector(`link[href*="chatbot"][href*="style.css"]`)) {
      if (onLoaded) onLoaded();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.type = 'text/css';
    link.href = base + 'style.css';
    if (onLoaded) {
      link.onload  = onLoaded;
      link.onerror = onLoaded; // 실패해도 진행
    }
    document.head.appendChild(link);
  }

  function injectHTML() {
    const botName   = CONFIG.bot_name    || '스마트 AI 상담';
    const botStatus = CONFIG.bot_status  || '온라인 · 즉시 응답';
    const footerNote= CONFIG.footer_note || 'AI 답변은 참고용이며, 정확한 상담은 전화로 문의하세요.';

    document.body.insertAdjacentHTML('beforeend', `
<button class="cb-fab" id="cbFab" onclick="cbToggle()" aria-label="AI 상담 열기">
  <span class="cb-fab-icon" id="cbIconChat">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </span>
  <span class="cb-fab-icon" id="cbIconClose" style="display:none">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </span>
  <span class="cb-badge" id="cbBadge">1</span>
</button>

<div class="cb-panel cb-ready" id="cbPanel">
  <div class="cb-header">
    <div class="cb-header-left">
      <div class="cb-avatar">🤖</div>
      <div>
        <div class="cb-hname">${esc(botName)}</div>
        <div class="cb-hstatus"><span class="cb-dot-green"></span>${esc(botStatus)}</div>
      </div>
    </div>
    <div class="cb-header-right">
      <button class="cb-hreset" onclick="cbReset()">처음으로</button>
      <button class="cb-hclose" onclick="cbToggle()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>

  <div class="cb-messages" id="cbMessages"></div>

  <div class="cb-quick cb-quick--hidden" id="cbQuick"></div>

  <div class="cb-input-wrap">
    <textarea class="cb-input" id="cbInput" placeholder="보험에 대해 무엇이든 물어보세요..." rows="1"
      onkeydown="cbKey(event)" oninput="cbResize(this)"></textarea>
    <button class="cb-send" id="cbSend" onclick="cbSend()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </div>
  <div class="cb-note">${esc(footerNote)}</div>
</div>`);
  }

  function inject() {
    // CSS를 먼저 로드하고, 완료 후 HTML 삽입 → CSS 없이 렌더링되는 flash 원천 차단
    injectCSS(function() {
      injectHTML();
      requestAnimationFrame(function() {
        showWelcome();
      });
    });
  }

  /* ══════════════════════════════════════════
     웰컴 메시지
  ══════════════════════════════════════════ */
  function showWelcome() {
    const h = new Date().getHours();
    const g = h < 12
      ? (CONFIG.greeting_morning   || '좋은 아침이에요 ☀️')
      : h < 18
      ? (CONFIG.greeting_afternoon || '안녕하세요 👋')
      : (CONFIG.greeting_evening   || '안녕하세요 🌙');

    const welcome = CONFIG.welcome_message || '챗봇이에요! 무엇이든 편하게 질문해 주세요.';
    addBot(`${g} ${welcome}`);

    const q = document.getElementById('cbQuick');
    if (q) {
      q.innerHTML = buildQuickButtons();
      q.classList.remove('cb-quick--hidden');
    }

    setTimeout(() => document.getElementById('cbBadge')?.classList.add('pulse'), 2500);
  }

  /* ══════════════════════════════════════════
     처음으로 리셋
  ══════════════════════════════════════════ */
  window.cbReset = function () {
    state.waitingFor = null;
    state.typing = false;
    state.resetting = true;
    document.getElementById('cbMessages').innerHTML = '';
    const input = document.getElementById('cbInput');
    input.value = ''; input.style.height = 'auto';
    const q = document.getElementById('cbQuick');
    q.innerHTML = buildQuickButtons();
    q.classList.remove('cb-quick--hidden');
    showWelcome();
    setTimeout(() => { state.resetting = false; }, 200);
  };

  /* ══════════════════════════════════════════
     공개 함수
  ══════════════════════════════════════════ */
  window.cbToggle = function () {
    state.open = !state.open;
    document.getElementById('cbPanel').classList.toggle('open', state.open);
    document.getElementById('cbFab').classList.toggle('active', state.open);
    document.getElementById('cbIconChat').style.display  = state.open ? 'none' : 'flex';
    document.getElementById('cbIconClose').style.display = state.open ? 'flex' : 'none';
    if (state.open) {
      document.getElementById('cbBadge').style.display = 'none';
      document.getElementById('cbBadge').classList.remove('pulse');
      setTimeout(() => document.getElementById('cbInput')?.focus(), 300);
    }
  };

  window.cbQ = function (btn) {
    const context  = btn.dataset.context;
    const question = btn.dataset.q;
    if (!state.resetting) {
      document.getElementById('cbQuick').classList.add('cb-quick--hidden');
    }
    if (context) {
      state.waitingFor = context;
      addBot(question);
    } else {
      processInput(question);
    }
  };

  window.cbKey    = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cbSend(); } };
  window.cbResize = function (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; };
  window.cbSend   = function () {
    const el = document.getElementById('cbInput');
    const text = el.value.trim();
    if (!text || state.typing) return;
    el.value = ''; el.style.height = 'auto';
    document.getElementById('cbQuick').classList.add('cb-quick--hidden');
    processInput(text);
  };

  /* ══════════════════════════════════════════
     응답 처리
  ══════════════════════════════════════════ */
  function processInput(text) {
    if (state.typing) return;
    state.typing = true;
    addUser(text);
    const typingId = addTyping();
    setTimeout(() => {
      removeMsg(typingId);
      const result = findAnswer(text);
      addBot(result.text, result.follow);
      state.typing = false;
    }, 600 + Math.random() * 700);
  }

  /* ══════════════════════════════════════════
     메시지 UI
  ══════════════════════════════════════════ */
  function addUser(text) {
    const id = ++state.msgId;
    const el = document.createElement('div');
    el.className = 'cb-msg cb-user'; el.id = 'cbM' + id;
    el.innerHTML = `<div class="cb-bubble cb-ububble">${esc(text)}</div>`;
    append(el);
  }

  function addBot(text, follow) {
    const id = ++state.msgId;
    const el = document.createElement('div');
    el.className = 'cb-msg cb-bot'; el.id = 'cbM' + id;
    const fmt = esc(text).replace(/\n/g, '<br>');
    let followHTML = '';
    if (follow) {
      followHTML = `<div class="cb-follow" onclick="cbQ(this)" data-q="${esc(follow.text)}" data-context="${esc(follow.context)}">👉 ${esc(follow.text)}</div>`;
    }
    el.innerHTML = `
      <div class="cb-bot-row">
        <div class="cb-mini-av">🤖</div>
        <div class="cb-bubble cb-bbubble">${fmt}${followHTML}</div>
      </div>
      <div class="cb-time">${getNow()}</div>`;
    append(el);
  }

  function addTyping() {
    const id = ++state.msgId;
    const el = document.createElement('div');
    el.className = 'cb-msg cb-bot'; el.id = 'cbM' + id;
    el.innerHTML = `<div class="cb-bot-row"><div class="cb-mini-av">🤖</div><div class="cb-bubble cb-bbubble cb-typing"><span class="cb-td"></span><span class="cb-td"></span><span class="cb-td"></span></div></div>`;
    append(el);
    return id;
  }

  function removeMsg(id) { document.getElementById('cbM' + id)?.remove(); }
  function append(el) { const c = document.getElementById('cbMessages'); c.appendChild(el); c.scrollTop = c.scrollHeight; }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function getNow() { const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }

  /* ── 초기화 ── */
  async function init() {
    await loadChatbotData();
    inject(); // CSS 로드 → HTML 삽입 → showWelcome 순서로 내부 처리
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 100);
  } else {
    window.addEventListener('load', function() {
      setTimeout(init, 100);
    });
  }

  // bfcache 복원 시 챗봇 강제 닫기 (크롬 뒤로가기 캐시 대응)
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      // bfcache에서 복원된 경우 패널 강제 닫기
      const panel = document.getElementById('cbPanel');
      const fab   = document.getElementById('cbFab');
      const iconChat  = document.getElementById('cbIconChat');
      const iconClose = document.getElementById('cbIconClose');
      if (panel) panel.classList.remove('open');
      if (fab)   fab.classList.remove('active');
      if (iconChat)  iconChat.style.display  = 'flex';
      if (iconClose) iconClose.style.display = 'none';
      state.open = false;
    }
  });

})();