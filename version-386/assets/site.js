(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === activeIndex);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === activeIndex);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }

      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var searchPageInput = document.querySelector("[data-search-page-input]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (searchPageInput) {
      searchPageInput.value = q;
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var grid = document.querySelector("[data-filter-grid]");

    function runFilter(value) {
      if (!grid) {
        return;
      }

      var keyword = (value || "").trim().toLowerCase();
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !matched);
      });
    }

    if (filterInput) {
      if (q) {
        filterInput.value = q;
        runFilter(q);
      }

      filterInput.addEventListener("input", function () {
        runFilter(filterInput.value);
      });
    }
  });
})();

function setupMoviePlayer(videoId, coverId, triggerId, streamUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var trigger = document.getElementById(triggerId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !cover || !trigger || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    loadStream();
    cover.classList.add("hidden");
    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {
        cover.classList.remove("hidden");
      });
    }
  }

  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    playVideo();
  });

  cover.addEventListener("click", function () {
    playVideo();
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
