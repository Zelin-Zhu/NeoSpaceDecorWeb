const STORAGE_KEY = "neospace-preferred-lang";

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const eq = item.indexOf("=");
      if (eq <= 0) return acc;
      const key = item.slice(0, eq);
      const value = item.slice(eq + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function resolveLanguage(countryCode) {
  if (countryCode === "CN") return "cn";
  if (countryCode === "ID") return "id";
  return "en";
}

function toLanguagePath(lang) {
  return `/${lang}/index.html`;
}

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname !== "/") {
    return context.next();
  }

  const cookies = parseCookies(context.request.headers.get("Cookie") || "");
  const preferred = cookies[STORAGE_KEY];

  if (["cn", "id", "en"].includes(preferred)) {
    return Response.redirect(new URL(toLanguagePath(preferred), url), 302);
  }

  const country = String(context.request.cf?.country || "").toUpperCase();
  const lang = resolveLanguage(country);

  return Response.redirect(new URL(toLanguagePath(lang), url), 302);
}
