(function () {
    function bySelector(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function setupSearchForms() {
        bySelector('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[type="search"], input[type="text"]');
                var query = input ? input.value.trim() : '';
                var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = bySelector('[data-hero-slide]', hero);
        var dots = bySelector('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function setupCatalogFilter() {
        var panel = document.querySelector('[data-filter-panel]');
        var cards = bySelector('[data-movie-card]');
        if (!panel || !cards.length) {
            return;
        }
        var input = panel.querySelector('[data-filter-keyword]');
        var region = panel.querySelector('[data-filter-region]');
        var kind = panel.querySelector('[data-filter-kind]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function filter() {
            var keyword = normalize(input ? input.value : '');
            var regionValue = normalize(region ? region.value : '');
            var kindValue = normalize(kind ? kind.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardKind = normalize(card.getAttribute('data-kind'));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !regionValue || cardRegion === regionValue;
                var matchKind = !kindValue || cardKind === kindValue;
                var show = matchKeyword && matchRegion && matchKind;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            var empty = document.querySelector('[data-no-results]');
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, kind].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filter);
                element.addEventListener('change', filter);
            }
        });
        filter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupCatalogFilter();
    });
})();
