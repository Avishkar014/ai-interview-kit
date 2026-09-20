import generateCompanyBrief from "./generateCompanyBrief.js";
import generateFlashcards from "./flashcardGenerator.js";
import generateQuestions from "./generateQuestions.js";
import createSchedule from "../scheduling/createSchedule.js";
import validateGeneratedKit from "../validation/validateKit.js";

async function buildKit({
  source,
  company_brief,
  role,
  requirements,
  researchContext = {},
  interviewDiscussion = [],
  days_available = 1,
}) {
  const resolvedRequirements = requirements || role?.requirements;
  if (!source || !Array.isArray(resolvedRequirements)) throw new TypeError("source and role requirements are required");

  const resolvedRole = {
    title: role?.title || "",
    seniority: role?.seniority || "",
    responsibilities: role?.responsibilities || [],
    requirements: resolvedRequirements,
  };
  const resolvedBrief = company_brief || await generateCompanyBrief(resolvedRequirements, researchContext, interviewDiscussion);
  const generatedQuestions = await generateQuestions(resolvedRequirements);
  const flashcards = generateFlashcards(resolvedRequirements, generatedQuestions.questions);
  const schedule = createSchedule(generatedQuestions.questions, resolvedRequirements, days_available);

  return validateGeneratedKit({
    source,
    company_brief: resolvedBrief,
    role: resolvedRole,
    questions: generatedQuestions.questions,
    flashcards,
    schedule,
    coverage: generatedQuestions.coverage,
  });
}

export { buildKit };
export default buildKit;