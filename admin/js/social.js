

// ===========================
// SOCIAL MANAGEMENT
// ===========================
async function loadSocial() {
  const res = await apiGet('api/system.php', { action: 'socialGet' });
  if (!res.ok) return;
  const d = res.data;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('kakaoKey',      d.kakao_app_key);
  set('naverClientId', d.naver_client_id);
  set('naverSecret',   d.naver_client_secret);
  set('googleClientId',d.google_client_id);
  const mod = document.getElementById('socialLastMod');
  if (mod && d.updated_at) mod.textContent = '마지막 수정 : ' + d.updated_at.slice(0,16).replace('T',' ');
}

async function saveSocialMgmt() {
  const res = await apiPost('api/system.php', {
    action:              'socialSave',
    kakao_app_key:       document.getElementById('kakaoKey')?.value       || '',
    naver_client_id:     document.getElementById('naverClientId')?.value  || '',
    naver_client_secret: document.getElementById('naverSecret')?.value    || '',
    google_client_id:    document.getElementById('googleClientId')?.value || '',
  });
  if (res.ok) { showToast('저장되었습니다.', 'success'); loadSocial(); }
  else        { showToast('저장 실패', 'error'); }
}