
// ===========================
// REPEAT ROWS
// ===========================
function addSpecRow() {
  const g = document.getElementById('productSpecGroup');
  const row = document.createElement('div');
  row.className = 'repeat-row';
  row.innerHTML = `<span class="drag-handle">⠿</span>
    <input type="text" class="form-control" placeholder="라벨" style="flex:.4"/>
    <input type="text" class="form-control" placeholder="내용" style="flex:.6"/>
    <button class="btn btn-sm btn-ghost" onclick="removeRepeatRow(this)">🗑</button>`;
  g.appendChild(row);
  initRepeatDrag(g);
}

function addReserveItem() {
  const g = document.getElementById('reserveItemGroup');
  const row = document.createElement('div');
  row.className = 'repeat-row';
  row.innerHTML = `<span class="drag-handle">⠿</span>
    <input type="text" class="form-control" placeholder="항목명" style="flex:.3"/>
    <input type="text" class="form-control" placeholder="설명" style="flex:.5"/>
    <div class="toggle-wrap" style="flex-shrink:0;gap:4px;"><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label><span style="font-size:.75rem">사용</span></div>
    <button class="btn btn-sm btn-ghost" onclick="removeRepeatRow(this)">🗑</button>`;
  g.appendChild(row);
  initRepeatDrag(g);
}

function removeRepeatRow(btn) { btn.closest('.repeat-row').remove(); }

function initRepeatDrag(group) {
  let dragEl = null;
  group.querySelectorAll('.repeat-row').forEach(row => {
    const handle = row.querySelector('.drag-handle');
    if (!handle) return;
    handle.setAttribute('draggable','true');
    handle.ondragstart = e => { dragEl = row; row.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; };
    handle.ondragend = () => { row.classList.remove('dragging'); dragEl = null; };
    row.ondragover = e => { e.preventDefault(); };
    row.ondrop = e => { e.preventDefault(); if(dragEl && dragEl!==row) group.insertBefore(dragEl, row); };
  });
}