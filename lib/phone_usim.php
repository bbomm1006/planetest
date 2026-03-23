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
                p.price, p.discount, p.short_desc, p.detail_desc, p.image
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

/* JS용 데이터 준비 */
$jsUsimData = [];
foreach ($usimProducts as $p) {
    $catName = '';
    foreach ($usimCategories as $cat) {
        if ((string)$cat['id'] === (string)$p['category_id']) { $catName = $cat['name']; break; }
    }
    $jsUsimData[] = [
        'id'            => (int)$p['id'],
        'categoryId'    => (string)$p['category_id'],
        'catName'       => $catName,
        'name'          => $p['name'],
        'badge'         => $p['badge_text'] ?? '',
        'badgeColor'    => $p['badge_color'] ?? '#1255a6',
        'price'         => (int)$p['price'],
        'priceOriginal' => $p['priceOriginal'],
        'specs'         => $p['specs'],
        'shortDesc'     => $p['short_desc'] ?? '',
        'detailDesc'    => $p['detail_desc'] ?? '',
        'image'         => $p['image'] ?? '',
    ];
}
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
      <a class="view-all" href="#" onclick="usimAllOpen();return false;">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
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
             onclick="usimDetailOpen(<?= (int)$p['id'] ?>)"
             style="cursor:pointer;">
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
                  onclick="event.stopPropagation();usimApply(<?= (int)$p['id'] ?>, '<?= htmlspecialchars($p['name'], ENT_QUOTES) ?>', '<?= htmlspecialchars($catName, ENT_QUOTES) ?>', <?= $p['priceMonthly'] ?>)">
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

<!-- ═══ 상세 모달 ═══ -->
<div class="usim-modal-bg" id="usimDetailModal" onclick="if(event.target===this)usimDetailClose()">
  <div class="usim-modal udm">
    <button class="usim-modal-x" onclick="usimDetailClose()"></button>
    <div class="udm-img-wrap"></div>
    <div class="udm-body">
      <span class="udm-badge"></span>
      <div class="udm-cat"></div>
      <div class="udm-name"></div>
      <div class="udm-price-row">
        <div class="udm-price"></div>
        <div class="udm-original"></div>
      </div>
      <div class="udm-specs"></div>
      <div class="udm-desc"></div>
      <button class="udm-apply-btn btn-plan" style="width:100%;margin-top:20px;">신청하기</button>
    </div>
  </div>
</div>

<!-- ═══ 전체보기 모달 ═══ -->
<div class="usim-modal-bg" id="usimAllModal" onclick="if(event.target===this)usimAllClose()">
  <div class="usim-modal uam">
    <div class="uam-header">
      <div class="uam-title">전체 요금제</div>
      <button class="usim-modal-x" onclick="usimAllClose()"></button>
    </div>
    <div class="uam-tabs"></div>
    <div class="uam-grid" id="usimAllGrid"></div>
  </div>
</div>

<style>
/* ── 모달 공통 ── */
.usim-modal-bg {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.55); z-index: 9100;
  align-items: center; justify-content: center; padding: 16px;
}
.usim-modal-bg.open { display: flex; }
.usim-modal {
  background: #fff; border-radius: 16px; overflow: hidden;
  width: 100%; position: relative;
  max-height: 90vh; display: flex; flex-direction: column;
}
.usim-modal-x {
  position: absolute; top: 14px; right: 14px; z-index: 10;
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: rgba(0,0,0,.08); cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.usim-modal-x::before, .usim-modal-x::after {
  content: ''; position: absolute; width: 14px; height: 1.5px; background: #555;
}
.usim-modal-x::before { transform: rotate(45deg); }
.usim-modal-x::after  { transform: rotate(-45deg); }
.usim-modal-x:hover { background: rgba(0,0,0,.15); }

/* ── 상세 모달 ── */
.usim-modal.udm { max-width: 480px; }
.udm-img-wrap { background: var(--gray-50,#f8f9fa); flex-shrink: 0; }
.udm-img-wrap img { width: 100%; max-height: 220px; object-fit: contain; display: block; padding: 16px; box-sizing: border-box; }
.udm-body { padding: 22px 24px 28px; overflow-y: auto; }
.udm-badge { display: inline-block; font-size: .7rem; font-weight: 800; color: #fff; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; }
.udm-cat { font-size: .78rem; color: var(--color-base,#FF4D7D); font-weight: 700; margin-bottom: 4px; }
.udm-name { font-size: 1.15rem; font-weight: 900; color: #111; margin-bottom: 10px; line-height: 1.3; }
.udm-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
.udm-price strong { font-size: 1.6rem; font-weight: 900; color: #111; }
.udm-price small { font-size: .8rem; color: #888; font-weight: 400; }
.udm-original { font-size: .8rem; color: #aaa; text-decoration: line-through; }
.udm-specs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; padding: 14px 16px; background: var(--gray-50,#f8f9fa); border-radius: 10px; }
.udm-spec-row { display: flex; align-items: center; gap: 8px; font-size: .84rem; color: #444; }
.udm-spec-row i { width: 16px; text-align: center; color: var(--color-base,#FF4D7D); flex-shrink: 0; }
.udm-desc p { font-size: .82rem; line-height: 1.75; color: #555; margin: 0; }

/* ── 전체보기 모달 ── */
.usim-modal.uam { max-width: 720px; }
.uam-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; flex-shrink: 0; }
.uam-title { font-size: 1.05rem; font-weight: 900; color: #111; }
.uam-header .usim-modal-x { position: static; }
.uam-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 14px 24px; flex-shrink: 0; border-bottom: 1px solid #f0f0f0; }
.uam-tab { padding: 6px 16px; border-radius: 20px; border: 1px solid #e0e0e0; background: #fff; font-size: .78rem; font-weight: 700; color: #666; cursor: pointer; transition: all .15s; }
.uam-tab.active, .uam-tab:hover { background: var(--color-base,#FF4D7D); color: #fff; border-color: var(--color-base,#FF4D7D); }
.uam-grid { overflow-y: auto; padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 10px; }
.uam-card { border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px 18px; cursor: pointer; transition: box-shadow .15s, border-color .15s; }
.uam-card:hover { border-color: var(--color-base,#FF4D7D); box-shadow: 0 2px 12px rgba(255,77,125,.1); }
.uam-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.uam-card-left { flex: 1; min-width: 0; }
.uam-card-cat { font-size: .72rem; color: var(--color-base,#FF4D7D); font-weight: 700; margin-bottom: 3px; }
.uam-card-name { font-size: .95rem; font-weight: 800; color: #111; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.uam-card-badge { font-size: .64rem; font-weight: 800; color: #fff; padding: 2px 8px; border-radius: 20px; }
.uam-card-specs { display: flex; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
.uam-spec { font-size: .75rem; color: #666; display: flex; align-items: center; gap: 4px; }
.uam-spec i { color: var(--color-base,#FF4D7D); font-size: .7rem; }
.uam-card-right { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.uam-card-price strong { font-size: 1.2rem; font-weight: 900; color: #111; }
.uam-card-price small { font-size: .75rem; color: #888; }
.uam-card-original { font-size: .72rem; color: #bbb; text-decoration: line-through; }
.uam-apply-btn { margin-top: 6px; padding: 7px 16px; border-radius: 8px; background: var(--color-base,#FF4D7D); color: #fff; border: none; font-size: .78rem; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.uam-apply-btn:hover { opacity: .85; }

/* ── 반응형 ── */
@media (max-width: 600px) {
  .usim-modal-bg { padding: 0; align-items: flex-end; }
  .usim-modal { border-radius: 16px 16px 0 0; max-height: 92vh; }
  .uam-card-top { flex-direction: column; align-items: flex-start; }
  .uam-card-right { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
  .uam-apply-btn { margin-top: 0; }
  .udm-body { padding: 18px 18px 24px; }
}
</style>

<script>
/* ── scrollTrack : #usim 전용 (전역 scrollTrack 없을 때 대비) ── */
(function () {
  var track = document.getElementById('usimTrack');
  if (!track) return;

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

  setTimeout(function () { track.scrollLeft = total * itemW(); }, 0);

  track.addEventListener('scroll', function () {
    var sl = track.scrollLeft, w = itemW(), cw = total * w;
    if (sl <= 0) { track.style.scrollBehavior = 'auto'; track.scrollLeft = cw; setTimeout(function () { track.style.scrollBehavior = ''; }, 20); }
    else if (sl >= cw * 2) { track.style.scrollBehavior = 'auto'; track.scrollLeft = cw; setTimeout(function () { track.style.scrollBehavior = ''; }, 20); }
  }, { passive: true });

  if (typeof scrollTrack !== 'function') {
    window.scrollTrack = function (btn, dir) {
      var t = btn.closest('.scroll-wrap').querySelector('.scroll-track');
      var el = t.querySelector('.plan-card, .phone-card, .event-card, .review-card');
      var w = el ? el.offsetWidth + (parseInt(getComputedStyle(t).gap) || 16) : 300;
      t.scrollBy({ left: dir * w, behavior: 'smooth' });
    };
  }

  if (typeof showMore !== 'function') {
    window.showMore = function (trackId, btn) {
      document.getElementById(trackId).querySelectorAll('*').forEach(function (el) { el.style.display = ''; });
      btn.style.display = 'none';
    };
  }

  var tx = 0, ts = 0;
  track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ts = track.scrollLeft; }, { passive: true });
  track.addEventListener('touchmove',  function (e) { track.scrollLeft = ts + (tx - e.touches[0].clientX); }, { passive: true });
  track.addEventListener('touchend',   function () {
    var w = itemW(), snap = Math.round(track.scrollLeft / w) * w;
    track.scrollTo({ left: snap, behavior: 'smooth' });
  }, { passive: true });
})();

/* ── 탭 필터 ── */
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

/* ── 신청하기 ── */
function usimApply(productId, name, category, price) {
  if (typeof ciSelectProduct === 'function') {
    ciSelectProduct('form2', productId);
  }
  var target = document.getElementById('form2');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  usimDetailClose();
}

/* ── PHP 데이터 주입 ── */
var _usimData = <?php echo json_encode($jsUsimData, JSON_UNESCAPED_UNICODE); ?>;
var _usimCats = <?php echo json_encode(array_values($usimCategories), JSON_UNESCAPED_UNICODE); ?>;

/* ── 유틸 ── */
function _escU(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function _numFmt(n) { return Number(n).toLocaleString('ko-KR'); }

/* ── 상세 모달 ── */
function usimDetailOpen(productId) {
  var p = _usimData.find(function(d){ return d.id === productId; });
  if (!p) return;
  var m = document.getElementById('usimDetailModal');

  var badgeEl = m.querySelector('.udm-badge');
  if (p.badge) { badgeEl.textContent = p.badge; badgeEl.style.background = p.badgeColor; badgeEl.style.display = ''; }
  else { badgeEl.style.display = 'none'; }

  var imgWrap = m.querySelector('.udm-img-wrap');
  if (p.image) { imgWrap.innerHTML = '<img src="'+p.image+'" alt="'+_escU(p.name)+'">'; imgWrap.style.display = ''; }
  else { imgWrap.style.display = 'none'; }

  m.querySelector('.udm-cat').textContent  = p.catName;
  m.querySelector('.udm-name').textContent = p.name;
  m.querySelector('.udm-price').innerHTML  = '<strong>'+_numFmt(p.price)+'</strong><small>원/월</small>';
  m.querySelector('.udm-original').textContent = p.priceOriginal ? '기존 '+_numFmt(p.priceOriginal)+'원' : '';

  var icons = ['fa-database','fa-phone','fa-comment'];
  m.querySelector('.udm-specs').innerHTML = p.specs.map(function(s, i) {
    var icon = icons[i] ? '<i class="fa-solid '+icons[i]+'"></i>' : '<i class="fa-solid fa-check"></i>';
    return '<div class="udm-spec-row">'+icon+'<span>'+_escU(s.name)+' <strong>'+_escU(s.value)+'</strong></span></div>';
  }).join('');

  var descEl = m.querySelector('.udm-desc');
  if (p.shortDesc || p.detailDesc) {
    descEl.innerHTML = (p.shortDesc ? '<p>'+_escU(p.shortDesc)+'</p>' : '') +
                       (p.detailDesc ? '<p style="margin-top:8px;color:#666;">'+_escU(p.detailDesc)+'</p>' : '');
    descEl.style.display = '';
  } else {
    descEl.style.display = 'none';
  }

  m.querySelector('.udm-apply-btn').onclick = function() {
    usimApply(p.id, p.name, p.catName, p.price);
  };

  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function usimDetailClose() {
  document.getElementById('usimDetailModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── 전체보기 모달 ── */
function usimAllOpen() {
  var m = document.getElementById('usimAllModal');
  var tabHtml = '<button class="uam-tab active" data-cat="" onclick="usimAllFilter(this,\'\')">전체</button>';
  _usimCats.forEach(function(c) {
    tabHtml += '<button class="uam-tab" data-cat="'+c.id+'" onclick="usimAllFilter(this,\''+c.id+'\')">'+_escU(c.name)+'</button>';
  });
  m.querySelector('.uam-tabs').innerHTML = tabHtml;
  usimAllRender('');
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function usimAllClose() {
  document.getElementById('usimAllModal').classList.remove('open');
  document.body.style.overflow = '';
}

function usimAllFilter(btn, catId) {
  document.querySelectorAll('#usimAllModal .uam-tab').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  usimAllRender(catId);
}

function usimAllRender(catId) {
  var list = catId ? _usimData.filter(function(p){ return p.categoryId === catId; }) : _usimData;
  var grid = document.getElementById('usimAllGrid');
  if (!list.length) {
    grid.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa;">등록된 요금제가 없습니다.</p>';
    return;
  }
  grid.innerHTML = list.map(function(p) {
    var badge = p.badge ? '<span class="uam-card-badge" style="background:'+p.badgeColor+'">'+_escU(p.badge)+'</span>' : '';
    var specsHtml = p.specs.slice(0,3).map(function(s, i) {
      var icons = ['fa-database','fa-phone','fa-comment'];
      return '<span class="uam-spec"><i class="fa-solid '+icons[i]+'"></i> <strong>'+_escU(s.value)+'</strong></span>';
    }).join('');
    return '<div class="uam-card" onclick="usimAllClose();usimDetailOpen('+p.id+')">' +
      '<div class="uam-card-top">' +
        '<div class="uam-card-left">' +
          '<div class="uam-card-cat">'+_escU(p.catName)+'</div>' +
          '<div class="uam-card-name">'+_escU(p.name)+badge+'</div>' +
          '<div class="uam-card-specs">'+specsHtml+'</div>' +
        '</div>' +
        '<div class="uam-card-right">' +
          '<div class="uam-card-price"><strong>'+_numFmt(p.price)+'</strong><small>원/월</small></div>' +
          (p.priceOriginal ? '<div class="uam-card-original">기존 '+_numFmt(p.priceOriginal)+'원</div>' : '') +
          '<button class="uam-apply-btn" onclick="event.stopPropagation();usimAllClose();usimApply('+p.id+',\''+_escU(p.name)+'\',\''+_escU(p.catName)+'\','+p.price+')">신청하기</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { usimDetailClose(); usimAllClose(); }
});
</script>