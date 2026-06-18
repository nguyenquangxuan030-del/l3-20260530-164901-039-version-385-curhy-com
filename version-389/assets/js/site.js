(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dots button', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    show(0);
    start();
  }

  function initHeroSearch() {
    var form = document.querySelector('[data-hero-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      var target = form.getAttribute('data-target') || 'search.html';
      if (keyword) {
        window.location.href = target + '?q=' + encodeURIComponent(keyword);
      } else {
        window.location.href = target;
      }
    });
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = selectAll('[data-filter-card]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    if (queryValue && input) {
      input.value = queryValue;
    }

    function matchCard(card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var okQuery = !q || text.indexOf(q) !== -1 || title.indexOf(q) !== -1;
      var okYear = !y || card.getAttribute('data-year') === y;
      var okType = !t || text.indexOf(t.toLowerCase()) !== -1;
      return okQuery && okYear && okType;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var pass = matchCard(card);
        card.style.display = pass ? '' : 'none';
        if (pass) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
    apply();
  }

  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function attachVideo(video) {
    if (video.dataset.bound === '1') {
      return Promise.resolve();
    }
    video.dataset.bound = '1';
    var src = video.getAttribute('data-stream');
    if (!src) {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }
    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = src;
      }
    });
  }

  function initPlayers() {
    selectAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.movie-player');
      var button = shell.querySelector('.player-start');
      if (!video) {
        return;
      }

      function play() {
        attachVideo(video).then(function () {
          var result = video.play();
          if (result && typeof result.then === 'function') {
            result.catch(function () {});
          }
          shell.classList.add('is-playing');
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });
      attachVideo(video);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initHeroSearch();
    initFilters();
    initPlayers();
  });
})();
