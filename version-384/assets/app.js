(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var copies = qsa('[data-hero-copy]');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function activate(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      copies.forEach(function (copy, i) {
        copy.classList.toggle('is-active', i === index);
      });
    }
    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        schedule();
      });
    });
    schedule();
  }

  function createResult(item) {
    var link = document.createElement('a');
    link.className = 'search-result';
    link.href = item.url;
    link.innerHTML = '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
      '<div><h4>' + escapeHtml(item.title) + '</h4><p>' +
      escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</p><p>' +
      escapeHtml(item.oneLine || '') + '</p></div>';
    return link;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchBox(box) {
    var input = qs('[data-search-input]', box);
    var results = qs('[data-search-results]', box);
    var form = box.closest('form') || box;
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      results.innerHTML = '';
      if (!query) {
        results.classList.remove('is-open');
        return;
      }
      var found = window.SEARCH_MOVIES.filter(function (item) {
        return item.keywords.indexOf(query) !== -1;
      }).slice(0, 9);
      found.forEach(function (item) {
        results.appendChild(createResult(item));
      });
      if (!found.length) {
        var empty = document.createElement('div');
        empty.className = 'search-result';
        empty.innerHTML = '<div></div><div><h4>没有找到匹配影片</h4><p>可以换一个片名、地区、年份或题材继续搜索。</p></div>';
        results.appendChild(empty);
      }
      results.classList.add('is-open');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target)) {
        results.classList.remove('is-open');
      }
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var first = qs('a.search-result', results);
      if (first) {
        window.location.href = first.href;
      } else {
        render();
      }
    });
  }

  function setupSearch() {
    qsa('[data-search-box]').forEach(setupSearchBox);
  }

  window.setupMoviePlayer = function (videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var loaded = false;
    var hlsInstance = null;
    if (!video || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
  });
})();
