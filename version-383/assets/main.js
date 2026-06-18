(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initializeMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initializeSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initializeHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function initializeFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
          card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchRegion));
        });
      }

      [input, year, region].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initializeSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = root.querySelector("[data-search-input]");
    var results = root.querySelector("[data-search-results]");
    var empty = root.querySelector("[data-search-empty]");
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }

    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags,
        item.oneLine
      ].join(" ").toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 96);

    if (!matched.length) {
      if (empty) {
        empty.innerHTML = "<h2>没有找到匹配影片</h2><p>可以换一个片名、地区、年份或题材继续搜索。</p>";
      }
      return;
    }

    if (empty) {
      empty.style.display = "none";
    }
    results.innerHTML = matched.map(function (item) {
      return "<article class=\"movie-card\">" +
        "<a class=\"card-cover\" href=\"./" + escapeHtml(item.href) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"play-badge\">▶</span>" +
        "</a>" +
        "<div class=\"card-body\">" +
        "<h2><a href=\"./" + escapeHtml(item.href) + "\">" + escapeHtml(item.title) + "</a></h2>" +
        "<p>" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"meta-row\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
        "</div>" +
        "</article>";
    }).join("");
  }

  ready(function () {
    initializeMenu();
    initializeSearchForms();
    initializeHeroSlider();
    initializeFilters();
    initializeSearchPage();
  });
})();
