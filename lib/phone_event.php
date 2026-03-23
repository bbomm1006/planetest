<?php
/* ── 이벤트 게시판 (bp_event) ── */
$eventRows = [];
try {
    $st = $pdo->query(
        "SELECT p.id, p.title, p.content,
                c.name AS cat_name,
                CAST(p.extra AS CHAR) AS extra
         FROM bp_event p
         LEFT JOIN board_categories c ON c.id = p.category_id
         WHERE p.is_visible = 1
         ORDER BY p.is_notice DESC, p.id DESC"
    );
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) {
        $extra = [];
        if (!empty($r['extra'])) {
            try { $extra = json_decode($r['extra'], true) ?: []; } catch (Exception $e) {}
        }
        $r['tag']       = $r['cat_name'] ?: ($extra['분류'] ?? '');
        $r['imageUrl']  = $extra['썸네일이미지'] ?? '';
        /* 기간: extra 키가 '기간시작'/'기간종료' 또는 '기간 (시작일~종료일)' 형태 모두 대응 */
        $start = $extra['기간시작'] ?? $extra['시작일'] ?? '';
        $end   = $extra['기간종료'] ?? $extra['종료일'] ?? '';
        if (!$start && !$end) {
            /* 단일 키에 "YYYY-MM-DD ~ YYYY-MM-DD" 형태로 저장된 경우 */
            $periodRaw = $extra['기간'] ?? $extra['기간 (시작일~종료일)'] ?? '';
            if ($periodRaw) {
                $parts = array_map('trim', explode('~', $periodRaw));
                $start = $parts[0] ?? '';
                $end   = $parts[1] ?? '';
            }
        }
        /* 날짜 포맷 YYYY-MM-DD → YYYY.MM.DD */
        $fmt = function($d) { return $d ? str_replace('-', '.', trim($d)) : ''; };
        $r['period'] = $fmt($start) . ($end ? ' ~ ' . $fmt($end) : '');
        $r['link']   = $extra['링크'] ?? $extra['링크URL'] ?? $extra['URL'] ?? '';
    }
    unset($r);
    $eventRows = $rows;
} catch (Exception $e) {}
?>

<!-- ═══ EVENT ═══ -->
<section id="event">
  <div class="section-inner">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <div class="section-tag">이벤트</div>
        <h2 class="section-title">지금 놓치면 후회하는<br><span>혜택 모음</span></h2>
      </div>
      <a class="view-all" href="#">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
    <div class="scroll-wrap">
      <button class="scroll-arrow sa-left" onclick="scrollTrack(this,-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroll-track cols-2" id="eventTrack">

        <?php if (empty($eventRows)): ?>
          <p style="padding:40px 0; color:#999;">등록된 이벤트가 없습니다.</p>
        <?php else: ?>
          <?php foreach ($eventRows as $ev):
            $bgStyle = !empty($ev['imageUrl'])
              ? 'background-image:url(' . htmlspecialchars($ev['imageUrl']) . ');background-size:cover;background-position:center;'
              : '';
            $href    = !empty($ev['link']) ? htmlspecialchars($ev['link']) : '#';
            $target  = !empty($ev['link']) ? ' target="_blank" rel="noopener"' : '';
          ?>
          <div class="event-card">
            <a href="<?= $href ?>"<?= $target ?> style="display:block;text-decoration:none;">
              <div class="event-thumb" style="<?= $bgStyle ?>">
                <div class="event-thumb-inner">
                  <?php if (!empty($ev['tag'])): ?>
                  <span class="event-thumb-tag"><?= htmlspecialchars($ev['tag']) ?></span>
                  <?php endif; ?>
                  <div class="event-thumb-title"><?= nl2br(htmlspecialchars($ev['title'])) ?></div>
                  <?php if (!empty($ev['content'])): ?>
                  <div class="event-thumb-desc"><?= htmlspecialchars($ev['content']) ?></div>
                  <?php endif; ?>
                  <?php if (!empty($ev['period'])): ?>
                  <div class="event-thumb-period"><?= htmlspecialchars($ev['period']) ?></div>
                  <?php endif; ?>
                </div>
              </div>
            </a>
          </div>
          <?php endforeach; ?>
        <?php endif; ?>

      </div>
      <button class="scroll-arrow sa-right" onclick="scrollTrack(this,1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <button class="show-more-btn" onclick="showMore('eventTrack',this)">더보기 <i class="fa-solid fa-chevron-down"></i></button>
  </div>
</section>

<script>
(function () {
  var section = document.getElementById('event');
  if (!section) return;
  var btnL  = section.querySelector('.sa-left');
  var btnR  = section.querySelector('.sa-right');
  var track = document.getElementById('eventTrack');
  if (!btnL || !btnR || !track) return;

  function updateArrows() {
    var count = track.querySelectorAll('.event-card').length;
    var hide  = count <= 1;
    btnL.style.display = hide ? 'none' : '';
    btnR.style.display = hide ? 'none' : '';
  }
  updateArrows();
  window.addEventListener('resize', updateArrows);
})();
</script>
