import { z } from "zod";

import { LLMError, requestJson } from "../llm.js";
import validateGeneratedSemantics from "../validation/semantic.js";

const categorySchema = z.enum(["technical", "behavioural", "system-design", "company-fit"]);
const generatedQuestionSchema = z.strictObject({
  requirement_ids: z.array(z.string()),
  category: categorySchema,
  prompt: z.string().min(1),
  answer_outline: z.string().min(1),
  difficulty: z.number().int().min(1).max(3),
});
const responseSchema = z.union([
  z.array(generatedQuestionSchema),
  z.strictObject({ questions: z.array(generatedQuestionSchema) }),
]);

function normalizeRequirements(input) {
  const requirements = Array.isArray(input) ? input : input?.requirements;
  if (!Array.isArray(requirements)) throw new TypeError("Validated role requirements are required");
  return requirements;
}

function requirementsForCategory(requirements, category) {
  if (category === "behavioural") return requirements.filter((item) => item.kind === "behavioural");
  if (category === "technical" || category === "system-design") return requirements.filter((item) => item.kind === "technical" || item.kind === "domain");
  return requirements;
}

function promptFor(category) {
  return {
    technical: "Generate technical interview questions only. Focus on implementation, programming, and technical requirements.",
    behavioural: "Generate behavioural interview questions only. Focus on collaboration, communication, ownership, and behavioural requirements.",
    "system-design": "Generate system-design interview questions only. Focus on architecture, scalability, tradeoffs, and relevant technical or domain requirements.",
    "company-fit": "Generate company-fit interview questions only. Focus on motivation, company context, role alignment, and the supplied requirements.",
  }[category];
}

async function generateCategory(category, input, { idStart = 1 } = {}) {
  const requirements = normalizeRequirements(input);
  const categoryRequirements = requirementsForCategory(requirements, category);
  if (categoryRequirements.length === 0) return [];

  const allowedIds = new Set(requirements.map((item) => item.id));
  const result = await requestJson(
    `${promptFor(category)} Return only a JSON array or an object with a questions array. Every item must be an actual interview question or task in prompt, never copied requirement text. answer_outline must be guidance for answering that prompt, never copied requirement text. Every question must use only requirement IDs supplied by the user. Do not invent requirements or IDs. Each item must contain requirement_ids, category, prompt, answer_outline, and difficulty (integer 1-3).`,
    JSON.stringify({ category, requirements: categoryRequirements }),
  );
  const parsed = responseSchema.safeParse(result);
  if (!parsed.success) throw new LLMError(`LLM returned invalid ${category} questions`, parsed.error);

  const questions = Array.isArray(parsed.data) ? parsed.data : parsed.data.questions;
  if (questions.some((question) => question.category !== category)) throw new LLMError(`LLM returned a question in the wrong category for ${category}`);
  const validated = questions.map((question) => ({ ...question, category }));
  for (const question of validated) {
    if (question.requirement_ids.some((id) => !allowedIds.has(id))) throw new LLMError(`LLM returned an invalid requirement ID for ${category}`);
  }
  const identified = validated.map((question, index) => ({ id: `q${idStart + index}`, ...question }));
  try {
    validateGeneratedSemantics(requirements, identified, []);
  } catch (error) {
    throw new LLMError(error.message, error);
  }
  return identified;
}

export function generateTechnicalQuestions(requirements, options) {
  return generateCategory("technical", requirements, options);
}

export function generateBehaviouralQuestions(requirements, options) {
  return generateCategory("behavioural", requirements, options);
}

export function generateSystemDesignQuestions(requirements, options) {
  return generateCategory("system-design", requirements, options);
}

export function generateCompanyFitQuestions(requirements, options) {
  return generateCategory("company-fit", requirements, options);
}

export { generatedQuestionSchema, normalizeRequirements, requirementsForCategory };