(function () {
  const locale = document.body.dataset.locale || "en";
  const labels = {
    en: { previous: "Previous product images", next: "Next product images", slide: "Slide" },
    cn: { previous: "上一组产品图片", next: "下一组产品图片", slide: "第" },
    id: { previous: "Gambar produk sebelumnya", next: "Gambar produk berikutnya", slide: "Slide" },
  };

  function text(element, value) {
    if (element && typeof value === "string") element.textContent = value;
  }

  function image(url, alt, loading) {
    const element = document.createElement("img");
    element.src = url;
    element.alt = alt || "";
    element.loading = loading;
    element.width = 1280;
    element.height = 720;
    return element;
  }

  function createButton(className, label, attributes = {}) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.setAttribute("aria-label", label);
    Object.entries(attributes).forEach(([key, value]) => button.setAttribute(key, String(value)));
    return button;
  }

  function hydrateHero(content) {
    if (!content.hero || !content.slides?.length) return;

    text(document.querySelector(".hero-copy .kicker"), content.hero.kicker);
    text(document.querySelector(".hero-copy h1"), content.hero.title);
    text(document.querySelector(".hero-copy p:not(.kicker)"), content.hero.description);
    text(document.querySelector(".hero-copy .cta"), content.hero.ctaLabel);

    const sliderBox = document.querySelector(".slider-box");
    const dots = document.querySelector(".slider-dots");
    if (!sliderBox || !dots) return;

    sliderBox.replaceChildren(
      ...content.slides.map((slide, index) => {
        const card = document.createElement("div");
        card.className = index === 0 ? "hero-slide active" : "hero-slide";
        card.append(image(slide.url, slide.alt, index === 0 ? "eager" : "lazy"));
        return card;
      })
    );
    dots.replaceChildren(
      ...content.slides.map((slide, index) => {
        const label = locale === "cn" ? `${labels.cn.slide}${index + 1}张` : `${labels[locale].slide} ${index + 1}`;
        const dot = createButton(index === 0 ? "dot active" : "dot", label, { "data-index": index });
        if (index === 0) dot.setAttribute("aria-current", "true");
        return dot;
      })
    );
  }

  function createProductSlider(series) {
    const copy = labels[locale] || labels.en;
    const slider = document.createElement("div");
    slider.className = "product-slider";

    const previous = createButton("slider-btn", copy.previous, { "data-action": "prev" });
    previous.textContent = "\u2039";

    const track = document.createElement("div");
    track.className = "product-track";
    for (let index = 0; index < series.images.length; index += 3) {
      const page = document.createElement("div");
      page.className = index === 0 ? "product-page active" : "product-page";
      series.images.slice(index, index + 3).forEach((item) => page.append(image(item.url, item.alt, "lazy")));
      track.append(page);
    }

    const next = createButton("slider-btn", copy.next, { "data-action": "next" });
    next.textContent = "\u203a";
    slider.append(previous, track, next);
    return slider;
  }

  function hydrateProducts(content) {
    if (!content.productSeries?.length) return;

    const section = document.getElementById("products");
    const container = section?.querySelector(".container");
    if (!container) return;

    text(container.querySelector(".section-title"), content.sections?.products?.title);
    text(container.querySelector(".section-sub"), content.sections?.products?.subtitle);
    container.querySelectorAll(".category").forEach((category) => category.remove());

    content.productSeries.forEach((series) => {
      const category = document.createElement("article");
      category.className = "category";
      const title = document.createElement("h3");
      title.textContent = series.title;
      category.append(title, createProductSlider(series));
      container.append(category);
    });
  }

  function hydrateAbout(content) {
    if (!content.aboutBlocks?.length) return;

    const section = document.getElementById("about");
    const container = section?.querySelector(".container");
    if (!container) return;

    text(container.querySelector(".section-title"), content.sections?.about?.title);
    const story = document.createElement("div");
    story.className = "about-story";

    content.aboutBlocks.forEach((block) => {
      const article = document.createElement("article");
      article.className = block.imagePosition === "left" ? "about-block reverse" : "about-block";
      const copy = document.createElement("div");
      copy.className = "about-copy";
      const eyebrow = document.createElement("p");
      eyebrow.className = "about-index";
      eyebrow.textContent = block.eyebrow;
      const title = document.createElement("h3");
      title.textContent = block.title;
      const body = document.createElement("p");
      body.textContent = block.body;
      const tags = document.createElement("div");
      tags.className = "about-tags";
      block.tags.forEach((tag) => {
        const item = document.createElement("span");
        item.textContent = tag;
        tags.append(item);
      });
      copy.append(eyebrow, title, body, tags);

      const media = document.createElement("figure");
      media.className = "about-media";
      media.append(image(block.image.url, block.image.alt, "lazy"));
      article.append(copy, media);
      story.append(article);
    });

    container.querySelector(".about-story")?.replaceWith(story);
  }

  async function loadContent() {
    try {
      const response = await fetch(`/api/public/home?locale=${encodeURIComponent(locale)}`);
      if (!response.ok) return;
      const content = await response.json();
      hydrateHero(content);
      hydrateProducts(content);
      hydrateAbout(content);
      window.NeoSpace?.refreshContentComponents();
    } catch {
      // Static markup remains available for local file previews and API outages.
    }
  }

  document.addEventListener("DOMContentLoaded", loadContent);
})();
