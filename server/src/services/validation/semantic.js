export class SemanticValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SemanticValidationError";
    this.code = "SEMANTIC_VALIDATION_ERROR";
  }
}

function normalized(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export default function validateGeneratedSemantics(requirements, questions, flashcards) {
  const requirementMap = new Map(requirements.map((requirement) => [requirement.id, requirement]));

  for (const question of questions) {
    const referencedRequirements = question.requirement_ids.map((id) => requirementMap.get(id));
    if (referencedRequirements.some((requirement) => !requirement)) {
      throw new SemanticValidationError(`Question ${question.id} references an unknown requirement`);
    }
    if (referencedRequirements.some((requirement) => normalized(question.prompt) === normalized(requirement.text))) {
      throw new SemanticValidationError(`Question ${question.id} prompt duplicates requirement text`);
    }
    if (referencedRequirements.some((requirement) => normalized(question.answer_outline) === normalized(requirement.text))) {
      throw new SemanticValidationError(`Question ${question.id} answer outline duplicates requirement text`);
    }
  }

  for (const flashcard of flashcards) {
    const referencedRequirements = flashcard.requirement_ids.map((id) => requirementMap.get(id));
    if (referencedRequirements.some((requirement) => !requirement)) {
      throw new SemanticValidationError(`Flashcard ${flashcard.id} references an unknown requirement`);
    }
    if (referencedRequirements.some((requirement) => normalized(flashcard.front) === normalized(requirement.text))) {
      throw new SemanticValidationError(`Flashcard ${flashcard.id} front duplicates requirement text`);
    }
    if (referencedRequirements.some((requirement) => normalized(flashcard.back) === normalized(requirement.text))) {
      throw new SemanticValidationError(`Flashcard ${flashcard.id} back duplicates requirement text`);
    }
  }

  return true;
}

export { normalized };