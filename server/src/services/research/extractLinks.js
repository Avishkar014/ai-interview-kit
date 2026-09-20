import * as cheerio from "cheerio";

export default function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const links = [];

  $("a[href]").each((_index, element) => {
    try {
      const parsed = new URL($(element).attr("href"), baseUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
      parsed.hash = "";
      const href = parsed.href;
      if (seen.has(href)) return;
      seen.add(href);
      links.push({ href, text: $(element).text().replace(/\s+/g, " ").trim() });
    } catch (_error) {
      // Ignore malformed links while preserving the rest of the page.
    }
  });

  return links;
}