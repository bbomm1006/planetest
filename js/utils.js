/* ═══════════════════════════════════════
   utils.js — 공통 유틸리티
═══════════════════════════════════════ */

/* ── 문자열 이스케이프 ── */
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── 숫자 콤마 포맷 ── */
function comma(n) {
  return Math.round(n).toLocaleString();
}

/* ── 할인율 계산 ── */
function calcDisc(monthly, original) {
  if (!monthly || !original || original <= monthly) return 0;
  return Math.round((original - monthly) / original * 100);
}

/* ── 유튜브 ID 추출 ── */
function getYtId(url) {
  if (!url) return '';
  var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

/* ── 유튜브 썸네일 URL ── */
function ytThumb(id) {
  return 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
}

/* ── 이름 마스킹 ── */
function maskName(n) {
  if (!n) return '';
  if (n.length <= 1) return n;
  if (n.length === 2) return n[0] + '*';
  return n[0] + '*'.repeat(n.length - 2) + n[n.length - 1];
}

/* ── 스크롤/외부 링크 이동 ── */
function goto(link) {
  if ((link || '').startsWith('http')) {
    window.open(link, '_blank', 'noopener');
  } else {
    var el = document.getElementById((link || '').replace(/^#/, ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ── 전화번호 포맷 ── */
function fmtPhone(input) {
  var v = input.value.replace(/\D/g, '');
  if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3);
  else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
  input.value = v;
}

/* ── 한국 표준시(KST) 기준 오늘 날짜 YYYY-MM-DD 반환 ── */
function getKSTDateStr() {
  var now = new Date();
  var kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/* ── XML 이스케이프 (팝업 배너 전용) ── */
function xe(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}