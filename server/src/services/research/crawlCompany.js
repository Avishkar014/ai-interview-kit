import fetchPage from "./fetchPage.js";
import rankLinks from "./rankLinks.js";

const MAX_CANDIDATES = 5;

function isHiringPage(page) {
  const text = `${page.title} ${page.url} ${page.text}`.toLowerCase();
  return /career|job|hiring|interview|engineering|work with us|join us|recruit/.test(text);
}

function addPage(collection, page) {
  if (!collection.some((entry) => entry.url === page.url)) collection.push({ url: page.url, title: page.title, text: page.text });
}

export default async function crawlCompany(companyUrl) {
  const research = { companyPages: [], hiringPages: [], interviewDiscussion: [], failures: [] };
  let homepage;
  try {
    homepage = await fetchPage(companyUrl);
    addPage(research.companyPages, homepage);
  } catch (error) {
    research.failures.push({ url: companyUrl, error: error.message });
    return research;
  }

  const discoveredLinks = rankLinks(homepage.links || []).slice(0, MAX_CANDIDATES);
  for (const link of discoveredLinks) {
    try {
      const page = await fetchPage(link.href);
      if (isHiringPage(page)) addPage(research.hiringPages, page);
      else addPage(research.companyPages, page);
    } catch (error) {
      research.failures.push({ url: link.href, error: error.message });
    }
  }

  return research;
}