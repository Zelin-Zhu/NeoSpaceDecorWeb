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

export async function getHomeContent(db, locale, options = {}) {
  const includeMediaIds = options.includeMediaIds === true;
  const [hero, sectionsResult, slidesResult, seriesResult, seriesImagesResult, aboutResult] = await Promise.all([
    db.prepare(
      `SELECT COALESCE(current.kicker, fallback.kicker) AS kicker,
              COALESCE(current.title, fallback.title) AS title,
              COALESCE(current.description, fallback.description) AS description,
              COALESCE(current.cta_label, fallback.cta_label) AS ctaLabel
       FROM home_hero_translations fallback
       LEFT JOIN home_hero_translations current ON current.locale = ?
       WHERE fallback.locale = 'en'`
    ).bind(locale).first(),
    db.prepare(
      `SELECT fallback.section_key AS sectionKey, COALESCE(current.title, fallback.title) AS title,
              COALESCE(current.subtitle, fallback.subtitle) AS subtitle
       FROM home_section_translations fallback
       LEFT JOIN home_section_translations current ON current.section_key = fallback.section_key AND current.locale = ?
       WHERE fallback.locale = 'en'`
    ).bind(locale).all(),
    db.prepare(
      `SELECT hs.id, hs.sort_order AS sortOrder, ma.id AS media_id, ma.public_url,
              COALESCE(current.alt_text, fallback.alt_text, '') AS alt
       FROM home_slides hs
       JOIN media_assets ma ON ma.id = hs.media_id
       LEFT JOIN home_slide_translations current ON current.slide_id = hs.id AND current.locale = ?
       LEFT JOIN home_slide_translations fallback ON fallback.slide_id = hs.id AND fallback.locale = 'en'
       WHERE hs.status = 'published' AND ma.deleted_at IS NULL
       ORDER BY hs.sort_order, hs.id`
    ).bind(locale).all(),
    db.prepare(
      `SELECT ps.id, ps.sort_order AS sortOrder, COALESCE(current.title, fallback.title, '') AS title,
              COALESCE(current.description, fallback.description, '') AS description
       FROM product_series ps
       LEFT JOIN product_series_translations current ON current.series_id = ps.id AND current.locale = ?
       LEFT JOIN product_series_translations fallback ON fallback.series_id = ps.id AND fallback.locale = 'en'
       WHERE ps.status = 'published'
       ORDER BY ps.sort_order, ps.id`
    ).bind(locale).all(),
    db.prepare(
      `SELECT psi.id, psi.series_id AS seriesId, psi.sort_order AS sortOrder, ma.id AS media_id, ma.public_url,
              COALESCE(current.alt_text, fallback.alt_text, '') AS alt
       FROM product_series_images psi
       JOIN media_assets ma ON ma.id = psi.media_id
       LEFT JOIN product_series_image_translations current ON current.series_image_id = psi.id AND current.locale = ?
       LEFT JOIN product_series_image_translations fallback ON fallback.series_image_id = psi.id AND fallback.locale = 'en'
       WHERE ma.deleted_at IS NULL
       ORDER BY psi.series_id, psi.sort_order, psi.id`
    ).bind(locale).all(),
    db.prepare(
      `SELECT ab.id, ab.image_position AS imagePosition, ab.sort_order AS sortOrder, ma.id AS media_id, ma.public_url,
              COALESCE(current.eyebrow, fallback.eyebrow, '') AS eyebrow,
              COALESCE(current.title, fallback.title, '') AS title,
              COALESCE(current.body, fallback.body, '') AS body,
              COALESCE(current.tags_json, fallback.tags_json, '[]') AS tagsJson,
              COALESCE(current.image_alt, fallback.image_alt, '') AS imageAlt
       FROM about_blocks ab
       JOIN media_assets ma ON ma.id = ab.media_id
       LEFT JOIN about_block_translations current ON current.block_id = ab.id AND current.locale = ?
       LEFT JOIN about_block_translations fallback ON fallback.block_id = ab.id AND fallback.locale = 'en'
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
    images.push({
      id: image.id,
      ...(includeMediaIds ? { mediaId: image.media_id } : {}),
      url: mediaUrl(image),
      alt: image.alt,
      sortOrder: image.sortOrder,
    });
    imagesBySeries.set(image.seriesId, images);
  }

  return {
    locale,
    hero,
    sections,
    slides: slidesResult.results.map((slide) => ({
      id: slide.id,
      ...(includeMediaIds ? { mediaId: slide.media_id } : {}),
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
      image: {
        ...(includeMediaIds ? { mediaId: block.media_id } : {}),
        url: mediaUrl(block),
        alt: block.imageAlt,
      },
      sortOrder: block.sortOrder,
    })),
  };
}
