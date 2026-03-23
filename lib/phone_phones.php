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
            "SELECT p.id, p.name, p.model_no, p.short_desc, p.detail_desc,
                    p.price, p.discount, p.image
             FROM product_products p
             WHERE p.category_id = ?
             ORDER BY p.sort_order, p.id"
        );
        $prods->execute([$phoneCat1Id]);
        $phoneProducts = $prods->fetchAll(PDO::FETCH_ASSOC);

        /* 스펙 */
        if (!empty($phoneProducts)) {
            $phoneIds = array_column($phoneProducts, 'id');
            $ph = implode(',', array_fill(0, count($phoneIds), '?'));
            $specRows = $pdo->prepare(
                "SELECT product_id, spec_name, spec_value FROM product_specs
                  WHERE product_id IN ($ph) ORDER BY product_id, sort_order, id"
            );
            $specRows->execute($phoneIds);
            $phoneSpecsMap = [];
            foreach ($specRows->fetchAll(PDO::FETCH_ASSOC) as $s) {
                $phoneSpecsMap[$s['product_id']][] = ['name' => $s['spec_name'], 'value' => $s['spec_value']];
            }
        }

        foreach ($phoneProducts as &$p) {
            $p['priceMonthly']  = (int)$p['price'];
            $p['priceOriginal'] = $p['discount'] > 0 ? (int)($p['price'] + $p['discount']) : null;
            $p['specs']         = $phoneSpecsMap[$p['id']] ?? [];
        }
        unset($p);
    }
} catch (Exception $e) {}

/* JS용 데이터 */
$jsPhoneData = [];
foreach ($phoneProducts as $p) {
    $jsPhoneData[] = [
        'id'            => (int)$p['id'],
        'name'          => $p['name'],
        'model'         => $p['model_no'] ?? '',
        'price'         => (int)$p['price'],
        'priceOriginal' => $p['priceOriginal'],
        'specs'         => $p['specs'],
        'shortDesc'     => $p['short_desc'] ?? '',
        'detailDesc'    => $p['detail_desc'] ?? '',
        'image'         => $p['image'] ?? '',
    ];
}
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
      <a class="view-all" href="#" onclick="phAllOpen();return false;">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
    <div class="scroll-wrap">
      <button class="scroll-arrow sa-left" onclick="scrollTrack(this,-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroll-track cols-3" id="phonesTrack">

        <?php if (empty($phoneProducts)): ?>
          <p style="padding:40px 0; color:#999;">등록된 제품이 없습니다.</p>
        <?php else: ?>
          <?php foreach ($phoneProducts as $p): ?>
          <div class="phone-card" onclick="phoneDetailOpen(<?= (int)$p['id'] ?>)" style="cursor:pointer;">
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

<!-- ═══ 휴대폰 전체보기 모달 ═══ -->
<div class="ph-modal-bg" id="phAllModal" onclick="if(event.target===this)phAllClose()">
  <div class="ph-modal ph-all-modal">
    <div class="ph-all-header">
      <div class="ph-all-title">전체 휴대폰</div>
      <button class="ph-modal-x" onclick="phAllClose()"></button>
    </div>
    <div class="ph-all-grid" id="phAllGrid"></div>
  </div>
</div>

<!-- ═══ 휴대폰 상세 모달 ═══ -->
<div class="ph-modal-bg" id="phDetailModal" onclick="if(event.target===this)phDetailClose()">
  <div class="ph-modal">
    <button class="ph-modal-x" onclick="phDetailClose()"></button>
    <div class="ph-modal-img" id="phModalImg"></div>
    <div class="ph-modal-body">
      <div class="ph-modal-model" id="phModalModel"></div>
      <div class="ph-modal-name"  id="phModalName"></div>
      <div class="ph-modal-price-row">
        <div class="ph-modal-price"    id="phModalPrice"></div>
        <div class="ph-modal-original" id="phModalOriginal"></div>
      </div>
      <div class="ph-modal-specs" id="phModalSpecs"></div>
      <div class="ph-modal-desc"  id="phModalDesc"></div>
    </div>
  </div>
</div>

<style>
.ph-modal-bg {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.55); z-index: 9100;
  align-items: center; justify-content: center; padding: 16px;
}
.ph-modal-bg.open { display: flex; }
.ph-modal {
  background: #fff; border-radius: 16px; overflow: hidden;
  width: 100%; max-width: 480px; max-height: 90vh;
  display: flex; flex-direction: column; position: relative;
}
.ph-modal-x {
  position: absolute; top: 14px; right: 14px; z-index: 10;
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: rgba(0,0,0,.08); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ph-modal-x::before, .ph-modal-x::after {
  content: ''; position: absolute; width: 14px; height: 1.5px; background: #555;
}
.ph-modal-x::before { transform: rotate(45deg); }
.ph-modal-x::after  { transform: rotate(-45deg); }
.ph-modal-x:hover { background: rgba(0,0,0,.15); }

.ph-modal-img { background: var(--gray-50,#f8f9fa); flex-shrink: 0; }
.ph-modal-img img { width: 100%; max-height: 240px; object-fit: contain; display: block; padding: 20px; box-sizing: border-box; }

.ph-modal-body { padding: 22px 24px 28px; overflow-y: auto; }
.ph-modal-model { font-size: .78rem; color: var(--color-base,#FF4D7D); font-weight: 700; margin-bottom: 4px; }
.ph-modal-name  { font-size: 1.15rem; font-weight: 900; color: #111; margin-bottom: 10px; line-height: 1.3; }
.ph-modal-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
.ph-modal-price strong { font-size: 1.5rem; font-weight: 900; color: #111; }
.ph-modal-price small { font-size: .8rem; color: #888; }
.ph-modal-original { font-size: .8rem; color: #aaa; text-decoration: line-through; }
.ph-modal-specs {
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 16px; padding: 14px 16px;
  background: var(--gray-50,#f8f9fa); border-radius: 10px;
}
.ph-modal-spec-row { display: flex; align-items: center; gap: 8px; font-size: .84rem; color: #444; }
.ph-modal-spec-row i { width: 16px; text-align: center; color: var(--color-base,#FF4D7D); flex-shrink: 0; }
.ph-modal-desc p { font-size: .82rem; line-height: 1.75; color: #555; margin: 0; }

@media (max-width: 600px) {
  .ph-modal-bg { padding: 0; align-items: flex-end; }
  .ph-modal { border-radius: 16px 16px 0 0; max-height: 92vh; }
  .ph-modal-img img { max-height: 180px; }
  .ph-modal-body { padding: 18px 18px 24px; }
  .ph-all-card-img { width: 56px; height: 56px; }
  .ph-all-header { padding: 16px 16px 0; }
  .ph-all-grid { padding: 12px 16px 20px; }
}
.ph-all-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0; flex-shrink: 0;
}
.ph-all-title { font-size: 1.05rem; font-weight: 900; color: #111; }
.ph-all-header .ph-modal-x { position: static; }
.ph-all-grid {
  overflow-y: auto; padding: 16px 24px 24px;
  display: flex; flex-direction: column; gap: 10px;
}
.ph-all-card {
  display: flex; align-items: center; gap: 16px;
  border: 1px solid #f0f0f0; border-radius: 12px;
  padding: 14px 16px; cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.ph-all-card:hover { border-color: var(--color-base,#FF4D7D); box-shadow: 0 2px 12px rgba(255,77,125,.1); }
.ph-all-card-img { width: 72px; height: 72px; flex-shrink: 0; background: var(--gray-50,#f8f9fa); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.ph-all-card-img img { width: 100%; height: 100%; object-fit: contain; padding: 6px; box-sizing: border-box; }
.ph-all-card-info { flex: 1; min-width: 0; }
.ph-all-card-model { font-size: .72rem; color: var(--color-base,#FF4D7D); font-weight: 700; margin-bottom: 2px; }
.ph-all-card-name  { font-size: .95rem; font-weight: 800; color: #111; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-all-card-desc  { font-size: .75rem; color: #888; }
.ph-all-card-right { text-align: right; flex-shrink: 0; }
.ph-all-card-price strong { font-size: 1.1rem; font-weight: 900; color: #111; }
.ph-all-card-price small  { font-size: .72rem; color: #888; }
.ph-all-card-original { font-size: .72rem; color: #bbb; text-decoration: line-through; margin-top: 2px; }
</style>

<script>
/* ── 화살표 숨김 처리 ── */
(function () {
  var section = document.getElementById('phones');
  if (!section) return;
  var btnL  = section.querySelector('.sa-left');
  var btnR  = section.querySelector('.sa-right');
  var track = document.getElementById('phonesTrack');
  if (!btnL || !btnR || !track) return;
  function updateArrows() {
    var isMobile = window.innerWidth <= 768;
    var count    = track.querySelectorAll('.phone-card').length;
    var hide     = isMobile ? count <= 1 : count <= 3;
    btnL.style.display = hide ? 'none' : '';
    btnR.style.display = hide ? 'none' : '';
  }
  updateArrows();
  window.addEventListener('resize', updateArrows);
})();

/* ── 데이터 주입 ── */
var _phoneData = <?php echo json_encode($jsPhoneData, JSON_UNESCAPED_UNICODE); ?>;

/* ── 유틸 ── */
function _phEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _phFmt(n) { return Number(n).toLocaleString('ko-KR'); }

/* ── 상세 모달 열기 ── */
function phoneDetailOpen(productId) {
  var p = _phoneData.find(function(d){ return d.id === productId; });
  if (!p) return;

  /* 이미지 */
  var imgEl = document.getElementById('phModalImg');
  if (p.image) {
    imgEl.innerHTML = '<img src="'+p.image+'" alt="'+_phEsc(p.name)+'">';
    imgEl.style.display = '';
  } else {
    imgEl.style.display = 'none';
  }

  /* 기본 정보 */
  document.getElementById('phModalModel').textContent = p.model;
  document.getElementById('phModalName').textContent  = p.name;
  document.getElementById('phModalPrice').innerHTML   = '<strong>'+_phFmt(p.price)+'</strong><small>원~/월</small>';
  document.getElementById('phModalOriginal').textContent = p.priceOriginal ? '출고가 '+_phFmt(p.priceOriginal)+'원' : '';

  /* 스펙 */
  var icons = ['fa-database','fa-phone','fa-comment'];
  var specsHtml = (p.specs || []).map(function(s, i) {
    var icon = icons[i] ? '<i class="fa-solid '+icons[i]+'"></i>' : '<i class="fa-solid fa-check"></i>';
    return '<div class="ph-modal-spec-row">'+icon+'<span>'+_phEsc(s.name)+' <strong>'+_phEsc(s.value)+'</strong></span></div>';
  }).join('');
  document.getElementById('phModalSpecs').innerHTML = specsHtml;

  /* 설명 */
  var descEl = document.getElementById('phModalDesc');
  if (p.shortDesc || p.detailDesc) {
    descEl.innerHTML = (p.shortDesc  ? '<p>'+_phEsc(p.shortDesc)+'</p>' : '') +
                       (p.detailDesc ? '<p style="margin-top:8px;color:#666;">'+_phEsc(p.detailDesc)+'</p>' : '');
    descEl.style.display = '';
  } else {
    descEl.style.display = 'none';
  }

  document.getElementById('phDetailModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function phDetailClose() {
  document.getElementById('phDetailModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── 전체보기 모달 ── */
function phAllOpen() {
  var grid = document.getElementById('phAllGrid');
  if (!_phoneData.length) {
    grid.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa;">등록된 제품이 없습니다.</p>';
  } else {
    grid.innerHTML = _phoneData.map(function(p) {
      return '<div class="ph-all-card" onclick="phAllClose();phoneDetailOpen('+p.id+')">' +
        '<div class="ph-all-card-img">' +
          (p.image ? '<img src="'+_phEsc(p.image)+'" alt="'+_phEsc(p.name)+'">' : '') +
        '</div>' +
        '<div class="ph-all-card-info">' +
          '<div class="ph-all-card-model">'+_phEsc(p.model)+'</div>' +
          '<div class="ph-all-card-name">'+_phEsc(p.name)+'</div>' +
          '<div class="ph-all-card-desc">'+_phEsc(p.shortDesc)+'</div>' +
        '</div>' +
        '<div class="ph-all-card-right">' +
          '<div class="ph-all-card-price"><strong>'+_phFmt(p.price)+'</strong><small>원~/월</small></div>' +
          (p.priceOriginal ? '<div class="ph-all-card-original">출고가 '+_phFmt(p.priceOriginal)+'원</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }
  document.getElementById('phAllModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function phAllClose() {
  document.getElementById('phAllModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { phDetailClose(); phAllClose(); }
});
</script>