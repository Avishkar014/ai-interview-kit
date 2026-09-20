import dns from "node:dns/promises";
import net from "node:net";

import axios from "axios";
import * as cheerio from "cheerio";

const MAX_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const blockedHostnames = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [first, second] = address.split(".").map(Number);
    return first === 10 || first === 127 || first === 0 || (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168) ||
      (first === 100 && second >= 64 && second <= 127) || (first === 192 && second === 0) ||
      (first === 192 && second === 2) ||
      (first === 198 && second >= 18 && second <= 19) || (first === 198 && second === 51) ||
      (first === 203 && second === 0) || first >= 224;
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") ||
      normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") ||
      normalized.startsWith("fea") || normalized.startsWith("feb");
  }

  return true;
}

export async function assertPublicHttpUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch (_error) {
    throw new Error("Invalid URL");
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error("Only public HTTP(S) URLs are allowed");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (blockedHostnames.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    throw new Error("Private or internal host is not allowed");
  }

  const addresses = net.isIP(hostname) ? [hostname] : (await dns.lookup(hostname, { all: true })).map((entry) => entry.address);
  if (!addresses.length || addresses.some(isPrivateAddress)) {
    throw new Error("Private or non-public target is not allowed");
  }

  return parsed;
}

function responseBodyIsTooLarge(response) {
  const contentLength = Number(response.headers["content-length"] || 0);
  return contentLength > MAX_BYTES || Buffer.byteLength(String(response.data || ""), "utf8") > MAX_BYTES;
}

export default async function fetchPage(url) {
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const parsedUrl = await assertPublicHttpUrl(currentUrl);
    let response;
    try {
      response = await axios.get(parsedUrl.href, {
        timeout: REQUEST_TIMEOUT_MS,
        maxRedirects: 0,
        responseType: "text",
        validateStatus: () => true,
        headers: { Accept: "text/html,application/xhtml+xml" },
      });
    } catch (error) {
      throw new Error(`Page request failed: ${error.message}`);
    }

    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      if (redirectCount === MAX_REDIRECTS) throw new Error("Too many redirects");
      currentUrl = new URL(response.headers.location, parsedUrl).href;
      continue;
    }

    if (response.status < 200 || response.status >= 300) throw new Error(`Page request returned HTTP ${response.status}`);
    if (!String(response.headers["content-type"] || "").toLowerCase().includes("text/html")) throw new Error("Page is not HTML");
    if (responseBodyIsTooLarge(response)) throw new Error("Page exceeds the 2MB size limit");

    const $ = cheerio.load(String(response.data));
    $("script, style, nav, footer, noscript, header, aside").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    const links = [];
    const seenLinks = new Set();
    $("a[href]").each((_index, element) => {
      try {
        const linkUrl = new URL($(element).attr("href"), parsedUrl);
        if (!["http:", "https:"].includes(linkUrl.protocol)) return;
        linkUrl.hash = "";
        if (seenLinks.has(linkUrl.href)) return;
        seenLinks.add(linkUrl.href);
        links.push({ href: linkUrl.href, text: $(element).text().replace(/\s+/g, " ").trim() });
      } catch (_error) {
        // Ignore malformed links while preserving the page.
      }
    });

    return { url: parsedUrl.href, title: $("title").text().replace(/\s+/g, " ").trim(), text, links };
  }

  throw new Error("Unable to fetch page");
}

export { MAX_BYTES };