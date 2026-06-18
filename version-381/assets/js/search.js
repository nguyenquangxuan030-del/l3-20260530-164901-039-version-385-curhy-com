(function () {
  const data = Array.isArray(window.SEARCH_DATA) ? window.SEARCH_DATA : [];
  const form = document.querySelector('[data-global-search]');
  const input = form ? form.querySelector('input[name="q"]') : null;
  const summary = document.querySelector('[data-search-summary]');
  const results = document.querySelector('[data-search-results]');

  function card(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card compact">',
      '  <a class="poster-link" href="movie/' + movie.id + '.html" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="rating-pill">' + escapeHtml(movie.rating) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.line) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function runSearch(keyword) {
    const term = String(keyword || '').trim().toLowerCase();

    if (!term) {
      if (summary) {
        summary.textContent = '请输入关键词开始搜索。';
      }
      if (results) {
        results.innerHTML = '';
      }
      return;
    }

    const matched = data.filter(function (movie) {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.line
      ].join(' ').toLowerCase();
      return haystack.indexOf(term) !== -1;
    }).slice(0, 120);

    if (summary) {
      summary.textContent = matched.length ? '为你找到 ' + matched.length + ' 条相关内容。' : '未找到相关内容。';
    }

    if (results) {
      results.innerHTML = matched.map(card).join('');
    }
  }

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';

  if (input) {
    input.value = initial;
  }

  runSearch(initial);

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const keyword = input.value.trim();
      const url = keyword ? 'search.html?q=' + encodeURIComponent(keyword) : 'search.html';
      window.history.replaceState({}, '', url);
      runSearch(keyword);
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }
})();
