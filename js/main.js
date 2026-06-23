(function () {
  const storageKey = "neospace-preferred-lang";
  const cookieMaxAgeSeconds = 60 * 60 * 24 * 365;

  function setPreferredLanguage(language) {
    try {
      localStorage.setItem(storageKey, language);
    } catch (error) {
      // Ignore storage errors (private mode, blocked storage).
    }
    document.cookie = `${storageKey}=${encodeURIComponent(language)}; Path=/; Max-Age=${cookieMaxAgeSeconds}; SameSite=Lax`;
  }

  function bindLanguageLinks() {
    document.querySelectorAll(".lang-link").forEach((link) => {
      link.addEventListener("click", () => {
        const lang = link.getAttribute("data-lang");
        if (lang) setPreferredLanguage(lang);
      });
    });
  }

  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initHeroSlider() {
    const slider = document.querySelector(".slider-shell");
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".dot"));
    if (!slider || !slides.length) return;

    slider._cleanupHeroSlider?.();

    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      const previous = (index - 1 + slides.length) % slides.length;
      const next = (index + 1) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        slide.classList.toggle("is-prev", i === previous);
        slide.classList.toggle("is-next", i === next);
        slide.setAttribute("aria-hidden", String(i !== index));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        if (i === index) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => render(index + 1), 5000);
    }

    const dotHandlers = dots.map((dot) => {
      const handleClick = () => {
        const next = Number(dot.getAttribute("data-index"));
        if (!Number.isNaN(next)) {
          render(next);
          restart();
        }
      };
      dot.addEventListener("click", handleClick);
      return { dot, handleClick };
    });

    render(0);
    restart();

    slider._cleanupHeroSlider = () => {
      if (timer) clearInterval(timer);
      dotHandlers.forEach(({ dot, handleClick }) => dot.removeEventListener("click", handleClick));
    };
  }

  function initProductSliders() {
    document.querySelectorAll(".product-slider").forEach((slider) => {
      const pages = Array.from(slider.querySelectorAll(".product-page"));
      const prev = slider.querySelector('[data-action="prev"]');
      const next = slider.querySelector('[data-action="next"]');
      if (!pages.length || !prev || !next) return;

      slider._cleanupProductSlider?.();

      let index = 0;
      let cleanupTimer = null;

      const resetPageClasses = (page) => {
        page.classList.remove(
          "active",
          "is-entering-from-left",
          "is-entering-from-right",
          "is-leaving-to-left",
          "is-leaving-to-right",
          "is-next-preview"
        );
      };

      const showNextPreview = () => {
        if (pages.length < 2) return;
        const previewIndex = (index + 1) % pages.length;
        pages[previewIndex].classList.add("is-next-preview");
      };

      const render = (nextIndex, direction = 0) => {
        const previousIndex = index;
        index = (nextIndex + pages.length) % pages.length;
        if (cleanupTimer) window.clearTimeout(cleanupTimer);

        if (previousIndex === index || direction === 0) {
          pages.forEach(resetPageClasses);
          pages[index].classList.add("active");
          showNextPreview();
          return;
        }

        const previous = pages[previousIndex];
        const next = pages[index];
        pages.forEach((page) => {
          if (page !== previous && page !== next) resetPageClasses(page);
        });
        resetPageClasses(previous);
        resetPageClasses(next);
        previous.classList.add(direction > 0 ? "is-leaving-to-left" : "is-leaving-to-right");
        next.classList.add(direction > 0 ? "is-entering-from-right" : "is-entering-from-left");

        window.requestAnimationFrame(() => {
          next.classList.remove("is-entering-from-left", "is-entering-from-right");
          next.classList.add("active");
        });

        cleanupTimer = window.setTimeout(() => {
          resetPageClasses(previous);
          showNextPreview();
        }, 520);
      };

      const handlePrevious = () => {
        render(index - 1, -1);
      };

      const handleNext = () => {
        render(index + 1, 1);
      };

      prev.addEventListener("click", handlePrevious);
      next.addEventListener("click", handleNext);

      render(0);

      slider._cleanupProductSlider = () => {
        if (cleanupTimer) window.clearTimeout(cleanupTimer);
        prev.removeEventListener("click", handlePrevious);
        next.removeEventListener("click", handleNext);
      };
    });
  }

  function initSmoothScroll() {
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  }

  window.NeoSpace = {
    refreshContentComponents() {
      initHeroSlider();
      initProductSliders();
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindLanguageLinks();
    initMobileNav();
    initHeroSlider();
    initProductSliders();
    initSmoothScroll();
  });
})();
