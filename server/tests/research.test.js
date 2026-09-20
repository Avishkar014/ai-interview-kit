import { jest } from "@jest/globals";

const axiosGet = jest.fn();
jest.unstable_mockModule("axios", () => ({ default: { get: axiosGet } }));
jest.unstable_mockModule("node:dns/promises", () => ({ default: { lookup: jest.fn(async () => [{ address: "93.184.216.34" }]) } }));

const { default: fetchPage } = await import("../src/services/research/fetchPage.js");
const { default: extractLinks } = await import("../src/services/research/extractLinks.js");
const { default: rankLinks } = await import("../src/services/research/rankLinks.js");

describe("research engine", () => {
  beforeEach(() => axiosGet.mockReset());

  test("blocks localhost and private targets", async () => {
    await expect(fetchPage("http://localhost/admin")).rejects.toThrow("Private or internal");
    await expect(fetchPage("http://127.0.0.1:5000")).rejects.toThrow("Private or non-public");
    await expect(fetchPage("http://10.0.0.1")).rejects.toThrow("Private or non-public");
  });

  test("rejects invalid URLs", async () => {
    await expect(fetchPage("ftp://example.com/file")).rejects.toThrow("Only public HTTP(S)");
    await expect(fetchPage("not a url")).rejects.toThrow("Invalid URL");
  });

  test("rejects non-HTML and oversized responses", async () => {
    axiosGet.mockResolvedValueOnce({ status: 200, headers: { "content-type": "application/json" }, data: "{}" });
    await expect(fetchPage("https://example.com/data")).rejects.toThrow("not HTML");
    axiosGet.mockResolvedValueOnce({ status: 200, headers: { "content-type": "text/html", "content-length": "3000000" }, data: "" });
    await expect(fetchPage("https://example.com/large")).rejects.toThrow("2MB");
  });

  test("validates every redirect target", async () => {
    axiosGet.mockResolvedValueOnce({ status: 302, headers: { location: "http://127.0.0.1/private" }, data: "" });
    await expect(fetchPage("https://example.com/start")).rejects.toThrow("Private or non-public");
  });

  test("resolves and deduplicates relative links", () => {
    const links = extractLinks('<a href="/jobs#open">Jobs</a><a href="https://example.com/jobs">Jobs again</a><a href="mailto:hi@example.com">Email</a>', "https://example.com/team");
    expect(links).toEqual([{ href: "https://example.com/jobs", text: "Jobs" }]);
  });

  test("ranks career and interview links above ordinary links", () => {
    const ranked = rankLinks([
      { href: "https://example.com/about", text: "About" },
      { href: "https://example.com/engineering/openings", text: "Join our engineering team" },
    ]);
    expect(ranked[0].href).toContain("openings");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});