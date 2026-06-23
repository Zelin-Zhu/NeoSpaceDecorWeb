(function () {
  const localeSelect = document.getElementById("locale-select");
  const form = document.getElementById("content-form");
  const stateLabel = document.getElementById("publish-state");
  const saveButton = document.getElementById("save-button");
  const siteLink = document.getElementById("view-site");
  const toastRegion = document.getElementById("toast-region");
  const containers = {
    hero: document.getElementById("hero-fields"),
    slides: document.getElementById("slides-list"),
    series: document.getElementById("series-list"),
    about: document.getElementById("about-list"),
  };

  let locale = "en";
  let content = null;
  let pendingUploads = 0;
  let dirty = false;

  function createElement(tag, options = {}, children = []) {
    const element = document.createElement(tag);
    if (options.className) element.className = options.className;
    if (options.text !== undefined) element.textContent = options.text;
    if (options.type) element.type = options.type;
    if (options.href) element.href = options.href;
    if (options.target) element.target = options.target;
    if (options.value !== undefined) element.value = options.value;
    if (options.placeholder) element.placeholder = options.placeholder;
    if (options.accept) element.accept = options.accept;
    if (options.disabled) element.disabled = true;
    if (options.ariaLabel) element.setAttribute("aria-label", options.ariaLabel);
    children.filter(Boolean).forEach((child) => element.append(child));
    return element;
  }

  function setStatus(message, kind = "") {
    stateLabel.textContent = message;
    stateLabel.className = `publish-state ${kind}`.trim();
  }

  function showToast(message, kind = "") {
    const toast = createElement("div", { className: `toast ${kind}`.trim(), text: message });
    toastRegion.append(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, 4200);
  }

  function setDirty() {
    dirty = true;
    if (!pendingUploads) setStatus("有未发布的修改。", "");
  }

  function newId(prefix) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  function moveItem(items, index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
    setDirty();
    render();
  }

  function removeItem(items, index, label) {
    if (!window.confirm(`确定删除${label}吗？`)) return;
    items.splice(index, 1);
    setDirty();
    render();
  }

  function controlButton(text, title, onClick, className = "icon-button") {
    const button = createElement("button", { className, type: "button", text, ariaLabel: title });
    button.title = title;
    button.addEventListener("click", onClick);
    return button;
  }

  function sortControls(items, index, label) {
    return createElement("div", { className: "card-actions" }, [
      controlButton("\u2191", "上移", () => moveItem(items, index, -1)),
      controlButton("\u2193", "下移", () => moveItem(items, index, 1)),
      controlButton("删除", `删除${label}`, () => removeItem(items, index, label), "button button-danger"),
    ]);
  }

  function field(labelText, value, onInput, options = {}) {
    const control = createElement(options.multiline ? "textarea" : "input", {
      value: value || "",
      placeholder: options.placeholder,
    });
    if (!options.multiline) control.type = "text";
    control.addEventListener("input", () => {
      onInput(control.value);
      setDirty();
    });
    const label = createElement("label", { text: labelText });
    const wrapper = createElement("div", { className: `field${options.full ? " full" : ""}` }, [label, control]);
    return wrapper;
  }

  function selectField(labelText, value, choices, onChange) {
    const control = document.createElement("select");
    choices.forEach((choice) => {
      const option = createElement("option", { value: choice.value, text: choice.label });
      option.selected = choice.value === value;
      control.append(option);
    });
    control.addEventListener("change", () => {
      onChange(control.value);
      setDirty();
    });
    return createElement("div", { className: "field" }, [createElement("label", { text: labelText }), control]);
  }

  async function uploadImage(file, assign) {
    if (!file) return;
    pendingUploads += 1;
    saveButton.disabled = true;
    setStatus(`正在上传 ${file.name}...`);
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "图片上传失败。");
      assign(result);
      setDirty();
      render();
      showToast("图片上传成功，发布后将在前台显示。", "success");
    } catch (error) {
      setStatus(error.message || "图片上传失败。", "error");
      showToast(error.message || "图片上传失败。", "error");
    } finally {
      pendingUploads -= 1;
      saveButton.disabled = pendingUploads > 0;
      if (!pendingUploads && dirty) setStatus("有未发布的修改。");
    }
  }

  function mediaField(item, altValue, setAlt, setMedia, label) {
    const preview = createElement("div", { className: "media-preview" });
    if (item.url) {
      const image = createElement("img");
      image.src = item.url;
      image.alt = altValue || "";
      preview.append(image);
    } else {
      preview.textContent = "上传图片后显示预览";
    }

    const fileInput = createElement("input", { type: "file", accept: "image/jpeg,image/png,image/webp" });
    fileInput.addEventListener("change", () => uploadImage(fileInput.files?.[0], setMedia));
    const upload = createElement("div", { className: "upload-control" }, [
      createElement("strong", { text: label }),
      fileInput,
      field("图片替代文本", altValue, setAlt),
    ]);
    return createElement("div", { className: "media-field" }, [preview, upload]);
  }

  function renderHero() {
    const hero = content.hero;
    const grid = createElement("div", { className: "field-grid" }, [
      field("顶部短句", hero.kicker, (value) => { hero.kicker = value; }),
      field("按钮文字", hero.ctaLabel, (value) => { hero.ctaLabel = value; }),
      field("主标题", hero.title, (value) => { hero.title = value; }, { full: true }),
      field("简介", hero.description, (value) => { hero.description = value; }, { full: true, multiline: true }),
    ]);
    containers.hero.replaceChildren(grid);
  }

  function renderSlides() {
    containers.slides.replaceChildren();
    content.slides.forEach((slide, index) => {
      const card = createElement("article", { className: "content-card" });
      card.append(
        createElement("header", { className: "card-header" }, [
          createElement("span", { className: "card-label", text: `轮播图 ${index + 1}` }),
          sortControls(content.slides, index, "该轮播图"),
        ]),
        mediaField(
          slide,
          slide.alt,
          (value) => { slide.alt = value; },
          (media) => { slide.mediaId = media.id; slide.url = media.url; },
          "轮播图片"
        )
      );
      containers.slides.append(card);
    });
  }

  function renderSeries() {
    containers.series.replaceChildren();
    const sectionCopy = createElement("article", { className: "content-card" }, [
      createElement("div", { className: "field-grid" }, [
        field("产品区标题", content.sections.products.title, (value) => { content.sections.products.title = value; }),
        field("产品区简介", content.sections.products.subtitle || "", (value) => { content.sections.products.subtitle = value; }),
      ]),
    ]);
    containers.series.append(sectionCopy);

    content.productSeries.forEach((series, seriesIndex) => {
      const card = createElement("article", { className: "content-card" });
      const fields = createElement("div", { className: "field-grid" }, [
        field("系列名称", series.title, (value) => { series.title = value; }),
        field("系列说明", series.description || "", (value) => { series.description = value; }),
      ]);
      const images = createElement("div", { className: "image-list" });
      series.images.forEach((item, imageIndex) => {
        const imageCard = createElement("div", { className: "image-item" });
        imageCard.append(
          createElement("div", { className: "card-header" }, [
            createElement("span", { className: "card-label", text: `图片 ${imageIndex + 1}` }),
            sortControls(series.images, imageIndex, "该图片"),
          ]),
          mediaField(
            item,
            item.alt,
            (value) => { item.alt = value; },
            (media) => { item.mediaId = media.id; item.url = media.url; },
            "商品图片"
          )
        );
        images.append(imageCard);
      });
      const addImage = controlButton("添加图片", "添加商品图片", () => {
        series.images.push({ id: newId("series-image"), mediaId: "", url: "", alt: "" });
        setDirty();
        render();
      }, "button button-secondary");
      card.append(
        createElement("header", { className: "card-header" }, [
          createElement("span", { className: "card-label", text: `系列 ${seriesIndex + 1}` }),
          sortControls(content.productSeries, seriesIndex, "该商品系列"),
        ]),
        fields,
        images,
        addImage
      );
      containers.series.append(card);
    });
  }

  function renderAbout() {
    containers.about.replaceChildren();
    containers.about.append(createElement("article", { className: "content-card" }, [
      createElement("div", { className: "field-grid single" }, [
        field("About 区标题", content.sections.about.title, (value) => { content.sections.about.title = value; }),
      ]),
    ]));

    content.aboutBlocks.forEach((block, index) => {
      const card = createElement("article", { className: "content-card" });
      const fields = createElement("div", { className: "field-grid" }, [
        field("序号与短句", block.eyebrow, (value) => { block.eyebrow = value; }),
        selectField("图片位置", block.imagePosition, [{ value: "right", label: "右侧" }, { value: "left", label: "左侧" }], (value) => { block.imagePosition = value; }),
        field("标题", block.title, (value) => { block.title = value; }, { full: true }),
        field("正文", block.body, (value) => { block.body = value; }, { full: true, multiline: true }),
        field("标签（用逗号分隔）", block.tags.join(", "), (value) => {
          block.tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
        }, { full: true }),
      ]);
      card.append(
        createElement("header", { className: "card-header" }, [
          createElement("span", { className: "card-label", text: `图文块 ${index + 1}` }),
          sortControls(content.aboutBlocks, index, "该图文块"),
        ]),
        fields,
        mediaField(
          block.image,
          block.image.alt,
          (value) => { block.image.alt = value; },
          (media) => { block.image.mediaId = media.id; block.image.url = media.url; },
          "图文块图片"
        )
      );
      containers.about.append(card);
    });
  }

  function render() {
    if (!content) return;
    renderHero();
    renderSlides();
    renderSeries();
    renderAbout();
    siteLink.href = `../${locale}/index.html`;
  }

  function validateClientContent() {
    if (!content.slides.length) throw new Error("至少保留一张轮播图。");
    if (content.slides.some((slide) => !slide.mediaId)) throw new Error("请为每张轮播图上传图片。");
    if (content.productSeries.some((series) => !series.images.length || series.images.some((image) => !image.mediaId))) {
      throw new Error("每个商品系列至少需要一张已上传图片。");
    }
    if (content.aboutBlocks.some((block) => !block.image?.mediaId)) throw new Error("请为每个 About 图文块上传图片。");
  }

  async function loadContent() {
    setStatus("正在读取内容...");
    try {
      const response = await fetch(`/api/admin/home?locale=${encodeURIComponent(locale)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "无法读取后台内容。");
      content = result;
      dirty = false;
      render();
      setStatus("内容已加载，可以开始编辑。", "success");
    } catch (error) {
      setStatus(error.message || "无法读取后台内容。", "error");
    }
  }

  async function saveContent() {
    if (!content || pendingUploads) return;
    try {
      validateClientContent();
      saveButton.disabled = true;
      setStatus("正在发布内容...");
      const response = await fetch(`/api/admin/home?locale=${encodeURIComponent(locale)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "发布失败。");
      content = result;
      dirty = false;
      render();
      setStatus("发布成功，前台刷新后即可看到最新内容。", "success");
      showToast("发布成功，前台刷新后即可看到最新内容。", "success");
    } catch (error) {
      setStatus(error.message || "发布失败。", "error");
      showToast(error.message || "发布失败。", "error");
    } finally {
      saveButton.disabled = pendingUploads > 0;
    }
  }

  localeSelect.addEventListener("change", () => {
    if (dirty && !window.confirm("切换语言会丢弃未发布的修改，是否继续？")) {
      localeSelect.value = locale;
      return;
    }
    locale = localeSelect.value;
    loadContent();
  });

  document.getElementById("add-slide").addEventListener("click", () => {
    content.slides.push({ id: newId("slide"), mediaId: "", url: "", alt: "" });
    setDirty();
    render();
  });

  document.getElementById("add-series").addEventListener("click", () => {
    content.productSeries.push({ id: newId("series"), title: "新商品系列", description: "", images: [] });
    setDirty();
    render();
  });

  document.getElementById("add-about").addEventListener("click", () => {
    content.aboutBlocks.push({
      id: newId("about"),
      eyebrow: "NEW / ABOUT",
      title: "新的图文块",
      body: "请输入图文块说明。",
      tags: [],
      imagePosition: "right",
      image: { mediaId: "", url: "", alt: "" },
    });
    setDirty();
    render();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveContent();
  });

  loadContent();
})();
