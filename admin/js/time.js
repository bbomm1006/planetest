
// ===========================
// TIME SELECTS
// ===========================
function fillTimeSelects() {
  ['rsStart','rsEnd'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let h = 0; h < 24; h++) {
      ['00','30'].forEach(m => {
        const o = document.createElement('option');
        o.value = o.textContent = `${String(h).padStart(2,'0')}:${m}`;
        sel.appendChild(o);
      });
    }
    sel.value = id === 'rsStart' ? '09:00' : '18:00';
  });
}