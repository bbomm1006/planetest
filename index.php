
<?php include 'lib/__head.php'; ?>
<body>

<?php
  // menus 테이블의 is_active 값을 기반으로 프론트 lib 단락 노출/미노출 처리
  $frontSectionState = [];
  $frontKeys = [
    'front_service_switch',
    'front_user_menu',
    'front_hero_banner',
    'front_products',
    'front_benefits',
    'front_videos',
    'front_reviews',
    'front_event',
    'front_stores',
    'front_reservation',
    'front_reservation_lookup',
    'front_rv2_suite',
    'front_customReser_suite',
    'front_notices',
    'front_faq',
    'front_gallery',
    'front_photo_gallery',
    'front_slide_gallery',
    // 'front_board',
    // 'front_consult',
    'front_footer',
  ];

  if (!empty($frontKeys)) {
    $placeholders = implode(',', array_fill(0, count($frontKeys), '?'));
    $stmt = $pdo->prepare("SELECT `key`, is_active FROM menus WHERE `key` IN ($placeholders)");
    $stmt->execute($frontKeys);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
      $frontSectionState[$row['key']] = (int)$row['is_active'];
    }
  }

  $frontIsVisible = function ($key) use ($frontSectionState) {
    if (!array_key_exists($key, $frontSectionState)) return true; // 미설정이면 기본 노출
    return (int)$frontSectionState[$key] !== 0;
  };

  $legalSlug = isset($_GET['legal']) ? preg_replace('/[^a-zA-Z0-9\-_]/', '', (string) $_GET['legal']) : '';
?>

  <!-- 서비스 전환 바 -->
  <div data-front-section-key="front_service_switch" <?php if (!$frontIsVisible('front_service_switch')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/_site.php'; ?>
  </div>

  <!-- NAV -->
  <div data-front-section-key="front_user_menu" <?php if (!$frontIsVisible('front_user_menu')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/_nav.php'; ?>
  </div>

  <?php if ($legalSlug !== ''): ?>
  <main class="legal-page">
    <?php include 'lib/legal_terms_view.php'; ?>
  </main>
  <?php else: ?>

  <!-- HERO -->
  <div data-front-section-key="front_hero_banner" <?php if (!$frontIsVisible('front_hero_banner')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/top_banner.php'; ?>
  </div>

  <!-- PRODUCTS -->
  <div data-front-section-key="front_products" <?php if (!$frontIsVisible('front_products')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/products.php'; ?>
  </div>

  <?php
$ci_table = 'form_type2';
include __DIR__ . '/lib/custom_inquiry_front.php';
?>

<?php
$ci_table = 'form_type1';
include __DIR__ . '/lib/custom_inquiry_front.php';
?>

  <!-- BENEFITS -->
  <div data-front-section-key="front_benefits" <?php if (!$frontIsVisible('front_benefits')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/benefits.php'; ?>
  </div>

  <!-- VIDEOS -->
  <div data-front-section-key="front_videos" <?php if (!$frontIsVisible('front_videos')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_video.php'; ?>
  </div>

  <!-- REVIEWS -->
  <div data-front-section-key="front_reviews" <?php if (!$frontIsVisible('front_reviews')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_review.php'; ?>
  </div>

  <!-- EVENT -->
  <div data-front-section-key="front_event" <?php if (!$frontIsVisible('front_event')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_event.php'; ?>
  </div>

  <!-- STORES -->
  <div data-front-section-key="front_stores" <?php if (!$frontIsVisible('front_stores')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/stores.php'; ?>
  </div>

  <!-- RESERVATION -->
  <div data-front-section-key="front_reservation" <?php if (!$frontIsVisible('front_reservation')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/reservation.php'; ?>
  </div>

  <!-- RESERVATION LOOKUP -->
  <div data-front-section-key="front_reservation_lookup" <?php if (!$frontIsVisible('front_reservation_lookup')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/reservationLookup.php'; ?>
  </div>

  <!-- RESERVATION V2 (신규 테이블 rv2_* / 기존 예약 블록과 독립, 섹션 키: front_rv2_suite) -->
  <div data-front-section-key="front_rv2_suite" <?php if (!$frontIsVisible('front_rv2_suite')) echo 'style="display:none;"'; ?>>
    <section class="sw" id="rv2-book-anchor" style="background:var(--off);">
      <div class="inner">
        <div class="rv2-wrap">
          <div class="rv2-head">
            <h1>예약하기</h1>
            <p>단계를 따라 일정과 정보를 입력해 주세요.</p>
            <p id="rv2-cap-hint" class="rv2-cap-hint"></p>
          </div>
          <div id="rv2-msg"></div>
          <div id="rv2-progress" class="rv2-progress"></div>
          <div id="rv2-step-host"></div>
          <div id="rv2-actions" class="rv2-actions"></div>
          <div class="rv2-link-bar">
            <a href="#rv2-lookup-anchor">예약 조회</a>
          </div>
        </div>
      </div>
    </section>
    <section class="sw" id="rv2-lookup-anchor" style="background:var(--off);">
      <div class="inner">
        <div class="rv2-wrap rv2-lookup-wrap">
          <div class="rv2-head">
            <h1>예약 조회</h1>
            <p>예약번호 또는 이름·연락처로 조회할 수 있습니다.</p>
          </div>
          <div id="rv2-lookup-msg"></div>
          <div class="rv2-lookup-grid">
            <div class="rv2-card">
              <div class="rv2-field">
                <label>예약번호</label>
                <input type="text" id="rv2-lookup-no" placeholder="예: R250320A1B2C3" autocomplete="off">
              </div>
              <p class="rv2-or">또는</p>
              <div class="rv2-field">
                <label>이름</label>
                <input type="text" id="rv2-lookup-name" autocomplete="name">
              </div>
              <div class="rv2-field">
                <label>연락처</label>
                <input type="tel" id="rv2-lookup-phone" placeholder="숫자만 입력" inputmode="numeric" autocomplete="tel">
              </div>
              <button type="button" class="rv2-btn primary" id="rv2-lookup-btn" style="width:100%;margin-top:8px;">조회</button>
            </div>
            <div id="rv2-result" class="rv2-result-col"></div>
          </div>
          <div id="rv2-resched-panel" class="rv2-card rv2-resched-panel" hidden></div>
          <div class="rv2-link-bar">
            <a href="#rv2-book-anchor">예약하기</a>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- customReser (slug는 lib/customReser_front.php에서 설정) -->
  <div data-front-section-key="front_customReser_suite" <?php if (!$frontIsVisible('front_customReser_suite')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/customReser_front.php'; ?>
  </div>

  <!-- NOTICES -->
  <div data-front-section-key="front_notices" <?php if (!$frontIsVisible('front_notices')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_notice.php'; ?>
  </div>

  <!-- FAQ -->
  <div data-front-section-key="front_faq" <?php if (!$frontIsVisible('front_faq')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_faq.php'; ?>
  </div>

  <!-- GALLERY -->
  <div data-front-section-key="front_gallery" <?php if (!$frontIsVisible('front_gallery')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_gallery.php'; ?>
  </div>

  <!-- PHOTO GALLERY -->
  <div data-front-section-key="front_photo_gallery" <?php if (!$frontIsVisible('front_photo_gallery')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_photogallery.php'; ?>
  </div>

  <!-- SLIDE GALLERY -->
  <div data-front-section-key="front_slide_gallery" <?php if (!$frontIsVisible('front_slide_gallery')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/bbs_slidegallery.php'; ?>
  </div>


  <?php endif; ?>

  <!-- 풋터 -->
  <div data-front-section-key="front_footer" <?php if (!$frontIsVisible('front_footer')) echo 'style="display:none;"'; ?>>
    <?php include 'lib/_ft.php'; ?>
  </div>

  <!-- PRODUCT DETAIL MODAL -->
  <?php include 'lib/modalPm.php'; ?>

  <!-- COMPARE BAR -->
  <?php include 'lib/modalcmpBar.php'; ?>
  

  <!-- COMPARE MODAL -->
  <?php include 'lib/modalMhd.php'; ?>
  

  <!-- COMBO CALCULATOR MODAL -->
  <?php include 'lib/modalCombmod.php'; ?>
  

  <!-- COMBO APPLY FORM MODAL -->
  <?php include 'lib/modalApply.php'; ?>
  

  <!-- EMAIL MODAL -->
  <?php include 'lib/modalEmail.php'; ?>

  <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"></script>
  <script src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js" charset="utf-8"></script>
  <script src="https://accounts.google.com/gsi/client" async></script>
  <div id="naver_id_login" style="display:none"></div>
  <script src="js/board.js"></script>

  <script src="js/countdown.js"></script>
  <script src="js/hero.js"></script>
  <script>
    fetch('/admin/api_front/banner_public.php')
      .then(r => r.json())
      .then(data => { window._pbData = data; renderHero(data); });
  </script>
  <script src="js/inquiry.js"></script>
  <script src="js/nav-fade.js"></script>
  <script src="js/notice-faq-gallery.js"></script>
  <script src="js/bbs_photogallery.js"></script>
  <script src="js/bbs_slidegallery.js"></script>
  <script src="js/popup.js"></script><!-- 팝업 -->
  <script>
    fetch('/admin/api_front/popup_public.php')
      .then(r => r.json())
      .then(data => { if (data.ok) renderPopupBanner(data); });
  </script>
  <script src="js/products.js"></script>
  <script>
    fetch('/admin/api_front/product_public.php')
      .then(r => r.json())
      .then(data => { if (data.ok) { window._pbData = Object.assign(window._pbData || {}, data); renderProducts(data); } });
  </script>
  <script src="js/recommend.js"></script>
  <script src="js/reservation.js"></script>
  <script src="js/reservationLookup.js"></script>
  <script src="js/customReser_public.js"></script>
  <script src="js/store.js"></script>
  <script src="js/timeslots.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/video-reviews.js"></script>
  <script>
    // 공지사항
    fetch('/admin/api_front/board_public.php?table=notice')
      .then(r => r.json())
      .then(data => { if (data.ok) ntInit(data.posts); });
    // FAQ
    fetch('/admin/api_front/board_public.php?table=faq')
      .then(r => r.json())
      .then(data => { if (data.ok) faqInit(data.posts); });
    // 영상
    fetch('/admin/api_front/board_public.php?table=video')
      .then(r => r.json())
      .then(data => {
        if (data.ok) renderVideos({ videos: data.posts.map(function(p) {
          return { active: true, order: p.id, title: p.title, youtubeUrl: p.youtubeUrl, desc: '' };
        })});
      });
    // 후기
    fetch('/admin/api_front/board_public.php?table=review')
      .then(r => r.json())
      .then(data => {
        if (data.ok) renderReviews({ reviews: data.posts.map(function(p) {
          return { active: true, order: p.id, name: p.author, text: p.title, rating: p.rating, imageUrl: p.imageUrl, date: p.date };
        })});
      });
  </script>

  <script src="js/custom_inquiry_front.js"></script>

<?php include 'lib/__tail.php'; ?>