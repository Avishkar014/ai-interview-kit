import axios from "axios";

import fetchPage from "./fetchPage.js";
import extractLinks from "./extractLinks.js";
import rankLinks from "./rankLinks.js";

export default async function searchInterviewDiscussion(company, role) {
  if (!company || !role) return [];
  try {
    const query = encodeURIComponent(`${company} ${role} interview experience`);
    const response = await axios.get(`https://www.google.com/search?q=${query}`, { timeout: 10_000, responseType: "text" });
    const candidates = rankLinks(extractLinks(response.data, "https://www.google.com")).slice(0, 5);
    const results = [];
    for (const candidate of candidates) {
      try {
        const page = await fetchPage(candidate.href);
        if (!results.some((result) => result.url === page.url)) results.push({ url: page.url, title: page.title, text: page.text });
      } catch (_error) {
        // Search results are best effort; one unavailable page must not fail the run.
      }
    }
    return results;
  } catch (_error) {
    return [];
  }
}