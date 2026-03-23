<?php
/* ── 상품 데이터 ($pdo 직접 조회) ── */
$usimCategories = [];
$usimProducts   = [];

try {
    $cats = $pdo->query(
        "SELECT id, name FROM product_categories WHERE is_active=1 ORDER BY sort_order, id"
    )->fetchAll(PDO::FETCH_ASSOC);
    $usimCategories = $cats;
} catch (Exception $e) {}

try {
    $prods = $pdo->query(
        "SELECT p.id, p.category_id, p.name, p.badge_text, p.badge_color,
                p.price, p.discount, p.short_desc
         FROM product_products p
         INNER JOIN product_categories c ON c.id = p.category_id AND c.is_active=1
         ORDER BY p.sort_order, p.id"
    )->fetchAll(PDO::FETCH_ASSOC);

    $allSpecs = $pdo->query(
        "SELECT product_id, spec_name, spec_value FROM product_specs ORDER BY product_id, sort_order, id"
    )->fetchAll(PDO::FETCH_ASSOC);

    $specsMap = [];
    foreach ($allSpecs as $s) {
        $specsMap[$s['product_id']][] = ['name' => $s['spec_name'], 'value' => $s['spec_value']];
    }
    foreach ($prods as &$p) {
        $p['specs']         = $specsMap[$p['id']] ?? [];
        $p['priceMonthly']  = (int)$p['price'];
        $p['priceOriginal'] = $p['discount'] > 0 ? (int)($p['price'] + $p['discount']) : null;
    }
    unset($p);
    $usimProducts = $prods;
} catch (Exception $e) {}


?>

<!-- ═══ USIM PLANS ═══ -->
<section id="usim">
  <div class="section-inner">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <div class="section-tag">유심 요금제</div>
        <h2 class="section-title">내 번호 그대로,<br><span>요금만 확 줄이세요</span></h2>
        <p class="section-sub">번호이동 / 신규가입 모두 가능 · 당일 개통</p>
      </div>
      <a class="view-all" href="#">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>

    <!-- 탭 (PC) -->
    <div class="plan-tabs">
      <button class="plan-tab active" data-cat="">전체</button>
      <?php foreach ($usimCategories as $cat): ?>
      <button class="plan-tab" data-cat="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></button>
      <?php endforeach; ?>
    </div>

    <!-- 셀렉트 (모바일) -->
    <select class="plan-select" onchange="usimSelectCat(this.value)">
      <option value="">전체 요금제</option>
      <?php foreach ($usimCategories as $cat): ?>
      <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></option>
      <?php endforeach; ?>
    </select>

    <div class="scroll-wrap">
      <button class="scroll-arrow sa-left" onclick="scrollTrack(this,-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroll-track cols-4" id="usimTrack">

        <?php foreach ($usimProducts as $p):
          $isFeatured = !empty($p['badge_text']);
          $badgeColor = !empty($p['badge_color']) ? $p['badge_color'] : '#1255a6';
          $catName    = '';
          foreach ($usimCategories as $cat) {
              if ((string)$cat['id'] === (string)$p['category_id']) { $catName = $cat['name']; break; }
          }
        ?>
        <div class="plan-card<?= $isFeatured ? ' featured' : '' ?>"
             data-cat="<?= htmlspecialchars($p['category_id']) ?>"
             data-product-id="<?= (int)$p['id'] ?>"
             data-category-id="<?= htmlspecialchars($p['category_id']) ?>">
          <?php if (!empty($p['badge_text'])): ?>
          <div class="plan-badge" style="background:<?= htmlspecialchars($badgeColor) ?>"><?= htmlspecialchars($p['badge_text']) ?></div>
          <?php endif; ?>
          <div class="plan-operator"><?= htmlspecialchars($catName) ?></div>
          <div class="plan-name"><?= htmlspecialchars($p['name']) ?></div>
          <div class="plan-price"><?= number_format($p['priceMonthly']) ?><small>원/월</small></div>
          <?php if ($p['priceOriginal']): ?>
          <div class="plan-original">기존 <?= number_format($p['priceOriginal']) ?>원</div>
          <?php else: ?>
          <div class="plan-original"></div>
          <?php endif; ?>
          <div class="plan-specs">
            <?php foreach ($p['specs'] as $idx => $spec): ?>
            <div class="plan-spec">
              <?php if ($idx === 0): ?>
                <i class="fa-solid fa-database"></i>
                <span><strong><?= htmlspecialchars($spec['value']) ?></strong></span>
              <?php elseif ($idx === 1): ?>
                <i class="fa-solid fa-phone"></i>
                <span><?= htmlspecialchars($spec['name']) ?> <strong><?= htmlspecialchars($spec['value']) ?></strong></span>
              <?php elseif ($idx === 2): ?>
                <i class="fa-regular fa-comment"></i>
                <span><?= htmlspecialchars($spec['name']) ?> <strong><?= htmlspecialchars($spec['value']) ?></strong></span>
              <?php else: ?>
                <span><?= htmlspecialchars($spec['name']) ?> <strong><?= htmlspecialchars($spec['value']) ?></strong></span>
              <?php endif; ?>
            </div>
            <?php endforeach; ?>
          </div>
          <button class="btn-plan"
                  onclick="usimApply(<?= (int)$p['id'] ?>, '<?= htmlspecialchars($p['name'], ENT_QUOTES) ?>', '<?= htmlspecialchars($catName, ENT_QUOTES) ?>', <?= $p['priceMonthly'] ?>)">
            신청하기
          </button>
        </div>
        <?php endforeach; ?>

        <?php if (empty($usimProducts)): ?>
        <p class="no-data" style="padding:40px 0; color:#999;">등록된 요금제가 없습니다.</p>
        <?php endif; ?>

      </div>
      <button class="scroll-arrow sa-right" onclick="scrollTrack(this,1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <button class="show-more-btn" onclick="showMore('usimTrack',this)">더보기 <i class="fa-solid fa-chevron-down"></i></button>
  </div>
</section>

<script>
/* ── scrollTrack : #usim 전용 (전역 scrollTrack 없을 때 대비) ── */
(function () {
  var track = document.getElementById('usimTrack');
  if (!track) return;

  /* 무한 루프 clone */
  var origItems = Array.from(track.children);
  var total = origItems.length;
  if (total === 0) return;

  origItems.forEach(function (el) {
    var c = el.cloneNode(true); c.classList.add('si-clone'); track.appendChild(c);
  });
  origItems.slice().reverse().forEach(function (el) {
    var c = el.cloneNode(true); c.classList.add('si-clone'); track.insertBefore(c, track.firstChild);
  });

  function itemW() {
    var el = track.querySelector('.plan-card');
    if (!el) return 300;
    return el.offsetWidth + (parseInt(getComputedStyle(track).gap) || 16);
  }

  /* 초기 위치 → 앞 clone 건너뛰기 */
  setTimeout(function () { track.scrollLeft = total * itemW(); }, 0);

  /* 경계 점프 */
  track.addEventListener('scroll', function () {
    var sl = track.scrollLeft, w = itemW(), cw = total * w;
    if (sl <= 0) { track.style.scrollBehavior = 'auto'; track.scrollLeft = cw; setTimeout(function () { track.style.scrollBehavior = ''; }, 20); }
    else if (sl >= cw * 2) { track.style.scrollBehavior = 'auto'; track.scrollLeft = cw; setTimeout(function () { track.style.scrollBehavior = ''; }, 20); }
  }, { passive: true });

  /* 버튼 — scrollTrack 전역함수가 없을 때만 정의 */
  if (typeof scrollTrack !== 'function') {
    window.scrollTrack = function (btn, dir) {
      var t = btn.closest('.scroll-wrap').querySelector('.scroll-track');
      var el = t.querySelector('.plan-card, .phone-card, .event-card, .review-card');
      var w = el ? el.offsetWidth + (parseInt(getComputedStyle(t).gap) || 16) : 300;
      t.scrollBy({ left: dir * w, behavior: 'smooth' });
    };
  }

  /* showMore 전역함수가 없을 때만 정의 */
  if (typeof showMore !== 'function') {
    window.showMore = function (trackId, btn) {
      document.getElementById(trackId).querySelectorAll('*').forEach(function (el) { el.style.display = ''; });
      btn.style.display = 'none';
    };
  }

  /* 터치 스와이프 */
  var tx = 0, ts = 0;
  track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ts = track.scrollLeft; }, { passive: true });
  track.addEventListener('touchmove',  function (e) { track.scrollLeft = ts + (tx - e.touches[0].clientX); }, { passive: true });
  track.addEventListener('touchend',   function ()  {
    var w = itemW(), snap = Math.round(track.scrollLeft / w) * w;
    track.scrollTo({ left: snap, behavior: 'smooth' });
  }, { passive: true });
})();

/* ── #usim 탭 필터 ── */
document.querySelectorAll('#usim .plan-tab').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#usim .plan-tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    usimFilterCards(btn.dataset.cat);
    var sel = document.querySelector('#usim .plan-select');
    if (sel) sel.value = btn.dataset.cat;
  });
});

function usimSelectCat(catId) {
  document.querySelectorAll('#usim .plan-tab').forEach(function (b) {
    b.classList.toggle('active', b.dataset.cat === catId);
  });
  usimFilterCards(catId);
}

function usimFilterCards(catId) {
  document.querySelectorAll('#usimTrack .plan-card').forEach(function (card) {
    card.style.display = (!catId || card.dataset.cat === catId) ? '' : 'none';
  });
}

/* ── 신청하기 → #form2 이동 + ciSelectProduct로 제품 선택 ── */
function usimApply(productId, name, category, price) {
  /* ciSelectProduct(테이블명, productId) — custom_inquiry_front.js 외부 호출용 함수 */
  if (typeof ciSelectProduct === 'function') {
    ciSelectProduct('form2', productId);
  }
  var target = document.getElementById('form2');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>
