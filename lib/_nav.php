<?php
// $pdo = getDB(); ← 이 줄 완전히 삭제
$site       = $pdo->query("SELECT header_logo FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
$headerLogo = $site['header_logo'] ?? '';

$_navItems = [];
try {
  $_navGroupId = isset($pageSectionGroupId) && $pageSectionGroupId > 0 ? (int)$pageSectionGroupId : 0;
  if ($_navGroupId > 0) {
    $_st = $pdo->prepare(
      "SELECT nav_label, anchor_id, file_name FROM front_sections
        WHERE is_active = 1 AND nav_label IS NOT NULL AND nav_label != ''
        AND group_id = ?
        ORDER BY sort_order, id"
    );
    $_st->execute([$_navGroupId]);
  } else {
    $_st = $pdo->query(
      "SELECT nav_label, anchor_id, file_name FROM front_sections
        WHERE is_active = 1 AND nav_label IS NOT NULL AND nav_label != ''
        ORDER BY sort_order, id"
    );
  }
  $_coreNavFiles = ['_site', '_nav', '_ft'];
  foreach ($_st->fetchAll(PDO::FETCH_ASSOC) as $_ni) {
    if (in_array($_ni['file_name'], $_coreNavFiles, true)) {
      $_navItems[] = $_ni;
      continue;
    }
    $_fn = preg_replace('/[^a-zA-Z0-9_\-]/', '',
                        pathinfo($_ni['file_name'], PATHINFO_FILENAME));
    if ($_fn !== '' && file_exists(__DIR__ . '/' . $_fn . '.php')) {
      $_navItems[] = $_ni;
    }
  }
} catch (Exception $e) {}

$_ctaAnchor = '';
$_ctaLabel  = '무료 상담 신청';
foreach ($_navItems as $_ni) {
  if (mb_strpos($_ni['nav_label'], '예약') !== false || mb_strpos($_ni['nav_label'], '상담') !== false) {
    $_ctaAnchor = $_ni['anchor_id'];
    break;
  }
}
?>

<link rel="stylesheet" href="style/nav.css">

<nav id="mn">

  <a class="nav-logo" href="#">
    <img src="<?= htmlspecialchars($headerLogo ?: './img/logo.png') ?>" alt="THE GEAR SHOP" class="nav-logo-img">
  </a>

  <ul class="nav-links">
    <?php if (!empty($_navItems)): ?>
      <?php foreach ($_navItems as $_ni): ?>
      <li><a href="#<?= htmlspecialchars($_ni['anchor_id']) ?>"><?= htmlspecialchars($_ni['nav_label']) ?></a></li>
      <?php endforeach; ?>
    <?php else: ?>
      <!-- front_sections 미설정 시 정적 fallback -->
      <li><a href="#benefits">혜택</a></li>
      <li><a href="#products">제품</a></li>
      <li><a href="#videos">영상</a></li>
      <li><a href="#reviews">후기</a></li>
      <li><a href="#event">이벤트</a></li>
      <li><a href="#stores">매장찾기</a></li>
      <li><a href="#notices">공지사항</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><a href="#gallery">갤러리</a></li>
    <?php endif; ?>
  </ul>

  <!-- <a class="nav-cta" href="<//= $_ctaAnchor ? '#' . htmlspecialchars($_ctaAnchor) : '#inquiry' ?>"><//= htmlspecialchars($_ctaLabel) ?></a> -->
  <a class="nav-cta" href="<?= htmlspecialchars($quickBtns[0]['url'] ?? '#') ?>">
    <?= htmlspecialchars($quickBtns[0]['label'] ?? '버튼명') ?>
  </a>

  <button class="nav-ham" id="navHam" aria-label="메뉴 열기">
    <span></span>
    <span></span>
    <span></span>
  </button>

</nav>

<!-- ✅ 모바일 드로어 메뉴 -->
<div class="nav-drawer" id="navDrawer">
  <div class="nav-drawer-head">
    <span>MENU</span>
    <button class="nav-drawer-close" id="navClose" aria-label="메뉴 닫기">✕</button>
  </div>

  <ul class="nav-drawer-links">
    <?php if (!empty($_navItems)): ?>
      <?php foreach ($_navItems as $_ni): ?>
      <li><a href="#<?= htmlspecialchars($_ni['anchor_id']) ?>" class="drawer-link"><?= htmlspecialchars($_ni['nav_label']) ?></a></li>
      <?php endforeach; ?>
    <?php else: ?>
      <li><a href="#benefits" class="drawer-link">혜택</a></li>
      <li><a href="#products" class="drawer-link">제품</a></li>
      <li><a href="#videos" class="drawer-link">영상</a></li>
      <li><a href="#reviews" class="drawer-link">후기</a></li>
      <li><a href="#event" class="drawer-link">이벤트</a></li>
      <li><a href="#stores" class="drawer-link">매장찾기</a></li>
    <?php endif; ?>
  </ul>

  <div class="nav-drawer-cta">
    <!-- <a href="<//= $_ctaAnchor ? '#'.htmlspecialchars($_ctaAnchor) : '#inquiry' ?>" class="drawer-link">
      <//= htmlspecialchars($_ctaLabel) ?>
    </a> -->
    <a class="nav-cta" href="<?= htmlspecialchars($quickBtns[0]['url'] ?? '#') ?>">
      <?= htmlspecialchars($quickBtns[0]['label'] ?? '버튼명') ?>
    </a>
  </div>
</div>
<div class="nav-overlay" id="navOverlay"></div>

<script>
(function(){
  var ham     = document.getElementById('navHam');
  var close   = document.getElementById('navClose');
  var drawer  = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');

  function toggle(open){
    ham.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  ham.addEventListener('click', function(){ toggle(true); });
  close.addEventListener('click', function(){ toggle(false); });
  overlay.addEventListener('click', function(){ toggle(false); });

  document.querySelectorAll('.drawer-link').forEach(function(a){
    a.addEventListener('click', function(){ toggle(false); });
  });
})();
</script>