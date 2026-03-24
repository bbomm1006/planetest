(function () {

  var root = document.querySelector(".main-section-premium");

  var el = root && root.querySelector(".premium-swiper");

  if (!el || typeof Swiper === "undefined") return;



  var prev = root.querySelector(".premium-nav-prev");

  var next = root.querySelector(".premium-nav-next");



  new Swiper(el, {

    /* <992: 한 장만 보이게 (centeredSlides+spaceBetween 시 옆 슬라이드 노출 방지) */
    slidesPerView: 1,

    spaceBetween: 0,

    speed: 450,

    centeredSlides: false,

    autoHeight: false,

    watchSlidesProgress: true,

    watchOverflow: true,

    slidesOffsetBefore: 0,

    slidesOffsetAfter: 0,

    navigation:

      prev && next

        ? {

            prevEl: prev,

            nextEl: next,

          }

        : undefined,

    breakpoints: {

      992: {

        slidesPerView: 5,

        spaceBetween: 17,

        centeredSlides: false,

      },

    },

  });

})();

