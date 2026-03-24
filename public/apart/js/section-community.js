(function () {
  var root = document.querySelector("[data-community-root]");
  if (!root) return;

  var tabs = root.querySelectorAll("[data-community-tab]");
  var panels = root.querySelectorAll("[data-community-panel]");

  function activate(id) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-community-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-community-panel") === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab.getAttribute("data-community-tab"));
    });
  });

  var initial = root.querySelector(".community-tab.is-active");
  if (initial) activate(initial.getAttribute("data-community-tab"));

  root.querySelectorAll("[data-community-deco] img").forEach(function (img) {
    img.addEventListener(
      "error",
      function () {
        var wrap = img.closest("[data-community-deco]");
        if (wrap) wrap.classList.add("is-empty");
      },
      { once: true }
    );
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));
  });
})();
