import { getHomeContent, getLocale, json } from "../_content.js";

export async function onRequestGet(context) {
  const locale = getLocale(context.request);

  if (!locale) {
    return json({ error: "Unsupported locale." }, { status: 400 });
  }

  if (!context.env.DB) {
    return json({ error: "Content database is not configured." }, { status: 503 });
  }

  try {
    const content = await getHomeContent(context.env.DB, locale);
    return json(content, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load public home content", error);
    return json({ error: "Unable to load content." }, { status: 500 });
  }
}
