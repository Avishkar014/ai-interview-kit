import { z } from "zod";

import checkCoverage from "../coverage/checkCoverage.js";
import { validateKit as validateSchema } from "./kit.schema.js";

export class KitValidationError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = "KitValidationError";
    this.code = "KIT_VALIDATION_ERROR";
    this.issues = issues;
  }
}

function fail(message, issues = []) {
  throw new KitValidationError(message, issues);
}

function validateGeneratedKit(kit) {
  const parsed = validateSchema(kit);
  if (!parsed.success) fail("Kit failed schema validation", parsed.error.issues);

  const validated = parsed.data;
  const requirements = validated.role.requirements;
  const questions = validated.questions;
  const requirementIds = new Set(requirements.map((requirement) => requirement.id));
  const questionIds = new Set(questions.map((question) => question.id));

  if (new Set(requirements.map((requirement) => requirement.id)).size !== requirements.length) fail("Requirement IDs must be unique");
  if (new Set(questions.map((question) => question.id)).size !== questions.length) fail("Question IDs must be unique");
  if (new Set(validated.flashcards.map((card) => card.id)).size !== validated.flashcards.length) fail("Flashcard IDs must be unique");
  if (requirements.some((requirement) => !/^r\d+$/.test(requirement.id))) fail("Requirement IDs must be stable r1, r2, ... IDs");
  if (questions.some((question) => !/^q\d+$/.test(question.id))) fail("Question IDs must be stable q1, q2, ... IDs");
  if (validated.flashcards.some((card) => !/^f\d+$/.test(card.id))) fail("Flashcard IDs must be stable f1, f2, ... IDs");
  if (validated.coverage.passes < 1 || validated.coverage.passes > 2) fail("Coverage passes must be 1 or 2");

  const expectedUncovered = checkCoverage(requirements, questions);
  if (JSON.stringify(expectedUncovered) !== JSON.stringify(validated.coverage.uncovered_requirement_ids)) fail("Coverage result does not match questions");
  if (validated.schedule.days.length !== validated.schedule.days_available) fail("Schedule day count does not match days_available");

  const dayNumbers = validated.schedule.days.map((day) => day.day);
  if (new Set(dayNumbers).size !== dayNumbers.length || dayNumbers.some((day) => day < 1 || day > validated.schedule.days_available)) fail("Schedule day numbers are invalid");
  if (validated.schedule.days.some((day) => !Number.isInteger(day.minutes) || day.minutes < 0)) fail("Schedule minutes must be non-negative integers");
  if (validated.questions.some((question) => question.difficulty < 1 || question.difficulty > 3)) fail("Question difficulty is invalid");
  if (validated.questions.some((question) => question.requirement_ids.some((id) => !requirementIds.has(id)))) fail("Question has a dangling requirement reference");
  if (validated.flashcards.some((card) => card.requirement_ids.some((id) => !requirementIds.has(id)))) fail("Flashcard has a dangling requirement reference");
  if (validated.schedule.days.some((day) => day.question_ids.some((id) => !questionIds.has(id)))) fail("Schedule has a dangling question reference");

  return validated;
}

export { validateGeneratedKit, z };
export default validateGeneratedKit;