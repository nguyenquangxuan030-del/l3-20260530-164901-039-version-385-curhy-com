(function () {
  var form = document.querySelector('[data-search-page-form]');
  var title = document.querySelector('[data-search-title]');
  var results = document.getElementById('searchResults');
  var empty = document.getElementById('searchEmpty');

  if (!form || !results || !Array.isArray(window.MOVIE_INDEX || MOVIE_INDEX)) {
    return;
  }

  var input = form.querySelector('input[name="q"]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

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

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 5).map(function (tag) {
      return '<a href="./search.html?q=' + encodeURIComponent(tag) + '" class="tag">' + escapeHtml(tag) + '</a>';
    }).join('');

    return [
      '<article class="movie-card poster">',
      '<a href="' + escapeHtml(movie.url) + '" class="movie-cover" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="movie-info">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.duration) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function render(query) {
    var value = String(query || '').trim().toLowerCase();
    var data = window.MOVIE_INDEX || MOVIE_INDEX;
    var matched = value ? data.filter(function (movie) {
      return [
        movie.title,
        movie.category,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase().indexOf(value) !== -1;
    }) : data.slice(0, 12);

    results.innerHTML = matched.slice(0, 120).map(card).join('');
    if (title) {
      title.textContent = value ? '搜索结果：' + query : '推荐影片';
    }
    if (empty) {
      empty.classList.toggle('is-visible', matched.length === 0);
    }
  }

  if (input) {
    input.value = initial;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input ? input.value.trim() : '';
    var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
    window.history.replaceState(null, '', nextUrl);
    render(value);
  });

  render(initial);
})();
