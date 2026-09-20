import aggregateWeakSpots from "../src/services/practice/weakSpots.js";

const kit = {
  role: { requirements: [
    { id: "r1", text: "Node.js", kind: "technical" },
    { id: "r2", text: "AWS", kind: "domain" },
  ] },
  questions: [
    { id: "q1", category: "technical", requirement_ids: ["r1"] },
    { id: "q2", category: "system-design", requirement_ids: ["r2"] },
  ],
  flashcards: [
    { id: "f1", requirement_ids: ["r1"] },
    { id: "f2", requirement_ids: ["r2"] },
  ],
};

describe("weak spot aggregation", () => {
  test("calculates percentages and sorts weakest first", () => {
    const result = aggregateWeakSpots({ kit, practiceRecords: [{ flashcardId: "f1", confidence: 4 }, { flashcardId: "f2", confidence: 2 }] });
    expect(result.weakSpots[0]).toMatchObject({ name: "AWS", percentage: 40, averageConfidence: 2, reviewedCount: 1 });
    expect(result.weakSpots.find((spot) => spot.name === "Node.js")).toMatchObject({ percentage: 80 });
  });

  test("ignores unreviewed questions and chooses up to three focus areas", () => {
    const expandedKit = { ...kit, role: { requirements: [...kit.role.requirements, { id: "r3", text: "React", kind: "technical" }, { id: "r4", text: "Testing", kind: "technical" }] }, flashcards: [...kit.flashcards, { id: "f3", requirement_ids: ["r3"] }, { id: "f4", requirement_ids: ["r4"] }] };
    const result = aggregateWeakSpots({ kit: expandedKit, practiceRecords: [{ flashcardId: "f1", confidence: 3 }, { flashcardId: "f2", confidence: 1 }, { flashcardId: "f3", confidence: 2 }, { flashcardId: "f4", confidence: 1 }] });
    expect(result.weakSpots.some((spot) => spot.name === "Testing")).toBe(true);
    expect(result.weakSpots.some((spot) => spot.name === "Unreviewed")).toBe(false);
    expect(result.focusTomorrow).toHaveLength(3);
  });

  test("returns an empty state with no practice data", () => {
    expect(aggregateWeakSpots({ kit, practiceRecords: [] })).toEqual({ weakSpots: [], focusTomorrow: [] });
  });
});