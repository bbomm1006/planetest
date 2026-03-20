<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>관리자 시스템</title>
<link rel="stylesheet" href="css/admin.css"/>
<link rel="stylesheet" href="css/find_account.css"/>
<link rel="stylesheet" href="css/rv2_reserve.css"/>
<link rel="stylesheet" href="css/customReser_admin.css"/>
<link rel="stylesheet" href="css/rvm_admin_ui.css"/>
<!-- 카카오 주소검색 (Daum 우편번호) -->
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head>
<body>

<!-- LOGIN -->
<?php include 'lib/login.php'; ?>

<!-- ADMIN -->
<div class="admin-wrap hidden" id="adminWrap">

  <!-- SIDEBAR -->
  <?php include 'lib/sidebar.php'; ?>

  <!-- MAIN -->
  <div class="main-area">
    <?php include 'lib/header.php'; ?>

    <main class="main-content">

      <!-- ========================
            0-1. 관리자 관리
            ======================== -->
      <?php include 'lib/admin.php'; ?>
      <?php include 'lib/menuMgmt.php'; ?>
      <?php include 'lib/sectionMgmt.php'; ?>
      <?php include 'lib/scriptMgmt.php'; ?>
      <?php include 'lib/socialMgmt.php'; ?>

      <?php include 'lib/siteMgmt.php'; ?>
      <?php include 'lib/homepageInfo.php'; ?>

      <!-- ========================
            1-1. 상단 메인 배너
            ======================== -->
            <?php include 'lib/banner.php'; ?>

      <!-- 1-2. 팝업 관리 -->
      <?php include 'lib/popup.php'; ?>

      <!-- 2-1. 상품 분류 관리 -->
      <?php include 'lib/catMgmt.php'; ?>

      <!-- 2-2. 제품 관리 -->
      <?php include 'lib/productMgmt.php'; ?>

      <!-- 2-3. 카드사 할인율 -->
      <?php include 'lib/cardDiscMgmt.php'; ?>

      <!-- 3-1. 카카오 API 관리 --> <!-- 3-2. 매장(지점) 관리 -->
      <?php include 'lib/store.php'; ?>

      <!-- ========================
            4-1. 게시판 추가
            ======================== -->
      <!-- 4-2. 게시판 목록 -->
      <?php include 'lib/board.php'; ?>

      <!-- ========================
            문의 폼 관리
            ======================== -->
      <?php include 'lib/customInquiry.php'; ?>

      <!-- ========================
            5-1. 상담 분류
            ======================== -->
      <!-- 5-2. 상담 내역 -->
      <?php include 'lib/consultFieldMgmt.php'; ?>
      <?php include 'lib/consultTerms.php'; ?>
      <?php include 'lib/legalTermsMgmt.php'; ?>
      <?php include 'lib/consult.php'; ?>

      <!-- ========================
            6-1. 문의 분류
            ======================== -->          
      <!-- 6-2. 문의 내역 -->
      <?php include 'lib/inquiry.php'; ?>

      <!-- 7-1. 예약 시간 관리 -->
      <!-- 7-2. 예약 내역 -->
      <?php include 'lib/reserve.php'; ?>
      <?php include 'lib/customReser_module.php'; ?>
      <?php include 'lib/rvm_admin_ui.php'; ?>

      <!-- ========================
            8. 챗봇 관리
            ======================== -->
      <?php include 'lib/chatbot.php'; ?>

      <!-- 9. 로그 관리 -->
      <?php include 'lib/logMgmt.php'; ?>

    </main>
  </div>
</div><!-- /admin-wrap -->


<!-- ===================================
     MODALS
     =================================== -->

  <!-- 내 정보 수정 -->
  <?php include 'modals/myInfoModal.php'; ?>

  <!-- 관리자 Modal -->
  <?php include 'modals/adminModal.php'; ?>

  <!-- 배너 추가/수정 Modal -->
  <?php include 'modals/bannerEditModal.php'; ?>


  <!-- 팝업 Modal -->
  <?php include 'modals/popupModal.php'; ?>


  <!-- 분류 Modal -->
  <?php include 'modals/catModal.php'; ?>


  <!-- 카드사 Modal -->
  <?php include 'modals/cardModal.php'; ?>


  <!-- 제품 Modal -->
  <?php include 'modals/productModal.php'; ?>


  <!-- 매장 Modal -->
  <?php include 'modals/storeModal.php'; ?>


  <!-- 상담 상세 Modal -->
  <?php include 'modals/consultDetailModal.php'; ?>

  <?php include 'modals/legalTermCatModal.php'; ?>
  <?php include 'modals/legalTermVerModal.php'; ?>

  <!-- 문의 답변 Modal -->
  <?php include 'modals/inquiryDetailModal.php'; ?>


  <!-- 예약 시간 Modal --> <!-- 예약 상세 Modal -->
  <?php include 'modals/reserveModal.php'; ?>

  <!-- 챗봇 Modal -->
  <?php include 'modals/chatbotModal.php'; ?>

  <!-- 로그 상세 Modal -->
  <?php include 'modals/logDetailModal.php'; ?>

  <!-- 문의 폼 Modal -->
  <?php include 'modals/customInquiryModal.php'; ?>


<div class="toast-container" id="toastContainer"></div>

<!-- 의존 파일들 먼저 -->
<script src="js/drag.js"></script>
<script src="js/time.js"></script>
<script src="js/board.js"></script>

<!-- admin.js: 전역 변수·헬퍼 정의 -->
<script src="js/admin.js"></script>
<script src="js/find_account.js"></script>

<!-- file_upload.js: resetUploadArea/setUploadPreview 공통 함수 -->
<script src="js/file_upload.js"></script>

<!-- admin.js 이후: bannerData, esc 등 전역 변수 사용 -->
<script src="js/menu.js"></script>
<script src="js/banner.js"></script>
<script src="js/popup.js"></script>
<script src="js/product.js"></script>
<script src="js/store.js"></script>

<script src="js/consultField.js"></script>
<script src="js/consultTerms.js"></script>
<script src="js/legalTerms.js"></script>
<script src="js/consult.js"></script> 

<script src="js/inquiry.js"></script>
<script src="js/reserve.js"></script>
<script src="js/rv2_reserve.js"></script>
<script src="js/customReser_admin.js"></script>
<script src="js/rvm_admin_ui.js"></script>

<!-- 나머지 -->
<script src="js/social.js"></script>
<script src="js/bulk_selectDelete.js"></script>
<script src="js/repeat.js"></script>
<script src="js/tag.js"></script>
<script src="js/excel.js"></script>

<script src="js/site.js"></script>

<script src="js/homepageInfo.js"></script>

<script src="js/chatbot.js"></script>

<script src="js/log.js"></script>

<script src="js/customInquiry.js"></script>

</body>
</html>