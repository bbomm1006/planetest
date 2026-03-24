(function () {
  var section = document.querySelector(".main-section-unit");
  if (!section || typeof Swiper === "undefined") return;

  var swiperEl = section.querySelector(".unit-plan-swiper");
  var tabs = section.querySelectorAll(".unit-tab");
  var prev = section.querySelector(".unit-arrow-prev");
  var next = section.querySelector(".unit-arrow-next");
  var sizeEl = section.querySelector("[data-unit-size]");
  var nameEl = section.querySelector("[data-unit-name]");
  var infoEl = section.querySelector("[data-unit-info]");

  var meta = [
    {
      size: "84",
      name: "A",
      info:
        '<span>전용면적 : <b>84.00㎡</b></span><span class="unit-info-div">|</span><span>공급면적 : <b>—</b></span><span class="unit-info-div">|</span><span>세대수 : <b>—</b></span>',
    },
    {
      size: "84",
      name: "B",
      info:
        '<span>전용면적 : <b>84.00㎡</b></span><span class="unit-info-div">|</span><span>공급면적 : <b>—</b></span><span class="unit-info-div">|</span><span>세대수 : <b>—</b></span>',
    },
    {
      size: "99",
      name: "A",
      info:
        '<span>전용면적 : <b>99.00㎡</b></span><span class="unit-info-div">|</span><span>공급면적 : <b>—</b></span><span class="unit-info-div">|</span><span>세대수 : <b>—</b></span>',
    },
    {
      size: "112",
      name: "",
      info:
        '<span>전용면적 : <b>112.00㎡</b></span><span class="unit-info-div">|</span><span>공급면적 : <b>—</b></span><span class="unit-info-div">|</span><span>세대수 : <b>—</b></span>',
    },
    {
      size: "135",
      name: "PH-2",
      info:
        '<span>전용면적 : <b>135.6960㎡</b></span><span class="unit-info-div">|</span><span>공급면적 : <b>182.9421㎡</b></span><span class="unit-info-div">|</span><span>계약면적 : <b>267.8867㎡</b></span><span class="unit-info-div">|</span><span>세대수 : <b>1세대</b></span>',
    },
  ];

  function applyMeta(i) {
    var m = meta[i];
    if (!m || !sizeEl || !nameEl || !infoEl) return;
    sizeEl.textContent = m.size;
    nameEl.textContent = m.name;
    infoEl.innerHTML = m.info;
  }

  function setTabOn(index) {
    tabs.forEach(function (t, j) {
      t.classList.toggle("on", j === index);
      t.setAttribute("aria-selected", j === index ? "true" : "false");
    });
  }

  var pagEl = section.querySelector(".unit-plan-pagination");

  var swiperOpts = {
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: false,
    watchOverflow: true,
    speed: 450,
    navigation: { prevEl: prev, nextEl: next },
    on: {
      slideChange: function () {
        var i = this.activeIndex;
        setTabOn(i);
        applyMeta(i);
      },
    },
  };
  if (pagEl) {
    swiperOpts.pagination = { el: pagEl, clickable: true };
  }

  var mqMo = window.matchMedia("(max-width: 991px)");
  if (mqMo.matches) {
    swiperOpts.autoHeight = true;
  }

  var swiper = new Swiper(swiperEl, swiperOpts);

  function syncMoHeight() {
    if (mqMo.matches) {
      swiper.params.autoHeight = true;
    } else {
      swiper.params.autoHeight = false;
    }
    swiper.update();
  }
  if (typeof mqMo.addEventListener === "function") {
    mqMo.addEventListener("change", syncMoHeight);
  } else {
    mqMo.addListener(syncMoHeight);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      swiper.slideTo(i);
    });
  });

  applyMeta(swiper.activeIndex || 0);
  setTabOn(swiper.activeIndex || 0);
})();
