<?php
$pdo        = getDB();
$site       = $pdo->query("SELECT header_logo FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
$headerLogo = $site['header_logo'] ?? '';

// front_sections 기반 헤더 메뉴 자동 생성
// nav_label이 설정된 활성 섹션 중 lib 파일이 실제 존재하는 것만 표시
$_navItems = [];
try {
  $_st = $pdo->query(
    "SELECT nav_label, anchor_id, file_name FROM front_sections
      WHERE is_active = 1 AND nav_label IS NOT NULL AND nav_label != ''
      ORDER BY sort_order, id"
  );
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
} catch (Exception $e) {
  // 컬럼/테이블 미존재 시 정적 fallback 사용
}

// CTA anchor: 첫 번째 nav_label 중 '예약' 또는 '상담'이 포함된 항목, 없으면 첫 항목
$_ctaAnchor = '';
$_ctaLabel  = '무료 상담 신청';
foreach ($_navItems as $_ni) {
  if (mb_strpos($_ni['nav_label'], '예약') !== false || mb_strpos($_ni['nav_label'], '상담') !== false) {
    $_ctaAnchor = $_ni['anchor_id'];
    break;
  }
}
?>

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

  <a class="nav-cta" href="<?= $_ctaAnchor ? '#' . htmlspecialchars($_ctaAnchor) : '#inquiry' ?>"><?= htmlspecialchars($_ctaLabel) ?></a>

</nav>

