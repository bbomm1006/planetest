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
      <a class="view-all" href="#" onclick="rvAllOpen();return false;">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
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

<!-- ═══ 리뷰 전체보기 모달 ═══ -->
<div class="rv-modal-bg" id="rvAllModal" onclick="if(event.target===this)rvAllClose()">
  <div class="rv-modal">
    <div class="rv-modal-header">
      <div class="rv-modal-title">전체 후기</div>
      <button class="rv-modal-x" onclick="rvAllClose()"></button>
    </div>
    <div class="rv-modal-list" id="rvAllList"></div>
  </div>
</div>

<style>
.rv-modal-bg {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.55); z-index: 9100;
  align-items: center; justify-content: center; padding: 16px;
}
.rv-modal-bg.open { display: flex; }
.rv-modal {
  background: #fff; border-radius: 16px; overflow: hidden;
  width: 100%; max-width: 640px; max-height: 90vh;
  display: flex; flex-direction: column; position: relative;
}
.rv-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0; flex-shrink: 0;
}
.rv-modal-title { font-size: 1.05rem; font-weight: 900; color: #111; }
.rv-modal-x {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: rgba(0,0,0,.08); cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; position: relative;
}
.rv-modal-x::before, .rv-modal-x::after {
  content: ''; position: absolute; width: 14px; height: 1.5px; background: #555;
}
.rv-modal-x::before { transform: rotate(45deg); }
.rv-modal-x::after  { transform: rotate(-45deg); }
.rv-modal-x:hover { background: rgba(0,0,0,.15); }

.rv-modal-list {
  overflow-y: auto; padding: 16px 24px 24px;
  display: flex; flex-direction: column; gap: 12px;
}
.rv-modal-item {
  border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px 18px;
}
.rv-modal-item-stars { color: var(--color-base,#FF4D7D); font-size: .9rem; margin-bottom: 8px; letter-spacing: 1px; }
.rv-modal-item-text  { font-size: .86rem; color: #333; line-height: 1.75; margin-bottom: 12px; }
.rv-modal-item-author { display: flex; align-items: center; gap: 10px; }
.rv-modal-item-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: var(--color-base,#FF4D7D); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700;
}
.rv-modal-item-name { font-size: .82rem; font-weight: 700; color: #333; }
.rv-modal-item-plan { font-size: .74rem; color: #aaa; margin-top: 1px; }

@media (max-width: 600px) {
  .rv-modal-bg { padding: 0; align-items: flex-end; }
  .rv-modal { border-radius: 16px 16px 0 0; max-height: 92vh; }
  .rv-modal-header { padding: 16px 16px 0; }
  .rv-modal-list { padding: 12px 16px 20px; }
}
</style>

<script>
/* ── 리뷰 데이터 주입 ── */
var _rvData = <?php
  $jsRvData = [];
  foreach ($reviewRows as $r) {
    $jsRvData[] = [
      'stars'      => $r['stars'],
      'content'    => $r['content'] ?? '',
      'avatar'     => $r['avatar'],
      'authorName' => $r['authorName'],
      'plan'       => $r['plan'],
    ];
  }
  echo json_encode($jsRvData, JSON_UNESCAPED_UNICODE);
?>;

function _rvEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function rvAllOpen() {
  var list = document.getElementById('rvAllList');
  if (!_rvData.length) {
    list.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa;">등록된 후기가 없습니다.</p>';
  } else {
    list.innerHTML = _rvData.map(function(r) {
      return '<div class="rv-modal-item">' +
        '<div class="rv-modal-item-stars">'+r.stars+'</div>' +
        '<div class="rv-modal-item-text">'+_rvEsc(r.content)+'</div>' +
        '<div class="rv-modal-item-author">' +
          '<div class="rv-modal-item-avatar">'+_rvEsc(r.avatar)+'</div>' +
          '<div>' +
            '<div class="rv-modal-item-name">'+_rvEsc(r.authorName)+'</div>' +
            (r.plan ? '<div class="rv-modal-item-plan">'+_rvEsc(r.plan)+'</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }
  document.getElementById('rvAllModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function rvAllClose() {
  document.getElementById('rvAllModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') rvAllClose();
});
</script>