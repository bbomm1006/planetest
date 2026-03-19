// ===========================
// MENU MANAGEMENT
// ===========================
function renderMenuChecks() {
  const container = document.getElementById('menuCheckList');
  if (!container) return;
  let html = '<p style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">기본 메뉴</p>';
  html += '<div class="checkbox-group" style="margin-bottom:20px;">';
  MENU_LIST_BASE.forEach(m => {
    const chk = menuState[m.key] !== false ? 'checked' : '';
    html += `<div class="checkbox-item"><input type="checkbox" id="menu_${m.key}" ${chk} onchange="menuState['${m.key}']=this.checked"><span>${m.label}</span></div>`;
  });
  html += '</div>';
  if (createdBoards.length > 0) {
    html += '<p style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;">게시판 메뉴</p>';
    html += '<div class="checkbox-group">';
    createdBoards.forEach(b => {
      const chk = menuState['board_'+b.table] !== false ? 'checked' : '';
      html += `<div class="checkbox-item"><input type="checkbox" id="menu_board_${b.table}" ${chk} onchange="menuState['board_${b.table}']=this.checked"><span>${b.name} (${b.table})</span></div>`;
    });
    html += '</div>';
  }
  container.innerHTML = html;
}

// saveMenuMgmt → admin.js의 async 버전 사용