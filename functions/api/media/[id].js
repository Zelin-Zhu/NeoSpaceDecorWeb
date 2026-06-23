export async function onRequestGet(context) {
  const assetId = context.params.id;

  if (!context.env.DB || !context.env.MEDIA) {
    return new Response("Media storage is not configured.", { status: 503 });
  }

  const asset = await context.env.DB.prepare(
    "SELECT storage_key AS storageKey, content_type AS contentType FROM media_assets WHERE id = ? AND deleted_at IS NULL"
  ).bind(assetId).first();

  if (!asset?.storageKey) {
    return new Response("Media asset not found.", { status: 404 });
  }

  const object = await context.env.MEDIA.get(asset.storageKey);

  if (!object) {
    return new Response("Media object not found.", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", asset.contentType || object.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
}
