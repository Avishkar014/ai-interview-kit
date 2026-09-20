import { z } from "zod";

const flashcardSchema = z.strictObject({
  id: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
  requirement_ids: z.array(z.string()),
});

function generateFlashcards(requirements, questions = []) {
  const requirementIds = new Set(requirements.map((requirement) => requirement.id));
  const cards = requirements.map((requirement, index) => {
    const relatedQuestion = questions.find((question) => question.requirement_ids?.includes(requirement.id));
    const card = {
      id: `f${index + 1}`,
      front: requirement.text,
      back: relatedQuestion?.answer_outline || `Prepare a concrete example demonstrating: ${requirement.text}`,
      requirement_ids: [requirement.id],
    };
    const parsed = flashcardSchema.safeParse(card);
    if (!parsed.success || parsed.data.requirement_ids.some((id) => !requirementIds.has(id))) {
      throw new Error("Generated flashcard failed validation");
    }
    return parsed.data;
  });
  return cards;
}

export { flashcardSchema, generateFlashcards };
export default generateFlashcards;