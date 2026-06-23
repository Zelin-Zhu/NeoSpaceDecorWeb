const SUPPORTED_LOCALES = new Set(["en", "cn", "id"]);

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

export function getLocale(request) {
  const locale = new URL(request.url).searchParams.get("locale") || "en";
  return SUPPORTED_LOCALES.has(locale) ? locale : null;
}

function mediaUrl(row) {
  return row.public_url || `/api/media/${encodeURIComponent(row.media_id)}`;
}

function parseTags(tagsJson) {
  try {
    const tags = JSON.parse(tagsJson);
    return Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export async function getHomeContent(db, locale) {
  const [hero, sectionsResult, slidesResult, seriesResult, seriesImagesResult, aboutResult] = await Promise.all([
    db.prepare(
      "SELECT kicker, title, description, cta_label AS ctaLabel FROM home_hero_translations WHERE locale = ?"
    ).bind(locale).first(),
    db.prepare(
      "SELECT section_key AS sectionKey, title, subtitle FROM home_section_translations WHERE locale = ?"
    ).bind(locale).all(),
    db.prepare(
      `SELECT hs.id, hs.sort_order AS sortOrder, ma.id AS media_id, ma.public_url, hst.alt_text AS alt
       FROM home_slides hs
       JOIN media_assets ma ON ma.id = hs.media_id
       JOIN home_slide_translations hst ON hst.slide_id = hs.id AND hst.locale = ?
       WHERE hs.status = 'published' AND ma.deleted_at IS NULL
       ORDER BY hs.sort_order, hs.id`
    ).bind(locale).all(),
    db.prepare(
      `SELECT ps.id, ps.sort_order AS sortOrder, pst.title, pst.description
       FROM product_series ps
       JOIN product_series_translations pst ON pst.series_id = ps.id AND pst.locale = ?
       WHERE ps.status = 'published'
       ORDER BY ps.sort_order, ps.id`
    ).bind(locale).all(),
    db.prepare(
      `SELECT psi.id, psi.series_id AS seriesId, psi.sort_order AS sortOrder, ma.id AS media_id, ma.public_url, psit.alt_text AS alt
       FROM product_series_images psi
       JOIN media_assets ma ON ma.id = psi.media_id
       JOIN product_series_image_translations psit ON psit.series_image_id = psi.id AND psit.locale = ?
       WHERE ma.deleted_at IS NULL
       ORDER BY psi.series_id, psi.sort_order, psi.id`
    ).bind(locale).all(),
    db.prepare(
      `SELECT ab.id, ab.image_position AS imagePosition, ab.sort_order AS sortOrder, ma.id AS media_id, ma.public_url,
              abt.eyebrow, abt.title, abt.body, abt.tags_json AS tagsJson, abt.image_alt AS imageAlt
       FROM about_blocks ab
       JOIN media_assets ma ON ma.id = ab.media_id
       JOIN about_block_translations abt ON abt.block_id = ab.id AND abt.locale = ?
       WHERE ab.status = 'published' AND ma.deleted_at IS NULL
       ORDER BY ab.sort_order, ab.id`
    ).bind(locale).all(),
  ]);

  const sections = Object.fromEntries(
    sectionsResult.results.map((section) => [section.sectionKey, { title: section.title, subtitle: section.subtitle }])
  );
  const imagesBySeries = new Map();

  for (const image of seriesImagesResult.results) {
    const images = imagesBySeries.get(image.seriesId) || [];
    images.push({ id: image.id, url: mediaUrl(image), alt: image.alt, sortOrder: image.sortOrder });
    imagesBySeries.set(image.seriesId, images);
  }

  return {
    locale,
    hero,
    sections,
    slides: slidesResult.results.map((slide) => ({
      id: slide.id,
      url: mediaUrl(slide),
      alt: slide.alt,
      sortOrder: slide.sortOrder,
    })),
    productSeries: seriesResult.results.map((series) => ({
      id: series.id,
      title: series.title,
      description: series.description,
      sortOrder: series.sortOrder,
      images: imagesBySeries.get(series.id) || [],
    })),
    aboutBlocks: aboutResult.results.map((block) => ({
      id: block.id,
      eyebrow: block.eyebrow,
      title: block.title,
      body: block.body,
      tags: parseTags(block.tagsJson),
      imagePosition: block.imagePosition,
      image: { url: mediaUrl(block), alt: block.imageAlt },
      sortOrder: block.sortOrder,
    })),
  };
}
