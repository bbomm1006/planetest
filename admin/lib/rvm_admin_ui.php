<!-- 예약관리 테이블 UI (customReser 연동) -->
<div class="page" id="page-rvmAdminUi">
  <div class="page-header">
    <div>
      <h2>예약관리 테이블 UI</h2>
      <p>인스턴스별로 단계·필드·지점·수량·알림을 설정하고 예약을 관리합니다.</p>
    </div>
  </div>
  <div id="customReser-gate" style="display:block;padding:24px;text-align:center;background:var(--bg2);border-radius:var(--radius);">
    <p>예약 모듈을 불러오는 중…</p>
  </div>
  <div id="customReser-app" style="display:none;">
    <div class="customReser-card" style="margin-bottom:16px;">
      <div class="customReser-row">
        <div>
          <label>예약 인스턴스</label>
          <select id="customReser-inst" style="min-width:220px;"></select>
        </div>
        <div>
          <button type="button" class="customReser-btn secondary" id="customReser-new-inst">+ 인스턴스 추가</button>
        </div>
      </div>
    </div>
    <div class="customReser-layout">
      <nav class="customReser-nav" id="customReser-nav" aria-label="예약 모듈 메뉴"></nav>
      <div class="customReser-main" id="customReser-main" role="region"></div>
    </div>
  </div>
  <div class="customReser-modal-bg" id="customReser-modal-bg">
    <div class="customReser-modal" id="customReser-modal"></div>
  </div>
</div>
