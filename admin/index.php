<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>관리자 시스템</title>
<link rel="stylesheet" href="css/admin.css"/>
<link rel="stylesheet" href="css/bkf_admin.css"/>
<link rel="stylesheet" href="css/find_account.css"/>
<!-- 카카오 주소검색 (Daum 우편번호) -->
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" defer></script>
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
      <?php include 'lib/colorMgmt.php'; ?>

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

      <!-- 2-4. 결합 상담 -->
      <?php include 'lib/comboInquiryMgmt.php'; ?>
      <?php include 'lib/comboManagerMgmt.php'; ?>
      <?php include 'lib/comboTimeslotMgmt.php'; ?>
      <?php include 'lib/comboTermsMgmt.php'; ?>

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
      <?php include 'lib/alimtalkMgmt.php'; ?>

      <?php include 'lib/legalTermsMgmt.php'; ?>

      <!-- 예약 폼 관리 -->
      <?php include 'lib/bookingForm.php'; ?>

      <!-- 7-1. 예약 시간 관리 -->
      <!-- 7-2. 예약 내역 -->
      <?php include 'lib/reserve.php'; ?>
    

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
  <!-- 결합 상담 Modals -->
  <?php include 'modals/comboDetailModal.php'; ?>
  <?php include 'modals/comboManagerModal.php'; ?>
  <?php include 'modals/comboSlotModal.php'; ?>


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

  <!-- 예약 폼 Modal -->
  <?php include 'modals/bookingFormModal.php'; ?>


<div class="toast-container" id="toastContainer"></div>

<!-- 의존 파일들 먼저 -->
<script src="js/drag.js" defer></script>
<script src="js/time.js" defer></script>
<script src="js/board.js" defer></script>

<!-- admin.js: 전역 변수·헬퍼 정의 -->
<script src="js/admin.js" defer></script>
<script src="js/find_account.js" defer></script>

<!-- file_upload.js: resetUploadArea/setUploadPreview 공통 함수 -->
<script src="js/file_upload.js" defer></script>

<!-- admin.js 이후: bannerData, esc 등 전역 변수 사용 -->
<script src="js/menu.js" defer></script>
<script src="js/banner.js" defer></script>
<script src="js/popup.js" defer></script>
<script src="js/product.js" defer></script>
<script src="js/combo.js" defer></script>
<script src="js/store.js" defer></script>

<script src="js/consultField.js" defer></script>
<script src="js/consultTerms.js" defer></script>
<script src="js/legalTerms.js" defer></script>
<script src="js/consult.js" defer></script> 

<script src="js/inquiry.js" defer></script>
<script src="js/reserve.js" defer></script>

<!-- 나머지 -->
<script src="js/social.js" defer></script>
<script src="js/bulk_selectDelete.js" defer></script>
<script src="js/repeat.js" defer></script>
<script src="js/tag.js" defer></script>
<script src="js/excel.js" defer></script>

<script src="js/site.js" defer></script>

<script src="js/homepageInfo.js" defer></script>
<script src="js/colorMgmt.js" defer></script>

<script src="js/chatbot.js" defer></script>

<script src="js/log.js" defer></script>

<script src="js/customInquiry.js" defer></script>
<script src="js/alimtalk.js" defer></script>

<script src="js/bkf_admin.js" defer></script>

</body>
</html>