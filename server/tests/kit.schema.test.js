import { kitSchema, validateKit } from "../src/services/validation/kit.schema.js";

const validKit = {
  source: {
    company: "Northstar Labs",
    company_url: "https://northstar.example.com",
    role: "Senior Frontend Engineer",
    location: "Remote",
    jd_chars: 1200,
    researched_at: "2026-09-20T00:00:00.000Z",
    pages_used: ["https://northstar.example.com/careers"],
  },
  company_brief: {
    summary: "A product company.",
    what_they_do: "Build developer tools.",
    sources: ["https://northstar.example.com/about"],
  },
  role: {
    title: "Senior Frontend Engineer",
    seniority: "Senior",
    responsibilities: ["Build product experiences"],
    requirements: [{ id: "req-1", text: "JavaScript experience", kind: "technical", priority: "must" }],
  },
  questions: [{ id: "q-1", requirement_ids: ["req-1"], category: "technical", prompt: "Explain a frontend system.", answer_outline: "Use a concrete example.", difficulty: 2 }],
  flashcards: [{ id: "f-1", front: "What is event delegation?", back: "Handling events at a shared ancestor.", requirement_ids: ["req-1"] }],
  schedule: { days_available: 2, days: [{ day: 1, focus: "Frontend fundamentals", question_ids: ["q-1"], minutes: 30 }] },
  coverage: { uncovered_requirement_ids: [], passes: 1 },
};

describe("kit schema", () => {
  test("accepts a valid Appendix A structure", () => {
    expect(validateKit(validKit).success).toBe(true);
    expect(kitSchema.parse(validKit)).toEqual(validKit);
  });

  test("rejects invalid difficulty", () => {
    expect(validateKit({ ...validKit, questions: [{ ...validKit.questions[0], difficulty: 4 }] }).success).toBe(false);
  });

  test("rejects invalid question IDs in the schedule", () => {
    expect(validateKit({ ...validKit, schedule: { ...validKit.schedule, days: [{ ...validKit.schedule.days[0], question_ids: ["missing"] }] } }).success).toBe(false);
  });

  test("rejects invalid requirement IDs", () => {
    expect(validateKit({ ...validKit, questions: [{ ...validKit.questions[0], requirement_ids: ["missing"] }] }).success).toBe(false);
  });

  test("rejects duplicate IDs", () => {
    expect(validateKit({ ...validKit, questions: [validKit.questions[0], { ...validKit.questions[0] }] }).success).toBe(false);
  });
});