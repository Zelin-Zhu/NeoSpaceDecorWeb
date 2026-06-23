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

      const render = () => {
        pages.forEach((page, i) => {
          page.classList.toggle("active", i === index);
        });
      };

      const handlePrevious = () => {
        index = (index - 1 + pages.length) % pages.length;
        render();
      };

      const handleNext = () => {
        index = (index + 1) % pages.length;
        render();
      };

      prev.addEventListener("click", handlePrevious);
      next.addEventListener("click", handleNext);

      render();

      slider._cleanupProductSlider = () => {
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
