(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        links.classList.remove("open");
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      if (window.scrollY > 360) {
        button.classList.add("show");
      } else {
        button.classList.remove("show");
      }
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setupHero() {
    var frame = document.querySelector("[data-hero]");
    if (!frame) {
      return;
    }
    var slides = Array.prototype.slice.call(frame.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(frame.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    frame.addEventListener("mouseenter", stop);
    frame.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function matchItem(item, state) {
    var text = item.getAttribute("data-search-text") || "";
    var type = item.getAttribute("data-type") || "";
    var region = item.getAttribute("data-region") || "";
    var year = item.getAttribute("data-year") || "";
    if (state.query && text.indexOf(state.query) === -1) {
      return false;
    }
    if (state.type && type !== state.type) {
      return false;
    }
    if (state.region && region !== state.region) {
      return false;
    }
    if (state.year && year !== state.year) {
      return false;
    }
    return true;
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = scope.querySelector("[data-search-input]");
      var typeSelect = scope.querySelector("[data-type-select]");
      var regionSelect = scope.querySelector("[data-region-select]");
      var yearSelect = scope.querySelector("[data-year-select]");
      var empty = scope.querySelector("[data-empty-state]");
      var items = Array.prototype.slice.call(root.querySelectorAll(".js-filter-item"));
      function apply() {
        var state = {
          query: input ? input.value.trim().toLowerCase() : "",
          type: typeSelect ? typeSelect.value : "",
          region: regionSelect ? regionSelect.value : "",
          year: yearSelect ? yearSelect.value : ""
        };
        var visible = 0;
        items.forEach(function (item) {
          var matched = matchItem(item, state);
          item.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupBackTop();
    setupHero();
    setupFilters();
  });
})();
