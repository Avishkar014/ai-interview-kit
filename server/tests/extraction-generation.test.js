import { jest } from "@jest/globals";

const requestJson = jest.fn();
jest.unstable_mockModule("../src/services/llm.js", () => ({ LLMError: class LLMError extends Error {}, requestJson }));

const { default: extractRequirements } = await import("../src/services/extraction/extractRequirements.js");
const { default: generateCompanyBrief } = await import("../src/services/generation/generateCompanyBrief.js");

describe("extraction and company brief services", () => {
  beforeEach(() => requestJson.mockReset());

  test("assigns deterministic requirement IDs and preserves required versus nice priority", async () => {
    requestJson.mockResolvedValue({ title: "Engineer", seniority: "Senior", responsibilities: ["Build systems"], requirements: [
      { text: "Must know JavaScript", kind: "technical", priority: "must" },
      { text: "Preferred cloud experience", kind: "domain", priority: "nice" },
    ] });
    await expect(extractRequirements("Build systems with JavaScript.")).resolves.toMatchObject({ requirements: [
      { id: "r1", priority: "must" }, { id: "r2", priority: "nice" },
    ] });
  });

  test("limits company brief sources to URLs present in research", async () => {
    requestJson.mockResolvedValue({ summary: "A company.", what_they_do: "Build tools.", sources: ["https://example.com/about"] });
    await expect(generateCompanyBrief({}, { companyPages: [{ url: "https://example.com/about", title: "About", text: "Evidence" }] }, [])).resolves.toEqual({
      summary: "A company.", what_they_do: "Build tools.", sources: ["https://example.com/about"],
    });
  });

  test("rejects fabricated company brief sources", async () => {
    requestJson.mockResolvedValue({ summary: "A company.", what_they_do: "Unknown.", sources: ["https://fake.example.com"] });
    await expect(generateCompanyBrief({}, { companyPages: [{ url: "https://example.com/about", title: "About", text: "Evidence" }] }, [])).rejects.toThrow("source URL");
  });

  test("keeps provider failures safe and actionable", async () => {
    const { LLMError } = await import("../src/services/llm.js");
    requestJson.mockRejectedValue(new LLMError("Gemini provider authentication failed; check GEMINI_API_KEY"));
    await expect(extractRequirements("Build software.")).rejects.toThrow("check GEMINI_API_KEY");
  });
});