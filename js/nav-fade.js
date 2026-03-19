/* ═══════════════════════════════════════
   nav-fade.js — 네비게이션 스크롤 효과,
                 Intersection Observer 페이드,
                 body overflow 안전망
═══════════════════════════════════════ */

/* ── 네비 스크롤 효과 ── */
window.addEventListener('scroll', function () {
  document.getElementById('mn').classList.toggle('s', window.scrollY > 60);
});

/* ── body overflow 안전망
   모달이 열린 채 닫기 버튼 외 경로로 이탈 시 overflow:hidden 이 남아
   모바일 전체 클릭 불가 현상이 생기므로, 열린 모달이 없으면 자동 복원 ── */
(function () {
  var _modalIds = ['pmBg', 'cmpBg', 'comboBg', 'capBg', 'vidModal', 'recModal', 'slMobileModal'];

  function _anyModalOpen() {
    for (var i = 0; i < _modalIds.length; i++) {
      var el = document.getElementById(_modalIds[i]);
      if (el && el.classList.contains('open')) return true;
    }
    var glm = document.getElementById('glModal');
    if (glm && glm.classList.contains('open')) return true;
    var ntm = document.getElementById('ntDetailOverlay');
    if (ntm && ntm.classList.contains('open')) return true;
    var feml = document.getElementById('frontEmlBg');
    if (feml && feml.style.display === 'flex') return true;
    var payBg = document.getElementById('payBg');
    if (payBg && payBg.style.display === 'flex') return true;
    var pbLayer = document.getElementById('pb-popup-layer');
    if (pbLayer && document.body.contains(pbLayer)) return true;
    return false;
  }

  window.addEventListener('scroll', function () {
    if (!_anyModalOpen() && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }, { passive: true });
})();

/* ── Intersection Observer 페이드 ── */
var fObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) e.target.classList.add('v');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fu').forEach(function (el) {
  fObs.observe(el);
});