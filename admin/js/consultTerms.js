async function loadConsultTermsList() {
  const res = await apiGet('api/consult_terms.php', { action: 'get' });
  if (!res.ok) return;
  const d = res.data;
  document.getElementById('consultTermsName').value = d.term_name || '';
  document.getElementById('consultTermsBody').value = d.term_body || '';
  const el = document.getElementById('consultTermsUpdated');
  if (el) el.textContent = d.updated_at ? '마지막 수정일 : ' + d.updated_at.slice(0,16) : '';
}

async function saveConsultTerms() {
  const name = document.getElementById('consultTermsName').value.trim();
  const body = document.getElementById('consultTermsBody').value.trim();
  const res = await apiPost('api/consult_terms.php', {
    action: 'save', term_name: name, term_body: body
  });
  if (res.ok) {
    showToast('저장되었습니다.', 'success');
    loadConsultTermsList();
  } else {
    showToast(res.msg || '저장 실패', 'error');
  }
}