

// ===========================
// BULK SELECT / DELETE
// ===========================
function updateBulkBar(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  const card = bar.closest('.card-body');
  const checked = card ? card.querySelectorAll('.row-check:checked').length : 0;
  bar.querySelector('.bulk-count').textContent = checked;
  bar.classList.toggle('show', checked > 0);
}

function bulkDelete(barId, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const checked = tbody.querySelectorAll('.row-check:checked');
  if (checked.length === 0) return;
  if (!confirm(`선택한 ${checked.length}건을 삭제하시겠습니까?`)) return;
  checked.forEach(cb => cb.closest('tr').remove());
  updateBulkBar(barId);
  showToast(`${checked.length}건이 삭제되었습니다.`, 'success');
}