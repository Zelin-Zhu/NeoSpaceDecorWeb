import { getHomeContent, getLocale, json } from "../_content.js";
import { requireAdmin } from "./_auth.js";

const MAX_ITEMS = 100;
const ID_PATTERN = /^[a-zA-Z0-9-]{1,100}$/;

function clientError(message) {
  return json({ error: message }, { status: 400 });
}

function requireString(value, label, maxLength = 4000) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new Error(`Invalid ${label}.`);
  }
  return value.trim();
}

function requireId(value, label) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    throw new Error(`Invalid ${label} identifier.`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) throw new Error(`Invalid ${label}.`);
  return value;
}

function removeMissing(db, table, column, ids) {
  if (!ids.length) return db.prepare(`DELETE FROM ${table}`);
  const markers = ids.map(() => "?").join(", ");
  return db.prepare(`DELETE FROM ${table} WHERE ${column} NOT IN (${markers})`).bind(...ids);
}

async function ensureMediaExists(db, mediaIds) {
  if (!mediaIds.length) return;
  const markers = mediaIds.map(() => "?").join(", ");
  const result = await db.prepare(
    `SELECT id FROM media_assets WHERE deleted_at IS NULL AND id IN (${markers})`
  ).bind(...mediaIds).all();
  if (result.results.length !== new Set(mediaIds).size) throw new Error("One or more selected images no longer exist.");
}

function normalizeContent(input) {
  if (!input || typeof input !== "object") throw new Error("Invalid content payload.");
  const hero = input.hero || {};
  const sections = input.sections || {};
  const slides = requireArray(input.slides, "slides").map((slide, index) => ({
    id: requireId(slide.id, "slide"),
    mediaId: requireId(slide.mediaId, "slide media"),
    alt: requireString(slide.alt, "slide alt text", 300),
    sortOrder: (index + 1) * 10,
  }));
  const productSeries = requireArray(input.productSeries, "product series").map((series, seriesIndex) => ({
    id: requireId(series.id, "series"),
    title: requireString(series.title, "series title", 200),
    description: typeof series.description === "string" ? series.description.slice(0, 1000) : "",
    sortOrder: (seriesIndex + 1) * 10,
    images: requireArray(series.images, "series images").map((image, imageIndex) => ({
      id: requireId(image.id, "series image"),
      mediaId: requireId(image.mediaId, "series image media"),
      alt: requireString(image.alt, "series image alt text", 300),
      sortOrder: (imageIndex + 1) * 10,
    })),
  }));
  const aboutBlocks = requireArray(input.aboutBlocks, "About blocks").map((block, index) => ({
    id: requireId(block.id, "About block"),
    mediaId: requireId(block.image?.mediaId, "About image media"),
    imagePosition: block.imagePosition === "left" ? "left" : "right",
    eyebrow: requireString(block.eyebrow, "About eyebrow", 200),
    title: requireString(block.title, "About title", 300),
    body: requireString(block.body, "About body", 4000),
    tags: requireArray(block.tags || [], "About tags").map((tag) => requireString(tag, "About tag", 80)),
    imageAlt: requireString(block.image?.alt, "About image alt text", 300),
    sortOrder: (index + 1) * 10,
  }));

  if (!slides.length) throw new Error("At least one carousel slide is required.");
  if (productSeries.some((series) => !series.images.length)) throw new Error("Each product series needs at least one image.");

  return {
    hero: {
      kicker: requireString(hero.kicker, "hero kicker", 200),
      title: requireString(hero.title, "hero title", 300),
      description: requireString(hero.description, "hero description", 1000),
      ctaLabel: requireString(hero.ctaLabel, "hero button label", 100),
    },
    sections: {
      products: {
        title: requireString(sections.products?.title, "products title", 200),
        subtitle: typeof sections.products?.subtitle === "string" ? sections.products.subtitle.slice(0, 1000) : "",
      },
      about: { title: requireString(sections.about?.title, "About title", 200) },
    },
    slides,
    productSeries,
    aboutBlocks,
  };
}

export async function onRequestGet(context) {
  const access = requireAdmin(context);
  if (access.response) return access.response;
  const locale = getLocale(context.request);
  if (!locale) return clientError("Unsupported locale.");
  if (!context.env.DB) return json({ error: "Content database is not configured." }, { status: 503 });

  try {
    return json(await getHomeContent(context.env.DB, locale, { includeMediaIds: true }), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unable to load admin content", error);
    return json({ error: "Unable to load content." }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  const access = requireAdmin(context);
  if (access.response) return access.response;
  const locale = getLocale(context.request);
  if (!locale) return clientError("Unsupported locale.");
  if (!context.env.DB) return json({ error: "Content database is not configured." }, { status: 503 });

  let content;
  try {
    content = normalizeContent(await context.request.json());
    const mediaIds = [
      ...content.slides.map((slide) => slide.mediaId),
      ...content.productSeries.flatMap((series) => series.images.map((image) => image.mediaId)),
      ...content.aboutBlocks.map((block) => block.mediaId),
    ];
    await ensureMediaExists(context.env.DB, mediaIds);
  } catch (error) {
    return clientError(error.message || "Invalid content payload.");
  }

  const slideIds = content.slides.map((slide) => slide.id);
  const seriesIds = content.productSeries.map((series) => series.id);
  const seriesImageIds = content.productSeries.flatMap((series) => series.images.map((image) => image.id));
  const aboutIds = content.aboutBlocks.map((block) => block.id);
  const statements = [
    removeMissing(context.env.DB, "home_slide_translations", "slide_id", slideIds),
    removeMissing(context.env.DB, "home_slides", "id", slideIds),
    removeMissing(context.env.DB, "product_series_image_translations", "series_image_id", seriesImageIds),
    removeMissing(context.env.DB, "product_series_images", "id", seriesImageIds),
    removeMissing(context.env.DB, "product_series_translations", "series_id", seriesIds),
    removeMissing(context.env.DB, "product_series", "id", seriesIds),
    removeMissing(context.env.DB, "about_block_translations", "block_id", aboutIds),
    removeMissing(context.env.DB, "about_blocks", "id", aboutIds),
    context.env.DB.prepare(
      `INSERT INTO home_hero_translations (locale, kicker, title, description, cta_label)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(locale) DO UPDATE SET kicker = excluded.kicker, title = excluded.title,
       description = excluded.description, cta_label = excluded.cta_label`
    ).bind(locale, content.hero.kicker, content.hero.title, content.hero.description, content.hero.ctaLabel),
    context.env.DB.prepare(
      `INSERT INTO home_section_translations (section_key, locale, title, subtitle)
       VALUES ('products', ?, ?, ?)
       ON CONFLICT(section_key, locale) DO UPDATE SET title = excluded.title, subtitle = excluded.subtitle`
    ).bind(locale, content.sections.products.title, content.sections.products.subtitle || null),
    context.env.DB.prepare(
      `INSERT INTO home_section_translations (section_key, locale, title, subtitle)
       VALUES ('about', ?, ?, NULL)
       ON CONFLICT(section_key, locale) DO UPDATE SET title = excluded.title`
    ).bind(locale, content.sections.about.title),
  ];

  content.slides.forEach((slide) => {
    statements.push(
      context.env.DB.prepare(
        `INSERT INTO home_slides (id, media_id, sort_order, status) VALUES (?, ?, ?, 'published')
         ON CONFLICT(id) DO UPDATE SET media_id = excluded.media_id, sort_order = excluded.sort_order, status = 'published'`
      ).bind(slide.id, slide.mediaId, slide.sortOrder),
      context.env.DB.prepare(
        `INSERT INTO home_slide_translations (slide_id, locale, alt_text) VALUES (?, ?, ?)
         ON CONFLICT(slide_id, locale) DO UPDATE SET alt_text = excluded.alt_text`
      ).bind(slide.id, locale, slide.alt)
    );
  });

  content.productSeries.forEach((series) => {
    statements.push(
      context.env.DB.prepare(
        `INSERT INTO product_series (id, sort_order, status) VALUES (?, ?, 'published')
         ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, status = 'published'`
      ).bind(series.id, series.sortOrder),
      context.env.DB.prepare(
        `INSERT INTO product_series_translations (series_id, locale, title, description) VALUES (?, ?, ?, ?)
         ON CONFLICT(series_id, locale) DO UPDATE SET title = excluded.title, description = excluded.description`
      ).bind(series.id, locale, series.title, series.description || null)
    );
    series.images.forEach((image) => {
      statements.push(
        context.env.DB.prepare(
          `INSERT INTO product_series_images (id, series_id, media_id, sort_order) VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET series_id = excluded.series_id, media_id = excluded.media_id, sort_order = excluded.sort_order`
        ).bind(image.id, series.id, image.mediaId, image.sortOrder),
        context.env.DB.prepare(
          `INSERT INTO product_series_image_translations (series_image_id, locale, alt_text) VALUES (?, ?, ?)
           ON CONFLICT(series_image_id, locale) DO UPDATE SET alt_text = excluded.alt_text`
        ).bind(image.id, locale, image.alt)
      );
    });
  });

  content.aboutBlocks.forEach((block) => {
    statements.push(
      context.env.DB.prepare(
        `INSERT INTO about_blocks (id, media_id, image_position, sort_order, status) VALUES (?, ?, ?, ?, 'published')
         ON CONFLICT(id) DO UPDATE SET media_id = excluded.media_id, image_position = excluded.image_position,
         sort_order = excluded.sort_order, status = 'published'`
      ).bind(block.id, block.mediaId, block.imagePosition, block.sortOrder),
      context.env.DB.prepare(
        `INSERT INTO about_block_translations (block_id, locale, eyebrow, title, body, tags_json, image_alt)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(block_id, locale) DO UPDATE SET eyebrow = excluded.eyebrow, title = excluded.title,
         body = excluded.body, tags_json = excluded.tags_json, image_alt = excluded.image_alt`
      ).bind(block.id, locale, block.eyebrow, block.title, block.body, JSON.stringify(block.tags), block.imageAlt)
    );
  });

  statements.push(
    context.env.DB.prepare(
      "INSERT INTO audit_logs (id, actor, action, details_json) VALUES (?, ?, 'publish_home_content', ?)"
    ).bind(`audit-${crypto.randomUUID()}`, access.actor, JSON.stringify({ locale, slides: slideIds.length, series: seriesIds.length, aboutBlocks: aboutIds.length }))
  );

  try {
    await context.env.DB.batch(statements);
    return json(await getHomeContent(context.env.DB, locale, { includeMediaIds: true }), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unable to save admin content", error);
    return json({ error: "Unable to publish content." }, { status: 500 });
  }
}
