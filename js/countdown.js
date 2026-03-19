/* ═══════════════════════════════════════
   countdown.js — 카운트다운 타이머
═══════════════════════════════════════ */

function uc() {
  var e = new Date('2026-03-31T23:59:59');
  var diff = Math.max(0, e - new Date()) / 1000;
  var d = Math.floor(diff / 86400);
  var h = Math.floor(diff % 86400 / 3600);
  var m = Math.floor(diff % 3600 / 60);
  var s = Math.floor(diff % 60);
  document.getElementById('cd-d').textContent = String(d).padStart(2, '0');
  document.getElementById('cd-h').textContent = String(h).padStart(2, '0');
  document.getElementById('cd-m').textContent = String(m).padStart(2, '0');
  document.getElementById('cd-s').textContent = String(s).padStart(2, '0');
}

uc();
setInterval(uc, 1000);