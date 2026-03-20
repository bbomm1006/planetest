<?php
/**
 * rvmReser 프론트 단락 — customReser_* 테이블 기반 예약 UI (신규 추가)
 *
 * index.php 에서 아래와 같이 include 합니다.
 *   $rvmReser_slug = ''; // 비워두면 활성 인스턴스 중 첫 번째를 자동 선택
 *   include 'lib/rvmReser_front.php';
 *
 * 특정 slug를 지정하려면:
 *   $rvmReser_slug = 'gangnam-reservation';
 *   include 'lib/rvmReser_front.php';
 */

$rvmReser_slug = isset($rvmReser_slug) && $rvmReser_slug !== ''
  ? preg_replace('/[^a-z0-9\-]/', '', strtolower((string) $rvmReser_slug))
  : '';

if ($rvmReser_slug === '') {
  try {
    require_once __DIR__ . '/../admin/config/db_customReser.php';
    $pdo = getCustomReserDB();
    $st = $pdo->query("SELECT slug FROM customReser_instance WHERE is_active=1 ORDER BY sort_order, id LIMIT 1");
    $slug = $st ? (string)$st->fetchColumn() : '';
    if ($slug !== '') {
      $rvmReser_slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($slug));
    }
  } catch (Throwable $e) {
    // DB 미연결 시 빈 슬러그로 fallback
  }
}

if ($rvmReser_slug === '') {
  $rvmReser_slug = 'book';
}
?>
<div class="rvmReser-suite" data-rvmreser-slug="<?= htmlspecialchars($rvmReser_slug, ENT_QUOTES, 'UTF-8') ?>">

  <!-- 예약하기 섹션 -->
  <section class="sw rvmReser-book-section" id="rvmReser-book-anchor" style="background:var(--off);">
    <div class="inner">
      <div class="rvmReser-wrap">
        <div class="rvmReser-head">
          <h2>예약하기</h2>
          <p class="rvmReser-sub">지점·일정·정보를 순서대로 선택해 주세요.</p>
          <p id="rvmReser-cap-hint" class="rvmReser-cap-hint" hidden></p>
        </div>
        <div id="rvmReser-msg"></div>
        <div id="rvmReser-progress" class="rvmReser-progress"></div>
        <div id="rvmReser-step-host"></div>
        <div id="rvmReser-actions" class="rvmReser-actions"></div>
        <div class="rvmReser-link-bar">
          <a href="#rvmReser-lookup-anchor">예약 조회</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 예약 조회 섹션 -->
  <section class="sw rvmReser-lookup-section" id="rvmReser-lookup-anchor" style="background:var(--off);">
    <div class="inner">
      <div class="rvmReser-wrap rvmReser-lookup-wrap">
        <div class="rvmReser-head">
          <h2>예약 조회</h2>
          <p class="rvmReser-sub">예약번호 또는 이름·연락처로 조회할 수 있습니다.</p>
        </div>
        <div id="rvmReser-lookup-msg"></div>
        <div class="rvmReser-lookup-grid">
          <div class="rvmReser-card">
            <div class="rvmReser-field">
              <label>예약번호</label>
              <input type="text" id="rvmReser-lookup-no" placeholder="예약번호" autocomplete="off">
            </div>
            <p class="rvmReser-or">또는</p>
            <div class="rvmReser-field">
              <label>이름</label>
              <input type="text" id="rvmReser-lookup-name" autocomplete="name">
            </div>
            <div class="rvmReser-field">
              <label>연락처</label>
              <input type="tel" id="rvmReser-lookup-phone" placeholder="숫자만" inputmode="numeric" autocomplete="tel">
            </div>
            <button type="button" class="rvmReser-btn primary" id="rvmReser-lookup-btn" style="width:100%;margin-top:8px;">조회</button>
          </div>
          <div id="rvmReser-result" class="rvmReser-result-col"></div>
        </div>
        <div id="rvmReser-resched-panel" class="rvmReser-card rvmReser-resched-panel" hidden></div>
        <div class="rvmReser-link-bar">
          <a href="#rvmReser-book-anchor">예약하기</a>
        </div>
      </div>
    </div>
  </section>

</div>
