import { jest } from "@jest/globals";

const requestJson = jest.fn();
jest.unstable_mockModule("../src/services/llm.js", () => ({ LLMError: class LLMError extends Error {}, requestJson }));

const { default: generateQuestions } = await import("../src/services/generation/generateQuestions.js");
const { default: generateFlashcards } = await import("../src/services/generation/flashcardGenerator.js");
const { default: createSchedule } = await import("../src/services/scheduling/createSchedule.js");
const { default: validateGeneratedKit, KitValidationError } = await import("../src/services/validation/validateKit.js");

const requirements = [
  { id: "r1", text: "JavaScript", kind: "technical", priority: "must" },
  { id: "r2", text: "Communication", kind: "behavioural", priority: "nice" },
  { id: "r3", text: "Scalability", kind: "domain", priority: "must" },
];

const question = (id, requirementId, category = "technical", difficulty = 2) => ({ id, requirement_ids: [requirementId], category, prompt: `Question ${id}`, answer_outline: "Use evidence.", difficulty });

describe("generation pipeline", () => {
  beforeEach(() => requestJson.mockReset());

  test("generates four category calls separately and assigns stable IDs", async () => {
    requestJson.mockImplementation((system) => {
      if (system.includes("technical interview")) return [{ requirement_ids: ["r1"], category: "technical", prompt: "Technical", answer_outline: "Outline", difficulty: 1 }];
      if (system.includes("behavioural interview")) return [{ requirement_ids: ["r2"], category: "behavioural", prompt: "Behavioural", answer_outline: "Outline", difficulty: 2 }];
      if (system.includes("system-design interview")) return [{ requirement_ids: ["r3"], category: "system-design", prompt: "Design", answer_outline: "Outline", difficulty: 3 }];
      return [{ requirement_ids: ["r1"], category: "company-fit", prompt: "Fit", answer_outline: "Outline", difficulty: 1 }];
    });
    const result = await generateQuestions(requirements);
    expect(requestJson).toHaveBeenCalledTimes(4);
    expect(result.questions.map((item) => item.id)).toEqual(result.questions.map((_item, index) => `q${index + 1}`));
    expect(result.questions).toHaveLength(4);
    expect(result.questions.every((item) => item.requirement_ids.every((id) => ["r1", "r2", "r3"].includes(id)))).toBe(true);
  });

  test("runs one targeted second pass and closes a coverage gap", async () => {
    requestJson.mockImplementation((_system, _user) => {
      const callNumber = requestJson.mock.calls.length;
      if (callNumber === 1) return [{ requirement_ids: ["r1"], category: "technical", prompt: "T", answer_outline: "A", difficulty: 1 }];
      if (callNumber === 6) return [{ requirement_ids: ["r3"], category: "system-design", prompt: "D", answer_outline: "A", difficulty: 2 }];
      return [];
    });
    const result = await generateQuestions(requirements);
    expect(result.coverage).toEqual({ uncovered_requirement_ids: [], passes: 2 });
    expect(result.questions.map((item) => item.id)).toEqual(["q1", "q2"]);
    expect(requestJson).toHaveBeenCalledTimes(7);
  });

  test("creates stable flashcard IDs", () => {
    expect(generateFlashcards(requirements, [question("q1", "r1")]).map((card) => card.id)).toEqual(["f1", "f2", "f3"]);
  });

  test("coverage ignores nice requirements", async () => {
    requestJson.mockResolvedValue([]);
    const result = await generateQuestions(requirements);
    expect(result.coverage.uncovered_requirement_ids).toEqual(["r1", "r3"]);
    expect(result.coverage.passes).toBe(2);
  });

  test("creates exactly N days and maps difficulty to minutes", () => {
    const schedule = createSchedule([question("q1", "r1", "technical", 1), question("q2", "r3", "system-design", 3)], requirements, 4);
    expect(schedule.days).toHaveLength(4);
    expect(schedule.days.map((day) => day.day)).toEqual([1, 2, 3, 4]);
    expect(schedule.days[0].minutes).toBe(45);
    expect(schedule.days[1].minutes).toBe(20);
    expect(schedule.days.every((day) => day.question_ids.every((id) => ["q1", "q2"].includes(id)))).toBe(true);
  });

  test("rejects dangling references, incorrect coverage, and incorrect day count", () => {
    const base = {
      source: { company: "C", company_url: "https://example.com", role: "R", location: "Remote", jd_chars: 1, researched_at: "now", pages_used: [] },
      company_brief: { summary: "S", what_they_do: "W", sources: [] },
      role: { title: "R", seniority: "S", responsibilities: [], requirements: [requirements[0]] },
      questions: [question("q1", "r1")],
      flashcards: [{ id: "f1", front: "F", back: "B", requirement_ids: ["r1"] }],
      schedule: { days_available: 1, days: [{ day: 1, focus: "Review", question_ids: ["q1"], minutes: 30 }] },
      coverage: { uncovered_requirement_ids: [], passes: 1 },
    };
    expect(() => validateGeneratedKit({ ...base, questions: [question("q1", "missing")] })).toThrow(KitValidationError);
    expect(() => validateGeneratedKit({ ...base, coverage: { uncovered_requirement_ids: ["r1"], passes: 1 } })).toThrow("Coverage result");
    expect(() => validateGeneratedKit({ ...base, schedule: { ...base.schedule, days_available: 2 } })).toThrow("day count");
  });
});