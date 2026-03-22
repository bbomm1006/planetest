<?php
$pdo        = getDB();
$site       = $pdo->query("SELECT header_logo FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
$headerLogo = $site['header_logo'] ?? '';

// front_sections 기반 헤더 메뉴 자동 생성
// nav_label이 설정된 활성 섹션 중 lib 파일이 실제 존재하는 것만 표시
$_navItems = [];
try {
  $_st = $pdo->query(
    "SELECT nav_label, anchor_id, file_name FROM front_sections
      WHERE is_active = 1 AND nav_label IS NOT NULL AND nav_label != ''
      ORDER BY sort_order, id"
  );
  $_coreNavFiles = ['_site', '_nav', '_ft'];
  foreach ($_st->fetchAll(PDO::FETCH_ASSOC) as $_ni) {
    if (in_array($_ni['file_name'], $_coreNavFiles, true)) {
      $_navItems[] = $_ni;
      continue;
    }
    $_fn = preg_replace('/[^a-zA-Z0-9_\-]/', '',
                        pathinfo($_ni['file_name'], PATHINFO_FILENAME));
    if ($_fn !== '' && file_exists(__DIR__ . '/' . $_fn . '.php')) {
      $_navItems[] = $_ni;
    }
  }
} catch (Exception $e) {
  // 컬럼/테이블 미존재 시 정적 fallback 사용
}

// CTA anchor: 첫 번째 nav_label 중 '예약' 또는 '상담'이 포함된 항목, 없으면 첫 항목
$_ctaAnchor = '';
$_ctaLabel  = '무료 상담 신청';
foreach ($_navItems as $_ni) {
  if (mb_strpos($_ni['nav_label'], '예약') !== false || mb_strpos($_ni['nav_label'], '상담') !== false) {
    $_ctaAnchor = $_ni['anchor_id'];
    break;
  }
}
?>

<style>
  
/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
nav{
  position:fixed;top:40px;left:0;right:0;z-index:1000;height:64px;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 var(--section-pad-h);
  transition:background .35s var(--ease-out),border-color .35s,box-shadow .35s;
  background:rgba(8,14,26,.94);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  border-bottom:1px solid rgba(255,255,255,.07);
  box-shadow:0 1px 0 rgba(0,0,0,.12);
}
nav.s{background:rgba(8,14,26,.97);border-bottom-color:rgba(255,255,255,.09);}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
.nav-mark{width:34px;height:34px;border-radius:10px;
  background:linear-gradient(135deg,var(--sky),var(--aqua));
  display:grid;place-items:center;}
.nav-mark svg{width:17px;height:17px;fill:#fff;}
.nav-name{font-family:'Bebas Neue',sans-serif;font-size:1.45rem;color:var(--white);letter-spacing:1px;line-height:1;}
.nav-name em{color:var(--aqua);font-style:normal;}
.nav-links{display:flex;gap:24px;list-style:none;}
.nav-links a{text-decoration:none;color:rgba(255,255,255,.68);font-size:.83rem;font-weight:500;
  transition:color .2s;letter-spacing:.2px;white-space:nowrap;}
.nav-links a:hover{color:#fff;}
.nav-cta{padding:8px 20px;border-radius:100px;
  background:linear-gradient(135deg,var(--blue),var(--sky));
  color:#fff;font-size:.81rem;font-weight:700;border:none;cursor:pointer;
  text-decoration:none;letter-spacing:.3px;white-space:nowrap;
  transition:transform .22s,box-shadow .22s;}
.nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(30,127,232,.45);}

/* 햄버거 (모바일 전용) */
.nav-ham{
  display:none;flex-direction:column;justify-content:center;gap:5px;
  width:36px;height:36px;border:none;background:transparent;cursor:pointer;padding:4px;flex-shrink:0;
}
.nav-ham span{display:block;height:2px;background:#fff;border-radius:2px;transition:transform .28s var(--ease-out),opacity .2s;}


@media(max-width:1024px){.nav-links{gap:18px;}}
@media(max-width:768px){
  .nav-links{display:none;}
  .nav-cta{display:none;}
  .nav-ham{display:flex;}

}
/* 모바일 드로어 */
.nav-drawer {
  position: fixed; top: 0; right: -300px; width: 300px; height: 100%;
  background: linear-gradient(180deg, #0d1829 0%, #080e1a 100%);
  z-index: 1100;
  display: flex; flex-direction: column;
  transition: right .32s cubic-bezier(.4,0,.2,1);
  border-left: 1px solid rgba(255,255,255,.08);
}
.nav-drawer.open { right: 0; }

.nav-drawer-head {
  padding: 20px 20px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.nav-drawer-head span {
  color: rgba(255,255,255,.35); font-size: 11px; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
}
.nav-drawer-close {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  color: #fff; font-size: 16px; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .2s, border-color .2s;
}


.nav-drawer-links {
  flex: 1; list-style: none; padding: 8px 0; overflow-y: auto;
}
.nav-drawer-links li a {
  display: flex; align-items: center; gap: 12px;
  color: rgba(255,255,255,.55); text-decoration: none;
  font-size: .9rem; font-weight: 500;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  transition: color .2s, background .2s;
}
.nav-drawer-links li a::before {
  content: ''; display: block;
  width: 3px; height: 14px;
  background: transparent; border-radius: 2px;
  transition: background .2s;
  flex-shrink: 0;
}


.nav-drawer-cta {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,.07);
}
.nav-drawer-cta a {
  display: block; text-align: center;
  padding: 13px; border-radius: 100px;
  background: linear-gradient(135deg, var(--blue), var(--sky));
  color: #fff; font-size: .85rem; font-weight: 700;
  text-decoration: none; letter-spacing: .3px;
  transition: opacity .2s, transform .2s;
}


.nav-overlay {
  display: none; position: fixed; inset: 0; z-index: 1099;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
.nav-overlay.open { display: block; }

/* 햄버거 → X */
.nav-ham.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-ham.open span:nth-child(2) { opacity: 0; }
.nav-ham.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* hover는 실제 마우스 기기에서만 */
@media (hover: hover) {
  .nav-drawer-links li a:hover {
    color: #fff;
    background: rgba(255,255,255,.04);
  }
  .nav-drawer-links li a:hover::before {
    background: #38bdf8;
  }
  .nav-drawer-close:hover {
    background: rgba(255,255,255,.12);
    border-color: rgba(255,255,255,.3);
  }
  .nav-drawer-cta a:hover {
    opacity: .9;
    transform: translateY(-1px);
  }
}

</style>

<nav id="mn">

  <a class="nav-logo" href="#">
    <img src="<?= htmlspecialchars($headerLogo ?: './img/logo.png') ?>" alt="THE GEAR SHOP" class="nav-logo-img">
  </a>

  <ul class="nav-links">
    <?php if (!empty($_navItems)): ?>
      <?php foreach ($_navItems as $_ni): ?>
      <li><a href="#<?= htmlspecialchars($_ni['anchor_id']) ?>"><?= htmlspecialchars($_ni['nav_label']) ?></a></li>
      <?php endforeach; ?>
    <?php else: ?>
      <!-- front_sections 미설정 시 정적 fallback -->
      <li><a href="#benefits">혜택</a></li>
      <li><a href="#products">제품</a></li>
      <li><a href="#videos">영상</a></li>
      <li><a href="#reviews">후기</a></li>
      <li><a href="#event">이벤트</a></li>
      <li><a href="#stores">매장찾기</a></li>
      <li><a href="#notices">공지사항</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><a href="#gallery">갤러리</a></li>
    <?php endif; ?>
  </ul>

  <a class="nav-cta" href="<?= $_ctaAnchor ? '#' . htmlspecialchars($_ctaAnchor) : '#inquiry' ?>"><?= htmlspecialchars($_ctaLabel) ?></a>

  <button class="nav-ham" id="navHam" aria-label="메뉴 열기">
    <span></span>
    <span></span>
    <span></span>
  </button>

</nav>

<!-- ✅ 모바일 드로어 메뉴 -->
<div class="nav-drawer" id="navDrawer">
  <div class="nav-drawer-head">
    <span>MENU</span>
    <button class="nav-drawer-close" id="navClose" aria-label="메뉴 닫기">✕</button>
  </div>

  <ul class="nav-drawer-links">
    <?php if (!empty($_navItems)): ?>
      <?php foreach ($_navItems as $_ni): ?>
      <li><a href="#<?= htmlspecialchars($_ni['anchor_id']) ?>" class="drawer-link"><?= htmlspecialchars($_ni['nav_label']) ?></a></li>
      <?php endforeach; ?>
    <?php else: ?>
      <li><a href="#benefits" class="drawer-link">혜택</a></li>
      <li><a href="#products" class="drawer-link">제품</a></li>
      <li><a href="#videos" class="drawer-link">영상</a></li>
      <li><a href="#reviews" class="drawer-link">후기</a></li>
      <li><a href="#event" class="drawer-link">이벤트</a></li>
      <li><a href="#stores" class="drawer-link">매장찾기</a></li>
    <?php endif; ?>
  </ul>

  <div class="nav-drawer-cta">
    <a href="<?= $_ctaAnchor ? '#'.htmlspecialchars($_ctaAnchor) : '#inquiry' ?>" class="drawer-link">
      <?= htmlspecialchars($_ctaLabel) ?>
    </a>
  </div>
</div>
<div class="nav-overlay" id="navOverlay"></div>

<script>
(function(){
  var ham     = document.getElementById('navHam');
  var close   = document.getElementById('navClose');
  var drawer  = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');

  function toggle(open){
    ham.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  ham.addEventListener('click', function(){ toggle(true); });
  close.addEventListener('click', function(){ toggle(false); });
  overlay.addEventListener('click', function(){ toggle(false); });

  document.querySelectorAll('.drawer-link').forEach(function(a){
    a.addEventListener('click', function(){ toggle(false); });
  });
})();
</script>