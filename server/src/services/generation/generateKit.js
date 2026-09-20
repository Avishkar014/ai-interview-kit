import crawlCompany from "../research/crawlCompany.js";
import searchInterviewDiscussion from "../research/searchInterviewDiscussion.js";
import extractRequirements from "../extraction/extractRequirements.js";
import generateCompanyBrief from "./generateCompanyBrief.js";
import generateQuestions from "./generateQuestions.js";
import generateFlashcards from "./flashcardGenerator.js";
import createSchedule from "../scheduling/createSchedule.js";
import checkCoverage from "../coverage/checkCoverage.js";
import validateGeneratedKit from "../validation/validateKit.js";

const stageMessages = {
  extracting_requirements: "Extracting role requirements",
  researching_company: "Researching company information",
  generating_brief: "Generating company brief",
  generating_questions: "Generating interview questions",
  checking_coverage: "Checking requirement coverage",
  generating_flashcards: "Generating flashcards",
  building_schedule: "Building preparation schedule",
  validating: "Validating interview kit",
  completed: "Interview kit ready",
  failed: "Kit generation failed",
};

function emit(progressCallback, stage, progress) {
  if (typeof progressCallback === "function") {
    progressCallback({ stage, progress, message: stageMessages[stage] });
  }
}

export default async function generateKit(input, progressCallback) {
  let stage = "extracting_requirements";
  try {
    emit(progressCallback, stage, 5);
    const role = await extractRequirements(input.jd);

    stage = "researching_company";
    emit(progressCallback, stage, 15);
    const companyResearch = await crawlCompany(input.company_url);
    const discussion = await searchInterviewDiscussion(input.company || input.company_name || "", role.title);
    const research = { ...companyResearch, interviewDiscussion: discussion };

    stage = "generating_brief";
    emit(progressCallback, stage, 28);
    const companyBrief = await generateCompanyBrief(role, research, discussion);

    stage = "generating_questions";
    emit(progressCallback, stage, 40);
    const generated = await generateQuestions(role.requirements);

    stage = "checking_coverage";
    emit(progressCallback, stage, 60);
    const uncovered = checkCoverage(role.requirements, generated.questions);
    const coverage = { ...generated.coverage, uncovered_requirement_ids: uncovered };

    stage = "generating_flashcards";
    emit(progressCallback, stage, 70);
    const flashcards = generateFlashcards(role.requirements, generated.questions);

    stage = "building_schedule";
    emit(progressCallback, stage, 82);
    const schedule = createSchedule(generated.questions, role.requirements, input.days);

    stage = "validating";
    emit(progressCallback, stage, 92);
    const completeKit = {
      source: {
        company: input.company || "",
        company_url: input.company_url,
        role: role.title,
        location: input.location,
        jd_chars: input.jd.length,
        researched_at: new Date().toISOString(),
        pages_used: [...companyResearch.companyPages, ...companyResearch.hiringPages].map((page) => page.url),
      },
      company_brief: companyBrief,
      role,
      questions: generated.questions,
      flashcards,
      schedule,
      coverage,
    };
    const validatedKit = validateGeneratedKit(completeKit);
    emit(progressCallback, "completed", 100);
    return validatedKit;
  } catch (error) {
    emit(progressCallback, "failed", 100);
    const safeError = error?.code === "LLM_ERROR" ? error.message : "Kit generation could not be completed";
    const failure = new Error(`${safeError} (stage: ${stage})`);
    failure.code = "KIT_GENERATION_ERROR";
    failure.stage = stage;
    throw failure;
  }
}

export { stageMessages };