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
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".dot"));
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => render(index + 1), 5000);
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const next = Number(dot.getAttribute("data-index"));
        if (!Number.isNaN(next)) {
          render(next);
          restart();
        }
      });
    });

    render(0);
    restart();
  }

  function initProductSliders() {
    document.querySelectorAll(".product-slider").forEach((slider) => {
      const pages = Array.from(slider.querySelectorAll(".product-page"));
      const prev = slider.querySelector('[data-action="prev"]');
      const next = slider.querySelector('[data-action="next"]');
      if (!pages.length || !prev || !next) return;

      let index = 0;

      const render = () => {
        pages.forEach((page, i) => {
          page.classList.toggle("active", i === index);
        });
      };

      prev.addEventListener("click", () => {
        index = (index - 1 + pages.length) % pages.length;
        render();
      });

      next.addEventListener("click", () => {
        index = (index + 1) % pages.length;
        render();
      });

      render();
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

  document.addEventListener("DOMContentLoaded", () => {
    bindLanguageLinks();
    initMobileNav();
    initHeroSlider();
    initProductSliders();
    initSmoothScroll();
  });
})();
