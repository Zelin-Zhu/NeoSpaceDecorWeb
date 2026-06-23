import { json } from "../_content.js";
import { requireAdmin } from "./_auth.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function onRequestPost(context) {
  const access = requireAdmin(context);
  if (access.response) return access.response;

  if (!context.env.DB || !context.env.MEDIA) {
    return json({ error: "Media storage is not configured." }, { status: 503 });
  }

  const formData = await context.request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string" || !EXTENSIONS[file.type]) {
    return json({ error: "Upload a JPEG, PNG, or WebP image." }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return json({ error: "Images must be between 1 byte and 10 MB." }, { status: 400 });
  }

  const id = `media-${crypto.randomUUID()}`;
  const storageKey = `uploads/${id}.${EXTENSIONS[file.type]}`;

  try {
    await context.env.MEDIA.put(storageKey, file, {
      httpMetadata: { contentType: file.type },
    });
    await context.env.DB.prepare(
      "INSERT INTO media_assets (id, storage_key, content_type, size_bytes) VALUES (?, ?, ?, ?)"
    ).bind(id, storageKey, file.type, file.size).run();

    return json(
      { id, url: `/api/media/${encodeURIComponent(id)}`, contentType: file.type, sizeBytes: file.size },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unable to store media asset", error);
    await context.env.MEDIA.delete(storageKey).catch(() => undefined);
    return json({ error: "Unable to store the image." }, { status: 500 });
  }
}
