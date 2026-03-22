<?php include 'lib/__head.php'; ?>
<body>

<?php
  $legalSlug = isset($_GET['legal']) ? preg_replace('/[^a-zA-Z0-9\-_]/', '', (string) $_GET['legal']) : '';

  // front_sections 테이블에서 모든 섹션을 순서대로 로드
  $allSections = [];
  try {
    $stmt = $pdo->query("SELECT * FROM front_sections ORDER BY sort_order, id");
    $allSections = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {}

  // 코어 파일명 (wrapper div 없이 직접 include)
  $coreSections = ['_site', '_nav', '_ft'];

  // 활성화된 섹션 파일명 목록 (JS 조건부 로드에 사용)
  $activeFileNames = [];
  foreach ($allSections as $sec) {
    if ((int)$sec['is_active'] === 0) continue;
    $fn = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($sec['file_name'], PATHINFO_FILENAME));
    if ($fn !== '') $activeFileNames[] = $fn;
  }

  // 섹션 파일명 → 필요한 JS 매핑
  // 값이 배열인 경우 해당 JS 파일들을 조건부 로드
  $sectionJsMap = [
    'top_banner'           => ['hero.js', 'popup.js', 'countdown.js'],
    '_nav'                 => ['nav-fade.js'],
    'products'             => ['products.js', 'recommend.js'],
    'bbs_video'            => ['video-reviews.js'],
    'bbs_review'           => ['video-reviews.js'],
    'bbs_notice'           => ['notice-faq-gallery.js'],
    'bbs_faq'              => ['notice-faq-gallery.js'],
    'bbs_gallery'          => ['notice-faq-gallery.js'],
    'bbs_photogallery'     => ['bbs_photogallery.js'],
    'bbs_slidegallery'     => ['bbs_slidegallery.js'],
    'bbs_event'            => ['notice-faq-gallery.js'],
    'stores'               => ['store.js'],
    'reservation'          => ['reservation.js', 'reservationLookup.js', 'timeslots.js'],
    'reservationLookup'    => ['reservationLookup.js'],
    'bkf_front'            => ['timeslots.js'],
    'custom_inquiry_front' => ['custom_inquiry_front.js'],
    'consult'              => ['inquiry.js'],
    'qna'                  => ['inquiry.js'],
  ];

  // 로드할 JS 파일 목록 수집 (중복 제거)
  $jsToLoad = [];
  foreach ($activeFileNames as $fn) {
    if (isset($sectionJsMap[$fn])) {
      foreach ($sectionJsMap[$fn] as $js) {
        $jsToLoad[$js] = true;
      }
    }
  }
?>

<?php if ($legalSlug !== ''): ?>
  <?php
    foreach ($allSections as $sec):
      $fn = pathinfo($sec['file_name'], PATHINFO_FILENAME);
      if (!in_array($fn, ['_site', '_nav'], true)) continue;
      if ((int)$sec['is_active'] === 0) continue;
      $fp = __DIR__ . '/lib/' . $fn . '.php';
      if (file_exists($fp)) include $fp;
    endforeach;
  ?>
  <main class="legal-page">
    <?php include 'lib/legal_terms_view.php'; ?>
  </main>
  <?php
    foreach ($allSections as $sec):
      $fn = pathinfo($sec['file_name'], PATHINFO_FILENAME);
      if ($fn !== '_ft') continue;
      if ((int)$sec['is_active'] === 0) continue;
      $fp = __DIR__ . '/lib/' . $fn . '.php';
      if (file_exists($fp)) include $fp;
    endforeach;
  ?>

<?php else: ?>

  <?php foreach ($allSections as $sec):
    if ((int)$sec['is_active'] === 0) continue;

    $fn = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($sec['file_name'], PATHINFO_FILENAME));
    if ($fn === '') continue;

    $filePath = __DIR__ . '/lib/' . $fn . '.php';
    if (!file_exists($filePath)) continue;

    $anchorId        = $sec['anchor_id'] ?? '';
    $secParams       = trim($sec['params'] ?? '');
    $sectionTitle    = trim($sec['title']    ?? '');
    $sectionSubtitle = trim($sec['subtitle'] ?? '');

    $ci_table = null;
    $bkf_slug = null;
    if ($fn === 'custom_inquiry_front') {
      if ($secParams === '') continue;
      $ci_table = $secParams;
    } elseif ($fn === 'bkf_front') {
      $bkf_slug = $secParams !== '' ? $secParams : 'booking_00';
    }

    if (in_array($fn, $coreSections, true)):
  ?>
    <?php include $filePath; ?>
  <?php else: ?>
    <div<?= $anchorId !== '' ? ' id="' . htmlspecialchars($anchorId) . '"' : '' ?> data-section-key="<?= htmlspecialchars($sec['key'] ?? '') ?>">
      <?php if ($fn === 'bkf_front'): ?>
      <link rel="stylesheet" href="/css/bkf_public.css"/>
      <?php endif; ?>
      <?php include $filePath; ?>
    </div>
  <?php endif;

    unset($ci_table, $bkf_slug, $sectionTitle, $sectionSubtitle, $secParams, $anchorId, $fn, $filePath);
  endforeach; ?>

<?php endif; ?>

  <!-- MODALS (항상 필요) -->
  <?php include 'lib/modalPm.php'; ?>
  <?php include 'lib/modalcmpBar.php'; ?>
  <?php include 'lib/modalMhd.php'; ?>
  <?php include 'lib/modalCombmod.php'; ?>
  <?php include 'lib/modalApply.php'; ?>
  <?php include 'lib/modalEmail.php'; ?>

  <!-- 소셜 로그인 SDK (항상 필요) -->
  <script async src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"></script>
  <script async src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js" charset="utf-8"></script>
  <script src="https://accounts.google.com/gsi/client" async></script>
  <div id="naver_id_login" style="display:none"></div>

  <!-- 코어 JS (항상 필요) -->
  <script src="js/board.js"></script>
  <script src="js/utils.js"></script>

  <!-- 섹션별 조건부 JS 로드 -->
  <?php if (isset($jsToLoad['hero.js'])): ?>
  <script src="js/hero.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['countdown.js'])): ?>
  <script src="js/countdown.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['nav-fade.js'])): ?>
  <script src="js/nav-fade.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['products.js'])): ?>
  <script src="js/products.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['recommend.js'])): ?>
  <script src="js/recommend.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['video-reviews.js'])): ?>
  <script src="js/video-reviews.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['notice-faq-gallery.js'])): ?>
  <script src="js/notice-faq-gallery.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['bbs_photogallery.js'])): ?>
  <script src="js/bbs_photogallery.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['bbs_slidegallery.js'])): ?>
  <script src="js/bbs_slidegallery.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['store.js'])): ?>
  <script src="js/store.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['reservation.js'])): ?>
  <script src="js/reservation.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['reservationLookup.js'])): ?>
  <script src="js/reservationLookup.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['timeslots.js'])): ?>
  <script src="js/timeslots.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['custom_inquiry_front.js'])): ?>
  <script src="js/custom_inquiry_front.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['inquiry.js'])): ?>
  <script src="js/inquiry.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['popup.js'])): ?>
  <script src="js/popup.js"></script>
  <?php endif; ?>
  <?php if (isset($jsToLoad['bkf_public.js']) || in_array('bkf_front', $activeFileNames)): ?>
  <link rel="stylesheet" href="/css/bkf_public.css"/>
  <script src="/js/bkf_public.js" defer></script>
  <?php endif; ?>

  <!-- 데이터 로드 (활성 섹션 기반) -->
  <script>
  (function() {
    <?php if (isset($jsToLoad['hero.js'])): ?>
    Promise.all([
      fetch('/admin/api_front/banner_public.php').then(r => r.json()),
      fetch('/admin/api_front/popup_public.php').then(r => r.json()),
      <?php if (isset($jsToLoad['products.js'])): ?>
      fetch('/admin/api_front/product_public.php').then(r => r.json()),
      <?php else: ?>
      Promise.resolve(null),
      <?php endif; ?>
    ]).then(function([bannerData, popupData, productData]) {
      window._pbData = bannerData;
      if (typeof renderHero === 'function') renderHero(bannerData);
      if (popupData && popupData.ok && typeof renderPopupBanner === 'function') renderPopupBanner(popupData);
      if (productData && productData.ok) {
        window._pbData = Object.assign(window._pbData || {}, productData);
        if (typeof renderProducts === 'function') renderProducts(productData);
      }
    }).catch(function() {});
    <?php endif; ?>

    <?php
      $boardFetches = [];
      if (isset($jsToLoad['notice-faq-gallery.js'])) {
        if (in_array('bbs_notice', $activeFileNames))  $boardFetches[] = ['notice', 'ntInit'];
        if (in_array('bbs_faq', $activeFileNames))     $boardFetches[] = ['faq',    'faqInit'];
        if (in_array('bbs_event', $activeFileNames))   $boardFetches[] = ['event',  null];
        if (in_array('bbs_gallery', $activeFileNames)) $boardFetches[] = ['gallery', null];
      }
      $hasVideo  = isset($jsToLoad['video-reviews.js']) && in_array('bbs_video', $activeFileNames);
      $hasReview = isset($jsToLoad['video-reviews.js']) && in_array('bbs_review', $activeFileNames);
      if (!empty($boardFetches) || $hasVideo || $hasReview):
    ?>
    var _boardPromises = [];
    <?php foreach ($boardFetches as $bf): ?>
    _boardPromises.push(fetch('/admin/api_front/board_public.php?table=<?= $bf[0] ?>').then(r => r.json()));
    <?php endforeach; ?>
    <?php if ($hasVideo): ?>
    _boardPromises.push(fetch('/admin/api_front/board_public.php?table=video').then(r => r.json()));
    <?php endif; ?>
    <?php if ($hasReview): ?>
    _boardPromises.push(fetch('/admin/api_front/board_public.php?table=review').then(r => r.json()));
    <?php endif; ?>
    Promise.all(_boardPromises).then(function(results) {
      var i = 0;
      <?php foreach ($boardFetches as $bf): ?>
      var d<?= $bf[0] ?> = results[i++];
      if (d<?= $bf[0] ?> && d<?= $bf[0] ?>.ok) {
        <?php if ($bf[1]): ?>
        if (typeof <?= $bf[1] ?> === 'function') <?= $bf[1] ?>(d<?= $bf[0] ?>.posts);
        <?php endif; ?>
      }
      <?php endforeach; ?>
      <?php if ($hasVideo): ?>
      var dVideo = results[i++];
      if (dVideo && dVideo.ok && typeof renderVideos === 'function') {
        renderVideos({ videos: dVideo.posts.map(function(p) {
          return { active: true, order: p.id, title: p.title, youtubeUrl: p.youtubeUrl, desc: '' };
        })});
      }
      <?php endif; ?>
      <?php if ($hasReview): ?>
      var dReview = results[i++];
      if (dReview && dReview.ok && typeof renderReviews === 'function') {
        renderReviews({ reviews: dReview.posts.map(function(p) {
          return { active: true, order: p.id, name: p.author, text: p.title, rating: p.rating, imageUrl: p.imageUrl, date: p.date };
        })});
      }
      <?php endif; ?>
    }).catch(function() {});
    <?php endif; ?>
  })();
  </script>

<?php include 'lib/__tail.php'; ?>
