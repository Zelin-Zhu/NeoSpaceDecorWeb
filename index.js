import { onRequestGet as getPublicHome } from "./functions/api/public/home.js";
import { onRequestGet as getAdminHome, onRequestPut as putAdminHome } from "./functions/api/admin/home.js";
import { onRequestPost as postAdminMedia } from "./functions/api/admin/media.js";
import { onRequestGet as getMedia } from "./functions/api/media/[id].js";
import { onRequest as redirectByLanguage } from "./functions/_middleware.js";

function routeContext(request, env, params = {}) {
  return { request, env, params };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/") {
      return redirectByLanguage({
        request,
        env,
        next: () => env.ASSETS.fetch(request),
      });
    }

    if (pathname === "/api/public/home" && request.method === "GET") {
      return getPublicHome(routeContext(request, env));
    }

    if (pathname === "/api/admin/home") {
      if (request.method === "GET") return getAdminHome(routeContext(request, env));
      if (request.method === "PUT") return putAdminHome(routeContext(request, env));
    }

    if (pathname === "/api/admin/media" && request.method === "POST") {
      return postAdminMedia(routeContext(request, env));
    }

    const mediaMatch = pathname.match(/^\/api\/media\/([^/]+)$/);
    if (mediaMatch && request.method === "GET") {
      return getMedia(routeContext(request, env, { id: decodeURIComponent(mediaMatch[1]) }));
    }

    if (pathname.startsWith("/api/")) {
      return new Response("API route not found.", { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
