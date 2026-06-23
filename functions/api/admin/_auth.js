import { json } from "../_content.js";

export function getAdminActor(context) {
  const accessEmail = context.request.headers.get("CF-Access-Authenticated-User-Email");
  if (accessEmail) return accessEmail;

  // Pages local development does not run through Cloudflare Access.
  const hostname = new URL(context.request.url).hostname;
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) return "local-development";

  return null;
}

export function requireAdmin(context) {
  const actor = getAdminActor(context);
  if (actor) return { actor };

  return {
    response: json(
      { error: "Administrator authentication is required." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    ),
  };
}
