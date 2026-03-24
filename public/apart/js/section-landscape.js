(function () {
  var el = document.querySelector(".landscape-swiper");
  if (!el || typeof Swiper === "undefined") return;

  var swiper = null;
  var mq = window.matchMedia("(max-width: 991px)");

  function mount() {
    if (!mq.matches || swiper) return;
    swiper = new Swiper(".landscape-swiper", {
      loop: true,
      speed: 450,
      spaceBetween: 18,
      slidesPerView: 1,
      centeredSlides: true,
      pagination: {
        el: ".landscape-swiper .swiper-pagination",
        clickable: true,
      },
    });
  }

  function unmount() {
    if (!swiper) return;
    swiper.destroy(true, true);
    swiper = null;
  }

  function sync() {
    if (mq.matches) mount();
    else unmount();
  }

  sync();
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", sync);
  } else {
    mq.addListener(sync);
  }
})();
