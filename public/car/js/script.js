/* ══════════════════════════════════════════
   비전오토플랜 - 장기렌트카 랜딩페이지
   script.js
══════════════════════════════════════════ */

/* ── CONFETTI ── */
const confettiColors = ['#ceff57','#FF2D87','#FFD700','#FF6B6B','#fff','#ADFF2F','#FF69B4'];
const cf = document.getElementById('confetti');
if (cf) {
  for (let i = 0; i < 35; i++) {
    const c = document.createElement('div');
    c.className = 'c-item';
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${6 + Math.random() * 10}px;
      height: ${6 + Math.random() * 10}px;
      background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
      animation-duration: ${3 + Math.random() * 5}s;
      animation-delay: ${Math.random() * 4}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      opacity: ${0.6 + Math.random() * 0.4};
    `;
    cf.appendChild(c);
  }
}

/* ── COUNT UP ── */
function countUp(el, target, cb) {
  let cur = 0;
  const duration = 1800;
  const steps = 80;
  const interval = duration / steps;
  const increment = target / steps;
  const t = setInterval(() => {
    cur = Math.min(cur + increment, target);
    el.textContent = Math.floor(cur).toLocaleString();
    if (cur >= target) {
      el.textContent = target.toLocaleString();
      clearInterval(t);
      if (cb) cb();
    }
  }, interval);
}
countUp(document.getElementById('quote-count'), 247);
countUp(document.getElementById('contract-count'), 83);
countUp(document.getElementById('monthly-count'), 1842);

/* ── LIVE COUNTER (실시간 증가) ── */
function liveIncrement(id, interval, probability) {
  setInterval(() => {
    const el = document.getElementById(id);
    if (!el) return;
    if (Math.random() > (1 - probability)) {
      const v = parseInt(el.textContent.replace(/,/g, ''));
      el.textContent = (v + 1).toLocaleString();
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'numPop .3s ease';
    }
  }, interval);
}
liveIncrement('quote-count', 2500, 0.55);
liveIncrement('contract-count', 5000, 0.45);
liveIncrement('monthly-count', 4000, 0.50);

/* ── 접수현황: 3행 + 가운데 강조 롤링 ── */
(function initReceptionRoll() {
  const prevEl = document.getElementById('rfPrev');
  const focusEl = document.getElementById('rfFocus');
  const nextEl = document.getElementById('rfNext');
  const roll = document.getElementById('receptionRoll');
  if (!prevEl || !focusEl || !nextEl) return;

  const RECEPTION_DATA = [
    { type: 'recv', customer: '김**', brand: '현대', car: '팰리세이드', time: '방금 전' },
    { type: 'contract', customer: '이**', brand: '기아', car: 'EV6', time: '2분 전' },
    { type: 'recv', customer: '박**', brand: '제네시스', car: 'GV80', time: '5분 전' },
    { type: 'contract', customer: '최**', brand: 'BMW', car: '5시리즈', time: '8분 전' },
    { type: 'recv', customer: '정**', brand: '현대', car: '아이오닉6', time: '11분 전' },
    { type: 'contract', customer: '강**', brand: '벤츠', car: 'E클래스', time: '14분 전' },
    { type: 'recv', customer: '윤**', brand: '기아', car: '카니발', time: '18분 전' },
    { type: 'contract', customer: '장**', brand: '현대', car: '그랜저', time: '22분 전' },
    { type: 'recv', customer: '한**', brand: '테슬라', car: '모델Y', time: '26분 전' },
    { type: 'contract', customer: '오**', brand: '볼보', car: 'XC60', time: '31분 전' }
  ];

  const n = RECEPTION_DATA.length;
  let idx = 0;

  function badge(d) {
    return d.type === 'recv'
      ? '<span class="badge-recv">접수완료</span>'
      : '<span class="badge-contract">계약완료</span>';
  }

  function rowHtml(d) {
    return `<div class="rf-row rf-row--simple">
      <div class="rf-line1">
        ${badge(d)}
        <span class="rf-car-name">${d.car}</span>
      </div>
      <div class="rf-line2">
        <span class="rf-cust">${d.customer}</span>
        <span class="rf-sep">·</span>
        <span class="rf-brand">${d.brand}</span>
        <span class="rf-sep">·</span>
        <span class="rf-time">${d.time}</span>
      </div>
    </div>`;
  }

  function render() {
    const prev = RECEPTION_DATA[(idx - 1 + n) % n];
    const cur = RECEPTION_DATA[idx];
    const next = RECEPTION_DATA[(idx + 1) % n];
    prevEl.innerHTML = rowHtml(prev);
    focusEl.innerHTML = rowHtml(cur);
    nextEl.innerHTML = rowHtml(next);
  }

  function step() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (roll) {
      roll.classList.remove('rf-roll--nudge');
      void roll.offsetWidth;
      roll.classList.add('rf-roll--nudge');
    }
    idx = (idx + 1) % n;
    render();
    focusEl.classList.remove('rf-slot--flash');
    void focusEl.offsetWidth;
    focusEl.classList.add('rf-slot--flash');
  }

  render();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(step, 4000);
  }
})();

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  .forEach(el => observer.observe(el));

/* ── FAQ TOGGLE ── */
function toggleFaq(el) {
  el.parentElement.classList.toggle('open');
}

/* ── PRICE: 국산/수입 + 제조사 탭 (로고 + 리스트 배너) ── */
const BRANDS_DOMESTIC = ['현대', '기아', '제네시스', '쉐보레', '르노', 'KG모빌리티', '쌍용', '폴스타'];
const BRANDS_IMPORT = ['BMW', '벤츠', '아우디', '볼보', '렉서스', '테슬라', '포르쉐', '지프'];

const BRAND_LOGO = {
  현대: 'images/brands/hyundai.svg',
  기아: 'images/brands/kia.svg',
  제네시스: 'images/brands/genesis.svg',
  쉐보레: 'images/brands/chevrolet.svg',
  르노: 'images/brands/renault.svg',
  KG모빌리티: 'images/brands/kg.svg',
  쌍용: 'images/brands/ssangyong.svg',
  폴스타: 'images/brands/polestar.svg',
  BMW: 'images/brands/bmw.svg',
  벤츠: 'images/brands/mercedes.svg',
  아우디: 'images/brands/audi.svg',
  볼보: 'images/brands/volvo.svg',
  렉서스: 'images/brands/lexus.svg',
  테슬라: 'images/brands/tesla.svg',
  포르쉐: 'images/brands/porsche.svg',
  지프: 'images/brands/jeep.svg'
};

function getBrandLogoSrc(name) {
  return BRAND_LOGO[name] || '';
}

function renderBrandTabsHtml(brands) {
  return brands
    .map((name, i) => {
      const src = getBrandLogoSrc(name);
      const img = src
        ? `<img class="brand-tab__logo" src="${src}" width="120" height="28" loading="lazy" decoding="async" alt="">`
        : '';
      return `<button type="button" class="brand-tab${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" data-brand="${name}">${img}<span class="brand-tab__label">${name}</span></button>`;
    })
    .join('');
}

function updateVehicleBrandBanner(brandName) {
  const banner = document.getElementById('vehicle-brand-banner');
  const img = document.getElementById('vehicle-brand-banner-img');
  if (!banner || !img) return;
  const src = getBrandLogoSrc(brandName);
  if (src) {
    img.src = src;
    img.alt = `${brandName} 로고`;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

function applyVehicleBrandFilter(brandName) {
  const grid = document.getElementById('vehicle-grid');
  const empty = document.getElementById('vehicle-grid-empty');
  if (!grid) return;
  let visible = 0;
  grid.querySelectorAll('.vehicle-card').forEach(card => {
    const b = (card.dataset.vBrand || '').trim();
    if (b === brandName) {
      card.classList.remove('vehicle-card--filtered-out');
      visible += 1;
    } else {
      card.classList.add('vehicle-card--filtered-out');
    }
  });
  if (empty) {
    empty.hidden = visible > 0;
  }
  grid.hidden = visible === 0;
  const moreHost = document.getElementById('vehicle-more-host');
  if (moreHost) {
    moreHost.style.display = visible === 0 ? 'none' : '';
  }
}

function wireBrandTabs() {
  const bg = document.getElementById('brand-grid');
  if (!bg) return;
  bg.querySelectorAll('.brand-tab').forEach(b => {
    b.addEventListener('click', () => {
      bg.querySelectorAll('.brand-tab').forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-selected', 'false');
      });
      b.classList.add('active');
      b.setAttribute('aria-selected', 'true');
      const brand = b.getAttribute('data-brand') || '';
      updateVehicleBrandBanner(brand);
      applyVehicleBrandFilter(brand);
    });
  });
}

function setTab(btn, type) {
  document.querySelectorAll('.price-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }

  const bg = document.getElementById('brand-grid');
  if (!bg) return;
  const brands = type === 'import' ? BRANDS_IMPORT : BRANDS_DOMESTIC;
  bg.innerHTML = renderBrandTabsHtml(brands);
  wireBrandTabs();
  const first = brands[0];
  if (first) {
    updateVehicleBrandBanner(first);
    applyVehicleBrandFilter(first);
  }
}

wireBrandTabs();
(function initPriceBrandBannerAndFilter() {
  const bg = document.getElementById('brand-grid');
  if (!bg) return;
  const active = bg.querySelector('.brand-tab.active');
  const name = active && active.getAttribute('data-brand');
  if (name) {
    updateVehicleBrandBanner(name);
    applyVehicleBrandFilter(name);
  }
})();

/* ── 차량 카드 → 상세 모달 ── */
function openVehicleModal(card) {
  const d = card.dataset;
  const modal = document.getElementById('vehicle-detail-modal');
  const img = document.getElementById('vehicle-modal-img');
  const ph = document.getElementById('vehicle-modal-img-ph');
  if (!modal) return;

  document.getElementById('vehicle-modal-brand').textContent = d.vBrand || '';
  document.getElementById('vehicle-modal-heading').textContent = d.vName || '';
  document.getElementById('vehicle-modal-range').textContent = d.vRange || '';
  document.getElementById('vehicle-modal-desc').textContent = d.vDesc || '';

  const priceLine = document.getElementById('vehicle-modal-priceline');
  if (d.vEmpty === '1') {
    priceLine.innerHTML = '<span class="vehicle-modal-muted">상담 후 협의</span>';
    img.removeAttribute('src');
    img.hidden = true;
    ph.hidden = false;
  } else {
    ph.hidden = true;
    img.hidden = false;
    img.src = d.vImg || '';
    img.alt = d.vName || '';
    const p = d.vPrice != null && String(d.vPrice) !== '' ? String(d.vPrice) : '—';
    priceLine.innerHTML = `<span class="vehicle-modal-from">월</span><span class="vehicle-modal-num">${p}</span><span class="vehicle-modal-won">만원</span><span class="vehicle-modal-tilde">~</span>`;
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicle-detail-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('#vehicle-grid .vehicle-card').forEach(card => {
  card.addEventListener('click', () => openVehicleModal(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openVehicleModal(card);
    }
  });
});

/* ── 차량 리스트: 8개 초과 시 더보기 ── */
(function initVehicleLoadMore() {
  const grid = document.getElementById('vehicle-grid');
  const host = document.getElementById('vehicle-more-host');
  if (!grid || !host) return;
  const cards = Array.from(grid.querySelectorAll('.vehicle-card'));
  const total = cards.length;
  const VISIBLE_FIRST = 8;
  if (total <= VISIBLE_FIRST) return;

  cards.forEach((card, i) => {
    if (i >= VISIBLE_FIRST) card.classList.add('is-collapsed-more');
  });

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'vehicle-more-btn';
  btn.id = 'vehicle-more-btn';
  btn.textContent = '더보기';
  btn.setAttribute('aria-expanded', 'false');
  host.appendChild(btn);

  btn.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('is-collapsed-more'));
    btn.setAttribute('aria-expanded', 'true');
    host.innerHTML = '';
  });
})();

document.querySelectorAll('[data-close-modal]').forEach(el => {
  el.addEventListener('click', closeVehicleModal);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeVehicleModal();
});

/* ── 이벤트 배너: 커버플로(중앙 고정·강조) + 빠른 롤링 트랙 ── */
(function initEventCoverflow() {
  const roll = document.querySelector('.event-promo-roll');
  const stage = document.querySelector('.event-promo-zero-stage');
  const track = document.querySelector('.event-promo-roll-track');
  if (!roll || !track) return;

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;

  function clearStyles() {
    track.querySelectorAll('.event-promo-slide').forEach((el) => {
      el.style.transform = '';
      el.style.zIndex = '';
      el.style.filter = '';
    });
  }

  function tick() {
    if (mqReduce.matches) {
      clearStyles();
      return;
    }
    const ref = stage || roll;
    const cx = ref.getBoundingClientRect().left + ref.offsetWidth * 0.5;
    track.querySelectorAll('.event-promo-slide').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2) return;
      const sc = r.left + r.width * 0.5;
      const dist = Math.abs(cx - sc);
      const influence = r.width * 1.25;
      let t = Math.max(0, 1 - dist / influence);
      t = t * t;
      const scale = 0.68 + 0.4 * t;
      const z = Math.round(15 + 185 * t);
      el.style.zIndex = String(z);
      el.style.transform = `scale(${scale})`;
      el.style.filter =
        t > 0.42
          ? 'saturate(1.06) brightness(1.03)'
          : 'saturate(0.9) brightness(0.9)';
    });
    raf = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(raf);
    if (mqReduce.matches) {
      clearStyles();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  mqReduce.addEventListener('change', start);
  start();
})();

/* ── 이벤트 썸네일: 로드 실패 시 대체 이미지(엑박 방지) ── */
(function initEventImgFallback() {
  const EVENT_FALLBACK =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
        '<defs><linearGradient id="evg" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#eef2f6"/><stop offset="100%" stop-color="#cfd8e6"/></linearGradient></defs>' +
        '<rect fill="url(#evg)" width="800" height="500" rx="28"/>' +
        '<text x="400" y="235" text-anchor="middle" fill="#64748b" font-family="system-ui,sans-serif" font-size="30" font-weight="800">차량 이미지</text>' +
        '<text x="400" y="278" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="17">연결이 원활하지 않을 때 표시됩니다</text>' +
      '</svg>'
    );

  document.querySelectorAll('.event-promo-slide img').forEach((img) => {
    img.addEventListener(
      'error',
      function onErr() {
        if (String(img.src || '').indexOf('data:image/svg') === 0) return;
        img.src = EVENT_FALLBACK;
        img.classList.add('is-img-fallback');
      },
      { once: true }
    );
  });
})();

/* ── 맞춤 서비스: 좌우 슬라이드 ── */
(function initServiceSlider() {
  const root = document.getElementById('serviceSlider');
  const track = document.getElementById('serviceSliderTrack');
  const prev = document.getElementById('serviceSliderPrev');
  const next = document.getElementById('serviceSliderNext');
  const dotsRoot = document.getElementById('serviceSliderDots');
  if (!root || !track || !prev || !next || !dotsRoot) return;

  const slides = track.querySelectorAll('.service-slide');
  const n = slides.length;
  if (n === 0) return;

  track.style.setProperty('--service-n', String(n));

  const dots = [];
  for (let d = 0; d < n; d++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'service-slider__dot' + (d === 0 ? ' is-active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', '슬라이드 ' + (d + 1));
    b.setAttribute('aria-selected', d === 0 ? 'true' : 'false');
    b.dataset.index = String(d);
    dotsRoot.appendChild(b);
    dots.push(b);
  }

  let i = 0;

  function go(to) {
    i = (to + n) % n;
    const pct = (100 / n) * i;
    track.style.transform = 'translateX(-' + pct + '%)';
    dots.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx === i);
      btn.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
  }

  prev.addEventListener('click', function () {
    go(i - 1);
  });
  next.addEventListener('click', function () {
    go(i + 1);
  });
  dots.forEach(function (btn) {
    btn.addEventListener('click', function () {
      go(parseInt(btn.dataset.index, 10));
    });
  });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(i + 1);
    }
  });

  let touchStartX = 0;
  root.addEventListener(
    'touchstart',
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    function (e) {
      const x = e.changedTouches[0].screenX;
      const dx = x - touchStartX;
      if (Math.abs(dx) < 45) return;
      if (dx < 0) go(i + 1);
      else go(i - 1);
    },
    { passive: true }
  );
})();

/* ── FORM SUBMIT ── */
function submitForm() {
  if (!document.getElementById('agree').checked) {
    alert('개인정보 수집·이용에 동의해주세요.');
    return;
  }
  alert('✅ 견적 신청이 완료되었습니다!\n담당 상담사가 빠르게 연락드리겠습니다.');
}

