<?php
/* ── 분류 1번(sort_order 첫번째) 제품 조회 ── */
$phoneProducts  = [];
$phoneCat1Id    = null;
try {
    $cat1 = $pdo->query(
        "SELECT id FROM product_categories WHERE is_active=1 ORDER BY sort_order, id LIMIT 1"
    )->fetch(PDO::FETCH_ASSOC);

    if ($cat1) {
        $phoneCat1Id = $cat1['id'];
        $prods = $pdo->prepare(
            "SELECT p.id, p.name, p.model_no, p.short_desc,
                    p.price, p.discount, p.image
             FROM product_products p
             WHERE p.category_id = ? 
             ORDER BY p.sort_order, p.id"
        );
        $prods->execute([$phoneCat1Id]);
        $phoneProducts = $prods->fetchAll(PDO::FETCH_ASSOC);

        foreach ($phoneProducts as &$p) {
            $p['priceMonthly']  = (int)$p['price'];
            $p['priceOriginal'] = $p['discount'] > 0 ? (int)($p['price'] + $p['discount']) : null;
        }
        unset($p);
    }
} catch (Exception $e) {}
?>

<!-- ═══ PHONES ═══ -->
<section id="phones">
  <div class="section-inner">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <div class="section-tag">휴대폰 추천</div>
        <h2 class="section-title">알뜰하게 구매하는<br><span>최신 스마트폰</span></h2>
        <p class="section-sub">공시지원금 + 알뜰폰 요금제 조합 최적화</p>
      </div>
      <a class="view-all" href="#">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
    <div class="scroll-wrap">
      <button class="scroll-arrow sa-left" onclick="scrollTrack(this,-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroll-track cols-3" id="phonesTrack">

        <?php if (empty($phoneProducts)): ?>
          <p style="padding:40px 0; color:#999;">등록된 제품이 없습니다.</p>
        <?php else: ?>
          <?php foreach ($phoneProducts as $p): ?>
          <div class="phone-card">
            <div class="phone-card-img">
              <?php if (!empty($p['image'])): ?>
                <img src="<?= htmlspecialchars($p['image']) ?>" alt="<?= htmlspecialchars($p['name']) ?>">
              <?php else: ?>
                <img src="" alt="<?= htmlspecialchars($p['name']) ?>" style="background:#f0f0f0;">
              <?php endif; ?>
            </div>
            <div class="phone-card-info">
              <div class="phone-brand"><?= htmlspecialchars($p['model_no'] ?? '') ?></div>
              <div class="phone-model"><?= htmlspecialchars($p['name']) ?></div>
              <div class="phone-storage"><?= htmlspecialchars($p['short_desc'] ?? '') ?></div>
              <div class="phone-monthly"><?= number_format($p['priceMonthly']) ?><small>원~/월</small></div>
              <?php if ($p['priceOriginal']): ?>
              <div class="phone-full-price">출고가 <?= number_format($p['priceOriginal']) ?>원</div>
              <?php else: ?>
              <div class="phone-full-price"></div>
              <?php endif; ?>
            </div>
          </div>
          <?php endforeach; ?>
        <?php endif; ?>

      </div>
      <button class="scroll-arrow sa-right" onclick="scrollTrack(this,1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <button class="show-more-btn" onclick="showMore('phonesTrack',this)">더보기 <i class="fa-solid fa-chevron-down"></i></button>
  </div>
</section>

<script>
(function () {
  var section = document.getElementById('phones');
  if (!section) return;

  var btnL  = section.querySelector('.sa-left');
  var btnR  = section.querySelector('.sa-right');
  var track = document.getElementById('phonesTrack');
  if (!btnL || !btnR || !track) return;

  function updateArrows() {
    var isMobile = window.innerWidth <= 768;
    var cards    = track.querySelectorAll('.phone-card');
    var count    = cards.length;
    var hide     = isMobile ? count <= 1 : count <= 3;
    btnL.style.display = hide ? 'none' : '';
    btnR.style.display = hide ? 'none' : '';
  }

  updateArrows();
  window.addEventListener('resize', updateArrows);
})();
</script>
