import checkCoverage from "../coverage/checkCoverage.js";
import {
  generateBehaviouralQuestions,
  generateCompanyFitQuestions,
  generateSystemDesignQuestions,
  generateTechnicalQuestions,
} from "./questionGenerator.js";

const generators = [
  generateTechnicalQuestions,
  generateBehaviouralQuestions,
  generateSystemDesignQuestions,
  generateCompanyFitQuestions,
];

function renumber(questions, start = 1) {
  return questions.map((question, index) => ({ ...question, id: `q${start + index}` }));
}

async function generatePass(requirements, options) {
  const results = await Promise.all(generators.map((generator) => generator(requirements, options)));
  return results.flat();
}

export default async function generateQuestions(requirements) {
  let questions = renumber(await generatePass(requirements));
  let uncoveredRequirementIds = checkCoverage(requirements, questions);
  let passes = 1;

  if (uncoveredRequirementIds.length > 0) {
    const targetedRequirements = requirements.filter((requirement) => uncoveredRequirementIds.includes(requirement.id));
    const targetedQuestions = await generatePass(targetedRequirements);
    questions = [...questions, ...renumber(targetedQuestions, questions.length + 1)];
    uncoveredRequirementIds = checkCoverage(requirements, questions);
    passes = 2;
  }

  return { questions, coverage: { uncovered_requirement_ids: uncoveredRequirementIds, passes } };
}

export { generatePass, renumber };