document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const slider = document.querySelector(".hero-slider");

    if (slider) {
        const slides = Array.from(slider.querySelectorAll(".hero-slide"));
        const dots = Array.from(slider.querySelectorAll(".hero-dots button"));
        const miniItems = Array.from(slider.querySelectorAll(".hero-mini"));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
            miniItems.forEach(function (item, itemIndex) {
                item.classList.toggle("is-active", itemIndex === current);
            });
        }

        function startSlider() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function restartSlider() {
            window.clearInterval(timer);
            startSlider();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.slide || 0));
                restartSlider();
            });
        });

        miniItems.forEach(function (item) {
            item.addEventListener("mouseenter", function () {
                showSlide(Number(item.dataset.slide || 0));
                restartSlider();
            });
        });

        showSlide(0);
        startSlider();
    }

    const libraries = Array.from(document.querySelectorAll("[data-library]"));

    libraries.forEach(function (library) {
        const input = library.querySelector("[data-filter-input]");
        const region = library.querySelector("[data-filter-region]");
        const type = library.querySelector("[data-filter-type]");
        const cards = Array.from(library.querySelectorAll(".movie-card"));
        const empty = library.querySelector(".empty-state");
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalized(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            const queryValue = normalized(input ? input.value : "");
            const regionValue = normalized(region ? region.value : "");
            const typeValue = normalized(type ? type.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalized([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                const matchesQuery = !queryValue || haystack.includes(queryValue);
                const matchesRegion = !regionValue || normalized(card.dataset.region).includes(regionValue);
                const matchesType = !typeValue || normalized(card.dataset.type).includes(typeValue);
                const show = matchesQuery && matchesRegion && matchesType;

                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [input, region, type].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilter);
                element.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });

    const backTop = document.querySelector(".back-top");

    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("show", window.scrollY > 480);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
