<?php
/* ── BEST 제품 조회 (badge_text = 'BEST' + tags에 n위 포함, tags 숫자 순) ── */
$bestProducts = [];
try {
    $prods = $pdo->query(
        "SELECT p.id, p.category_id, p.name, p.model_no,
                p.badge_text, p.tags, p.price, p.discount
         FROM product_products p
         INNER JOIN product_categories c ON c.id = p.category_id AND c.is_active = 1
         WHERE p.badge_text = 'BEST'
           AND p.tags REGEXP '(^|,)[[:space:]]*[0-9]+위[[:space:]]*(,|$)'
         ORDER BY CAST(TRIM(SUBSTRING_INDEX(p.tags, '위', 1)) AS UNSIGNED), p.id"
    )->fetchAll(PDO::FETCH_ASSOC);

    /* 카테고리명 */
    $cats = $pdo->query(
        "SELECT id, name FROM product_categories WHERE is_active=1"
    )->fetchAll(PDO::FETCH_ASSOC);
    $catMap = [];
    foreach ($cats as $c) { $catMap[$c['id']] = $c['name']; }

    /* 스팩 */
    if (!empty($prods)) {
        $ids      = implode(',', array_map('intval', array_column($prods, 'id')));
        $allSpecs = $pdo->query(
            "SELECT product_id, spec_name, spec_value
             FROM product_specs
             WHERE product_id IN ($ids)
             ORDER BY product_id, sort_order, id"
        )->fetchAll(PDO::FETCH_ASSOC);
        $specsMap = [];
        foreach ($allSpecs as $s) {
            $specsMap[$s['product_id']][] = ['name' => $s['spec_name'], 'value' => $s['spec_value']];
        }
        foreach ($prods as &$p) {
            $p['catName']       = $catMap[$p['category_id']] ?? '';
            $p['specs']         = $specsMap[$p['id']] ?? [];
            $p['priceMonthly']  = (int)$p['price'];
            $p['priceOriginal'] = $p['discount'] > 0 ? (int)($p['price'] + $p['discount']) : null;
        }
        unset($p);
    }
    $bestProducts = $prods;
} catch (Exception $e) {}
?>

<!-- ═══ DATA PLANS (BEST) ═══ -->
<section id="data">
  <div class="section-inner">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <div class="best-label"><i class="fa-solid fa-crown"></i> BEST 요금제</div>
        <h2 class="section-title">가장 많이 선택한<br><span>데이터 요금제</span></h2>
        <p class="section-sub">실시간 인기 순위 기준 · 매주 업데이트</p>
      </div>
      <a class="view-all" href="#">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
    <div class="plans-list">

      <?php if (empty($bestProducts)): ?>
        <p style="padding:32px 0; color:#999; text-align:center;">등록된 BEST 요금제가 없습니다.</p>
      <?php else: ?>
        <?php foreach ($bestProducts as $rank => $p):
          /* tags 에서 'n위' 추출 */
          $rankLabel = '';
          foreach (array_map('trim', explode(',', $p['tags'] ?? '')) as $tag) {
              if (preg_match('/^(\d+위)$/', $tag, $m)) { $rankLabel = $m[1]; break; }
          }
          if (!$rankLabel) $rankLabel = ($rank + 1) . '위'; // fallback
          $isFirst = ($rankLabel === '1위');
          $rowClass     = $isFirst ? 'plan-row plan-row-hot' : 'plan-row';
          $badgeHtml    = $isFirst
            ? '<div class="plan-row-badge">' . $rankLabel . '</div>'
            : '<div class="plan-row-badge-dark">' . $rankLabel . '</div>';
          $opStyle      = $isFirst ? ' style="color:rgba(255,255,255,0.6)"' : '';
          $nameStyle    = $isFirst ? ' style="color:white"' : '';
          $labelStyle   = $isFirst ? ' style="color:rgba(255,255,255,0.5)"' : '';
          $val1Style    = $isFirst ? ' style="color:#FF7FA3"' : ' class="pink"';
          $valStyle     = $isFirst ? ' style="color:white"' : '';
          $origStyle    = $isFirst ? ' style="color:rgba(255,255,255,0.4)"' : '';
          $numStyle     = $isFirst ? ' style="color:white"' : '';
          $numSpanStyle = $isFirst ? ' style="color:rgba(255,255,255,0.65)"' : '';
          $vatStyle     = $isFirst ? ' style="color:rgba(255,255,255,0.45)"' : '';
          $btnClass     = $isFirst ? 'plan-row-btn plan-row-btn-hot' : 'plan-row-btn';
          $opText       = $p['catName'] . ($p['model_no'] ? ' · ' . $p['model_no'] : '');
        ?>
        <div class="<?= $rowClass ?>" style="position:relative">
          <?= $badgeHtml ?>
          <div class="plan-row-left">
            <div class="plan-row-op"<?= $opStyle ?>><?= htmlspecialchars($opText) ?></div>
            <div class="plan-row-name"<?= $nameStyle ?>><?= htmlspecialchars($p['name']) ?></div>
          </div>
          <div class="plan-row-specs">
            <?php foreach ($p['specs'] as $si => $spec): ?>
            <div class="plan-row-spec">
              <span class="plan-row-spec-label"<?= $labelStyle ?>><?= htmlspecialchars($spec['name']) ?></span>
              <span class="plan-row-spec-val"<?= $si === 0 ? $val1Style : $valStyle ?>><?= htmlspecialchars($spec['value']) ?></span>
            </div>
            <?php endforeach; ?>
          </div>
          <div class="plan-row-price">
            <?php if ($p['priceOriginal']): ?>
            <div class="plan-row-original"<?= $origStyle ?>>기존 <?= number_format($p['priceOriginal']) ?>원</div>
            <?php else: ?>
            <div class="plan-row-original"></div>
            <?php endif; ?>
            <div class="plan-row-num-row">
              <div class="plan-row-num"<?= $numStyle ?>><?= number_format($p['priceMonthly']) ?><span<?= $numSpanStyle ?>>원</span></div>
              <div class="plan-row-vat"<?= $vatStyle ?>>/월 (VAT포함)</div>
            </div>
          </div>
          <button class="<?= $btnClass ?>"
                  onclick="ciSelectProduct('form2', <?= (int)$p['id'] ?>); document.getElementById('form2').scrollIntoView({behavior:'smooth',block:'start'});">
            신청하기 →
          </button>
        </div>
        <?php endforeach; ?>
      <?php endif; ?>

    </div>
  </div>
</section>
