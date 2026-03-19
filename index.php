
<?php include 'lib/__head.php'; ?>
<body>

  <!-- 서비스 전환 바 -->
  <?php include 'lib/_site.php'; ?>

  <!-- NAV -->
  <?php include 'lib/_nav.php'; ?>

  <!-- HERO -->
  <?php include 'lib/top_banner.php'; ?>

  <!-- PRODUCTS -->
  <?php include 'lib/products.php'; ?>

  <!-- BENEFITS -->
  <?php include 'lib/benefits.php'; ?>

  <!-- VIDEOS -->
  <?php include 'lib/bbs_video.php'; ?>

  <!-- REVIEWS -->
  <?php include 'lib/bbs_review.php'; ?>

  <!-- EVENT -->
  <?php include 'lib/bbs_event.php'; ?>

  <!-- STORES -->
  <?php include 'lib/stores.php'; ?>

  <!-- RESERVATION -->
  <?php include 'lib/reservation.php'; ?>

  <!-- RESERVATION LOOKUP -->
  <?php include 'lib/reservationLookup.php'; ?>

  <!-- NOTICES -->
  <?php include 'lib/bbs_notice.php'; ?>

  <!-- FAQ -->
  <?php include 'lib/bbs_faq.php'; ?>

  <!-- GALLERY -->
  <?php include 'lib/bbs_gallery.php'; ?>

  <!-- PHOTO GALLERY -->
  <?php include 'lib/bbs_photogallery.php'; ?>

  <!-- SLIDE GALLERY -->
  <?php include 'lib/bbs_slidegallery.php'; ?>

  <!-- BOARD (문의게시판) -->
  <?php include 'lib/qna.php'; ?>
  <?php include 'lib/consult.php'; ?>

  <!-- 풋터 -->
  <?php include 'lib/_ft.php'; ?>

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

<?php include 'lib/__tail.php'; ?>