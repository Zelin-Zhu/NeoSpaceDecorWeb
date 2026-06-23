(function () {
  const localeSelect = document.getElementById("locale-select");
  const uiLanguageSelect = document.getElementById("ui-language-select");
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

  const translations = {
    cn: {
      documentTitle: "Neospace 内容管理",
      sidebarCopy: "编辑首页内容并发布到网站。",
      contentSections: "内容分区",
      navHero: "首屏文案",
      navSlides: "首页轮播",
      navProducts: "商品系列",
      navAbout: "About 图文块",
      interfaceLanguage: "界面语言",
      contentLanguage: "编辑内容语言",
      viewSite: "查看前台",
      pageTitle: "首页内容管理",
      heroDescription: "编辑标题、简介和跳转按钮。",
      addSlide: "添加轮播图",
      addSeries: "添加商品系列",
      addAbout: "添加图文块",
      uploadHint: "图片支持 JPEG、PNG、WebP，单个文件最大 10 MB。",
      saveAndPublish: "发布首页内容",
      unsaved: "有未发布的修改。",
      confirmDelete: "确定删除{label}吗？",
      moveUp: "上移",
      moveDown: "下移",
      delete: "删除",
      uploading: "正在上传 {name}...",
      uploadFailed: "图片上传失败。",
      uploadSucceeded: "图片上传成功，发布后将在前台显示。",
      previewEmpty: "上传图片后显示预览",
      altText: "图片替代文本",
      heroKicker: "顶部短句",
      ctaLabel: "按钮文字",
      heroTitle: "主标题",
      description: "简介",
      slide: "轮播图 {number}",
      slideItem: "该轮播图",
      slideImage: "轮播图片",
      productSectionTitle: "产品区标题",
      productSectionDescription: "产品区简介",
      seriesName: "系列名称",
      seriesDescription: "系列说明",
      image: "图片 {number}",
      imageItem: "该图片",
      productImage: "商品图片",
      addImage: "添加图片",
      addProductImage: "添加商品图片",
      series: "系列 {number}",
      seriesItem: "该商品系列",
      aboutSectionTitle: "About 区标题",
      eyebrow: "序号与短句",
      imagePosition: "图片位置",
      imageRight: "右侧",
      imageLeft: "左侧",
      title: "标题",
      body: "正文",
      tags: "标签（用逗号分隔）",
      aboutBlock: "图文块 {number}",
      aboutBlockItem: "该图文块",
      aboutImage: "图文块图片",
      minimumSlide: "至少保留一张轮播图。",
      missingSlideImage: "请为每张轮播图上传图片。",
      missingProductImage: "每个商品系列至少需要一张已上传图片。",
      missingAboutImage: "请为每个 About 图文块上传图片。",
      loading: "正在读取内容...",
      loadFailed: "无法读取后台内容。",
      ready: "内容已加载，可以开始编辑。",
      publishing: "正在发布内容...",
      publishFailed: "发布失败。",
      published: "发布成功，前台刷新后即可看到最新内容。",
      discardChanges: "切换内容语言会丢弃未发布的修改，是否继续？",
      newSeries: "新商品系列",
      newAboutTitle: "新的图文块",
      newAboutBody: "请输入图文块说明。",
    },
    id: {
      documentTitle: "Manajemen Konten Neospace",
      sidebarCopy: "Edit konten beranda lalu publikasikan ke situs.",
      contentSections: "Bagian konten",
      navHero: "Teks hero",
      navSlides: "Carousel beranda",
      navProducts: "Seri produk",
      navAbout: "Blok gambar About",
      interfaceLanguage: "Bahasa antarmuka",
      contentLanguage: "Bahasa konten",
      viewSite: "Lihat situs",
      pageTitle: "Manajemen Konten Beranda",
      heroDescription: "Edit judul, deskripsi, dan tombol tautan.",
      addSlide: "Tambah slide",
      addSeries: "Tambah seri produk",
      addAbout: "Tambah blok gambar",
      uploadHint: "Mendukung JPEG, PNG, dan WebP. Ukuran maksimum 10 MB per file.",
      saveAndPublish: "Publikasikan konten beranda",
      unsaved: "Ada perubahan yang belum dipublikasikan.",
      confirmDelete: "Hapus {label}?",
      moveUp: "Naikkan",
      moveDown: "Turunkan",
      delete: "Hapus",
      uploading: "Mengunggah {name}...",
      uploadFailed: "Gagal mengunggah gambar.",
      uploadSucceeded: "Gambar berhasil diunggah dan akan muncul setelah dipublikasikan.",
      previewEmpty: "Pratinjau muncul setelah gambar diunggah",
      altText: "Teks alternatif gambar",
      heroKicker: "Teks singkat di atas",
      ctaLabel: "Teks tombol",
      heroTitle: "Judul utama",
      description: "Deskripsi",
      slide: "Slide {number}",
      slideItem: "slide ini",
      slideImage: "Gambar slide",
      productSectionTitle: "Judul bagian produk",
      productSectionDescription: "Deskripsi bagian produk",
      seriesName: "Nama seri",
      seriesDescription: "Deskripsi seri",
      image: "Gambar {number}",
      imageItem: "gambar ini",
      productImage: "Gambar produk",
      addImage: "Tambah gambar",
      addProductImage: "Tambah gambar produk",
      series: "Seri {number}",
      seriesItem: "seri produk ini",
      aboutSectionTitle: "Judul bagian About",
      eyebrow: "Nomor dan teks singkat",
      imagePosition: "Posisi gambar",
      imageRight: "Kanan",
      imageLeft: "Kiri",
      title: "Judul",
      body: "Isi teks",
      tags: "Tag (pisahkan dengan koma)",
      aboutBlock: "Blok gambar {number}",
      aboutBlockItem: "blok gambar ini",
      aboutImage: "Gambar blok",
      minimumSlide: "Sisakan setidaknya satu slide.",
      missingSlideImage: "Unggah gambar untuk setiap slide.",
      missingProductImage: "Setiap seri produk memerlukan setidaknya satu gambar yang sudah diunggah.",
      missingAboutImage: "Unggah gambar untuk setiap blok About.",
      loading: "Memuat konten...",
      loadFailed: "Konten admin tidak dapat dimuat.",
      ready: "Konten siap diedit.",
      publishing: "Menerbitkan konten...",
      publishFailed: "Gagal menerbitkan konten.",
      published: "Berhasil diterbitkan. Segarkan situs untuk melihat konten terbaru.",
      discardChanges: "Mengganti bahasa konten akan membuang perubahan yang belum dipublikasikan. Lanjutkan?",
      newSeries: "Seri produk baru",
      newAboutTitle: "Blok gambar baru",
      newAboutBody: "Masukkan deskripsi blok gambar.",
    },
  };

  let locale = "en";
  let uiLanguage = localStorage.getItem("neospace-admin-ui-language") === "id" ? "id" : "cn";
  let content = null;
  let pendingUploads = 0;
  let dirty = false;

  function t(key, variables = {}) {
    const value = translations[uiLanguage][key] || translations.cn[key] || key;
    return value.replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? "");
  }

  function applyInterfaceLanguage() {
    document.documentElement.lang = uiLanguage === "id" ? "id" : "zh-CN";
    document.title = t("documentTitle");
    uiLanguageSelect.value = uiLanguage;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    if (content) render();
  }

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
    if (!pendingUploads) setStatus(t("unsaved"), "");
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
    if (!window.confirm(t("confirmDelete", { label }))) return;
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
      controlButton("\u2191", t("moveUp"), () => moveItem(items, index, -1)),
      controlButton("\u2193", t("moveDown"), () => moveItem(items, index, 1)),
      controlButton(t("delete"), `${t("delete")}${label}`, () => removeItem(items, index, label), "button button-danger"),
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
    setStatus(t("uploading", { name: file.name }));
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t("uploadFailed"));
      assign(result);
      setDirty();
      render();
      showToast(t("uploadSucceeded"), "success");
    } catch (error) {
      setStatus(error.message || t("uploadFailed"), "error");
      showToast(error.message || t("uploadFailed"), "error");
    } finally {
      pendingUploads -= 1;
      saveButton.disabled = pendingUploads > 0;
      if (!pendingUploads && dirty) setStatus(t("unsaved"));
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
      preview.textContent = t("previewEmpty");
    }

    const fileInput = createElement("input", { type: "file", accept: "image/jpeg,image/png,image/webp" });
    fileInput.addEventListener("change", () => uploadImage(fileInput.files?.[0], setMedia));
    const upload = createElement("div", { className: "upload-control" }, [
      createElement("strong", { text: label }),
      fileInput,
      field(t("altText"), altValue, setAlt),
    ]);
    return createElement("div", { className: "media-field" }, [preview, upload]);
  }

  function renderHero() {
    const hero = content.hero;
    const grid = createElement("div", { className: "field-grid" }, [
      field(t("heroKicker"), hero.kicker, (value) => { hero.kicker = value; }),
      field(t("ctaLabel"), hero.ctaLabel, (value) => { hero.ctaLabel = value; }),
      field(t("heroTitle"), hero.title, (value) => { hero.title = value; }, { full: true }),
      field(t("description"), hero.description, (value) => { hero.description = value; }, { full: true, multiline: true }),
    ]);
    containers.hero.replaceChildren(grid);
  }

  function renderSlides() {
    containers.slides.replaceChildren();
    content.slides.forEach((slide, index) => {
      const card = createElement("article", { className: "content-card" });
      card.append(
        createElement("header", { className: "card-header" }, [
          createElement("span", { className: "card-label", text: t("slide", { number: index + 1 }) }),
          sortControls(content.slides, index, t("slideItem")),
        ]),
        mediaField(
          slide,
          slide.alt,
          (value) => { slide.alt = value; },
          (media) => { slide.mediaId = media.id; slide.url = media.url; },
          t("slideImage")
        )
      );
      containers.slides.append(card);
    });
  }

  function renderSeries() {
    containers.series.replaceChildren();
    const sectionCopy = createElement("article", { className: "content-card" }, [
      createElement("div", { className: "field-grid" }, [
        field(t("productSectionTitle"), content.sections.products.title, (value) => { content.sections.products.title = value; }),
        field(t("productSectionDescription"), content.sections.products.subtitle || "", (value) => { content.sections.products.subtitle = value; }),
      ]),
    ]);
    containers.series.append(sectionCopy);

    content.productSeries.forEach((series, seriesIndex) => {
      const card = createElement("article", { className: "content-card" });
      const fields = createElement("div", { className: "field-grid" }, [
        field(t("seriesName"), series.title, (value) => { series.title = value; }),
        field(t("seriesDescription"), series.description || "", (value) => { series.description = value; }),
      ]);
      const images = createElement("div", { className: "image-list" });
      series.images.forEach((item, imageIndex) => {
        const imageCard = createElement("div", { className: "image-item" });
        imageCard.append(
          createElement("div", { className: "card-header" }, [
            createElement("span", { className: "card-label", text: t("image", { number: imageIndex + 1 }) }),
            sortControls(series.images, imageIndex, t("imageItem")),
          ]),
          mediaField(
            item,
            item.alt,
            (value) => { item.alt = value; },
            (media) => { item.mediaId = media.id; item.url = media.url; },
            t("productImage")
          )
        );
        images.append(imageCard);
      });
      const addImage = controlButton(t("addImage"), t("addProductImage"), () => {
        series.images.push({ id: newId("series-image"), mediaId: "", url: "", alt: "" });
        setDirty();
        render();
      }, "button button-secondary");
      card.append(
        createElement("header", { className: "card-header" }, [
          createElement("span", { className: "card-label", text: t("series", { number: seriesIndex + 1 }) }),
          sortControls(content.productSeries, seriesIndex, t("seriesItem")),
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
        field(t("aboutSectionTitle"), content.sections.about.title, (value) => { content.sections.about.title = value; }),
      ]),
    ]));

    content.aboutBlocks.forEach((block, index) => {
      const card = createElement("article", { className: "content-card" });
      const fields = createElement("div", { className: "field-grid" }, [
        field(t("eyebrow"), block.eyebrow, (value) => { block.eyebrow = value; }),
        selectField(t("imagePosition"), block.imagePosition, [{ value: "right", label: t("imageRight") }, { value: "left", label: t("imageLeft") }], (value) => { block.imagePosition = value; }),
        field(t("title"), block.title, (value) => { block.title = value; }, { full: true }),
        field(t("body"), block.body, (value) => { block.body = value; }, { full: true, multiline: true }),
        field(t("tags"), block.tags.join(", "), (value) => {
          block.tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
        }, { full: true }),
      ]);
      card.append(
        createElement("header", { className: "card-header" }, [
          createElement("span", { className: "card-label", text: t("aboutBlock", { number: index + 1 }) }),
          sortControls(content.aboutBlocks, index, t("aboutBlockItem")),
        ]),
        fields,
        mediaField(
          block.image,
          block.image.alt,
          (value) => { block.image.alt = value; },
          (media) => { block.image.mediaId = media.id; block.image.url = media.url; },
          t("aboutImage")
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
    if (!content.slides.length) throw new Error(t("minimumSlide"));
    if (content.slides.some((slide) => !slide.mediaId)) throw new Error(t("missingSlideImage"));
    if (content.productSeries.some((series) => !series.images.length || series.images.some((image) => !image.mediaId))) {
      throw new Error(t("missingProductImage"));
    }
    if (content.aboutBlocks.some((block) => !block.image?.mediaId)) throw new Error(t("missingAboutImage"));
  }

  async function loadContent() {
    setStatus(t("loading"));
    try {
      const response = await fetch(`/api/admin/home?locale=${encodeURIComponent(locale)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t("loadFailed"));
      content = result;
      dirty = false;
      render();
      setStatus(t("ready"), "success");
    } catch (error) {
      setStatus(error.message || t("loadFailed"), "error");
    }
  }

  async function saveContent() {
    if (!content || pendingUploads) return;
    try {
      validateClientContent();
      saveButton.disabled = true;
      setStatus(t("publishing"));
      const response = await fetch(`/api/admin/home?locale=${encodeURIComponent(locale)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t("publishFailed"));
      content = result;
      dirty = false;
      render();
      setStatus(t("published"), "success");
      showToast(t("published"), "success");
    } catch (error) {
      setStatus(error.message || t("publishFailed"), "error");
      showToast(error.message || t("publishFailed"), "error");
    } finally {
      saveButton.disabled = pendingUploads > 0;
    }
  }

  localeSelect.addEventListener("change", () => {
    if (dirty && !window.confirm(t("discardChanges"))) {
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
    content.productSeries.push({ id: newId("series"), title: t("newSeries"), description: "", images: [] });
    setDirty();
    render();
  });

  document.getElementById("add-about").addEventListener("click", () => {
    content.aboutBlocks.push({
      id: newId("about"),
      eyebrow: "NEW / ABOUT",
      title: t("newAboutTitle"),
      body: t("newAboutBody"),
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

  uiLanguageSelect.addEventListener("change", () => {
    uiLanguage = uiLanguageSelect.value === "id" ? "id" : "cn";
    localStorage.setItem("neospace-admin-ui-language", uiLanguage);
    applyInterfaceLanguage();
    if (!pendingUploads) setStatus(dirty ? t("unsaved") : t("ready"), dirty ? "" : "success");
  });

  applyInterfaceLanguage();
  loadContent();
})();
