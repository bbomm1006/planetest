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
      <a class="view-all" href="#" onclick="evAllOpen();return false;">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
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

<!-- ═══ 이벤트 전체보기 모달 ═══ -->
<div class="ev-modal-bg" id="evAllModal" onclick="if(event.target===this)evAllClose()">
  <div class="ev-modal">
    <div class="ev-modal-header">
      <div class="ev-modal-title">전체 이벤트</div>
      <button class="ev-modal-x" onclick="evAllClose()"></button>
    </div>
    <div class="ev-modal-list" id="evAllList"></div>
  </div>
</div>

<style>
.ev-modal-bg {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.55); z-index: 9100;
  align-items: center; justify-content: center; padding: 16px;
}
.ev-modal-bg.open { display: flex; }
.ev-modal {
  background: #fff; border-radius: 16px; overflow: hidden;
  width: 100%; max-width: 680px; max-height: 90vh;
  display: flex; flex-direction: column;
}
.ev-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0; flex-shrink: 0;
}
.ev-modal-title { font-size: 1.05rem; font-weight: 900; color: #111; }
.ev-modal-x {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: rgba(0,0,0,.08); cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; position: relative;
}
.ev-modal-x::before, .ev-modal-x::after {
  content: ''; position: absolute; width: 14px; height: 1.5px; background: #555;
}
.ev-modal-x::before { transform: rotate(45deg); }
.ev-modal-x::after  { transform: rotate(-45deg); }
.ev-modal-x:hover { background: rgba(0,0,0,.15); }

.ev-modal-list {
  overflow-y: auto; padding: 16px 24px 24px;
  display: flex; flex-direction: column; gap: 12px;
}
.ev-modal-item {
  display: flex; gap: 14px; align-items: flex-start;
  border: 1px solid #f0f0f0; border-radius: 12px;
  padding: 14px 16px; text-decoration: none;
  transition: border-color .15s, box-shadow .15s;
}
.ev-modal-item:hover { border-color: var(--color-base,#FF4D7D); box-shadow: 0 2px 12px rgba(255,77,125,.1); }
.ev-modal-item-thumb {
  width: 80px; height: 60px; flex-shrink: 0; border-radius: 8px;
  background: var(--gray-100,#f0f0f0) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.ev-modal-item-thumb-ph { font-size: 1.4rem; }
.ev-modal-item-info { flex: 1; min-width: 0; }
.ev-modal-item-tag {
  display: inline-block; font-size: .68rem; font-weight: 700;
  color: var(--color-base,#FF4D7D); border: 1px solid var(--color-base,#FF4D7D);
  border-radius: 20px; padding: 1px 8px; margin-bottom: 5px;
}
.ev-modal-item-title { font-size: .9rem; font-weight: 800; color: #111; line-height: 1.4; margin-bottom: 5px; }
.ev-modal-item-period { font-size: .74rem; color: #aaa; }

@media (max-width: 600px) {
  .ev-modal-bg { padding: 0; align-items: flex-end; }
  .ev-modal { border-radius: 16px 16px 0 0; max-height: 92vh; }
  .ev-modal-header { padding: 16px 16px 0; }
  .ev-modal-list { padding: 12px 16px 20px; }
  .ev-modal-item-thumb { width: 64px; height: 50px; }
}
</style>

<script>
var _evData = <?php
  $jsEvData = [];
  foreach ($eventRows as $r) {
    $jsEvData[] = [
      'tag'      => $r['tag'],
      'title'    => $r['title'],
      'period'   => $r['period'],
      'imageUrl' => $r['imageUrl'],
      'link'     => $r['link'],
    ];
  }
  echo json_encode($jsEvData, JSON_UNESCAPED_UNICODE);
?>;

function _evEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function evAllOpen() {
  var list = document.getElementById('evAllList');
  if (!_evData.length) {
    list.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa;">등록된 이벤트가 없습니다.</p>';
  } else {
    list.innerHTML = _evData.map(function(ev) {
      var href   = ev.link || '#';
      var target = ev.link ? ' target="_blank" rel="noopener"' : '';
      var thumb  = ev.imageUrl
        ? '<div class="ev-modal-item-thumb" style="background-image:url('+_evEsc(ev.imageUrl)+')"></div>'
        : '<div class="ev-modal-item-thumb"><span class="ev-modal-item-thumb-ph">🎁</span></div>';
      return '<a class="ev-modal-item" href="'+_evEsc(href)+'"'+target+'>' +
        thumb +
        '<div class="ev-modal-item-info">' +
          (ev.tag ? '<span class="ev-modal-item-tag">'+_evEsc(ev.tag)+'</span>' : '') +
          '<div class="ev-modal-item-title">'+_evEsc(ev.title)+'</div>' +
          (ev.period ? '<div class="ev-modal-item-period">'+_evEsc(ev.period)+'</div>' : '') +
        '</div>' +
      '</a>';
    }).join('');
  }
  document.getElementById('evAllModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function evAllClose() {
  document.getElementById('evAllModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') evAllClose();
});
</script>