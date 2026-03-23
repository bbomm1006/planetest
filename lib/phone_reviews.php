<?php
/* ── 리뷰 게시판 (bp_review) ── */
$reviewRows = [];
try {
    $st = $pdo->query(
        "SELECT p.title, p.content, p.author,
                CAST(p.extra AS CHAR) AS extra
         FROM bp_review p
         WHERE p.is_visible = 1
         ORDER BY p.is_notice DESC, p.id DESC"
    );
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) {
        $extra = [];
        if (!empty($r['extra'])) {
            try { $extra = json_decode($r['extra'], true) ?: []; } catch (Exception $e) {}
        }
        $rating      = isset($extra['별점']) ? (int)$extra['별점'] : 5;
        $rating      = max(1, min(5, $rating));
        $r['stars']  = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
        $r['plan']   = $extra['요금제'] ?? $extra['제품명'] ?? $extra['플랜'] ?? '';
        /* 작성자 첫 글자 */
        $name        = trim($r['author'] ?? '');
        $r['avatar'] = $name ? mb_substr($name, 0, 1) : '익';
        $r['authorName'] = $name ? $name . ' 님' : '익명';
    }
    unset($r);
    $reviewRows = $rows;
} catch (Exception $e) {}
?>

<!-- ═══ REVIEWS ═══ -->
<section id="reviews">
  <div class="section-inner">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <div class="section-tag">사용 후기</div>
        <h2 class="section-title">실제 고객이 전하는<br><span>솔직한 이야기</span></h2>
      </div>
      <a class="view-all" href="#">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
    <div class="scroll-wrap">
      <button class="scroll-arrow sa-left" onclick="scrollTrack(this,-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroll-track cols-3" id="reviewsTrack">

        <?php if (empty($reviewRows)): ?>
          <p style="padding:40px 0; color:#999;">등록된 후기가 없습니다.</p>
        <?php else: ?>
          <?php foreach ($reviewRows as $r): ?>
          <div class="review-card">
            <div class="review-stars"><?= $r['stars'] ?></div>
            <p class="review-text"><?= htmlspecialchars($r['content'] ?? '') ?></p>
            <div class="review-author">
              <div class="review-avatar"><?= htmlspecialchars($r['avatar']) ?></div>
              <div>
                <div class="review-name"><?= htmlspecialchars($r['authorName']) ?></div>
                <div class="review-plan"><?= htmlspecialchars($r['plan']) ?></div>
              </div>
            </div>
          </div>
          <?php endforeach; ?>
        <?php endif; ?>

      </div>
      <button class="scroll-arrow sa-right" onclick="scrollTrack(this,1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <button class="show-more-btn" onclick="showMore('reviewsTrack',this)">더보기 <i class="fa-solid fa-chevron-down"></i></button>
  </div>
</section>

<script>
(function () {
  var section = document.getElementById('reviews');
  if (!section) return;
  var btnL  = section.querySelector('.sa-left');
  var btnR  = section.querySelector('.sa-right');
  var track = document.getElementById('reviewsTrack');
  if (!btnL || !btnR || !track) return;

  function updateArrows() {
    var count    = track.querySelectorAll('.review-card').length;
    var isMobile = window.innerWidth <= 768;
    var hide     = isMobile ? count <= 1 : count <= 4;
    btnL.style.display = hide ? 'none' : '';
    btnR.style.display = hide ? 'none' : '';
  }
  updateArrows();
  window.addEventListener('resize', updateArrows);
})();
</script>
