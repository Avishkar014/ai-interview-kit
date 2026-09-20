import validateGeneratedSemantics, { SemanticValidationError } from "../src/services/validation/semantic.js";

const requirements = [{ id: "r1", text: "Experience building REST APIs.", kind: "technical", priority: "must" }];

describe("generated content semantic validation", () => {
  test("rejects a question that copies requirement text", () => {
    expect(() => validateGeneratedSemantics(requirements, [{ id: "q1", requirement_ids: ["r1"], prompt: requirements[0].text, answer_outline: "Discuss resources and error handling." }], [])).toThrow(SemanticValidationError);
  });

  test("rejects flashcard content that copies requirement text", () => {
    expect(() => validateGeneratedSemantics(requirements, [], [{ id: "f1", requirement_ids: ["r1"], front: "What makes an API RESTful?", back: requirements[0].text }])).toThrow("back duplicates");
  });

  test("accepts useful question and flashcard content with valid IDs", () => {
    expect(validateGeneratedSemantics(requirements, [{ id: "q1", requirement_ids: ["r1"], prompt: "Design a REST API for a booking service.", answer_outline: "Cover resources, status codes, validation, and errors." }], [{ id: "f1", requirement_ids: ["r1"], front: "What should a REST API resource model include?", back: "Explain resources, representations, and HTTP semantics." }])).toBe(true);
  });

  test("rejects dangling requirement IDs", () => {
    expect(() => validateGeneratedSemantics(requirements, [{ id: "q1", requirement_ids: ["missing"], prompt: "Design an API.", answer_outline: "Discuss tradeoffs." }], [])).toThrow("unknown requirement");
  });
});