import { evaluateCases } from "../../scripts/evaluate.js";

describe("batch evaluation", () => {
  test("continues after a failed case and preserves report shape", async () => {
    const report = await evaluateCases([{ jobTitle: "Good" }, { jobTitle: "Bad" }], async (input) => {
      if (input.role === "Bad") throw Object.assign(new Error("bad case"), { code: "CASE_FAILED" });
      return { marker: input.role };
    }, (kit) => kit);
    expect(report.kits).toEqual([
      { id: "case-01", status: "ok", kit: { marker: "Good" }, error: null },
      { id: "case-02", status: "failed", kit: null, error: { code: "CASE_FAILED", message: "bad case" } },
    ]);
  });
});