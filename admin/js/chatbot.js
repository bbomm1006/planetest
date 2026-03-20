// ===========================
// CHATBOT ADMIN JS
// ===========================

/* ──────────────────────────────────────
   안전한 API 래퍼 (JSON 파싱 실패 대비)
─────────────────────────────────────── */
async function cbApi(method, params) {
  try {
    const res = method === 'GET'
      ? await apiGet('api/chatbot.php', params)
      : await apiPost('api/chatbot.php', params);
    return res ?? { ok: false, msg: '응답 없음' };
  } catch (e) {
    console.error('[chatbot API error]', e);
    return { ok: false, msg: '통신 오류가 발생했습니다.' };
  }
}

/* ──────────────────────────────────────
   KB (지식베이스)
─────────────────────────────────────── */
let cbKbData = [];

async function loadCbKb() {
  const res = await cbApi('GET', { action: 'kbList' });
  if (res.ok) { cbKbData = res.data; renderCbKbTable(); }
}

function renderCbKbTable() {
  const kw   = (document.getElementById('cbKbSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('cbKbBody');
  if (!tbody) return;
  const rows = kw
    ? cbKbData.filter(r => r.keywords.toLowerCase().includes(kw) || r.answer.toLowerCase().includes(kw))
    : cbKbData;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 항목이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((r, i) => `
    <tr data-id="${r.id}">
      <td><input type="checkbox" class="row-check" data-id="${r.id}" onchange="updateBulkBar('cbKbBulk')"></td>
      <td class="drag-handle" style="cursor:grab;text-align:center;color:var(--text-muted)">⠿</td>
      <td class="row-num">${i + 1}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.keywords)}</td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.answer)}</td>
      <td style="font-size:.8rem;color:var(--text-muted)">${r.follow_text ? esc(r.follow_text) : '—'}</td>
      <td>
        <label class="toggle" title="${r.is_active ? '활성' : '비활성'}">
          <input type="checkbox" ${r.is_active == 1 ? 'checked' : ''} onchange="toggleCbKb(${r.id}, this)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openCbKbModal(${r.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteCbKb(${r.id})">삭제</button>
      </div></td>
    </tr>`).join('');
  initDragSort(tbody, 'api/chatbot.php', 'kbReorder', loadCbKb);
}

function openCbKbModal(id) {
  document.getElementById('cbKbModalTitle').textContent = id ? '지식베이스 수정' : '지식베이스 추가';
  document.getElementById('cbKbModalId').value           = id || '';
  const r = id ? cbKbData.find(x => x.id == id) : null;
  document.getElementById('cbKbModalKeywords').value     = r ? r.keywords    : '';
  document.getElementById('cbKbModalAnswer').value       = r ? r.answer      : '';
  document.getElementById('cbKbModalFollowText').value   = r ? (r.follow_text    || '') : '';
  document.getElementById('cbKbModalFollowCtx').value    = r ? (r.follow_context || '') : '';
  openModal('cbKbModal');
}

async function saveCbKb() {
  const payload = {
    action:         'kbSave',
    id:             document.getElementById('cbKbModalId').value,
    keywords:       document.getElementById('cbKbModalKeywords').value.trim(),
    answer:         document.getElementById('cbKbModalAnswer').value.trim(),
    follow_text:    document.getElementById('cbKbModalFollowText').value.trim(),
    follow_context: document.getElementById('cbKbModalFollowCtx').value.trim(),
  };
  const res = await cbApi('POST', payload);
  if (res.ok) { showToast('저장되었습니다.', 'success'); closeModal('cbKbModal'); loadCbKb(); }
  else showToast(res.msg || '저장 실패', 'error');
}

async function toggleCbKb(id, el) {
  const res = await cbApi('POST', { action: 'kbToggle', id });
  if (res.ok) { const r = cbKbData.find(x => x.id == id); if (r) r.is_active = res.is_active; }
  else { el.checked = !el.checked; showToast('변경 실패', 'error'); }
}

async function deleteCbKb(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await cbApi('POST', { action: 'kbDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCbKb(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

async function cbKbBulkDelete() {
  const ids = [...document.querySelectorAll('#cbKbBody .row-check:checked')].map(el => el.dataset.id);
  if (!ids.length) { showToast('선택된 항목이 없습니다.', 'error'); return; }
  if (!confirm(`${ids.length}건을 삭제하시겠습니까?`)) return;
  const res = await cbApi('POST', { action: 'kbBulkDelete', ids: JSON.stringify(ids) });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCbKb(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

/* ──────────────────────────────────────
   Context (후속질문 분기)
─────────────────────────────────────── */
let cbCtxData = [];

async function loadCbCtx() {
  const res = await cbApi('GET', { action: 'ctxList' });
  if (res.ok) { cbCtxData = res.data; renderCbCtxTable(); }
}

function renderCbCtxTable() {
  const kw    = (document.getElementById('cbCtxSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('cbCtxBody');
  if (!tbody) return;
  const rows = kw
    ? cbCtxData.filter(r => r.context_key.toLowerCase().includes(kw) || r.keywords.toLowerCase().includes(kw))
    : cbCtxData;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 항목이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((r, i) => `
    <tr data-id="${r.id}">
      <td><input type="checkbox" class="row-check" data-id="${r.id}" onchange="updateBulkBar('cbCtxBulk')"></td>
      <td class="row-num">${i + 1}</td>
      <td><code style="font-size:.8rem;background:var(--bg-hover);padding:2px 6px;border-radius:4px;">${esc(r.context_key)}</code></td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.keywords)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.answer)}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem;color:var(--text-muted)">${r.fallback ? esc(r.fallback) : '—'}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${r.is_active == 1 ? 'checked' : ''} onchange="toggleCbCtx(${r.id}, this)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openCbCtxModal(${r.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteCbCtx(${r.id})">삭제</button>
      </div></td>
    </tr>`).join('');
}

function openCbCtxModal(id) {
  document.getElementById('cbCtxModalTitle').textContent = id ? '컨텍스트 수정' : '컨텍스트 추가';
  document.getElementById('cbCtxModalId').value          = id || '';
  const r = id ? cbCtxData.find(x => x.id == id) : null;
  document.getElementById('cbCtxModalKey').value         = r ? r.context_key : '';
  document.getElementById('cbCtxModalKeywords').value    = r ? r.keywords    : '';
  document.getElementById('cbCtxModalAnswer').value      = r ? r.answer      : '';
  document.getElementById('cbCtxModalFallback').value    = r ? (r.fallback || '') : '';
  openModal('cbCtxModal');
}

async function saveCbCtx() {
  const payload = {
    action:      'ctxSave',
    id:          document.getElementById('cbCtxModalId').value,
    context_key: document.getElementById('cbCtxModalKey').value.trim(),
    keywords:    document.getElementById('cbCtxModalKeywords').value.trim(),
    answer:      document.getElementById('cbCtxModalAnswer').value.trim(),
    fallback:    document.getElementById('cbCtxModalFallback').value.trim(),
  };
  const res = await cbApi('POST', payload);
  if (res.ok) { showToast('저장되었습니다.', 'success'); closeModal('cbCtxModal'); loadCbCtx(); }
  else showToast(res.msg || '저장 실패', 'error');
}

async function toggleCbCtx(id, el) {
  const res = await cbApi('POST', { action: 'ctxToggle', id });
  if (res.ok) { const r = cbCtxData.find(x => x.id == id); if (r) r.is_active = res.is_active; }
  else { el.checked = !el.checked; showToast('변경 실패', 'error'); }
}

async function deleteCbCtx(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await cbApi('POST', { action: 'ctxDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCbCtx(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

async function cbCtxBulkDelete() {
  const ids = [...document.querySelectorAll('#cbCtxBody .row-check:checked')].map(el => el.dataset.id);
  if (!ids.length) { showToast('선택된 항목이 없습니다.', 'error'); return; }
  if (!confirm(`${ids.length}건을 삭제하시겠습니까?`)) return;
  const res = await cbApi('POST', { action: 'ctxBulkDelete', ids: JSON.stringify(ids) });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCbCtx(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

/* ──────────────────────────────────────
   Quick (빠른질문 버튼)
─────────────────────────────────────── */
let cbQuickData = [];

async function loadCbQuick() {
  const res = await cbApi('GET', { action: 'quickList' });
  if (res.ok) { cbQuickData = res.data; renderCbQuickTable(); }
}

function renderCbQuickTable() {
  const tbody = document.getElementById('cbQuickBody');
  if (!tbody) return;
  if (!cbQuickData.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 버튼이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = cbQuickData.map((r, i) => `
    <tr data-id="${r.id}">
      <td class="drag-handle" style="cursor:grab;text-align:center;color:var(--text-muted)">⠿</td>
      <td class="row-num">${i + 1}</td>
      <td><strong>${esc(r.label)}</strong></td>
      <td>${esc(r.question_text)}</td>
      <td style="font-size:.8rem;color:var(--text-muted)">${r.context_key ? `<code style="background:var(--bg-hover);padding:2px 6px;border-radius:4px;">${esc(r.context_key)}</code>` : '—'}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${r.is_active == 1 ? 'checked' : ''} onchange="toggleCbQuick(${r.id}, this)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openCbQuickModal(${r.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteCbQuick(${r.id})">삭제</button>
      </div></td>
    </tr>`).join('');
  initDragSort(tbody, 'api/chatbot.php', 'quickReorder', loadCbQuick);
}

function openCbQuickModal(id) {
  document.getElementById('cbQuickModalTitle').textContent = id ? '빠른질문 버튼 수정' : '빠른질문 버튼 추가';
  document.getElementById('cbQuickModalId').value           = id || '';
  const r = id ? cbQuickData.find(x => x.id == id) : null;
  document.getElementById('cbQuickModalLabel').value        = r ? r.label         : '';
  document.getElementById('cbQuickModalQuestion').value     = r ? r.question_text : '';
  document.getElementById('cbQuickModalCtxKey').value       = r ? (r.context_key || '') : '';
  openModal('cbQuickModal');
}

async function saveCbQuick() {
  const payload = {
    action:        'quickSave',
    id:            document.getElementById('cbQuickModalId').value,
    label:         document.getElementById('cbQuickModalLabel').value.trim(),
    question_text: document.getElementById('cbQuickModalQuestion').value.trim(),
    context_key:   document.getElementById('cbQuickModalCtxKey').value.trim(),
  };
  const res = await cbApi('POST', payload);
  if (res.ok) { showToast('저장되었습니다.', 'success'); closeModal('cbQuickModal'); loadCbQuick(); }
  else showToast(res.msg || '저장 실패', 'error');
}

async function toggleCbQuick(id, el) {
  const res = await cbApi('POST', { action: 'quickToggle', id });
  if (res.ok) { const r = cbQuickData.find(x => x.id == id); if (r) r.is_active = res.is_active; }
  else { el.checked = !el.checked; showToast('변경 실패', 'error'); }
}

async function deleteCbQuick(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await cbApi('POST', { action: 'quickDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCbQuick(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

/* ──────────────────────────────────────
   Default (기본 답변)
─────────────────────────────────────── */
let cbDefData = [];

async function loadCbDef() {
  const res = await cbApi('GET', { action: 'defList' });
  if (res.ok) { cbDefData = res.data; renderCbDefTable(); }
}

function renderCbDefTable() {
  const tbody = document.getElementById('cbDefBody');
  if (!tbody) return;
  if (!cbDefData.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:32px;">등록된 기본 답변이 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = cbDefData.map((r, i) => `
    <tr data-id="${r.id}">
      <td class="row-num">${i + 1}</td>
      <td>${esc(r.answer)}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${r.is_active == 1 ? 'checked' : ''} onchange="toggleCbDef(${r.id}, this)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="openCbDefModal(${r.id})">수정</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteCbDef(${r.id})">삭제</button>
      </div></td>
    </tr>`).join('');
}

function openCbDefModal(id) {
  document.getElementById('cbDefModalTitle').textContent = id ? '기본 답변 수정' : '기본 답변 추가';
  document.getElementById('cbDefModalId').value          = id || '';
  const r = id ? cbDefData.find(x => x.id == id) : null;
  document.getElementById('cbDefModalAnswer').value      = r ? r.answer : '';
  openModal('cbDefModal');
}

async function saveCbDef() {
  const payload = {
    action: 'defSave',
    id:     document.getElementById('cbDefModalId').value,
    answer: document.getElementById('cbDefModalAnswer').value.trim(),
  };
  const res = await cbApi('POST', payload);
  if (res.ok) { showToast('저장되었습니다.', 'success'); closeModal('cbDefModal'); loadCbDef(); }
  else showToast(res.msg || '저장 실패', 'error');
}

async function toggleCbDef(id, el) {
  const res = await cbApi('POST', { action: 'defToggle', id });
  if (res.ok) { const r = cbDefData.find(x => x.id == id); if (r) r.is_active = res.is_active; }
  else { el.checked = !el.checked; showToast('변경 실패', 'error'); }
}

async function deleteCbDef(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await cbApi('POST', { action: 'defDelete', id });
  if (res.ok) { showToast('삭제되었습니다.', 'success'); loadCbDef(); }
  else showToast(res.msg || '삭제 실패', 'error');
}

/* ──────────────────────────────────────
   Config (봇 설정)
─────────────────────────────────────── */
async function loadCbConfig() {
  const res = await cbApi('GET', { action: 'configLoad' });
  if (!res.ok) return;
  const d = res.data;
  const set = (id, key) => { const el = document.getElementById(id); if (el && d[key] !== undefined) el.value = d[key]; };
  set('cfgBotName',   'bot_name');
  set('cfgBotStatus', 'bot_status');
  set('cfgWelcome',   'welcome_message');
  set('cfgMorning',   'greeting_morning');
  set('cfgAfternoon', 'greeting_afternoon');
  set('cfgEvening',   'greeting_evening');
  set('cfgPhone',     'phone_number');
  set('cfgFooter',    'footer_note');
  set('cfgFallback',  'default_fallback');
  set('cfgError',     'error_message');
}

async function saveCbConfig() {
  const payload = {
    action:             'configSave',
    bot_name:           document.getElementById('cfgBotName').value.trim(),
    bot_status:         document.getElementById('cfgBotStatus').value.trim(),
    welcome_message:    document.getElementById('cfgWelcome').value.trim(),
    greeting_morning:   document.getElementById('cfgMorning').value.trim(),
    greeting_afternoon: document.getElementById('cfgAfternoon').value.trim(),
    greeting_evening:   document.getElementById('cfgEvening').value.trim(),
    phone_number:       document.getElementById('cfgPhone').value.trim(),
    footer_note:        document.getElementById('cfgFooter').value.trim(),
    default_fallback:   document.getElementById('cfgFallback').value.trim(),
    error_message:      document.getElementById('cfgError').value.trim(),
  };
  const res = await cbApi('POST', payload);
  if (res.ok) showToast('설정이 저장되었습니다.', 'success');
  else showToast(res.msg || '저장 실패', 'error');
}

/* ──────────────────────────────────────
   showPage 훅 - 페이지 전환 시 데이터 로드
─────────────────────────────────────── */
(function () {
  const _orig = window.showPage;
  window.showPage = function (page) {
    if (typeof _orig === 'function') _orig(page);
    if (page === 'chatbotKB')      loadCbKb();
    if (page === 'chatbotContext')  loadCbCtx();
    if (page === 'chatbotQuick')    loadCbQuick();
    if (page === 'chatbotConfig') { loadCbDef(); loadCbConfig(); }
  };
})();
