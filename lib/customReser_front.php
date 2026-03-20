<?php
/**
 * 프론트 예약 UI (사이트 DB + customReser_* 테이블).
 *
 * - 관리에서 만든 인스턴스 slug와 일치해야 합니다.
 * - 공통 페이지에선 slug를 하드코딩하지 않고,
 *   `customReser_instance` 중 활성(is_active=1) 1개를 찾아 자동으로 사용합니다.
 * - 특정 slug를 쓰고 싶으면 include 전에 `$customReser_public_slug = '원하는-slug';` 를 넘겨주세요.
 */

$customReser_public_slug = isset($customReser_public_slug) && $customReser_public_slug !== ''
  ? preg_replace('/[^a-z0-9\-]/', '', strtolower((string) $customReser_public_slug))
  : '';

if ($customReser_public_slug === '') {
  try {
    require_once __DIR__ . '/../admin/config/db_customReser.php';
    $pdo = getCustomReserDB();
    $st = $pdo->query("SELECT slug FROM customReser_instance WHERE is_active=1 ORDER BY sort_order, id LIMIT 1");
    $slug = $st ? (string)$st->fetchColumn() : '';
    if ($slug !== '') {
      $customReser_public_slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($slug));
    }
  } catch (Throwable $e) {
    // 연결/테이블이 준비되지 않았으면, 기본값으로 둡니다.
  }
}

if ($customReser_public_slug === '') {
  $customReser_public_slug = 'book';
}
?>
<div class="customReser-suite" data-customReser-slug="<?= htmlspecialchars($customReser_public_slug, ENT_QUOTES, 'UTF-8') ?>">
  <section class="sw customReser-book-section" id="customReser-book-anchor" style="background:var(--off);">
    <div class="inner">
      <div class="customReser-wrap">
        <div class="customReser-head">
          <h2>예약하기</h2>
          <p class="customReser-sub">지점·일정·정보를 순서대로 선택해 주세요.</p>
          <p id="customReser-cap-hint" class="customReser-cap-hint" hidden></p>
        </div>
        <div id="customReser-msg"></div>
        <div id="customReser-progress" class="customReser-progress"></div>
        <div id="customReser-step-host"></div>
        <div id="customReser-actions" class="customReser-actions"></div>
        <div class="customReser-link-bar">
          <a href="#customReser-lookup-anchor">예약 조회</a>
        </div>
      </div>
    </div>
  </section>
  <section class="sw customReser-lookup-section" id="customReser-lookup-anchor" style="background:var(--off);">
    <div class="inner">
      <div class="customReser-wrap customReser-lookup-wrap">
        <div class="customReser-head">
          <h2>예약 조회</h2>
          <p class="customReser-sub">예약번호 또는 이름·연락처로 조회할 수 있습니다.</p>
        </div>
        <div id="customReser-lookup-msg"></div>
        <div class="customReser-lookup-grid">
          <div class="customReser-card">
            <div class="customReser-field">
              <label>예약번호</label>
              <input type="text" id="customReser-lookup-no" placeholder="예약번호" autocomplete="off">
            </div>
            <p class="customReser-or">또는</p>
            <div class="customReser-field">
              <label>이름</label>
              <input type="text" id="customReser-lookup-name" autocomplete="name">
            </div>
            <div class="customReser-field">
              <label>연락처</label>
              <input type="tel" id="customReser-lookup-phone" placeholder="숫자만" inputmode="numeric" autocomplete="tel">
            </div>
            <button type="button" class="customReser-btn primary" id="customReser-lookup-btn" style="width:100%;margin-top:8px;">조회</button>
          </div>
          <div id="customReser-result" class="customReser-result-col"></div>
        </div>
        <div id="customReser-resched-panel" class="customReser-card customReser-resched-panel" hidden></div>
        <div class="customReser-link-bar">
          <a href="#customReser-book-anchor">예약하기</a>
        </div>
      </div>
    </div>
  </section>
</div>
