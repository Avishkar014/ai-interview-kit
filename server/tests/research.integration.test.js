import { jest } from "@jest/globals";

const fetchPage = jest.fn();
jest.unstable_mockModule("../src/services/research/fetchPage.js", () => ({ default: fetchPage }));

const { default: crawlCompany } = await import("../src/services/research/crawlCompany.js");
const { default: searchInterviewDiscussion } = await import("../src/services/research/searchInterviewDiscussion.js");

describe("research orchestration", () => {
  beforeEach(() => fetchPage.mockReset());

  test("crawls discovered links without relying on a hard-coded careers path", async () => {
    fetchPage.mockImplementation(async (url) => {
      if (url === "https://example.com") return { url, title: "Northstar", text: "Company", links: [{ href: "https://example.com/opportunities", text: "Work with us" }] };
      return { url, title: "Open roles", text: "Hiring opportunities and engineering roles", links: [] };
    });
    const result = await crawlCompany("https://example.com");
    expect(result.hiringPages[0].url).toBe("https://example.com/opportunities");
    expect(fetchPage).toHaveBeenCalledWith("https://example.com/opportunities");
  });

  test("records failed pages without failing the crawl", async () => {
    fetchPage.mockImplementation(async (url) => {
      if (url === "https://example.com") return { url, title: "Home", text: "Company", links: [{ href: "https://example.com/jobs", text: "Jobs" }] };
      throw new Error("timeout");
    });
    const result = await crawlCompany("https://example.com");
    expect(result.failures).toEqual([{ url: "https://example.com/jobs", error: "timeout" }]);
  });

  test("allows public discussion search to return no results", async () => {
    expect(await searchInterviewDiscussion()).toEqual([]);
  });
});