/* ═══════════════════════════════════════
   timeslots.js — 공통 상담 시간 슬롯
═══════════════════════════════════════ */

var TIME_SLOTS = ['오전 9~11시', '오전 11~1시', '오후 1~3시', '오후 3~5시', '오후 5~7시', '저녁 7시 이후'];

function buildTimeSlots(containerId, prefix) {
  var el = document.getElementById(containerId);
  if (!el) return;
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

/* capBg 시간 슬롯 별칭 */
function buildCapTimeSlots() { buildTimeSlots('capTimeSlots', 'cap'); }
function selectTS(prefix, idx) { selectFTS(prefix, idx); }
function getSelectedTS(prefix) { return getSelectedFTS(prefix); }

/* 페이지 로드 시 상담 신청 폼 시간 슬롯 빌드 */
document.addEventListener('DOMContentLoaded', function () {
  buildTimeSlots('fTimeSlots', 'f');
});