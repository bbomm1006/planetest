<!-- 예약관리(신규) 관리자 UI — 기능 연동 없이 화면 구조/UX만 제공 -->
<div class="page" id="page-rvmAdminUi">
  <div class="page-header rvmAdmin__header">
    <div>
      <h2>예약관리 테이블 설정 (관리자 UI)</h2>
      <p>저장/불러오기/DB 연동/실시간 수량 차감/알림 발송은 제외하고, 화면 구조와 컴포넌트 흐름만 먼저 확정합니다.</p>
    </div>
    <div class="rvmAdmin__header-actions">
      <button type="button" class="btn btn-primary" id="rvmAdmin__openCreate">➕ 예약 테이블 추가</button>
    </div>
  </div>

  <div class="rvmAdmin" id="rvmAdminRoot" aria-label="예약관리 관리자 UI"></div>
</div>

<!-- 인스턴스/필드/접수 상세 공용 모달 (더미 UI용) -->
<div class="rvmAdmin-modal-bg" id="rvmAdminModalBg" aria-hidden="true">
  <div class="rvmAdmin-modal" id="rvmAdminModal" role="dialog" aria-modal="true"></div>
</div>

