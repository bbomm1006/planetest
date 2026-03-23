<?php
$today = date('Y-m-d');

/* ── 공지사항 (bp_notice) ── */
$noticeRows = [];
try {
    $st = $pdo->query(
        "SELECT p.id, p.title, p.content, p.created_at,
                CAST(p.extra AS CHAR) AS extra
         FROM bp_notice p
         WHERE p.is_visible = 1
         ORDER BY p.is_notice DESC, p.id DESC
         LIMIT 10"
    );
    $noticeRows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}

/* ── FAQ (bp_faq) ── */
$faqRows = [];
try {
    $st = $pdo->query(
        "SELECT p.title, p.content
         FROM bp_faq p
         WHERE p.is_visible = 1
         ORDER BY p.id ASC
         LIMIT 10"
    );
    $faqRows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {}
?>

<!-- ═══ NOTICE + FAQ ═══ -->
<section id="notice-faq">
  <div class="section-inner">
    <div class="notice-faq-grid">

      <!-- 공지사항 -->
      <div class="notice-section">
        <div class="subsection-title"><i class="fa-regular fa-bell"></i> 공지사항</div>
        <div class="notice-list">
          <?php if (empty($noticeRows)): ?>
            <p class="no-data">등록된 공지사항이 없습니다.</p>
          <?php else: ?>
            <?php foreach ($noticeRows as $row):
              $extra = [];
              if (!empty($row['extra'])) {
                  try { $extra = json_decode($row['extra'], true) ?: []; } catch (Exception $e) {}
              }
              $isNew   = (substr($row['created_at'], 0, 10) === $today);
              $tag     = !empty($extra['분류']) ? $extra['분류'] : ($isNew ? 'NEW' : '안내');
              $tagCls  = $isNew ? 'new' : 'info';
              $date    = !empty($row['created_at'])
                       ? substr(str_replace('-', '.', $row['created_at']), 2, 8)
                       : '';
              $safeTitle   = htmlspecialchars($row['title'],   ENT_QUOTES);
              $safeContent = htmlspecialchars($row['content'] ?? '', ENT_QUOTES);
              $safeDate    = htmlspecialchars($date, ENT_QUOTES);
            ?>
            <a class="notice-item"
               href="#"
               onclick="openNoticeModal(this); return false;"
               data-title="<?= $safeTitle ?>"
               data-content="<?= $safeContent ?>"
               data-date="<?= $safeDate ?>">
              <span class="notice-tag <?= $tagCls ?>"><?= htmlspecialchars($tag) ?></span>
              <span class="notice-item-text"><?= $safeTitle ?></span>
              <span class="notice-date"><?= $safeDate ?></span>
            </a>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>

      <!-- 자주 묻는 질문 -->
      <div class="faq-section">
        <div class="subsection-title"><i class="fa-regular fa-circle-question"></i> 자주 묻는 질문</div>
        <div class="faq-list">
          <?php if (empty($faqRows)): ?>
            <p class="no-data">등록된 FAQ가 없습니다.</p>
          <?php else: ?>
            <?php foreach ($faqRows as $row): ?>
            <div class="faq-item">
              <div class="faq-q" onclick="toggleFaq(this)">
                <span><?= htmlspecialchars($row['title']) ?></span>
                <i class="fa-solid fa-chevron-down"></i>
              </div>
              <div class="faq-a"><?= htmlspecialchars($row['content'] ?? '') ?></div>
            </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- 공지사항 모달 -->
<div id="notice-modal" style="display:none; position:fixed; inset:0; z-index:9999; align-items:center; justify-content:center;">
  <div class="notice-modal-backdrop" onclick="closeNoticeModal()" style="position:absolute; inset:0; background:rgba(0,0,0,.5);"></div>
  <div class="notice-modal-box" style="position:relative; background:#fff; border-radius:12px; padding:32px 28px 24px; max-width:540px; width:90%; max-height:80vh; overflow-y:auto; z-index:1;">
    <button onclick="closeNoticeModal()" style="position:absolute; top:14px; right:16px; background:none; border:none; font-size:20px; cursor:pointer; color:#888;">&times;</button>
    <div class="notice-modal-date" id="notice-modal-date" style="font-size:12px; color:#999; margin-bottom:8px;"></div>
    <div class="notice-modal-title" id="notice-modal-title" style="font-size:18px; font-weight:700; margin-bottom:16px; line-height:1.4; color:var(--dark)"></div>
    <div class="notice-modal-content" id="notice-modal-content" style="font-size:14px; color:#444; line-height:1.7; white-space:pre-wrap;"></div>
  </div>
</div>

<script>
/* ── 공지 모달 ── */
function openNoticeModal(el) {
  document.getElementById('notice-modal-title').textContent   = el.dataset.title   || '';
  document.getElementById('notice-modal-content').textContent = el.dataset.content || '';
  document.getElementById('notice-modal-date').textContent    = el.dataset.date    || '';
  var modal = document.getElementById('notice-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeNoticeModal() {
  document.getElementById('notice-modal').style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeNoticeModal();
});

/* ── FAQ 토글 ── */
function toggleFaq(qEl) {
  var aEl = qEl.nextElementSibling;
  var isOpen = qEl.classList.contains('open');
  /* 같은 faq-list 안 모두 닫기 */
  var list = qEl.closest('.faq-list');
  if (list) {
    list.querySelectorAll('.faq-q.open').forEach(function(q) {
      q.classList.remove('open');
      q.nextElementSibling.classList.remove('open');
    });
  }
  if (!isOpen) {
    qEl.classList.add('open');
    aEl.classList.add('open');
  }
}
</script>
