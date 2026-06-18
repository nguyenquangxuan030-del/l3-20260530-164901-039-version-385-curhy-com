(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const menuPanel = document.querySelector('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function () {
      menuPanel.classList.toggle('is-open');
    });
  }

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const list = document.querySelector('[data-list]');
  const searchInput = document.querySelector('[data-list-search]');
  const sortSelect = document.querySelector('[data-list-sort]');

  if (list && (searchInput || sortSelect)) {
    const originalCards = Array.from(list.querySelectorAll('[data-card]'));

    function applyListTools() {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const sortMode = sortSelect ? sortSelect.value : 'default';
      let cards = originalCards.filter(function (card) {
        const content = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' ').toLowerCase();
        return !keyword || content.indexOf(keyword) !== -1;
      });

      if (sortMode === 'rating') {
        cards = cards.slice().sort(function (a, b) {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        });
      }

      if (sortMode === 'year') {
        cards = cards.slice().sort(function (a, b) {
          return Number((b.dataset.year || '').replace(/\D/g, '') || 0) - Number((a.dataset.year || '').replace(/\D/g, '') || 0);
        });
      }

      if (sortMode === 'title') {
        cards = cards.slice().sort(function (a, b) {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
        });
      }

      list.innerHTML = '';
      cards.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyListTools);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applyListTools);
    }
  }
})();
