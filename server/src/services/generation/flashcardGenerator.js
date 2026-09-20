import { z } from "zod";
import validateGeneratedSemantics from "../validation/semantic.js";

const flashcardSchema = z.strictObject({
  id: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
  requirement_ids: z.array(z.string()),
});

function generateFlashcards(requirements, questions = []) {
  const cards = requirements.map((requirement, index) => {
    const relatedQuestion = questions.find((question) => question.requirement_ids?.includes(requirement.id));
    if (!relatedQuestion) throw new Error(`No validated question is available for requirement ${requirement.id}`);
    const card = {
      id: `f${index + 1}`,
      front: relatedQuestion.prompt,
      back: relatedQuestion.answer_outline,
      requirement_ids: [requirement.id],
    };
    const parsed = flashcardSchema.safeParse(card);
    if (!parsed.success) {
      throw new Error("Generated flashcard failed validation");
    }
    return parsed.data;
  });
  validateGeneratedSemantics(requirements, questions, cards);
  return cards;
}

export { flashcardSchema, generateFlashcards };
export default generateFlashcards;