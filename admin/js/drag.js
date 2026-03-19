// ===========================
// TABLE DRAG SORT
// ===========================
function initTableDrag(tbody, onReorder) {
  if (!tbody) return;
  let dragRow = null;
  const refresh = () => {
    tbody.querySelectorAll('tr').forEach(row => {
      row.setAttribute('draggable', 'true');
      row.removeEventListener('dragstart', row._ds);
      row.removeEventListener('dragend',   row._de);
      row.removeEventListener('dragover',  row._dov);
      row.removeEventListener('dragleave', row._dl);
      row.removeEventListener('drop',      row._drop);
      row._ds   = () => { dragRow = row; row.classList.add('row-dragging'); };
      row._de   = () => { row.classList.remove('row-dragging'); dragRow = null; };
      row._dov  = e => { e.preventDefault(); row.classList.add('row-drag-over'); };
      row._dl   = () => row.classList.remove('row-drag-over');
      row._drop = e => {
        e.preventDefault();
        row.classList.remove('row-drag-over');
        if (dragRow && dragRow !== row) {
          tbody.insertBefore(dragRow, row);
          tbody.querySelectorAll('tr').forEach((r, i) => {
            const numCell = r.querySelector('.row-num');
            if (numCell) numCell.textContent = i + 1;
          });
          if (typeof onReorder === 'function') {
            const orderedIds = [...tbody.querySelectorAll('tr')].map(r => r.dataset.id).filter(Boolean);
            onReorder(orderedIds);
          }
        }
      };
      row.addEventListener('dragstart', row._ds);
      row.addEventListener('dragend',   row._de);
      row.addEventListener('dragover',  row._dov);
      row.addEventListener('dragleave', row._dl);
      row.addEventListener('drop',      row._drop);
    });
  };
  refresh();
  tbody._refreshDrag = refresh;
}