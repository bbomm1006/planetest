<!-- 예약관리 관리자 UI — DB 연동 예약 테이블 설정 -->
<div class="page" id="page-rvmAdminUi">
  <div class="page-header rvmAdmin__header">
    <div>
      <h2>예약관리 테이블 설정</h2>
      <p>예약 흐름(단계·필드·지점·날짜)을 인스턴스 단위로 독립 설정합니다.</p>
    </div>
    <div class="rvmAdmin__header-actions">
      <button type="button" class="btn btn-primary" id="rvmAdmin__openCreate">+ 예약 테이블 추가</button>
    </div>
  </div>

  <div class="rvmAdmin" id="rvmAdminRoot" aria-label="예약관리 관리자 UI"></div>
</div>

<!-- 공용 모달 -->
<div class="rvmAdmin-modal-bg" id="rvmAdminModalBg" aria-hidden="true">
  <div class="rvmAdmin-modal" id="rvmAdminModal" role="dialog" aria-modal="true"></div>
</div>
