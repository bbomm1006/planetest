// =====================================================
// 알림톡 설정 관리
// =====================================================

async function loadAlimtalkSettings() {
  const res = await apiGet('api/alimtalk.php', { action: 'get' });
  if (!res.ok) return;
  const d = res.data || {};
  document.getElementById('at_api_key').value    = d.api_key    || '';
  document.getElementById('at_api_secret').value = d.api_secret ? '••••••••••••' : '';
  document.getElementById('at_sender').value     = d.sender     || '';
  document.getElementById('at_pfid').value       = d.pfid       || '';
  document.getElementById('at_tpl_notify').value = d.tpl_notify || '';
  document.getElementById('at_tpl_reply').value  = d.tpl_reply  || '';

  // 기존 secret 마스킹 상태 처리
  const secretEl = document.getElementById('at_api_secret');
  if (d.api_secret) {
    secretEl.dataset.masked = '1';
    secretEl.addEventListener('focus', function() {
      if (this.dataset.masked === '1') { this.value = ''; this.dataset.masked = '0'; }
    }, { once: true });
  }
}

async function saveAlimtalkSettings() {
  const secretEl  = document.getElementById('at_api_secret');
  const secretVal = secretEl.dataset.masked === '1' ? '' : secretEl.value.trim();
  const msgEl     = document.getElementById('at_save_msg');

  const data = {
    action:     'save',
    api_key:    document.getElementById('at_api_key').value.trim(),
    api_secret: secretVal,
    sender:     document.getElementById('at_sender').value.trim().replace(/-/g, ''),
    pfid:       document.getElementById('at_pfid').value.trim(),
    tpl_notify: document.getElementById('at_tpl_notify').value.trim(),
    tpl_reply:  document.getElementById('at_tpl_reply').value.trim(),
  };

  if (!data.api_key) { showToast('API Key를 입력해주세요.', 'error'); return; }
  if (!data.sender)  { showToast('발신번호를 입력해주세요.', 'error'); return; }

  const res = await apiPost('api/alimtalk.php', data);
  if (res.ok) {
    showToast('저장되었습니다.');
    loadAlimtalkSettings();
  } else {
    showToast(res.msg || '오류가 발생했습니다.', 'error');
  }
}
