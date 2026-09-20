const positiveSignals = ["career", "job", "hiring", "interview", "engineering", "work-with-us", "join-us", "recruiting", "role", "openings"];
const negativeSignals = ["privacy", "terms", "cookie", "login", "legal", "press", "investor", "support"];

export default function rankLinks(links) {
  return links.map((link) => {
    const anchor = String(link.text || "").toLowerCase();
    const path = (() => { try { return new URL(link.href).pathname.toLowerCase(); } catch (_error) { return ""; } })();
    const haystack = `${anchor} ${path}`;
    const positiveScore = positiveSignals.reduce((score, signal) => score + (haystack.includes(signal) ? 2 : 0), 0);
    const negativeScore = negativeSignals.reduce((score, signal) => score + (haystack.includes(signal) ? 2 : 0), 0);
    return { ...link, score: positiveScore - negativeScore };
  }).sort((left, right) => right.score - left.score);
}