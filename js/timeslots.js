/* ═══════════════════════════════════════
   timeslots.js — 공통 상담 시간 슬롯
═══════════════════════════════════════ */

var TIME_SLOTS = [];

function buildTimeSlots(containerId, prefix, slots) {
  if (slots) TIME_SLOTS = slots;
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!TIME_SLOTS.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;padding:8px 0;">상담 가능 시간이 없습니다.</p>';
    return;
  }
  el.innerHTML = TIME_SLOTS.map(function (ts, i) {
    return '<div class="fts" id="' + prefix + 'ts-' + i + '" onclick="selectFTS(\'' + prefix + '\',' + i + ')">'
      + '<div class="fts-dot"></div>'
      + '<span class="fts-lbl">' + ts + '</span>'
      + '</div>';
  }).join('');
}

function selectFTS(prefix, idx) {
  TIME_SLOTS.forEach(function (_, i) {
    var el = document.getElementById(prefix + 'ts-' + i);
    if (el) el.classList.toggle('checked', i === idx);
  });
}

function getSelectedFTS(prefix) {
  var sel = '';
  TIME_SLOTS.forEach(function (ts, i) {
    var el = document.getElementById(prefix + 'ts-' + i);
    if (el && el.classList.contains('checked')) sel = ts;
  });
  return sel;
}

/* capBg 시간 슬롯 — DB에서 로드한 슬롯으로 빌드 */
function buildCapTimeSlots(slots) { buildTimeSlots('capTimeSlots', 'cap', slots); }
function selectTS(prefix, idx) { selectFTS(prefix, idx); }
function getSelectedTS(prefix) { return getSelectedFTS(prefix); }

/* 페이지 로드 시 상담 신청 폼 시간 슬롯 빌드 */
document.addEventListener('DOMContentLoaded', function () {
  buildTimeSlots('fTimeSlots', 'f');
});
