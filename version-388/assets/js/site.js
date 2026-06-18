(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = queryAll('.hero-slide');
    var thumbs = queryAll('.hero-thumb');
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    var hero = document.querySelector('.hero-section');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(current);
    start();
  }

  function setupCatalogSearch() {
    var inputs = queryAll('.catalog-search');
    inputs.forEach(function (input) {
      var section = input.closest('.section-block') || document;
      var items = queryAll('.movie-card, .ranking-item', section);
      var empty = section.querySelector('.empty-state');

      function filter() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var text = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '') + ' ' + item.textContent).toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      input.addEventListener('input', filter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && !input.value) {
        input.value = q;
      }
      filter();
    });
  }

  function setupPlayer() {
    queryAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var initialized = false;
      var hls = null;
      var hlsSource = video.getAttribute('data-hls-source');
      var mp4Source = video.getAttribute('data-mp4-source');

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function useMp4() {
        if (mp4Source && video.getAttribute('src') !== mp4Source) {
          video.setAttribute('src', mp4Source);
          video.load();
        }
      }

      function initThenPlay() {
        button.classList.add('is-hidden');
        if (!initialized) {
          initialized = true;
          if (hlsSource && window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(hlsSource);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (hls) {
                  hls.destroy();
                  hls = null;
                }
                useMp4();
                playVideo();
              }
            });
            window.setTimeout(function () {
              if (video.readyState === 0) {
                useMp4();
              }
            }, 2400);
          } else if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.setAttribute('src', hlsSource);
            video.load();
            playVideo();
          } else {
            useMp4();
            playVideo();
          }
        } else if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      button.addEventListener('click', initThenPlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          initThenPlay();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime < 0.2 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });

    queryAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = document.querySelector('[data-player]');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var button = player.querySelector('[data-play-button]');
          if (button) {
            window.setTimeout(function () {
              button.click();
            }, 320);
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupCatalogSearch();
    setupPlayer();
  });
})();
